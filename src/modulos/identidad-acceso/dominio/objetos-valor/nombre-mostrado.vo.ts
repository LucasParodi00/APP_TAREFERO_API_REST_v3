import { TextoNombreMostradoInvalido } from '../errores/errores-identidad-acceso';

export class NombreMostrado {
    private readonly _valor: string;

    private constructor(valor: string) {
        this._valor = valor;
    }

    static crear(valor?: string | null): NombreMostrado | undefined {
        if (!valor) {
            return undefined;
        }

        const recortado = valor.trim();
        if (recortado.length === 0) {
            return undefined;
        }

        if (recortado.length > 150) {
            throw new TextoNombreMostradoInvalido();
        }

        return new NombreMostrado(recortado);
    }

    get valor(): string {
        return this._valor;
    }

    toString(): string {
        return this._valor;
    }
}
