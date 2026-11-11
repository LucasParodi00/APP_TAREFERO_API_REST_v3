import { EmpresaTypeOrmEntity } from './empresa.typeorm-entity';
import { EmpresaLectura } from '../../aplicacion/modelos-lectura';

export class MapeadorEmpresaLecturaTypeOrm {
    static aLectura(entidad: EmpresaTypeOrmEntity): EmpresaLectura {
        const ubicacionGeografica =
            entidad.ubicacionLatitud !== null &&
            entidad.ubicacionLatitud !== undefined &&
            entidad.ubicacionLongitud !== null &&
            entidad.ubicacionLongitud !== undefined
                ? {
                      latitud: entidad.ubicacionLatitud,
                      longitud: entidad.ubicacionLongitud,
                  }
                : null;

        return {
            id: entidad.id,
            nombre: entidad.nombre,
            alias: entidad.alias,
            cuit: entidad.cuit,
            responsableNombre: entidad.responsableNombre,
            ubicacionTexto: entidad.ubicacionTexto,
            ubicacionGeografica,
            descripcionActividad: entidad.descripcionActividad,
            estado: entidad.estado,
            configuracionGeneral: {
                id: entidad.configuracionGeneral.id,
                empresaId: entidad.configuracionGeneral.empresaId,
                paisReferencia: entidad.configuracionGeneral.paisReferencia,
                zonaHoraria: entidad.configuracionGeneral.zonaHoraria,
                monedaPrincipal: entidad.configuracionGeneral.monedaPrincipal,
                creadoEn:
                    entidad.configuracionGeneral.creadoEn instanceof Date
                        ? entidad.configuracionGeneral.creadoEn.toISOString()
                        : String(entidad.configuracionGeneral.creadoEn),
                creadoPor: entidad.configuracionGeneral.creadoPor,
                actualizadoEn:
                    entidad.configuracionGeneral.actualizadoEn instanceof Date
                        ? entidad.configuracionGeneral.actualizadoEn.toISOString()
                        : String(entidad.configuracionGeneral.actualizadoEn),
                actualizadoPor: entidad.configuracionGeneral.actualizadoPor,
                version: entidad.configuracionGeneral.version,
            },
            creadoEn: entidad.creadoEn instanceof Date ? entidad.creadoEn.toISOString() : String(entidad.creadoEn),
            creadoPor: entidad.creadoPor,
            actualizadoEn:
                entidad.actualizadoEn instanceof Date ? entidad.actualizadoEn.toISOString() : String(entidad.actualizadoEn),
            actualizadoPor: entidad.actualizadoPor,
            version: entidad.version,
        };
    }
}
