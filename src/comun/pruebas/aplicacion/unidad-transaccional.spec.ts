import { UNIDAD_TRANSACCIONAL, UnidadTransaccional } from '../../aplicacion';

describe('Aplicación Común - UnidadTransaccional', () => {
    it('debe definir el símbolo de inyección UNIDAD_TRANSACCIONAL', () => {
        expect(typeof UNIDAD_TRANSACCIONAL).toBe('symbol');
    });

    it('debe permitir implementar dobles de prueba y ejecutar callbacks exitosos', async () => {
        class DobleUnidadTransaccional implements UnidadTransaccional {
            transaccionActiva = false;

            async ejecutar<T>(operacion: () => Promise<T>): Promise<T> {
                this.transaccionActiva = true;
                try {
                    return await operacion();
                } finally {
                    this.transaccionActiva = false;
                }
            }
        }

        const ut: UnidadTransaccional = new DobleUnidadTransaccional();
        let efecto = 0;

        const resultado = await ut.ejecutar(async () => {
            efecto += 1;
            await Promise.resolve();
            return 'exito';
        });

        expect(resultado).toBe('exito');
        expect(efecto).toBe(1);
    });

    it('debe propagar excepciones lanzadas dentro del callback para permitir rollback', async () => {
        class DobleUnidadTransaccionalConRollback implements UnidadTransaccional {
            hizoRollback = false;

            async ejecutar<T>(operacion: () => Promise<T>): Promise<T> {
                try {
                    return await operacion();
                } catch (error) {
                    this.hizoRollback = true;
                    throw error;
                }
            }
        }

        const doble = new DobleUnidadTransaccionalConRollback();
        const errorEsperado = new Error('Fallo de negocio en caso de uso');

        await expect(
            doble.ejecutar(async () => {
                await Promise.resolve();
                throw errorEsperado;
            }),
        ).rejects.toThrow('Fallo de negocio en caso de uso');

        expect(doble.hizoRollback).toBe(true);
    });
});
