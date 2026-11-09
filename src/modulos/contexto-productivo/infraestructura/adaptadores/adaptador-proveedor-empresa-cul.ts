import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProveedorEmpresaCul } from '../../aplicacion/puertos/salida/proveedor-empresa-cul.puerto';

@Injectable()
export class AdaptadorProveedorEmpresaCul implements ProveedorEmpresaCul {
  public constructor(private readonly dataSource: DataSource) {}

  public async verificarEmpresaExisteYActiva(
    empresaId: string,
  ): Promise<boolean> {
    try {
      const res = await this.dataSource.query<Array<{ '?column?': number }>>(
        "SELECT 1 FROM empresas WHERE id = $1 AND estado = 'ACTIVA' LIMIT 1",
        [empresaId],
      );
      return res.length > 0;
    } catch {
      return false;
    }
  }
}
