import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { ConsultaEmpresas } from '../../aplicacion/puertos/consulta-empresas.puerto';
import { CriteriosListadoEmpresas, ResultadoListadoEmpresas, EmpresaLectura } from '../../aplicacion/modelos-lectura';
import { EmpresaTypeOrmEntity } from './empresa.typeorm-entity';
import { MapeadorEmpresaLecturaTypeOrm } from './mapeador-empresa-lectura.typeorm';

export class ConsultaEmpresasTypeOrm implements ConsultaEmpresas {
    constructor(private readonly repository: Repository<EmpresaTypeOrmEntity>) {}

    async obtenerPorIdOAlias(idOAlias: string): Promise<EmpresaLectura | null> {
        const entidad = await this.repository.findOne({
            where: [{ id: idOAlias }, { alias: idOAlias }],
            relations: { configuracionGeneral: true },
        });

        if (!entidad) {
            return null;
        }

        return MapeadorEmpresaLecturaTypeOrm.aLectura(entidad);
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
            order: { nombre: 'ASC' },
            skip: (criterios.pagina - 1) * criterios.limite,
            take: criterios.limite,
        });

        const totalPaginas = Math.ceil(total / criterios.limite);

        return {
            elementos: entidades.map((e) => MapeadorEmpresaLecturaTypeOrm.aLectura(e)),
            total,
            pagina: criterios.pagina,
            limite: criterios.limite,
            totalPaginas,
        };
    }
}
