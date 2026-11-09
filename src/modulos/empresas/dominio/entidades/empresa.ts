import { EstadoEmpresa } from '../enumeraciones/estado-empresa';
import { AliasEmpresa } from '../objetos-valor/alias-empresa';
import { Cuit } from '../objetos-valor/cuit';
import {
  PuntoGeografico,
  UbicacionGeografica,
} from '../objetos-valor/ubicacion-geografica';
import { ConfiguracionGeneralEmpresa } from './configuracion-general-empresa';
import { ErrorDominioEmpresa } from '../errores/error-dominio-empresa';

export interface PropiedadesRegistrarEmpresa {
  id: string;
  nombre: string;
  alias: string;
  cuit?: string | null;
  responsableNombre?: string | null;
  ubicacionTexto?: string | null;
  ubicacionGeografica?: PuntoGeografico | null;
  descripcionActividad?: string | null;
  creadoPor: string;
  creadoEn?: Date;
  configuracion: ConfiguracionGeneralEmpresa;
}

export interface PropiedadesReconstituirEmpresa {
  id: string;
  nombre: string;
  alias: string;
  cuit?: string | null;
  responsableNombre?: string | null;
  ubicacionTexto?: string | null;
  ubicacionGeografica?: PuntoGeografico | null;
  descripcionActividad?: string | null;
  estado: EstadoEmpresa;
  creadoEn: Date;
  creadoPor: string;
  actualizadoEn: Date;
  actualizadoPor: string;
  version: number;
  configuracion: ConfiguracionGeneralEmpresa;
}

export interface PropiedadesModificarEmpresa {
  nombre?: string;
  alias?: string;
  cuit?: string | null;
  responsableNombre?: string | null;
  ubicacionTexto?: string | null;
  ubicacionGeografica?: PuntoGeografico | null;
  descripcionActividad?: string | null;
}

/**
 * EMP-ENT-001 — Empresa
 * Raíz de agregado del módulo Empresas.
 */
export class Empresa {
  private _aliasObjeto: AliasEmpresa;
  private _cuitObjeto?: Cuit;
  private _ubicacionGeograficaObjeto?: UbicacionGeografica;

  private constructor(
    public readonly id: string,
    private _nombre: string,
    alias: string,
    cuit: string | undefined,
    private _responsableNombre: string | undefined,
    private _ubicacionTexto: string | undefined,
    ubicacionGeografica: PuntoGeografico | undefined,
    private _descripcionActividad: string | undefined,
    private _estado: EstadoEmpresa,
    public readonly creadoEn: Date,
    public readonly creadoPor: string,
    private _actualizadoEn: Date,
    private _actualizadoPor: string,
    private _version: number,
    private _configuracion: ConfiguracionGeneralEmpresa,
  ) {
    this._aliasObjeto = AliasEmpresa.crear(alias);
    this._cuitObjeto = Cuit.crear(cuit);
    this._ubicacionGeograficaObjeto =
      UbicacionGeografica.crear(ubicacionGeografica);
  }

  public get nombre(): string {
    return this._nombre;
  }

  public get alias(): string {
    return this._aliasObjeto.valor;
  }

  public get cuit(): string | undefined {
    return this._cuitObjeto?.valor;
  }

  public get responsableNombre(): string | undefined {
    return this._responsableNombre;
  }

  public get ubicacionTexto(): string | undefined {
    return this._ubicacionTexto;
  }

  public get ubicacionGeografica(): PuntoGeografico | undefined {
    return this._ubicacionGeograficaObjeto?.toJSON();
  }

  public get descripcionActividad(): string | undefined {
    return this._descripcionActividad;
  }

  public get estado(): EstadoEmpresa {
    return this._estado;
  }

  public get actualizadoEn(): Date {
    return this._actualizadoEn;
  }

  public get actualizadoPor(): string {
    return this._actualizadoPor;
  }

  public get version(): number {
    return this._version;
  }

  public get configuracion(): ConfiguracionGeneralEmpresa {
    return this._configuracion;
  }

  public static registrar(datos: PropiedadesRegistrarEmpresa): Empresa {
    const nombreNormalizado = Empresa.validarYNormalizarNombre(datos.nombre);
    const aliasObjeto = AliasEmpresa.crear(datos.alias);
    const cuitObjeto = Cuit.crear(datos.cuit);
    const responsableNombre = Empresa.validarYNormalizarTexto(
      datos.responsableNombre,
      120,
    );
    const ubicacionTexto = Empresa.validarYNormalizarTexto(
      datos.ubicacionTexto,
      500,
    );
    const descripcionActividad = Empresa.validarYNormalizarTexto(
      datos.descripcionActividad,
      2000,
    );
    const ubicacionGeografica = UbicacionGeografica.crear(
      datos.ubicacionGeografica,
    );

    const ahora = datos.creadoEn ?? new Date();

    return new Empresa(
      datos.id,
      nombreNormalizado,
      aliasObjeto.valor,
      cuitObjeto?.valor,
      responsableNombre,
      ubicacionTexto,
      ubicacionGeografica?.toJSON(),
      descripcionActividad,
      EstadoEmpresa.ACTIVA, // EMP-BR-004: Una Empresa se crea ACTIVA
      ahora,
      datos.creadoPor,
      ahora,
      datos.creadoPor,
      1,
      datos.configuracion,
    );
  }

  public static reconstituir(datos: PropiedadesReconstituirEmpresa): Empresa {
    return new Empresa(
      datos.id,
      datos.nombre,
      datos.alias,
      datos.cuit ?? undefined,
      datos.responsableNombre ?? undefined,
      datos.ubicacionTexto ?? undefined,
      datos.ubicacionGeografica ?? undefined,
      datos.descripcionActividad ?? undefined,
      datos.estado,
      datos.creadoEn,
      datos.creadoPor,
      datos.actualizadoEn,
      datos.actualizadoPor,
      datos.version,
      datos.configuracion,
    );
  }

  /**
   * EMP-BR-004 — Transiciones de estado
   * De ACTIVA a SUSPENDIDA.
   */
  public suspender(actorId: string, fecha?: Date): void {
    if (this._estado !== EstadoEmpresa.ACTIVA) {
      throw new ErrorDominioEmpresa(
        'EMP_TRANSICION_ESTADO_INVALIDA',
        'Solo una Empresa en estado ACTIVA puede ser suspendida.',
      );
    }
    this._estado = EstadoEmpresa.SUSPENDIDA;
    this._actualizadoEn = fecha ?? new Date();
    this._actualizadoPor = actorId;
    this._version += 1;
  }

  /**
   * EMP-BR-004 — Transiciones de estado
   * De SUSPENDIDA a ACTIVA.
   */
  public reactivar(actorId: string, fecha?: Date): void {
    if (this._estado !== EstadoEmpresa.SUSPENDIDA) {
      throw new ErrorDominioEmpresa(
        'EMP_TRANSICION_ESTADO_INVALIDA',
        'Solo una Empresa en estado SUSPENDIDA puede ser reactivada.',
      );
    }
    this._estado = EstadoEmpresa.ACTIVA;
    this._actualizadoEn = fecha ?? new Date();
    this._actualizadoPor = actorId;
    this._version += 1;
  }

  /**
   * EMP-BR-004 — Transiciones de estado
   * De ACTIVA o SUSPENDIDA a CERRADA (irreversible).
   */
  public cerrar(actorId: string, fecha?: Date): void {
    if (this._estado === EstadoEmpresa.CERRADA) {
      throw new ErrorDominioEmpresa(
        'EMP_TRANSICION_ESTADO_INVALIDA',
        'La Empresa ya se encuentra en estado CERRADA.',
      );
    }
    this._estado = EstadoEmpresa.CERRADA;
    this._actualizadoEn = fecha ?? new Date();
    this._actualizadoPor = actorId;
    this._version += 1;
  }

  /**
   * EMP-BR-013 — Alias inmutable
   * EMP-BR-014 — Modificación según estado de Empresa
   */
  public modificarDatos(
    datos: PropiedadesModificarEmpresa,
    actorId: string,
    esSuperAdministrador: boolean,
    fecha?: Date,
  ): void {
    // EMP-BR-014: Si está CERRADA, inmutable para todos
    if (this._estado === EstadoEmpresa.CERRADA) {
      throw new ErrorDominioEmpresa(
        'EMP_MODIFICACION_NO_PERMITIDA',
        'Una Empresa cerrada no admite modificaciones.',
      );
    }

    // EMP-BR-014: Si está SUSPENDIDA, solo el SuperAdministrador puede modificarla
    if (this._estado === EstadoEmpresa.SUSPENDIDA && !esSuperAdministrador) {
      throw new ErrorDominioEmpresa(
        'EMP_MODIFICACION_NO_PERMITIDA',
        'Una Empresa suspendida solo puede ser modificada por el SuperAdministrador.',
      );
    }

    // EMP-BR-013: El alias es inmutable
    if (datos.alias !== undefined && datos.alias !== this._aliasObjeto.valor) {
      throw new ErrorDominioEmpresa(
        'EMP_ALIAS_INMUTABLE',
        'El alias asignado al registrar una Empresa no puede modificarse durante su ciclo de vida.',
      );
    }

    if (datos.nombre !== undefined) {
      this._nombre = Empresa.validarYNormalizarNombre(datos.nombre);
    }

    if (datos.cuit !== undefined) {
      this._cuitObjeto = Cuit.crear(datos.cuit);
    }

    if (datos.responsableNombre !== undefined) {
      this._responsableNombre = Empresa.validarYNormalizarTexto(
        datos.responsableNombre,
        120,
      );
    }

    if (datos.ubicacionTexto !== undefined) {
      this._ubicacionTexto = Empresa.validarYNormalizarTexto(
        datos.ubicacionTexto,
        500,
      );
    }

    if (datos.ubicacionGeografica !== undefined) {
      this._ubicacionGeograficaObjeto = UbicacionGeografica.crear(
        datos.ubicacionGeografica,
      );
    }

    if (datos.descripcionActividad !== undefined) {
      this._descripcionActividad = Empresa.validarYNormalizarTexto(
        datos.descripcionActividad,
        2000,
      );
    }

    this._actualizadoEn = fecha ?? new Date();
    this._actualizadoPor = actorId;
    this._version += 1;
  }

  public actualizarConfiguracion(
    configuracion: ConfiguracionGeneralEmpresa,
  ): void {
    this._configuracion = configuracion;
  }

  private static validarYNormalizarNombre(nombre?: string | null): string {
    if (!nombre || typeof nombre !== 'string') {
      throw new ErrorDominioEmpresa(
        'EMP_NOMBRE_OBLIGATORIO',
        'El nombre de la empresa es obligatorio.',
      );
    }

    const recortado = nombre.trim();
    if (recortado.length === 0) {
      throw new ErrorDominioEmpresa(
        'EMP_NOMBRE_OBLIGATORIO',
        'El nombre de la empresa no puede estar vacío ni contener solo espacios.',
      );
    }

    if (recortado.length > 120) {
      throw new ErrorDominioEmpresa(
        'EMP_NOMBRE_INVALIDO',
        'El nombre de la empresa no puede superar los 120 caracteres.',
      );
    }

    return recortado;
  }

  private static validarYNormalizarTexto(
    texto: string | null | undefined,
    longitudMaxima: number,
  ): string | undefined {
    if (texto === undefined || texto === null) {
      return undefined;
    }

    const recortado = texto.trim();
    if (recortado.length === 0) {
      return undefined;
    }

    if (recortado.length > longitudMaxima) {
      throw new ErrorDominioEmpresa(
        'EMP_TEXTO_INVALIDO',
        `El texto supera la longitud máxima permitida de ${longitudMaxima} caracteres.`,
      );
    }

    return recortado;
  }
}
