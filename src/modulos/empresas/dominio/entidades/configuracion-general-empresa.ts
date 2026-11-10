import { PaisReferencia, ZonaHoraria, MonedaPrincipal } from '../objetos-valor';

export interface ParametrosConfiguracionGeneral {
  id: string;
  empresaId: string;
  paisReferencia: PaisReferencia;
  zonaHoraria: ZonaHoraria;
  monedaPrincipal: MonedaPrincipal;
  creadoEn: Date;
  creadoPor: string;
  actualizadoEn: Date;
  actualizadoPor: string;
  version: number;
}

export class ConfiguracionGeneralEmpresa {
  private readonly _id: string;
  private readonly _empresaId: string;
  private _paisReferencia: PaisReferencia;
  private _zonaHoraria: ZonaHoraria;
  private _monedaPrincipal: MonedaPrincipal;
  private readonly _creadoEn: Date;
  private readonly _creadoPor: string;
  private _actualizadoEn: Date;
  private _actualizadoPor: string;
  private _version: number;

  constructor(params: ParametrosConfiguracionGeneral) {
    this._id = params.id;
    this._empresaId = params.empresaId;
    this._paisReferencia = params.paisReferencia;
    this._zonaHoraria = params.zonaHoraria;
    this._monedaPrincipal = params.monedaPrincipal;
    this._creadoEn = params.creadoEn;
    this._creadoPor = params.creadoPor;
    this._actualizadoEn = params.actualizadoEn;
    this._actualizadoPor = params.actualizadoPor;
    this._version = params.version;
  }

  static crearDefecto(
    id: string,
    empresaId: string,
    actor: string,
    fecha: Date = new Date(),
  ): ConfiguracionGeneralEmpresa {
    return new ConfiguracionGeneralEmpresa({
      id,
      empresaId,
      paisReferencia: new PaisReferencia('AR'),
      zonaHoraria: new ZonaHoraria('America/Argentina/Buenos_Aires'),
      monedaPrincipal: new MonedaPrincipal('ARS'),
      creadoEn: fecha,
      creadoPor: actor,
      actualizadoEn: fecha,
      actualizadoPor: actor,
      version: 1,
    });
  }

  actualizar(
    paisReferencia: PaisReferencia,
    zonaHoraria: ZonaHoraria,
    monedaPrincipal: MonedaPrincipal,
    actor: string,
    fecha: Date = new Date(),
  ): void {
    this._paisReferencia = paisReferencia;
    this._zonaHoraria = zonaHoraria;
    this._monedaPrincipal = monedaPrincipal;
    this._actualizadoPor = actor;
    this._actualizadoEn = fecha;
    this._version += 1;
  }

  get id(): string {
    return this._id;
  }

  get empresaId(): string {
    return this._empresaId;
  }

  get paisReferencia(): PaisReferencia {
    return this._paisReferencia;
  }

  get zonaHoraria(): ZonaHoraria {
    return this._zonaHoraria;
  }

  get monedaPrincipal(): MonedaPrincipal {
    return this._monedaPrincipal;
  }

  get creadoEn(): Date {
    return this._creadoEn;
  }

  get creadoPor(): string {
    return this._creadoPor;
  }

  get actualizadoEn(): Date {
    return this._actualizadoEn;
  }

  get actualizadoPor(): string {
    return this._actualizadoPor;
  }

  get version(): number {
    return this._version;
  }
}
