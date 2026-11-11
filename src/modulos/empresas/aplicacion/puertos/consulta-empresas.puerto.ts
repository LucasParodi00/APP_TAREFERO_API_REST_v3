import { CriteriosListadoEmpresas, ResultadoListadoEmpresas, EmpresaLectura } from '../modelos-lectura';

export const CONSULTA_EMPRESAS = Symbol('CONSULTA_EMPRESAS');

export interface ConsultaEmpresas {
    obtenerPorIdOAlias(idOAlias: string): Promise<EmpresaLectura | null>;
    listar(criterios: CriteriosListadoEmpresas): Promise<ResultadoListadoEmpresas>;
}
