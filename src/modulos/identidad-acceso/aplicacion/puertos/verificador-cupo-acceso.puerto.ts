export const VERIFICADOR_CUPO_ACCESO = Symbol('VERIFICADOR_CUPO_ACCESO');

export interface VerificadorCupoAcceso {
    verificarCupoDisponible(empresaId: string): Promise<boolean>;
}
