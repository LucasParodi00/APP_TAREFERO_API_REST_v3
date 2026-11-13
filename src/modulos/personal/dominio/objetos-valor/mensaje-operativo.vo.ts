import { ErrorRestriccionInvalida } from '../errores';

export class MensajeOperativo {
    private constructor(readonly valor: string) {}

    static crear(valor: string): MensajeOperativo {
        if (!valor || typeof valor !== 'string') {
            throw new ErrorRestriccionInvalida('El mensaje operativo es obligatorio.');
        }

        const limpio = valor.trim();
        if (limpio.length === 0) {
            throw new ErrorRestriccionInvalida('El mensaje operativo no puede ser vacío.');
        }

        if (limpio.length > 1000) {
            throw new ErrorRestriccionInvalida('El mensaje operativo no puede superar los 1000 caracteres.');
        }

        return new MensajeOperativo(limpio);
    }
}
