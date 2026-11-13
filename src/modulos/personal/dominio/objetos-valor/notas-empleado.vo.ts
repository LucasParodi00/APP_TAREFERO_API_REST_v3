import { ErrorDatoPersonalInvalido } from '../errores';

export class NotasEmpleado {
    private constructor(readonly valor: string) {}

    static crear(valor: string): NotasEmpleado {
        if (!valor || typeof valor !== 'string') {
            throw new ErrorDatoPersonalInvalido('Las notas no son válidas.');
        }

        const limpio = valor.trim();
        if (limpio.length === 0) {
            throw new ErrorDatoPersonalInvalido('Las notas no pueden ser vacías.');
        }

        if (limpio.length > 1000) {
            throw new ErrorDatoPersonalInvalido('Las notas no pueden superar los 1000 caracteres.');
        }

        return new NotasEmpleado(limpio);
    }
}
