import { DataSource, Repository } from 'typeorm';
import {
  CriteriosListadoEmpresas,
  RepositorioEmpresas,
  ResultadoPaginado,
} from '../../../../aplicacion/puertos/salida/repositorio-empresas';
import { Empresa } from '../../../../dominio/entidades/empresa';
import { ConfiguracionGeneralEmpresa } from '../../../../dominio/entidades/configuracion-general-empresa';
import { EmpresaTypeOrmEntidad } from '../entidades/empresa.typeorm-entidad';
import { ConfiguracionGeneralTypeOrmEntidad } from '../entidades/configuracion-general.typeorm-entidad';
import { MapeadorEmpresa } from '../mapeadores/mapeador-empresa';

export class RepositorioEmpresasTypeOrm implements RepositorioEmpresas {
  private readonly repoEmpresa: Repository<EmpresaTypeOrmEntidad>;
  private readonly repoConfiguracion: Repository<ConfiguracionGeneralTypeOrmEntidad>;

  constructor(private readonly dataSource: DataSource) {
    this.repoEmpresa = this.dataSource.getRepository(EmpresaTypeOrmEntidad);
    this.repoConfiguracion = this.dataSource.getRepository(
      ConfiguracionGeneralTypeOrmEntidad,
    );
  }

  public async guardar(empresa: Empresa): Promise<void> {
    const entidad = MapeadorEmpresa.aPersistencia(empresa);
    const configEntidad = entidad.configuracion;

    await this.dataSource.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .insert()
        .into(EmpresaTypeOrmEntidad)
        .values({
          id: entidad.id,
          nombre: entidad.nombre,
          alias: entidad.alias,
          cuit: entidad.cuit,
          responsableNombre: entidad.responsableNombre,
          ubicacionTexto: entidad.ubicacionTexto,
          latitud: entidad.latitud,
          longitud: entidad.longitud,
          descripcionActividad: entidad.descripcionActividad,
          estado: entidad.estado,
          creadoEn: entidad.creadoEn,
          creadoPor: entidad.creadoPor,
          actualizadoEn: entidad.actualizadoEn,
          actualizadoPor: entidad.actualizadoPor,
          version: entidad.version,
        })
        .execute();

      await manager
        .createQueryBuilder()
        .insert()
        .into(ConfiguracionGeneralTypeOrmEntidad)
        .values({
          id: configEntidad.id,
          empresaId: entidad.id,
          paisReferencia: configEntidad.paisReferencia,
          zonaHoraria: configEntidad.zonaHoraria,
          monedaPrincipal: configEntidad.monedaPrincipal,
          creadoEn: configEntidad.creadoEn,
          creadoPor: configEntidad.creadoPor,
          actualizadoEn: configEntidad.actualizadoEn,
          actualizadoPor: configEntidad.actualizadoPor,
          version: configEntidad.version,
        })
        .execute();
    });
  }

  public async buscarPorId(id: string): Promise<Empresa | null> {
    const entidad = await this.repoEmpresa.findOne({
      where: { id },
      relations: ['configuracion'],
    });

    return entidad ? MapeadorEmpresa.aDominio(entidad) : null;
  }

  public async buscarPorAlias(alias: string): Promise<Empresa | null> {
    const entidad = await this.repoEmpresa.findOne({
      where: { alias },
      relations: ['configuracion'],
    });

    return entidad ? MapeadorEmpresa.aDominio(entidad) : null;
  }

  public async existeAlias(alias: string): Promise<boolean> {
    const cuenta = await this.repoEmpresa.count({
      where: { alias },
    });
    return cuenta > 0;
  }

  public async listar(
    criterios: CriteriosListadoEmpresas,
  ): Promise<ResultadoPaginado<Empresa>> {
    const qb = this.repoEmpresa
      .createQueryBuilder('empresa')
      .leftJoinAndSelect('empresa.configuracion', 'configuracion');

    if (criterios.estado) {
      qb.andWhere('empresa.estado = :estado', { estado: criterios.estado });
    }

    if (criterios.nombre) {
      qb.andWhere('LOWER(empresa.nombre) LIKE LOWER(:nombre)', {
        nombre: `%${criterios.nombre}%`,
      });
    }

    if (criterios.orden) {
      const direccion = criterios.orden.direccion.toUpperCase() as
        'ASC' | 'DESC';
      qb.orderBy(`empresa.${criterios.orden.campo}`, direccion);
    } else {
      qb.orderBy('empresa.nombre', 'ASC');
    }
    qb.addOrderBy('empresa.id', 'ASC');

    qb.skip(criterios.desplazamiento).take(criterios.limite);

    const [entidades, total] = await qb.getManyAndCount();

    return {
      datos: entidades.map((e) => MapeadorEmpresa.aDominio(e)),
      paginacion: {
        limite: criterios.limite,
        desplazamiento: criterios.desplazamiento,
        total,
      },
    };
  }

  public async actualizar(empresa: Empresa): Promise<void> {
    const entidad = MapeadorEmpresa.aPersistencia(empresa);

    await this.dataSource.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .update(EmpresaTypeOrmEntidad)
        .set({
          nombre: entidad.nombre,
          alias: entidad.alias,
          cuit: entidad.cuit,
          responsableNombre: entidad.responsableNombre,
          ubicacionTexto: entidad.ubicacionTexto,
          latitud: entidad.latitud,
          longitud: entidad.longitud,
          descripcionActividad: entidad.descripcionActividad,
          estado: entidad.estado,
          actualizadoEn: entidad.actualizadoEn,
          actualizadoPor: entidad.actualizadoPor,
          version: entidad.version,
        })
        .where('id = :id', { id: entidad.id })
        .execute();
    });
  }

  public async actualizarConfiguracion(
    configuracion: ConfiguracionGeneralEmpresa,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .update(ConfiguracionGeneralTypeOrmEntidad)
        .set({
          paisReferencia: configuracion.paisReferencia,
          zonaHoraria: configuracion.zonaHoraria,
          monedaPrincipal: configuracion.monedaPrincipal,
          actualizadoEn: configuracion.actualizadoEn,
          actualizadoPor: configuracion.actualizadoPor,
          version: configuracion.version,
        })
        .where('id = :id', { id: configuracion.id })
        .execute();
    });
  }
}
