import { DataSource, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { RepositorioSesionesEmpresa } from '../../../../aplicacion/puertos/salida/repositorio-sesiones-empresa';
import { SesionEmpresa } from '../../../../dominio/entidades/sesion-empresa';
import { SesionEmpresaTypeOrmEntidad } from '../entidades/sesion-empresa.typeorm-entidad';
import { HuellaRenovacionTypeOrmEntidad } from '../entidades/huella-renovacion.typeorm-entidad';
import { MapeadorSesionEmpresa } from '../mapeadores/mapeador-sesion-empresa';

export class RepositorioSesionesEmpresaTypeOrm implements RepositorioSesionesEmpresa {
  private readonly repoSesion: Repository<SesionEmpresaTypeOrmEntidad>;
  private readonly repoHuella: Repository<HuellaRenovacionTypeOrmEntidad>;

  constructor(private readonly dataSource: DataSource) {
    this.repoSesion = this.dataSource.getRepository(
      SesionEmpresaTypeOrmEntidad,
    );
    this.repoHuella = this.dataSource.getRepository(
      HuellaRenovacionTypeOrmEntidad,
    );
  }

  public async guardar(sesion: SesionEmpresa): Promise<void> {
    const entidad = MapeadorSesionEmpresa.aPersistencia(sesion);
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(SesionEmpresaTypeOrmEntidad)
      .values(entidad)
      .execute();
  }

  public async actualizar(sesion: SesionEmpresa): Promise<void> {
    const entidad = MapeadorSesionEmpresa.aPersistencia(sesion);
    await this.dataSource
      .createQueryBuilder()
      .update(SesionEmpresaTypeOrmEntidad)
      .set({
        tokenRenovacionHash: entidad.tokenRenovacionHash,
        venceEn: entidad.venceEn,
        revocadaEn: entidad.revocadaEn,
        revocadaPor: entidad.revocadaPor,
        motivoRevocacion: entidad.motivoRevocacion,
      })
      .where('id = :id', { id: entidad.id })
      .execute();
  }

  public async buscarPorId(id: string): Promise<SesionEmpresa | null> {
    const entidad = await this.repoSesion.findOne({ where: { id } });
    return entidad ? MapeadorSesionEmpresa.aDominio(entidad) : null;
  }

  public async buscarPorTokenRenovacion(
    tokenRenovacionHash: string,
  ): Promise<SesionEmpresa | null> {
    const entidad = await this.repoSesion.findOne({
      where: { tokenRenovacionHash },
    });
    return entidad ? MapeadorSesionEmpresa.aDominio(entidad) : null;
  }

  public async revocarTodasPorCuenta(
    cuentaEmpresaId: string,
    motivo: string,
    actorId: string,
    fecha?: Date,
  ): Promise<void> {
    const ahora = fecha ?? new Date();
    await this.dataSource
      .createQueryBuilder()
      .update(SesionEmpresaTypeOrmEntidad)
      .set({
        revocadaEn: ahora,
        revocadaPor: actorId,
        motivoRevocacion: motivo,
      })
      .where('cuenta_empresa_id = :cuentaEmpresaId AND revocada_en IS NULL', {
        cuentaEmpresaId,
      })
      .execute();
  }

  public async registrarHuellaRenovacion(
    sesionId: string,
    tokenHash: string,
    fecha?: Date,
  ): Promise<void> {
    const ahora = fecha ?? new Date();
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(HuellaRenovacionTypeOrmEntidad)
      .values({
        id: randomUUID(),
        sesionId,
        tokenHash,
        consumidoEn: ahora,
      })
      .execute();
  }

  public async existeHuellaRenovacion(tokenHash: string): Promise<boolean> {
    const cuenta = await this.repoHuella.count({ where: { tokenHash } });
    return cuenta > 0;
  }
}
