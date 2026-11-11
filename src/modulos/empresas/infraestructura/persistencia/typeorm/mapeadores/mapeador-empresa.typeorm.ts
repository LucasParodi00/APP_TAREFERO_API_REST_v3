import { Empresa } from '../../../../dominio/agregados/empresa';
import { ConfiguracionGeneralEmpresa } from '../../../../dominio/entidades/configuracion-general-empresa';
import { EstadoEmpresa } from '../../../../dominio/enumeraciones';
import {
    NombreEmpresa,
    AliasEmpresa,
    Cuit,
    PuntoGeografico,
    ResponsableNombre,
    UbicacionTexto,
    DescripcionActividad,
    PaisReferencia,
    ZonaHoraria,
    MonedaPrincipal,
} from '../../../../dominio/objetos-valor';
import { EmpresaTypeOrmEntity } from '../entidades/empresa.typeorm-entity';
import { ConfiguracionGeneralEmpresaTypeOrmEntity } from '../entidades/configuracion-general-empresa.typeorm-entity';

export class MapeadorEmpresaTypeOrm {
    static aDominio(entity: EmpresaTypeOrmEntity): Empresa {
        const configuracionGeneral = new ConfiguracionGeneralEmpresa({
            id: entity.configuracionGeneral.id,
            empresaId: entity.configuracionGeneral.empresaId,
            paisReferencia: new PaisReferencia(entity.configuracionGeneral.paisReferencia),
            zonaHoraria: new ZonaHoraria(entity.configuracionGeneral.zonaHoraria),
            monedaPrincipal: new MonedaPrincipal(entity.configuracionGeneral.monedaPrincipal),
            creadoEn: entity.configuracionGeneral.creadoEn,
            creadoPor: entity.configuracionGeneral.creadoPor,
            actualizadoEn: entity.configuracionGeneral.actualizadoEn,
            actualizadoPor: entity.configuracionGeneral.actualizadoPor,
            version: entity.configuracionGeneral.version,
        });

        const ubicacionGeografica =
            entity.ubicacionLatitud !== null &&
            entity.ubicacionLatitud !== undefined &&
            entity.ubicacionLongitud !== null &&
            entity.ubicacionLongitud !== undefined
                ? new PuntoGeografico(entity.ubicacionLatitud, entity.ubicacionLongitud)
                : null;

        return Empresa.reconstituir({
            id: entity.id,
            nombre: new NombreEmpresa(entity.nombre),
            alias: new AliasEmpresa(entity.alias),
            cuit: new Cuit(entity.cuit),
            responsableNombre: new ResponsableNombre(entity.responsableNombre),
            ubicacionTexto: new UbicacionTexto(entity.ubicacionTexto),
            ubicacionGeografica,
            descripcionActividad: new DescripcionActividad(entity.descripcionActividad),
            estado: entity.estado as EstadoEmpresa,
            configuracionGeneral,
            creadoEn: entity.creadoEn,
            creadoPor: entity.creadoPor,
            actualizadoEn: entity.actualizadoEn,
            actualizadoPor: entity.actualizadoPor,
            version: entity.version,
        });
    }

    static aPersistencia(dominio: Empresa): EmpresaTypeOrmEntity {
        const entity = new EmpresaTypeOrmEntity();
        entity.id = dominio.id;
        entity.nombre = dominio.nombre.valor;
        entity.alias = dominio.alias.valor;
        entity.cuit = dominio.cuit.valor;
        entity.responsableNombre = dominio.responsableNombre.valor;
        entity.ubicacionTexto = dominio.ubicacionTexto.valor;
        entity.ubicacionLatitud = dominio.ubicacionGeografica ? dominio.ubicacionGeografica.latitud : null;
        entity.ubicacionLongitud = dominio.ubicacionGeografica ? dominio.ubicacionGeografica.longitud : null;
        entity.descripcionActividad = dominio.descripcionActividad.valor;
        entity.estado = dominio.estado;
        entity.creadoEn = dominio.creadoEn;
        entity.creadoPor = dominio.creadoPor;
        entity.actualizadoEn = dominio.actualizadoEn;
        entity.actualizadoPor = dominio.actualizadoPor;
        entity.version = dominio.version;

        const cfgEntity = new ConfiguracionGeneralEmpresaTypeOrmEntity();
        cfgEntity.id = dominio.configuracionGeneral.id;
        cfgEntity.empresaId = dominio.configuracionGeneral.empresaId;
        cfgEntity.paisReferencia = dominio.configuracionGeneral.paisReferencia.valor;
        cfgEntity.zonaHoraria = dominio.configuracionGeneral.zonaHoraria.valor;
        cfgEntity.monedaPrincipal = dominio.configuracionGeneral.monedaPrincipal.valor;
        cfgEntity.creadoEn = dominio.configuracionGeneral.creadoEn;
        cfgEntity.creadoPor = dominio.configuracionGeneral.creadoPor;
        cfgEntity.actualizadoEn = dominio.configuracionGeneral.actualizadoEn;
        cfgEntity.actualizadoPor = dominio.configuracionGeneral.actualizadoPor;
        cfgEntity.version = dominio.configuracionGeneral.version;

        entity.configuracionGeneral = cfgEntity;

        return entity;
    }
}
