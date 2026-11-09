import { ErrorDominioTerritorio } from '../errores/error-dominio-territorio';

export interface PuntoGeografico {
  latitud: number;
  longitud: number;
}

export class UbicacionGeografica {
  private constructor(
    public readonly latitud: number,
    public readonly longitud: number,
  ) {}

  public static crear(
    punto?: PuntoGeografico | null,
  ): UbicacionGeografica | undefined {
    if (!punto) {
      return undefined;
    }

    const { latitud, longitud } = punto;

    if (
      typeof latitud !== 'number' ||
      typeof longitud !== 'number' ||
      Number.isNaN(latitud) ||
      Number.isNaN(longitud) ||
      latitud < -90 ||
      latitud > 90 ||
      longitud < -180 ||
      longitud > 180
    ) {
      throw new ErrorDominioTerritorio(
        'TER_UBICACION_GEOGRAFICA_INVALIDA',
        'La ubicación geográfica debe incluir latitud [-90, 90] y longitud [-180, 180].',
      );
    }

    return new UbicacionGeografica(latitud, longitud);
  }

  public toJSON(): PuntoGeografico {
    return {
      latitud: this.latitud,
      longitud: this.longitud,
    };
  }
}
