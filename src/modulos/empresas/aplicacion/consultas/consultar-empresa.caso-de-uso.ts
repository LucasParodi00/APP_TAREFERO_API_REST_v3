import { ConsultaEmpresas } from '../puertos/consulta-empresas.puerto';
import { ContextoSolicitud } from '../puertos/contexto-solicitud';
import { EmpresaLectura } from '../modelos-lectura';
import { EmpresaNoEncontrada, PermisoDenegado } from '../errores';

export interface ConsultaConsultarEmpresa {
    idOAlias: string;
}

export class ConsultarEmpresa {
    constructor(private readonly consultaEmpresas: ConsultaEmpresas) {}

    async ejecutar(consulta: ConsultaConsultarEmpresa, contexto: ContextoSolicitud): Promise<EmpresaLectura> {
        const esSuperAdmin = contexto.rol === 'SUPER_ADMINISTRADOR';
        const esAdmin = contexto.rol === 'ADMINISTRADOR';

        if (!esSuperAdmin && !esAdmin) {
            throw new PermisoDenegado();
        }

        const empresa = await this.consultaEmpresas.obtenerPorIdOAlias(consulta.idOAlias);

        if (!empresa) {
            if (esAdmin && contexto.empresaId !== consulta.idOAlias) {
                throw new PermisoDenegado('Un administrador solo puede consultar su propia empresa.');
            }
            throw new EmpresaNoEncontrada(consulta.idOAlias);
        }

        if (esAdmin && contexto.empresaId !== empresa.id) {
            throw new PermisoDenegado('Un administrador solo puede consultar su propia empresa.');
        }

        return empresa;
    }
}
