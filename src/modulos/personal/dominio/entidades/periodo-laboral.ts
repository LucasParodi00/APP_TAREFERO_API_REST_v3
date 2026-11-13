import { IdentificadorUuid, FechaCivil } from '../../../../comun/dominio';
import { MotivoFinPeriodo } from '../objetos-valor';
import { ErrorTransicionEmpleadoInvalida } from '../errores';

export interface PropiedadesPeriodoLaboral {
    id: IdentificadorUuid;
    empresaId: IdentificadorUuid;
    empleadoId: IdentificadorUuid;
    inicio: FechaCivil;
    fin?: FechaCivil;
    motivoFin?: MotivoFinPeriodo;
}

export class PeriodoLaboral {
    readonly id: IdentificadorUuid;
    readonly empresaId: IdentificadorUuid;
    readonly empleadoId: IdentificadorUuid;
    readonly inicio: FechaCivil;
    private _fin?: FechaCivil;
    private _motivoFin?: MotivoFinPeriodo;

    constructor(props: PropiedadesPeriodoLaboral) {
        this.id = props.id;
        this.empresaId = props.empresaId;
        this.empleadoId = props.empleadoId;
        this.inicio = props.inicio;
        this._fin = props.fin;
        this._motivoFin = props.motivoFin;

        if (this._fin && this._fin.valor < this.inicio.valor) {
            throw new ErrorTransicionEmpleadoInvalida(
                `La fecha de finalización (${this._fin.valor}) no puede ser anterior al inicio del período (${this.inicio.valor}).`,
            );
        }
    }

    get fin(): FechaCivil | undefined {
        return this._fin;
    }

    get motivoFin(): MotivoFinPeriodo | undefined {
        return this._motivoFin;
    }

    cerrar(fin: FechaCivil, motivoFin: MotivoFinPeriodo): void {
        if (fin.valor < this.inicio.valor) {
            throw new ErrorTransicionEmpleadoInvalida(
                `La fecha de finalización (${fin.valor}) no puede ser anterior al inicio del período (${this.inicio.valor}).`,
            );
        }
        this._fin = fin;
        this._motivoFin = motivoFin;
    }
}
