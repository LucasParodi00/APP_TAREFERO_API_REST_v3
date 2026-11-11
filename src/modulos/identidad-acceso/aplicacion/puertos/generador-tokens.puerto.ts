export const GENERADOR_TOKENS = Symbol('GENERADOR_TOKENS');

export interface PayloadTokenTenant {
    sub: string;
    empresaId: string;
    sesionId: string;
    rol: string;
    roles: string[];
    canal: string;
}

export interface PayloadTokenPlataforma {
    sub: string;
    rol: 'SUPER_ADMINISTRADOR';
    sesionId: string;
}

export interface PayloadTokenVerificado {
    sub: string;
    aud: string;
    rol: string;
    empresaId?: string;
    sesionId?: string;
}

export interface GeneradorTokens {
    generarTokenAccesoTenant(payload: PayloadTokenTenant): Promise<string>;
    generarTokenAccesoPlataforma(payload: PayloadTokenPlataforma): Promise<string>;
    generarTokenRenovacion(): string;
    verificarTokenAcceso(token: string): Promise<PayloadTokenVerificado>;
}
