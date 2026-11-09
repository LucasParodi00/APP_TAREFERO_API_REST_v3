import {
  VerificadorElegibilidadComercial,
  ResultadoElegibilidadComercial,
} from '../../aplicacion/puertos/salida/verificador-elegibilidad-comercial.puerto';

export class AdaptadorElegibilidadComercialProvisional implements VerificadorElegibilidadComercial {
  private cuposPorEmpresa = new Map<string, number>();
  private inhabilitadas = new Set<string>();
  private fallasSimuladas = new Set<string>();

  public configurarCupo(empresaId: string, cupo: number): void {
    this.cuposPorEmpresa.set(empresaId, cupo);
  }

  public inhabilitar(empresaId: string): void {
    this.inhabilitadas.add(empresaId);
  }

  public simularFalla(empresaId: string): void {
    this.fallasSimuladas.add(empresaId);
  }

  public limpiarSimulaciones(): void {
    this.cuposPorEmpresa.clear();
    this.inhabilitadas.clear();
    this.fallasSimuladas.clear();
  }

  public async obtenerElegibilidad(
    empresaId: string,
  ): Promise<ResultadoElegibilidadComercial> {
    await Promise.resolve();
    if (this.fallasSimuladas.has(empresaId)) {
      throw new Error('Falla simulada de conexión con proveedor comercial');
    }

    const habilitada = !this.inhabilitadas.has(empresaId);
    const cupoMaximo = this.cuposPorEmpresa.get(empresaId) ?? 50;

    return {
      habilitada,
      cupoMaximo,
    };
  }
}
