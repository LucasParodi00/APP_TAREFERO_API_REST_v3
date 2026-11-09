import { Variedad } from '../../../../dominio/entidades/variedad';
import { VariedadTypeOrmEntidad } from '../entidades/variedad.typeorm-entidad';

export class VariedadMapeador {
  public static aDominio(entidad: VariedadTypeOrmEntidad): Variedad {
    return Variedad.reconstituir({
      id: entidad.id,
      cultivoId: entidad.cultivoId,
      codigo: entidad.codigo,
      nombre: entidad.nombre,
      descripcion: entidad.descripcion,
      estado: entidad.estado,
      version: entidad.version,
      fechaCreacion: entidad.fechaCreacion,
      fechaActualizacion: entidad.fechaActualizacion,
    });
  }

  public static aPersistencia(dominio: Variedad): VariedadTypeOrmEntidad {
    const entidad = new VariedadTypeOrmEntidad();
    entidad.id = dominio.id;
    entidad.cultivoId = dominio.cultivoId;
    entidad.codigo = dominio.codigo;
    entidad.nombre = dominio.nombre;
    entidad.nombreNormalizado = Variedad.normalizarNombre(dominio.nombre);
    entidad.descripcion = dominio.descripcion;
    entidad.estado = dominio.estado;
    entidad.version = dominio.version;
    entidad.fechaCreacion = dominio.fechaCreacion;
    entidad.fechaActualizacion = dominio.fechaActualizacion;
    return entidad;
  }
}
