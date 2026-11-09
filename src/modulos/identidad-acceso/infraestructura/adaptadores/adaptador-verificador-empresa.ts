import {
  VerificadorEmpresaPuerto,
  ReferenciaEmpresaAcc,
} from '../../aplicacion/puertos/salida/verificador-empresa.puerto';
import { PuertoReferenciaEmpresa } from '../../../empresas/aplicacion/puertos/entrada/referencia-empresa.puerto';

export class AdaptadorVerificadorEmpresa implements VerificadorEmpresaPuerto {
  constructor(
    private readonly puertoReferenciaEmpresa: PuertoReferenciaEmpresa,
  ) {}

  public async existeEmpresa(empresaId: string): Promise<boolean> {
    const empresa = await this.puertoReferenciaEmpresa.obtenerPorId(empresaId);
    return empresa !== null;
  }

  public async obtenerPorId(
    empresaId: string,
  ): Promise<ReferenciaEmpresaAcc | null> {
    const empresa = await this.puertoReferenciaEmpresa.obtenerPorId(empresaId);
    if (!empresa) return null;
    return {
      id: empresa.id,
      alias: empresa.alias,
      estado: empresa.estado,
    };
  }

  public async obtenerPorAlias(
    alias: string,
  ): Promise<ReferenciaEmpresaAcc | null> {
    const empresa = await this.puertoReferenciaEmpresa.obtenerPorAlias(alias);
    if (!empresa) return null;
    return {
      id: empresa.id,
      alias: empresa.alias,
      estado: empresa.estado,
    };
  }
}
