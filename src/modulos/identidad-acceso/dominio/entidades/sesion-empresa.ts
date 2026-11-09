import { CanalSesion } from '../enumeraciones/canal-sesion';
import { ErrorDominioIdentidadAcceso } from '../errores/error-dominio-identidad-acceso';

export interface PropiedadesCrearSesionEmpresa {
  id: string;
  empresaId: string;
  cuentaEmpresaId: string;
  canal: CanalSesion;
  tokenRenovacionHash: string;
  creadaEn?: Date;
  duracionMinutos?: number;
}

export interface PropiedadesReconstituirSesionEmpresa {
  id: string;
  empresaId: string;
  cuentaEmpresaId: string;
  canal: CanalSesion;
  tokenRenovacionHash: string;
  creadaEn: Date;
  venceEn: Date;
  revocadaEn?: Date;
  revocadaPor?: string;
  motivoRevocacion?: string;
}

export class SesionEmpresa {
  private _tokenRenovacionHash: string;
  private _venceEn: Date;
  private _revocadaEn?: Date;
  private _revocadaPor?: string;
  private _motivoRevocacion?: string;

  private constructor(
    public readonly id: string,
    public readonly empresaId: string,
    public readonly cuentaEmpresaId: string,
    public readonly canal: CanalSesion,
    tokenRenovacionHash: string,
    public readonly creadaEn: Date,
    venceEn: Date,
    revocadaEn?: Date,
    revocadaPor?: string,
    motivoRevocacion?: string,
  ) {
    this._tokenRenovacionHash = tokenRenovacionHash;
    this._venceEn = venceEn;
    this._revocadaEn = revocadaEn;
    this._revocadaPor = revocadaPor;
    this._motivoRevocacion = motivoRevocacion;
  }

  public static crear(datos: PropiedadesCrearSesionEmpresa): SesionEmpresa {
    const ahora = datos.creadaEn ?? new Date();
    // Duración de renovación por defecto: 30 días según ADR-0006
    const duracionMs = (datos.duracionMinutos ?? 30 * 24 * 60) * 60 * 1000;
    const venceEn = new Date(ahora.getTime() + duracionMs);

    return new SesionEmpresa(
      datos.id,
      datos.empresaId,
      datos.cuentaEmpresaId,
      datos.canal,
      datos.tokenRenovacionHash,
      ahora,
      venceEn,
    );
  }

  public static reconstituir(
    datos: PropiedadesReconstituirSesionEmpresa,
  ): SesionEmpresa {
    return new SesionEmpresa(
      datos.id,
      datos.empresaId,
      datos.cuentaEmpresaId,
      datos.canal,
      datos.tokenRenovacionHash,
      datos.creadaEn,
      datos.venceEn,
      datos.revocadaEn,
      datos.revocadaPor,
      datos.motivoRevocacion,
    );
  }

  public get tokenRenovacionHash(): string {
    return this._tokenRenovacionHash;
  }

  public get venceEn(): Date {
    return this._venceEn;
  }

  public get revocadaEn(): Date | undefined {
    return this._revocadaEn;
  }

  public get revocadaPor(): string | undefined {
    return this._revocadaPor;
  }

  public get motivoRevocacion(): string | undefined {
    return this._motivoRevocacion;
  }

  public estaVigente(fecha?: Date): boolean {
    if (this._revocadaEn) {
      return false;
    }
    const ahora = fecha ?? new Date();
    return this._venceEn > ahora;
  }

  public revocar(motivo: string, actorId: string, fecha?: Date): void {
    if (this._revocadaEn) {
      return; // Ya está revocada
    }
    this._revocadaEn = fecha ?? new Date();
    this._revocadaPor = actorId;
    this._motivoRevocacion = motivo;
  }

  public rotarTokenRenovacion(nuevoHash: string, nuevoVenceEn?: Date): void {
    if (!this.estaVigente()) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_RENOVACION_INVALIDA',
        'No se puede rotar el token de una sesión vencida o revocada.',
      );
    }
    this._tokenRenovacionHash = nuevoHash;
    if (nuevoVenceEn) {
      this._venceEn = nuevoVenceEn;
    }
  }
}
