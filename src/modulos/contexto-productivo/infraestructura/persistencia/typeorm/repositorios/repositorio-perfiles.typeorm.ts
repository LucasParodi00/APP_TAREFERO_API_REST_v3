import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PerfilCultivo } from '../../../../dominio/entidades/perfil-cultivo';
import { AlcancePerfil } from '../../../../dominio/enumeraciones/alcance-perfil';
import { RepositorioPerfiles } from '../../../../aplicacion/puertos/salida/repositorio-perfiles.puerto';
import { PerfilCultivoTypeOrmEntidad } from '../entidades/perfil-cultivo.typeorm-entidad';
import { PerfilCultivoMapeador } from '../mapeadores/perfil-cultivo.mapeador';

@Injectable()
export class RepositorioPerfilesTypeOrm implements RepositorioPerfiles {
  private readonly repositorio: Repository<PerfilCultivoTypeOrmEntidad>;

  public constructor(private readonly dataSource: DataSource) {
    this.repositorio = this.dataSource.getRepository(
      PerfilCultivoTypeOrmEntidad,
    );
  }

  public async guardar(perfil: PerfilCultivo): Promise<void> {
    const entidad = PerfilCultivoMapeador.aPersistencia(perfil);
    await this.repositorio.save(entidad);
  }

  public async buscarPorId(id: string): Promise<PerfilCultivo | null> {
    const entidad = await this.repositorio.findOne({ where: { id } });
    return entidad ? PerfilCultivoMapeador.aDominio(entidad) : null;
  }

  public async obtenerSiguienteNumeroVersion(
    cultivoId: string,
    alcance: AlcancePerfil,
    empresaId: string | null,
    loteId: string | null,
  ): Promise<number> {
    const qb = this.repositorio.createQueryBuilder('p');
    qb.select('MAX(p.version)', 'maxVersion');
    qb.where('p.cultivo_id = :cultivoId', { cultivoId });
    qb.andWhere('p.alcance = :alcance', { alcance });

    if (empresaId) {
      qb.andWhere('p.empresa_id = :empresaId', { empresaId });
    } else {
      qb.andWhere('p.empresa_id IS NULL');
    }

    if (loteId) {
      qb.andWhere('p.lote_id = :loteId', { loteId });
    } else {
      qb.andWhere('p.lote_id IS NULL');
    }

    const resultado = (await qb.getRawOne<{ maxVersion: number | null }>()) ?? {
      maxVersion: null,
    };
    const max = Number(resultado.maxVersion ?? 0);
    return max + 1;
  }

  public async buscarPorLineaYVersion(
    cultivoId: string,
    alcance: AlcancePerfil,
    empresaId: string | null,
    loteId: string | null,
    version: number,
  ): Promise<PerfilCultivo | null> {
    const qb = this.repositorio.createQueryBuilder('p');
    qb.where('p.cultivo_id = :cultivoId', { cultivoId });
    qb.andWhere('p.alcance = :alcance', { alcance });
    qb.andWhere('p.version = :version', { version });

    if (empresaId) {
      qb.andWhere('p.empresa_id = :empresaId', { empresaId });
    } else {
      qb.andWhere('p.empresa_id IS NULL');
    }

    if (loteId) {
      qb.andWhere('p.lote_id = :loteId', { loteId });
    } else {
      qb.andWhere('p.lote_id IS NULL');
    }

    const entidad = await qb.getOne();
    return entidad ? PerfilCultivoMapeador.aDominio(entidad) : null;
  }
}
