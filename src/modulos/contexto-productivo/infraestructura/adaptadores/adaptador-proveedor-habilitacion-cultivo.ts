import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProveedorHabilitacionCultivo } from '../../aplicacion/puertos/salida/proveedor-habilitacion-cultivo.puerto';

@Injectable()
export class AdaptadorProveedorHabilitacionCultivo implements ProveedorHabilitacionCultivo {
  public constructor(private readonly dataSource: DataSource) {}

  public async verificarCultivoHabilitadoParaEmpresa(
    cultivoId: string,
    empresaId: string,
  ): Promise<boolean> {
    try {
      const res = await this.dataSource.query<Array<{ '?column?': number }>>(
        'SELECT 1 FROM cultivos_habilitados_empresa WHERE cultivo_id = $1 AND empresa_id = $2 AND habilitado = true LIMIT 1',
        [cultivoId, empresaId],
      );
      return res.length > 0;
    } catch {
      return false;
    }
  }
}
