import { ErrorDominioEmpresa } from '../errores/error-dominio-empresa';

/**
 * EMP-BR-003 — CUIT opcional de once dígitos
 * El CUIT es opcional y, cuando se informa, se registra como una cadena de once
 * dígitos sin espacios ni separadores.
 */
export class Cuit {
  private static readonly FORMATO_CUIT = /^\d{11}$/;

  private constructor(public readonly valor: string) {}

  public static crear(valor?: string | null): Cuit | undefined {
    if (!valor || valor.trim() === '') {
      return undefined;
    }

    const valorNormalizado = valor.trim();

    if (!this.FORMATO_CUIT.test(valorNormalizado)) {
      throw new ErrorDominioEmpresa(
        'EMP_CUIT_INVALIDO',
        'El CUIT debe contener exactamente 11 dígitos numéricos sin espacios ni separadores.',
      );
    }

    return new Cuit(valorNormalizado);
  }
}
