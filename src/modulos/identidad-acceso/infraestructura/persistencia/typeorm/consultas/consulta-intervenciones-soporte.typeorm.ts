import { Repository } from 'typeorm';
import {
    ConsultaIntervencionesSoporte,
    FiltrosListarIntervenciones,
    IntervencionSoporteLectura,
    ResultadoListadoIntervenciones,
} from '../../../../aplicacion/puertos/consulta-intervenciones-soporte.puerto';
import { IntervencionSoporteTypeOrmEntity } from '../entidades/intervencion-soporte.typeorm-entity';

export class ConsultaIntervencionesSoporteTypeOrm implements ConsultaIntervencionesSoporte {
    constructor(private readonly repository: Repository<IntervencionSoporteTypeOrmEntity>) {}

    async listarIntervenciones(empresaId: string, filtros: FiltrosListarIntervenciones): Promise<ResultadoListadoIntervenciones> {
        const [entidades, total] = await this.repository.findAndCount({
            where: { empresaId },
            order: { ocurridaEn: 'DESC' },
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

    private aLectura(entidad: IntervencionSoporteTypeOrmEntity): IntervencionSoporteLectura {
        return {
            id: entidad.id,
            usuarioPlataformaId: entidad.usuarioPlataformaId,
            empresaId: entidad.empresaId,
            motivo: entidad.motivo,
            ocurridaEn: entidad.ocurridaEn,
            venceEn: entidad.venceEn,
        };
    }
}
