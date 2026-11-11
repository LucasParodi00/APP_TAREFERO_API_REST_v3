import { Repository } from 'typeorm';
import { RepositorioCuentasEmpresa } from '../../../../dominio/repositorios/repositorio-cuentas-empresa';
import { CuentaEmpresa } from '../../../../dominio/entidades/cuenta-empresa.entidad';
import { CorreoAcceso } from '../../../../dominio/objetos-valor/correo-acceso.vo';
import { CuentaEmpresaTypeOrmEntity } from '../entidades/cuenta-empresa.typeorm-entity';
import { MapeadorCuentaEmpresaTypeOrm } from '../mapeadores/mapeador-cuenta-empresa.typeorm';

export class RepositorioCuentasEmpresaTypeOrm implements RepositorioCuentasEmpresa {
    constructor(private readonly repository: Repository<CuentaEmpresaTypeOrmEntity>) {}

    async guardar(cuenta: CuentaEmpresa): Promise<void> {
        const entity = MapeadorCuentaEmpresaTypeOrm.aPersistencia(cuenta);
        await this.repository.save(entity);
    }

    async buscarPorId(id: string, empresaId: string): Promise<CuentaEmpresa | null> {
        const entity = await this.repository.findOne({
            where: { id, empresaId },
            relations: { roles: true },
        });

        if (!entity) {
            return null;
        }

        return MapeadorCuentaEmpresaTypeOrm.aDominio(entity);
    }

    async buscarPorCorreo(correo: CorreoAcceso, empresaId: string): Promise<CuentaEmpresa | null> {
        const entity = await this.repository.findOne({
            where: { correoAcceso: correo.valor, empresaId },
            relations: { roles: true },
        });

        if (!entity) {
            return null;
        }

        return MapeadorCuentaEmpresaTypeOrm.aDominio(entity);
    }

    async buscarPorEmpleadoId(empleadoId: string, empresaId: string): Promise<CuentaEmpresa | null> {
        const entity = await this.repository.findOne({
            where: { empleadoId, empresaId },
            relations: { roles: true },
        });

        if (!entity) {
            return null;
        }

        return MapeadorCuentaEmpresaTypeOrm.aDominio(entity);
    }

    async contarActivasPorEmpresa(empresaId: string): Promise<number> {
        return this.repository.count({
            where: { empresaId, estado: 'ACTIVA' },
        });
    }
}
