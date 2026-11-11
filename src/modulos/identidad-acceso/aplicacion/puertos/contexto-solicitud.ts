export interface ContextoSoporte {
    usuarioPlataformaId: string;
    sesionId: string;
    motivo: string;
    venceEn: Date;
}

export interface ContextoSolicitud {
    actorId: string;
    rol: string;
    permisos: string[];
    empresaId?: string;
    sesionId?: string;
    empleadoId?: string;
    soporte?: ContextoSoporte;
}
