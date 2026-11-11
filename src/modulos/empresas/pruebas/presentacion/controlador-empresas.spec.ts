import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import supertest from 'supertest';
import { App } from 'supertest/types';
import { ControladorEmpresas } from '../../presentacion/http/controladores/controlador-empresas';
import { RegistrarEmpresa } from '../../aplicacion/comandos/registrar-empresa.caso-de-uso';
import { ConsultarEmpresa } from '../../aplicacion/consultas/consultar-empresa.caso-de-uso';
import { ListarEmpresas } from '../../aplicacion/consultas/listar-empresas.caso-de-uso';
import { ModificarEmpresa } from '../../aplicacion/comandos/modificar-empresa.caso-de-uso';
import { ModificarConfiguracionGeneral } from '../../aplicacion/comandos/modificar-configuracion-general.caso-de-uso';
import { SuspenderEmpresa } from '../../aplicacion/comandos/suspender-empresa.caso-de-uso';
import { ReactivarEmpresa } from '../../aplicacion/comandos/reactivar-empresa.caso-de-uso';
import { CerrarEmpresa } from '../../aplicacion/comandos/cerrar-empresa.caso-de-uso';
import { FiltroExcepcionesRfc9457 } from '../../presentacion/http/filtros/filtro-excepciones-rfc9457';
import { EmpresaLectura, ResultadoListadoEmpresas } from '../../aplicacion/modelos-lectura';

describe('ControladorEmpresas HTTP (T08)', () => {
    let app: INestApplication;
    const mockRegistrarEmpresa = { ejecutar: jest.fn() };
    const mockConsultarEmpresa = { ejecutar: jest.fn() };
    const mockListarEmpresas = { ejecutar: jest.fn() };
    const mockModificarEmpresa = { ejecutar: jest.fn() };
    const mockModificarConfiguracionGeneral = { ejecutar: jest.fn() };
    const mockSuspenderEmpresa = { ejecutar: jest.fn() };
    const mockReactivarEmpresa = { ejecutar: jest.fn() };
    const mockCerrarEmpresa = { ejecutar: jest.fn() };

    const empresaRespuestaMock: EmpresaLectura = {
        id: '019313ea-1111-7000-8000-000000000001',
        nombre: 'Yerba Norte',
        alias: 'yerba-norte',
        cuit: '20123456789',
        responsableNombre: 'Juan Perez',
        ubicacionTexto: 'Ruta 12',
        ubicacionGeografica: null,
        descripcionActividad: null,
        estado: 'ACTIVA',
        configuracionGeneral: {
            id: 'cfg-1',
            empresaId: '019313ea-1111-7000-8000-000000000001',
            paisReferencia: 'AR',
            zonaHoraria: 'America/Argentina/Buenos_Aires',
            monedaPrincipal: 'ARS',
            creadoEn: '2026-11-10T12:00:00.000Z',
            creadoPor: 'super-admin-id',
            actualizadoEn: '2026-11-10T12:00:00.000Z',
            actualizadoPor: 'super-admin-id',
            version: 1,
        },
        creadoEn: '2026-11-10T12:00:00.000Z',
        creadoPor: 'super-admin-id',
        actualizadoEn: '2026-11-10T12:00:00.000Z',
        actualizadoPor: 'super-admin-id',
        version: 1,
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [ControladorEmpresas],
            providers: [
                { provide: RegistrarEmpresa, useValue: mockRegistrarEmpresa },
                { provide: ConsultarEmpresa, useValue: mockConsultarEmpresa },
                { provide: ListarEmpresas, useValue: mockListarEmpresas },
                { provide: ModificarEmpresa, useValue: mockModificarEmpresa },
                {
                    provide: ModificarConfiguracionGeneral,
                    useValue: mockModificarConfiguracionGeneral,
                },
                { provide: SuspenderEmpresa, useValue: mockSuspenderEmpresa },
                { provide: ReactivarEmpresa, useValue: mockReactivarEmpresa },
                { provide: CerrarEmpresa, useValue: mockCerrarEmpresa },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );
        app.useGlobalFilters(new FiltroExcepcionesRfc9457());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('POST /empresas retorna 201 y cabecera ETag', async () => {
        mockRegistrarEmpresa.ejecutar.mockResolvedValueOnce(empresaRespuestaMock);

        const response = await supertest(app.getHttpServer() as App)
            .post('/empresas')
            .set('x-actor-id', 'super-admin-id')
            .set('x-rol', 'SUPER_ADMINISTRADOR')
            .send({
                nombre: 'Yerba Norte',
                alias: 'yerba-norte',
                cuit: '20123456789',
            });

        expect(response.status).toBe(201);
        expect(response.headers.etag).toBe('"1"');
        const cuerpo = response.body as EmpresaLectura;
        expect(cuerpo.nombre).toBe('Yerba Norte');
    });

    it('GET /empresas retorna 200 con listado paginado', async () => {
        mockListarEmpresas.ejecutar.mockResolvedValueOnce({
            elementos: [empresaRespuestaMock],
            total: 1,
            limite: 25,
            desplazamiento: 0,
        });

        const response = await supertest(app.getHttpServer() as App)
            .get('/empresas?limite=10&desplazamiento=0')
            .set('x-actor-id', 'super-admin-id')
            .set('x-rol', 'SUPER_ADMINISTRADOR');

        expect(response.status).toBe(200);
        const cuerpo = response.body as ResultadoListadoEmpresas;
        expect(cuerpo.elementos.length).toBe(1);
        expect(cuerpo.total).toBe(1);
    });

    it('GET /empresas/:idOAlias retorna 200 y cabecera ETag', async () => {
        mockConsultarEmpresa.ejecutar.mockResolvedValueOnce(empresaRespuestaMock);

        const response = await supertest(app.getHttpServer() as App)
            .get('/empresas/yerba-norte')
            .set('x-actor-id', 'super-admin-id')
            .set('x-rol', 'SUPER_ADMINISTRADOR');

        expect(response.status).toBe(200);
        expect(response.headers.etag).toBe('"1"');
        const cuerpo = response.body as EmpresaLectura;
        expect(cuerpo.alias).toBe('yerba-norte');
    });

    it('PATCH /empresas/:id requiere If-Match y retorna 200', async () => {
        mockModificarEmpresa.ejecutar.mockResolvedValueOnce({
            ...empresaRespuestaMock,
            version: 2,
            nombre: 'Yerba Norte Nueva',
        });

        const response = await supertest(app.getHttpServer() as App)
            .patch('/empresas/019313ea-1111-7000-8000-000000000001')
            .set('If-Match', '"1"')
            .set('x-actor-id', 'super-admin-id')
            .set('x-rol', 'SUPER_ADMINISTRADOR')
            .send({
                nombre: 'Yerba Norte Nueva',
            });

        expect(response.status).toBe(200);
        expect(response.headers.etag).toBe('"2"');
        const cuerpo = response.body as EmpresaLectura;
        expect(cuerpo.nombre).toBe('Yerba Norte Nueva');
    });

    it('PATCH /empresas/:id sin If-Match retorna 428 Precondition Required', async () => {
        const response = await supertest(app.getHttpServer() as App)
            .patch('/empresas/019313ea-1111-7000-8000-000000000001')
            .set('x-actor-id', 'super-admin-id')
            .set('x-rol', 'SUPER_ADMINISTRADOR')
            .send({
                nombre: 'Yerba Norte Nueva',
            });

        expect(response.status).toBe(428);
        expect(response.headers['content-type']).toContain('application/problem+json');
    });

    it('POST /empresas/:id/suspender suspende la empresa con If-Match', async () => {
        mockSuspenderEmpresa.ejecutar.mockResolvedValueOnce({
            ...empresaRespuestaMock,
            estado: 'SUSPENDIDA',
            version: 2,
        });

        const response = await supertest(app.getHttpServer() as App)
            .post('/empresas/019313ea-1111-7000-8000-000000000001/suspender')
            .set('If-Match', '"1"')
            .set('x-actor-id', 'super-admin-id')
            .set('x-rol', 'SUPER_ADMINISTRADOR');

        expect(response.status).toBe(200);
        expect(response.headers.etag).toBe('"2"');
        const cuerpo = response.body as EmpresaLectura;
        expect(cuerpo.estado).toBe('SUSPENDIDA');
    });

    it('POST /empresas/:id/reactivar reactiva la empresa con If-Match', async () => {
        mockReactivarEmpresa.ejecutar.mockResolvedValueOnce({
            ...empresaRespuestaMock,
            estado: 'ACTIVA',
            version: 3,
        });

        const response = await supertest(app.getHttpServer() as App)
            .post('/empresas/019313ea-1111-7000-8000-000000000001/reactivar')
            .set('If-Match', '"2"')
            .set('x-actor-id', 'super-admin-id')
            .set('x-rol', 'SUPER_ADMINISTRADOR');

        expect(response.status).toBe(200);
        expect(response.headers.etag).toBe('"3"');
        const cuerpo = response.body as EmpresaLectura;
        expect(cuerpo.estado).toBe('ACTIVA');
    });

    it('POST /empresas/:id/cerrar cierra la empresa con If-Match', async () => {
        mockCerrarEmpresa.ejecutar.mockResolvedValueOnce({
            ...empresaRespuestaMock,
            estado: 'CERRADA',
            version: 4,
        });

        const response = await supertest(app.getHttpServer() as App)
            .post('/empresas/019313ea-1111-7000-8000-000000000001/cerrar')
            .set('If-Match', '"3"')
            .set('x-actor-id', 'super-admin-id')
            .set('x-rol', 'SUPER_ADMINISTRADOR');

        expect(response.status).toBe(200);
        expect(response.headers.etag).toBe('"4"');
        const cuerpo = response.body as EmpresaLectura;
        expect(cuerpo.estado).toBe('CERRADA');
    });

    it('PUT /empresas/:id/configuracion-general modifica la configuración con If-Match', async () => {
        mockModificarConfiguracionGeneral.ejecutar.mockResolvedValueOnce({
            ...empresaRespuestaMock,
            version: 2,
            configuracionGeneral: {
                ...empresaRespuestaMock.configuracionGeneral,
                paisReferencia: 'BR',
                version: 2,
            },
        });

        const response = await supertest(app.getHttpServer() as App)
            .put('/empresas/019313ea-1111-7000-8000-000000000001/configuracion-general')
            .set('If-Match', '"1"')
            .set('x-actor-id', 'super-admin-id')
            .set('x-rol', 'SUPER_ADMINISTRADOR')
            .send({
                paisReferencia: 'BR',
                zonaHoraria: 'America/Sao_Paulo',
                monedaPrincipal: 'BRL',
            });

        expect(response.status).toBe(200);
        expect(response.headers.etag).toBe('"2"');
        const cuerpo = response.body as EmpresaLectura;
        expect(cuerpo.configuracionGeneral.paisReferencia).toBe('BR');
    });
});
