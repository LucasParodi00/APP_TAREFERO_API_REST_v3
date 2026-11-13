import { AsyncLocalStorage } from 'node:async_hooks';
import { DataSource, EntityManager } from 'typeorm';
import { UnidadTransaccional } from '../../aplicacion/puertos/unidad-transaccional.puerto';

export class UnidadTransaccionalTypeOrm implements UnidadTransaccional {
    private readonly almacenamientoLocal = new AsyncLocalStorage<EntityManager>();

    constructor(private readonly dataSource: DataSource) {}

    async ejecutar<T>(operacion: () => Promise<T>): Promise<T> {
        const transaccionActiva = this.almacenamientoLocal.getStore();
        if (transaccionActiva) {
            // Reutiliza la transacción vigente (D-01, D-03)
            return await operacion();
        }

        return await this.dataSource.transaction(async (gestorTransaccional: EntityManager): Promise<T> => {
            return await this.almacenamientoLocal.run(gestorTransaccional, operacion);
        });
    }

    obtenerEntityManager(): EntityManager {
        return this.almacenamientoLocal.getStore() ?? this.dataSource.manager;
    }

    estaEnTransaccion(): boolean {
        return Boolean(this.almacenamientoLocal.getStore());
    }
}
