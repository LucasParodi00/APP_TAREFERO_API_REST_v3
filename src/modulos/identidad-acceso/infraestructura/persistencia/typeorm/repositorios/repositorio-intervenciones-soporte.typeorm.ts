import { Repository } from 'typeorm';
import { RepositorioIntervencionesSoporte } from '../../../../dominio/repositorios/repositorio-intervenciones-soporte';
import { IntervencionSoporte } from '../../../../dominio/entidades/intervencion-soporte.entidad';
import { IntervencionSoporteTypeOrmEntity } from '../entidades/intervencion-soporte.typeorm-entity';
import { MapeadorIntervencionSoporteTypeOrm } from '../mapeadores/mapeador-intervencion-soporte.typeorm';

export class RepositorioIntervencionesSoporteTypeOrm implements RepositorioIntervencionesSoporte {
    constructor(private readonly repository: Repository<IntervencionSoporteTypeOrmEntity>) {}

    async guardar(intervencion: IntervencionSoporte): Promise<void> {
        const entity = MapeadorIntervencionSoporteTypeOrm.aPersistencia(intervencion);
        await this.repository.save(entity);
    }

    async buscarPorId(id: string): Promise<IntervencionSoporte | null> {
        const entity = await this.repository.findOne({
            where: { id },
        });

        if (!entity) {
            return null;
        }

        return MapeadorIntervencionSoporteTypeOrm.aDominio(entity);
    }
}
