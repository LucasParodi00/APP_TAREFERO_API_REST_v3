import { Cultivo } from '../../../../dominio/entidades/cultivo';
import { CultivoTypeOrmEntidad } from '../entidades/cultivo.typeorm-entidad';

export class CultivoMapeador {
  public static aDominio(entidad: CultivoTypeOrmEntidad): Cultivo {
    return Cultivo.reconstituir({
      id: entidad.id,
      codigo: entidad.codigo,
      nombre: entidad.nombre,
      descripcion: entidad.descripcion,
      estado: entidad.estado,
      version: entidad.version,
      fechaCreacion: entidad.fechaCreacion,
      fechaActualizacion: entidad.fechaActualizacion,
    });
  }

  public static aPersistencia(dominio: Cultivo): CultivoTypeOrmEntidad {
    const entidad = new CultivoTypeOrmEntidad();
    entidad.id = dominio.id;
    entidad.codigo = dominio.codigo;
    entidad.nombre = dominio.nombre;
    entidad.nombreNormalizado = Cultivo.normalizarNombre(dominio.nombre);
    entidad.descripcion = dominio.descripcion;
    entidad.estado = dominio.estado;
    entidad.version = dominio.version;
    entidad.fechaCreacion = dominio.fechaCreacion;
    entidad.fechaActualizacion = dominio.fechaActualizacion;
    return entidad;
  }
}
