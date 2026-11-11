import {
    ConsultaCuentasEmpresa,
    FiltrosListarCuentas,
    ResultadoListadoCuentas,
} from '../puertos/consulta-cuentas-empresa.puerto';
import { ContextoSolicitud } from '../puertos/contexto-solicitud';
import { AccesoDenegado } from '../errores/errores-aplicacion';
import { EmpresaFueraDeAlcance } from '../../dominio/errores/errores-identidad-acceso';

export class ConsultarCuentasEmpresa {
    constructor(private readonly consultaCuentas: ConsultaCuentasEmpresa) {}

    async ejecutar(
        empresaId: string,
        filtros: FiltrosListarCuentas,
        contexto: ContextoSolicitud,
    ): Promise<ResultadoListadoCuentas> {
        if (!contexto.permisos.includes('ACC-UC-008')) {
            throw new AccesoDenegado('No tiene permisos para consultar Cuentas de Empresa.');
        }

        if (contexto.empresaId !== empresaId) {
            throw new EmpresaFueraDeAlcance('La Empresa solicitada no coincide con el contexto autorizado.');
        }

        return this.consultaCuentas.listarCuentas(empresaId, filtros);
    }
}
