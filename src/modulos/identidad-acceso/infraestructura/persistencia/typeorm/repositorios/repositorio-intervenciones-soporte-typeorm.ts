import { Repository } from 'typeorm';
import { IntervencionSoporte } from '../../../../dominio/entidades/intervencion-soporte';
import { MotivoSoporte } from '../../../../dominio/objetos-valor/motivo-soporte';
import {
  RepositorioIntervencionesSoporte,
  OpcionesPaginacionIntervenciones,
} from '../../../../aplicacion/puertos/salida/repositorio-intervenciones-soporte';
import { IntervencionSoporteTypeOrmEntidad } from '../entidades/intervencion-soporte.typeorm-entidad';

export class RepositorioIntervencionesSoporteTypeOrm implements RepositorioIntervencionesSoporte {
  constructor(
    private readonly repositorioTypeOrm: Repository<IntervencionSoporteTypeOrmEntidad>,
  ) {}

  public async guardar(intervencion: IntervencionSoporte): Promise<void> {
    await this.repositorioTypeOrm.save({
      id: intervencion.id,
      usuarioPlataformaId: intervencion.usuarioPlataformaId,
      empresaId: intervencion.empresaId,
      motivo: intervencion.motivo.valor,
      sesionId: intervencion.sesionId,
      solicitudId: intervencion.solicitudId,
      ocurridaEn: intervencion.ocurridaEn,
    });
  }

  public async listarPorEmpresa(
    empresaId: string,
    opciones: OpcionesPaginacionIntervenciones,
  ): Promise<{ datos: IntervencionSoporte[]; total: number }> {
    const ordenDireccion = opciones.orden === 'ocurridaEn:asc' ? 'ASC' : 'DESC';

    const [entidades, total] = await this.repositorioTypeOrm.findAndCount({
      where: { empresaId },
      order: {
        ocurridaEn: ordenDireccion,
        id: 'ASC',
      },
      skip: opciones.desplazamiento,
      take: opciones.limite,
    });

    const datos = entidades.map((entidad) =>
      IntervencionSoporte.crear({
        id: entidad.id,
        usuarioPlataformaId: entidad.usuarioPlataformaId,
        empresaId: entidad.empresaId,
        motivo: MotivoSoporte.crear(entidad.motivo),
        sesionId: entidad.sesionId,
        solicitudId: entidad.solicitudId,
        ocurridaEn: entidad.ocurridaEn,
      }),
    );

    return { datos, total };
  }
}
