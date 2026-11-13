import { ErrorNombreCortoInvalido } from '../errores';

export function normalizarNombreCorto(valor: string): string {
    if (!valor || typeof valor !== 'string') return '';
    let s = valor.normalize('NFC').trim().toLowerCase();
    s = s.replace(/\s+/g, ' ');
    s = s
        .replace(/[àáâãäåāăą]/gu, 'a')
        .replace(/[èéêëēĕėęě]/gu, 'e')
        .replace(/[ìíîïĩīĭįİ]/gu, 'i')
        .replace(/[òóôõöøōŏő]/gu, 'o')
        .replace(/[ùúûüũūŭůűų]/gu, 'u');
    return s;
}

export class NombreCortoChacra {
    private readonly _valor: string;
    private readonly _claveNormalizada: string;

    private constructor(valor: string, claveNormalizada: string) {
        this._valor = valor;
        this._claveNormalizada = claveNormalizada;
    }

    public static crear(valor: string): NombreCortoChacra {
        if (!valor || typeof valor !== 'string') {
            throw new ErrorNombreCortoInvalido();
        }

        const recortado = valor.trim();
        if (recortado.length === 0 || recortado.length > 50) {
            throw new ErrorNombreCortoInvalido();
        }

        const normalizado = normalizarNombreCorto(recortado);
        return new NombreCortoChacra(recortado, normalizado);
    }

    get valor(): string {
        return this._valor;
    }

    get claveNormalizada(): string {
        return this._claveNormalizada;
    }
}
