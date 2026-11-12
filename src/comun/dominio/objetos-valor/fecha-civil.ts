import { ErrorFechaCivilInvalida } from '../errores/error-dominio.base';

const FORMATO_FECHA_CIVIL = /^\d{4}-\d{2}-\d{2}$/;

export class FechaCivil {
    readonly valor: string;
    readonly anio: number;
    readonly mes: number;
    readonly dia: number;

    constructor(valor: string) {
        if (!valor || typeof valor !== 'string' || !FORMATO_FECHA_CIVIL.test(valor)) {
            throw new ErrorFechaCivilInvalida('El formato de fecha civil debe ser AAAA-MM-DD.');
        }

        const [anioStr, mesStr, diaStr] = valor.split('-');
        const anio = parseInt(anioStr, 10);
        const mes = parseInt(mesStr, 10);
        const dia = parseInt(diaStr, 10);

        if (mes < 1 || mes > 12) {
            throw new ErrorFechaCivilInvalida(`El mes "${mes}" no es válido.`);
        }

        const fechaUtc = new Date(Date.UTC(anio, mes - 1, dia));
        if (fechaUtc.getUTCFullYear() !== anio || fechaUtc.getUTCMonth() !== mes - 1 || fechaUtc.getUTCDate() !== dia) {
            throw new ErrorFechaCivilInvalida(`La fecha "${valor}" no existe en el calendario civil.`);
        }

        this.valor = valor;
        this.anio = anio;
        this.mes = mes;
        this.dia = dia;
        Object.freeze(this);
    }

    equals(otro: FechaCivil | null | undefined): boolean {
        if (!otro || !(otro instanceof FechaCivil)) {
            return false;
        }
        return this.valor === otro.valor;
    }

    toString(): string {
        return this.valor;
    }

    toJSON(): string {
        return this.valor;
    }
}
