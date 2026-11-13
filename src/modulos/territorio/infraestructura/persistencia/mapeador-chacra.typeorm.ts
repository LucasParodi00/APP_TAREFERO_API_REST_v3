import { Chacra } from '../../dominio/agregados';
import { EstadoChacra } from '../../dominio/enumeraciones';
import {
    NombreChacra,
    NombreCortoChacra,
    DireccionChacra,
    PuntoGeograficoReferencia,
    ResponsableChacra,
} from '../../dominio/objetos-valor';
import { ChacraTypeOrmEntity } from './chacra.typeorm-entity';

export class MapeadorChacraTypeOrm {
    static aDominio(entity: ChacraTypeOrmEntity): Chacra {
        const nombre = NombreChacra.crear(entity.nombre);
        const nombreCorto = NombreCortoChacra.crear(entity.nombreCorto);
        const responsableNombre = entity.responsableNombre ? ResponsableChacra.crear(entity.responsableNombre) : null;
        const direccion = entity.direccion ? DireccionChacra.crear(entity.direccion) : null;

        const puntoGeograficoReferencia =
            entity.puntoGeograficoLatitud !== null &&
            entity.puntoGeograficoLatitud !== undefined &&
            entity.puntoGeograficoLongitud !== null &&
            entity.puntoGeograficoLongitud !== undefined
                ? PuntoGeograficoReferencia.crear(entity.puntoGeograficoLatitud, entity.puntoGeograficoLongitud)
                : null;

        return Chacra.reconstituir({
            id: entity.id,
            empresaId: entity.empresaId,
            nombre,
            nombreCorto,
            responsableNombre,
            direccion,
            puntoGeograficoReferencia,
            estado: entity.estado as EstadoChacra,
            creadoEn: entity.creadoEn,
            creadoPor: entity.creadoPor,
            actualizadoEn: entity.actualizadoEn,
            actualizadoPor: entity.actualizadoPor,
            version: entity.version,
        });
    }

    static aPersistencia(dominio: Chacra): ChacraTypeOrmEntity {
        const entity = new ChacraTypeOrmEntity();
        entity.id = dominio.id;
        entity.empresaId = dominio.empresaId;
        entity.nombre = dominio.nombre.valor;
        entity.nombreCorto = dominio.nombreCorto.valor;
        entity.nombreCortoNormalizado = dominio.nombreCorto.claveNormalizada;
        entity.responsableNombre = dominio.responsableNombre ? dominio.responsableNombre.valor : null;
        entity.direccion = dominio.direccion ? dominio.direccion.valor : null;
        entity.puntoGeograficoLatitud = dominio.puntoGeograficoReferencia ? dominio.puntoGeograficoReferencia.latitud : null;
        entity.puntoGeograficoLongitud = dominio.puntoGeograficoReferencia ? dominio.puntoGeograficoReferencia.longitud : null;
        entity.estado = dominio.estado;
        entity.creadoEn = dominio.creadoEn;
        entity.creadoPor = dominio.creadoPor;
        entity.actualizadoEn = dominio.actualizadoEn;
        entity.actualizadoPor = dominio.actualizadoPor;
        entity.version = dominio.version;
        return entity;
    }
}
