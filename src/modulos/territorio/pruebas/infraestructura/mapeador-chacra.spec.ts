import { Chacra } from '../../dominio/agregados';
import {
    NombreChacra,
    NombreCortoChacra,
    DireccionChacra,
    PuntoGeograficoReferencia,
    ResponsableChacra,
} from '../../dominio/objetos-valor';
import { EstadoChacra } from '../../dominio/enumeraciones';
import { ChacraTypeOrmEntity } from '../../infraestructura/persistencia/chacra.typeorm-entity';
import { MapeadorChacraTypeOrm } from '../../infraestructura/persistencia/mapeador-chacra.typeorm';

describe('T09 — Infraestructura Persistencia: MapeadorChacraTypeOrm', () => {
    const id = '018f6f5d-7a6b-7345-9123-456789abcdef';
    const empresaId = '018f6f5d-7a6b-7345-9123-000000000001';
    const actorId = '018f6f5d-7a6b-7345-9123-actor000001';
    const fecha = new Date('2026-11-13T10:00:00.000Z');

    it('debe mapear de dominio a entidad TypeORM con clave normalizada', () => {
        const chacra = Chacra.registrar({
            id,
            empresaId,
            nombre: NombreChacra.crear('Chacra Los Pinos'),
            nombreCorto: NombreCortoChacra.crear('PINOS'),
            responsableNombre: ResponsableChacra.crear('Pedro'),
            direccion: DireccionChacra.crear('Ruta 14'),
            puntoGeograficoReferencia: PuntoGeograficoReferencia.crear(-27.4, -55.9),
            creadoEn: fecha,
            creadoPor: actorId,
        });

        const entity = MapeadorChacraTypeOrm.aPersistencia(chacra);

        expect(entity.id).toBe(id);
        expect(entity.empresaId).toBe(empresaId);
        expect(entity.nombre).toBe('Chacra Los Pinos');
        expect(entity.nombreCorto).toBe('PINOS');
        expect(entity.nombreCortoNormalizado).toBe('pinos');
        expect(entity.responsableNombre).toBe('Pedro');
        expect(entity.direccion).toBe('Ruta 14');
        expect(entity.puntoGeograficoLatitud).toBe(-27.4);
        expect(entity.puntoGeograficoLongitud).toBe(-55.9);
        expect(entity.estado).toBe('ACTIVA');
        expect(entity.version).toBe(1);
    });

    it('debe mapear de entidad TypeORM a dominio preservando valores null', () => {
        const entity = new ChacraTypeOrmEntity();
        entity.id = id;
        entity.empresaId = empresaId;
        entity.nombre = 'Chacra Simple';
        entity.nombreCorto = 'SIMPLE';
        entity.nombreCortoNormalizado = 'simple';
        entity.responsableNombre = null;
        entity.direccion = null;
        entity.puntoGeograficoLatitud = null;
        entity.puntoGeograficoLongitud = null;
        entity.estado = 'INACTIVA';
        entity.creadoEn = fecha;
        entity.creadoPor = actorId;
        entity.actualizadoEn = fecha;
        entity.actualizadoPor = actorId;
        entity.version = 3;

        const dominio = MapeadorChacraTypeOrm.aDominio(entity);

        expect(dominio.id).toBe(id);
        expect(dominio.nombre.valor).toBe('Chacra Simple');
        expect(dominio.nombreCorto.valor).toBe('SIMPLE');
        expect(dominio.responsableNombre).toBeNull();
        expect(dominio.direccion).toBeNull();
        expect(dominio.puntoGeograficoReferencia).toBeNull();
        expect(dominio.estado).toBe(EstadoChacra.INACTIVA);
        expect(dominio.version).toBe(3);
    });
});
