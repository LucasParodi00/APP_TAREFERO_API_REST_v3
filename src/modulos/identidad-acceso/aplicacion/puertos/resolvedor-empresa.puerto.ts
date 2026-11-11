export const RESOLVEDOR_EMPRESA = Symbol('RESOLVEDOR_EMPRESA');

export interface EmpresaAcceso {
    id: string;
    alias: string;
    estado: 'ACTIVA' | 'SUSPENDIDA' | 'CERRADA';
}

export interface ResolvedorEmpresa {
    buscarPorId(empresaId: string): Promise<EmpresaAcceso | null>;
    buscarPorAlias(alias: string): Promise<EmpresaAcceso | null>;
}
