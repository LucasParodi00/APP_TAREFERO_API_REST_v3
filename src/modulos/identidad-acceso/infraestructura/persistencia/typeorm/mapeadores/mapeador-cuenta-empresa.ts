import { CuentaEmpresa } from '../../../../dominio/entidades/cuenta-empresa';
import { CorreoAcceso } from '../../../../dominio/objetos-valor/correo-acceso';
import { RolEmpresa } from '../../../../dominio/enumeraciones/rol-empresa';
import { EstadoCuentaEmpresa } from '../../../../dominio/enumeraciones/estado-cuenta-empresa';
import { CuentaEmpresaTypeOrmEntidad } from '../entidades/cuenta-empresa.typeorm-entidad';

export class MapeadorCuentaEmpresa {
  public static aPersistencia(
    dominio: CuentaEmpresa,
  ): CuentaEmpresaTypeOrmEntidad {
    const entidad = new CuentaEmpresaTypeOrmEntidad();
    entidad.id = dominio.id;
    entidad.empresaId = dominio.empresaId;
    entidad.personaId = dominio.personaId;
    entidad.correoAcceso = dominio.correoAcceso.valor;
    entidad.hashContrasenia = dominio.hashContrasenia;
    entidad.accesoWeb = dominio.accesoWeb;
    entidad.accesoMovil = dominio.accesoMovil;
    entidad.roles = JSON.stringify(dominio.roles);
    entidad.estado = dominio.estado;
    entidad.creadoEn = dominio.creadoEn;
    entidad.creadoPor = dominio.creadoPor;
    entidad.actualizadoEn = dominio.actualizadoEn;
    entidad.actualizadoPor = dominio.actualizadoPor;
    entidad.version = dominio.version;
    return entidad;
  }

  public static aDominio(entidad: CuentaEmpresaTypeOrmEntidad): CuentaEmpresa {
    let roles: RolEmpresa[] = [];
    try {
      roles = JSON.parse(entidad.roles) as RolEmpresa[];
    } catch {
      roles = entidad.roles.split(',') as RolEmpresa[];
    }

    return CuentaEmpresa.reconstituir({
      id: entidad.id,
      empresaId: entidad.empresaId,
      personaId: entidad.personaId,
      correoAcceso: new CorreoAcceso(entidad.correoAcceso),
      hashContrasenia: entidad.hashContrasenia,
      accesoWeb: entidad.accesoWeb,
      accesoMovil: entidad.accesoMovil,
      roles,
      estado: entidad.estado as EstadoCuentaEmpresa,
      creadoEn: entidad.creadoEn,
      creadoPor: entidad.creadoPor,
      actualizadoEn: entidad.actualizadoEn,
      actualizadoPor: entidad.actualizadoPor,
      version: entidad.version,
    });
  }
}
