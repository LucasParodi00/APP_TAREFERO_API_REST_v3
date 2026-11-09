import { CorreoAcceso } from '../objetos-valor/correo-acceso';
import {
  RolEmpresa,
  ROLES_EMPRESA_VALIDOS,
} from '../enumeraciones/rol-empresa';
import { EstadoCuentaEmpresa } from '../enumeraciones/estado-cuenta-empresa';
import { ErrorDominioIdentidadAcceso } from '../errores/error-dominio-identidad-acceso';

export interface PropiedadesCrearCuentaEmpresa {
  id: string;
  empresaId: string;
  personaId: string;
  correoAcceso: CorreoAcceso;
  hashContrasenia: string;
  accesoWeb: boolean;
  accesoMovil: boolean;
  roles: string[];
  creadoPor: string;
  fechaCreacion?: Date;
}

export interface PropiedadesReconstituirCuentaEmpresa {
  id: string;
  empresaId: string;
  personaId: string;
  correoAcceso: CorreoAcceso;
  hashContrasenia: string;
  accesoWeb: boolean;
  accesoMovil: boolean;
  roles: RolEmpresa[];
  estado: EstadoCuentaEmpresa;
  creadoEn: Date;
  creadoPor: string;
  actualizadoEn: Date;
  actualizadoPor: string;
  version: number;
}

export class CuentaEmpresa {
  private _roles: RolEmpresa[];
  private _accesoWeb: boolean;
  private _accesoMovil: boolean;
  private _estado: EstadoCuentaEmpresa;
  private _hashContrasenia: string;
  private _actualizadoEn: Date;
  private _actualizadoPor: string;
  private _version: number;

  private constructor(
    public readonly id: string,
    public readonly empresaId: string,
    public readonly personaId: string,
    public readonly correoAcceso: CorreoAcceso,
    hashContrasenia: string,
    accesoWeb: boolean,
    accesoMovil: boolean,
    roles: RolEmpresa[],
    estado: EstadoCuentaEmpresa,
    public readonly creadoEn: Date,
    public readonly creadoPor: string,
    actualizadoEn: Date,
    actualizadoPor: string,
    version: number,
  ) {
    this._hashContrasenia = hashContrasenia;
    this._accesoWeb = accesoWeb;
    this._accesoMovil = accesoMovil;
    this._roles = roles;
    this._estado = estado;
    this._actualizadoEn = actualizadoEn;
    this._actualizadoPor = actualizadoPor;
    this._version = version;
  }

  public static crear(datos: PropiedadesCrearCuentaEmpresa): CuentaEmpresa {
    if (!datos.empresaId || !datos.personaId || !datos.id) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_ACCESO_DENEGADO',
        'Los identificadores de cuenta, empresa y persona son obligatorios.',
      );
    }

    if (!datos.accesoWeb && !datos.accesoMovil) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_CANAL_NO_HABILITADO',
        'Debe habilitarse al menos un canal de acceso (web o móvil).',
      );
    }

    const rolesValidados = CuentaEmpresa.validarYConvertirRoles(datos.roles);

    const ahora = datos.fechaCreacion ?? new Date();

    return new CuentaEmpresa(
      datos.id,
      datos.empresaId,
      datos.personaId,
      datos.correoAcceso,
      datos.hashContrasenia,
      datos.accesoWeb,
      datos.accesoMovil,
      rolesValidados,
      EstadoCuentaEmpresa.ACTIVA,
      ahora,
      datos.creadoPor,
      ahora,
      datos.creadoPor,
      1,
    );
  }

  public static reconstituir(
    datos: PropiedadesReconstituirCuentaEmpresa,
  ): CuentaEmpresa {
    return new CuentaEmpresa(
      datos.id,
      datos.empresaId,
      datos.personaId,
      datos.correoAcceso,
      datos.hashContrasenia,
      datos.accesoWeb,
      datos.accesoMovil,
      datos.roles,
      datos.estado,
      datos.creadoEn,
      datos.creadoPor,
      datos.actualizadoEn,
      datos.actualizadoPor,
      datos.version,
    );
  }

  public get roles(): readonly RolEmpresa[] {
    return [...this._roles];
  }

  public get accesoWeb(): boolean {
    return this._accesoWeb;
  }

  public get accesoMovil(): boolean {
    return this._accesoMovil;
  }

  public get estado(): EstadoCuentaEmpresa {
    return this._estado;
  }

  public get hashContrasenia(): string {
    return this._hashContrasenia;
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

  public suspender(actorId: string, fecha?: Date): void {
    if (this._estado !== EstadoCuentaEmpresa.ACTIVA) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_TRANSICION_NO_PERMITIDA',
        'Solo una Cuenta de Empresa en estado ACTIVA puede ser suspendida.',
      );
    }
    this._estado = EstadoCuentaEmpresa.SUSPENDIDA;
    this._actualizadoEn = fecha ?? new Date();
    this._actualizadoPor = actorId;
    this._version += 1;
  }

  public reactivar(actorId: string, fecha?: Date): void {
    if (this._estado !== EstadoCuentaEmpresa.SUSPENDIDA) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_TRANSICION_NO_PERMITIDA',
        'Solo una Cuenta de Empresa en estado SUSPENDIDA puede ser reactivada.',
      );
    }
    this._estado = EstadoCuentaEmpresa.ACTIVA;
    this._actualizadoEn = fecha ?? new Date();
    this._actualizadoPor = actorId;
    this._version += 1;
  }

  public modificarHabilitacion(
    cambios: {
      roles?: string[];
      accesoWeb?: boolean;
      accesoMovil?: boolean;
    },
    actorId: string,
    fecha?: Date,
  ): void {
    let rolesNuevos = this._roles;
    if (cambios.roles !== undefined) {
      if (cambios.roles.length === 0) {
        throw new ErrorDominioIdentidadAcceso(
          'ACC_ELIMINACION_NO_PERMITIDA',
          'Una cuenta no puede quedarse sin roles asignados.',
        );
      }
      rolesNuevos = CuentaEmpresa.validarYConvertirRoles(cambios.roles);
    }

    const nuevoWeb = cambios.accesoWeb ?? this._accesoWeb;
    const nuevoMovil = cambios.accesoMovil ?? this._accesoMovil;

    if (!nuevoWeb && !nuevoMovil) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_CANAL_NO_HABILITADO',
        'Debe quedar al menos un canal de acceso habilitado (web o móvil).',
      );
    }

    this._roles = rolesNuevos;
    this._accesoWeb = nuevoWeb;
    this._accesoMovil = nuevoMovil;
    this._actualizadoEn = fecha ?? new Date();
    this._actualizadoPor = actorId;
    this._version += 1;
  }

  public cambiarHashContrasenia(
    nuevoHash: string,
    actorId: string,
    fecha?: Date,
  ): void {
    this._hashContrasenia = nuevoHash;
    this._actualizadoEn = fecha ?? new Date();
    this._actualizadoPor = actorId;
    this._version += 1;
  }

  private static validarYConvertirRoles(roles: string[]): RolEmpresa[] {
    if (!roles || roles.length === 0) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_ROL_NO_ADMITIDO',
        'Se debe indicar al menos un rol para la Cuenta de Empresa.',
      );
    }

    const resultado: RolEmpresa[] = [];
    for (const rol of roles) {
      const normalizado = rol.toUpperCase();
      if (!ROLES_EMPRESA_VALIDOS.includes(normalizado)) {
        throw new ErrorDominioIdentidadAcceso(
          'ACC_ROL_NO_ADMITIDO',
          `El rol '${rol}' no es un rol admisible para una Cuenta de Empresa.`,
        );
      }
      if (!resultado.includes(normalizado as RolEmpresa)) {
        resultado.push(normalizado as RolEmpresa);
      }
    }

    return resultado;
  }
}
