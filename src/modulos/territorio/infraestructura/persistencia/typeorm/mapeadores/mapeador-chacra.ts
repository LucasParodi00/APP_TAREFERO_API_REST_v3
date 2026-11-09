import { Chacra } from '../../../../dominio/entidades/chacra';
import { EstadoChacra } from '../../../../dominio/enumeraciones/estado-chacra';
import { UbicacionGeografica } from '../../../../dominio/objetos-valor/ubicacion-geografica';
import { ChacraTypeOrmEntidad } from '../entidades/chacra.typeorm-entidad';

export class MapeadorChacra {
  public static aDominio(entidad: ChacraTypeOrmEntidad): Chacra {
    const ubicacion =
      entidad.latitud !== null && entidad.longitud !== null
        ? UbicacionGeografica.crear({
            latitud: Number(entidad.latitud),
            longitud: Number(entidad.longitud),
          })
        : undefined;

    return Chacra.reconstituir({
      id: entidad.id,
      empresaId: entidad.empresaId,
      nombre: entidad.nombre,
      nombreCorto: entidad.nombreCorto,
      nombreCortoClave: entidad.nombreCortoClave,
      responsableNombre: entidad.responsableNombre,
      direccionTexto: entidad.direccionTexto,
      ubicacionGeografica: ubicacion,
      estado: entidad.estado as EstadoChacra,
      version: entidad.version,
      creadoPor: entidad.creadoPor,
      creadoEn: entidad.creadoEn,
      actualizadoPor: entidad.actualizadoPor,
      actualizadoEn: entidad.actualizadoEn,
    });
  }

  public static aPersistencia(dominio: Chacra): ChacraTypeOrmEntidad {
    const entidad = new ChacraTypeOrmEntidad();
    entidad.id = dominio.id;
    entidad.empresaId = dominio.empresaId;
    entidad.nombre = dominio.nombre;
    entidad.nombreCorto = dominio.nombreCorto;
    entidad.nombreCortoClave = dominio.nombreCortoClave;
    entidad.responsableNombre = dominio.responsableNombre;
    entidad.direccionTexto = dominio.direccionTexto;
    entidad.latitud = dominio.ubicacionGeografica
      ? dominio.ubicacionGeografica.latitud
      : null;
    entidad.longitud = dominio.ubicacionGeografica
      ? dominio.ubicacionGeografica.longitud
      : null;
    entidad.estado = dominio.estado;
    entidad.version = dominio.version;
    entidad.creadoPor = dominio.creadoPor;
    entidad.creadoEn = dominio.creadoEn;
    entidad.actualizadoPor = dominio.actualizadoPor;
    entidad.actualizadoEn = dominio.actualizadoEn;
    return entidad;
  }
}
