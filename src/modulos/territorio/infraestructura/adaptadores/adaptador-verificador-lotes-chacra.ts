import { DataSource } from 'typeorm';
import { VerificadorLotesChacraPuerto } from '../../aplicacion/puertos/salida/verificador-lotes-chacra.puerto';

export class AdaptadorVerificadorLotesChacra implements VerificadorLotesChacraPuerto {
  constructor(private readonly dataSource: DataSource) {}

  public async tieneLotesActivos(
    empresaId: string,
    chacraId: string,
  ): Promise<boolean> {
    try {
      const res = await this.dataSource.query<Array<{ '?column?': number }>>(
        "SELECT 1 FROM lotes WHERE empresa_id = $1 AND chacra_id = $2 AND estado = 'ACTIVO' LIMIT 1",
        [empresaId, chacraId],
      );
      return res.length > 0;
    } catch {
      return false;
    }
  }
}
