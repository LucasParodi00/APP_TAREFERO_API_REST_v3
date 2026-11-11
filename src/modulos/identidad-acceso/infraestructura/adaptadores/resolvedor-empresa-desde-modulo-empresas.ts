import { ResolvedorEmpresa, EmpresaAcceso } from '../../aplicacion/puertos/resolvedor-empresa.puerto';
import { ResolvedorEmpresaPublico } from '../../../empresas/aplicacion/puertos/resolvedor-empresa-publico.puerto';

export class ResolvedorEmpresaDesdeModuloEmpresas implements ResolvedorEmpresa {
    constructor(private readonly resolvedorEmpresaPublico: ResolvedorEmpresaPublico) {}

    async buscarPorId(empresaId: string): Promise<EmpresaAcceso | null> {
        const empresa = await this.resolvedorEmpresaPublico.resolverPorId(empresaId);
        if (!empresa) {
            return null;
        }

        return {
            id: empresa.id,
            alias: empresa.alias,
            estado: empresa.estado,
        };
    }

    async buscarPorAlias(alias: string): Promise<EmpresaAcceso | null> {
        const empresa = await this.resolvedorEmpresaPublico.resolverPorAlias(alias);
        if (!empresa) {
            return null;
        }

        return {
            id: empresa.id,
            alias: empresa.alias,
            estado: empresa.estado,
        };
    }
}
