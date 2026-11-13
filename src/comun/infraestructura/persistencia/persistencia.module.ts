import { Global, Module, OnModuleDestroy, Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { crearDataSource } from './configuracion-typeorm';
import { UNIDAD_TRANSACCIONAL } from '../../aplicacion/puertos/unidad-transaccional.puerto';
import { UnidadTransaccionalTypeOrm } from './unidad-transaccional.typeorm';

const proveedorDataSource: Provider = {
    provide: DataSource,
    useFactory: async (): Promise<DataSource> => {
        const dataSource = crearDataSource();
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
        }
        return dataSource;
    },
};

const proveedorUnidadTransaccional: Provider = {
    provide: UNIDAD_TRANSACCIONAL,
    useFactory: (dataSource: DataSource): UnidadTransaccionalTypeOrm => {
        return new UnidadTransaccionalTypeOrm(dataSource);
    },
    inject: [DataSource],
};

@Global()
@Module({
    providers: [proveedorDataSource, proveedorUnidadTransaccional],
    exports: [DataSource, UNIDAD_TRANSACCIONAL],
})
export class PersistenciaModule implements OnModuleDestroy {
    constructor(private readonly dataSource: DataSource) {}

    async onModuleDestroy(): Promise<void> {
        if (this.dataSource.isInitialized) {
            await this.dataSource.destroy();
        }
    }
}
