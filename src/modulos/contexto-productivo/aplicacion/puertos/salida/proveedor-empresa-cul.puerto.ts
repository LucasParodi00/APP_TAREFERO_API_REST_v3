export const PROVEEDOR_EMPRESA_CUL = Symbol('PROVEEDOR_EMPRESA_CUL');

export interface ProveedorEmpresaCul {
  verificarEmpresaExisteYActiva(empresaId: string): Promise<boolean>;
}
