import { ErrorResponsableChacraInvalido } from '../errores';

export class ResponsableChacra {
    private readonly _valor: string;

    private constructor(valor: string) {
        this._valor = valor;
    }

    public static crear(valor: string): ResponsableChacra {
        if (!valor || typeof valor !== 'string') {
            throw new ErrorResponsableChacraInvalido();
        }

        const recortado = valor.trim();
        if (recortado.length > 150) {
            throw new ErrorResponsableChacraInvalido();
        }

        return new ResponsableChacra(recortado);
    }

    get valor(): string {
        return this._valor;
    }
}
