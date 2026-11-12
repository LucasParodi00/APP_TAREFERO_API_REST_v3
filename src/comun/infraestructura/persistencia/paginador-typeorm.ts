import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { CriteriosPaginacion, ResultadoPaginado } from '../../aplicacion';

export interface OpcionesPaginacionTypeOrm {
    orden?: Record<string, 'ASC' | 'DESC'> | Array<{ campo: string; direccion: 'ASC' | 'DESC' }>;
    campoDesempate?: string;
    direccionDesempate?: 'ASC' | 'DESC';
    calcularTotal?: boolean;
}

export class PaginadorTypeOrm {
    static async paginar<T extends ObjectLiteral>(
        qb: SelectQueryBuilder<T>,
        criterios: CriteriosPaginacion,
        opciones: OpcionesPaginacionTypeOrm = {},
    ): Promise<ResultadoPaginado<T>> {
        const campoDesempate = opciones.campoDesempate ?? 'id';
        const direccionDesempate = opciones.direccionDesempate ?? 'ASC';

        if (opciones.orden) {
            if (Array.isArray(opciones.orden)) {
                opciones.orden.forEach((o, index) => {
                    if (index === 0) {
                        qb.orderBy(o.campo, o.direccion);
                    } else {
                        qb.addOrderBy(o.campo, o.direccion);
                    }
                });
            } else {
                let primero = true;
                for (const [campo, direccion] of Object.entries(opciones.orden)) {
                    if (primero) {
                        qb.orderBy(campo, direccion);
                        primero = false;
                    } else {
                        qb.addOrderBy(campo, direccion);
                    }
                }
            }
        }

        qb.addOrderBy(campoDesempate, direccionDesempate);
        qb.skip(criterios.desplazamiento).take(criterios.limite);

        const calcularTotal = opciones.calcularTotal ?? true;
        let datos: T[];
        let total = 0;

        if (calcularTotal) {
            const [elementos, cantidad] = await qb.getManyAndCount();
            datos = elementos;
            total = cantidad;
        } else {
            datos = await qb.getMany();
        }

        return ResultadoPaginado.crear(datos, total, criterios);
    }
}
