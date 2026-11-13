import { ErrorDireccionChacraInvalida } from '../errores';

export class DireccionChacra {
    private readonly _valor: string;

    private constructor(valor: string) {
        this._valor = valor;
    }

    public static crear(valor: string): DireccionChacra {
        if (!valor || typeof valor !== 'string') {
            throw new ErrorDireccionChacraInvalida();
        }

        const recortado = valor.trim();
        if (recortado.length === 0 || recortado.length > 500) {
            throw new ErrorDireccionChacraInvalida();
        }

        return new DireccionChacra(recortado);
    }

    get valor(): string {
        return this._valor;
    }
}
