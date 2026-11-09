export const PROVEEDOR_HABILITACION_CULTIVO = Symbol(
  'PROVEEDOR_HABILITACION_CULTIVO',
);

export interface ProveedorHabilitacionCultivo {
  verificarCultivoHabilitadoParaEmpresa(
    cultivoId: string,
    empresaId: string,
  ): Promise<boolean>;
}
