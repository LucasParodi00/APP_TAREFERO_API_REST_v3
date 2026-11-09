export interface RegistroIdempotenciaTer {
  clave: string;
  solicitudHash: string;
  respuestaJson: string;
  codigoEstado: number;
  creadoEn: Date;
}

export interface GestorIdempotenciaTer {
  obtener(clave: string): Promise<RegistroIdempotenciaTer | null>;
  guardar(registro: RegistroIdempotenciaTer): Promise<void>;
}
