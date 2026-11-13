import { EstadoChacra } from '../../dominio/enumeraciones';

export interface ChacraPublica {
    id: string;
    empresaId: string;
    estado: EstadoChacra;
}

export interface ResolvedorChacraPublico {
    resolverPorId(chacraId: string): Promise<ChacraPublica | null>;
}

export const TOKEN_RESOLVEDOR_CHACRA_PUBLICO = Symbol('TOKEN_RESOLVEDOR_CHACRA_PUBLICO');
