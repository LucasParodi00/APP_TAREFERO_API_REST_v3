import { IntervencionSoporte } from '../../../../dominio/entidades/intervencion-soporte.entidad';
import { MotivoSoporte } from '../../../../dominio/objetos-valor/motivo-soporte.vo';
import { IntervencionSoporteTypeOrmEntity } from '../entidades/intervencion-soporte.typeorm-entity';

export class MapeadorIntervencionSoporteTypeOrm {
    static aDominio(entity: IntervencionSoporteTypeOrmEntity): IntervencionSoporte {
        return IntervencionSoporte.crear({
            id: entity.id,
            usuarioPlataformaId: entity.usuarioPlataformaId,
            empresaId: entity.empresaId,
            motivo: MotivoSoporte.crear(entity.motivo),
            sesionId: entity.sesionId,
            solicitudId: entity.solicitudId,
            ocurridaEn: entity.ocurridaEn,
            venceEn: entity.venceEn,
        });
    }

    static aPersistencia(dominio: IntervencionSoporte): IntervencionSoporteTypeOrmEntity {
        const entity = new IntervencionSoporteTypeOrmEntity();
        entity.id = dominio.id;
        entity.usuarioPlataformaId = dominio.usuarioPlataformaId;
        entity.empresaId = dominio.empresaId;
        entity.motivo = dominio.motivo.valor;
        entity.sesionId = dominio.sesionId;
        entity.solicitudId = dominio.solicitudId;
        entity.ocurridaEn = dominio.ocurridaEn;
        entity.venceEn = dominio.venceEn;
        return entity;
    }
}
