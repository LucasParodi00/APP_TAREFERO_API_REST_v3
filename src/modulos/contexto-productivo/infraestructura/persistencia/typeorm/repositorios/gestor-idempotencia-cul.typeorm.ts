import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import {
  GestorIdempotenciaCul,
  RegistroIdempotenciaCul,
} from '../../../../aplicacion/puertos/salida/gestor-idempotencia-cul.puerto';
import { RegistroIdempotenciaCulTypeOrmEntidad } from '../entidades/registro-idempotencia-cul.typeorm-entidad';

@Injectable()
export class GestorIdempotenciaCulTypeOrm implements GestorIdempotenciaCul {
  private readonly repo: Repository<RegistroIdempotenciaCulTypeOrmEntidad>;

  public constructor(private readonly dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(
      RegistroIdempotenciaCulTypeOrmEntidad,
    );
  }

  public async obtener(clave: string): Promise<RegistroIdempotenciaCul | null> {
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

  public async guardar(registro: RegistroIdempotenciaCul): Promise<void> {
    const entidad = new RegistroIdempotenciaCulTypeOrmEntidad();
    entidad.clave = registro.clave;
    entidad.solicitudHash = registro.solicitudHash;
    entidad.respuestaJson = registro.respuestaJson;
    entidad.codigoEstado = registro.codigoEstado;
    entidad.creadoEn = registro.creadoEn;
    await this.repo.save(entidad);
  }
}
