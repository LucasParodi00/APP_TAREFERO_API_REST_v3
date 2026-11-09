import { ErrorDominioIdentidadAcceso } from '../errores/error-dominio-identidad-acceso';

export class ContraseniaAcceso {
  private readonly _valor: string;

  constructor(contrasenia: string) {
    if (!contrasenia || typeof contrasenia !== 'string') {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_CONTRASENIA_INVALIDA',
        'La contraseña es obligatoria.',
      );
    }

    if (contrasenia.length < 15 || contrasenia.length > 128) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_CONTRASENIA_INVALIDA',
        'La contraseña debe contener entre 15 y 128 caracteres.',
      );
    }

    // ACC-BR-019: Se conserva exactamente como fue ingresada (sin trim, sin modificar mayúsculas o minúsculas)
    this._valor = contrasenia;
  }

  public get valor(): string {
    return this._valor;
  }
}
