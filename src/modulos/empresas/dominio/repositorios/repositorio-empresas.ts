import { Empresa } from '../agregados/empresa';

export const REPOSITORIO_EMPRESAS = Symbol('REPOSITORIO_EMPRESAS');

export interface RepositorioEmpresas {
    guardar(empresa: Empresa): Promise<void>;
    obtenerPorId(id: string): Promise<Empresa | null>;
    existeAlias(alias: string): Promise<boolean>;
}
