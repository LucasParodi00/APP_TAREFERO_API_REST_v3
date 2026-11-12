/* eslint-disable @typescript-eslint/unbound-method */
import { SelectQueryBuilder } from 'typeorm';
import { CriteriosPaginacion, ResultadoPaginado } from '../../aplicacion';
import { PaginadorTypeOrm } from '../../infraestructura/persistencia/paginador-typeorm';

interface EntidadEjemplo {
    id: string;
    nombre: string;
}

describe('Infraestructura Común - PaginadorTypeOrm', () => {
    let mockQb: jest.Mocked<SelectQueryBuilder<EntidadEjemplo>>;
    const datosMock: EntidadEjemplo[] = [
        { id: '018f2d5c-0001-7000-8000-000000000001', nombre: 'Alpha' },
        { id: '018f2d5c-0002-7000-8000-000000000002', nombre: 'Beta' },
    ];

    beforeEach(() => {
        mockQb = {
            orderBy: jest.fn().mockReturnThis(),
            addOrderBy: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockResolvedValue([datosMock, 42]),
            getMany: jest.fn().mockResolvedValue(datosMock),
        } as unknown as jest.Mocked<SelectQueryBuilder<EntidadEjemplo>>;
    });

    it('debe aplicar skip y take desde CriteriosPaginacion y desempate por id', async () => {
        const criterios = CriteriosPaginacion.crear({ limite: 10, desplazamiento: 20 });
        const resultado = await PaginadorTypeOrm.paginar(mockQb, criterios);

        expect(mockQb.skip).toHaveBeenCalledWith(20);
        expect(mockQb.take).toHaveBeenCalledWith(10);
        expect(mockQb.addOrderBy).toHaveBeenCalledWith('id', 'ASC');
        expect(mockQb.getManyAndCount).toHaveBeenCalled();

        expect(resultado).toBeInstanceOf(ResultadoPaginado);
        expect(resultado.datos).toEqual(datosMock);
        expect(resultado.paginacion.total).toBe(42);
        expect(resultado.paginacion.limite).toBe(10);
        expect(resultado.paginacion.desplazamiento).toBe(20);
    });

    it('debe aplicar orden especificado y agregar desempate estable', async () => {
        const criterios = CriteriosPaginacion.crear();
        await PaginadorTypeOrm.paginar(mockQb, criterios, {
            orden: { 'entidad.nombre': 'ASC', 'entidad.codigo': 'DESC' },
            campoDesempate: 'entidad.id',
            direccionDesempate: 'DESC',
        });

        expect(mockQb.orderBy).toHaveBeenCalledWith('entidad.nombre', 'ASC');
        expect(mockQb.addOrderBy).toHaveBeenCalledWith('entidad.codigo', 'DESC');
        expect(mockQb.addOrderBy).toHaveBeenCalledWith('entidad.id', 'DESC');
    });

    it('debe admitir lista de órdenes múltiples', async () => {
        const criterios = CriteriosPaginacion.crear();
        await PaginadorTypeOrm.paginar(mockQb, criterios, {
            orden: [
                { campo: 'entidad.apellido', direccion: 'ASC' },
                { campo: 'entidad.nombre', direccion: 'DESC' },
            ],
            campoDesempate: 'entidad.id',
        });

        expect(mockQb.orderBy).toHaveBeenCalledWith('entidad.apellido', 'ASC');
        expect(mockQb.addOrderBy).toHaveBeenCalledWith('entidad.nombre', 'DESC');
        expect(mockQb.addOrderBy).toHaveBeenCalledWith('entidad.id', 'ASC');
    });

    it('debe omitir getManyAndCount si calcularTotal es falso', async () => {
        const criterios = CriteriosPaginacion.crear();
        const resultado = await PaginadorTypeOrm.paginar(mockQb, criterios, {
            calcularTotal: false,
        });

        expect(mockQb.getMany).toHaveBeenCalled();
        expect(mockQb.getManyAndCount).not.toHaveBeenCalled();
        expect(resultado.paginacion.total).toBe(0);
        expect(resultado.datos).toEqual(datosMock);
    });
});
