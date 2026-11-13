import { ErrorEmpleadoInvalido } from '../errores';

export class NombrePersona {
    private constructor(readonly valor: string) {}

    static crear(valor: string): NombrePersona {
        if (!valor || typeof valor !== 'string') {
            throw new ErrorEmpleadoInvalido('El nombre es obligatorio.');
        }

        const limpio = valor.trim();
        if (limpio.length === 0) {
            throw new ErrorEmpleadoInvalido('El nombre no puede ser vacío.');
        }

        if (limpio.length > 150) {
            throw new ErrorEmpleadoInvalido('El nombre no puede superar los 150 caracteres.');
        }

        return new NombrePersona(limpio);
    }
}
