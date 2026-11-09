import {
  PuertoReferenciaEmpresa,
  ReferenciaEmpresa,
} from '../puertos/entrada/referencia-empresa.puerto';
import { RepositorioEmpresas } from '../puertos/salida/repositorio-empresas';

export class ServicioReferenciaEmpresa implements PuertoReferenciaEmpresa {
  constructor(private readonly repositorioEmpresas: RepositorioEmpresas) {}

  public async obtenerPorId(id: string): Promise<ReferenciaEmpresa | null> {
    const empresa = await this.repositorioEmpresas.buscarPorId(id);
    if (!empresa) {
      return null;
    }
    return {
      id: empresa.id,
      alias: empresa.alias,
      estado: empresa.estado,
    };
  }

  public async obtenerPorAlias(
    alias: string,
  ): Promise<ReferenciaEmpresa | null> {
    const empresa = await this.repositorioEmpresas.buscarPorAlias(alias);
    if (!empresa) {
      return null;
    }
    return {
      id: empresa.id,
      alias: empresa.alias,
      estado: empresa.estado,
    };
  }
}
