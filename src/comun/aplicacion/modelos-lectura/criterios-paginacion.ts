import { ErrorPaginacionInvalida } from '../errores/error-aplicacion.base';

export interface ParametrosPaginacion {
    limite?: number;
    desplazamiento?: number;
}

export class CriteriosPaginacion {
    static readonly LIMITE_PREDETERMINADO = 25;
    static readonly LIMITE_MAXIMO = 100;
    static readonly DESPLAZAMIENTO_PREDETERMINADO = 0;

    readonly limite: number;
    readonly desplazamiento: number;

    constructor(
        limite = CriteriosPaginacion.LIMITE_PREDETERMINADO,
        desplazamiento = CriteriosPaginacion.DESPLAZAMIENTO_PREDETERMINADO,
    ) {
        if (typeof limite !== 'number' || isNaN(limite) || limite < 1 || limite > CriteriosPaginacion.LIMITE_MAXIMO) {
            throw new ErrorPaginacionInvalida(
                `El límite de paginación debe ser un número entre 1 y ${CriteriosPaginacion.LIMITE_MAXIMO}.`,
            );
        }

        if (typeof desplazamiento !== 'number' || isNaN(desplazamiento) || desplazamiento < 0) {
            throw new ErrorPaginacionInvalida('El desplazamiento de paginación no puede ser un número negativo.');
        }

        this.limite = Math.floor(limite);
        this.desplazamiento = Math.floor(desplazamiento);
        Object.freeze(this);
    }

    static crear(parametros?: ParametrosPaginacion): CriteriosPaginacion {
        return new CriteriosPaginacion(
            parametros?.limite ?? CriteriosPaginacion.LIMITE_PREDETERMINADO,
            parametros?.desplazamiento ?? CriteriosPaginacion.DESPLAZAMIENTO_PREDETERMINADO,
        );
    }
}
