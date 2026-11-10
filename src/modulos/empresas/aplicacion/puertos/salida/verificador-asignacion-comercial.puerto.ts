export const VERIFICADOR_ASIGNACION_COMERCIAL = Symbol(
  'VERIFICADOR_ASIGNACION_COMERCIAL',
);

export interface VerificadorAsignacionComercial {
  confirmarAsignacion(empresaId: string): Promise<boolean>;
}
