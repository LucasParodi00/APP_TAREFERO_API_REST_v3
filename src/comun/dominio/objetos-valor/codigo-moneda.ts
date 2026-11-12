import { ErrorCodigoMonedaInvalido } from '../errores/error-dominio.base';

const FORMATO_MONEDA = /^[A-Z]{3}$/;

export class CodigoMoneda {
    readonly valor: string;

    constructor(valor: string) {
        if (!valor || typeof valor !== 'string') {
            throw new ErrorCodigoMonedaInvalido('El código de moneda no puede estar vacío.');
        }

        const limpio = valor.trim();
        if (!FORMATO_MONEDA.test(limpio)) {
            throw new ErrorCodigoMonedaInvalido(
                `El código de moneda "${valor}" debe estar formado por exactamente 3 letras mayúsculas ISO 4217.`,
            );
        }

        this.valor = limpio;
        Object.freeze(this);
    }

    equals(otro: CodigoMoneda | null | undefined): boolean {
        if (!otro || !(otro instanceof CodigoMoneda)) {
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
