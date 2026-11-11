import { CorreoInvalido } from '../errores/errores-identidad-acceso';

export class CorreoAcceso {
    private readonly _valor: string;

    private static readonly REGEX_EMAIL =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

    private constructor(valor: string) {
        this._valor = valor;
    }

    static crear(valor: string): CorreoAcceso {
        if (!valor) {
            throw new CorreoInvalido('El correo de acceso no puede estar vacío.');
        }

        const recortado = valor.trim();
        if (recortado.length === 0 || recortado.length > 254) {
            throw new CorreoInvalido('El correo de acceso debe tener entre 1 y 254 caracteres.');
        }

        const normalizado = recortado.toLowerCase();
        if (!CorreoAcceso.REGEX_EMAIL.test(normalizado)) {
            throw new CorreoInvalido('El correo de acceso no cumple un formato válido.');
        }

        return new CorreoAcceso(normalizado);
    }

    get valor(): string {
        return this._valor;
    }

    equals(otro: CorreoAcceso): boolean {
        return this._valor === otro.valor;
    }

    toString(): string {
        return this._valor;
    }
}
