import { AliasEmpresaInvalido } from '../errores';

const FORMATO_ALIAS = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;

export class AliasEmpresa {
    private readonly _valor: string;

    constructor(valor: string) {
        if (!valor || typeof valor !== 'string' || !FORMATO_ALIAS.test(valor)) {
            throw new AliasEmpresaInvalido();
        }
        this._valor = valor;
    }

    get valor(): string {
        return this._valor;
    }

    equals(otro: AliasEmpresa): boolean {
        return this._valor === otro._valor;
    }
}
