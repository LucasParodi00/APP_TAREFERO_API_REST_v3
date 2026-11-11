import { Repository } from 'typeorm';
import { RepositorioEmpresas } from '../../dominio/repositorios/repositorio-empresas';
import { Empresa } from '../../dominio/agregados/empresa';
import { EmpresaTypeOrmEntity } from './empresa.typeorm-entity';
import { MapeadorEmpresaTypeOrm } from './mapeador-empresa.typeorm';

export class RepositorioEmpresasTypeOrm implements RepositorioEmpresas {
    constructor(private readonly repository: Repository<EmpresaTypeOrmEntity>) {}

    async guardar(empresa: Empresa): Promise<void> {
        const entidad = MapeadorEmpresaTypeOrm.aPersistencia(empresa);
        await this.repository.save(entidad);
    }

    async obtenerPorId(id: string): Promise<Empresa | null> {
        const entidad = await this.repository.findOne({
            where: { id },
            relations: { configuracionGeneral: true },
        });

        if (!entidad) {
            return null;
        }

        return MapeadorEmpresaTypeOrm.aDominio(entidad);
    }

    async existeAlias(alias: string): Promise<boolean> {
        const cantidad = await this.repository.count({
            where: { alias },
        });
        return cantidad > 0;
    }
}
