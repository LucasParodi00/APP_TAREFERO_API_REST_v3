import { ErrorDatoPersonalInvalido } from '../errores';

export class DomicilioEmpleado {
    private constructor(readonly valor: string) {}

    static crear(valor: string): DomicilioEmpleado {
        if (!valor || typeof valor !== 'string') {
            throw new ErrorDatoPersonalInvalido('El domicilio no es válido.');
        }

        const limpio = valor.trim();
        if (limpio.length === 0) {
            throw new ErrorDatoPersonalInvalido('El domicilio no puede ser vacío.');
        }

        if (limpio.length > 100) {
            throw new ErrorDatoPersonalInvalido('El domicilio no puede superar los 100 caracteres.');
        }

        return new DomicilioEmpleado(limpio);
    }
}
