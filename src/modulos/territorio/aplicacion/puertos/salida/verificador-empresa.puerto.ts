export interface VerificadorEmpresaPuertoTer {
  existeEmpresa(empresaId: string): Promise<boolean>;
}
