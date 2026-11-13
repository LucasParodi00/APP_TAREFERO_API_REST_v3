import { ErrorPuntoGeograficoInvalido } from '../errores';

export class PuntoGeograficoReferencia {
    private readonly _latitud: number;
    private readonly _longitud: number;

    private constructor(latitud: number, longitud: number) {
        this._latitud = latitud;
        this._longitud = longitud;
    }

    public static crear(latitud: number, longitud: number): PuntoGeograficoReferencia {
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
            throw new ErrorPuntoGeograficoInvalido();
        }

        return new PuntoGeograficoReferencia(latitud, longitud);
    }

    get latitud(): number {
        return this._latitud;
    }

    get longitud(): number {
        return this._longitud;
    }
}
