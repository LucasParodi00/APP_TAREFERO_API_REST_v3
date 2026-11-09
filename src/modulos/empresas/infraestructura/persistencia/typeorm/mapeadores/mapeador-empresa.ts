import { Empresa } from '../../../../dominio/entidades/empresa';
import { ConfiguracionGeneralEmpresa } from '../../../../dominio/entidades/configuracion-general-empresa';
import { EstadoEmpresa } from '../../../../dominio/enumeraciones/estado-empresa';
import { EmpresaTypeOrmEntidad } from '../entidades/empresa.typeorm-entidad';
import { ConfiguracionGeneralTypeOrmEntidad } from '../entidades/configuracion-general.typeorm-entidad';

export class MapeadorEmpresa {
  public static aDominio(entidad: EmpresaTypeOrmEntidad): Empresa {
    const configDominio = ConfiguracionGeneralEmpresa.crear({
      id: entidad.configuracion.id,
      empresaId: entidad.configuracion.empresaId,
      paisReferencia: entidad.configuracion.paisReferencia,
      zonaHoraria: entidad.configuracion.zonaHoraria,
      monedaPrincipal: entidad.configuracion.monedaPrincipal,
      creadoPor: entidad.configuracion.creadoPor,
      creadoEn: entidad.configuracion.creadoEn,
      actualizadoPor: entidad.configuracion.actualizadoPor,
      actualizadoEn: entidad.configuracion.actualizadoEn,
      version: entidad.configuracion.version,
    });

    const ubicacionGeografica =
      entidad.latitud !== null &&
      entidad.latitud !== undefined &&
      entidad.longitud !== null &&
      entidad.longitud !== undefined
        ? {
            latitud: Number(entidad.latitud),
            longitud: Number(entidad.longitud),
          }
        : undefined;

    return Empresa.reconstituir({
      id: entidad.id,
      nombre: entidad.nombre,
      alias: entidad.alias,
      cuit: entidad.cuit ?? undefined,
      responsableNombre: entidad.responsableNombre ?? undefined,
      ubicacionTexto: entidad.ubicacionTexto ?? undefined,
      ubicacionGeografica,
      descripcionActividad: entidad.descripcionActividad ?? undefined,
      estado: entidad.estado as EstadoEmpresa,
      creadoEn: entidad.creadoEn,
      creadoPor: entidad.creadoPor,
      actualizadoEn: entidad.actualizadoEn,
      actualizadoPor: entidad.actualizadoPor,
      version: entidad.version,
      configuracion: configDominio,
    });
  }

  public static aPersistencia(empresa: Empresa): EmpresaTypeOrmEntidad {
    const entidad = new EmpresaTypeOrmEntidad();
    entidad.id = empresa.id;
    entidad.nombre = empresa.nombre;
    entidad.alias = empresa.alias;
    entidad.cuit = empresa.cuit ?? null;
    entidad.responsableNombre = empresa.responsableNombre ?? null;
    entidad.ubicacionTexto = empresa.ubicacionTexto ?? null;
    entidad.latitud = empresa.ubicacionGeografica?.latitud ?? null;
    entidad.longitud = empresa.ubicacionGeografica?.longitud ?? null;
    entidad.descripcionActividad = empresa.descripcionActividad ?? null;
    entidad.estado = empresa.estado;
    entidad.creadoEn = empresa.creadoEn;
    entidad.creadoPor = empresa.creadoPor;
    entidad.actualizadoEn = empresa.actualizadoEn;
    entidad.actualizadoPor = empresa.actualizadoPor;
    entidad.version = empresa.version;

    const configEntidad = new ConfiguracionGeneralTypeOrmEntidad();
    configEntidad.id = empresa.configuracion.id;
    configEntidad.empresaId = empresa.id;
    configEntidad.paisReferencia = empresa.configuracion.paisReferencia;
    configEntidad.zonaHoraria = empresa.configuracion.zonaHoraria;
    configEntidad.monedaPrincipal = empresa.configuracion.monedaPrincipal;
    configEntidad.creadoEn = empresa.configuracion.creadoEn;
    configEntidad.creadoPor = empresa.configuracion.creadoPor;
    configEntidad.actualizadoEn = empresa.configuracion.actualizadoEn;
    configEntidad.actualizadoPor = empresa.configuracion.actualizadoPor;
    configEntidad.version = empresa.configuracion.version;

    entidad.configuracion = configEntidad;
    return entidad;
  }
}
