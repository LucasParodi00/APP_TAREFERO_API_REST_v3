import {
    ConsultaIntervencionesSoporte,
    FiltrosListarIntervenciones,
    ResultadoListadoIntervenciones,
} from '../puertos/consulta-intervenciones-soporte.puerto';
import { ContextoSolicitud } from '../puertos/contexto-solicitud';
import { AccesoDenegado } from '../errores/errores-aplicacion';
import { EmpresaFueraDeAlcance } from '../../dominio/errores/errores-identidad-acceso';

export class ConsultarIntervencionesSoporte {
    constructor(private readonly consultaIntervenciones: ConsultaIntervencionesSoporte) {}

    async ejecutar(
        empresaId: string,
        filtros: FiltrosListarIntervenciones,
        contexto: ContextoSolicitud,
    ): Promise<ResultadoListadoIntervenciones> {
        if (!contexto.permisos.includes('ACC-UC-011')) {
            throw new AccesoDenegado('No tiene permisos para consultar intervenciones de soporte.');
        }

        const esSuperAdmin = contexto.rol === 'SUPER_ADMINISTRADOR';
        const esMismaEmpresa = contexto.empresaId === empresaId;

        if (!esSuperAdmin && !esMismaEmpresa) {
            throw new EmpresaFueraDeAlcance('No puede consultar intervenciones de otra Empresa.');
        }

        return this.consultaIntervenciones.listarIntervenciones(empresaId, filtros);
    }
}
