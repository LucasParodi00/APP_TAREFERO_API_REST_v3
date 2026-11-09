import { AppDataSource } from '../../../../infraestructura/persistencia/data-source';
import { RepositorioEmpresasTypeOrm } from '../../infraestructura/persistencia/typeorm/repositorios/repositorio-empresas-typeorm';
import { Empresa } from '../../dominio/entidades/empresa';
import { ConfiguracionGeneralEmpresa } from '../../dominio/entidades/configuracion-general-empresa';
import { randomUUID } from 'crypto';

describe('Integración: RepositorioEmpresasTypeOrm (T05)', () => {
  let repositorio: RepositorioEmpresasTypeOrm;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    repositorio = new RepositorioEmpresasTypeOrm(AppDataSource);
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  beforeEach(async () => {
    // Limpiar tablas de prueba
    await AppDataSource.query(
      'TRUNCATE TABLE configuraciones_empresa, empresas CASCADE;',
    );
  });

  it('guarda una empresa con su configuración y la recupera por id y por alias', async () => {
    const empresaId = randomUUID();
    const configId = randomUUID();

    const config = ConfiguracionGeneralEmpresa.crearInicial({
      id: configId,
      empresaId,
      creadoPor: 'actor-test',
    });

    const empresa = Empresa.registrar({
      id: empresaId,
      nombre: 'Empresa Test Integración',
      alias: 'empresa-test-integracion',
      cuit: '20123456789',
      ubicacionGeografica: { latitud: -27.36, longitud: -55.9 },
      creadoPor: 'actor-test',
      configuracion: config,
    });

    await repositorio.guardar(empresa);

    const recuperada = await repositorio.buscarPorId(empresaId);
    expect(recuperada).not.toBeNull();
    expect(recuperada?.id).toBe(empresaId);
    expect(recuperada?.nombre).toBe('Empresa Test Integración');
    expect(recuperada?.alias).toBe('empresa-test-integracion');
    expect(recuperada?.cuit).toBe('20123456789');
    expect(recuperada?.ubicacionGeografica).toEqual({
      latitud: -27.36,
      longitud: -55.9,
    });
    expect(recuperada?.configuracion.paisReferencia).toBe('AR');
    expect(recuperada?.configuracion.monedaPrincipal).toBe('ARS');

    const porAlias = await repositorio.buscarPorAlias(
      'empresa-test-integracion',
    );
    expect(porAlias?.id).toBe(empresaId);

    const existe = await repositorio.existeAlias('empresa-test-integracion');
    expect(existe).toBe(true);

    const noExiste = await repositorio.existeAlias('alias-no-existente');
    expect(noExiste).toBe(false);
  });

  it('lista empresas aplicando paginación y orden', async () => {
    for (let i = 1; i <= 3; i++) {
      const id = randomUUID();
      const cfg = ConfiguracionGeneralEmpresa.crearInicial({
        id: randomUUID(),
        empresaId: id,
        creadoPor: 'actor-test',
      });
      const emp = Empresa.registrar({
        id,
        nombre: `Empresa ${i}`,
        alias: `empresa-${i}`,
        creadoPor: 'actor-test',
        configuracion: cfg,
      });
      await repositorio.guardar(emp);
    }

    const resultado = await repositorio.listar({
      limite: 2,
      desplazamiento: 0,
      orden: { campo: 'nombre', direccion: 'asc' },
    });

    expect(resultado.datos.length).toBe(2);
    expect(resultado.paginacion.total).toBe(3);
    expect(resultado.datos[0].nombre).toBe('Empresa 1');
    expect(resultado.datos[1].nombre).toBe('Empresa 2');
  });

  it('actualiza datos de la empresa y de la configuración', async () => {
    const empresaId = randomUUID();
    const configId = randomUUID();

    const config = ConfiguracionGeneralEmpresa.crearInicial({
      id: configId,
      empresaId,
      creadoPor: 'actor-test',
    });

    const empresa = Empresa.registrar({
      id: empresaId,
      nombre: 'Nombre Original',
      alias: 'empresa-actualizar',
      creadoPor: 'actor-test',
      configuracion: config,
    });

    await repositorio.guardar(empresa);

    empresa.modificarDatos({ nombre: 'Nombre Modificado' }, 'actor-mod', true);
    await repositorio.actualizar(empresa);

    const actualizada = await repositorio.buscarPorId(empresaId);
    expect(actualizada?.nombre).toBe('Nombre Modificado');
    expect(actualizada?.version).toBe(2);

    empresa.configuracion.modificar({
      monedaPrincipal: 'USD',
      actualizadoPor: 'actor-mod',
    });
    await repositorio.actualizarConfiguracion(empresa.configuracion);

    const conConfigNueva = await repositorio.buscarPorId(empresaId);
    expect(conConfigNueva?.configuracion.monedaPrincipal).toBe('USD');
    expect(conConfigNueva?.configuracion.version).toBe(2);
  });
});
