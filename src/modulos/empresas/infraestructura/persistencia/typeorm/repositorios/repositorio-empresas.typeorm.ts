import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { RepositorioEmpresas } from '../../../../aplicacion/puertos/salida/repositorio-empresas.puerto';
import { Empresa } from '../../../../dominio/agregados/empresa';
import { CriteriosListadoEmpresas, ResultadoListadoEmpresas } from '../../../../aplicacion/modelos-lectura';
import { EmpresaTypeOrmEntity } from '../entidades/empresa.typeorm-entity';
import { MapeadorEmpresaTypeOrm } from '../mapeadores/mapeador-empresa.typeorm';
import { MapeadorEmpresaLectura } from '../../../../aplicacion/mapeadores/mapeador-empresa-lectura';

export class RepositorioEmpresasTypeOrm implements RepositorioEmpresas {
    constructor(private readonly repository: Repository<EmpresaTypeOrmEntity>) {}

    async guardar(empresa: Empresa): Promise<void> {
        const entidad = MapeadorEmpresaTypeOrm.aPersistencia(empresa);
        await this.repository.save(entidad);
    }

    async obtenerPorId(id: string): Promise<Empresa | null> {
        const entidad = await this.repository.findOne({
            where: { id },
            relations: { configuracionGeneral: true },
        });

        if (!entidad) {
            return null;
        }

        return MapeadorEmpresaTypeOrm.aDominio(entidad);
    }

    async obtenerPorAlias(alias: string): Promise<Empresa | null> {
        const entidad = await this.repository.findOne({
            where: { alias },
            relations: { configuracionGeneral: true },
        });

        if (!entidad) {
            return null;
        }

        return MapeadorEmpresaTypeOrm.aDominio(entidad);
    }

    async existeAlias(alias: string): Promise<boolean> {
        const cantidad = await this.repository.count({
            where: { alias },
        });
        return cantidad > 0;
    }

    async listar(criterios: CriteriosListadoEmpresas): Promise<ResultadoListadoEmpresas> {
        const where: FindOptionsWhere<EmpresaTypeOrmEntity> = {};

        if (criterios.estado) {
            where.estado = criterios.estado;
        }

        if (criterios.nombre) {
            where.nombre = ILike(`%${criterios.nombre}%`);
        }

        const [entidades, total] = await this.repository.findAndCount({
            where,
            relations: { configuracionGeneral: true },
            skip: (criterios.pagina - 1) * criterios.limite,
            take: criterios.limite,
            order: {
                creadoEn: 'DESC',
            },
        });

        const elementos = entidades.map((e) => MapeadorEmpresaLectura.aLectura(MapeadorEmpresaTypeOrm.aDominio(e)));

        return {
            elementos,
            total,
            pagina: criterios.pagina,
            limite: criterios.limite,
            totalPaginas: Math.ceil(total / criterios.limite),
        };
    }
}
