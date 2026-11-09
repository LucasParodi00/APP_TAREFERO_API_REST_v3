import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http';
import { AppModule } from '../src/app.module';
import { AppDataSource } from '../src/infraestructura/persistencia/data-source';

interface RespuestaEmpresaTest {
  id: string;
  nombre: string;
  alias: string;
  estado: string;
  version: number;
  configuracion: {
    monedaPrincipal: string;
  };
}

interface RespuestaErrorTest {
  code: string;
}

interface RespuestaListadoTest {
  datos: Array<{ id: string; nombre: string }>;
  paginacion: { total: number };
}

interface RespuestaConfigTest {
  zonaHoraria: string;
  monedaPrincipal: string;
  version: number;
}

describe('Empresas (e2e) — Casos de uso y Aceptación (T07)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer() as Server;

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    await app.close();
  });

  beforeEach(async () => {
    await AppDataSource.query(
      'TRUNCATE TABLE configuraciones_empresa, empresas CASCADE;',
    );
  });

  describe('EMP-UC-001 — Registrar Empresa', () => {
    it('@EMP-UC-001 @AC-01: Registrar una Empresa indicando solo los datos obligatorios', async () => {
      const response = await request(server)
        .post('/api/v1/empresas')
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .send({
          nombre: 'Yerba Norte',
          alias: 'yerba-norte',
        })
        .expect(201);

      const body = response.body as unknown as RespuestaEmpresaTest;
      expect(response.headers['location']).toMatch(
        /^\/api\/v1\/empresas\/[a-f0-9-]+$/,
      );
      expect(response.headers['etag']).toBe('"1"');
      expect(response.headers['etag-configuracion']).toBe('"1"');
      expect(body.nombre).toBe('Yerba Norte');
      expect(body.alias).toBe('yerba-norte');
      expect(body.estado).toBe('ACTIVA');
      expect(body.version).toBe(1);
      expect(body.configuracion.monedaPrincipal).toBe('ARS');
    });

    it('@EMP-UC-001 @AC-02: Rechazar una Empresa sin nombre con EMP_NOMBRE_OBLIGATORIO', async () => {
      const response = await request(server)
        .post('/api/v1/empresas')
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .send({
          nombre: '   ',
          alias: 'yerba-norte',
        })
        .expect(422);

      const body = response.body as unknown as RespuestaErrorTest;
      expect(body.code).toBe('EMP_NOMBRE_OBLIGATORIO');
    });

    it('@EMP-UC-001 @AC-05: Rol sin permiso para registrar Empresas con EMP_ACCESO_DENEGADO', async () => {
      const response = await request(server)
        .post('/api/v1/empresas')
        .set('x-actor-id', 'admin-1')
        .set('x-actor-rol', 'Administrador')
        .send({
          nombre: 'Yerba Norte',
          alias: 'yerba-norte',
        })
        .expect(403);

      const body = response.body as unknown as RespuestaErrorTest;
      expect(body.code).toBe('EMP_ACCESO_DENEGADO');
    });

    it('@EMP-UC-001 @AC-07: Rechazar un alias con formato inválido con EMP_ALIAS_INVALIDO', async () => {
      const response = await request(server)
        .post('/api/v1/empresas')
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .send({
          nombre: 'Yerba Norte',
          alias: 'Yerba-Norte',
        })
        .expect(422);

      const body = response.body as unknown as RespuestaErrorTest;
      expect(body.code).toBe('EMP_ALIAS_INVALIDO');
    });

    it('@EMP-UC-001 @AC-08: Rechazar alias duplicado con EMP_ALIAS_NO_DISPONIBLE', async () => {
      await request(server)
        .post('/api/v1/empresas')
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .send({
          nombre: 'Yerba Norte',
          alias: 'yerba-norte',
        })
        .expect(201);

      const response = await request(server)
        .post('/api/v1/empresas')
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .send({
          nombre: 'Yerba Norte Segunda',
          alias: 'yerba-norte',
        })
        .expect(409);

      const body = response.body as unknown as RespuestaErrorTest;
      expect(body.code).toBe('EMP_ALIAS_NO_DISPONIBLE');
    });
  });

  describe('EMP-UC-002 — Consultar Empresa', () => {
    it('@EMP-UC-002 @AC-01: Un Administrador consulta su Empresa', async () => {
      const creada = await request(server)
        .post('/api/v1/empresas')
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .send({
          nombre: 'Yerba Norte',
          alias: 'yerba-norte',
        })
        .expect(201);

      const creadaBody = creada.body as unknown as RespuestaEmpresaTest;

      const response = await request(server)
        .get(`/api/v1/empresas/${creadaBody.id}`)
        .set('x-actor-id', 'admin-1')
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', creadaBody.id)
        .expect(200);

      const body = response.body as unknown as RespuestaEmpresaTest;
      expect(body.id).toBe(creadaBody.id);
      expect(body.nombre).toBe('Yerba Norte');
      expect(response.headers['etag']).toBe('"1"');
    });

    it('@EMP-UC-002 @AC-02: Un Administrador intenta consultar otra Empresa con EMP_ACCESO_DENEGADO', async () => {
      const creada = await request(server)
        .post('/api/v1/empresas')
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .send({
          nombre: 'Yerba Norte',
          alias: 'yerba-norte',
        })
        .expect(201);

      const creadaBody = creada.body as unknown as RespuestaEmpresaTest;

      const response = await request(server)
        .get(`/api/v1/empresas/${creadaBody.id}`)
        .set('x-actor-id', 'admin-1')
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', '0192e210-9999-7000-8000-000000000099')
        .expect(403);

      const body = response.body as unknown as RespuestaErrorTest;
      expect(body.code).toBe('EMP_ACCESO_DENEGADO');
    });

    it('@EMP-UC-002 @AC-03: Consultar una Empresa inexistente con EMP_EMPRESA_NO_ENCONTRADA', async () => {
      const response = await request(server)
        .get('/api/v1/empresas/0192e210-0000-7000-8000-000000000000')
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .expect(404);

      const body = response.body as unknown as RespuestaErrorTest;
      expect(body.code).toBe('EMP_EMPRESA_NO_ENCONTRADA');
    });
  });

  describe('EMP-UC-003 — Listar Empresas', () => {
    it('@EMP-UC-003 @AC-01: Listar Empresas por SuperAdministrador', async () => {
      await request(server)
        .post('/api/v1/empresas')
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .send({ nombre: 'Empresa A', alias: 'empresa-a' })
        .expect(201);

      await request(server)
        .post('/api/v1/empresas')
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .send({ nombre: 'Empresa B', alias: 'empresa-b' })
        .expect(201);

      const response = await request(server)
        .get('/api/v1/empresas?limite=10&desplazamiento=0')
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .expect(200);

      const body = response.body as unknown as RespuestaListadoTest;
      expect(body.datos.length).toBe(2);
      expect(body.paginacion.total).toBe(2);
    });

    it('@EMP-UC-003 @AC-02: Solicitar límite > 100 devuelve EMP_CONSULTA_INVALIDA', async () => {
      const response = await request(server)
        .get('/api/v1/empresas?limite=101')
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .expect(400);

      const body = response.body as unknown as RespuestaErrorTest;
      expect(body.code).toBe('EMP_CONSULTA_INVALIDA');
    });

    it('@EMP-UC-003 @AC-03: Administrador intenta listar y recibe EMP_ACCESO_DENEGADO', async () => {
      const response = await request(server)
        .get('/api/v1/empresas')
        .set('x-actor-id', 'admin-1')
        .set('x-actor-rol', 'Administrador')
        .expect(403);

      const body = response.body as unknown as RespuestaErrorTest;
      expect(body.code).toBe('EMP_ACCESO_DENEGADO');
    });
  });

  describe('EMP-UC-004 — Modificar Empresa', () => {
    it('@EMP-UC-004 @AC-01: Modificar datos de la Empresa con versión vigente', async () => {
      const creada = await request(server)
        .post('/api/v1/empresas')
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .send({ nombre: 'Empresa Original', alias: 'empresa-original' })
        .expect(201);

      const creadaBody = creada.body as unknown as RespuestaEmpresaTest;

      const response = await request(server)
        .patch(`/api/v1/empresas/${creadaBody.id}`)
        .set('x-actor-id', 'admin-1')
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', creadaBody.id)
        .set('if-match', '"1"')
        .send({ nombre: 'Empresa Nombre Nuevo' })
        .expect(200);

      const body = response.body as unknown as RespuestaEmpresaTest;
      expect(body.nombre).toBe('Empresa Nombre Nuevo');
      expect(body.version).toBe(2);
      expect(response.headers['etag']).toBe('"2"');
    });

    it('@EMP-UC-004 @AC-02: Rechazar cambio con versión incorrecta con EMP_VERSION_CONFLICTO', async () => {
      const creada = await request(server)
        .post('/api/v1/empresas')
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .send({ nombre: 'Empresa Original', alias: 'empresa-version' })
        .expect(201);

      const creadaBody = creada.body as unknown as RespuestaEmpresaTest;

      const response = await request(server)
        .patch(`/api/v1/empresas/${creadaBody.id}`)
        .set('x-actor-id', 'admin-1')
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', creadaBody.id)
        .set('if-match', '"99"')
        .send({ nombre: 'Intento con Version Vieja' })
        .expect(409);

      const body = response.body as unknown as RespuestaErrorTest;
      expect(body.code).toBe('EMP_VERSION_CONFLICTO');
    });

    it('@EMP-UC-004 @AC-07: Rechazar cambio de alias con EMP_ALIAS_INMUTABLE', async () => {
      const creada = await request(server)
        .post('/api/v1/empresas')
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .send({ nombre: 'Empresa Original', alias: 'alias-inmutable' })
        .expect(201);

      const creadaBody = creada.body as unknown as RespuestaEmpresaTest;

      const response = await request(server)
        .patch(`/api/v1/empresas/${creadaBody.id}`)
        .set('x-actor-id', 'admin-1')
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', creadaBody.id)
        .set('if-match', '"1"')
        .send({ alias: 'nuevo-alias' })
        .expect(422);

      const body = response.body as unknown as RespuestaErrorTest;
      expect(body.code).toBe('EMP_ALIAS_INMUTABLE');
    });
  });

  describe('EMP-UC-008 — Modificar configuración general', () => {
    it('modifica la configuración general con If-Match y retorna 200', async () => {
      const creada = await request(server)
        .post('/api/v1/empresas')
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .send({ nombre: 'Empresa Config', alias: 'empresa-config' })
        .expect(201);

      const creadaBody = creada.body as unknown as RespuestaEmpresaTest;

      const response = await request(server)
        .patch(`/api/v1/empresas/${creadaBody.id}/configuracion-general`)
        .set('x-actor-id', 'admin-1')
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', creadaBody.id)
        .set('if-match', '"1"')
        .send({
          zonaHoraria: 'America/Montevideo',
          monedaPrincipal: 'UYU',
        })
        .expect(200);

      const body = response.body as unknown as RespuestaConfigTest;
      expect(body.zonaHoraria).toBe('America/Montevideo');
      expect(body.monedaPrincipal).toBe('UYU');
      expect(body.version).toBe(2);
      expect(response.headers['etag']).toBe('"2"');
    });
  });

  describe('EMP-UC-005, EMP-UC-006, EMP-UC-007 — Ciclo de vida de Empresas', () => {
    it('SuperAdmin suspende una empresa activa, luego la reactiva y finalmente la cierra', async () => {
      const creada = await request(server)
        .post('/api/v1/empresas')
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .send({ nombre: 'Empresa Ciclo', alias: 'empresa-ciclo' })
        .expect(201);

      const creadaBody = creada.body as unknown as RespuestaEmpresaTest;
      const empresaId = creadaBody.id;

      // 1. Suspender Empresa (EMP-UC-005)
      const resSuspension = await request(server)
        .post(`/api/v1/empresas/${empresaId}/suspensiones`)
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .set('if-match', '"1"')
        .expect(200);

      const suspBody = resSuspension.body as unknown as RespuestaEmpresaTest;
      expect(suspBody.estado).toBe('SUSPENDIDA');
      expect(suspBody.version).toBe(2);
      expect(resSuspension.headers['etag']).toBe('"2"');

      // 2. Intentar suspenderla de nuevo falla con 422 EMP_TRANSICION_ESTADO_INVALIDA
      const resSuspInvalida = await request(server)
        .post(`/api/v1/empresas/${empresaId}/suspensiones`)
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .set('if-match', '"2"')
        .expect(422);

      expect((resSuspInvalida.body as unknown as RespuestaErrorTest).code).toBe(
        'EMP_TRANSICION_ESTADO_INVALIDA',
      );

      // 3. Reactivar Empresa (EMP-UC-006)
      const resReactivacion = await request(server)
        .post(`/api/v1/empresas/${empresaId}/reactivaciones`)
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .set('if-match', '"2"')
        .expect(200);

      const reactBody = resReactivacion.body as unknown as RespuestaEmpresaTest;
      expect(reactBody.estado).toBe('ACTIVA');
      expect(reactBody.version).toBe(3);
      expect(resReactivacion.headers['etag']).toBe('"3"');

      // 4. Cerrar Empresa (EMP-UC-007)
      const resCierre = await request(server)
        .post(`/api/v1/empresas/${empresaId}/cierres`)
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .set('if-match', '"3"')
        .expect(200);

      const cierreBody = resCierre.body as unknown as RespuestaEmpresaTest;
      expect(cierreBody.estado).toBe('CERRADA');
      expect(cierreBody.version).toBe(4);
      expect(resCierre.headers['etag']).toBe('"4"');

      // 5. Cierre es irreversible: no se puede suspender ni reactivar
      await request(server)
        .post(`/api/v1/empresas/${empresaId}/reactivaciones`)
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .set('if-match', '"4"')
        .expect(422);
    });

    it('rechaza suspender si el actor no es SuperAdministrador con 403', async () => {
      const creada = await request(server)
        .post('/api/v1/empresas')
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .send({ nombre: 'Empresa Auth', alias: 'empresa-auth' })
        .expect(201);

      const creadaBody = creada.body as unknown as RespuestaEmpresaTest;

      const res = await request(server)
        .post(`/api/v1/empresas/${creadaBody.id}/suspensiones`)
        .set('x-actor-id', 'admin-1')
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', creadaBody.id)
        .set('if-match', '"1"')
        .expect(403);

      expect((res.body as unknown as RespuestaErrorTest).code).toBe(
        'EMP_ACCESO_DENEGADO',
      );
    });

    it('rechaza transición si la versión If-Match no coincide con 409', async () => {
      const creada = await request(server)
        .post('/api/v1/empresas')
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .send({ nombre: 'Empresa Version', alias: 'empresa-ver' })
        .expect(201);

      const creadaBody = creada.body as unknown as RespuestaEmpresaTest;

      const res = await request(server)
        .post(`/api/v1/empresas/${creadaBody.id}/suspensiones`)
        .set('x-actor-id', 'superadmin-1')
        .set('x-actor-rol', 'SuperAdministrador')
        .set('if-match', '"99"')
        .expect(409);

      expect((res.body as unknown as RespuestaErrorTest).code).toBe(
        'EMP_VERSION_CONFLICTO',
      );
    });
  });
});
