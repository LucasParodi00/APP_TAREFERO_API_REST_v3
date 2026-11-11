export const VERIFICADOR_EMPLEADO = Symbol('VERIFICADOR_EMPLEADO');

export interface VerificadorEmpleado {
    verificarEmpleadoActivo(empresaId: string, empleadoId: string): Promise<boolean>;
}
