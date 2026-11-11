import { CuentaEmpresa } from '../../../../dominio/entidades/cuenta-empresa.entidad';
import { CorreoAcceso } from '../../../../dominio/objetos-valor/correo-acceso.vo';
import { NombreMostrado } from '../../../../dominio/objetos-valor/nombre-mostrado.vo';
import { EstadoCuenta } from '../../../../dominio/enumeraciones/estado-cuenta.enum';
import { RolCodigo } from '../../../../dominio/enumeraciones/rol-codigo.enum';
import { CuentaEmpresaTypeOrmEntity } from '../entidades/cuenta-empresa.typeorm-entity';
import { RolCuentaTypeOrmEntity } from '../entidades/rol-cuenta.typeorm-entity';

export class MapeadorCuentaEmpresaTypeOrm {
    static aDominio(entity: CuentaEmpresaTypeOrmEntity): CuentaEmpresa {
        const rolesSet = new Set<RolCodigo>((entity.roles || []).map((r) => r.rol as RolCodigo));

        return CuentaEmpresa.reconstituir({
            id: entity.id,
            empresaId: entity.empresaId,
            empleadoId: entity.empleadoId ?? undefined,
            nombreMostrado: entity.nombreMostrado ? NombreMostrado.crear(entity.nombreMostrado) : undefined,
            correoAcceso: CorreoAcceso.crear(entity.correoAcceso),
            credencialHash: entity.contraseniaHash,
            accesoWeb: entity.accesoWeb,
            accesoMovil: entity.accesoMovil,
            roles: rolesSet,
            estado: entity.estado as EstadoCuenta,
            version: entity.version,
        });
    }

    static aPersistencia(dominio: CuentaEmpresa): CuentaEmpresaTypeOrmEntity {
        const entity = new CuentaEmpresaTypeOrmEntity();
        entity.id = dominio.id;
        entity.empresaId = dominio.empresaId;
        entity.empleadoId = dominio.empleadoId ?? null;
        entity.nombreMostrado = dominio.nombreMostrado ? dominio.nombreMostrado.valor : null;
        entity.correoAcceso = dominio.correoAcceso.valor;
        entity.contraseniaHash = dominio.credencialHash;
        entity.accesoWeb = dominio.accesoWeb;
        entity.accesoMovil = dominio.accesoMovil;
        entity.estado = dominio.estado;
        entity.version = dominio.version;
        entity.creadoPor = 'sistema';
        entity.actualizadoPor = 'sistema';

        entity.roles = dominio.roles.map((rol) => {
            const rolEntity = new RolCuentaTypeOrmEntity();
            rolEntity.cuentaEmpresaId = dominio.id;
            rolEntity.rol = rol;
            return rolEntity;
        });

        return entity;
    }
}
