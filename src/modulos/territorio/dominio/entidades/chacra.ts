import { EstadoChacra } from '../enumeraciones/estado-chacra';
import { ErrorDominioTerritorio } from '../errores/error-dominio-territorio';
import {
  PuntoGeografico,
  UbicacionGeografica,
} from '../objetos-valor/ubicacion-geografica';

export function normalizarClaveNombreCorto(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .replace(/ñ/g, '__enie__')
    .replace(/Ñ/g, '__enie__')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/__enie__/g, 'ñ')
    .replace(/\s+/g, ' ');
}

export interface RegistrarChacraProps {
  id: string;
  empresaId: string;
  nombre: string;
  nombreCorto: string;
  responsableNombre?: string | null;
  direccionTexto?: string | null;
  ubicacionGeografica?: PuntoGeografico | null;
  creadoPor: string;
  creadoEn?: Date;
}

export interface ModificarChacraProps {
  nombre?: string;
  nombreCorto?: string;
  responsableNombre?: string | null;
  direccionTexto?: string | null;
  ubicacionGeografica?: PuntoGeografico | null;
  actualizadoPor: string;
  actualizadoEn?: Date;
}

export interface ReconstituirChacraProps {
  id: string;
  empresaId: string;
  nombre: string;
  nombreCorto: string;
  nombreCortoClave: string;
  responsableNombre: string | null;
  direccionTexto: string | null;
  ubicacionGeografica?: UbicacionGeografica;
  estado: EstadoChacra;
  version: number;
  creadoPor: string;
  creadoEn: Date;
  actualizadoPor: string;
  actualizadoEn: Date;
}

export class Chacra {
  private _nombre: string;
  private _nombreCorto: string;
  private _nombreCortoClave: string;
  private _responsableNombre: string | null;
  private _direccionTexto: string | null;
  private _ubicacionGeografica?: UbicacionGeografica;
  private _estado: EstadoChacra;
  private _version: number;
  private _actualizadoPor: string;
  private _actualizadoEn: Date;

  private constructor(
    public readonly id: string,
    public readonly empresaId: string,
    nombre: string,
    nombreCorto: string,
    nombreCortoClave: string,
    responsableNombre: string | null,
    direccionTexto: string | null,
    ubicacionGeografica: UbicacionGeografica | undefined,
    estado: EstadoChacra,
    version: number,
    public readonly creadoPor: string,
    public readonly creadoEn: Date,
    actualizadoPor: string,
    actualizadoEn: Date,
  ) {
    this._nombre = nombre;
    this._nombreCorto = nombreCorto;
    this._nombreCortoClave = nombreCortoClave;
    this._responsableNombre = responsableNombre;
    this._direccionTexto = direccionTexto;
    this._ubicacionGeografica = ubicacionGeografica;
    this._estado = estado;
    this._version = version;
    this._actualizadoPor = actualizadoPor;
    this._actualizadoEn = actualizadoEn;
  }

  public static registrar(props: RegistrarChacraProps): Chacra {
    const nombre = Chacra.validarNombre(props.nombre);
    const nombreCorto = Chacra.validarNombreCorto(props.nombreCorto);
    const nombreCortoClave = normalizarClaveNombreCorto(nombreCorto);
    const responsableNombre = Chacra.validarResponsableNombre(
      props.responsableNombre,
    );
    const direccionTexto = Chacra.validarDireccionTexto(props.direccionTexto);
    const ubicacionGeografica = UbicacionGeografica.crear(
      props.ubicacionGeografica,
    );

    const ahora = props.creadoEn ?? new Date();

    return new Chacra(
      props.id,
      props.empresaId,
      nombre,
      nombreCorto,
      nombreCortoClave,
      responsableNombre,
      direccionTexto,
      ubicacionGeografica,
      EstadoChacra.ACTIVA,
      1,
      props.creadoPor,
      ahora,
      props.creadoPor,
      ahora,
    );
  }

  public static reconstituir(props: ReconstituirChacraProps): Chacra {
    return new Chacra(
      props.id,
      props.empresaId,
      props.nombre,
      props.nombreCorto,
      props.nombreCortoClave,
      props.responsableNombre,
      props.direccionTexto,
      props.ubicacionGeografica,
      props.estado,
      props.version,
      props.creadoPor,
      props.creadoEn,
      props.actualizadoPor,
      props.actualizadoEn,
    );
  }

  public modificar(props: ModificarChacraProps): void {
    if (this._estado === EstadoChacra.INACTIVA) {
      throw new ErrorDominioTerritorio(
        'TER_OPERACION_INACTIVA_INVALIDA',
        'No se pueden modificar datos descriptivos de una Chacra inactiva.',
      );
    }

    if (props.nombre !== undefined) {
      this._nombre = Chacra.validarNombre(props.nombre);
    }

    if (props.nombreCorto !== undefined) {
      this._nombreCorto = Chacra.validarNombreCorto(props.nombreCorto);
      this._nombreCortoClave = normalizarClaveNombreCorto(this._nombreCorto);
    }

    if (props.responsableNombre !== undefined) {
      this._responsableNombre = Chacra.validarResponsableNombre(
        props.responsableNombre,
      );
    }

    if (props.direccionTexto !== undefined) {
      this._direccionTexto = Chacra.validarDireccionTexto(props.direccionTexto);
    }

    if (props.ubicacionGeografica !== undefined) {
      this._ubicacionGeografica = UbicacionGeografica.crear(
        props.ubicacionGeografica,
      );
    }

    this._version += 1;
    this._actualizadoPor = props.actualizadoPor;
    this._actualizadoEn = props.actualizadoEn ?? new Date();
  }

  public inactivar(actualizadoPor: string, fecha?: Date): void {
    if (this._estado === EstadoChacra.INACTIVA) {
      throw new ErrorDominioTerritorio(
        'TER_TRANSICION_ESTADO_INVALIDA',
        'La Chacra ya se encuentra inactiva.',
      );
    }

    this._estado = EstadoChacra.INACTIVA;
    this._version += 1;
    this._actualizadoPor = actualizadoPor;
    this._actualizadoEn = fecha ?? new Date();
  }

  private static validarNombre(valor?: string | null): string {
    if (!valor || valor.trim().length === 0) {
      throw new ErrorDominioTerritorio(
        'TER_NOMBRE_OBLIGATORIO',
        'El nombre de la Chacra es obligatorio.',
      );
    }
    const limpio = valor.trim();
    if (limpio.length > 150) {
      throw new ErrorDominioTerritorio(
        'TER_TEXTO_INVALIDO',
        'El nombre no puede superar los 150 caracteres.',
      );
    }
    return limpio;
  }

  private static validarNombreCorto(valor?: string | null): string {
    if (!valor || valor.trim().length === 0) {
      throw new ErrorDominioTerritorio(
        'TER_NOMBRE_CORTO_OBLIGATORIO',
        'El nombre corto de la Chacra es obligatorio.',
      );
    }
    const limpio = valor.trim();
    if (limpio.length > 50) {
      throw new ErrorDominioTerritorio(
        'TER_TEXTO_INVALIDO',
        'El nombre corto no puede superar los 50 caracteres.',
      );
    }
    return limpio;
  }

  private static validarResponsableNombre(
    valor?: string | null,
  ): string | null {
    if (valor === undefined || valor === null) {
      return null;
    }
    const limpio = valor.trim();
    if (limpio.length === 0) {
      return null;
    }
    if (limpio.length > 150) {
      throw new ErrorDominioTerritorio(
        'TER_TEXTO_INVALIDO',
        'El nombre del responsable no puede superar los 150 caracteres.',
      );
    }
    return limpio;
  }

  private static validarDireccionTexto(valor?: string | null): string | null {
    if (valor === undefined || valor === null) {
      return null;
    }
    const limpio = valor.trim();
    if (limpio.length === 0) {
      return null;
    }
    if (limpio.length > 500) {
      throw new ErrorDominioTerritorio(
        'TER_TEXTO_INVALIDO',
        'La dirección no puede superar los 500 caracteres.',
      );
    }
    return limpio;
  }

  // Getters
  public get nombre(): string {
    return this._nombre;
  }

  public get nombreCorto(): string {
    return this._nombreCorto;
  }

  public get nombreCortoClave(): string {
    return this._nombreCortoClave;
  }

  public get responsableNombre(): string | null {
    return this._responsableNombre;
  }

  public get direccionTexto(): string | null {
    return this._direccionTexto;
  }

  public get ubicacionGeografica(): UbicacionGeografica | undefined {
    return this._ubicacionGeografica;
  }

  public get estado(): EstadoChacra {
    return this._estado;
  }

  public get version(): number {
    return this._version;
  }

  public get actualizadoPor(): string {
    return this._actualizadoPor;
  }

  public get actualizadoEn(): Date {
    return this._actualizadoEn;
  }
}
