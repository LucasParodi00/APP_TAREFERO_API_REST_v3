import { TextoDescriptivoInvalido } from '../errores';

function normalizarTextoOpcional(valor: string | null | undefined, maxLongitud: number): string | null {
    if (valor === undefined || valor === null) {
        return null;
    }
    const normalizado = valor.trim();
    if (normalizado.length === 0) {
        return null;
    }
    if (normalizado.length > maxLongitud) {
        throw new TextoDescriptivoInvalido();
    }
    return normalizado;
}

export class ResponsableNombre {
    private readonly _valor: string | null;

    constructor(valor?: string | null) {
        this._valor = normalizarTextoOpcional(valor, 120);
    }

    get valor(): string | null {
        return this._valor;
    }

    equals(otro: ResponsableNombre): boolean {
        return this._valor === otro._valor;
    }
}

export class UbicacionTexto {
    private readonly _valor: string | null;

    constructor(valor?: string | null) {
        this._valor = normalizarTextoOpcional(valor, 500);
    }

    get valor(): string | null {
        return this._valor;
    }

    equals(otro: UbicacionTexto): boolean {
        return this._valor === otro._valor;
    }
}

export class DescripcionActividad {
    private readonly _valor: string | null;

    constructor(valor?: string | null) {
        this._valor = normalizarTextoOpcional(valor, 2000);
    }

    get valor(): string | null {
        return this._valor;
    }

    equals(otro: DescripcionActividad): boolean {
        return this._valor === otro._valor;
    }
}
