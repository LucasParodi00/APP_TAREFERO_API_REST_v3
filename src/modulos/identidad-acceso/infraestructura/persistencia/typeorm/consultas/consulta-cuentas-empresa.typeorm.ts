import { Repository, FindOptionsWhere } from 'typeorm';
import {
    ConsultaCuentasEmpresa,
    CuentaEmpresaLectura,
    FiltrosListarCuentas,
    ResultadoListadoCuentas,
} from '../../../../aplicacion/puertos/consulta-cuentas-empresa.puerto';
import { CuentaEmpresaTypeOrmEntity } from '../entidades/cuenta-empresa.typeorm-entity';

export class ConsultaCuentasEmpresaTypeOrm implements ConsultaCuentasEmpresa {
    constructor(private readonly repository: Repository<CuentaEmpresaTypeOrmEntity>) {}

    async consultarPorId(empresaId: string, cuentaId: string): Promise<CuentaEmpresaLectura | null> {
        const entidad = await this.repository.findOne({
            where: { id: cuentaId, empresaId },
            relations: { roles: true },
        });

        if (!entidad) {
            return null;
        }

        return this.aLectura(entidad);
    }

    async listarCuentas(empresaId: string, filtros: FiltrosListarCuentas): Promise<ResultadoListadoCuentas> {
        const where: FindOptionsWhere<CuentaEmpresaTypeOrmEntity> = {
            empresaId,
        };

        if (filtros.estado) {
            where.estado = filtros.estado;
        }
        if (filtros.rol) {
            where.roles = { rol: filtros.rol };
        }

        const [entidades, total] = await this.repository.findAndCount({
            where,
            relations: { roles: true },
            order: { correoAcceso: 'ASC' },
            skip: filtros.desplazamiento,
            take: filtros.limite,
        });

        return {
            datos: entidades.map((e) => this.aLectura(e)),
            paginacion: {
                limite: filtros.limite,
                desplazamiento: filtros.desplazamiento,
                total,
            },
        };
    }

    private aLectura(entidad: CuentaEmpresaTypeOrmEntity): CuentaEmpresaLectura {
        return {
            id: entidad.id,
            empresaId: entidad.empresaId,
            empleadoId: entidad.empleadoId ?? undefined,
            nombreMostrado: entidad.nombreMostrado ?? undefined,
            correoAcceso: entidad.correoAcceso,
            accesoWeb: entidad.accesoWeb,
            accesoMovil: entidad.accesoMovil,
            roles: (entidad.roles || []).map((r) => r.rol),
            estado: entidad.estado,
            version: entidad.version,
            creadoEn: entidad.creadoEn,
            actualizadoEn: entidad.actualizadoEn,
        };
    }
}
