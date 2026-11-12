import { CodigoMoneda } from './codigo-moneda';
import { ErrorDineroInvalido } from '../errores/error-dominio.base';

const FORMATO_MONTO = /^[+-]?\d+(\.\d+)?$/;

export class Dinero {
    readonly monto: string;
    readonly moneda: CodigoMoneda;

    constructor(monto: string, moneda: CodigoMoneda | string) {
        if (!monto || typeof monto !== 'string') {
            throw new ErrorDineroInvalido('El monto no puede estar vacío.');
        }

        const limpio = monto.trim();
        if (!FORMATO_MONTO.test(limpio)) {
            throw new ErrorDineroInvalido(`El monto "${monto}" no es un número decimal válido con punto.`);
        }

        // Si empieza con '+', lo quitamos para normalizar
        this.monto = limpio.startsWith('+') ? limpio.slice(1) : limpio;
        this.moneda = typeof moneda === 'string' ? new CodigoMoneda(moneda) : moneda;
        Object.freeze(this);
    }

    equals(otro: Dinero | null | undefined): boolean {
        if (!otro || !(otro instanceof Dinero)) {
            return false;
        }
        return this.monto === otro.monto && this.moneda.equals(otro.moneda);
    }

    aObjeto(): { monto: string; moneda: string } {
        return {
            monto: this.monto,
            moneda: this.moneda.valor,
        };
    }

    toJSON(): { monto: string; moneda: string } {
        return this.aObjeto();
    }
}
