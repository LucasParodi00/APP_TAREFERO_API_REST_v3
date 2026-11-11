import { SesionEmpresa } from '../../../../dominio/entidades/sesion-empresa.entidad';
import { CanalAcceso } from '../../../../dominio/enumeraciones/canal-acceso.enum';
import { EstadoSesion } from '../../../../dominio/enumeraciones/estado-sesion.enum';
import { SesionEmpresaTypeOrmEntity } from '../entidades/sesion-empresa.typeorm-entity';

export class MapeadorSesionEmpresaTypeOrm {
    static aDominio(entity: SesionEmpresaTypeOrmEntity): SesionEmpresa {
        let estado = EstadoSesion.ACTIVA;
        if (entity.revocadaEn) {
            estado = EstadoSesion.REVOCADA;
        } else if (entity.venceEn <= new Date()) {
            estado = EstadoSesion.EXPIRADA;
        }

        return SesionEmpresa.reconstituir({
            id: entity.id,
            cuentaEmpresaId: entity.cuentaEmpresaId,
            empresaId: entity.empresaId,
            canal: entity.canal as CanalAcceso,
            creadaEn: entity.creadaEn,
            venceEn: entity.venceEn,
            revocadaEn: entity.revocadaEn ?? undefined,
            estado,
            hashTokenRenovacion: entity.hashTokenRenovacion,
            familiaId: entity.familiaId,
            contadorRotacion: entity.rotaciones,
        });
    }

    static aPersistencia(dominio: SesionEmpresa): SesionEmpresaTypeOrmEntity {
        const entity = new SesionEmpresaTypeOrmEntity();
        entity.id = dominio.id;
        entity.cuentaEmpresaId = dominio.cuentaEmpresaId;
        entity.empresaId = dominio.empresaId;
        entity.canal = dominio.canal;
        entity.hashTokenRenovacion = dominio.hashTokenRenovacion;
        entity.familiaId = dominio.familiaId;
        entity.rotaciones = dominio.contadorRotacion;
        entity.creadaEn = dominio.creadaEn;
        entity.venceEn = dominio.venceEn;
        entity.revocadaEn = dominio.revocadaEn ?? null;
        return entity;
    }
}
