export interface RegistroIdempotencia {
  clave: string;
  solicitudHash: string;
  respuestaJson: string;
  codigoEstado: number;
  creadoEn: Date;
}

export interface GestorIdempotenciaAcc {
  obtener(clave: string): Promise<RegistroIdempotencia | null>;
  guardar(registro: RegistroIdempotencia): Promise<void>;
}
