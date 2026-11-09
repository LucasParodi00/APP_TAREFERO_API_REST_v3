export const PROVEEDOR_LOTE_CUL = Symbol('PROVEEDOR_LOTE_CUL');

export interface ProveedorLoteCul {
  verificarLotePerteneceAEmpresaYActivo(
    empresaId: string,
    loteId: string,
  ): Promise<boolean>;
}
