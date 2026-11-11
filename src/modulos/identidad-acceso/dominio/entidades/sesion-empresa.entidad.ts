import { CanalAcceso } from '../enumeraciones/canal-acceso.enum';
import { EstadoSesion } from '../enumeraciones/estado-sesion.enum';

export interface PropiedadesCrearSesionEmpresa {
    id: string;
    cuentaEmpresaId: string;
    empresaId: string;
    canal: CanalAcceso;
    creadaEn: Date;
    venceEn: Date;
    hashTokenRenovacion: string;
    familiaId: string;
    dispositivoId?: string;
}

export interface PropiedadesReconstituirSesionEmpresa {
    id: string;
    cuentaEmpresaId: string;
    empresaId: string;
    canal: CanalAcceso;
    creadaEn: Date;
    venceEn: Date;
    revocadaEn?: Date;
    estado: EstadoSesion;
    hashTokenRenovacion: string;
    familiaId: string;
    contadorRotacion: number;
    dispositivoId?: string;
}

export class SesionEmpresa {
    private readonly _id: string;
    private readonly _cuentaEmpresaId: string;
    private readonly _empresaId: string;
    private readonly _canal: CanalAcceso;
    private readonly _dispositivoId?: string;
    private readonly _creadaEn: Date;
    private _venceEn: Date;
    private _revocadaEn?: Date;
    private _estado: EstadoSesion;
    private _hashTokenRenovacion: string;
    private readonly _familiaId: string;
    private _contadorRotacion: number;

    private constructor(props: PropiedadesReconstituirSesionEmpresa) {
        this._id = props.id;
        this._cuentaEmpresaId = props.cuentaEmpresaId;
        this._empresaId = props.empresaId;
        this._canal = props.canal;
        this._dispositivoId = props.dispositivoId;
        this._creadaEn = props.creadaEn;
        this._venceEn = props.venceEn;
        this._revocadaEn = props.revocadaEn;
        this._estado = props.estado;
        this._hashTokenRenovacion = props.hashTokenRenovacion;
        this._familiaId = props.familiaId;
        this._contadorRotacion = props.contadorRotacion;
    }

    static crear(props: PropiedadesCrearSesionEmpresa): SesionEmpresa {
        return new SesionEmpresa({
            id: props.id,
            cuentaEmpresaId: props.cuentaEmpresaId,
            empresaId: props.empresaId,
            canal: props.canal,
            dispositivoId: props.dispositivoId,
            creadaEn: props.creadaEn,
            venceEn: props.venceEn,
            estado: EstadoSesion.ACTIVA,
            hashTokenRenovacion: props.hashTokenRenovacion,
            familiaId: props.familiaId,
            contadorRotacion: 0,
        });
    }

    static reconstituir(props: PropiedadesReconstituirSesionEmpresa): SesionEmpresa {
        return new SesionEmpresa(props);
    }

    get id(): string {
        return this._id;
    }

    get cuentaEmpresaId(): string {
        return this._cuentaEmpresaId;
    }

    get empresaId(): string {
        return this._empresaId;
    }

    get canal(): CanalAcceso {
        return this._canal;
    }

    get dispositivoId(): string | undefined {
        return this._dispositivoId;
    }

    get creadaEn(): Date {
        return this._creadaEn;
    }

    get venceEn(): Date {
        return this._venceEn;
    }

    get revocadaEn(): Date | undefined {
        return this._revocadaEn;
    }

    get estado(): EstadoSesion {
        return this._estado;
    }

    get hashTokenRenovacion(): string {
        return this._hashTokenRenovacion;
    }

    get familiaId(): string {
        return this._familiaId;
    }

    get contadorRotacion(): number {
        return this._contadorRotacion;
    }

    estaVigente(ahora: Date): boolean {
        return this._estado === EstadoSesion.ACTIVA && !this._revocadaEn && this._venceEn > ahora;
    }

    revocar(fechaRevocacion: Date): void {
        this._revocadaEn = fechaRevocacion;
        this._estado = EstadoSesion.REVOCADA;
    }

    rotarTokenRenovacion(nuevoHashToken: string, nuevoVenceEn: Date): void {
        this._hashTokenRenovacion = nuevoHashToken;
        this._venceEn = nuevoVenceEn;
        this._contadorRotacion += 1;
    }
}
