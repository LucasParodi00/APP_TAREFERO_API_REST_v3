import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http';
import { AppModule } from '../src/app.module';
import { AppDataSource } from '../src/infraestructura/persistencia/data-source';

interface RespuestaCultivoTest {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  estado: string;
  version: number;
}

interface RespuestaVariedadTest {
  id: string;
  cultivoId: string;
  codigo: string;
  nombre: string;
  estado: string;
  version: number;
}

interface RespuestaPerfilTest {
  id: string;
  cultivoId: string;
  alcance: string;
  empresaId?: string | null;
  loteId?: string | null;
  perfilPadreId?: string | null;
  nombre: string;
  version: number;
  estado: string;
}

interface RespuestaErrorTest {
  code: string;
  status: number;
  detail: string;
}

describe('Contexto Productivo — Catálogos y Perfiles (e2e) (T06)', () => {
  let app: INestApplication;
  let server: Server;

  const empresaHabilitadaId = '550e8400-e29b-41d4-a716-446655440000';
  const empresaNoHabilitadaId = '660e8400-e29b-41d4-a716-446655440001';
  const superAdminId = 'c7e0c457-3f9b-4bf4-bb85-055f69e6b360';
  const adminEmpresaId = 'd8e0c457-3f9b-4bf4-bb85-055f69e6b370';

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
      'TRUNCATE TABLE registros_idempotencia_cul, cultivos_habilitados_empresa, perfiles_cultivo, variedades, cultivos, empresas CASCADE;',
    );

    // Empresas de prueba
    await AppDataSource.query(`
      INSERT INTO empresas (id, nombre, alias, estado, creado_en, creado_por, actualizado_en, actualizado_por, version)
      VALUES 
        ('${empresaHabilitadaId}', 'Empresa Habilitada', 'empresa-hab', 'ACTIVA', NOW(), 'init', NOW(), 'init', 1),
        ('${empresaNoHabilitadaId}', 'Empresa No Habilitada', 'empresa-nohab', 'ACTIVA', NOW(), 'init', NOW(), 'init', 1);
    `);
  });

  it('1. SuperAdmin registra un nuevo Cultivo y obtiene 201 con ETag', async () => {
    const res = await request(server)
      .post('/api/v1/cultivos')
      .set('x-actor-rol', 'SuperAdministrador')
      .set('x-actor-id', superAdminId)
      .send({
        codigo: 'yerba-mate',
        nombre: 'Yerba Mate',
        descripcion: 'Cultivo madre misionero',
      });

    expect(res.status).toBe(201);
    expect(res.headers.etag).toBe('"1"');
    const body = res.body as RespuestaCultivoTest;
    expect(body.codigo).toBe('YERBA-MATE');
    expect(body.nombre).toBe('Yerba Mate');
    expect(body.estado).toBe('ACTIVO');
    expect(body.version).toBe(1);
  });

  it('2. Rechaza registro de cultivo duplicado por código o nombre con 409', async () => {
    await request(server)
      .post('/api/v1/cultivos')
      .set('x-actor-rol', 'SuperAdministrador')
      .send({ codigo: 'YM', nombre: 'Yerba Mate' });

    // Mismo código
    const resDuplicadoCodigo = await request(server)
      .post('/api/v1/cultivos')
      .set('x-actor-rol', 'SuperAdministrador')
      .send({ codigo: 'ym', nombre: 'Otro Nombre' });

    expect(resDuplicadoCodigo.status).toBe(409);
    expect((resDuplicadoCodigo.body as RespuestaErrorTest).code).toBe(
      'CUL_CULTIVO_DUPLICADO',
    );

    // Mismo nombre normalizado
    const resDuplicadoNombre = await request(server)
      .post('/api/v1/cultivos')
      .set('x-actor-rol', 'SuperAdministrador')
      .send({ codigo: 'OTRO', nombre: '  yerba   mate  ' });

    expect(resDuplicadoNombre.status).toBe(409);
    expect((resDuplicadoNombre.body as RespuestaErrorTest).code).toBe(
      'CUL_CULTIVO_DUPLICADO',
    );
  });

  it('3. Rechaza registrar cultivo si el actor no es SuperAdministrador con 403', async () => {
    const res = await request(server)
      .post('/api/v1/cultivos')
      .set('x-actor-rol', 'Administrador')
      .set('x-empresa-id', empresaHabilitadaId)
      .send({ codigo: 'TE', nombre: 'Té' });

    expect(res.status).toBe(403);
    expect((res.body as RespuestaErrorTest).code).toBe('CUL_ACCESO_DENEGADO');
  });

  it('4. Lista y consulta individualmente los Cultivos', async () => {
    const createRes = await request(server)
      .post('/api/v1/cultivos')
      .set('x-actor-rol', 'SuperAdministrador')
      .send({ codigo: 'TE', nombre: 'Té Misionero' });
    const cultivoId = (createRes.body as RespuestaCultivoTest).id;

    const listRes = await request(server)
      .get('/api/v1/cultivos?limite=10&desplazamiento=0')
      .set('x-actor-rol', 'SuperAdministrador');

    expect(listRes.status).toBe(200);
    const listBody = listRes.body as {
      datos: RespuestaCultivoTest[];
      paginacion: { total: number };
    };
    expect(listBody.datos).toHaveLength(1);
    expect(listBody.paginacion.total).toBe(1);

    const getRes = await request(server)
      .get(`/api/v1/cultivos/${cultivoId}`)
      .set('x-actor-rol', 'SuperAdministrador');

    expect(getRes.status).toBe(200);
    expect((getRes.body as RespuestaCultivoTest).id).toBe(cultivoId);
  });

  it('5. Inactiva un Cultivo verificando If-Match con 200', async () => {
    const createRes = await request(server)
      .post('/api/v1/cultivos')
      .set('x-actor-rol', 'SuperAdministrador')
      .send({ codigo: 'SOJA', nombre: 'Soja' });
    const cultivoId = (createRes.body as RespuestaCultivoTest).id;

    // If-Match incorrecto
    const confRes = await request(server)
      .post(`/api/v1/cultivos/${cultivoId}/inactivaciones`)
      .set('x-actor-rol', 'SuperAdministrador')
      .set('if-match', '"99"')
      .send();

    expect(confRes.status).toBe(409);
    expect((confRes.body as RespuestaErrorTest).code).toBe(
      'CUL_VERSION_CONFLICTO',
    );

    // If-Match correcto
    const inactRes = await request(server)
      .post(`/api/v1/cultivos/${cultivoId}/inactivaciones`)
      .set('x-actor-rol', 'SuperAdministrador')
      .set('if-match', '"1"')
      .send();

    expect(inactRes.status).toBe(200);
    expect((inactRes.body as RespuestaCultivoTest).estado).toBe('INACTIVO');
    expect(inactRes.headers.etag).toBe('"2"');
  });

  it('6. SuperAdmin registra Variedad y valida unicidad por cultivo', async () => {
    const createCultivoRes = await request(server)
      .post('/api/v1/cultivos')
      .set('x-actor-rol', 'SuperAdministrador')
      .send({ codigo: 'YM', nombre: 'Yerba Mate' });
    const cultivoId = (createCultivoRes.body as RespuestaCultivoTest).id;

    const resVar = await request(server)
      .post(`/api/v1/cultivos/${cultivoId}/variedades`)
      .set('x-actor-rol', 'SuperAdministrador')
      .send({ codigo: 'CRIOLLA', nombre: 'Criolla Tradicional' });

    expect(resVar.status).toBe(201);
    const bodyVar = resVar.body as RespuestaVariedadTest;
    expect(bodyVar.codigo).toBe('CRIOLLA');
    expect(bodyVar.cultivoId).toBe(cultivoId);

    // Duplicada en el mismo cultivo
    const resDuplicada = await request(server)
      .post(`/api/v1/cultivos/${cultivoId}/variedades`)
      .set('x-actor-rol', 'SuperAdministrador')
      .send({ codigo: 'criolla', nombre: 'Otra Criolla' });

    expect(resDuplicada.status).toBe(422);
    expect((resDuplicada.body as RespuestaErrorTest).code).toBe(
      'CUL_VARIEDAD_INVALIDA',
    );
  });

  it('7. SuperAdmin crea y publica un Perfil BASE', async () => {
    const createCultivoRes = await request(server)
      .post('/api/v1/cultivos')
      .set('x-actor-rol', 'SuperAdministrador')
      .send({ codigo: 'YM', nombre: 'Yerba Mate' });
    const cultivoId = (createCultivoRes.body as RespuestaCultivoTest).id;

    const resPerfil = await request(server)
      .post(`/api/v1/cultivos/${cultivoId}/perfiles-cultivo`)
      .set('x-actor-rol', 'SuperAdministrador')
      .send({
        alcance: 'BASE',
        nombre: 'Perfil Base Yerba Mate',
        campos: [
          {
            codigo: 'DENSIDAD',
            nombre: 'Densidad de plantas',
            destino: 'IMPLANTACION',
            tipo: 'ENTERO',
            obligatorio: true,
          },
        ],
      });

    expect(resPerfil.status).toBe(201);
    const perfil = resPerfil.body as RespuestaPerfilTest;
    expect(perfil.alcance).toBe('BASE');
    expect(perfil.estado).toBe('BORRADOR');
    expect(perfil.version).toBe(1);

    const resPublicar = await request(server)
      .post(
        `/api/v1/cultivos/${cultivoId}/perfiles-cultivo/${perfil.id}/publicaciones`,
      )
      .set('x-actor-rol', 'SuperAdministrador')
      .set('if-match', '"1"')
      .send();

    expect(resPublicar.status).toBe(200);
    expect((resPublicar.body as RespuestaPerfilTest).estado).toBe('PUBLICADO');
  });

  it('8. Empresa habilitada crea y publica Perfil EMPRESA heredando de BASE', async () => {
    const createCultivoRes = await request(server)
      .post('/api/v1/cultivos')
      .set('x-actor-rol', 'SuperAdministrador')
      .send({ codigo: 'YM', nombre: 'Yerba Mate' });
    const cultivoId = (createCultivoRes.body as RespuestaCultivoTest).id;

    // Habilitar cultivo para empresa
    await AppDataSource.query(`
      INSERT INTO cultivos_habilitados_empresa (id, empresa_id, cultivo_id, habilitado, fecha_creacion)
      VALUES (gen_random_uuid(), '${empresaHabilitadaId}', '${cultivoId}', true, NOW());
    `);

    // Crear y publicar base
    const resBase = await request(server)
      .post(`/api/v1/cultivos/${cultivoId}/perfiles-cultivo`)
      .set('x-actor-rol', 'SuperAdministrador')
      .send({
        alcance: 'BASE',
        nombre: 'Base',
        campos: [
          {
            codigo: 'DENSIDAD',
            nombre: 'Densidad',
            destino: 'IMPLANTACION',
            tipo: 'ENTERO',
            obligatorio: true,
          },
        ],
      });
    const baseId = (resBase.body as RespuestaPerfilTest).id;
    await request(server)
      .post(
        `/api/v1/cultivos/${cultivoId}/perfiles-cultivo/${baseId}/publicaciones`,
      )
      .set('x-actor-rol', 'SuperAdministrador')
      .send();

    // Administrador de empresa habilitada crea borrador EMPRESA
    const resEmp = await request(server)
      .post(`/api/v1/cultivos/${cultivoId}/perfiles-cultivo`)
      .set('x-actor-rol', 'Administrador')
      .set('x-actor-id', adminEmpresaId)
      .set('x-empresa-id', empresaHabilitadaId)
      .send({
        alcance: 'EMPRESA',
        perfilPadreId: baseId,
        nombre: 'Perfil Empresa Habilitada',
        campos: [
          {
            codigo: 'DENSIDAD',
            nombre: 'Densidad',
            destino: 'IMPLANTACION',
            tipo: 'ENTERO',
            obligatorio: true,
          },
          {
            codigo: 'PESO',
            nombre: 'Peso cosecha',
            destino: 'COSECHA',
            tipo: 'DECIMAL',
            obligatorio: false,
            unidadId: 'kg',
          },
        ],
      });

    expect(resEmp.status).toBe(201);
    const perfilEmp = resEmp.body as RespuestaPerfilTest;
    expect(perfilEmp.alcance).toBe('EMPRESA');
    expect(perfilEmp.empresaId).toBe(empresaHabilitadaId);

    // Publicar perfil empresa
    const resPubEmp = await request(server)
      .post(
        `/api/v1/cultivos/${cultivoId}/perfiles-cultivo/${perfilEmp.id}/publicaciones`,
      )
      .set('x-actor-rol', 'Administrador')
      .set('x-empresa-id', empresaHabilitadaId)
      .send();

    expect(resPubEmp.status).toBe(200);
    expect((resPubEmp.body as RespuestaPerfilTest).estado).toBe('PUBLICADO');
  });

  it('9. Rechaza Perfil EMPRESA si el cultivo no está habilitado con 422', async () => {
    const createCultivoRes = await request(server)
      .post('/api/v1/cultivos')
      .set('x-actor-rol', 'SuperAdministrador')
      .send({ codigo: 'YM', nombre: 'Yerba Mate' });
    const cultivoId = (createCultivoRes.body as RespuestaCultivoTest).id;

    // Crear y publicar base
    const resBase = await request(server)
      .post(`/api/v1/cultivos/${cultivoId}/perfiles-cultivo`)
      .set('x-actor-rol', 'SuperAdministrador')
      .send({
        alcance: 'BASE',
        nombre: 'Base',
        campos: [],
      });
    const baseId = (resBase.body as RespuestaPerfilTest).id;
    await request(server)
      .post(
        `/api/v1/cultivos/${cultivoId}/perfiles-cultivo/${baseId}/publicaciones`,
      )
      .set('x-actor-rol', 'SuperAdministrador')
      .send();

    // Empresa NO habilitada intenta crear borrador
    const resEmpNoHab = await request(server)
      .post(`/api/v1/cultivos/${cultivoId}/perfiles-cultivo`)
      .set('x-actor-rol', 'Administrador')
      .set('x-empresa-id', empresaNoHabilitadaId)
      .send({
        alcance: 'EMPRESA',
        perfilPadreId: baseId,
        nombre: 'Perfil Empresa No Hab',
        campos: [],
      });

    expect(resEmpNoHab.status).toBe(422);
    expect((resEmpNoHab.body as RespuestaErrorTest).code).toBe(
      'CUL_CULTIVO_NO_HABILITADO',
    );
  });

  it('10. Rechaza modificar versión publicada y permite inactivarla', async () => {
    const createCultivoRes = await request(server)
      .post('/api/v1/cultivos')
      .set('x-actor-rol', 'SuperAdministrador')
      .send({ codigo: 'YM', nombre: 'Yerba Mate' });
    const cultivoId = (createCultivoRes.body as RespuestaCultivoTest).id;

    const resBase = await request(server)
      .post(`/api/v1/cultivos/${cultivoId}/perfiles-cultivo`)
      .set('x-actor-rol', 'SuperAdministrador')
      .send({
        alcance: 'BASE',
        nombre: 'Base Yerba',
        campos: [],
      });
    const baseId = (resBase.body as RespuestaPerfilTest).id;

    await request(server)
      .post(
        `/api/v1/cultivos/${cultivoId}/perfiles-cultivo/${baseId}/publicaciones`,
      )
      .set('x-actor-rol', 'SuperAdministrador')
      .send();

    // Intentar modificar versión publicada
    const resModificar = await request(server)
      .put(`/api/v1/cultivos/${cultivoId}/perfiles-cultivo/${baseId}`)
      .set('x-actor-rol', 'SuperAdministrador')
      .send({ nombre: 'Intento cambiar publicado' });

    expect(resModificar.status).toBe(422);
    expect((resModificar.body as RespuestaErrorTest).code).toBe(
      'CUL_VERSION_PERFIL_INMUTABLE',
    );

    // Inactivar versión publicada
    const resInactivar = await request(server)
      .post(
        `/api/v1/cultivos/${cultivoId}/perfiles-cultivo/${baseId}/inactivaciones`,
      )
      .set('x-actor-rol', 'SuperAdministrador')
      .send();

    expect(resInactivar.status).toBe(200);
    expect((resInactivar.body as RespuestaPerfilTest).estado).toBe('INACTIVO');
  });
});
