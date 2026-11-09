import { AppDataSource } from '../../../../infraestructura/persistencia/data-source';
import { RepositorioChacrasTypeOrm } from '../../infraestructura/persistencia/typeorm/repositorios/repositorio-chacras-typeorm';
import { Chacra } from '../../dominio/entidades/chacra';
import { EstadoChacra } from '../../dominio/enumeraciones/estado-chacra';
import { randomUUID } from 'crypto';

describe('Territorio — Integración: RepositorioChacrasTypeOrm (T04)', () => {
  let repositorio: RepositorioChacrasTypeOrm;
  const empresaId = '550e8400-e29b-41d4-a716-446655440000';

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    await AppDataSource.runMigrations();
    repositorio = new RepositorioChacrasTypeOrm(AppDataSource);
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  beforeEach(async () => {
    await AppDataSource.query(
      'TRUNCATE TABLE registros_idempotencia_ter, chacras, empresas CASCADE;',
    );

    // Insertar empresa de prueba
    await AppDataSource.query(`
      INSERT INTO empresas (id, nombre, alias, estado, creado_en, creado_por, actualizado_en, actualizado_por, version)
      VALUES ('${empresaId}', 'Empresa Territorio Test', 'empresa-ter-test', 'ACTIVA', NOW(), 'init', NOW(), 'init', 1);
    `);
  });

  it('guarda una chacra y la recupera por id', async () => {
    const chacraId = randomUUID();
    const chacra = Chacra.registrar({
      id: chacraId,
      empresaId,
      nombre: 'Chacra El Paraíso',
      nombreCorto: 'El Paraíso',
      responsableNombre: 'Juan Gomez',
      direccionTexto: 'Ruta 14 km 12',
      ubicacionGeografica: { latitud: -27.36, longitud: -55.9 },
      creadoPor: 'admin-ter',
    });

    await repositorio.guardar(chacra);

    const recuperada = await repositorio.buscarPorId(empresaId, chacraId);
    expect(recuperada).not.toBeNull();
    expect(recuperada?.id).toBe(chacraId);
    expect(recuperada?.nombre).toBe('Chacra El Paraíso');
    expect(recuperada?.nombreCorto).toBe('El Paraíso');
    expect(recuperada?.nombreCortoClave).toBe('el paraiso');
    expect(recuperada?.responsableNombre).toBe('Juan Gomez');
    expect(recuperada?.direccionTexto).toBe('Ruta 14 km 12');
    expect(recuperada?.ubicacionGeografica?.latitud).toBe(-27.36);
    expect(recuperada?.ubicacionGeografica?.longitud).toBe(-55.9);
    expect(recuperada?.estado).toBe(EstadoChacra.ACTIVA);
    expect(recuperada?.version).toBe(1);
  });

  it('verifica unicidad de clave de nombre corto en la Empresa', async () => {
    const chacraId = randomUUID();
    const chacra = Chacra.registrar({
      id: chacraId,
      empresaId,
      nombre: 'Chacra Esperanza',
      nombreCorto: 'Esperanza',
      creadoPor: 'admin-ter',
    });

    await repositorio.guardar(chacra);

    const existeMisma = await repositorio.existeNombreCorto(
      empresaId,
      'esperanza',
    );
    expect(existeMisma).toBe(true);

    const existeExcluyendo = await repositorio.existeNombreCorto(
      empresaId,
      'esperanza',
      chacraId,
    );
    expect(existeExcluyendo).toBe(false);

    const existeOtra = await repositorio.existeNombreCorto(
      empresaId,
      'otra-chacra',
    );
    expect(existeOtra).toBe(false);
  });

  it('recupera chacra con bloqueo pesimista de escritura', async () => {
    const chacraId = randomUUID();
    const chacra = Chacra.registrar({
      id: chacraId,
      empresaId,
      nombre: 'Chacra Bloqueo',
      nombreCorto: 'Bloqueo',
      creadoPor: 'admin-ter',
    });

    await repositorio.guardar(chacra);

    const conBloqueo = await repositorio.buscarPorIdConBloqueo(
      empresaId,
      chacraId,
    );
    expect(conBloqueo).not.toBeNull();
    expect(conBloqueo?.id).toBe(chacraId);
  });
});
