import { DataSource, DataSourceOptions } from 'typeorm';

export type OpcionesDataSourcePostgres = Extract<
    DataSourceOptions,
    { type: 'postgres' }
>;

export function crearOpcionesDataSource(
    parcial?: Partial<OpcionesDataSourcePostgres>,
): OpcionesDataSourcePostgres {
    const host = process.env.DB_HOST ?? 'localhost';
    const port = Number(process.env.DB_PORT ?? 5432);
    const username =
        process.env.DB_USER ?? process.env.DB_USERNAME ?? 'postgres';
    const password = process.env.DB_PASSWORD ?? 'postgres';
    const database =
        process.env.DB_NAME ?? process.env.DB_DATABASE ?? 'tarefero';
    const logging = process.env.DB_LOGGING === 'true';

    const opcionesBase: OpcionesDataSourcePostgres = {
        type: 'postgres',
        host,
        port,
        username,
        password,
        database,
        synchronize: false,
        logging,
        entities: [],
        migrations: [__dirname + '/../../../../migraciones/**/*.{ts,js}'],
    };

    return {
        ...opcionesBase,
        ...(parcial ?? {}),
        type: 'postgres',
        synchronize: false, // Inmutable: jamás synchronize: true
    };
}

export function crearDataSource(
    parcial?: Partial<OpcionesDataSourcePostgres>,
): DataSource {
    return new DataSource(crearOpcionesDataSource(parcial));
}
