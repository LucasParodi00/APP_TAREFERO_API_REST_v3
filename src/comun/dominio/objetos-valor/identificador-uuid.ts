import { ErrorIdentificadorUuidInvalido } from '../errores/error-dominio.base';

const FORMATO_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class IdentificadorUuid {
    readonly valor: string;

    constructor(valor: string) {
        if (!valor || typeof valor !== 'string') {
            throw new ErrorIdentificadorUuidInvalido('El identificador UUID no puede estar vacío.');
        }

        const normalizado = valor.trim().toLowerCase();
        if (!FORMATO_UUID.test(normalizado)) {
            throw new ErrorIdentificadorUuidInvalido(`El valor "${valor}" no es un UUID válido.`);
        }

        this.valor = normalizado;
        Object.freeze(this);
    }

    equals(otro: IdentificadorUuid | null | undefined): boolean {
        if (!otro || !(otro instanceof IdentificadorUuid)) {
            return false;
        }
        return this.valor === otro.valor;
    }

    toString(): string {
        return this.valor;
    }

    toJSON(): string {
        return this.valor;
    }
}
