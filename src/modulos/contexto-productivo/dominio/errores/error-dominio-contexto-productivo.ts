export type CodigoErrorContextoProductivo =
  | 'CUL_ACCESO_DENEGADO'
  | 'CUL_CULTIVO_DUPLICADO'
  | 'CUL_VARIEDAD_INVALIDA'
  | 'CUL_REGISTRO_HISTORICO_EN_USO'
  | 'CUL_CULTIVO_NO_HABILITADO'
  | 'CUL_CAMPO_PERFIL_INVALIDO'
  | 'CUL_VERSION_PERFIL_INMUTABLE'
  | 'CUL_PERFIL_INCOMPATIBLE'
  | 'CUL_RECURSO_NO_ENCONTRADO'
  | 'CUL_VERSION_CONFLICTO'
  | 'CUL_IDEMPOTENCIA_CONFLICTO';

export class ErrorDominioContextoProductivo extends Error {
  public constructor(
    public readonly codigo: CodigoErrorContextoProductivo,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = 'ErrorDominioContextoProductivo';
  }
}
