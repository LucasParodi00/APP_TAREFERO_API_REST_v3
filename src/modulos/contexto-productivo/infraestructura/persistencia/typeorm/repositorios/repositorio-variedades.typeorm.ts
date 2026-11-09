import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Variedad } from '../../../../dominio/entidades/variedad';
import {
  RepositorioVariedades,
  OpcionesListadoVariedades,
  ResultadoListadoVariedades,
} from '../../../../aplicacion/puertos/salida/repositorio-variedades.puerto';
import { VariedadTypeOrmEntidad } from '../entidades/variedad.typeorm-entidad';
import { VariedadMapeador } from '../mapeadores/variedad.mapeador';

@Injectable()
export class RepositorioVariedadesTypeOrm implements RepositorioVariedades {
  private readonly repositorio: Repository<VariedadTypeOrmEntidad>;

  public constructor(private readonly dataSource: DataSource) {
    this.repositorio = this.dataSource.getRepository(VariedadTypeOrmEntidad);
  }

  public async guardar(variedad: Variedad): Promise<void> {
    const entidad = VariedadMapeador.aPersistencia(variedad);
    await this.repositorio.save(entidad);
  }

  public async buscarPorId(
    cultivoId: string,
    id: string,
  ): Promise<Variedad | null> {
    const entidad = await this.repositorio.findOne({
      where: { cultivoId, id },
    });
    return entidad ? VariedadMapeador.aDominio(entidad) : null;
  }

  public async buscarPorCodigo(
    cultivoId: string,
    codigo: string,
  ): Promise<Variedad | null> {
    const entidad = await this.repositorio.findOne({
      where: { cultivoId, codigo: Variedad.normalizarCodigo(codigo) },
    });
    return entidad ? VariedadMapeador.aDominio(entidad) : null;
  }

  public async buscarPorNombreNormalizado(
    cultivoId: string,
    nombreNormalizado: string,
  ): Promise<Variedad | null> {
    const entidad = await this.repositorio.findOne({
      where: { cultivoId, nombreNormalizado },
    });
    return entidad ? VariedadMapeador.aDominio(entidad) : null;
  }

  public async listar(
    cultivoId: string,
    opciones: OpcionesListadoVariedades,
  ): Promise<ResultadoListadoVariedades> {
    const qb = this.repositorio.createQueryBuilder('variedad');
    qb.where('variedad.cultivo_id = :cultivoId', { cultivoId });

    if (opciones.estado) {
      qb.andWhere('variedad.estado = :estado', { estado: opciones.estado });
    }

    const campoOrden = opciones.ordenCampo ?? 'codigo';
    const direccionOrden = opciones.ordenDireccion ?? 'ASC';
    qb.orderBy(`variedad.${campoOrden}`, direccionOrden);
    qb.addOrderBy('variedad.id', 'ASC');

    qb.skip(opciones.desplazamiento).take(opciones.limite);

    const [entidades, total] = await qb.getManyAndCount();
    return {
      datos: entidades.map((e) => VariedadMapeador.aDominio(e)),
      total,
    };
  }
}
