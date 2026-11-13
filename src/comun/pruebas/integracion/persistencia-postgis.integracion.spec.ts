import { DataSource } from 'typeorm';
import { crearOpcionesDataSource } from '../../infraestructura/persistencia/configuracion-typeorm';
import { UnidadTransaccionalTypeOrm } from '../../infraestructura/persistencia/unidad-transaccional.typeorm';
import { HabilitarExtensionPostgis1731450000000 } from '../../../../migraciones/comun/1731450000000-HabilitarExtensionPostgis';

interface FilaPostgis {
    postgis_version: string;
}

interface FilaValor {
    valor: string;
}

interface FilaId {
    id: number;
}

describe('Integración Real — Bootstrap de Persistencia, PostGIS y Transacciones', () => {
    let dataSource: DataSource;
    let unidadTransaccional: UnidadTransaccionalTypeOrm;

    beforeAll(async () => {
        const opciones = crearOpcionesDataSource({
            host: process.env.DB_HOST ?? 'localhost',
            port: Number(process.env.DB_PORT ?? 5432),
            username: process.env.DB_USER ?? 'postgres',
            password: process.env.DB_PASSWORD ?? 'root',
            database: process.env.DB_NAME ?? 'postgres',
            migrations: [HabilitarExtensionPostgis1731450000000],
            logging: false,
        });

        dataSource = new DataSource(opciones);
        await dataSource.initialize();
        unidadTransaccional = new UnidadTransaccionalTypeOrm(dataSource);
    });

    afterAll(async () => {
        if (dataSource?.isInitialized) {
            await dataSource.destroy();
        }
    });

    it('debe ejecutar la migración técnica de común y habilitar PostGIS en la base de datos', async () => {
        const migracionesEjecutadas = await dataSource.runMigrations();
        expect(Array.isArray(migracionesEjecutadas)).toBe(true);

        // Verificar directamente que PostGIS está activo y devuelve versión válida
        const queryRunner = dataSource.createQueryRunner();
        try {
            const resultadoRaw: unknown = await queryRunner.query('SELECT PostGIS_Version();');
            const resultado = resultadoRaw as FilaPostgis[];

            expect(resultado).toBeDefined();
            expect(resultado.length).toBeGreaterThan(0);
            expect(resultado[0].postgis_version).toBeDefined();
            expect(typeof resultado[0].postgis_version).toBe('string');
        } finally {
            await queryRunner.release();
        }
    });

    it('debe ser idempotente la migración si se ejecuta nuevamente', async () => {
        // Segunda ejecución de runMigrations no debe fallar
        const segundaEjecucion = await dataSource.runMigrations();
        expect(Array.isArray(segundaEjecucion)).toBe(true);
    });

    it('debe persistir cambios en PostgreSQL cuando una operación transaccional finaliza con éxito', async () => {
        // Creamos tabla temporal de prueba dentro de la base real
        await dataSource.query('CREATE TEMP TABLE prueba_tx (id INT PRIMARY KEY, valor TEXT);');

        try {
            await unidadTransaccional.ejecutar(async () => {
                const em = unidadTransaccional.obtenerEntityManager();
                await em.query('INSERT INTO prueba_tx (id, valor) VALUES ($1, $2);', [1, 'confirmado']);
            });

            const filasRaw: unknown = await dataSource.query('SELECT valor FROM prueba_tx WHERE id = 1;');
            const filas = filasRaw as FilaValor[];
            expect(filas.length).toBe(1);
            expect(filas[0].valor).toBe('confirmado');
        } finally {
            await dataSource.query('DROP TABLE IF EXISTS prueba_tx;');
        }
    });

    it('debe realizar rollback atómico en PostgreSQL cuando una operación transaccional arroja un error', async () => {
        await dataSource.query('CREATE TEMP TABLE prueba_rollback (id INT PRIMARY KEY, valor TEXT);');

        try {
            const intento = unidadTransaccional.ejecutar(async () => {
                const em = unidadTransaccional.obtenerEntityManager();
                await em.query('INSERT INTO prueba_rollback (id, valor) VALUES ($1, $2);', [100, 'no_debe_persistir']);
                throw new Error('Fallo provocado para rollback');
            });

            await expect(intento).rejects.toThrow('Fallo provocado para rollback');

            // Verificar que no se insertó nada
            const filasRaw: unknown = await dataSource.query('SELECT valor FROM prueba_rollback WHERE id = 100;');
            const filas = filasRaw as FilaValor[];
            expect(filas.length).toBe(0);
        } finally {
            await dataSource.query('DROP TABLE IF EXISTS prueba_rollback;');
        }
    });

    it('debe reutilizar la transacción activa en llamadas anidadas sin perder atomicidad', async () => {
        await dataSource.query('CREATE TEMP TABLE prueba_anidada (id INT PRIMARY KEY, valor TEXT);');

        try {
            await unidadTransaccional.ejecutar(async () => {
                const em1 = unidadTransaccional.obtenerEntityManager();
                await em1.query('INSERT INTO prueba_anidada (id, valor) VALUES ($1, $2);', [1, 'primero']);

                // Llamada anidada
                await unidadTransaccional.ejecutar(async () => {
                    const em2 = unidadTransaccional.obtenerEntityManager();
                    expect(em2).toBe(em1); // Mismo gestor transaccional
                    await em2.query('INSERT INTO prueba_anidada (id, valor) VALUES ($1, $2);', [2, 'segundo']);
                });
            });

            const filasRaw: unknown = await dataSource.query('SELECT id FROM prueba_anidada ORDER BY id ASC;');
            const filas = filasRaw as FilaId[];
            expect(filas.length).toBe(2);
            expect(filas[0].id).toBe(1);
            expect(filas[1].id).toBe(2);
        } finally {
            await dataSource.query('DROP TABLE IF EXISTS prueba_anidada;');
        }
    });
});
