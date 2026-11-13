import { ContextoSolicitud, CriteriosPaginacion, ResultadoPaginado } from '../../../../comun/aplicacion';
import { ConsultarChacraCasoDeUso } from '../../aplicacion/consultas/consultar-chacra.caso-de-uso';
import { ConsultaChacras } from '../../aplicacion/consultas';
import { ChacraDetalleLectura } from '../../aplicacion/modelos-lectura';
import { EstadoChacra } from '../../dominio/enumeraciones';
import { ErrorAccesoDenegado, ErrorChacraNoEncontrada } from '../../dominio/errores';

class ConsultaChacrasDoble implements ConsultaChacras {
    public chacrasDetalle: ChacraDetalleLectura[] = [];

    obtenerDetallePorId(id: string, empresaId: string): Promise<ChacraDetalleLectura | null> {
        return Promise.resolve(this.chacrasDetalle.find((c) => c.id === id && c.empresaId === empresaId) ?? null);
    }

    listar(): Promise<any> {
        return Promise.resolve(ResultadoPaginado.crear([], 0, CriteriosPaginacion.crear({ limite: 10, desplazamiento: 0 })));
    }
}

describe('T07 — Aplicación: ConsultarChacra (TER-UC-002)', () => {
    let consulta: ConsultaChacrasDoble;
    let casoDeUso: ConsultarChacraCasoDeUso;

    const empresaId = '018f6f5d-7a6b-7345-9123-000000000001';
    const actorId = '018f6f5d-7a6b-7345-9123-actor000001';
    const chacraId1 = '018f6f5d-7a6b-7345-9123-chacra000001';
    const chacraId2 = '018f6f5d-7a6b-7345-9123-chacra000002';

    const detalle1: ChacraDetalleLectura = {
        id: chacraId1,
        empresaId,
        nombre: 'Chacra 1',
        nombreCorto: 'CH1',
        responsableNombre: 'Responsable 1',
        direccion: 'Ruta 1',
        puntoGeograficoReferencia: { latitud: -27.0, longitud: -55.0 },
        estado: EstadoChacra.ACTIVA,
        creadoEn: '2026-11-13T10:00:00.000Z',
        creadoPor: actorId,
        actualizadoEn: '2026-11-13T10:00:00.000Z',
        actualizadoPor: actorId,
        version: 1,
    };

    const detalleInactivo: ChacraDetalleLectura = {
        id: chacraId2,
        empresaId,
        nombre: 'Chacra Inactiva',
        nombreCorto: 'CH-INACT',
        responsableNombre: null,
        direccion: null,
        puntoGeograficoReferencia: null,
        estado: EstadoChacra.INACTIVA,
        creadoEn: '2026-11-13T09:00:00.000Z',
        creadoPor: actorId,
        actualizadoEn: '2026-11-13T10:00:00.000Z',
        actualizadoPor: actorId,
        version: 2,
    };

    beforeEach(() => {
        consulta = new ConsultaChacrasDoble();
        consulta.chacrasDetalle = [detalle1, detalleInactivo];
        casoDeUso = new ConsultarChacraCasoDeUso(consulta);
    });

    it('@TER-UC-002 @AC-01: debe permitir consultar el detalle a un Administrador', async () => {
        const contextoAdmin: ContextoSolicitud = {
            solicitudId: '018f6f5d-7a6b-7345-9123-sol000000001',
            actorId,
            empresaId,
            roles: ['ADMINISTRADOR'],
            permisos: ['TER-UC-002'],
        };

        const resultado = await casoDeUso.ejecutar(chacraId1, contextoAdmin);
        expect(resultado).toEqual(detalle1);
    });

    it('@TER-UC-002 @AC-07: debe permitir consultar una chacra inactiva (TER-BR-008)', async () => {
        const contextoAdmin: ContextoSolicitud = {
            solicitudId: '018f6f5d-7a6b-7345-9123-sol000000001',
            actorId,
            empresaId,
            roles: ['ADMINISTRADOR'],
            permisos: ['TER-UC-002'],
        };

        const resultado = await casoDeUso.ejecutar(chacraId2, contextoAdmin);
        expect(resultado.estado).toBe(EstadoChacra.INACTIVA);
    });

    it('@TER-UC-002: debe permitir consultar a un Capataz si la chacra está en su alcance', async () => {
        const contextoCapatazValido: ContextoSolicitud = {
            solicitudId: '018f6f5d-7a6b-7345-9123-sol000000001',
            actorId,
            empresaId,
            roles: ['CAPATAZ'],
            permisos: ['TER-UC-002'],
            alcance: { chacras: [chacraId1] },
        };

        const resultado = await casoDeUso.ejecutar(chacraId1, contextoCapatazValido);
        expect(resultado.id).toBe(chacraId1);
    });

    it('@TER-UC-002 @AC-08: debe rechazar a un Capataz si la chacra no está en su alcance', async () => {
        const contextoCapatazSinChacra: ContextoSolicitud = {
            solicitudId: '018f6f5d-7a6b-7345-9123-sol000000001',
            actorId,
            empresaId,
            roles: ['CAPATAZ'],
            permisos: ['TER-UC-002'],
            alcance: { chacras: [chacraId1] },
        };

        await expect(casoDeUso.ejecutar(chacraId2, contextoCapatazSinChacra)).rejects.toThrow(ErrorAccesoDenegado);
    });

    it('@TER-UC-002 @AC-02: debe rechazar si falta permiso TER-UC-002', async () => {
        const contextoSinPermiso: ContextoSolicitud = {
            solicitudId: '018f6f5d-7a6b-7345-9123-sol000000001',
            actorId,
            empresaId,
            roles: ['ADMINISTRADOR'],
            permisos: ['TER-UC-001'],
        };

        await expect(casoDeUso.ejecutar(chacraId1, contextoSinPermiso)).rejects.toThrow(ErrorAccesoDenegado);
    });

    it('@TER-UC-002 @AC-06: debe rechazar si la chacra no existe', async () => {
        const contextoAdmin: ContextoSolicitud = {
            solicitudId: '018f6f5d-7a6b-7345-9123-sol000000001',
            actorId,
            empresaId,
            roles: ['ADMINISTRADOR'],
            permisos: ['TER-UC-002'],
        };

        await expect(casoDeUso.ejecutar('018f6f5d-7a6b-7345-9123-inexistente000', contextoAdmin)).rejects.toThrow(
            ErrorChacraNoEncontrada,
        );
    });
});
