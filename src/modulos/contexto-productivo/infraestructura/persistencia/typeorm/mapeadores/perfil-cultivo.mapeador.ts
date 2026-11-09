import { PerfilCultivo } from '../../../../dominio/entidades/perfil-cultivo';
import { CampoPerfil } from '../../../../dominio/objetos-valor/campo-perfil';
import { PerfilCultivoTypeOrmEntidad } from '../entidades/perfil-cultivo.typeorm-entidad';
import { DestinoCampoPerfil } from '../../../../dominio/enumeraciones/destino-campo-perfil';
import { TipoCampoPerfil } from '../../../../dominio/enumeraciones/tipo-campo-perfil';

export class PerfilCultivoMapeador {
  public static aDominio(entidad: PerfilCultivoTypeOrmEntidad): PerfilCultivo {
    const campos = (entidad.campos || []).map((c) =>
      CampoPerfil.crear({
        codigo: typeof c.codigo === 'string' ? c.codigo : '',
        nombre: typeof c.nombre === 'string' ? c.nombre : '',
        descripcion: typeof c.descripcion === 'string' ? c.descripcion : null,
        destino: c.destino as DestinoCampoPerfil,
        tipo: c.tipo as TipoCampoPerfil,
        obligatorio: Boolean(c.obligatorio),
        unidadId: typeof c.unidadId === 'string' ? c.unidadId : null,
        validaciones: (c.validaciones as Record<string, unknown>) || null,
      }),
    );

    return PerfilCultivo.reconstituir({
      id: entidad.id,
      cultivoId: entidad.cultivoId,
      alcance: entidad.alcance,
      empresaId: entidad.empresaId,
      loteId: entidad.loteId,
      perfilPadreId: entidad.perfilPadreId,
      nombre: entidad.nombre,
      descripcion: entidad.descripcion,
      version: entidad.version,
      estado: entidad.estado,
      campos,
      fechaCreacion: entidad.fechaCreacion,
      fechaActualizacion: entidad.fechaActualizacion,
    });
  }

  public static aPersistencia(
    dominio: PerfilCultivo,
  ): PerfilCultivoTypeOrmEntidad {
    const entidad = new PerfilCultivoTypeOrmEntidad();
    entidad.id = dominio.id;
    entidad.cultivoId = dominio.cultivoId;
    entidad.alcance = dominio.alcance;
    entidad.empresaId = dominio.empresaId;
    entidad.loteId = dominio.loteId;
    entidad.perfilPadreId = dominio.perfilPadreId;
    entidad.nombre = dominio.nombre;
    entidad.descripcion = dominio.descripcion;
    entidad.version = dominio.version;
    entidad.estado = dominio.estado;
    entidad.campos = dominio.campos.map((c) => ({
      codigo: c.codigo,
      nombre: c.nombre,
      descripcion: c.descripcion,
      destino: c.destino,
      tipo: c.tipo,
      obligatorio: c.obligatorio,
      unidadId: c.unidadId,
      validaciones: c.validaciones,
    }));
    entidad.fechaCreacion = dominio.fechaCreacion;
    entidad.fechaActualizacion = dominio.fechaActualizacion;
    return entidad;
  }
}
