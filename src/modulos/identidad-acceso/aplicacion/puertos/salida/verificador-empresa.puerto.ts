export interface ReferenciaEmpresaAcc {
  id: string;
  alias: string;
  estado: string;
}

export interface VerificadorEmpresaPuerto {
  existeEmpresa(empresaId: string): Promise<boolean>;
  obtenerPorId(empresaId: string): Promise<ReferenciaEmpresaAcc | null>;
  obtenerPorAlias(alias: string): Promise<ReferenciaEmpresaAcc | null>;
}
