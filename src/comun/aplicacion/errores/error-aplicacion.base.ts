import { CategoriaError } from '../../dominio';

export abstract class ErrorAplicacionBase extends Error {
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

export class ErrorPaginacionInvalida extends ErrorAplicacionBase {
    readonly codigo = 'CMN_PAGINACION_INVALIDA';
    constructor(mensaje = 'Los parámetros de paginación especificados no son válidos.') {
        super(mensaje, CategoriaError.VALIDACION);
    }
}
