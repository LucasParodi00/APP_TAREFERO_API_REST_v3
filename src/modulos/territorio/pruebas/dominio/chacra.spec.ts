import { Chacra } from '../../dominio/agregados/chacra';
import {
    NombreChacra,
    NombreCortoChacra,
    DireccionChacra,
    PuntoGeograficoReferencia,
    ResponsableChacra,
} from '../../dominio/objetos-valor';
import { EstadoChacra } from '../../dominio/enumeraciones';
import { ErrorTransicionChacraInvalida } from '../../dominio/errores';

describe('T02 — Dominio: Agregado Chacra y ciclo de vida', () => {
    const id = '018f6f5d-7a6b-7345-9123-456789abcdef';
    const empresaId = '018f6f5d-7a6b-7345-9123-000000000001';
    const actorId = '018f6f5d-7a6b-7345-9123-actor000001';
    const fecha = new Date('2026-11-13T10:00:00.000Z');

    const nombre = NombreChacra.crear('Chacra Las Marias');
    const nombreCorto = NombreCortoChacra.crear('LAS-MARIAS');
    const direccion = DireccionChacra.crear('Ruta 105 Km 12');
    const punto = PuntoGeograficoReferencia.crear(-27.5, -55.8);
    const responsable = ResponsableChacra.crear('Carlos Gomez');

    describe('TER-BR-005 — Registro de Chacra', () => {
        it('debe crearse en estado ACTIVA y versión inicial 1', () => {
            const chacra = Chacra.registrar({
                id,
                empresaId,
                nombre,
                nombreCorto,
                responsableNombre: responsable,
                direccion,
                puntoGeograficoReferencia: punto,
                creadoEn: fecha,
                creadoPor: actorId,
            });

            expect(chacra.id).toBe(id);
            expect(chacra.empresaId).toBe(empresaId);
            expect(chacra.nombre.valor).toBe('Chacra Las Marias');
            expect(chacra.nombreCorto.valor).toBe('LAS-MARIAS');
            expect(chacra.responsableNombre?.valor).toBe('Carlos Gomez');
            expect(chacra.direccion?.valor).toBe('Ruta 105 Km 12');
            expect(chacra.puntoGeograficoReferencia?.latitud).toBe(-27.5);
            expect(chacra.estado).toBe(EstadoChacra.ACTIVA);
            expect(chacra.version).toBe(1);
            expect(chacra.creadoEn).toEqual(fecha);
            expect(chacra.creadoPor).toBe(actorId);
            expect(chacra.actualizadoEn).toEqual(fecha);
            expect(chacra.actualizadoPor).toBe(actorId);
        });

        it('debe registrarse sin ubicación de referencia ni responsable opcionales', () => {
            const chacra = Chacra.registrar({
                id,
                empresaId,
                nombre,
                nombreCorto,
                responsableNombre: null,
                direccion: null,
                puntoGeograficoReferencia: null,
                creadoEn: fecha,
                creadoPor: actorId,
            });

            expect(chacra.direccion).toBeNull();
            expect(chacra.puntoGeograficoReferencia).toBeNull();
            expect(chacra.responsableNombre).toBeNull();
        });
    });

    describe('TER-BR-008 — Modificación descriptiva', () => {
        it('debe actualizar datos, incrementar versión y actualizar auditoría en Chacra ACTIVA', () => {
            const chacra = Chacra.registrar({
                id,
                empresaId,
                nombre,
                nombreCorto,
                responsableNombre: null,
                direccion: null,
                puntoGeograficoReferencia: null,
                creadoEn: fecha,
                creadoPor: actorId,
            });

            const nuevaFecha = new Date('2026-11-13T11:00:00.000Z');
            const nuevoActor = '018f6f5d-7a6b-7345-9123-actor000002';
            const nuevoNombre = NombreChacra.crear('Chacra Nueva');
            const nuevoCorto = NombreCortoChacra.crear('NUEVA');

            chacra.modificarDescriptivos({
                nombre: nuevoNombre,
                nombreCorto: nuevoCorto,
                responsableNombre: responsable,
                direccion,
                puntoGeograficoReferencia: punto,
                actualizadoEn: nuevaFecha,
                actualizadoPor: nuevoActor,
            });

            expect(chacra.nombre.valor).toBe('Chacra Nueva');
            expect(chacra.nombreCorto.valor).toBe('NUEVA');
            expect(chacra.responsableNombre?.valor).toBe('Carlos Gomez');
            expect(chacra.direccion?.valor).toBe('Ruta 105 Km 12');
            expect(chacra.version).toBe(2);
            expect(chacra.actualizadoEn).toEqual(nuevaFecha);
            expect(chacra.actualizadoPor).toBe(nuevoActor);
            expect(chacra.estado).toBe(EstadoChacra.ACTIVA);
        });

        it('debe permitir modificar datos descriptivos sobre una Chacra INACTIVA conservando su estado', () => {
            const chacra = Chacra.registrar({
                id,
                empresaId,
                nombre,
                nombreCorto,
                responsableNombre: null,
                direccion: null,
                puntoGeograficoReferencia: null,
                creadoEn: fecha,
                creadoPor: actorId,
            });

            chacra.inactivar(new Date('2026-11-13T10:30:00.000Z'), actorId);
            expect(chacra.estado).toBe(EstadoChacra.INACTIVA);
            expect(chacra.version).toBe(2);

            const nuevaFecha = new Date('2026-11-13T11:00:00.000Z');
            chacra.modificarDescriptivos({
                nombre: NombreChacra.crear('Chacra Inactiva Modificada'),
                nombreCorto,
                responsableNombre: null,
                direccion: null,
                puntoGeograficoReferencia: null,
                actualizadoEn: nuevaFecha,
                actualizadoPor: actorId,
            });

            expect(chacra.nombre.valor).toBe('Chacra Inactiva Modificada');
            expect(chacra.estado).toBe(EstadoChacra.INACTIVA);
            expect(chacra.version).toBe(3);
        });
    });

    describe('TER-BR-005 y TER-BR-006 — Inactivación y transiciones de estado', () => {
        it('debe transicionar de ACTIVA a INACTIVA incrementando versión y auditoría', () => {
            const chacra = Chacra.registrar({
                id,
                empresaId,
                nombre,
                nombreCorto,
                responsableNombre: null,
                direccion: null,
                puntoGeograficoReferencia: null,
                creadoEn: fecha,
                creadoPor: actorId,
            });

            const fechaInactivacion = new Date('2026-11-13T10:45:00.000Z');
            const actorInactivador = '018f6f5d-7a6b-7345-9123-actor000003';
            chacra.inactivar(fechaInactivacion, actorInactivador);

            expect(chacra.estado).toBe(EstadoChacra.INACTIVA);
            expect(chacra.version).toBe(2);
            expect(chacra.actualizadoEn).toEqual(fechaInactivacion);
            expect(chacra.actualizadoPor).toBe(actorInactivador);
        });

        it('debe rechazar inactivar una Chacra que ya está INACTIVA', () => {
            const chacra = Chacra.registrar({
                id,
                empresaId,
                nombre,
                nombreCorto,
                responsableNombre: null,
                direccion: null,
                puntoGeograficoReferencia: null,
                creadoEn: fecha,
                creadoPor: actorId,
            });

            chacra.inactivar(fecha, actorId);
            expect(() => chacra.inactivar(new Date(), actorId)).toThrow(ErrorTransicionChacraInvalida);
        });
    });
});
