/* eslint-disable @typescript-eslint/unbound-method */
import { DataSource, EntityManager } from 'typeorm';
import { crearOpcionesDataSource, UnidadTransaccionalTypeOrm } from '../../infraestructura';

describe('Infraestructura Común - Persistencia y Transacciones TypeORM', () => {
    describe('crearOpcionesDataSource', () => {
        it('debe configurar siempre synchronize en false independientemente de los parámetros provistos', () => {
            const opcionesDefault = crearOpcionesDataSource();
            expect(opcionesDefault.type).toBe('postgres');
            expect(opcionesDefault.synchronize).toBe(false);

            // Incluso si se intenta pasar synchronize: true, debe prevalecer la regla de no-sincronización
            const opcionesForzadas = crearOpcionesDataSource({
                synchronize: true,
            });
            expect(opcionesForzadas.synchronize).toBe(false);
        });

        it('debe incorporar variables de entorno o valores por defecto para host, port y database', () => {
            const opciones = crearOpcionesDataSource({
                database: 'tarefero_test',
            });
            expect(opciones.database).toBe('tarefero_test');
            expect(opciones.type).toBe('postgres');
        });
    });

    describe('UnidadTransaccionalTypeOrm', () => {
        let mockDataSource: jest.Mocked<DataSource>;
        let mockEntityManager: jest.Mocked<EntityManager>;
        let mockTransactionalEntityManager: jest.Mocked<EntityManager>;
        let ut: UnidadTransaccionalTypeOrm;

        beforeEach(() => {
            mockEntityManager = {} as unknown as jest.Mocked<EntityManager>;
            mockTransactionalEntityManager = {} as unknown as jest.Mocked<EntityManager>;

            mockDataSource = {
                manager: mockEntityManager,
                transaction: jest.fn().mockImplementation(async (callback: (em: EntityManager) => Promise<unknown>) => {
                    return await callback(mockTransactionalEntityManager);
                }),
            } as unknown as jest.Mocked<DataSource>;

            ut = new UnidadTransaccionalTypeOrm(mockDataSource);
        });

        it('debe ejecutar la operación dentro de dataSource.transaction y retornar su resultado', async () => {
            expect(ut.estaEnTransaccion()).toBe(false);
            expect(ut.obtenerEntityManager()).toBe(mockEntityManager);

            let emEnCallback: EntityManager | null = null;
            let estabaEnTx = false;

            const resultado = await ut.ejecutar(async () => {
                await Promise.resolve();
                estabaEnTx = ut.estaEnTransaccion();
                emEnCallback = ut.obtenerEntityManager();
                return 12345;
            });

            expect(resultado).toBe(12345);
            expect(estabaEnTx).toBe(true);
            expect(emEnCallback).toBe(mockTransactionalEntityManager);
            expect(ut.estaEnTransaccion()).toBe(false);
            expect(ut.obtenerEntityManager()).toBe(mockEntityManager);
            expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
        });

        it('debe reutilizar la transacción activa en llamadas anidadas sin abrir transacciones secundarias', async () => {
            let nivelInternoEnTx = false;
            let emInterno: EntityManager | null = null;

            const resultado = await ut.ejecutar(async () => {
                return await ut.ejecutar(async () => {
                    await Promise.resolve();
                    nivelInternoEnTx = ut.estaEnTransaccion();
                    emInterno = ut.obtenerEntityManager();
                    return 'anidado';
                });
            });

            expect(resultado).toBe('anidado');
            expect(nivelInternoEnTx).toBe(true);
            expect(emInterno).toBe(mockTransactionalEntityManager);
            // Solo una llamada a dataSource.transaction
            expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
        });

        it('debe propagar errores y asegurar que el estado transaccional se libere tras una falla', async () => {
            const errorEsperado = new Error('Fallo simulado en transacción');

            await expect(
                ut.ejecutar(async () => {
                    await Promise.resolve();
                    expect(ut.estaEnTransaccion()).toBe(true);
                    throw errorEsperado;
                }),
            ).rejects.toThrow('Fallo simulado en transacción');

            expect(ut.estaEnTransaccion()).toBe(false);
            expect(ut.obtenerEntityManager()).toBe(mockEntityManager);
        });
    });
});
