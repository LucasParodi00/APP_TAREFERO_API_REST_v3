import { ErrorTransicionEmpleadoInvalida } from '../errores';

export class MotivoFinPeriodo {
    private constructor(readonly valor: string) {}

    static crear(valor: string): MotivoFinPeriodo {
        if (!valor || typeof valor !== 'string') {
            throw new ErrorTransicionEmpleadoInvalida('El motivo de finalización del período es obligatorio.');
        }

        const limpio = valor.trim();
        if (limpio.length === 0) {
            throw new ErrorTransicionEmpleadoInvalida('El motivo de finalización del período no puede ser vacío.');
        }

        if (limpio.length > 1000) {
            throw new ErrorTransicionEmpleadoInvalida(
                'El motivo de finalización del período no puede superar los 1000 caracteres.',
            );
        }

        return new MotivoFinPeriodo(limpio);
    }
}
