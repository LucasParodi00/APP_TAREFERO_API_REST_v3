import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AppDataSource } from '../src/infraestructura/persistencia/data-source';
import type { Server } from 'http';

interface RespuestaCuentaTest {
  id: string;
  empresaId: string;
  personaId: string;
  correoAcceso: string;
  accesoWeb: boolean;
  accesoMovil: boolean;
  roles: string[];
  estado: string;
  version: number;
}

interface RespuestaListadoTest {
  datos: RespuestaCuentaTest[];
  paginacion: { total: number; limite: number; desplazamiento: number };
}

interface RespuestaErrorTest {
  type: string;
  title: string;
  status: number;
  detail: string;
  code: string;
}

describe('Cuentas de Empresa (e2e) — Casos de uso y Aceptación (PLAN-ACC-0002)', () => {
  let app: INestApplication;
  let server: Server;

  const superAdminId = 'c7e0c457-3f9b-4bf4-bb85-055f69e6b360';
  const empresaId = '550e8400-e29b-41d4-a716-446655440000';
  const otraEmpresaId = '660e8400-e29b-41d4-a716-446655440001';

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    await AppDataSource.runMigrations();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  beforeEach(async () => {
    await AppDataSource.query(
      'TRUNCATE TABLE huellas_renovacion_sesion, sesiones_empresa, cuentas_empresa, registros_idempotencia_acc, intervenciones_soporte, usuarios_plataforma, configuraciones_empresa, empresas CASCADE;',
    );

    // Insertar empresas de prueba con sus configuraciones y usuario plataforma
    await AppDataSource.query(`
      INSERT INTO usuarios_plataforma (id, rol, activo, creado_en)
      VALUES ('${superAdminId}', 'SUPER_ADMINISTRADOR', true, NOW());

      INSERT INTO empresas (id, nombre, alias, estado, creado_en, creado_por, actualizado_en, actualizado_por, version)
      VALUES 
        ('${empresaId}', 'Yerba San Pedro', 'yerba-san-pedro', 'ACTIVA', NOW(), 'superadmin-1', NOW(), 'superadmin-1', 1),
        ('${otraEmpresaId}', 'Yerba Otra', 'yerba-otra', 'ACTIVA', NOW(), 'superadmin-1', NOW(), 'superadmin-1', 1);

      INSERT INTO configuraciones_empresa (id, empresa_id, pais_referencia, zona_horaria, moneda_principal, creado_en, creado_por, actualizado_en, actualizado_por, version)
      VALUES 
        ('550e8400-e29b-41d4-a716-446655440099', '${empresaId}', 'AR', 'America/Argentina/Buenos_Aires', 'ARS', NOW(), 'superadmin-1', NOW(), 'superadmin-1', 1),
        ('660e8400-e29b-41d4-a716-446655440099', '${otraEmpresaId}', 'AR', 'America/Argentina/Buenos_Aires', 'ARS', NOW(), 'superadmin-1', NOW(), 'superadmin-1', 1);
    `);
  });

  describe('ACC-UC-001 — Habilitar Cuenta de Empresa', () => {
    it('@ACC-UC-001 @AC-01: SuperAdmin realiza alta inicial de Administrador sin motivo de soporte', async () => {
      const res = await request(server)
        .post(`/api/v1/empresas/${empresaId}/cuentas-empresa`)
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SuperAdministrador')
        .send({
          personaId: '11111111-1111-1111-1111-111111111111',
          correoAcceso: '  Admin@SanPedro.com  ',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: true,
          accesoMovil: false,
          roles: ['ADMINISTRADOR'],
        })
        .expect(201);

      const body = res.body as unknown as RespuestaCuentaTest;
      expect(body.id).toBeDefined();
      expect(body.correoAcceso).toBe('admin@sanpedro.com');
      expect(body.estado).toBe('ACTIVA');
      expect(body.version).toBe(1);
      expect(res.headers['etag']).toBe('"acc-1"');
      expect(res.headers['cache-control']).toBe('no-store');
    });

    it('@ACC-UC-001 @AC-02: Alta posterior por SuperAdmin exige motivo de soporte con ACC_CONTEXTO_SOPORTE_REQUERIDO', async () => {
      // 1. Alta inicial
      await request(server)
        .post(`/api/v1/empresas/${empresaId}/cuentas-empresa`)
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SuperAdministrador')
        .send({
          personaId: '11111111-1111-1111-1111-111111111111',
          correoAcceso: 'admin@sanpedro.com',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: true,
          accesoMovil: false,
          roles: ['ADMINISTRADOR'],
        })
        .expect(201);

      // 2. Alta posterior sin motivo
      const res = await request(server)
        .post(`/api/v1/empresas/${empresaId}/cuentas-empresa`)
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SuperAdministrador')
        .send({
          personaId: '22222222-2222-2222-2222-222222222222',
          correoAcceso: 'capataz@sanpedro.com',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: true,
          accesoMovil: true,
          roles: ['CAPATAZ'],
        })
        .expect(403);

      const err = res.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_CONTEXTO_SOPORTE_REQUERIDO');
    });

    it('@ACC-UC-001 @AC-03: Alta posterior por SuperAdmin con motivo de soporte es autorizada y auditada', async () => {
      // 1. Alta inicial
      await request(server)
        .post(`/api/v1/empresas/${empresaId}/cuentas-empresa`)
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SuperAdministrador')
        .send({
          personaId: '11111111-1111-1111-1111-111111111111',
          correoAcceso: 'admin@sanpedro.com',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: true,
          accesoMovil: false,
          roles: ['ADMINISTRADOR'],
        })
        .expect(201);

      // 2. Alta posterior con motivo
      const res = await request(server)
        .post(`/api/v1/empresas/${empresaId}/cuentas-empresa`)
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SuperAdministrador')
        .set(
          'motivo-soporte',
          encodeURIComponent('Solicitud formal de alta de capataz'),
        )
        .send({
          personaId: '22222222-2222-2222-2222-222222222222',
          correoAcceso: 'capataz@sanpedro.com',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: true,
          accesoMovil: true,
          roles: ['CAPATAZ'],
        })
        .expect(201);

      const body = res.body as unknown as RespuestaCuentaTest;
      expect(body.correoAcceso).toBe('capataz@sanpedro.com');
    });

    it('@ACC-UC-001 @AC-04: Administrador de la Empresa habilita cuenta ordinaria', async () => {
      const res = await request(server)
        .post(`/api/v1/empresas/${empresaId}/cuentas-empresa`)
        .set('x-actor-id', 'admin-san-pedro')
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', empresaId)
        .send({
          personaId: '33333333-3333-3333-3333-333333333333',
          correoAcceso: 'empleado@sanpedro.com',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: false,
          accesoMovil: true,
          roles: ['EMPLEADO'],
        })
        .expect(201);

      const body = res.body as unknown as RespuestaCuentaTest;
      expect(body.roles).toEqual(['EMPLEADO']);
      expect(body.accesoMovil).toBe(true);
    });

    it('@ACC-UC-001 @AC-05: Administrador intenta operar en otra Empresa y recibe 403 ACC_EMPRESA_FUERA_DE_ALCANCE', async () => {
      const res = await request(server)
        .post(`/api/v1/empresas/${otraEmpresaId}/cuentas-empresa`)
        .set('x-actor-id', 'admin-san-pedro')
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', empresaId)
        .send({
          personaId: '33333333-3333-3333-3333-333333333333',
          correoAcceso: 'empleado@sanpedro.com',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: false,
          accesoMovil: true,
          roles: ['EMPLEADO'],
        })
        .expect(403);

      const err = res.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_EMPRESA_FUERA_DE_ALCANCE');
    });

    it('@ACC-UC-001 @AC-06: Rechazar rol de plataforma SUPER_ADMINISTRADOR para Cuenta de Empresa con 422 ACC_ROL_NO_ADMITIDO', async () => {
      const res = await request(server)
        .post(`/api/v1/empresas/${empresaId}/cuentas-empresa`)
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SuperAdministrador')
        .send({
          personaId: '11111111-1111-1111-1111-111111111111',
          correoAcceso: 'admin@sanpedro.com',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: true,
          accesoMovil: true,
          roles: ['SUPER_ADMINISTRADOR'],
        })
        .expect(422);

      const err = res.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_ROL_NO_ADMITIDO');
    });

    it('@ACC-UC-001 @AC-07: Rechazar cuenta sin canales habilitados con 422 ACC_CANAL_NO_HABILITADO', async () => {
      const res = await request(server)
        .post(`/api/v1/empresas/${empresaId}/cuentas-empresa`)
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SuperAdministrador')
        .send({
          personaId: '11111111-1111-1111-1111-111111111111',
          correoAcceso: 'admin@sanpedro.com',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: false,
          accesoMovil: false,
          roles: ['ADMINISTRADOR'],
        })
        .expect(422);

      const err = res.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_CANAL_NO_HABILITADO');
    });

    it('@ACC-UC-001 @AC-08: Rechazar correo duplicado en la misma Empresa con 409 ACC_CORREO_DUPLICADO', async () => {
      await request(server)
        .post(`/api/v1/empresas/${empresaId}/cuentas-empresa`)
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SuperAdministrador')
        .send({
          personaId: '11111111-1111-1111-1111-111111111111',
          correoAcceso: 'usuario@sanpedro.com',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: true,
          accesoMovil: false,
          roles: ['ADMINISTRADOR'],
        })
        .expect(201);

      const res = await request(server)
        .post(`/api/v1/empresas/${empresaId}/cuentas-empresa`)
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SuperAdministrador')
        .set('motivo-soporte', 'Reintento con mismo correo')
        .send({
          personaId: '22222222-2222-2222-2222-222222222222',
          correoAcceso: '  USUARIO@sanpedro.com ',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: true,
          accesoMovil: false,
          roles: ['CAPATAZ'],
        })
        .expect(409);

      const err = res.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_CORREO_DUPLICADO');
    });

    it('@ACC-UC-001 @AC-09: Rechazar persona duplicada en la misma Empresa con 409 ACC_CUENTA_PERSONA_DUPLICADA', async () => {
      await request(server)
        .post(`/api/v1/empresas/${empresaId}/cuentas-empresa`)
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SuperAdministrador')
        .send({
          personaId: '11111111-1111-1111-1111-111111111111',
          correoAcceso: 'usuario1@sanpedro.com',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: true,
          accesoMovil: false,
          roles: ['ADMINISTRADOR'],
        })
        .expect(201);

      const res = await request(server)
        .post(`/api/v1/empresas/${empresaId}/cuentas-empresa`)
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SuperAdministrador')
        .set('motivo-soporte', 'Misma persona con otro correo')
        .send({
          personaId: '11111111-1111-1111-1111-111111111111',
          correoAcceso: 'usuario2@sanpedro.com',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: true,
          accesoMovil: false,
          roles: ['CAPATAZ'],
        })
        .expect(409);

      const err = res.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_CUENTA_PERSONA_DUPLICADA');
    });

    it('@ACC-UC-001 @AC-10: Rechazar contraseña menor a 15 caracteres con 422 ACC_CONTRASENIA_INVALIDA', async () => {
      const res = await request(server)
        .post(`/api/v1/empresas/${empresaId}/cuentas-empresa`)
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SuperAdministrador')
        .send({
          personaId: '11111111-1111-1111-1111-111111111111',
          correoAcceso: 'admin@sanpedro.com',
          contrasenia: '12345678901234',
          accesoWeb: true,
          accesoMovil: false,
          roles: ['ADMINISTRADOR'],
        })
        .expect(422);

      const err = res.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_CONTRASENIA_INVALIDA');
    });

    it('@ACC-UC-001 @AC-11: Idempotency-Key devuelve misma respuesta ante reintento', async () => {
      const payload = {
        personaId: '11111111-1111-1111-1111-111111111111',
        correoAcceso: 'admin@sanpedro.com',
        contrasenia: 'ClaveSegura12345!',
        accesoWeb: true,
        accesoMovil: false,
        roles: ['ADMINISTRADOR'],
      };

      const res1 = await request(server)
        .post(`/api/v1/empresas/${empresaId}/cuentas-empresa`)
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SuperAdministrador')
        .set('idempotency-key', 'idemp-alta-1')
        .send(payload)
        .expect(201);

      const body1 = res1.body as unknown as RespuestaCuentaTest;

      const res2 = await request(server)
        .post(`/api/v1/empresas/${empresaId}/cuentas-empresa`)
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SuperAdministrador')
        .set('idempotency-key', 'idemp-alta-1')
        .send(payload)
        .expect(201);

      const body2 = res2.body as unknown as RespuestaCuentaTest;
      expect(body2.id).toBe(body1.id);
    });
  });

  describe('ACC-UC-008 — Consultar y Listar Cuentas de Empresa', () => {
    let cuentaCreadaId: string;

    beforeEach(async () => {
      const res = await request(server)
        .post(`/api/v1/empresas/${empresaId}/cuentas-empresa`)
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SuperAdministrador')
        .send({
          personaId: '11111111-1111-1111-1111-111111111111',
          correoAcceso: 'admin@sanpedro.com',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: true,
          accesoMovil: false,
          roles: ['ADMINISTRADOR'],
        })
        .expect(201);

      cuentaCreadaId = (res.body as unknown as RespuestaCuentaTest).id;
    });

    it('@ACC-UC-008 @AC-01: Administrador consulta su propia cuenta con 200 y ETag', async () => {
      const res = await request(server)
        .get(`/api/v1/empresas/${empresaId}/cuentas-empresa/${cuentaCreadaId}`)
        .set('x-actor-id', 'admin-san-pedro')
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', empresaId)
        .expect(200);

      const body = res.body as unknown as RespuestaCuentaTest;
      expect(body.id).toBe(cuentaCreadaId);
      expect(body.correoAcceso).toBe('admin@sanpedro.com');
      expect(res.headers['etag']).toBe('"acc-1"');
      expect(res.headers['cache-control']).toBe('no-store');
    });

    it('@ACC-UC-008 @AC-02: Consultar cuenta inexistente devuelve 404 ACC_CUENTA_NO_ENCONTRADA', async () => {
      const res = await request(server)
        .get(
          `/api/v1/empresas/${empresaId}/cuentas-empresa/99999999-9999-9999-9999-999999999999`,
        )
        .set('x-actor-id', 'admin-san-pedro')
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', empresaId)
        .expect(404);

      const err = res.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_CUENTA_NO_ENCONTRADA');
    });

    it('@ACC-UC-008 @AC-03: Administrador lista cuentas de su Empresa con paginación', async () => {
      const res = await request(server)
        .get(
          `/api/v1/empresas/${empresaId}/cuentas-empresa?limite=10&desplazamiento=0`,
        )
        .set('x-actor-id', 'admin-san-pedro')
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', empresaId)
        .expect(200);

      const body = res.body as unknown as RespuestaListadoTest;
      expect(body.paginacion.total).toBe(1);
      expect(body.datos).toHaveLength(1);
      expect(body.datos[0].id).toBe(cuentaCreadaId);
    });
  });

  describe('ACC-UC-010 — Modificar Habilitación, Suspender y Reactivar', () => {
    let cuentaCreadaId: string;

    beforeEach(async () => {
      const res = await request(server)
        .post(`/api/v1/empresas/${empresaId}/cuentas-empresa`)
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SuperAdministrador')
        .send({
          personaId: '11111111-1111-1111-1111-111111111111',
          correoAcceso: 'admin@sanpedro.com',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: true,
          accesoMovil: false,
          roles: ['ADMINISTRADOR'],
        })
        .expect(201);

      cuentaCreadaId = (res.body as unknown as RespuestaCuentaTest).id;
    });

    it('@ACC-UC-010 @AC-01: Modificar canales y roles con If-Match devuelve 200 y actualiza ETag', async () => {
      const res = await request(server)
        .patch(
          `/api/v1/empresas/${empresaId}/cuentas-empresa/${cuentaCreadaId}`,
        )
        .set('x-actor-id', 'admin-san-pedro')
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', empresaId)
        .set('if-match', '"acc-1"')
        .send({
          accesoMovil: true,
          roles: ['ADMINISTRADOR', 'CAPATAZ'],
        })
        .expect(200);

      const body = res.body as unknown as RespuestaCuentaTest;
      expect(body.accesoMovil).toBe(true);
      expect(body.roles).toEqual(['ADMINISTRADOR', 'CAPATAZ']);
      expect(body.version).toBe(2);
      expect(res.headers['etag']).toBe('"acc-2"');
    });

    it('@ACC-UC-010 @AC-02: Conflicto de versión devuelve 409 ACC_VERSION_CONFLICTO', async () => {
      const res = await request(server)
        .patch(
          `/api/v1/empresas/${empresaId}/cuentas-empresa/${cuentaCreadaId}`,
        )
        .set('x-actor-id', 'admin-san-pedro')
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', empresaId)
        .set('if-match', '"acc-99"')
        .send({ accesoMovil: true })
        .expect(409);

      const err = res.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_VERSION_CONFLICTO');
    });

    it('@ACC-UC-010 @AC-03: Suspender cuenta activa devuelve 200 y estado SUSPENDIDA', async () => {
      const res = await request(server)
        .post(
          `/api/v1/empresas/${empresaId}/cuentas-empresa/${cuentaCreadaId}/suspensiones`,
        )
        .set('x-actor-id', 'admin-san-pedro')
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', empresaId)
        .set('if-match', '"acc-1"')
        .expect(200);

      const body = res.body as unknown as RespuestaCuentaTest;
      expect(body.estado).toBe('SUSPENDIDA');
      expect(body.version).toBe(2);
      expect(res.headers['etag']).toBe('"acc-2"');

      // Intentar suspenderla de nuevo falla con 422 ACC_TRANSICION_NO_PERMITIDA
      const resRepetida = await request(server)
        .post(
          `/api/v1/empresas/${empresaId}/cuentas-empresa/${cuentaCreadaId}/suspensiones`,
        )
        .set('x-actor-id', 'admin-san-pedro')
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', empresaId)
        .set('if-match', '"acc-2"')
        .expect(422);

      const err = resRepetida.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_TRANSICION_NO_PERMITIDA');
    });

    it('@ACC-UC-010 @AC-04: Reactivar cuenta suspendida devuelve 200 y estado ACTIVA', async () => {
      // 1. Suspender
      await request(server)
        .post(
          `/api/v1/empresas/${empresaId}/cuentas-empresa/${cuentaCreadaId}/suspensiones`,
        )
        .set('x-actor-id', 'admin-san-pedro')
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', empresaId)
        .set('if-match', '"acc-1"')
        .expect(200);

      // 2. Reactivar
      const res = await request(server)
        .post(
          `/api/v1/empresas/${empresaId}/cuentas-empresa/${cuentaCreadaId}/reactivaciones`,
        )
        .set('x-actor-id', 'admin-san-pedro')
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', empresaId)
        .set('if-match', '"acc-2"')
        .expect(200);

      const body = res.body as unknown as RespuestaCuentaTest;
      expect(body.estado).toBe('ACTIVA');
      expect(body.version).toBe(3);
      expect(res.headers['etag']).toBe('"acc-3"');

      // Intentar reactivarla cuando ya está activa falla con 422 ACC_TRANSICION_NO_PERMITIDA
      const resRepetida = await request(server)
        .post(
          `/api/v1/empresas/${empresaId}/cuentas-empresa/${cuentaCreadaId}/reactivaciones`,
        )
        .set('x-actor-id', 'admin-san-pedro')
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', empresaId)
        .set('if-match', '"acc-3"')
        .expect(422);

      const err = resRepetida.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_TRANSICION_NO_PERMITIDA');
    });
  });
});
