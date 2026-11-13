export const VERIFICADOR_CUPO_EMPLEADOS = Symbol('VERIFICADOR_CUPO_EMPLEADOS');

export interface VerificadorCupoEmpleados {
    verificarCupoDisponible(empresaId: string, activosActuales: number): Promise<boolean>;
}
