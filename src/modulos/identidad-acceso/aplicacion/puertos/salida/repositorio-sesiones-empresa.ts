import { SesionEmpresa } from '../../../dominio/entidades/sesion-empresa';

export interface RepositorioSesionesEmpresa {
  guardar(sesion: SesionEmpresa): Promise<void>;
  actualizar(sesion: SesionEmpresa): Promise<void>;
  buscarPorId(id: string): Promise<SesionEmpresa | null>;
  buscarPorTokenRenovacion(
    tokenRenovacionHash: string,
  ): Promise<SesionEmpresa | null>;
  revocarTodasPorCuenta(
    cuentaEmpresaId: string,
    motivo: string,
    actorId: string,
    fecha?: Date,
  ): Promise<void>;
  registrarHuellaRenovacion(
    sesionId: string,
    tokenHash: string,
    fecha?: Date,
  ): Promise<void>;
  existeHuellaRenovacion(tokenHash: string): Promise<boolean>;
}
