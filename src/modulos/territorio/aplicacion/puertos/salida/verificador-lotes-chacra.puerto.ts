export interface VerificadorLotesChacraPuerto {
  tieneLotesActivos(empresaId: string, chacraId: string): Promise<boolean>;
}
