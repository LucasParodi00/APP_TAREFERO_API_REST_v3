export const VERIFICADOR_EMPLEADO_PUBLICO = Symbol('VERIFICADOR_EMPLEADO_PUBLICO');

export interface EmpleadoPublicoLectura {
    id: string;
    empresaId: string;
    estado: 'ACTIVO' | 'INACTIVO';
    nombre: string;
    apellido: string;
    documento: string;
}

export interface VerificadorEmpleadoPublico {
    verificarEmpleadoActivo(empresaId: string, empleadoId: string): Promise<boolean>;
    obtenerEmpleadoPublico(empresaId: string, empleadoId: string): Promise<EmpleadoPublicoLectura | null>;
}
