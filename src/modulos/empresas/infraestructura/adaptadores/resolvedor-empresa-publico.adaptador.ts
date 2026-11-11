import { ConsultaEmpresas } from '../../aplicacion/puertos/consulta-empresas.puerto';
import { ResolvedorEmpresaPublico, EmpresaPublicaLectura } from '../../aplicacion/puertos/resolvedor-empresa-publico.puerto';

export class AdaptadorResolvedorEmpresaPublico implements ResolvedorEmpresaPublico {
    constructor(private readonly consultaEmpresas: ConsultaEmpresas) {}

    async resolverPorId(id: string): Promise<EmpresaPublicaLectura | null> {
        const empresa = await this.consultaEmpresas.obtenerPorIdOAlias(id);
        if (!empresa) {
            return null;
        }

        return {
            id: empresa.id,
            alias: empresa.alias,
            estado: empresa.estado as 'ACTIVA' | 'SUSPENDIDA' | 'CERRADA',
        };
    }

    async resolverPorAlias(alias: string): Promise<EmpresaPublicaLectura | null> {
        const empresa = await this.consultaEmpresas.obtenerPorIdOAlias(alias);
        if (!empresa) {
            return null;
        }

        return {
            id: empresa.id,
            alias: empresa.alias,
            estado: empresa.estado as 'ACTIVA' | 'SUSPENDIDA' | 'CERRADA',
        };
    }
}
