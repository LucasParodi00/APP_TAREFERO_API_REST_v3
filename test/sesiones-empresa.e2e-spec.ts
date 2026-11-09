import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http';
import { AppModule } from '../src/app.module';
import { AppDataSource } from '../src/infraestructura/persistencia/data-source';

interface RespuestaInicioSesionTest {
  tokenAcceso: string;
  tokenRenovacion: string;
  empresaId: string;
  cuentaId: string;
  sesionId: string;
  expiraAccesoEn: string;
  expiraRenovacionEn: string;
}

interface RespuestaRenovacionTest {
  tokenAcceso: string;
  tokenRenovacion: string;
  empresaId: string;
  cuentaId: string;
  sesionId: string;
  expiraAccesoEn: string;
  expiraRenovacionEn: string;
}

interface RespuestaErrorTest {
  code: string;
  detail: string;
  status: number;
}

describe('Sesiones de Empresa y Autorización (e2e) — PLAN-ACC-0003', () => {
  let app: INestApplication;
  let server: Server;

  const superAdminId = 'c7e0c457-3f9b-4bf4-bb85-055f69e6b360';
  const empresaId = '550e8400-e29b-41d4-a716-446655440000';
  const empresaCerradaId = '550e8400-e29b-41d4-a716-446655440002';
  const otraEmpresaId = '660e8400-e29b-41d4-a716-446655440001';

  let cuentaAdminId: string;
  let cuentaCapatazSoloWebId: string;
  const contraseniaAdmin = 'AdminClaveSegura2026!';
  const contraseniaCapataz = 'CapatazSeguro2026!';

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

    // Sembrar superadmin y empresas
    await AppDataSource.query(`
      INSERT INTO usuarios_plataforma (id, rol, activo, creado_en)
      VALUES ('${superAdminId}', 'SUPER_ADMINISTRADOR', true, NOW());

      INSERT INTO empresas (id, nombre, alias, estado, creado_en, creado_por, actualizado_en, actualizado_por, version)
      VALUES 
        ('${empresaId}', 'Yerba San Pedro', 'yerba-san-pedro', 'ACTIVA', NOW(), 'superadmin-1', NOW(), 'superadmin-1', 1),
        ('${otraEmpresaId}', 'Yerba Otra', 'yerba-otra', 'ACTIVA', NOW(), 'superadmin-1', NOW(), 'superadmin-1', 1),
        ('${empresaCerradaId}', 'Yerba Cerrada', 'yerba-cerrada', 'CERRADA', NOW(), 'superadmin-1', NOW(), 'superadmin-1', 1);

      INSERT INTO configuraciones_empresa (id, empresa_id, pais_referencia, zona_horaria, moneda_principal, creado_en, creado_por, actualizado_en, actualizado_por, version)
      VALUES 
        ('550e8400-e29b-41d4-a716-446655440099', '${empresaId}', 'AR', 'America/Argentina/Buenos_Aires', 'ARS', NOW(), 'superadmin-1', NOW(), 'superadmin-1', 1),
        ('660e8400-e29b-41d4-a716-446655440098', '${otraEmpresaId}', 'AR', 'America/Argentina/Buenos_Aires', 'ARS', NOW(), 'superadmin-1', NOW(), 'superadmin-1', 1),
        ('550e8400-e29b-41d4-a716-446655440097', '${empresaCerradaId}', 'AR', 'America/Argentina/Buenos_Aires', 'ARS', NOW(), 'superadmin-1', NOW(), 'superadmin-1', 1);
    `);

    // Crear cuenta Administrador (inicial)
    const resAdmin = await request(server)
      .post(`/api/v1/empresas/${empresaId}/cuentas-empresa`)
      .set('x-actor-id', superAdminId)
      .set('x-actor-rol', 'SuperAdministrador')
      .send({
        personaId: '11111111-1111-1111-1111-111111111111',
        correoAcceso: 'admin@sanpedro.com',
        contrasenia: contraseniaAdmin,
        accesoWeb: true,
        accesoMovil: true,
        roles: ['ADMINISTRADOR'],
      })
      .expect(201);
    cuentaAdminId = (resAdmin.body as { id: string }).id;

    // Crear cuenta Capataz (solo WEB)
    const resCapataz = await request(server)
      .post(`/api/v1/empresas/${empresaId}/cuentas-empresa`)
      .set('x-actor-id', cuentaAdminId)
      .set('x-actor-rol', 'Administrador')
      .set('x-empresa-id', empresaId)
      .send({
        personaId: '22222222-2222-2222-2222-222222222222',
        correoAcceso: 'capataz@sanpedro.com',
        contrasenia: contraseniaCapataz,
        accesoWeb: true,
        accesoMovil: false,
        roles: ['CAPATAZ'],
      })
      .expect(201);
    cuentaCapatazSoloWebId = (resCapataz.body as { id: string }).id;
  });

  describe('ACC-UC-002 — Iniciar Sesión de Empresa', () => {
    it('@ACC-UC-002 @AC-01: Iniciar sesión con éxito devuelve tokens, roles y no-store', async () => {
      const res = await request(server)
        .post('/api/v1/sesiones-empresa')
        .send({
          aliasEmpresa: 'yerba-san-pedro',
          correoAcceso: 'admin@sanpedro.com',
          contrasenia: contraseniaAdmin,
          canal: 'WEB',
        })
        .expect(200);

      const body = res.body as unknown as RespuestaInicioSesionTest;
      expect(body.tokenAcceso).toBeDefined();
      expect(body.tokenRenovacion).toBeDefined();
      expect(body.cuentaId).toBe(cuentaAdminId);
      expect(body.empresaId).toBe(empresaId);
      expect(body.sesionId).toBeDefined();
      expect(body.expiraAccesoEn).toBeDefined();
      expect(body.expiraRenovacionEn).toBeDefined();
      expect(res.headers['cache-control']).toBe('no-store');
    });

    it('@ACC-UC-002 @AC-02: Rechazar credenciales inválidas con 401 ACC_AUTENTICACION_INVALIDA', async () => {
      const res = await request(server)
        .post('/api/v1/sesiones-empresa')
        .send({
          aliasEmpresa: 'yerba-san-pedro',
          correoAcceso: 'admin@sanpedro.com',
          contrasenia: 'ClaveIncorrecta123!',
          canal: 'WEB',
        })
        .expect(401);

      const err = res.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_AUTENTICACION_INVALIDA');
    });

    it('@ACC-UC-002 @AC-03: Rechazar canal no habilitado con 422 ACC_CANAL_NO_HABILITADO', async () => {
      const res = await request(server)
        .post('/api/v1/sesiones-empresa')
        .send({
          aliasEmpresa: 'yerba-san-pedro',
          correoAcceso: 'capataz@sanpedro.com',
          contrasenia: contraseniaCapataz,
          canal: 'MOVIL',
        })
        .expect(422);

      const err = res.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_CANAL_NO_HABILITADO');
    });

    it('@ACC-UC-002 @AC-04: Rechazar cuenta en estado SUSPENDIDA con 403 ACC_ACCESO_NO_HABILITADO', async () => {
      // Suspender cuenta capataz
      await request(server)
        .post(
          `/api/v1/empresas/${empresaId}/cuentas-empresa/${cuentaCapatazSoloWebId}/suspensiones`,
        )
        .set('x-actor-id', cuentaAdminId)
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', empresaId)
        .set('if-match', '"acc-1"')
        .expect(200);

      const res = await request(server)
        .post('/api/v1/sesiones-empresa')
        .send({
          aliasEmpresa: 'yerba-san-pedro',
          correoAcceso: 'capataz@sanpedro.com',
          contrasenia: contraseniaCapataz,
          canal: 'WEB',
        })
        .expect(403);

      const err = res.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_ACCESO_NO_HABILITADO');
    });

    it('@ACC-UC-002 @AC-05: Rechazar inicio en empresa inexistente con 401 ACC_AUTENTICACION_INVALIDA', async () => {
      const res = await request(server)
        .post('/api/v1/sesiones-empresa')
        .send({
          aliasEmpresa: 'empresa-fantasma',
          correoAcceso: 'admin@sanpedro.com',
          contrasenia: contraseniaAdmin,
          canal: 'WEB',
        })
        .expect(401);

      const err = res.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_AUTENTICACION_INVALIDA');
    });

    it('@ACC-UC-002 @AC-06: Rechazar inicio en empresa CERRADA con 403 ACC_ACCESO_DENEGADO', async () => {
      const res = await request(server)
        .post('/api/v1/sesiones-empresa')
        .send({
          aliasEmpresa: 'yerba-cerrada',
          correoAcceso: 'admin@sanpedro.com',
          contrasenia: contraseniaAdmin,
          canal: 'WEB',
        })
        .expect(403);

      const err = res.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_ACCESO_DENEGADO');
    });
  });

  describe('ACC-UC-009 — Renovar Sesión de Empresa', () => {
    it('@ACC-UC-009 @AC-01: Renovar sesión vigente entrega nuevo token de acceso y renovación', async () => {
      // 1. Iniciar sesión
      const loginRes = await request(server)
        .post('/api/v1/sesiones-empresa')
        .send({
          aliasEmpresa: 'yerba-san-pedro',
          correoAcceso: 'admin@sanpedro.com',
          contrasenia: contraseniaAdmin,
          canal: 'WEB',
        })
        .expect(200);

      const loginBody = loginRes.body as unknown as RespuestaInicioSesionTest;

      // 2. Renovar sesión
      const renewRes = await request(server)
        .post('/api/v1/sesiones-empresa/renovaciones')
        .send({
          tokenRenovacion: loginBody.tokenRenovacion,
          canal: 'WEB',
        })
        .expect(200);

      const renewBody = renewRes.body as unknown as RespuestaRenovacionTest;
      expect(renewBody.tokenAcceso).toBeDefined();
      expect(renewBody.tokenRenovacion).toBeDefined();
      expect(renewBody.tokenRenovacion).not.toBe(loginBody.tokenRenovacion);
      expect(renewBody.expiraAccesoEn).toBeDefined();
      expect(renewRes.headers['cache-control']).toBe('no-store');
    });

    it('@ACC-UC-009 @AC-02: Detección de reutilización (ADR-0006) revoca la sesión y retorna 401 ACC_RENOVACION_INVALIDA', async () => {
      // 1. Iniciar sesión
      const loginRes = await request(server)
        .post('/api/v1/sesiones-empresa')
        .send({
          aliasEmpresa: 'yerba-san-pedro',
          correoAcceso: 'admin@sanpedro.com',
          contrasenia: contraseniaAdmin,
          canal: 'WEB',
        })
        .expect(200);

      const loginBody = loginRes.body as unknown as RespuestaInicioSesionTest;
      const primerTokenRenovacion = loginBody.tokenRenovacion;

      // 2. Renovar primera vez legítima
      await request(server)
        .post('/api/v1/sesiones-empresa/renovaciones')
        .send({
          tokenRenovacion: primerTokenRenovacion,
          canal: 'WEB',
        })
        .expect(200);

      // 3. Reintentar con el MISMO token anterior (reutilización / ataque de replay)
      const resReuso = await request(server)
        .post('/api/v1/sesiones-empresa/renovaciones')
        .send({
          tokenRenovacion: primerTokenRenovacion,
          canal: 'WEB',
        })
        .expect(401);

      const err = resReuso.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_RENOVACION_INVALIDA');

      // 4. La sesión completa debe haber sido revocada; un intento con cualquier token falla
      await request(server)
        .post('/api/v1/sesiones-empresa/renovaciones')
        .send({
          tokenRenovacion: primerTokenRenovacion,
          canal: 'WEB',
        })
        .expect(401);
    });

    it('@ACC-UC-009 @AC-03: Renovar con token inválido o corrupto devuelve 401 ACC_RENOVACION_INVALIDA', async () => {
      const res = await request(server)
        .post('/api/v1/sesiones-empresa/renovaciones')
        .send({
          tokenRenovacion: 'token-falso-o-inexistente',
        })
        .expect(401);

      const err = res.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_RENOVACION_INVALIDA');
    });

    it('@ACC-UC-009 @AC-04: Intentar renovar sesión si la cuenta fue suspendida retorna 403 ACC_ACCESO_NO_HABILITADO', async () => {
      // 1. Iniciar sesión capataz
      const loginRes = await request(server)
        .post('/api/v1/sesiones-empresa')
        .send({
          aliasEmpresa: 'yerba-san-pedro',
          correoAcceso: 'capataz@sanpedro.com',
          contrasenia: contraseniaCapataz,
          canal: 'WEB',
        })
        .expect(200);

      const loginBody = loginRes.body as unknown as RespuestaInicioSesionTest;

      // 2. Suspender cuenta capataz
      await request(server)
        .post(
          `/api/v1/empresas/${empresaId}/cuentas-empresa/${cuentaCapatazSoloWebId}/suspensiones`,
        )
        .set('x-actor-id', cuentaAdminId)
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', empresaId)
        .set('if-match', '"acc-1"')
        .expect(200);

      // 3. Intentar renovar sesión
      const res = await request(server)
        .post('/api/v1/sesiones-empresa/renovaciones')
        .send({
          tokenRenovacion: loginBody.tokenRenovacion,
        })
        .expect(403);

      const err = res.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_ACCESO_NO_HABILITADO');
    });
  });

  describe('ACC-UC-003 — Validar Acceso Vigente mediante Token Bearer', () => {
    it('@ACC-UC-003 @AC-01: Token Bearer válido autentica peticiones a recursos protegidos', async () => {
      // 1. Iniciar sesión
      const loginRes = await request(server)
        .post('/api/v1/sesiones-empresa')
        .send({
          aliasEmpresa: 'yerba-san-pedro',
          correoAcceso: 'admin@sanpedro.com',
          contrasenia: contraseniaAdmin,
          canal: 'WEB',
        })
        .expect(200);

      const tokenAcceso = (
        loginRes.body as unknown as RespuestaInicioSesionTest
      ).tokenAcceso;

      // 2. Consultar cuenta propia usando Authorization: Bearer <tokenAcceso>
      const res = await request(server)
        .get(`/api/v1/empresas/${empresaId}/cuentas-empresa/${cuentaAdminId}`)
        .set('authorization', `Bearer ${tokenAcceso}`)
        .expect(200);

      const cuenta = res.body as { id: string; correoAcceso: string };
      expect(cuenta.id).toBe(cuentaAdminId);
      expect(cuenta.correoAcceso).toBe('admin@sanpedro.com');
    });

    it('@ACC-UC-003 @AC-02: Token Bearer manipulado devuelve 401 no autorizado', async () => {
      await request(server)
        .get(`/api/v1/empresas/${empresaId}/cuentas-empresa/${cuentaAdminId}`)
        .set('authorization', 'Bearer token.jwt.invalido')
        .expect(401);
    });
  });

  describe('ACC-UC-004 — Cambiar Contraseña Propia', () => {
    it('@ACC-UC-004 @AC-01: El titular cambia su propia contraseña con 204 y revoca sesiones previas (ACC-BR-014)', async () => {
      // Iniciar sesión para obtener token
      const loginRes = await request(server)
        .post('/api/v1/sesiones-empresa')
        .send({
          aliasEmpresa: 'yerba-san-pedro',
          correoAcceso: 'capataz@sanpedro.com',
          contrasenia: contraseniaCapataz,
          canal: 'WEB',
        })
        .expect(200);

      const loginBody = loginRes.body as unknown as RespuestaInicioSesionTest;
      const nuevaContrasenia = 'NuevaClaveSuperSegura2026!';

      // Cambiar contraseña
      await request(server)
        .post(
          `/api/v1/empresas/${empresaId}/cuentas-empresa/${cuentaCapatazSoloWebId}/cambios-contrasenia`,
        )
        .set('authorization', `Bearer ${loginBody.tokenAcceso}`)
        .send({
          contraseniaActual: contraseniaCapataz,
          contraseniaNueva: nuevaContrasenia,
        })
        .expect(204);

      // Sesión previa queda revocada: renovar falla con 401
      await request(server)
        .post('/api/v1/sesiones-empresa/renovaciones')
        .send({
          tokenRenovacion: loginBody.tokenRenovacion,
        })
        .expect(401);

      // Iniciar sesión con la nueva contraseña funciona
      await request(server)
        .post('/api/v1/sesiones-empresa')
        .send({
          aliasEmpresa: 'yerba-san-pedro',
          correoAcceso: 'capataz@sanpedro.com',
          contrasenia: nuevaContrasenia,
          canal: 'WEB',
        })
        .expect(200);
    });

    it('@ACC-UC-004 @AC-02: Rechazar cambio con contraseña actual errónea con 403 ACC_CAMBIO_PROPIO_NO_AUTORIZADO', async () => {
      const res = await request(server)
        .post(
          `/api/v1/empresas/${empresaId}/cuentas-empresa/${cuentaAdminId}/cambios-contrasenia`,
        )
        .set('x-actor-id', cuentaAdminId)
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', empresaId)
        .send({
          contraseniaActual: 'ContraseniaErronea123!',
          contraseniaNueva: 'NuevaClaveSegura999!',
        })
        .expect(403);

      const err = res.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_CAMBIO_PROPIO_NO_AUTORIZADO');
    });

    it('@ACC-UC-004 @AC-03: Rechazar nueva contraseña menor a 15 caracteres con 422 ACC_CONTRASENIA_INVALIDA', async () => {
      const res = await request(server)
        .post(
          `/api/v1/empresas/${empresaId}/cuentas-empresa/${cuentaAdminId}/cambios-contrasenia`,
        )
        .set('x-actor-id', cuentaAdminId)
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', empresaId)
        .send({
          contraseniaActual: contraseniaAdmin,
          contraseniaNueva: 'Corta1234!',
        })
        .expect(422);

      const err = res.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_CONTRASENIA_INVALIDA');
    });

    it('@ACC-UC-004 @AC-04: Rechazar intento de un actor de cambiar la clave de otra cuenta con 403 ACC_CAMBIO_PROPIO_NO_AUTORIZADO', async () => {
      const res = await request(server)
        .post(
          `/api/v1/empresas/${empresaId}/cuentas-empresa/${cuentaCapatazSoloWebId}/cambios-contrasenia`,
        )
        .set('x-actor-id', cuentaAdminId)
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', empresaId)
        .send({
          contraseniaActual: contraseniaCapataz,
          contraseniaNueva: 'NuevaClaveSegura2026!',
        })
        .expect(403);

      const err = res.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_CAMBIO_PROPIO_NO_AUTORIZADO');
    });
  });

  describe('ACC-UC-005 — Restablecer Contraseña Cuenta de Empresa', () => {
    it('@ACC-UC-005 @AC-01: Administrador restablece contraseña de cuenta subordinada con 204 y revoca sesiones (ACC-BR-014)', async () => {
      // 1. Iniciar sesión capataz
      const loginRes = await request(server)
        .post('/api/v1/sesiones-empresa')
        .send({
          aliasEmpresa: 'yerba-san-pedro',
          correoAcceso: 'capataz@sanpedro.com',
          contrasenia: contraseniaCapataz,
          canal: 'WEB',
        })
        .expect(200);

      const loginBody = loginRes.body as unknown as RespuestaInicioSesionTest;
      const claveRestablecida = 'ClaveRestablecidaAdmin1!';

      // 2. Administrador restablece la contraseña
      await request(server)
        .post(
          `/api/v1/empresas/${empresaId}/cuentas-empresa/${cuentaCapatazSoloWebId}/restablecimientos-contrasenia`,
        )
        .set('x-actor-id', cuentaAdminId)
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', empresaId)
        .send({
          contraseniaNueva: claveRestablecida,
        })
        .expect(204);

      // 3. Sesión previa de capataz debe estar revocada
      await request(server)
        .post('/api/v1/sesiones-empresa/renovaciones')
        .send({
          tokenRenovacion: loginBody.tokenRenovacion,
        })
        .expect(401);

      // 4. Capataz puede iniciar sesión con la clave nueva
      await request(server)
        .post('/api/v1/sesiones-empresa')
        .send({
          aliasEmpresa: 'yerba-san-pedro',
          correoAcceso: 'capataz@sanpedro.com',
          contrasenia: claveRestablecida,
          canal: 'WEB',
        })
        .expect(200);
    });

    it('@ACC-UC-005 @AC-02: Administrador de otra Empresa recibe 403 ACC_RESTABLECIMIENTO_FUERA_DE_ALCANCE', async () => {
      const res = await request(server)
        .post(
          `/api/v1/empresas/${empresaId}/cuentas-empresa/${cuentaCapatazSoloWebId}/restablecimientos-contrasenia`,
        )
        .set('x-actor-id', 'admin-otra-empresa')
        .set('x-actor-rol', 'Administrador')
        .set('x-empresa-id', otraEmpresaId)
        .send({
          contraseniaNueva: 'ClaveRestablecida999!',
        })
        .expect(403);

      const err = res.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_RESTABLECIMIENTO_FUERA_DE_ALCANCE');
    });

    it('@ACC-UC-005 @AC-03: SuperAdmin exige motivo de soporte con 403 ACC_CONTEXTO_SOPORTE_REQUERIDO', async () => {
      const res = await request(server)
        .post(
          `/api/v1/empresas/${empresaId}/cuentas-empresa/${cuentaAdminId}/restablecimientos-contrasenia`,
        )
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SuperAdministrador')
        .send({
          contraseniaNueva: 'ClaveSuperAdmin12345!',
        })
        .expect(403);

      const err = res.body as unknown as RespuestaErrorTest;
      expect(err.code).toBe('ACC_CONTEXTO_SOPORTE_REQUERIDO');
    });

    it('@ACC-UC-005 @AC-04: SuperAdmin con motivo de soporte restablece contraseña y audita intervención', async () => {
      const motivo =
        'Solicitud de auxilio telefónico del titular de la empresa';
      await request(server)
        .post(
          `/api/v1/empresas/${empresaId}/cuentas-empresa/${cuentaAdminId}/restablecimientos-contrasenia`,
        )
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SuperAdministrador')
        .set('motivo-soporte', encodeURIComponent(motivo))
        .send({
          contraseniaNueva: 'ClaveSuperAdmin12345!',
        })
        .expect(204);

      // Verificar que se auditó la intervención
      const auditoria = await AppDataSource.query<
        Array<{ usuario_plataforma_id: string }>
      >(
        `SELECT * FROM intervenciones_soporte WHERE empresa_id = '${empresaId}' AND motivo = '${motivo}';`,
      );
      expect(auditoria.length).toBe(1);
      expect(auditoria[0].usuario_plataforma_id).toBe(superAdminId);
    });
  });
});
