import { ErrorEmpleadoInvalido } from '../errores';

export class ApellidoPersona {
    private constructor(readonly valor: string) {}

    static crear(valor: string): ApellidoPersona {
        if (!valor || typeof valor !== 'string') {
            throw new ErrorEmpleadoInvalido('El apellido es obligatorio.');
        }

        const limpio = valor.trim();
        if (limpio.length === 0) {
            throw new ErrorEmpleadoInvalido('El apellido no puede ser vacío.');
        }

        if (limpio.length > 150) {
            throw new ErrorEmpleadoInvalido('El apellido no puede superar los 150 caracteres.');
        }

        return new ApellidoPersona(limpio);
    }
}
