import { Chacra } from '../agregados';

export interface RepositorioChacras {
    guardar(chacra: Chacra): Promise<void>;
    obtenerPorId(id: string, empresaId: string): Promise<Chacra | null>;
    existePorNombreCorto(empresaId: string, claveNormalizada: string, excluirId?: string): Promise<boolean>;
}

export const TOKEN_REPOSITORIO_CHACRAS = Symbol('TOKEN_REPOSITORIO_CHACRAS');
