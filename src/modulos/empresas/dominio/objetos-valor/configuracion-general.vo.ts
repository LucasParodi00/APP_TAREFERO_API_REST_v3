import { ConfiguracionGeneralInvalida } from '../errores';

const FORMATO_PAIS = /^[A-Z]{2}$/;
const FORMATO_MONEDA = /^[A-Z]{3}$/;

export class PaisReferencia {
    private readonly _valor: string;

    constructor(valor: string = 'AR') {
        if (!valor || typeof valor !== 'string' || !FORMATO_PAIS.test(valor)) {
            throw new ConfiguracionGeneralInvalida(`El país "${valor}" no es un código ISO 3166-1 alfa-2 válido.`);
        }
        this._valor = valor;
    }

    get valor(): string {
        return this._valor;
    }

    equals(otro: PaisReferencia): boolean {
        return this._valor === otro._valor;
    }
}

export class ZonaHoraria {
    private readonly _valor: string;

    constructor(valor: string = 'America/Argentina/Buenos_Aires') {
        if (!valor || typeof valor !== 'string' || valor.length > 255) {
            throw new ConfiguracionGeneralInvalida('Zona horaria inválida.');
        }
        try {
            Intl.DateTimeFormat(undefined, { timeZone: valor });
        } catch {
            throw new ConfiguracionGeneralInvalida(`La zona horaria "${valor}" no es válida en la base de datos IANA.`);
        }
        this._valor = valor;
    }

    get valor(): string {
        return this._valor;
    }

    equals(otro: ZonaHoraria): boolean {
        return this._valor === otro._valor;
    }
}

export class MonedaPrincipal {
    private readonly _valor: string;

    constructor(valor: string = 'ARS') {
        if (!valor || typeof valor !== 'string' || !FORMATO_MONEDA.test(valor)) {
            throw new ConfiguracionGeneralInvalida(`La moneda "${valor}" no es un código ISO 4217 válido.`);
        }
        this._valor = valor;
    }

    get valor(): string {
        return this._valor;
    }

    equals(otro: MonedaPrincipal): boolean {
        return this._valor === otro._valor;
    }
}
