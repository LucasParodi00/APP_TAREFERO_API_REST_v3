import { DataSource, Repository } from 'typeorm';
import { RepositorioChacras } from '../../../../aplicacion/puertos/salida/repositorio-chacras';
import { Chacra } from '../../../../dominio/entidades/chacra';
import { ChacraTypeOrmEntidad } from '../entidades/chacra.typeorm-entidad';
import { MapeadorChacra } from '../mapeadores/mapeador-chacra';

export class RepositorioChacrasTypeOrm implements RepositorioChacras {
  private readonly repoChacra: Repository<ChacraTypeOrmEntidad>;

  constructor(private readonly dataSource: DataSource) {
    this.repoChacra = this.dataSource.getRepository(ChacraTypeOrmEntidad);
  }

  public async guardar(chacra: Chacra): Promise<void> {
    const entidad = MapeadorChacra.aPersistencia(chacra);
    await this.repoChacra.save(entidad);
  }

  public async buscarPorId(
    empresaId: string,
    id: string,
  ): Promise<Chacra | null> {
    const entidad = await this.repoChacra.findOneBy({ empresaId, id });
    if (!entidad) {
      return null;
    }
    return MapeadorChacra.aDominio(entidad);
  }

  public async buscarPorIdConBloqueo(
    empresaId: string,
    id: string,
  ): Promise<Chacra | null> {
    return await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(ChacraTypeOrmEntidad);
      const entidad = await repo
        .createQueryBuilder('chacra')
        .setLock('pessimistic_write')
        .where('chacra.empresa_id = :empresaId', { empresaId })
        .andWhere('chacra.id = :id', { id })
        .getOne();

      if (!entidad) {
        return null;
      }
      return MapeadorChacra.aDominio(entidad);
    });
  }

  public async existeNombreCorto(
    empresaId: string,
    nombreCortoClave: string,
    excluirId?: string,
  ): Promise<boolean> {
    const qb = this.repoChacra
      .createQueryBuilder('chacra')
      .where('chacra.empresa_id = :empresaId', { empresaId })
      .andWhere('chacra.nombre_corto_clave = :nombreCortoClave', {
        nombreCortoClave,
      });

    if (excluirId) {
      qb.andWhere('chacra.id != :excluirId', { excluirId });
    }

    const count = await qb.getCount();
    return count > 0;
  }
}
