import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http';
import { AppModule } from '../src/app.module';
import { AppDataSource } from '../src/infraestructura/persistencia/data-source';

interface RespuestaSuperAdminTest {
  id: string;
  rol: string;
  activo: boolean;
}

interface RespuestaErrorTest {
  code: string;
}

interface RespuestaListadoIntervencionesTest {
  datos: Array<{
    id: string;
    ocurridaEn: string;
    actor: string;
  }>;
  paginacion: {
    limite: number;
    desplazamiento: number;
    total: number;
  };
}

describe('Identidad y Acceso (e2e) — Casos de uso y Aceptación (T06)', () => {
  let app: INestApplication;
  let server: Server;

  const superAdminId = 'c7e0c457-3f9b-4bf4-bb85-055f69e6b360';
  const empresaAId = '550e8400-e29b-41d4-a716-446655440000';
  const empresaBId = '660e8400-e29b-41d4-a716-446655440001';

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
    await AppDataSource.runMigrations();
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    await AppDataSource.query(
      'TRUNCATE TABLE registros_idempotencia_acc, intervenciones_soporte, usuarios_plataforma, configuraciones_empresa, empresas CASCADE;',
    );

    // Crear Empresa A y Empresa B con sus configuraciones
    await AppDataSource.query(`
      INSERT INTO empresas (id, nombre, alias, estado, creado_en, creado_por, actualizado_en, actualizado_por, version)
      VALUES 
        ('${empresaAId}', 'Empresa A', 'empresa-a', 'ACTIVA', NOW(), 'init', NOW(), 'init', 1),
        ('${empresaBId}', 'Empresa B', 'empresa-b', 'ACTIVA', NOW(), 'init', NOW(), 'init', 1);

      INSERT INTO configuraciones_empresa (id, empresa_id, pais_referencia, zona_horaria, moneda_principal, creado_en, creado_por, actualizado_en, actualizado_por, version)
      VALUES
        ('550e8400-e29b-41d4-a716-44665544000a', '${empresaAId}', 'AR', 'America/Argentina/Buenos_Aires', 'ARS', NOW(), 'init', NOW(), 'init', 1),
        ('660e8400-e29b-41d4-a716-44665544000b', '${empresaBId}', 'AR', 'America/Argentina/Buenos_Aires', 'ARS', NOW(), 'init', NOW(), 'init', 1);
    `);
  });

  describe('ACC-UC-006 — Crear un SuperAdministrador', () => {
    it('@ACC-UC-006 @AC-05: La inicialización registra el primer SuperAdministrador y un reintento se rechaza con ACC_INICIALIZACION_NO_PERMITIDA', async () => {
      // 1. Inicialización primer superadministrador
      const res1 = await request(server)
        .post('/api/v1/superadministradores')
        .send({ rol: 'SUPER_ADMINISTRADOR' })
        .expect(201);

      const body1 = res1.body as RespuestaSuperAdminTest;
      expect(body1.id).toBeDefined();
      expect(body1.rol).toBe('SUPER_ADMINISTRADOR');
      expect(body1.activo).toBe(true);

      // 2. Intentar inicializar de nuevo cuando ya está inicializada
      const res2 = await request(server)
        .post('/api/v1/superadministradores')
        .set('x-actor-rol', 'PROCESO_INICIALIZACION')
        .send({ rol: 'SUPER_ADMINISTRADOR' })
        .expect(409);

      expect((res2.body as RespuestaErrorTest).code).toBe(
        'ACC_INICIALIZACION_NO_PERMITIDA',
      );
    });

    it('@ACC-UC-006 @AC-01: Crear un SuperAdministrador por un actor autorizado', async () => {
      // Insertar primer superadministrador
      await AppDataSource.query(`
        INSERT INTO usuarios_plataforma (id, rol, activo, creado_en)
        VALUES ('${superAdminId}', 'SUPER_ADMINISTRADOR', true, NOW());
      `);

      const res = await request(server)
        .post('/api/v1/superadministradores')
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SUPER_ADMINISTRADOR')
        .send({ rol: 'SUPER_ADMINISTRADOR' })
        .expect(201);

      const body = res.body as RespuestaSuperAdminTest;
      expect(body.id).toBeDefined();
      expect(body.rol).toBe('SUPER_ADMINISTRADOR');
      expect(body.activo).toBe(true);
    });

    it('@ACC-UC-006 @AC-02: Rechazar una solicitud sin permiso con ACC_ACCESO_DENEGADO', async () => {
      // Insertar primer superadministrador
      await AppDataSource.query(`
        INSERT INTO usuarios_plataforma (id, rol, activo, creado_en)
        VALUES ('${superAdminId}', 'SUPER_ADMINISTRADOR', true, NOW());
      `);

      const res = await request(server)
        .post('/api/v1/superadministradores')
        .set('x-actor-id', 'admin-empresa')
        .set('x-actor-rol', 'ADMINISTRADOR')
        .send({ rol: 'SUPER_ADMINISTRADOR' })
        .expect(403);

      expect((res.body as RespuestaErrorTest).code).toBe('ACC_ACCESO_DENEGADO');
    });

    it('@ACC-UC-006 @AC-03: Rechazar un rol no admitido con ACC_ROL_NO_ADMITIDO', async () => {
      // Insertar primer superadministrador
      await AppDataSource.query(`
        INSERT INTO usuarios_plataforma (id, rol, activo, creado_en)
        VALUES ('${superAdminId}', 'SUPER_ADMINISTRADOR', true, NOW());
      `);

      const res = await request(server)
        .post('/api/v1/superadministradores')
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SUPER_ADMINISTRADOR')
        .send({ rol: 'ADMINISTRADOR' })
        .expect(422);

      expect((res.body as RespuestaErrorTest).code).toBe('ACC_ROL_NO_ADMITIDO');
    });

    it('Control de idempotencia con Idempotency-Key en alta de SuperAdministrador', async () => {
      await AppDataSource.query(`
        INSERT INTO usuarios_plataforma (id, rol, activo, creado_en)
        VALUES ('${superAdminId}', 'SUPER_ADMINISTRADOR', true, NOW());
      `);

      const key = 'idem-superadmin-1';
      const res1 = await request(server)
        .post('/api/v1/superadministradores')
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SUPER_ADMINISTRADOR')
        .set('idempotency-key', key)
        .send({ rol: 'SUPER_ADMINISTRADOR' })
        .expect(201);

      // Reintento con misma clave y mismo payload -> mismo id
      const res2 = await request(server)
        .post('/api/v1/superadministradores')
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SUPER_ADMINISTRADOR')
        .set('idempotency-key', key)
        .send({ rol: 'SUPER_ADMINISTRADOR' })
        .expect(201);

      const body1 = res1.body as RespuestaSuperAdminTest;
      const body2 = res2.body as RespuestaSuperAdminTest;
      expect(body1.id).toBe(body2.id);

      // Reintento con misma clave y payload incompatible -> 409 ACC_IDEMPOTENCIA_CONFLICTO
      const res3 = await request(server)
        .post('/api/v1/superadministradores')
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SUPER_ADMINISTRADOR')
        .set('idempotency-key', key)
        .send({ rol: 'CAPATAZ' })
        .expect(409);

      expect((res3.body as RespuestaErrorTest).code).toBe(
        'ACC_IDEMPOTENCIA_CONFLICTO',
      );
    });
  });

  describe('ACC-UC-011 y ACC-UC-007 — Consultar intervenciones de soporte', () => {
    beforeEach(async () => {
      // SuperAdministrador
      await AppDataSource.query(`
        INSERT INTO usuarios_plataforma (id, rol, activo, creado_en)
        VALUES ('${superAdminId}', 'SUPER_ADMINISTRADOR', true, NOW());
      `);

      // 2 intervenciones preexistentes en Empresa A
      await AppDataSource.query(`
        INSERT INTO intervenciones_soporte (id, usuario_plataforma_id, empresa_id, motivo, sesion_id, solicitud_id, ocurrida_en)
        VALUES 
          ('11111111-1111-1111-1111-111111111111', '${superAdminId}', '${empresaAId}', 'Diagnóstico de sincronización', 'ses-1', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '2026-11-08T10:00:00Z'),
          ('22222222-2222-2222-2222-222222222222', '${superAdminId}', '${empresaAId}', 'Corrección de parámetros', 'ses-2', 'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e', '2026-11-09T10:00:00Z');
      `);
    });

    it('@ACC-UC-011 @AC-01: Administrador consulta intervenciones de su Empresa y ve proyección como Soporte de plataforma', async () => {
      const res = await request(server)
        .get(`/api/v1/empresas/${empresaAId}/intervenciones-soporte`)
        .set('x-actor-id', 'admin-a')
        .set('x-actor-rol', 'ADMINISTRADOR')
        .set('x-empresa-id', empresaAId)
        .expect(200);

      const body = res.body as RespuestaListadoIntervencionesTest;
      expect(body.datos).toHaveLength(2);
      expect(body.paginacion.total).toBe(2);

      const primera = body.datos[0] as unknown as Record<string, unknown>;
      expect(primera.id).toBe('22222222-2222-2222-2222-222222222222');
      expect(primera.actor).toBe('Soporte de plataforma');
      expect(primera.usuarioPlataformaId).toBeUndefined();
      expect(primera.motivo).toBeUndefined();
      expect(primera.sesionId).toBeUndefined();
    });

    it('@ACC-UC-011 @AC-02: Rechazar consulta sin permiso con ACC_ACCESO_DENEGADO', async () => {
      const res = await request(server)
        .get(`/api/v1/empresas/${empresaAId}/intervenciones-soporte`)
        .set('x-actor-id', 'peon-1')
        .set('x-actor-rol', 'EMPLEADO')
        .set('x-empresa-id', empresaAId)
        .expect(403);

      expect((res.body as RespuestaErrorTest).code).toBe('ACC_ACCESO_DENEGADO');
    });

    it('@ACC-UC-011 @AC-03: Administrador de Empresa A intentando consultar Empresa B es rechazado con ACC_EMPRESA_FUERA_DE_ALCANCE', async () => {
      const res = await request(server)
        .get(`/api/v1/empresas/${empresaBId}/intervenciones-soporte`)
        .set('x-actor-id', 'admin-a')
        .set('x-actor-rol', 'ADMINISTRADOR')
        .set('x-empresa-id', empresaAId)
        .expect(403);

      expect((res.body as RespuestaErrorTest).code).toBe(
        'ACC_EMPRESA_FUERA_DE_ALCANCE',
      );
    });

    it('@ACC-UC-007 @AC-04: SuperAdministrador consulta sin Motivo-Soporte y es rechazado con ACC_CONTEXTO_SOPORTE_REQUERIDO', async () => {
      const res = await request(server)
        .get(`/api/v1/empresas/${empresaAId}/intervenciones-soporte`)
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SUPER_ADMINISTRADOR')
        .expect(403);

      expect((res.body as RespuestaErrorTest).code).toBe(
        'ACC_CONTEXTO_SOPORTE_REQUERIDO',
      );
    });

    it('@ACC-UC-007 @AC-01: SuperAdministrador consulta con Motivo-Soporte y registra intervención auditable', async () => {
      const motivo = 'Revision solicitada por la Empresa';
      const res = await request(server)
        .get(`/api/v1/empresas/${empresaAId}/intervenciones-soporte`)
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SUPER_ADMINISTRADOR')
        .set('motivo-soporte', encodeURIComponent(motivo))
        .expect(200);

      const body = res.body as RespuestaListadoIntervencionesTest;
      expect(body.datos).toHaveLength(3);
      expect(body.paginacion.total).toBe(3);

      // Comprobar que en base de datos quedó registrada la intervención con su motivo y actor real
      const intervencionesDb = await AppDataSource.query<
        Array<{ usuario_plataforma_id: string; empresa_id: string }>
      >(`
        SELECT * FROM intervenciones_soporte WHERE motivo = '${motivo}';
      `);
      expect(intervencionesDb).toHaveLength(1);
      expect(intervencionesDb[0].usuario_plataforma_id).toBe(superAdminId);
      expect(intervencionesDb[0].empresa_id).toBe(empresaAId);
    });

    it('@ACC-UC-007 @AC-05: SuperAdministrador con empresa destino inexistente se rechaza con ACC_EMPRESA_NO_ENCONTRADA', async () => {
      const empresaInexistente = '999e8400-e29b-41d4-a716-446655449999';
      const res = await request(server)
        .get(`/api/v1/empresas/${empresaInexistente}/intervenciones-soporte`)
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SUPER_ADMINISTRADOR')
        .set('motivo-soporte', 'Diagnóstico')
        .expect(404);

      expect((res.body as RespuestaErrorTest).code).toBe(
        'ACC_EMPRESA_NO_ENCONTRADA',
      );
    });

    it('@ACC-UC-007 @AC-07: Motivo de soporte mayor a 1000 caracteres se rechaza con ACC_MOTIVO_SOPORTE_INVALIDO', async () => {
      const motivoLargo = 'm'.repeat(1001);
      const res = await request(server)
        .get(`/api/v1/empresas/${empresaAId}/intervenciones-soporte`)
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SUPER_ADMINISTRADOR')
        .set('motivo-soporte', motivoLargo)
        .expect(422);

      expect((res.body as RespuestaErrorTest).code).toBe(
        'ACC_MOTIVO_SOPORTE_INVALIDO',
      );
    });

    it('Paginación y validación de parámetros de consulta', async () => {
      // Error 400 en UUID inválido
      await request(server)
        .get('/api/v1/empresas/no-es-un-uuid/intervenciones-soporte')
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SUPER_ADMINISTRADOR')
        .set('motivo-soporte', 'Test')
        .expect(400);

      // Paginación con límite 1
      const resPaginada = await request(server)
        .get(
          `/api/v1/empresas/${empresaAId}/intervenciones-soporte?limite=1&desplazamiento=0`,
        )
        .set('x-actor-id', 'admin-a')
        .set('x-actor-rol', 'ADMINISTRADOR')
        .set('x-empresa-id', empresaAId)
        .expect(200);

      const paginadaBody =
        resPaginada.body as RespuestaListadoIntervencionesTest;
      expect(paginadaBody.datos).toHaveLength(1);
      expect(paginadaBody.paginacion.limite).toBe(1);
      expect(paginadaBody.paginacion.total).toBe(2);
    });
  });
});
