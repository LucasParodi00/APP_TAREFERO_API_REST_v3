import { DataSource, DataSourceOptions } from 'typeorm';

export function crearOpcionesDataSource(parcial?: Partial<DataSourceOptions>): DataSourceOptions {
    const host = process.env.DB_HOST ?? 'localhost';
    const port = Number(process.env.DB_PORT ?? 5432);
    const username = process.env.DB_USER ?? process.env.DB_USERNAME ?? 'postgres';
    const password = process.env.DB_PASSWORD ?? 'postgres';
    const database = process.env.DB_NAME ?? process.env.DB_DATABASE ?? 'tarefero';
    const logging = process.env.DB_LOGGING === 'true';

    const opcionesBase: DataSourceOptions = {
        type: 'postgres',
        host,
        port,
        username,
        password,
        database,
        synchronize: false,
        logging,
        entities: [],
        migrations: [
            // Soporta migraciones en raíz TypeScript y compiladas JavaScript
            __dirname + '/../../../../migraciones/**/*.{ts,js}',
        ],
    };

    return {
        ...opcionesBase,
        ...(parcial ?? {}),
        type: 'postgres',
        synchronize: false, // Inmutable: jamás synchronize: true
    };
}

export function crearDataSource(parcial?: Partial<DataSourceOptions>): DataSource {
    return new DataSource(crearOpcionesDataSource(parcial));
}
