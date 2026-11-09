import { Repository } from 'typeorm';
import {
  GestorIdempotenciaAcc,
  RegistroIdempotencia,
} from '../../../../aplicacion/puertos/salida/gestor-idempotencia-acc';
import { RegistroIdempotenciaAccTypeOrmEntidad } from '../entidades/registro-idempotencia-acc.typeorm-entidad';

export class GestorIdempotenciaAccTypeOrm implements GestorIdempotenciaAcc {
  constructor(
    private readonly repositorioTypeOrm: Repository<RegistroIdempotenciaAccTypeOrmEntidad>,
  ) {}

  public async obtener(clave: string): Promise<RegistroIdempotencia | null> {
    const entidad = await this.repositorioTypeOrm.findOne({ where: { clave } });
    if (!entidad) {
      return null;
    }
    return {
      clave: entidad.clave,
      solicitudHash: entidad.solicitudHash,
      respuestaJson: entidad.respuestaJson,
      codigoEstado: entidad.codigoEstado,
      creadoEn: entidad.creadoEn,
    };
  }

  public async guardar(registro: RegistroIdempotencia): Promise<void> {
    await this.repositorioTypeOrm.save({
      clave: registro.clave,
      solicitudHash: registro.solicitudHash,
      respuestaJson: registro.respuestaJson,
      codigoEstado: registro.codigoEstado,
      creadoEn: registro.creadoEn,
    });
  }
}
