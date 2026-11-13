import { IdentificadorUuid, FechaCivil, FechaHoraUtc } from '../../../../comun/dominio';
import { MensajeOperativo, MotivoAnulacionNovedad } from '../objetos-valor';
import { ErrorRestriccionInvalida, ErrorAnulacionNovedadInvalida } from '../errores';

export interface ParametrosCrearRestriccion {
    id: IdentificadorUuid;
    empresaId: IdentificadorUuid;
    empleadoId: IdentificadorUuid;
    tipo: string;
    inicio: FechaCivil;
    fin?: FechaCivil;
    mensajeOperativo: MensajeOperativo;
}

export interface PropiedadesReconstituirRestriccion {
    id: IdentificadorUuid;
    empresaId: IdentificadorUuid;
    empleadoId: IdentificadorUuid;
    tipo: string;
    inicio: FechaCivil;
    fin?: FechaCivil;
    mensajeOperativo: MensajeOperativo;
    anuladaEn?: FechaHoraUtc;
    anuladaPorCuentaId?: IdentificadorUuid;
    motivoAnulacion?: MotivoAnulacionNovedad;
    version: number;
    creadoEn: FechaHoraUtc;
    actualizadoEn: FechaHoraUtc;
}

export class RestriccionOperativa {
    readonly id: IdentificadorUuid;
    readonly empresaId: IdentificadorUuid;
    readonly empleadoId: IdentificadorUuid;
    private _tipo: string;
    private _inicio: FechaCivil;
    private _fin?: FechaCivil;
    private _mensajeOperativo: MensajeOperativo;
    private _anuladaEn?: FechaHoraUtc;
    private _anuladaPorCuentaId?: IdentificadorUuid;
    private _motivoAnulacion?: MotivoAnulacionNovedad;
    private _version: number;
    private _creadoEn: FechaHoraUtc;
    private _actualizadoEn: FechaHoraUtc;

    private constructor(props: PropiedadesReconstituirRestriccion) {
        if (!props.tipo || props.tipo.trim().length === 0 || props.tipo.trim().length > 150) {
            throw new ErrorRestriccionInvalida('El tipo de restricción debe tener entre 1 y 150 caracteres.');
        }
        if (props.fin && props.fin.valor < props.inicio.valor) {
            throw new ErrorRestriccionInvalida(
                `La fecha de finalización (${props.fin.valor}) no puede ser anterior al inicio (${props.inicio.valor}).`,
            );
        }

        this.id = props.id;
        this.empresaId = props.empresaId;
        this.empleadoId = props.empleadoId;
        this._tipo = props.tipo.trim();
        this._inicio = props.inicio;
        this._fin = props.fin;
        this._mensajeOperativo = props.mensajeOperativo;
        this._anuladaEn = props.anuladaEn;
        this._anuladaPorCuentaId = props.anuladaPorCuentaId;
        this._motivoAnulacion = props.motivoAnulacion;
        this._version = props.version;
        this._creadoEn = props.creadoEn;
        this._actualizadoEn = props.actualizadoEn;
    }

    static crearNueva(params: ParametrosCrearRestriccion): RestriccionOperativa {
        const ahora = FechaHoraUtc.desdeDate(new Date());
        return new RestriccionOperativa({
            id: params.id,
            empresaId: params.empresaId,
            empleadoId: params.empleadoId,
            tipo: params.tipo,
            inicio: params.inicio,
            fin: params.fin,
            mensajeOperativo: params.mensajeOperativo,
            version: 1,
            creadoEn: ahora,
            actualizadoEn: ahora,
        });
    }

    static reconstituir(props: PropiedadesReconstituirRestriccion): RestriccionOperativa {
        return new RestriccionOperativa(props);
    }

    get tipo(): string {
        return this._tipo;
    }

    get inicio(): FechaCivil {
        return this._inicio;
    }

    get fin(): FechaCivil | undefined {
        return this._fin;
    }

    get mensajeOperativo(): MensajeOperativo {
        return this._mensajeOperativo;
    }

    get anuladaEn(): FechaHoraUtc | undefined {
        return this._anuladaEn;
    }

    get anuladaPorCuentaId(): IdentificadorUuid | undefined {
        return this._anuladaPorCuentaId;
    }

    get motivoAnulacion(): MotivoAnulacionNovedad | undefined {
        return this._motivoAnulacion;
    }

    get version(): number {
        return this._version;
    }

    get creadoEn(): FechaHoraUtc {
        return this._creadoEn;
    }

    get actualizadoEn(): FechaHoraUtc {
        return this._actualizadoEn;
    }

    estaAnulada(): boolean {
        return this._anuladaEn !== undefined;
    }

    modificar(cambios: {
        tipo?: string;
        inicio?: FechaCivil;
        fin?: FechaCivil | null;
        mensajeOperativo?: MensajeOperativo;
    }): void {
        if (this.estaAnulada()) {
            throw new ErrorRestriccionInvalida('No se puede modificar una restricción operativa anulada.');
        }

        const nuevoTipo = cambios.tipo !== undefined ? cambios.tipo.trim() : this._tipo;
        if (nuevoTipo.length === 0 || nuevoTipo.length > 150) {
            throw new ErrorRestriccionInvalida('El tipo de restricción debe tener entre 1 y 150 caracteres.');
        }

        const nuevoInicio = cambios.inicio ?? this._inicio;
        const nuevoFin = cambios.fin !== undefined ? (cambios.fin ?? undefined) : this._fin;

        if (nuevoFin && nuevoFin.valor < nuevoInicio.valor) {
            throw new ErrorRestriccionInvalida(
                `La fecha de finalización (${nuevoFin.valor}) no puede ser anterior al inicio (${nuevoInicio.valor}).`,
            );
        }

        this._tipo = nuevoTipo;
        this._inicio = nuevoInicio;
        this._fin = nuevoFin;
        if (cambios.mensajeOperativo) {
            this._mensajeOperativo = cambios.mensajeOperativo;
        }
        this._actualizadoEn = FechaHoraUtc.desdeDate(new Date());
    }

    anular(anuladaPorCuentaId: IdentificadorUuid, motivo: MotivoAnulacionNovedad, fechaHora?: FechaHoraUtc): void {
        if (this.estaAnulada()) {
            throw new ErrorAnulacionNovedadInvalida('La restricción operativa ya se encuentra anulada.');
        }

        this._anuladaPorCuentaId = anuladaPorCuentaId;
        this._motivoAnulacion = motivo;
        this._anuladaEn = fechaHora ?? FechaHoraUtc.desdeDate(new Date());
        this._actualizadoEn = this._anuladaEn;
    }
}
