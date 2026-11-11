import { EstadoEmpresa } from '../enumeraciones';
import {
    NombreEmpresa,
    AliasEmpresa,
    Cuit,
    PuntoGeografico,
    ResponsableNombre,
    UbicacionTexto,
    DescripcionActividad,
    PaisReferencia,
    ZonaHoraria,
    MonedaPrincipal,
} from '../objetos-valor';
import { ConfiguracionGeneralEmpresa } from '../entidades/configuracion-general-empresa';
import { TransicionEstadoInvalida, AliasInmutable, ModificacionNoPermitida } from '../errores';

export interface ParametrosCrearEmpresa {
    id: string;
    nombre: NombreEmpresa;
    alias: AliasEmpresa;
    cuit?: Cuit;
    responsableNombre?: ResponsableNombre;
    ubicacionTexto?: UbicacionTexto;
    ubicacionGeografica?: PuntoGeografico | null;
    descripcionActividad?: DescripcionActividad;
    actor: string;
    fecha?: Date;
    configuracionGeneralId?: string;
}

export interface ParametrosReconstituirEmpresa {
    id: string;
    nombre: NombreEmpresa;
    alias: AliasEmpresa;
    cuit: Cuit;
    responsableNombre: ResponsableNombre;
    ubicacionTexto: UbicacionTexto;
    ubicacionGeografica: PuntoGeografico | null;
    descripcionActividad: DescripcionActividad;
    estado: EstadoEmpresa;
    configuracionGeneral: ConfiguracionGeneralEmpresa;
    creadoEn: Date;
    creadoPor: string;
    actualizadoEn: Date;
    actualizadoPor: string;
    version: number;
}

export interface ParametrosModificarEmpresa {
    nombre?: NombreEmpresa;
    nuevoAlias?: AliasEmpresa;
    cuit?: Cuit;
    responsableNombre?: ResponsableNombre;
    ubicacionTexto?: UbicacionTexto;
    ubicacionGeografica?: PuntoGeografico | null;
    descripcionActividad?: DescripcionActividad;
    esSuperAdmin: boolean;
    actor: string;
    fecha?: Date;
}

export interface ParametrosModificarConfiguracionGeneral {
    paisReferencia: PaisReferencia;
    zonaHoraria: ZonaHoraria;
    monedaPrincipal: MonedaPrincipal;
    esSuperAdmin: boolean;
    actor: string;
    fecha?: Date;
}

export class Empresa {
    private readonly _id: string;
    private _nombre: NombreEmpresa;
    private readonly _alias: AliasEmpresa;
    private _cuit: Cuit;
    private _responsableNombre: ResponsableNombre;
    private _ubicacionTexto: UbicacionTexto;
    private _ubicacionGeografica: PuntoGeografico | null;
    private _descripcionActividad: DescripcionActividad;
    private _estado: EstadoEmpresa;
    private readonly _configuracionGeneral: ConfiguracionGeneralEmpresa;
    private readonly _creadoEn: Date;
    private readonly _creadoPor: string;
    private _actualizadoEn: Date;
    private _actualizadoPor: string;
    private _version: number;

    private constructor(params: ParametrosReconstituirEmpresa) {
        this._id = params.id;
        this._nombre = params.nombre;
        this._alias = params.alias;
        this._cuit = params.cuit;
        this._responsableNombre = params.responsableNombre;
        this._ubicacionTexto = params.ubicacionTexto;
        this._ubicacionGeografica = params.ubicacionGeografica;
        this._descripcionActividad = params.descripcionActividad;
        this._estado = params.estado;
        this._configuracionGeneral = params.configuracionGeneral;
        this._creadoEn = params.creadoEn;
        this._creadoPor = params.creadoPor;
        this._actualizadoEn = params.actualizadoEn;
        this._actualizadoPor = params.actualizadoPor;
        this._version = params.version;
    }

    static crear(params: ParametrosCrearEmpresa): Empresa {
        const fecha = params.fecha ?? new Date();
        const configId = params.configuracionGeneralId ?? `${params.id}-cfg`;
        const configuracionGeneral = ConfiguracionGeneralEmpresa.crearDefecto(configId, params.id, params.actor, fecha);

        return new Empresa({
            id: params.id,
            nombre: params.nombre,
            alias: params.alias,
            cuit: params.cuit ?? new Cuit(null),
            responsableNombre: params.responsableNombre ?? new ResponsableNombre(null),
            ubicacionTexto: params.ubicacionTexto ?? new UbicacionTexto(null),
            ubicacionGeografica: params.ubicacionGeografica ?? null,
            descripcionActividad: params.descripcionActividad ?? new DescripcionActividad(null),
            estado: EstadoEmpresa.ACTIVA,
            configuracionGeneral,
            creadoEn: fecha,
            creadoPor: params.actor,
            actualizadoEn: fecha,
            actualizadoPor: params.actor,
            version: 1,
        });
    }

    static reconstituir(params: ParametrosReconstituirEmpresa): Empresa {
        return new Empresa(params);
    }

    suspender(actor: string, fecha: Date = new Date()): void {
        if (this._estado !== EstadoEmpresa.ACTIVA) {
            throw new TransicionEstadoInvalida(this._estado, EstadoEmpresa.SUSPENDIDA);
        }
        this._estado = EstadoEmpresa.SUSPENDIDA;
        this._actualizadoPor = actor;
        this._actualizadoEn = fecha;
        this._version += 1;
    }

    reactivar(actor: string, fecha: Date = new Date()): void {
        if (this._estado !== EstadoEmpresa.SUSPENDIDA) {
            throw new TransicionEstadoInvalida(this._estado, EstadoEmpresa.ACTIVA);
        }
        this._estado = EstadoEmpresa.ACTIVA;
        this._actualizadoPor = actor;
        this._actualizadoEn = fecha;
        this._version += 1;
    }

    cerrar(actor: string, fecha: Date = new Date()): void {
        if (this._estado === EstadoEmpresa.CERRADA) {
            throw new TransicionEstadoInvalida(this._estado, EstadoEmpresa.CERRADA);
        }
        this._estado = EstadoEmpresa.CERRADA;
        this._actualizadoPor = actor;
        this._actualizadoEn = fecha;
        this._version += 1;
    }

    modificarDatos(params: ParametrosModificarEmpresa): void {
        if (params.nuevoAlias && !params.nuevoAlias.equals(this._alias)) {
            throw new AliasInmutable();
        }
        this.validarModificacionSegunEstado(params.esSuperAdmin);

        const fecha = params.fecha ?? new Date();

        if (params.nombre) {
            this._nombre = params.nombre;
        }
        if (params.cuit !== undefined) {
            this._cuit = params.cuit;
        }
        if (params.responsableNombre !== undefined) {
            this._responsableNombre = params.responsableNombre;
        }
        if (params.ubicacionTexto !== undefined) {
            this._ubicacionTexto = params.ubicacionTexto;
        }
        if (params.ubicacionGeografica !== undefined) {
            this._ubicacionGeografica = params.ubicacionGeografica;
        }
        if (params.descripcionActividad !== undefined) {
            this._descripcionActividad = params.descripcionActividad;
        }

        this._actualizadoPor = params.actor;
        this._actualizadoEn = fecha;
        this._version += 1;
    }

    modificarConfiguracionGeneral(params: ParametrosModificarConfiguracionGeneral): void {
        this.validarModificacionSegunEstado(params.esSuperAdmin);

        const fecha = params.fecha ?? new Date();
        this._configuracionGeneral.actualizar(
            params.paisReferencia,
            params.zonaHoraria,
            params.monedaPrincipal,
            params.actor,
            fecha,
        );

        this._actualizadoPor = params.actor;
        this._actualizadoEn = fecha;
        this._version += 1;
    }

    private validarModificacionSegunEstado(esSuperAdmin: boolean): void {
        if (this._estado === EstadoEmpresa.CERRADA) {
            throw new ModificacionNoPermitida('No se puede modificar una empresa cerrada.');
        }
        if (this._estado === EstadoEmpresa.SUSPENDIDA && !esSuperAdmin) {
            throw new ModificacionNoPermitida('Un administrador no puede modificar una empresa suspendida.');
        }
    }

    estaHabilitadaParaOperar(): boolean {
        return this._estado === EstadoEmpresa.ACTIVA;
    }

    get id(): string {
        return this._id;
    }

    get nombre(): NombreEmpresa {
        return this._nombre;
    }

    get alias(): AliasEmpresa {
        return this._alias;
    }

    get cuit(): Cuit {
        return this._cuit;
    }

    get responsableNombre(): ResponsableNombre {
        return this._responsableNombre;
    }

    get ubicacionTexto(): UbicacionTexto {
        return this._ubicacionTexto;
    }

    get ubicacionGeografica(): PuntoGeografico | null {
        return this._ubicacionGeografica;
    }

    get descripcionActividad(): DescripcionActividad {
        return this._descripcionActividad;
    }

    get estado(): EstadoEmpresa {
        return this._estado;
    }

    get configuracionGeneral(): ConfiguracionGeneralEmpresa {
        return this._configuracionGeneral;
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
