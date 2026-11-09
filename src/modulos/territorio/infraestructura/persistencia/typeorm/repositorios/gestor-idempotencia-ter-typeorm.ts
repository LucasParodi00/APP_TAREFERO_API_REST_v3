import { DataSource, Repository } from 'typeorm';
import {
  GestorIdempotenciaTer,
  RegistroIdempotenciaTer,
} from '../../../../aplicacion/puertos/salida/gestor-idempotencia-ter';
import { RegistroIdempotenciaTerTypeOrmEntidad } from '../entidades/registro-idempotencia-ter.typeorm-entidad';

export class GestorIdempotenciaTerTypeOrm implements GestorIdempotenciaTer {
  private readonly repo: Repository<RegistroIdempotenciaTerTypeOrmEntidad>;

  constructor(private readonly dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(
      RegistroIdempotenciaTerTypeOrmEntidad,
    );
  }

  public async obtener(clave: string): Promise<RegistroIdempotenciaTer | null> {
    const entidad = await this.repo.findOneBy({ clave });
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

  public async guardar(registro: RegistroIdempotenciaTer): Promise<void> {
    const entidad = new RegistroIdempotenciaTerTypeOrmEntidad();
    entidad.clave = registro.clave;
    entidad.solicitudHash = registro.solicitudHash;
    entidad.respuestaJson = registro.respuestaJson;
    entidad.codigoEstado = registro.codigoEstado;
    entidad.creadoEn = registro.creadoEn;
    await this.repo.save(entidad);
  }
}
