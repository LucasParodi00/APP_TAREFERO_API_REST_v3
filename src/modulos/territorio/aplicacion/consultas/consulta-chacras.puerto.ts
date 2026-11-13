import { CriteriosPaginacion, ResultadoPaginado } from '../../../../comun/aplicacion';
import { EstadoChacra } from '../../dominio/enumeraciones';
import { ChacraDetalleLectura, ChacraResumenLectura } from '../modelos-lectura';
import { ChacraPublica } from '../puertos/resolvedor-chacra-publico.puerto';

export interface ParametrosListarChacras {
    empresaId: string;
    estado?: EstadoChacra;
    alcanceChacraIds?: string[];
    paginacion: CriteriosPaginacion;
    campoOrden?: 'nombre' | 'nombreCorto' | 'creadoEn';
    direccionOrden?: 'ASC' | 'DESC';
}

export interface ConsultaChacras {
    obtenerDetallePorId(id: string, empresaId: string): Promise<ChacraDetalleLectura | null>;
    listar(params: ParametrosListarChacras): Promise<ResultadoPaginado<ChacraResumenLectura>>;
    resolverPublicoPorId?(id: string): Promise<ChacraPublica | null>;
}

export const TOKEN_CONSULTA_CHACRAS = Symbol('TOKEN_CONSULTA_CHACRAS');
