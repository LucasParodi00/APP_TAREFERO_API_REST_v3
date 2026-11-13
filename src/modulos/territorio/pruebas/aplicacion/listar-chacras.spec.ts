import { ContextoSolicitud, ResultadoPaginado } from '../../../../comun/aplicacion';
import { ListarChacrasCasoDeUso, ListarChacrasConsulta } from '../../aplicacion/consultas/listar-chacras.caso-de-uso';
import { ConsultaChacras, ParametrosListarChacras } from '../../aplicacion/consultas';
import { ChacraResumenLectura } from '../../aplicacion/modelos-lectura';
import { EstadoChacra } from '../../dominio/enumeraciones';
import { ErrorAccesoDenegado, ErrorConsultaInvalida } from '../../dominio/errores';

class ConsultaChacrasDoble implements ConsultaChacras {
    public items: ChacraResumenLectura[] = [];
    public ultimosParametros?: ParametrosListarChacras;

    obtenerDetallePorId(): Promise<any> {
        return Promise.resolve(null);
    }

    listar(params: ParametrosListarChacras): Promise<ResultadoPaginado<ChacraResumenLectura>> {
        this.ultimosParametros = params;
        let resultado = [...this.items].filter((item) => item.empresaId === params.empresaId);

        if (params.estado) {
            resultado = resultado.filter((item) => item.estado === params.estado);
        }

        if (params.alcanceChacraIds) {
            resultado = resultado.filter((item) => params.alcanceChacraIds!.includes(item.id));
        }

        const paginados = resultado.slice(
            params.paginacion.desplazamiento,
            params.paginacion.desplazamiento + params.paginacion.limite,
        );
        return Promise.resolve(ResultadoPaginado.crear(paginados, resultado.length, params.paginacion));
    }
}

describe('T08 — Aplicación: ListarChacras (TER-UC-003, D-07, D-08)', () => {
    let consulta: ConsultaChacrasDoble;
    let casoDeUso: ListarChacrasCasoDeUso;

    const empresaId = '018f6f5d-7a6b-7345-9123-000000000001';
    const actorId = '018f6f5d-7a6b-7345-9123-actor000001';

    const chacra1: ChacraResumenLectura = {
        id: '018f6f5d-7a6b-7345-9123-chacra000001',
        empresaId,
        nombre: 'Chacra 1',
        nombreCorto: 'CH1',
        responsableNombre: null,
        direccion: null,
        puntoGeograficoReferencia: null,
        estado: EstadoChacra.ACTIVA,
        creadoEn: '2026-11-13T10:00:00.000Z',
        version: 1,
    };

    const chacra2: ChacraResumenLectura = {
        id: '018f6f5d-7a6b-7345-9123-chacra000002',
        empresaId,
        nombre: 'Chacra 2 Inactiva',
        nombreCorto: 'CH2',
        responsableNombre: null,
        direccion: null,
        puntoGeograficoReferencia: null,
        estado: EstadoChacra.INACTIVA,
        creadoEn: '2026-11-13T11:00:00.000Z',
        version: 2,
    };

    const contextoAdmin: ContextoSolicitud = {
        solicitudId: '018f6f5d-7a6b-7345-9123-sol000000001',
        actorId,
        empresaId,
        roles: ['ADMINISTRADOR'],
        permisos: ['TER-UC-003'],
    };

    beforeEach(() => {
        consulta = new ConsultaChacrasDoble();
        consulta.items = [chacra1, chacra2];
        casoDeUso = new ListarChacrasCasoDeUso(consulta);
    });

    it('@TER-UC-003 @AC-01: debe listar con paginación y orden por defecto (creadoEn:desc)', async () => {
        const query: ListarChacrasConsulta = {};
        const resultado = await casoDeUso.ejecutar(query, contextoAdmin);

        expect(resultado.paginacion.total).toBe(2);
        expect(resultado.datos).toHaveLength(2);
        expect(consulta.ultimosParametros?.campoOrden).toBe('creadoEn');
        expect(consulta.ultimosParametros?.direccionOrden).toBe('DESC');
    });

    it('@TER-UC-003 @AC-02: debe filtrar por estado ACTIVA', async () => {
        const query: ListarChacrasConsulta = { estado: 'ACTIVA' };
        const resultado = await casoDeUso.ejecutar(query, contextoAdmin);

        expect(resultado.paginacion.total).toBe(1);
        expect(resultado.datos[0].id).toBe(chacra1.id);
        expect(consulta.ultimosParametros?.estado).toBe(EstadoChacra.ACTIVA);
    });

    it('debe rechazar estado inválido con ErrorConsultaInvalida', async () => {
        const query: ListarChacrasConsulta = { estado: 'ESTADO_INVALIDO' };
        await expect(casoDeUso.ejecutar(query, contextoAdmin)).rejects.toThrow(ErrorConsultaInvalida);
    });

    it('debe traducir de forma segura campos y sentido de orden (D-08)', async () => {
        const query: ListarChacrasConsulta = { orden: 'nombreCorto:asc' };
        await casoDeUso.ejecutar(query, contextoAdmin);

        expect(consulta.ultimosParametros?.campoOrden).toBe('nombreCorto');
        expect(consulta.ultimosParametros?.direccionOrden).toBe('ASC');
    });

    it('debe rechazar campos de orden no permitidos (D-08)', async () => {
        const query: ListarChacrasConsulta = { orden: 'campoInexistente:asc' };
        await expect(casoDeUso.ejecutar(query, contextoAdmin)).rejects.toThrow(ErrorConsultaInvalida);
    });

    it('debe retornar 0 resultados inmediatamente para un Capataz con selección vacía (D-07)', async () => {
        const contextoCapatazVacio: ContextoSolicitud = {
            solicitudId: '018f6f5d-7a6b-7345-9123-sol000000001',
            actorId,
            empresaId,
            roles: ['CAPATAZ'],
            permisos: ['TER-UC-003'],
            alcance: { chacras: [] },
        };

        const resultado = await casoDeUso.ejecutar({}, contextoCapatazVacio);
        expect(resultado.paginacion.total).toBe(0);
        expect(resultado.datos).toHaveLength(0);
        expect(consulta.ultimosParametros).toBeUndefined(); // no consulta la BD
    });

    it('debe rechazar si falta permiso TER-UC-003', async () => {
        const contextoSinPermiso: ContextoSolicitud = {
            solicitudId: '018f6f5d-7a6b-7345-9123-sol000000001',
            actorId,
            empresaId,
            roles: ['ADMINISTRADOR'],
            permisos: ['TER-UC-001'],
        };

        await expect(casoDeUso.ejecutar({}, contextoSinPermiso)).rejects.toThrow(ErrorAccesoDenegado);
    });
});
