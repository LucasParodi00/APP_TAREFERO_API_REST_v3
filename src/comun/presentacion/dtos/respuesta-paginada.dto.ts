import { ResultadoPaginado } from '../../aplicacion';

export interface PaginacionDto {
    limite: number;
    desplazamiento: number;
    total: number;
}

export class RespuestaPaginadaDto<T> {
    readonly datos: readonly T[];
    readonly paginacion: PaginacionDto;

    constructor(datos: readonly T[], paginacion: PaginacionDto) {
        this.datos = datos;
        this.paginacion = paginacion;
    }

    static desdeResultado<T, R = T>(resultado: ResultadoPaginado<T>, transformador?: (item: T) => R): RespuestaPaginadaDto<R> {
        const datosTransformados: readonly R[] = transformador
            ? resultado.datos.map(transformador)
            : (resultado.datos as unknown as readonly R[]);

        return new RespuestaPaginadaDto<R>(datosTransformados, {
            limite: resultado.paginacion.limite,
            desplazamiento: resultado.paginacion.desplazamiento,
            total: resultado.paginacion.total,
        });
    }
}
