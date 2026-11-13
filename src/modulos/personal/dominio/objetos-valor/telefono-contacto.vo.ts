import { ErrorEmpleadoInvalido } from '../errores';

export class TelefonoContacto {
    private constructor(readonly valor: string) {}

    static crear(valor: string): TelefonoContacto {
        if (!valor || typeof valor !== 'string') {
            throw new ErrorEmpleadoInvalido('El teléfono de contacto es obligatorio.');
        }

        const limpio = valor.trim();
        if (limpio.length === 0) {
            throw new ErrorEmpleadoInvalido('El teléfono de contacto no puede ser vacío.');
        }

        if (limpio.length > 30) {
            throw new ErrorEmpleadoInvalido('El teléfono de contacto no puede superar los 30 caracteres.');
        }

        return new TelefonoContacto(limpio);
    }
}
