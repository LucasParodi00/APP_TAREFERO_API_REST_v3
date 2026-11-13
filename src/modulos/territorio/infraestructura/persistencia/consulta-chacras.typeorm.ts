import { Repository } from 'typeorm';
import { ResultadoPaginado } from '../../../../comun/aplicacion';
import { PaginadorTypeOrm } from '../../../../comun/infraestructura';
import { EstadoChacra } from '../../dominio/enumeraciones';
import { ConsultaChacras, ParametrosListarChacras } from '../../aplicacion/consultas';
import { ChacraDetalleLectura, ChacraResumenLectura } from '../../aplicacion/modelos-lectura';
import { ChacraTypeOrmEntity } from './chacra.typeorm-entity';

export class ConsultaChacrasTypeOrm implements ConsultaChacras {
    constructor(private readonly repo: Repository<ChacraTypeOrmEntity>) {}

    async obtenerDetallePorId(id: string, empresaId: string): Promise<ChacraDetalleLectura | null> {
        const entity = await this.repo.findOne({
            where: { id, empresaId },
        });

        if (!entity) {
            return null;
        }

        return {
            id: entity.id,
            empresaId: entity.empresaId,
            nombre: entity.nombre,
            nombreCorto: entity.nombreCorto,
            responsableNombre: entity.responsableNombre,
            direccion: entity.direccion,
            puntoGeograficoReferencia:
                entity.puntoGeograficoLatitud !== null &&
                entity.puntoGeograficoLatitud !== undefined &&
                entity.puntoGeograficoLongitud !== null &&
                entity.puntoGeograficoLongitud !== undefined
                    ? {
                          latitud: entity.puntoGeograficoLatitud,
                          longitud: entity.puntoGeograficoLongitud,
                      }
                    : null,
            estado: entity.estado as EstadoChacra,
            creadoEn: entity.creadoEn instanceof Date ? entity.creadoEn.toISOString() : String(entity.creadoEn),
            creadoPor: entity.creadoPor,
            actualizadoEn:
                entity.actualizadoEn instanceof Date ? entity.actualizadoEn.toISOString() : String(entity.actualizadoEn),
            actualizadoPor: entity.actualizadoPor,
            version: entity.version,
        };
    }

    async listar(params: ParametrosListarChacras): Promise<ResultadoPaginado<ChacraResumenLectura>> {
        if (params.alcanceChacraIds && params.alcanceChacraIds.length === 0) {
            return ResultadoPaginado.crear([], 0, params.paginacion);
        }

        const qb = this.repo.createQueryBuilder('c').where('c.empresa_id = :empresaId', { empresaId: params.empresaId });

        if (params.estado) {
            qb.andWhere('c.estado = :estado', { estado: params.estado });
        }

        if (params.alcanceChacraIds && params.alcanceChacraIds.length > 0) {
            qb.andWhere('c.id IN (:...alcanceChacraIds)', { alcanceChacraIds: params.alcanceChacraIds });
        }

        let campoSql = 'c.creado_en';
        if (params.campoOrden === 'nombre') {
            campoSql = 'c.nombre';
        } else if (params.campoOrden === 'nombreCorto') {
            campoSql = 'c.nombre_corto';
        }

        const direccionSql = params.direccionOrden ?? 'DESC';

        const resultado = await PaginadorTypeOrm.paginar(qb, params.paginacion, {
            orden: [{ campo: campoSql, direccion: direccionSql }],
            campoDesempate: 'c.id',
            direccionDesempate: 'ASC',
        });

        const resumenes: ChacraResumenLectura[] = resultado.datos.map((entity) => ({
            id: entity.id,
            empresaId: entity.empresaId,
            nombre: entity.nombre,
            nombreCorto: entity.nombreCorto,
            responsableNombre: entity.responsableNombre,
            direccion: entity.direccion,
            puntoGeograficoReferencia:
                entity.puntoGeograficoLatitud !== null &&
                entity.puntoGeograficoLatitud !== undefined &&
                entity.puntoGeograficoLongitud !== null &&
                entity.puntoGeograficoLongitud !== undefined
                    ? {
                          latitud: entity.puntoGeograficoLatitud,
                          longitud: entity.puntoGeograficoLongitud,
                      }
                    : null,
            estado: entity.estado as EstadoChacra,
            creadoEn: entity.creadoEn instanceof Date ? entity.creadoEn.toISOString() : String(entity.creadoEn),
            version: entity.version,
        }));

        return ResultadoPaginado.crear(resumenes, resultado.paginacion.total, params.paginacion);
    }

    async resolverPublicoPorId(id: string): Promise<{ id: string; empresaId: string; estado: EstadoChacra } | null> {
        const entity = await this.repo.findOne({
            where: { id },
            select: { id: true, empresaId: true, estado: true },
        });

        if (!entity) {
            return null;
        }

        return {
            id: entity.id,
            empresaId: entity.empresaId,
            estado: entity.estado as EstadoChacra,
        };
    }
}
