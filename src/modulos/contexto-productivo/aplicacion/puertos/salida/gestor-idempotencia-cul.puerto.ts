export interface RegistroIdempotenciaCul {
  clave: string;
  solicitudHash: string;
  respuestaJson: string;
  codigoEstado: number;
  creadoEn: Date;
}

export const GESTOR_IDEMPOTENCIA_CUL = Symbol('GESTOR_IDEMPOTENCIA_CUL');

export interface GestorIdempotenciaCul {
  obtener(clave: string): Promise<RegistroIdempotenciaCul | null>;
  guardar(registro: RegistroIdempotenciaCul): Promise<void>;
}
