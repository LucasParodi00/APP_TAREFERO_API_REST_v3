import { VerificadorCupoAcceso } from '../../aplicacion/puertos/verificador-cupo-acceso.puerto';

export class VerificadorCupoAccesoProvisional implements VerificadorCupoAcceso {
    constructor(private readonly permitirSinSuscripciones = true) {}

    verificarCupoDisponible(empresaId: string): Promise<boolean> {
        void empresaId;
        return Promise.resolve(this.permitirSinSuscripciones);
    }
}
