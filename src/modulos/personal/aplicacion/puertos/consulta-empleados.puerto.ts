import { CriteriosPaginacion, ResultadoPaginado } from '../../../../comun/aplicacion';
import { EmpleadoResumenLectura, EmpleadoDetalleLectura } from '../modelos-lectura';

export const CONSULTA_EMPLEADOS = Symbol('CONSULTA_EMPLEADOS');

export interface FiltrosListadoEmpleados {
    estado?: string;
    terminoBusqueda?: string;
}

export interface ConsultaEmpleados {
    listar(
        empresaId: string,
        criterios: CriteriosPaginacion,
        filtros?: FiltrosListadoEmpleados,
    ): Promise<ResultadoPaginado<EmpleadoResumenLectura>>;

    buscarDetallePorId(empresaId: string, id: string): Promise<EmpleadoDetalleLectura | null>;
}
