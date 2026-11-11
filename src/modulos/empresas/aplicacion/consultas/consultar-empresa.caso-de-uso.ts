import { RepositorioEmpresas } from '../puertos/salida/repositorio-empresas.puerto';
import { ContextoSolicitud } from '../puertos/comunes/contexto-solicitud';
import { EmpresaLectura } from '../modelos-lectura';
import { EmpresaNoEncontrada, PermisoDenegado } from '../errores';
import { MapeadorEmpresaLectura } from '../mapeadores/mapeador-empresa-lectura';

export interface ConsultaConsultarEmpresa {
    idOAlias: string;
}

export class ConsultarEmpresa {
    constructor(private readonly repositorio: RepositorioEmpresas) {}

    async ejecutar(consulta: ConsultaConsultarEmpresa, contexto: ContextoSolicitud): Promise<EmpresaLectura> {
        const esSuperAdmin = contexto.rol === 'SUPER_ADMINISTRADOR';
        const esAdmin = contexto.rol === 'ADMINISTRADOR';

        if (!esSuperAdmin && !esAdmin) {
            throw new PermisoDenegado();
        }

        let empresa = await this.repositorio.obtenerPorId(consulta.idOAlias);
        if (!empresa) {
            empresa = await this.repositorio.obtenerPorAlias(consulta.idOAlias);
        }

        if (!empresa) {
            if (esAdmin && contexto.empresaId !== consulta.idOAlias) {
                throw new PermisoDenegado('Un administrador solo puede consultar su propia empresa.');
            }
            throw new EmpresaNoEncontrada(consulta.idOAlias);
        }

        if (esAdmin && contexto.empresaId !== empresa.id) {
            throw new PermisoDenegado('Un administrador solo puede consultar su propia empresa.');
        }

        return MapeadorEmpresaLectura.aLectura(empresa);
    }
}
