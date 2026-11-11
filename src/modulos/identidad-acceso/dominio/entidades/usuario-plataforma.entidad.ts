import { RolCodigo } from '../enumeraciones/rol-codigo.enum';
import { CorreoAcceso } from '../objetos-valor/correo-acceso.vo';

export interface PropiedadesCrearUsuarioPlataforma {
    id: string;
    correo: CorreoAcceso;
    credencialHash: string;
    creadoEn: Date;
}

export interface PropiedadesReconstituirUsuarioPlataforma {
    id: string;
    correo: CorreoAcceso;
    credencialHash: string;
    rol: RolCodigo.SUPER_ADMINISTRADOR;
    activo: boolean;
    creadoEn: Date;
}

export class UsuarioPlataforma {
    private readonly _id: string;
    private readonly _correo: CorreoAcceso;
    private _credencialHash: string;
    private readonly _rol: RolCodigo.SUPER_ADMINISTRADOR;
    private _activo: boolean;
    private readonly _creadoEn: Date;

    private constructor(props: PropiedadesReconstituirUsuarioPlataforma) {
        this._id = props.id;
        this._correo = props.correo;
        this._credencialHash = props.credencialHash;
        this._rol = props.rol;
        this._activo = props.activo;
        this._creadoEn = props.creadoEn;
    }

    static crear(props: PropiedadesCrearUsuarioPlataforma): UsuarioPlataforma {
        return new UsuarioPlataforma({
            id: props.id,
            correo: props.correo,
            credencialHash: props.credencialHash,
            rol: RolCodigo.SUPER_ADMINISTRADOR,
            activo: true,
            creadoEn: props.creadoEn,
        });
    }

    static reconstituir(props: PropiedadesReconstituirUsuarioPlataforma): UsuarioPlataforma {
        return new UsuarioPlataforma(props);
    }

    get id(): string {
        return this._id;
    }

    get correo(): CorreoAcceso {
        return this._correo;
    }

    get credencialHash(): string {
        return this._credencialHash;
    }

    get rol(): RolCodigo.SUPER_ADMINISTRADOR {
        return this._rol;
    }

    get activo(): boolean {
        return this._activo;
    }

    get creadoEn(): Date {
        return this._creadoEn;
    }

    estaActivo(): boolean {
        return this._activo;
    }

    desactivar(): void {
        this._activo = false;
    }
}
