import { DataSource } from 'typeorm';
import { VerificadorEmpresaPuertoTer } from '../../aplicacion/puertos/salida/verificador-empresa.puerto';

export class AdaptadorVerificadorEmpresaTer implements VerificadorEmpresaPuertoTer {
  constructor(private readonly dataSource: DataSource) {}

  public async existeEmpresa(empresaId: string): Promise<boolean> {
    const res = await this.dataSource.query<Array<{ '?column?': number }>>(
      'SELECT 1 FROM empresas WHERE id = $1 LIMIT 1',
      [empresaId],
    );
    return res.length > 0;
  }
}
