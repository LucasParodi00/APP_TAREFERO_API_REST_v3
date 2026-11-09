export const PROVEEDOR_UNIDAD_CUL = Symbol('PROVEEDOR_UNIDAD_CUL');

export interface ProveedorUnidadCul {
  verificarUnidadExisteYValida(unidadId: string): Promise<boolean>;
}
