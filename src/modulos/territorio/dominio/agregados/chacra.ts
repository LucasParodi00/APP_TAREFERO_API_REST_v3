import { EstadoChacra } from '../enumeraciones';
import { NombreChacra, NombreCortoChacra, DireccionChacra, PuntoGeograficoReferencia, ResponsableChacra } from '../objetos-valor';
import { ErrorTransicionChacraInvalida } from '../errores';

export interface ParametrosRegistroChacra {
    id: string;
    empresaId: string;
    nombre: NombreChacra;
    nombreCorto: NombreCortoChacra;
    responsableNombre: ResponsableChacra | null;
    direccion: DireccionChacra | null;
    puntoGeograficoReferencia: PuntoGeograficoReferencia | null;
    creadoEn: Date;
    creadoPor: string;
}

export interface ParametrosModificacionChacra {
    nombre: NombreChacra;
    nombreCorto: NombreCortoChacra;
    responsableNombre: ResponsableChacra | null;
    direccion: DireccionChacra | null;
    puntoGeograficoReferencia: PuntoGeograficoReferencia | null;
    actualizadoEn: Date;
    actualizadoPor: string;
}

export interface PropiedadesChacra {
    id: string;
    empresaId: string;
    nombre: NombreChacra;
    nombreCorto: NombreCortoChacra;
    responsableNombre: ResponsableChacra | null;
    direccion: DireccionChacra | null;
    puntoGeograficoReferencia: PuntoGeograficoReferencia | null;
    estado: EstadoChacra;
    creadoEn: Date;
    creadoPor: string;
    actualizadoEn: Date;
    actualizadoPor: string;
    version: number;
}

export class Chacra {
    private readonly _id: string;
    private readonly _empresaId: string;
    private _nombre: NombreChacra;
    private _nombreCorto: NombreCortoChacra;
    private _responsableNombre: ResponsableChacra | null;
    private _direccion: DireccionChacra | null;
    private _puntoGeograficoReferencia: PuntoGeograficoReferencia | null;
    private _estado: EstadoChacra;
    private readonly _creadoEn: Date;
    private readonly _creadoPor: string;
    private _actualizadoEn: Date;
    private _actualizadoPor: string;
    private _version: number;

    private constructor(props: PropiedadesChacra) {
        this._id = props.id;
        this._empresaId = props.empresaId;
        this._nombre = props.nombre;
        this._nombreCorto = props.nombreCorto;
        this._responsableNombre = props.responsableNombre;
        this._direccion = props.direccion;
        this._puntoGeograficoReferencia = props.puntoGeograficoReferencia;
        this._estado = props.estado;
        this._creadoEn = props.creadoEn;
        this._creadoPor = props.creadoPor;
        this._actualizadoEn = props.actualizadoEn;
        this._actualizadoPor = props.actualizadoPor;
        this._version = props.version;
    }

    public static registrar(params: ParametrosRegistroChacra): Chacra {
        return new Chacra({
            id: params.id,
            empresaId: params.empresaId,
            nombre: params.nombre,
            nombreCorto: params.nombreCorto,
            responsableNombre: params.responsableNombre,
            direccion: params.direccion,
            puntoGeograficoReferencia: params.puntoGeograficoReferencia,
            estado: EstadoChacra.ACTIVA,
            creadoEn: params.creadoEn,
            creadoPor: params.creadoPor,
            actualizadoEn: params.creadoEn,
            actualizadoPor: params.creadoPor,
            version: 1,
        });
    }

    public static reconstituir(props: PropiedadesChacra): Chacra {
        return new Chacra(props);
    }

    public modificarDescriptivos(params: ParametrosModificacionChacra): void {
        this._nombre = params.nombre;
        this._nombreCorto = params.nombreCorto;
        this._responsableNombre = params.responsableNombre;
        this._direccion = params.direccion;
        this._puntoGeograficoReferencia = params.puntoGeograficoReferencia;
        this._actualizadoEn = params.actualizadoEn;
        this._actualizadoPor = params.actualizadoPor;
        this._version += 1;
    }

    public inactivar(fecha: Date, actorId: string): void {
        if (this._estado === EstadoChacra.INACTIVA) {
            throw new ErrorTransicionChacraInvalida('La chacra ya se encuentra inactiva.');
        }

        this._estado = EstadoChacra.INACTIVA;
        this._actualizadoEn = fecha;
        this._actualizadoPor = actorId;
        this._version += 1;
    }

    get id(): string {
        return this._id;
    }

    get empresaId(): string {
        return this._empresaId;
    }

    get nombre(): NombreChacra {
        return this._nombre;
    }

    get nombreCorto(): NombreCortoChacra {
        return this._nombreCorto;
    }

    get responsableNombre(): ResponsableChacra | null {
        return this._responsableNombre;
    }

    get direccion(): DireccionChacra | null {
        return this._direccion;
    }

    get puntoGeograficoReferencia(): PuntoGeograficoReferencia | null {
        return this._puntoGeograficoReferencia;
    }

    get estado(): EstadoChacra {
        return this._estado;
    }

    get creadoEn(): Date {
        return this._creadoEn;
    }

    get creadoPor(): string {
        return this._creadoPor;
    }

    get actualizadoEn(): Date {
        return this._actualizadoEn;
    }

    get actualizadoPor(): string {
        return this._actualizadoPor;
    }

    get version(): number {
        return this._version;
    }
}
