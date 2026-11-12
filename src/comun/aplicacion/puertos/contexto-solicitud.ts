export interface ContextoSoporte {
    readonly usuarioPlataformaId: string;
    readonly sesionId: string;
    readonly motivo: string;
    readonly venceEn: Date | string;
}

export interface ContextoSolicitud {
    readonly solicitudId: string;
    readonly actorId: string;
    readonly cuentaEmpresaId?: string;
    readonly empresaId?: string;
    readonly sesionId?: string;
    readonly roles: readonly string[];
    readonly permisos: readonly string[];
    readonly alcance?: unknown;
    readonly empleadoId?: string;
    readonly soporte?: ContextoSoporte;
}
