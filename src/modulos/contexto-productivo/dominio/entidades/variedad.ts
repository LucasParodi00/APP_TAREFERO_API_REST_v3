import { EstadoVariedad } from '../enumeraciones/estado-variedad';
import { ErrorDominioContextoProductivo } from '../errores/error-dominio-contexto-productivo';

export interface PropiedadesCrearVariedad {
  id: string;
  cultivoId: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
}

export interface PropiedadesVariedad extends PropiedadesCrearVariedad {
  estado: EstadoVariedad;
  version: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export class Variedad {
  private constructor(
    public readonly id: string,
    public readonly cultivoId: string,
    public readonly codigo: string,
    public readonly nombre: string,
    public readonly descripcion: string | null,
    private _estado: EstadoVariedad,
    private _version: number,
    public readonly fechaCreacion: Date,
    private _fechaActualizacion: Date,
  ) {}

  public get estado(): EstadoVariedad {
    return this._estado;
  }

  public get version(): number {
    return this._version;
  }

  public get fechaActualizacion(): Date {
    return this._fechaActualizacion;
  }

  public static normalizarNombre(nombre: string): string {
    return nombre
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  public static normalizarCodigo(codigo: string): string {
    return codigo.trim().toUpperCase();
  }

  public static crear(props: PropiedadesCrearVariedad): Variedad {
    if (!props.cultivoId || props.cultivoId.trim().length === 0) {
      throw new ErrorDominioContextoProductivo(
        'CUL_VARIEDAD_INVALIDA',
        'La variedad debe pertenecer a un Cultivo.',
      );
    }

    const codigoNormalizado = Variedad.normalizarCodigo(props.codigo || '');
    if (
      !codigoNormalizado ||
      codigoNormalizado.length < 1 ||
      codigoNormalizado.length > 50
    ) {
      throw new ErrorDominioContextoProductivo(
        'CUL_VARIEDAD_INVALIDA',
        'El código de variedad debe tener entre 1 y 50 caracteres.',
      );
    }

    const nombreLimpio = props.nombre?.trim();
    if (!nombreLimpio || nombreLimpio.length < 1 || nombreLimpio.length > 150) {
      throw new ErrorDominioContextoProductivo(
        'CUL_VARIEDAD_INVALIDA',
        'El nombre de variedad debe tener entre 1 y 150 caracteres.',
      );
    }

    const descripcionLimpia = props.descripcion?.trim() || null;
    if (descripcionLimpia && descripcionLimpia.length > 1000) {
      throw new ErrorDominioContextoProductivo(
        'CUL_VARIEDAD_INVALIDA',
        'La descripción no puede superar 1000 caracteres.',
      );
    }

    const ahora = new Date();
    return new Variedad(
      props.id,
      props.cultivoId,
      codigoNormalizado,
      nombreLimpio,
      descripcionLimpia,
      EstadoVariedad.ACTIVA,
      1,
      ahora,
      ahora,
    );
  }

  public inactivar(): void {
    if (this._estado === EstadoVariedad.INACTIVA) {
      return;
    }
    this._estado = EstadoVariedad.INACTIVA;
    this._version += 1;
    this._fechaActualizacion = new Date();
  }

  public static reconstituir(props: PropiedadesVariedad): Variedad {
    return new Variedad(
      props.id,
      props.cultivoId,
      props.codigo,
      props.nombre,
      props.descripcion ?? null,
      props.estado,
      props.version,
      props.fechaCreacion,
      props.fechaActualizacion,
    );
  }
}
