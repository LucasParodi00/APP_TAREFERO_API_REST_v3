import { ErrorDatoPersonalInvalido } from '../errores';

export class EspecialidadEmpleado {
    private constructor(readonly valor: string) {}

    static crear(valor: string): EspecialidadEmpleado {
        if (!valor || typeof valor !== 'string') {
            throw new ErrorDatoPersonalInvalido('La especialidad no es válida.');
        }

        const limpio = valor.trim();
        if (limpio.length === 0) {
            throw new ErrorDatoPersonalInvalido('La especialidad no puede ser vacía.');
        }

        if (limpio.length > 100) {
            throw new ErrorDatoPersonalInvalido('La especialidad no puede superar los 100 caracteres.');
        }

        return new EspecialidadEmpleado(limpio);
    }
}
