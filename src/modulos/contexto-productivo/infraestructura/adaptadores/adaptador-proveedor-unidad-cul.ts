import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProveedorUnidadCul } from '../../aplicacion/puertos/salida/proveedor-unidad-cul.puerto';

@Injectable()
export class AdaptadorProveedorUnidadCul implements ProveedorUnidadCul {
  private readonly unidadesValidas = new Set([
    'kg',
    'tn',
    'g',
    'mg',
    'l',
    'ml',
    'ha',
    'm2',
    'm',
    'cm',
    'mm',
    'unidad',
    'plantas_ha',
  ]);

  public constructor(private readonly dataSource: DataSource) {}

  public async verificarUnidadExisteYValida(
    unidadId: string,
  ): Promise<boolean> {
    if (this.unidadesValidas.has(unidadId.toLowerCase())) {
      return true;
    }

    try {
      const res = await this.dataSource.query<Array<{ '?column?': number }>>(
        'SELECT 1 FROM unidades_medida WHERE id = $1 AND activo = true LIMIT 1',
        [unidadId],
      );
      return res.length > 0;
    } catch {
      return false;
    }
  }
}
