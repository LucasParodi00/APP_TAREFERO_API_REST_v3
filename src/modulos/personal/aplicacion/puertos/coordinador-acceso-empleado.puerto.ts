export const COORDINADOR_ACCESO_EMPLEADO = Symbol('COORDINADOR_ACCESO_EMPLEADO');

export interface ResultadoHabilitarAcceso {
    cuentaId: string;
    usuarioId: string;
    rol: string;
    estado: string;
}

export interface CoordinadorAccesoEmpleado {
    habilitarAcceso(params: {
        empresaId: string;
        empleadoId: string;
        rol: string;
        correo: string;
    }): Promise<ResultadoHabilitarAcceso>;

    suspenderYRevocarAcceso(params: { empresaId: string; empleadoId: string; motivo: string }): Promise<void>;

    revocarAcceso(params: { empresaId: string; empleadoId: string }): Promise<void>;
}
