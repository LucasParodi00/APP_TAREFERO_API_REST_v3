export const UNIDAD_TRANSACCIONAL = Symbol('UNIDAD_TRANSACCIONAL');

export interface UnidadTransaccional {
    /**
     * Ejecuta una operación atómica dentro de una transacción.
     * Si la operación arroja un error, se produce un rollback automático.
     * Si ya existe una transacción activa en el contexto actual, se reutiliza.
     */
    ejecutar<T>(operacion: () => Promise<T>): Promise<T>;
}
