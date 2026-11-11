import { UsuarioPlataforma } from '../../../../dominio/entidades/usuario-plataforma.entidad';
import { CorreoAcceso } from '../../../../dominio/objetos-valor/correo-acceso.vo';
import { RolCodigo } from '../../../../dominio/enumeraciones/rol-codigo.enum';
import { UsuarioPlataformaTypeOrmEntity } from '../entidades/usuario-plataforma.typeorm-entity';

export class MapeadorUsuarioPlataformaTypeOrm {
    static aDominio(entity: UsuarioPlataformaTypeOrmEntity): UsuarioPlataforma {
        return UsuarioPlataforma.reconstituir({
            id: entity.id,
            correo: CorreoAcceso.crear(entity.correo),
            credencialHash: entity.contraseniaHash,
            rol: RolCodigo.SUPER_ADMINISTRADOR,
            activo: entity.activo,
            creadoEn: entity.creadoEn,
        });
    }

    static aPersistencia(dominio: UsuarioPlataforma): UsuarioPlataformaTypeOrmEntity {
        const entity = new UsuarioPlataformaTypeOrmEntity();
        entity.id = dominio.id;
        entity.correo = dominio.correo.valor;
        entity.contraseniaHash = dominio.credencialHash;
        entity.nombreMostrado = 'SuperAdministrador';
        entity.rol = dominio.rol;
        entity.activo = dominio.activo;
        entity.creadoEn = dominio.creadoEn;
        return entity;
    }
}
