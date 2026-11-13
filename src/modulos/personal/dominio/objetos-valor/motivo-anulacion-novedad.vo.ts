import { ErrorAnulacionNovedadInvalida } from '../errores';

export class MotivoAnulacionNovedad {
    private constructor(readonly valor: string) {}

    static crear(valor: string): MotivoAnulacionNovedad {
        if (!valor || typeof valor !== 'string') {
            throw new ErrorAnulacionNovedadInvalida('El motivo de anulación es obligatorio.');
        }

        const limpio = valor.trim();
        if (limpio.length === 0) {
            throw new ErrorAnulacionNovedadInvalida('El motivo de anulación no puede ser vacío.');
        }

        if (limpio.length > 1000) {
            throw new ErrorAnulacionNovedadInvalida('El motivo de anulación no puede superar los 1000 caracteres.');
        }

        return new MotivoAnulacionNovedad(limpio);
    }
}
