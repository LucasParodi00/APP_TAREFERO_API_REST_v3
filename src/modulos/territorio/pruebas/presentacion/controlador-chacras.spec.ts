import { Response } from 'express';
import { ControladorChacras } from '../../presentacion/controladores/controlador-chacras';
import { RegistrarChacraCasoDeUso } from '../../aplicacion/comandos/registrar-chacra.caso-de-uso';
import { ConsultarChacraCasoDeUso } from '../../aplicacion/consultas/consultar-chacra.caso-de-uso';
import { ListarChacrasCasoDeUso } from '../../aplicacion/consultas/listar-chacras.caso-de-uso';
import { ModificarChacraCasoDeUso } from '../../aplicacion/comandos/modificar-chacra.caso-de-uso';
import { InactivarChacraCasoDeUso } from '../../aplicacion/comandos/inactivar-chacra.caso-de-uso';
import { ContextoSolicitud, ResultadoPaginado } from '../../../../comun/aplicacion';
import { EstadoChacra } from '../../dominio/enumeraciones';
import { ListarChacrasDto } from '../../presentacion/dtos';

describe('T11 — Presentación: ControladorChacras y DTOs', () => {
    let controlador: ControladorChacras;
    let mockRegistrar: Partial<RegistrarChacraCasoDeUso>;
    let mockConsultar: Partial<ConsultarChacraCasoDeUso>;
    let mockListar: Partial<ListarChacrasCasoDeUso>;
    let mockModificar: Partial<ModificarChacraCasoDeUso>;
    let mockInactivar: Partial<InactivarChacraCasoDeUso>;
    let resMock: Partial<Response>;

    const empresaId = '018f6f5d-7a6b-7345-9123-000000000001';
    const actorId = '018f6f5d-7a6b-7345-9123-actor000001';
    const chacraId = '018f6f5d-7a6b-7345-9123-chacra000001';

    const contexto: ContextoSolicitud = {
        solicitudId: '018f6f5d-7a6b-7345-9123-sol000000001',
        actorId,
        empresaId,
        roles: ['ADMINISTRADOR'],
        permisos: ['TER-UC-001', 'TER-UC-002', 'TER-UC-003', 'TER-UC-004', 'TER-UC-005'],
    };

    beforeEach(() => {
        resMock = {
            setHeader: jest.fn(),
        };

        mockRegistrar = {
            ejecutar: jest.fn().mockResolvedValue({
                id: chacraId,
                empresaId,
                nombre: 'Chacra Test',
                nombreCorto: 'TEST',
                responsableNombre: null,
                direccion: null,
                puntoGeograficoReferencia: null,
                estado: 'ACTIVA',
                creadoEn: '2026-11-13T10:00:00.000Z',
                version: 1,
            }),
        };

        mockConsultar = {
            ejecutar: jest.fn().mockResolvedValue({
                id: chacraId,
                empresaId,
                nombre: 'Chacra Test',
                nombreCorto: 'TEST',
                responsableNombre: null,
                direccion: null,
                puntoGeograficoReferencia: null,
                estado: EstadoChacra.ACTIVA,
                creadoEn: '2026-11-13T10:00:00.000Z',
                creadoPor: actorId,
                actualizadoEn: '2026-11-13T10:00:00.000Z',
                actualizadoPor: actorId,
                version: 1,
            }),
        };

        mockListar = {
            ejecutar: jest.fn().mockResolvedValue(ResultadoPaginado.crear([], 0, { limite: 20, desplazamiento: 0 })),
        };

        mockModificar = {
            ejecutar: jest.fn().mockResolvedValue({
                id: chacraId,
                empresaId,
                nombre: 'Chacra Modificada',
                nombreCorto: 'TEST',
                responsableNombre: null,
                direccion: null,
                puntoGeograficoReferencia: null,
                estado: 'ACTIVA',
                actualizadoEn: '2026-11-13T11:00:00.000Z',
                version: 2,
            }),
        };

        mockInactivar = {
            ejecutar: jest.fn().mockResolvedValue({
                id: chacraId,
                estado: EstadoChacra.INACTIVA,
                actualizadoEn: '2026-11-13T12:00:00.000Z',
                version: 2,
            }),
        };

        controlador = new ControladorChacras(
            mockRegistrar as RegistrarChacraCasoDeUso,
            mockConsultar as ConsultarChacraCasoDeUso,
            mockListar as ListarChacrasCasoDeUso,
            mockModificar as ModificarChacraCasoDeUso,
            mockInactivar as InactivarChacraCasoDeUso,
        );
    });

    it('POST /chacras debe registrar y configurar cabecera ETag', async () => {
        const dto = { nombre: 'Chacra Test', nombreCorto: 'TEST' };
        const resultado = await controlador.registrar(dto, contexto, resMock as Response);

        expect(resultado.id).toBe(chacraId);
        expect(resMock.setHeader).toHaveBeenCalledWith('ETag', 'W/"1"');
    });

    it('GET /chacras/{id} debe consultar y configurar cabecera ETag', async () => {
        const resultado = await controlador.consultar(chacraId, contexto, resMock as Response);

        expect(resultado.id).toBe(chacraId);
        expect(resMock.setHeader).toHaveBeenCalledWith('ETag', 'W/"1"');
    });

    it('GET /chacras debe listar pasando query params', async () => {
        const query = Object.assign(new ListarChacrasDto(), {
            limite: 10,
            desplazamiento: 0,
            estado: 'ACTIVA',
            orden: 'nombre:asc',
        });
        const resultado = await controlador.listar(query, contexto);

        expect(mockListar.ejecutar).toHaveBeenCalledWith(
            { limite: 10, desplazamiento: 0, estado: 'ACTIVA', orden: 'nombre:asc' },
            contexto,
        );
        expect(resultado).toBeDefined();
    });

    it('PATCH /chacras/{id} debe modificar con versionIfMatch y actualizar ETag', async () => {
        const dto = { nombre: 'Chacra Modificada' };
        const resultado = await controlador.modificar(chacraId, dto, 1, contexto, resMock as Response);

        expect(resultado.nombre).toBe('Chacra Modificada');
        expect(mockModificar.ejecutar).toHaveBeenCalledWith({ chacraId, versionEsperada: 1, ...dto }, contexto);
        expect(resMock.setHeader).toHaveBeenCalledWith('ETag', 'W/"2"');
    });

    it('POST /chacras/{id}/inactivar debe inactivar con versionIfMatch y actualizar ETag', async () => {
        const resultado = await controlador.inactivar(chacraId, 1, contexto, resMock as Response);

        expect(resultado.estado).toBe(EstadoChacra.INACTIVA);
        expect(mockInactivar.ejecutar).toHaveBeenCalledWith({ chacraId, versionEsperada: 1 }, contexto);
        expect(resMock.setHeader).toHaveBeenCalledWith('ETag', 'W/"2"');
    });
});
