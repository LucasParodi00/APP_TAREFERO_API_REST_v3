import { ErrorDominioEmpresa } from '../errores/error-dominio-empresa';

/**
 * EMP-BR-011 — Formato del alias de Empresa
 * Toda Empresa debe tener un alias de 3 a 63 caracteres formado por letras
 * minúsculas, dígitos o guiones, que comience y termine con letra o dígito.
 */
export class AliasEmpresa {
  private static readonly FORMATO_ALIAS = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;

  private constructor(public readonly valor: string) {}

  public static crear(valor: string): AliasEmpresa {
    if (!valor || typeof valor !== 'string') {
      throw new ErrorDominioEmpresa(
        'EMP_ALIAS_INVALIDO',
        'El alias de la empresa es obligatorio.',
      );
    }

    const valorNormalizado = valor.trim();

    if (
      valorNormalizado.length < 3 ||
      valorNormalizado.length > 63 ||
      !this.FORMATO_ALIAS.test(valorNormalizado)
    ) {
      throw new ErrorDominioEmpresa(
        'EMP_ALIAS_INVALIDO',
        'El alias debe tener entre 3 y 63 caracteres en minúsculas, números o guiones y comenzar y terminar con alfanumérico.',
      );
    }

    return new AliasEmpresa(valorNormalizado);
  }
}
