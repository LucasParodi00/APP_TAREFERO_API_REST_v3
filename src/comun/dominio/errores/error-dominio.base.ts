import { CategoriaError } from './categoria-error';

export abstract class ErrorDominioBase extends Error {
    abstract readonly codigo: string;
    readonly categoria: CategoriaError;
    readonly causa?: unknown;

    constructor(mensaje: string, categoria: CategoriaError = CategoriaError.VALIDACION, causa?: unknown) {
        super(mensaje);
        this.categoria = categoria;
        this.causa = causa;
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class ErrorIdentificadorUuidInvalido extends ErrorDominioBase {
    readonly codigo = 'CMN_IDENTIFICADOR_INVALIDO';
    constructor(mensaje = 'El identificador no es un UUID válido.') {
        super(mensaje, CategoriaError.VALIDACION);
    }
}

export class ErrorFechaCivilInvalida extends ErrorDominioBase {
    readonly codigo = 'CMN_FECHA_CIVIL_INVALIDA';
    constructor(mensaje = 'La fecha civil no es válida o no cumple con el formato AAAA-MM-DD.') {
        super(mensaje, CategoriaError.VALIDACION);
    }
}

export class ErrorFechaHoraUtcInvalida extends ErrorDominioBase {
    readonly codigo = 'CMN_FECHA_HORA_INVALIDA';
    constructor(mensaje = 'La fecha y hora no es válida o no cumple el estándar ISO 8601.') {
        super(mensaje, CategoriaError.VALIDACION);
    }
}

export class ErrorCodigoMonedaInvalido extends ErrorDominioBase {
    readonly codigo = 'CMN_CODIGO_MONEDA_INVALIDO';
    constructor(mensaje = 'El código de moneda debe contener exactamente 3 letras mayúsculas.') {
        super(mensaje, CategoriaError.VALIDACION);
    }
}

export class ErrorDineroInvalido extends ErrorDominioBase {
    readonly codigo = 'CMN_DINERO_INVALIDO';
    constructor(mensaje = 'El monto monetario no es un valor decimal válido.') {
        super(mensaje, CategoriaError.VALIDACION);
    }
}
