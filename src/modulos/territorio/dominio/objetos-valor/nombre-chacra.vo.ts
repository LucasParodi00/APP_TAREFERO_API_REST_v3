import { ErrorNombreChacraInvalido } from '../errores';

export class NombreChacra {
    private readonly _valor: string;

    private constructor(valor: string) {
        this._valor = valor;
    }

    public static crear(valor: string): NombreChacra {
        if (!valor || typeof valor !== 'string') {
            throw new ErrorNombreChacraInvalido();
        }

        const recortado = valor.trim();
        if (recortado.length === 0 || recortado.length > 150) {
            throw new ErrorNombreChacraInvalido();
        }

        return new NombreChacra(recortado);
    }

    get valor(): string {
        return this._valor;
    }
}
