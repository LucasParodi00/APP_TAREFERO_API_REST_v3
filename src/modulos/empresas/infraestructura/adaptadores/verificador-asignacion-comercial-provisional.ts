import { VerificadorAsignacionComercial } from '../../aplicacion/puertos/salida/verificador-asignacion-comercial';

/**
 * ADR-0009 — Asignación comercial provisional para el alta de Empresas
 * Adaptador de salida provisional mientras SUS no esté implementado.
 * Permite registrar aliases autorizados o habilitar por defecto en entorno de desarrollo.
 */
export class VerificadorAsignacionComercialProvisional implements VerificadorAsignacionComercial {
  private static readonly aliasHabilitados = new Set<string>();

  public static habilitarAlias(alias: string): void {
    this.aliasHabilitados.add(alias.toLowerCase());
  }

  public static limpiar(): void {
    this.aliasHabilitados.clear();
  }

  public tieneAsignacionValida(alias: string): Promise<boolean> {
    if (VerificadorAsignacionComercialProvisional.aliasHabilitados.size > 0) {
      return Promise.resolve(
        VerificadorAsignacionComercialProvisional.aliasHabilitados.has(
          alias.toLowerCase(),
        ),
      );
    }
    return Promise.resolve(true);
  }
}
