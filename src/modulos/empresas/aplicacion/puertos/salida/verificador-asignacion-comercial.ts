/**
 * EMP-DEP-002 — Asignación comercial provisional o Suscripción
 * ADR-0009 — Asignación comercial provisional para el alta de Empresas
 * Puerto de salida para consultar al proveedor comercial.
 */
export interface VerificadorAsignacionComercial {
  tieneAsignacionValida(alias: string): Promise<boolean>;
}
