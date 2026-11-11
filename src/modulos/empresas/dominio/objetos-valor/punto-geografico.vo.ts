import { UbicacionGeograficaInvalida } from '../errores';

export class PuntoGeografico {
    private readonly _latitud: number;
    private readonly _longitud: number;

    constructor(latitud: number, longitud: number) {
        if (
            typeof latitud !== 'number' ||
            typeof longitud !== 'number' ||
            isNaN(latitud) ||
            isNaN(longitud) ||
            latitud < -90 ||
            latitud > 90 ||
            longitud < -180 ||
            longitud > 180
        ) {
            throw new UbicacionGeograficaInvalida();
        }

        this._latitud = latitud;
        this._longitud = longitud;
    }

    get latitud(): number {
        return this._latitud;
    }

    get longitud(): number {
        return this._longitud;
    }

    equals(otro: PuntoGeografico): boolean {
        return this._latitud === otro._latitud && this._longitud === otro._longitud;
    }
}
