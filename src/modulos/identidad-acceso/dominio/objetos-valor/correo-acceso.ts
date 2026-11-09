import { ErrorDominioIdentidadAcceso } from '../errores/error-dominio-identidad-acceso';

export class CorreoAcceso {
  private readonly _valor: string;

  constructor(correo: string) {
    if (!correo || typeof correo !== 'string') {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_CORREO_INVALIDO',
        'El correo de acceso es obligatorio.',
      );
    }

    const normalizado = correo.trim().toLowerCase();

    if (normalizado.length === 0 || normalizado.length > 254) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_CORREO_INVALIDO',
        'El correo de acceso normalizado debe tener entre 1 y 254 caracteres.',
      );
    }

    // Validación básica de formato de correo (debe contener @ y un punto después del @)
    const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!patronCorreo.test(normalizado)) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_CORREO_INVALIDO',
        'El formato del correo de acceso no es válido.',
      );
    }

    this._valor = normalizado;
  }

  public get valor(): string {
    return this._valor;
  }

  public equals(otro: CorreoAcceso): boolean {
    return this._valor === otro._valor;
  }
}
