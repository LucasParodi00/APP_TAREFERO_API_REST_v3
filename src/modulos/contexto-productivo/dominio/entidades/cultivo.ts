import { EstadoCultivo } from '../enumeraciones/estado-cultivo';
import { ErrorDominioContextoProductivo } from '../errores/error-dominio-contexto-productivo';

export interface PropiedadesCrearCultivo {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
}

export interface PropiedadesCultivo extends PropiedadesCrearCultivo {
  estado: EstadoCultivo;
  version: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export class Cultivo {
  private constructor(
    public readonly id: string,
    public readonly codigo: string,
    public readonly nombre: string,
    public readonly descripcion: string | null,
    private _estado: EstadoCultivo,
    private _version: number,
    public readonly fechaCreacion: Date,
    private _fechaActualizacion: Date,
  ) {}

  public get estado(): EstadoCultivo {
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

  public static crear(props: PropiedadesCrearCultivo): Cultivo {
    const codigoNormalizado = Cultivo.normalizarCodigo(props.codigo || '');
    if (
      !codigoNormalizado ||
      codigoNormalizado.length < 1 ||
      codigoNormalizado.length > 50
    ) {
      throw new ErrorDominioContextoProductivo(
        'CUL_CULTIVO_DUPLICADO',
        'El código de cultivo debe tener entre 1 y 50 caracteres.',
      );
    }

    const nombreLimpio = props.nombre?.trim();
    if (!nombreLimpio || nombreLimpio.length < 1 || nombreLimpio.length > 150) {
      throw new ErrorDominioContextoProductivo(
        'CUL_CULTIVO_DUPLICADO',
        'El nombre de cultivo debe tener entre 1 y 150 caracteres.',
      );
    }

    const descripcionLimpia = props.descripcion?.trim() || null;
    if (descripcionLimpia && descripcionLimpia.length > 1000) {
      throw new ErrorDominioContextoProductivo(
        'CUL_CULTIVO_DUPLICADO',
        'La descripción no puede superar 1000 caracteres.',
      );
    }

    const ahora = new Date();
    return new Cultivo(
      props.id,
      codigoNormalizado,
      nombreLimpio,
      descripcionLimpia,
      EstadoCultivo.ACTIVO,
      1,
      ahora,
      ahora,
    );
  }

  public inactivar(): void {
    if (this._estado === EstadoCultivo.INACTIVO) {
      return;
    }
    this._estado = EstadoCultivo.INACTIVO;
    this._version += 1;
    this._fechaActualizacion = new Date();
  }

  public static reconstituir(props: PropiedadesCultivo): Cultivo {
    return new Cultivo(
      props.id,
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
