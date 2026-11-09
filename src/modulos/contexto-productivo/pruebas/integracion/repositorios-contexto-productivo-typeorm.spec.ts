import { AppDataSource } from '../../../../infraestructura/persistencia/data-source';
import { RepositorioCultivosTypeOrm } from '../../infraestructura/persistencia/typeorm/repositorios/repositorio-cultivos.typeorm';
import { RepositorioVariedadesTypeOrm } from '../../infraestructura/persistencia/typeorm/repositorios/repositorio-variedades.typeorm';
import { RepositorioPerfilesTypeOrm } from '../../infraestructura/persistencia/typeorm/repositorios/repositorio-perfiles.typeorm';
import { Cultivo } from '../../dominio/entidades/cultivo';
import { Variedad } from '../../dominio/entidades/variedad';
import { PerfilCultivo } from '../../dominio/entidades/perfil-cultivo';
import { AlcancePerfil } from '../../dominio/enumeraciones/alcance-perfil';
import { CampoPerfil } from '../../dominio/objetos-valor/campo-perfil';
import { DestinoCampoPerfil } from '../../dominio/enumeraciones/destino-campo-perfil';
import { TipoCampoPerfil } from '../../dominio/enumeraciones/tipo-campo-perfil';
import { randomUUID } from 'crypto';

describe('Contexto Productivo — Integración: Repositorios TypeORM (T04)', () => {
  let repoCultivos: RepositorioCultivosTypeOrm;
  let repoVariedades: RepositorioVariedadesTypeOrm;
  let repoPerfiles: RepositorioPerfilesTypeOrm;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    await AppDataSource.runMigrations();
    repoCultivos = new RepositorioCultivosTypeOrm(AppDataSource);
    repoVariedades = new RepositorioVariedadesTypeOrm(AppDataSource);
    repoPerfiles = new RepositorioPerfilesTypeOrm(AppDataSource);
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  beforeEach(async () => {
    await AppDataSource.query(
      'TRUNCATE TABLE registros_idempotencia_cul, cultivos_habilitados_empresa, perfiles_cultivo, variedades, cultivos CASCADE;',
    );
  });

  it('debe persistir un Cultivo y buscarlo por id, código y nombre normalizado', async () => {
    const cultivo = Cultivo.crear({
      id: randomUUID(),
      codigo: 'TE',
      nombre: 'Té Misionero',
      descripcion: 'Camellia sinensis',
    });

    await repoCultivos.guardar(cultivo);

    const porId = await repoCultivos.buscarPorId(cultivo.id);
    expect(porId).not.toBeNull();
    expect(porId?.nombre).toBe('Té Misionero');

    const porCodigo = await repoCultivos.buscarPorCodigo('te');
    expect(porCodigo).not.toBeNull();
    expect(porCodigo?.id).toBe(cultivo.id);

    const porNombre =
      await repoCultivos.buscarPorNombreNormalizado('te misionero');
    expect(porNombre).not.toBeNull();
    expect(porNombre?.id).toBe(cultivo.id);
  });

  it('debe persistir Variedad y listar con paginación', async () => {
    const cultivo = Cultivo.crear({
      id: randomUUID(),
      codigo: 'YM',
      nombre: 'Yerba Mate',
    });
    await repoCultivos.guardar(cultivo);

    const var1 = Variedad.crear({
      id: randomUUID(),
      cultivoId: cultivo.id,
      codigo: 'CRIOLLA',
      nombre: 'Criolla Tradicional',
    });
    const var2 = Variedad.crear({
      id: randomUUID(),
      cultivoId: cultivo.id,
      codigo: 'SELECCION',
      nombre: 'Selección Especial',
    });

    await repoVariedades.guardar(var1);
    await repoVariedades.guardar(var2);

    const listado = await repoVariedades.listar(cultivo.id, {
      limite: 10,
      desplazamiento: 0,
      ordenCampo: 'codigo',
      ordenDireccion: 'ASC',
    });

    expect(listado.total).toBe(2);
    expect(listado.datos[0].codigo).toBe('CRIOLLA');
    expect(listado.datos[1].codigo).toBe('SELECCION');
  });

  it('debe persistir un PerfilCultivo con campos tipados y calcular versión por línea', async () => {
    const cultivo = Cultivo.crear({
      id: randomUUID(),
      codigo: 'MAIZ',
      nombre: 'Maíz',
    });
    await repoCultivos.guardar(cultivo);

    const campo = CampoPerfil.crear({
      codigo: 'HUMEDAD',
      nombre: 'Humedad de grano',
      destino: DestinoCampoPerfil.COSECHA,
      tipo: TipoCampoPerfil.DECIMAL,
      obligatorio: true,
      unidadId: 'kg',
      validaciones: { minimo: '0', maximo: '100' },
    });

    const version1 = await repoPerfiles.obtenerSiguienteNumeroVersion(
      cultivo.id,
      AlcancePerfil.BASE,
      null,
      null,
    );
    expect(version1).toBe(1);

    const perfil = PerfilCultivo.crearBorrador({
      id: randomUUID(),
      cultivoId: cultivo.id,
      alcance: AlcancePerfil.BASE,
      nombre: 'Perfil Base Maíz',
      campos: [campo],
      version: version1,
    });
    perfil.publicar();

    await repoPerfiles.guardar(perfil);

    const recuperado = await repoPerfiles.buscarPorId(perfil.id);
    expect(recuperado).not.toBeNull();
    expect(recuperado?.nombre).toBe('Perfil Base Maíz');
    expect(recuperado?.campos).toHaveLength(1);
    expect(recuperado?.campos[0].codigo).toBe('HUMEDAD');
    expect(recuperado?.campos[0].tipo).toBe(TipoCampoPerfil.DECIMAL);

    const siguienteVersion = await repoPerfiles.obtenerSiguienteNumeroVersion(
      cultivo.id,
      AlcancePerfil.BASE,
      null,
      null,
    );
    expect(siguienteVersion).toBe(2);
  });
});
