import { ErrorDominioEmpresa } from '../errores/error-dominio-empresa';

export interface PropiedadesCrearConfiguracionGeneral {
  id: string;
  empresaId: string;
  paisReferencia?: string;
  zonaHoraria?: string;
  monedaPrincipal?: string;
  creadoPor: string;
  creadoEn?: Date;
  actualizadoPor?: string;
  actualizadoEn?: Date;
  version?: number;
}

export interface PropiedadesModificarConfiguracionGeneral {
  paisReferencia?: string;
  zonaHoraria?: string;
  monedaPrincipal?: string;
  actualizadoPor: string;
  actualizadoEn?: Date;
}

/**
 * EMP-ENT-002 — Configuración general de Empresa
 * EMP-BR-006 — Configuración general inicial e invariantes:
 * País ISO 3166-1 alfa-2, zona horaria IANA de hasta 255 caracteres y moneda ISO 4217.
 * Valores por defecto: 'AR', 'America/Argentina/Buenos_Aires', 'ARS'.
 */
export class ConfiguracionGeneralEmpresa {
  private static readonly CODIGO_PAIS_ALFA2 = /^[A-Z]{2}$/;
  private static readonly CODIGO_MONEDA_ISO4217 = /^[A-Z]{3}$/;

  private constructor(
    public readonly id: string,
    public readonly empresaId: string,
    private _paisReferencia: string,
    private _zonaHoraria: string,
    private _monedaPrincipal: string,
    public readonly creadoEn: Date,
    public readonly creadoPor: string,
    private _actualizadoEn: Date,
    private _actualizadoPor: string,
    private _version: number,
  ) {}

  public get paisReferencia(): string {
    return this._paisReferencia;
  }

  public get zonaHoraria(): string {
    return this._zonaHoraria;
  }

  public get monedaPrincipal(): string {
    return this._monedaPrincipal;
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

  public static crearInicial(datos: {
    id: string;
    empresaId: string;
    creadoPor: string;
    creadoEn?: Date;
  }): ConfiguracionGeneralEmpresa {
    const ahora = datos.creadoEn ?? new Date();
    return new ConfiguracionGeneralEmpresa(
      datos.id,
      datos.empresaId,
      'AR',
      'America/Argentina/Buenos_Aires',
      'ARS',
      ahora,
      datos.creadoPor,
      ahora,
      datos.creadoPor,
      1,
    );
  }

  public static crear(
    datos: PropiedadesCrearConfiguracionGeneral,
  ): ConfiguracionGeneralEmpresa {
    const pais = (datos.paisReferencia ?? 'AR').trim().toUpperCase();
    const zona = (datos.zonaHoraria ?? 'America/Argentina/Buenos_Aires').trim();
    const moneda = (datos.monedaPrincipal ?? 'ARS').trim().toUpperCase();

    ConfiguracionGeneralEmpresa.validarValores(pais, zona, moneda);

    const ahora = datos.creadoEn ?? new Date();
    const actualizadoEn = datos.actualizadoEn ?? ahora;
    const actualizadoPor = datos.actualizadoPor ?? datos.creadoPor;
    const version = datos.version ?? 1;

    return new ConfiguracionGeneralEmpresa(
      datos.id,
      datos.empresaId,
      pais,
      zona,
      moneda,
      ahora,
      datos.creadoPor,
      actualizadoEn,
      actualizadoPor,
      version,
    );
  }

  public modificar(datos: PropiedadesModificarConfiguracionGeneral): void {
    const nuevoPais =
      datos.paisReferencia !== undefined
        ? datos.paisReferencia.trim().toUpperCase()
        : this._paisReferencia;
    const nuevaZona =
      datos.zonaHoraria !== undefined
        ? datos.zonaHoraria.trim()
        : this._zonaHoraria;
    const nuevaMoneda =
      datos.monedaPrincipal !== undefined
        ? datos.monedaPrincipal.trim().toUpperCase()
        : this._monedaPrincipal;

    ConfiguracionGeneralEmpresa.validarValores(
      nuevoPais,
      nuevaZona,
      nuevaMoneda,
    );

    this._paisReferencia = nuevoPais;
    this._zonaHoraria = nuevaZona;
    this._monedaPrincipal = nuevaMoneda;
    this._actualizadoEn = datos.actualizadoEn ?? new Date();
    this._actualizadoPor = datos.actualizadoPor;
    this._version += 1;
  }

  private static validarValores(
    pais: string,
    zona: string,
    moneda: string,
  ): void {
    if (!this.CODIGO_PAIS_ALFA2.test(pais)) {
      throw new ErrorDominioEmpresa(
        'EMP_CONFIGURACION_GENERAL_INVALIDA',
        'El país de referencia debe ser un código ISO 3166-1 alfa-2 de 2 letras mayúsculas.',
      );
    }

    if (!zona || zona.length > 255) {
      throw new ErrorDominioEmpresa(
        'EMP_CONFIGURACION_GENERAL_INVALIDA',
        'La zona horaria debe ser un identificador IANA válido de hasta 255 caracteres.',
      );
    }

    // Validación IANA mediante Intl API
    try {
      Intl.DateTimeFormat(undefined, { timeZone: zona });
    } catch {
      throw new ErrorDominioEmpresa(
        'EMP_CONFIGURACION_GENERAL_INVALIDA',
        `La zona horaria '${zona}' no es reconocida como un nombre IANA válido.`,
      );
    }

    if (!this.CODIGO_MONEDA_ISO4217.test(moneda)) {
      throw new ErrorDominioEmpresa(
        'EMP_CONFIGURACION_GENERAL_INVALIDA',
        'La moneda principal debe ser un código ISO 4217 de 3 letras mayúsculas.',
      );
    }
  }
}
