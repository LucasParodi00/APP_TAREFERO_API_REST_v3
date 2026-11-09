import { SesionEmpresa } from '../../../../dominio/entidades/sesion-empresa';
import { CanalSesion } from '../../../../dominio/enumeraciones/canal-sesion';
import { SesionEmpresaTypeOrmEntidad } from '../entidades/sesion-empresa.typeorm-entidad';

export class MapeadorSesionEmpresa {
  public static aPersistencia(
    dominio: SesionEmpresa,
  ): SesionEmpresaTypeOrmEntidad {
    const entidad = new SesionEmpresaTypeOrmEntidad();
    entidad.id = dominio.id;
    entidad.empresaId = dominio.empresaId;
    entidad.cuentaEmpresaId = dominio.cuentaEmpresaId;
    entidad.canal = dominio.canal;
    entidad.tokenRenovacionHash = dominio.tokenRenovacionHash;
    entidad.creadaEn = dominio.creadaEn;
    entidad.venceEn = dominio.venceEn;
    entidad.revocadaEn = dominio.revocadaEn ?? null;
    entidad.revocadaPor = dominio.revocadaPor ?? null;
    entidad.motivoRevocacion = dominio.motivoRevocacion ?? null;
    return entidad;
  }

  public static aDominio(entidad: SesionEmpresaTypeOrmEntidad): SesionEmpresa {
    return SesionEmpresa.reconstituir({
      id: entidad.id,
      empresaId: entidad.empresaId,
      cuentaEmpresaId: entidad.cuentaEmpresaId,
      canal: entidad.canal as CanalSesion,
      tokenRenovacionHash: entidad.tokenRenovacionHash,
      creadaEn: entidad.creadaEn,
      venceEn: entidad.venceEn,
      revocadaEn: entidad.revocadaEn ?? undefined,
      revocadaPor: entidad.revocadaPor ?? undefined,
      motivoRevocacion: entidad.motivoRevocacion ?? undefined,
    });
  }
}
