import { DataSource, Repository } from 'typeorm';
import {
  RepositorioCuentasEmpresa,
  CriteriosListadoCuentas,
  ResultadoPaginado,
} from '../../../../aplicacion/puertos/salida/repositorio-cuentas-empresa';
import { CuentaEmpresa } from '../../../../dominio/entidades/cuenta-empresa';
import { CuentaEmpresaTypeOrmEntidad } from '../entidades/cuenta-empresa.typeorm-entidad';
import { MapeadorCuentaEmpresa } from '../mapeadores/mapeador-cuenta-empresa';

export class RepositorioCuentasEmpresaTypeOrm implements RepositorioCuentasEmpresa {
  private readonly repo: Repository<CuentaEmpresaTypeOrmEntidad>;

  constructor(private readonly dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(CuentaEmpresaTypeOrmEntidad);
  }

  public async guardar(cuenta: CuentaEmpresa): Promise<void> {
    const entidad = MapeadorCuentaEmpresa.aPersistencia(cuenta);
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(CuentaEmpresaTypeOrmEntidad)
      .values(entidad)
      .execute();
  }

  public async actualizar(cuenta: CuentaEmpresa): Promise<void> {
    const entidad = MapeadorCuentaEmpresa.aPersistencia(cuenta);
    await this.dataSource
      .createQueryBuilder()
      .update(CuentaEmpresaTypeOrmEntidad)
      .set({
        personaId: entidad.personaId,
        correoAcceso: entidad.correoAcceso,
        hashContrasenia: entidad.hashContrasenia,
        accesoWeb: entidad.accesoWeb,
        accesoMovil: entidad.accesoMovil,
        roles: entidad.roles,
        estado: entidad.estado,
        actualizadoEn: entidad.actualizadoEn,
        actualizadoPor: entidad.actualizadoPor,
        version: entidad.version,
      })
      .where('id = :id', { id: entidad.id })
      .execute();
  }

  public async buscarPorId(id: string): Promise<CuentaEmpresa | null> {
    const entidad = await this.repo.findOne({ where: { id } });
    return entidad ? MapeadorCuentaEmpresa.aDominio(entidad) : null;
  }

  public async buscarPorCorreo(
    empresaId: string,
    correoNormalizado: string,
  ): Promise<CuentaEmpresa | null> {
    const entidad = await this.repo.findOne({
      where: { empresaId, correoAcceso: correoNormalizado },
    });
    return entidad ? MapeadorCuentaEmpresa.aDominio(entidad) : null;
  }

  public async buscarPorPersona(
    empresaId: string,
    personaId: string,
  ): Promise<CuentaEmpresa | null> {
    const entidad = await this.repo.findOne({
      where: { empresaId, personaId },
    });
    return entidad ? MapeadorCuentaEmpresa.aDominio(entidad) : null;
  }

  public async contarPorEmpresa(empresaId: string): Promise<number> {
    return this.repo.count({ where: { empresaId } });
  }

  public async contarActivas(empresaId: string): Promise<number> {
    return this.repo.count({ where: { empresaId, estado: 'ACTIVA' } });
  }

  public async listar(
    criterios: CriteriosListadoCuentas,
  ): Promise<ResultadoPaginado<CuentaEmpresa>> {
    const qb = this.repo
      .createQueryBuilder('cuenta')
      .where('cuenta.empresa_id = :empresaId', {
        empresaId: criterios.empresaId,
      })
      .orderBy('cuenta.id', 'ASC')
      .skip(criterios.desplazamiento)
      .take(criterios.limite);

    const [entidades, total] = await qb.getManyAndCount();

    return {
      datos: entidades.map((e) => MapeadorCuentaEmpresa.aDominio(e)),
      paginacion: {
        total,
        limite: criterios.limite,
        desplazamiento: criterios.desplazamiento,
      },
    };
  }
}
