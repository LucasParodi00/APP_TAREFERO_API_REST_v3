import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http';
import { AppModule } from '../src/app.module';
import { AppDataSource } from '../src/infraestructura/persistencia/data-source';

interface RespuestaChacraTest {
  id: string;
  empresaId: string;
  nombre: string;
  nombreCorto: string;
  responsableNombre?: string | null;
  direccionTexto?: string | null;
  ubicacionGeografica?: {
    latitud: number;
    longitud: number;
  };
  estado: string;
  version: number;
}

interface RespuestaErrorTest {
  code: string;
}

describe('Territorio — Chacras (e2e) — Casos de uso y Aceptación (T06)', () => {
  let app: INestApplication;
  let server: Server;

  const empresaAId = '550e8400-e29b-41d4-a716-446655440000';
  const empresaBId = '660e8400-e29b-41d4-a716-446655440001';
  const superAdminId = 'c7e0c457-3f9b-4bf4-bb85-055f69e6b360';

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
      'TRUNCATE TABLE registros_idempotencia_ter, registros_idempotencia_acc, intervenciones_soporte, usuarios_plataforma, chacras, configuraciones_empresa, empresas CASCADE;',
    );

    // Empresas de prueba
    await AppDataSource.query(`
      INSERT INTO empresas (id, nombre, alias, estado, creado_en, creado_por, actualizado_en, actualizado_por, version)
      VALUES 
        ('${empresaAId}', 'Empresa A', 'empresa-a', 'ACTIVA', NOW(), 'init', NOW(), 'init', 1),
        ('${empresaBId}', 'Empresa B', 'empresa-b', 'ACTIVA', NOW(), 'init', NOW(), 'init', 1);

      INSERT INTO usuarios_plataforma (id, rol, activo, creado_en)
      VALUES ('${superAdminId}', 'SUPER_ADMINISTRADOR', true, NOW());
    `);
  });

  describe('TER-UC-001 — Registrar Chacra', () => {
    it('@TER-UC-001 @AC-01: Administrador registra Chacra en su Empresa con 201 y ETag inicial', async () => {
      const res = await request(server)
        .post(`/api/v1/empresas/${empresaAId}/chacras`)
        .set('x-actor-id', 'admin-a')
        .set('x-actor-rol', 'ADMINISTRADOR')
        .set('x-empresa-id', empresaAId)
        .send({
          nombre: 'Chacra La Soñada',
          nombreCorto: 'La Soñada',
          responsableNombre: 'Esteban Gomez',
          direccionTexto: 'Ruta 14 Km 10',
          ubicacionGeografica: { latitud: -27.1, longitud: -55.2 },
        })
        .expect(201);

      expect(res.headers.etag).toBe('"chacra-1"');
      const body = res.body as RespuestaChacraTest;
      expect(body.id).toBeDefined();
      expect(body.empresaId).toBe(empresaAId);
      expect(body.nombre).toBe('Chacra La Soñada');
      expect(body.nombreCorto).toBe('La Soñada');
      expect(body.responsableNombre).toBe('Esteban Gomez');
      expect(body.estado).toBe('ACTIVA');
      expect(body.version).toBe(1);
    });

    it('@TER-UC-001 @AC-02: Rechazar solicitud sin permiso con TER_ACCESO_DENEGADO (403)', async () => {
      const res = await request(server)
        .post(`/api/v1/empresas/${empresaAId}/chacras`)
        .set('x-actor-id', 'peon-1')
        .set('x-actor-rol', 'EMPLEADO')
        .set('x-empresa-id', empresaAId)
        .send({ nombre: 'Chacra Test', nombreCorto: 'Test' })
        .expect(403);

      expect((res.body as RespuestaErrorTest).code).toBe('TER_ACCESO_DENEGADO');
    });

    it('@TER-UC-001 @AC-03: Administrador de Empresa A no puede operar en Empresa B (403 ACC_EMPRESA_FUERA_DE_ALCANCE)', async () => {
      const res = await request(server)
        .post(`/api/v1/empresas/${empresaBId}/chacras`)
        .set('x-actor-id', 'admin-a')
        .set('x-actor-rol', 'ADMINISTRADOR')
        .set('x-empresa-id', empresaAId)
        .send({ nombre: 'Chacra Intruso', nombreCorto: 'Intruso' })
        .expect(403);

      expect((res.body as RespuestaErrorTest).code).toBe(
        'ACC_EMPRESA_FUERA_DE_ALCANCE',
      );
    });

    it('SuperAdministrador registra chacra requiriendo Motivo-Soporte y registra intervención', async () => {
      const motivo = 'Configuración inicial solicitada';
      const res = await request(server)
        .post(`/api/v1/empresas/${empresaAId}/chacras`)
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SUPER_ADMINISTRADOR')
        .set('motivo-soporte', encodeURIComponent(motivo))
        .send({ nombre: 'Chacra Soporte', nombreCorto: 'Soporte' })
        .expect(201);

      expect(res.headers.etag).toBe('"chacra-1"');

      // Verificar que se registró la intervención de soporte
      const intervenciones = await AppDataSource.query<
        Array<{ usuario_plataforma_id: string; motivo: string }>
      >(`
        SELECT * FROM intervenciones_soporte WHERE motivo = '${motivo}';
      `);
      expect(intervenciones).toHaveLength(1);
      expect(intervenciones[0].usuario_plataforma_id).toBe(superAdminId);
    });

    it('SuperAdministrador sin Motivo-Soporte se rechaza con 403 ACC_CONTEXTO_SOPORTE_REQUERIDO', async () => {
      const res = await request(server)
        .post(`/api/v1/empresas/${empresaAId}/chacras`)
        .set('x-actor-id', superAdminId)
        .set('x-actor-rol', 'SUPER_ADMINISTRADOR')
        .send({ nombre: 'Chacra Soporte', nombreCorto: 'Soporte' })
        .expect(403);

      expect((res.body as RespuestaErrorTest).code).toBe(
        'ACC_CONTEXTO_SOPORTE_REQUERIDO',
      );
    });

    it('Rechaza nombre corto duplicado en la misma Empresa con 409 TER_NOMBRE_CORTO_DUPLICADO', async () => {
      await request(server)
        .post(`/api/v1/empresas/${empresaAId}/chacras`)
        .set('x-actor-id', 'admin-a')
        .set('x-actor-rol', 'ADMINISTRADOR')
        .set('x-empresa-id', empresaAId)
        .send({ nombre: 'Chacra Original', nombreCorto: 'Campo Uno' })
        .expect(201);

      const res = await request(server)
        .post(`/api/v1/empresas/${empresaAId}/chacras`)
        .set('x-actor-id', 'admin-a')
        .set('x-actor-rol', 'ADMINISTRADOR')
        .set('x-empresa-id', empresaAId)
        .send({ nombre: 'Chacra Duplicada', nombreCorto: '  campo   uno  ' })
        .expect(409);

      expect((res.body as RespuestaErrorTest).code).toBe(
        'TER_NOMBRE_CORTO_DUPLICADO',
      );
    });

    it('Control de idempotencia: reintento devuelve mismo resultado o conflicto (409)', async () => {
      const key = 'idem-chacra-e2e-1';

      const res1 = await request(server)
        .post(`/api/v1/empresas/${empresaAId}/chacras`)
        .set('x-actor-id', 'admin-a')
        .set('x-actor-rol', 'ADMINISTRADOR')
        .set('x-empresa-id', empresaAId)
        .set('idempotency-key', key)
        .send({ nombre: 'Chacra Idem', nombreCorto: 'Idem' })
        .expect(201);

      const res2 = await request(server)
        .post(`/api/v1/empresas/${empresaAId}/chacras`)
        .set('x-actor-id', 'admin-a')
        .set('x-actor-rol', 'ADMINISTRADOR')
        .set('x-empresa-id', empresaAId)
        .set('idempotency-key', key)
        .send({ nombre: 'Chacra Idem', nombreCorto: 'Idem' })
        .expect(201);

      const body1 = res1.body as RespuestaChacraTest;
      const body2 = res2.body as RespuestaChacraTest;
      expect(body1.id).toBe(body2.id);

      // Reintento con distinta carga
      const res3 = await request(server)
        .post(`/api/v1/empresas/${empresaAId}/chacras`)
        .set('x-actor-id', 'admin-a')
        .set('x-actor-rol', 'ADMINISTRADOR')
        .set('x-empresa-id', empresaAId)
        .set('idempotency-key', key)
        .send({ nombre: 'Chacra Idem Modificada', nombreCorto: 'Otro' })
        .expect(409);

      expect((res3.body as RespuestaErrorTest).code).toBe(
        'TER_IDEMPOTENCIA_CONFLICTO',
      );
    });

    it('Rechaza ubicación geográfica con coordenadas fuera de rango con 422 TER_UBICACION_GEOGRAFICA_INVALIDA', async () => {
      const res = await request(server)
        .post(`/api/v1/empresas/${empresaAId}/chacras`)
        .set('x-actor-id', 'admin-a')
        .set('x-actor-rol', 'ADMINISTRADOR')
        .set('x-empresa-id', empresaAId)
        .send({
          nombre: 'Chacra Polo Sur',
          nombreCorto: 'Polo Sur',
          ubicacionGeografica: { latitud: -95.0, longitud: 0.0 },
        })
        .expect(422);

      expect((res.body as RespuestaErrorTest).code).toBe(
        'TER_UBICACION_GEOGRAFICA_INVALIDA',
      );
    });
  });

  describe('TER-UC-004 — Modificar Chacra', () => {
    let chacraId: string;

    beforeEach(async () => {
      const res = await request(server)
        .post(`/api/v1/empresas/${empresaAId}/chacras`)
        .set('x-actor-id', 'admin-a')
        .set('x-actor-rol', 'ADMINISTRADOR')
        .set('x-empresa-id', empresaAId)
        .send({
          nombre: 'Chacra Para Modificar',
          nombreCorto: 'Modificable',
          responsableNombre: 'Responsable Inicial',
        });
      const body = res.body as RespuestaChacraTest;
      chacraId = body.id;
    });

    it('@TER-UC-004 @AC-01: Modifica datos descriptivos incrementando versión a 2 y actualizando ETag', async () => {
      const res = await request(server)
        .patch(`/api/v1/empresas/${empresaAId}/chacras/${chacraId}`)
        .set('x-actor-id', 'admin-a')
        .set('x-actor-rol', 'ADMINISTRADOR')
        .set('x-empresa-id', empresaAId)
        .set('if-match', '"chacra-1"')
        .send({
          nombre: 'Chacra Modificada con Éxito',
          responsableNombre: null,
        })
        .expect(200);

      expect(res.headers.etag).toBe('"chacra-2"');
      const body = res.body as RespuestaChacraTest;
      expect(body.nombre).toBe('Chacra Modificada con Éxito');
      expect(body.nombreCorto).toBe('Modificable'); // Conservado
      expect(body.responsableNombre).toBeNull(); // Eliminado
      expect(body.version).toBe(2);
    });

    it('@TER-UC-004 @AC-04: Conflicto de versión cuando If-Match no coincide (409 TER_VERSION_CONFLICTO)', async () => {
      const res = await request(server)
        .patch(`/api/v1/empresas/${empresaAId}/chacras/${chacraId}`)
        .set('x-actor-id', 'admin-a')
        .set('x-actor-rol', 'ADMINISTRADOR')
        .set('x-empresa-id', empresaAId)
        .set('if-match', '"chacra-99"')
        .send({ nombre: 'Nuevo Nombre' })
        .expect(409);

      expect((res.body as RespuestaErrorTest).code).toBe(
        'TER_VERSION_CONFLICTO',
      );
    });

    it('Rechaza chacra no encontrada con 404 TER_CHACRA_NO_ENCONTRADA', async () => {
      const inexistenteId = '550e8400-e29b-41d4-a716-446655449999';
      const res = await request(server)
        .patch(`/api/v1/empresas/${empresaAId}/chacras/${inexistenteId}`)
        .set('x-actor-id', 'admin-a')
        .set('x-actor-rol', 'ADMINISTRADOR')
        .set('x-empresa-id', empresaAId)
        .set('if-match', '"chacra-1"')
        .send({ nombre: 'Nuevo Nombre' })
        .expect(404);

      expect((res.body as RespuestaErrorTest).code).toBe(
        'TER_CHACRA_NO_ENCONTRADA',
      );
    });
  });

  describe('TER-UC-005 — Inactivar Chacra', () => {
    let chacraId: string;

    beforeEach(async () => {
      const res = await request(server)
        .post(`/api/v1/empresas/${empresaAId}/chacras`)
        .set('x-actor-id', 'admin-a')
        .set('x-actor-rol', 'ADMINISTRADOR')
        .set('x-empresa-id', empresaAId)
        .send({
          nombre: 'Chacra a Inactivar',
          nombreCorto: 'Inactivable',
        });
      const body = res.body as RespuestaChacraTest;
      chacraId = body.id;
    });

    it('@TER-UC-005 @AC-01: Inactivar Chacra cambia su estado a INACTIVA y devuelve versión incrementada', async () => {
      const res = await request(server)
        .post(
          `/api/v1/empresas/${empresaAId}/chacras/${chacraId}/inactivaciones`,
        )
        .set('x-actor-id', 'admin-a')
        .set('x-actor-rol', 'ADMINISTRADOR')
        .set('x-empresa-id', empresaAId)
        .set('if-match', '"chacra-1"')
        .expect(200);

      expect(res.headers.etag).toBe('"chacra-2"');
      const body = res.body as RespuestaChacraTest;
      expect(body.estado).toBe('INACTIVA');
      expect(body.version).toBe(2);
    });

    it('Rechaza modificar datos descriptivos sobre Chacra inactiva con 422 TER_OPERACION_INACTIVA_INVALIDA', async () => {
      // Inactivar primero
      await request(server)
        .post(
          `/api/v1/empresas/${empresaAId}/chacras/${chacraId}/inactivaciones`,
        )
        .set('x-actor-id', 'admin-a')
        .set('x-actor-rol', 'ADMINISTRADOR')
        .set('x-empresa-id', empresaAId)
        .set('if-match', '"chacra-1"')
        .expect(200);

      // Intentar modificar
      const res = await request(server)
        .patch(`/api/v1/empresas/${empresaAId}/chacras/${chacraId}`)
        .set('x-actor-id', 'admin-a')
        .set('x-actor-rol', 'ADMINISTRADOR')
        .set('x-empresa-id', empresaAId)
        .set('if-match', '"chacra-2"')
        .send({ nombre: 'Intento Modificar Inactiva' })
        .expect(422);

      expect((res.body as RespuestaErrorTest).code).toBe(
        'TER_OPERACION_INACTIVA_INVALIDA',
      );
    });

    it('Rechaza inactivar una Chacra ya inactiva con 422 TER_TRANSICION_ESTADO_INVALIDA', async () => {
      // Inactivar primera vez
      await request(server)
        .post(
          `/api/v1/empresas/${empresaAId}/chacras/${chacraId}/inactivaciones`,
        )
        .set('x-actor-id', 'admin-a')
        .set('x-actor-rol', 'ADMINISTRADOR')
        .set('x-empresa-id', empresaAId)
        .set('if-match', '"chacra-1"')
        .expect(200);

      // Inactivar segunda vez
      const res = await request(server)
        .post(
          `/api/v1/empresas/${empresaAId}/chacras/${chacraId}/inactivaciones`,
        )
        .set('x-actor-id', 'admin-a')
        .set('x-actor-rol', 'ADMINISTRADOR')
        .set('x-empresa-id', empresaAId)
        .set('if-match', '"chacra-2"')
        .expect(422);

      expect((res.body as RespuestaErrorTest).code).toBe(
        'TER_TRANSICION_ESTADO_INVALIDA',
      );
    });
  });
});
