export enum EstadoVerificacionPersona {
  VALIDA = 'VALIDA',
  EMPRESA_INCOMPATIBLE = 'EMPRESA_INCOMPATIBLE',
  NO_DISPONIBLE = 'NO_DISPONIBLE',
}

export interface VerificadorPersona {
  verificar(
    empresaId: string,
    personaId: string,
  ): Promise<EstadoVerificacionPersona>;
}
