import { ErrorFechaHoraUtcInvalida } from '../errores/error-dominio.base';

export class FechaHoraUtc {
    readonly valor: string;
    private readonly _milisegundos: number;

    constructor(valor: string) {
        if (!valor || typeof valor !== 'string') {
            throw new ErrorFechaHoraUtcInvalida('La fecha y hora no puede estar vacía.');
        }

        const fecha = new Date(valor);
        if (isNaN(fecha.getTime())) {
            throw new ErrorFechaHoraUtcInvalida(`La fecha y hora "${valor}" no es válida.`);
        }

        this.valor = fecha.toISOString();
        this._milisegundos = fecha.getTime();
        Object.freeze(this);
    }

    static desdeDate(date: Date): FechaHoraUtc {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            throw new ErrorFechaHoraUtcInvalida('El objeto Date no es válido.');
        }
        return new FechaHoraUtc(date.toISOString());
    }

    aDate(): Date {
        return new Date(this._milisegundos);
    }

    equals(otro: FechaHoraUtc | null | undefined): boolean {
        if (!otro || !(otro instanceof FechaHoraUtc)) {
            return false;
        }
        return this._milisegundos === otro._milisegundos;
    }

    esAnteriorA(otro: FechaHoraUtc): boolean {
        return this._milisegundos < otro._milisegundos;
    }

    esPosteriorA(otro: FechaHoraUtc): boolean {
        return this._milisegundos > otro._milisegundos;
    }

    toString(): string {
        return this.valor;
    }

    toJSON(): string {
        return this.valor;
    }
}
