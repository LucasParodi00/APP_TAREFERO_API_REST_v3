import { Empresa } from '../../../dominio/agregados/empresa';
import {
  CriteriosListadoEmpresas,
  ResultadoListadoEmpresas,
} from '../../modelos-lectura';

export const REPOSITORIO_EMPRESAS = Symbol('REPOSITORIO_EMPRESAS');

export interface RepositorioEmpresas {
  guardar(empresa: Empresa): Promise<void>;
  obtenerPorId(id: string): Promise<Empresa | null>;
  obtenerPorAlias(alias: string): Promise<Empresa | null>;
  existeAlias(alias: string): Promise<boolean>;
  listar(
    criterios: CriteriosListadoEmpresas,
  ): Promise<ResultadoListadoEmpresas>;
}
