import { CriteriosPaginacion } from './criterios-paginacion';

export interface Paginacion {
    readonly limite: number;
    readonly desplazamiento: number;
    readonly total: number;
}

export class ResultadoPaginado<T> {
    readonly datos: readonly T[];
    readonly paginacion: Paginacion;

    constructor(datos: readonly T[], paginacion: Paginacion) {
        this.datos = Object.freeze([...datos]);
        this.paginacion = Object.freeze({ ...paginacion });
        Object.freeze(this);
    }

    static crear<T>(datos: readonly T[], total: number, criterios: CriteriosPaginacion): ResultadoPaginado<T> {
        return new ResultadoPaginado<T>(datos, {
            limite: criterios.limite,
            desplazamiento: criterios.desplazamiento,
            total,
        });
    }
}
