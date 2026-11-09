import {
  VerificadorPersona,
  EstadoVerificacionPersona,
} from '../../aplicacion/puertos/salida/verificador-persona.puerto';

export class AdaptadorVerificadorPersonaProvisional implements VerificadorPersona {
  private personasIncompatibles = new Set<string>();
  private personasNoDisponibles = new Set<string>();

  public marcarIncompatible(personaId: string): void {
    this.personasIncompatibles.add(personaId);
  }

  public marcarNoDisponible(personaId: string): void {
    this.personasNoDisponibles.add(personaId);
  }

  public limpiar(): void {
    this.personasIncompatibles.clear();
    this.personasNoDisponibles.clear();
  }

  public async verificar(
    empresaId: string,
    personaId: string,
  ): Promise<EstadoVerificacionPersona> {
    await Promise.resolve();
    if (this.personasIncompatibles.has(personaId)) {
      return EstadoVerificacionPersona.EMPRESA_INCOMPATIBLE;
    }
    if (this.personasNoDisponibles.has(personaId)) {
      return EstadoVerificacionPersona.NO_DISPONIBLE;
    }
    return EstadoVerificacionPersona.VALIDA;
  }
}
