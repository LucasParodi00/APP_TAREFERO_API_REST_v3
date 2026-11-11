import { ContraseniaInvalida } from '../errores/errores-identidad-acceso';

export class ContraseniaPlana {
    private readonly _valor: string;

    private constructor(valor: string) {
        this._valor = valor;
    }

    static crear(valor: string): ContraseniaPlana {
        if (!valor || valor.length < 15 || valor.length > 128) {
            throw new ContraseniaInvalida('La contraseña debe contener entre 15 y 128 caracteres.');
        }

        return new ContraseniaPlana(valor);
    }

    get valor(): string {
        return this._valor;
    }
}
