import { IdentificadorUuid, FechaCivil, FechaHoraUtc } from '../../../../comun/dominio';
import { TipoIndisponibilidad } from '../enumeraciones';
import { MensajeOperativo, MotivoAnulacionNovedad } from '../objetos-valor';
import { ErrorIndisponibilidadInvalida, ErrorAnulacionNovedadInvalida } from '../errores';

export interface ParametrosCrearIndisponibilidad {
    id: IdentificadorUuid;
    empresaId: IdentificadorUuid;
    empleadoId: IdentificadorUuid;
    tipo: TipoIndisponibilidad;
    inicio: FechaCivil;
    fin: FechaCivil;
    mensajeOperativo: MensajeOperativo;
    archivoId?: IdentificadorUuid;
}

export interface PropiedadesReconstituirIndisponibilidad {
    id: IdentificadorUuid;
    empresaId: IdentificadorUuid;
    empleadoId: IdentificadorUuid;
    tipo: TipoIndisponibilidad;
    inicio: FechaCivil;
    fin: FechaCivil;
    mensajeOperativo: MensajeOperativo;
    archivoId?: IdentificadorUuid;
    anuladaEn?: FechaHoraUtc;
    anuladaPorCuentaId?: IdentificadorUuid;
    motivoAnulacion?: MotivoAnulacionNovedad;
    version: number;
    creadoEn: FechaHoraUtc;
    actualizadoEn: FechaHoraUtc;
}

export class Indisponibilidad {
    readonly id: IdentificadorUuid;
    readonly empresaId: IdentificadorUuid;
    readonly empleadoId: IdentificadorUuid;
    private _tipo: TipoIndisponibilidad;
    private _inicio: FechaCivil;
    private _fin: FechaCivil;
    private _mensajeOperativo: MensajeOperativo;
    private _archivoId?: IdentificadorUuid;
    private _anuladaEn?: FechaHoraUtc;
    private _anuladaPorCuentaId?: IdentificadorUuid;
    private _motivoAnulacion?: MotivoAnulacionNovedad;
    private _version: number;
    private _creadoEn: FechaHoraUtc;
    private _actualizadoEn: FechaHoraUtc;

    private constructor(props: PropiedadesReconstituirIndisponibilidad) {
        if (!props.tipo || !Object.values(TipoIndisponibilidad).includes(props.tipo)) {
            throw new ErrorIndisponibilidadInvalida('El tipo de indisponibilidad no es válido.');
        }
        if (props.fin.valor < props.inicio.valor) {
            throw new ErrorIndisponibilidadInvalida(
                `La fecha de finalización (${props.fin.valor}) no puede ser anterior al inicio (${props.inicio.valor}).`,
            );
        }

        this.id = props.id;
        this.empresaId = props.empresaId;
        this.empleadoId = props.empleadoId;
        this._tipo = props.tipo;
        this._inicio = props.inicio;
        this._fin = props.fin;
        this._mensajeOperativo = props.mensajeOperativo;
        this._archivoId = props.archivoId;
        this._anuladaEn = props.anuladaEn;
        this._anuladaPorCuentaId = props.anuladaPorCuentaId;
        this._motivoAnulacion = props.motivoAnulacion;
        this._version = props.version;
        this._creadoEn = props.creadoEn;
        this._actualizadoEn = props.actualizadoEn;
    }

    static crearNueva(params: ParametrosCrearIndisponibilidad): Indisponibilidad {
        const ahora = FechaHoraUtc.desdeDate(new Date());
        return new Indisponibilidad({
            id: params.id,
            empresaId: params.empresaId,
            empleadoId: params.empleadoId,
            tipo: params.tipo,
            inicio: params.inicio,
            fin: params.fin,
            mensajeOperativo: params.mensajeOperativo,
            archivoId: params.archivoId,
            version: 1,
            creadoEn: ahora,
            actualizadoEn: ahora,
        });
    }

    static reconstituir(props: PropiedadesReconstituirIndisponibilidad): Indisponibilidad {
        return new Indisponibilidad(props);
    }

    get tipo(): TipoIndisponibilidad {
        return this._tipo;
    }

    get inicio(): FechaCivil {
        return this._inicio;
    }

    get fin(): FechaCivil {
        return this._fin;
    }

    get mensajeOperativo(): MensajeOperativo {
        return this._mensajeOperativo;
    }

    get archivoId(): IdentificadorUuid | undefined {
        return this._archivoId;
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
        tipo?: TipoIndisponibilidad;
        inicio?: FechaCivil;
        fin?: FechaCivil;
        mensajeOperativo?: MensajeOperativo;
        archivoId?: IdentificadorUuid | null;
    }): void {
        if (this.estaAnulada()) {
            throw new ErrorIndisponibilidadInvalida('No se puede modificar una indisponibilidad anulada.');
        }

        const nuevoTipo = cambios.tipo ?? this._tipo;
        const nuevoInicio = cambios.inicio ?? this._inicio;
        const nuevoFin = cambios.fin ?? this._fin;

        if (nuevoFin.valor < nuevoInicio.valor) {
            throw new ErrorIndisponibilidadInvalida(
                `La fecha de finalización (${nuevoFin.valor}) no puede ser anterior al inicio (${nuevoInicio.valor}).`,
            );
        }

        this._tipo = nuevoTipo;
        this._inicio = nuevoInicio;
        this._fin = nuevoFin;
        if (cambios.mensajeOperativo) {
            this._mensajeOperativo = cambios.mensajeOperativo;
        }
        if (cambios.archivoId !== undefined) {
            this._archivoId = cambios.archivoId ?? undefined;
        }
        this._actualizadoEn = FechaHoraUtc.desdeDate(new Date());
    }

    anular(anuladaPorCuentaId: IdentificadorUuid, motivo: MotivoAnulacionNovedad, fechaHora?: FechaHoraUtc): void {
        if (this.estaAnulada()) {
            throw new ErrorAnulacionNovedadInvalida('La indisponibilidad ya se encuentra anulada.');
        }

        this._anuladaPorCuentaId = anuladaPorCuentaId;
        this._motivoAnulacion = motivo;
        this._anuladaEn = fechaHora ?? FechaHoraUtc.desdeDate(new Date());
        this._actualizadoEn = this._anuladaEn;
    }
}
