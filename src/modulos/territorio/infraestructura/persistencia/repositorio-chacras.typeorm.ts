import { Repository } from 'typeorm';
import { RepositorioChacras } from '../../dominio/repositorios';
import { Chacra } from '../../dominio/agregados';
import { ChacraTypeOrmEntity } from './chacra.typeorm-entity';
import { MapeadorChacraTypeOrm } from './mapeador-chacra.typeorm';

export class RepositorioChacrasTypeOrm implements RepositorioChacras {
    constructor(private readonly repo: Repository<ChacraTypeOrmEntity>) {}

    async guardar(chacra: Chacra): Promise<void> {
        const entity = MapeadorChacraTypeOrm.aPersistencia(chacra);
        await this.repo.save(entity);
    }

    async obtenerPorId(id: string, empresaId: string): Promise<Chacra | null> {
        const entity = await this.repo.findOne({
            where: { id, empresaId },
        });

        if (!entity) {
            return null;
        }

        return MapeadorChacraTypeOrm.aDominio(entity);
    }

    async existePorNombreCorto(empresaId: string, claveNormalizada: string, excluirId?: string): Promise<boolean> {
        const query = this.repo
            .createQueryBuilder('c')
            .where('c.empresa_id = :empresaId', { empresaId })
            .andWhere('c.nombre_corto_normalizado = :claveNormalizada', { claveNormalizada });

        if (excluirId) {
            query.andWhere('c.id != :excluirId', { excluirId });
        }

        const count = await query.getCount();
        return count > 0;
    }
}
