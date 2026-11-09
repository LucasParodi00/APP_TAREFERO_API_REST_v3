import { AppDataSource } from '../../../../infraestructura/persistencia/data-source';
import { RepositorioUsuariosPlataformaTypeOrm } from '../../infraestructura/persistencia/typeorm/repositorios/repositorio-usuarios-plataforma-typeorm';
import { RepositorioIntervencionesSoporteTypeOrm } from '../../infraestructura/persistencia/typeorm/repositorios/repositorio-intervenciones-soporte-typeorm';
import { GestorIdempotenciaAccTypeOrm } from '../../infraestructura/persistencia/typeorm/repositorios/gestor-idempotencia-acc-typeorm';
import { UsuarioPlataformaTypeOrmEntidad } from '../../infraestructura/persistencia/typeorm/entidades/usuario-plataforma.typeorm-entidad';
import { IntervencionSoporteTypeOrmEntidad } from '../../infraestructura/persistencia/typeorm/entidades/intervencion-soporte.typeorm-entidad';
import { RegistroIdempotenciaAccTypeOrmEntidad } from '../../infraestructura/persistencia/typeorm/entidades/registro-idempotencia-acc.typeorm-entidad';
import { RepositorioCuentasEmpresaTypeOrm } from '../../infraestructura/persistencia/typeorm/repositorios/repositorio-cuentas-empresa-typeorm';
import { RepositorioSesionesEmpresaTypeOrm } from '../../infraestructura/persistencia/typeorm/repositorios/repositorio-sesiones-empresa-typeorm';
import { UsuarioPlataforma } from '../../dominio/entidades/usuario-plataforma';
import { CuentaEmpresa } from '../../dominio/entidades/cuenta-empresa';
import { SesionEmpresa } from '../../dominio/entidades/sesion-empresa';
import { CorreoAcceso } from '../../dominio/objetos-valor/correo-acceso';
import { CanalSesion } from '../../dominio/enumeraciones/canal-sesion';
import { EstadoCuentaEmpresa } from '../../dominio/enumeraciones/estado-cuenta-empresa';
import { IntervencionSoporte } from '../../dominio/entidades/intervencion-soporte';
import { MotivoSoporte } from '../../dominio/objetos-valor/motivo-soporte';

describe('Identidad y Acceso — Persistencia TypeORM (T04)', () => {
  let repoUsuarios: RepositorioUsuariosPlataformaTypeOrm;
  let repoIntervenciones: RepositorioIntervencionesSoporteTypeOrm;
  let gestorIdempotencia: GestorIdempotenciaAccTypeOrm;
  let repoCuentas: RepositorioCuentasEmpresaTypeOrm;
  let repoSesiones: RepositorioSesionesEmpresaTypeOrm;

  const empresaId = '550e8400-e29b-41d4-a716-446655440000';
  const superAdminId = 'c7e0c457-3f9b-4bf4-bb85-055f69e6b360';

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    await AppDataSource.runMigrations();

    repoUsuarios = new RepositorioUsuariosPlataformaTypeOrm(
      AppDataSource.getRepository(UsuarioPlataformaTypeOrmEntidad),
    );
    repoIntervenciones = new RepositorioIntervencionesSoporteTypeOrm(
      AppDataSource.getRepository(IntervencionSoporteTypeOrmEntidad),
    );
    gestorIdempotencia = new GestorIdempotenciaAccTypeOrm(
      AppDataSource.getRepository(RegistroIdempotenciaAccTypeOrmEntidad),
    );
    repoCuentas = new RepositorioCuentasEmpresaTypeOrm(AppDataSource);
    repoSesiones = new RepositorioSesionesEmpresaTypeOrm(AppDataSource);
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  beforeEach(async () => {
    await AppDataSource.query(
      'TRUNCATE TABLE huellas_renovacion_sesion, sesiones_empresa, cuentas_empresa, registros_idempotencia_acc, intervenciones_soporte, usuarios_plataforma, configuraciones_empresa, empresas CASCADE;',
    );

    // Insertar empresa de prueba para la FK
    await AppDataSource.query(`
      INSERT INTO empresas (id, nombre, alias, estado, creado_en, creado_por, actualizado_en, actualizado_por, version)
      VALUES ('${empresaId}', 'Empresa Test', 'empresa-test', 'ACTIVA', NOW(), 'sistema', NOW(), 'sistema', 1);
    `);
  });

  it('debe guardar y contar usuarios de plataforma', async () => {
    expect(await repoUsuarios.contarTotal()).toBe(0);

    const usuario = UsuarioPlataforma.crear({
      id: superAdminId,
      rol: 'SUPER_ADMINISTRADOR',
      activo: true,
    });
    await repoUsuarios.guardar(usuario);

    expect(await repoUsuarios.contarTotal()).toBe(1);
    expect(await repoUsuarios.contarActivos()).toBe(1);

    const recuperado = await repoUsuarios.buscarPorId(superAdminId);
    expect(recuperado).not.toBeNull();
    expect(recuperado?.id).toBe(superAdminId);
    expect(recuperado?.rol).toBe('SUPER_ADMINISTRADOR');
  });

  it('debe guardar intervenciones y listarlas con orden y paginación en PostgreSQL', async () => {
    // Primero crear el usuario de plataforma para la FK
    await repoUsuarios.guardar(
      UsuarioPlataforma.crear({
        id: superAdminId,
        rol: 'SUPER_ADMINISTRADOR',
        activo: true,
      }),
    );

    const int1 = IntervencionSoporte.crear({
      id: '11111111-1111-1111-1111-111111111111',
      usuarioPlataformaId: superAdminId,
      empresaId,
      motivo: MotivoSoporte.crear('Atención incidente A'),
      sesionId: 'ses-1',
      solicitudId: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
      ocurridaEn: new Date('2026-11-08T10:00:00Z'),
    });

    const int2 = IntervencionSoporte.crear({
      id: '22222222-2222-2222-2222-222222222222',
      usuarioPlataformaId: superAdminId,
      empresaId,
      motivo: MotivoSoporte.crear('Atención incidente B'),
      sesionId: 'ses-2',
      solicitudId: 'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e',
      ocurridaEn: new Date('2026-11-09T10:00:00Z'),
    });

    await repoIntervenciones.guardar(int1);
    await repoIntervenciones.guardar(int2);

    const listadoDesc = await repoIntervenciones.listarPorEmpresa(empresaId, {
      limite: 10,
      desplazamiento: 0,
      orden: 'ocurridaEn:desc',
    });

    expect(listadoDesc.total).toBe(2);
    expect(listadoDesc.datos[0].id).toBe(int2.id);

    const listadoPaginado = await repoIntervenciones.listarPorEmpresa(
      empresaId,
      {
        limite: 1,
        desplazamiento: 1,
        orden: 'ocurridaEn:desc',
      },
    );

    expect(listadoPaginado.datos).toHaveLength(1);
    expect(listadoPaginado.datos[0].id).toBe(int1.id);
  });

  it('debe registrar y recuperar claves de idempotencia', async () => {
    const registro = {
      clave: 'idemp-1',
      solicitudHash: 'hash-abc',
      respuestaJson: JSON.stringify({ id: 'res-1' }),
      codigoEstado: 201,
      creadoEn: new Date(),
    };

    await gestorIdempotencia.guardar(registro);

    const recuperado = await gestorIdempotencia.obtener('idemp-1');
    expect(recuperado).not.toBeNull();
    expect(recuperado?.solicitudHash).toBe('hash-abc');
  });

  it('debe persistir, actualizar y listar Cuentas de Empresa en PostgreSQL', async () => {
    const cuentaId = '123e4567-e89b-12d3-a456-426614174001';
    const personaId = '123e4567-e89b-12d3-a456-426614174002';

    const cuenta = CuentaEmpresa.crear({
      id: cuentaId,
      empresaId,
      personaId,
      correoAcceso: new CorreoAcceso('admin@yerba.com'),
      hashContrasenia: 'hash-seguro-123',
      accesoWeb: true,
      accesoMovil: false,
      roles: ['ADMINISTRADOR'],
      creadoPor: superAdminId,
    });

    await repoCuentas.guardar(cuenta);

    const encontrada = await repoCuentas.buscarPorId(cuentaId);
    expect(encontrada).not.toBeNull();
    expect(encontrada?.correoAcceso.valor).toBe('admin@yerba.com');
    expect(encontrada?.roles).toEqual(['ADMINISTRADOR']);
    expect(await repoCuentas.contarActivas(empresaId)).toBe(1);

    // Actualizar cuenta
    cuenta.suspender(superAdminId);
    await repoCuentas.actualizar(cuenta);

    const suspendida = await repoCuentas.buscarPorId(cuentaId);
    expect(suspendida?.estado).toBe(EstadoCuentaEmpresa.SUSPENDIDA);
    expect(suspendida?.version).toBe(2);
    expect(await repoCuentas.contarActivas(empresaId)).toBe(0);

    // Búsqueda por correo y persona
    expect(
      await repoCuentas.buscarPorCorreo(empresaId, 'admin@yerba.com'),
    ).not.toBeNull();
    expect(
      await repoCuentas.buscarPorPersona(empresaId, personaId),
    ).not.toBeNull();

    // Listado paginado
    const listado = await repoCuentas.listar({
      empresaId,
      limite: 10,
      desplazamiento: 0,
    });
    expect(listado.paginacion.total).toBe(1);
    expect(listado.datos).toHaveLength(1);
  });

  it('debe persistir, revocar y detectar huellas de renovación de Sesiones de Empresa', async () => {
    const cuentaId = '123e4567-e89b-12d3-a456-426614174001';
    const personaId = '123e4567-e89b-12d3-a456-426614174002';
    const sesionId = '123e4567-e89b-12d3-a456-426614174003';

    await repoCuentas.guardar(
      CuentaEmpresa.crear({
        id: cuentaId,
        empresaId,
        personaId,
        correoAcceso: new CorreoAcceso('admin@yerba.com'),
        hashContrasenia: 'hash-seguro-123',
        accesoWeb: true,
        accesoMovil: false,
        roles: ['ADMINISTRADOR'],
        creadoPor: superAdminId,
      }),
    );

    const sesion = SesionEmpresa.crear({
      id: sesionId,
      empresaId,
      cuentaEmpresaId: cuentaId,
      canal: CanalSesion.WEB,
      tokenRenovacionHash: 'token-hash-1',
    });

    await repoSesiones.guardar(sesion);

    const encontrada = await repoSesiones.buscarPorId(sesionId);
    expect(encontrada).not.toBeNull();
    expect(encontrada?.estaVigente()).toBe(true);

    const porToken =
      await repoSesiones.buscarPorTokenRenovacion('token-hash-1');
    expect(porToken?.id).toBe(sesionId);

    // Huellas de renovación
    expect(await repoSesiones.existeHuellaRenovacion('token-hash-1')).toBe(
      false,
    );
    await repoSesiones.registrarHuellaRenovacion(sesionId, 'token-hash-1');
    expect(await repoSesiones.existeHuellaRenovacion('token-hash-1')).toBe(
      true,
    );

    // Revocar todas por cuenta
    await repoSesiones.revocarTodasPorCuenta(
      cuentaId,
      'Prueba revocación',
      'actor-1',
    );
    const revocada = await repoSesiones.buscarPorId(sesionId);
    expect(revocada?.estaVigente()).toBe(false);
  });
});
