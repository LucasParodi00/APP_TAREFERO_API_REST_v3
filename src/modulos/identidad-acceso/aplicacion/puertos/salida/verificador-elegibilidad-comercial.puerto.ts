export interface ResultadoElegibilidadComercial {
  habilitada: boolean;
  cupoMaximo: number;
}

export interface VerificadorElegibilidadComercial {
  obtenerElegibilidad(
    empresaId: string,
  ): Promise<ResultadoElegibilidadComercial>;
}
