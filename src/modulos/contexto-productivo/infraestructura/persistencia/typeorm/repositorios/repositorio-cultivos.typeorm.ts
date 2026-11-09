import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Cultivo } from '../../../../dominio/entidades/cultivo';
import {
  RepositorioCultivos,
  OpcionesListadoCultivos,
  ResultadoListadoCultivos,
} from '../../../../aplicacion/puertos/salida/repositorio-cultivos.puerto';
import { CultivoTypeOrmEntidad } from '../entidades/cultivo.typeorm-entidad';
import { CultivoMapeador } from '../mapeadores/cultivo.mapeador';

@Injectable()
export class RepositorioCultivosTypeOrm implements RepositorioCultivos {
  private readonly repositorio: Repository<CultivoTypeOrmEntidad>;

  public constructor(private readonly dataSource: DataSource) {
    this.repositorio = this.dataSource.getRepository(CultivoTypeOrmEntidad);
  }

  public async guardar(cultivo: Cultivo): Promise<void> {
    const entidad = CultivoMapeador.aPersistencia(cultivo);
    await this.repositorio.save(entidad);
  }

  public async buscarPorId(id: string): Promise<Cultivo | null> {
    const entidad = await this.repositorio.findOne({ where: { id } });
    return entidad ? CultivoMapeador.aDominio(entidad) : null;
  }

  public async buscarPorCodigo(codigo: string): Promise<Cultivo | null> {
    const entidad = await this.repositorio.findOne({
      where: { codigo: Cultivo.normalizarCodigo(codigo) },
    });
    return entidad ? CultivoMapeador.aDominio(entidad) : null;
  }

  public async buscarPorNombreNormalizado(
    nombreNormalizado: string,
  ): Promise<Cultivo | null> {
    const entidad = await this.repositorio.findOne({
      where: { nombreNormalizado },
    });
    return entidad ? CultivoMapeador.aDominio(entidad) : null;
  }

  public async listar(
    opciones: OpcionesListadoCultivos,
  ): Promise<ResultadoListadoCultivos> {
    const qb = this.repositorio.createQueryBuilder('cultivo');

    if (opciones.estado) {
      qb.andWhere('cultivo.estado = :estado', { estado: opciones.estado });
    }

    const campoOrden = opciones.ordenCampo ?? 'codigo';
    const direccionOrden = opciones.ordenDireccion ?? 'ASC';
    qb.orderBy(`cultivo.${campoOrden}`, direccionOrden);
    qb.addOrderBy('cultivo.id', 'ASC');

    qb.skip(opciones.desplazamiento).take(opciones.limite);

    const [entidades, total] = await qb.getManyAndCount();
    return {
      datos: entidades.map((e) => CultivoMapeador.aDominio(e)),
      total,
    };
  }
}
