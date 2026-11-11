export const RESOLVEDOR_EMPRESA_PUBLICO = Symbol('RESOLVEDOR_EMPRESA_PUBLICO');

export interface EmpresaPublicaLectura {
    id: string;
    alias: string;
    estado: 'ACTIVA' | 'SUSPENDIDA' | 'CERRADA';
}

export interface ResolvedorEmpresaPublico {
    resolverPorId(id: string): Promise<EmpresaPublicaLectura | null>;
    resolverPorAlias(alias: string): Promise<EmpresaPublicaLectura | null>;
}
