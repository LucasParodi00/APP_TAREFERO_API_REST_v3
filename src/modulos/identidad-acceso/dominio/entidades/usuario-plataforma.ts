import { ErrorDominioIdentidadAcceso } from '../errores/error-dominio-identidad-acceso';

export interface PropsUsuarioPlataforma {
  id: string;
  rol: 'SUPER_ADMINISTRADOR';
  activo: boolean;
  creadoEn?: Date;
}

export class UsuarioPlataforma {
  private constructor(
    public readonly id: string,
    public readonly rol: 'SUPER_ADMINISTRADOR',
    private _activo: boolean,
    public readonly creadoEn: Date,
  ) {}

  public get activo(): boolean {
    return this._activo;
  }

  public static crear(props: PropsUsuarioPlataforma): UsuarioPlataforma {
    if (props.rol !== 'SUPER_ADMINISTRADOR') {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_ROL_NO_ADMITIDO',
        'El usuario de plataforma solo puede tener el rol SUPER_ADMINISTRADOR',
      );
    }

    return new UsuarioPlataforma(
      props.id,
      props.rol,
      props.activo ?? true,
      props.creadoEn ?? new Date(),
    );
  }

  public desactivar(cantidadSuperAdministradoresActivos: number): void {
    if (cantidadSuperAdministradoresActivos <= 1) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_ULTIMO_SUPERADMINISTRADOR',
        'No se puede desactivar al único SuperAdministrador activo',
      );
    }
    this._activo = false;
  }

  public reactivar(): void {
    this._activo = true;
  }
}
