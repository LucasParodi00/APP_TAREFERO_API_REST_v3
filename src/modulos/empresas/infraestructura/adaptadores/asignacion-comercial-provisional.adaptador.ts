import { VerificadorAsignacionComercial } from '../../aplicacion/puertos/salida/verificador-asignacion-comercial.puerto';

/**
 * Adaptador provisional de verificación de asignación comercial.
 * Cumple con Decisión D-01 del PLAN-EMP-0001 y respuesta a EMP-Q-008:
 * mientras el módulo Suscripciones (SUS) sea futuro, confirma positivamente
 * la asignación comercial permitiendo desacoplar el ciclo de desarrollo.
 */
export class AdaptadorAsignacionComercialProvisional implements VerificadorAsignacionComercial {
    confirmarAsignacion(empresaId: string): Promise<boolean> {
        void empresaId;
        return Promise.resolve(true);
    }
}
