import { EstadoCuenta } from '../enumeraciones/estado-cuenta.enum';
import { RolCodigo } from '../enumeraciones/rol-codigo.enum';
import { CanalAcceso } from '../enumeraciones/canal-acceso.enum';
import { CorreoAcceso } from '../objetos-valor/correo-acceso.vo';
import { NombreMostrado } from '../objetos-valor/nombre-mostrado.vo';
import {
    RolNoAdmitido,
    TransicionNoPermitida,
    VinculoEmpleadoInvalido,
    VinculacionEmpleadoInvalida,
} from '../errores/errores-identidad-acceso';

export interface PropiedadesCrearCuentaEmpresa {
    id: string;
    empresaId: string;
    correoAcceso: CorreoAcceso;
    credencialHash: string;
    accesoWeb: boolean;
    accesoMovil: boolean;
    roles: RolCodigo[];
    empleadoId?: string;
    nombreMostrado?: NombreMostrado;
}

export interface PropiedadesReconstituirCuentaEmpresa {
    id: string;
    empresaId: string;
    correoAcceso: CorreoAcceso;
    credencialHash: string;
    accesoWeb: boolean;
    accesoMovil: boolean;
    roles: Set<RolCodigo>;
    estado: EstadoCuenta;
    version: number;
    empleadoId?: string;
    nombreMostrado?: NombreMostrado;
}

export class CuentaEmpresa {
    private readonly _id: string;
    private readonly _empresaId: string;
    private _empleadoId?: string;
    private _nombreMostrado?: NombreMostrado;
    private readonly _correoAcceso: CorreoAcceso;
    private _credencialHash: string;
    private _accesoWeb: boolean;
    private _accesoMovil: boolean;
    private _roles: Set<RolCodigo>;
    private _estado: EstadoCuenta;
    private _version: number;

    private constructor(props: PropiedadesReconstituirCuentaEmpresa) {
        this._id = props.id;
        this._empresaId = props.empresaId;
        this._empleadoId = props.empleadoId;
        this._nombreMostrado = props.nombreMostrado;
        this._correoAcceso = props.correoAcceso;
        this._credencialHash = props.credencialHash;
        this._accesoWeb = props.accesoWeb;
        this._accesoMovil = props.accesoMovil;
        this._roles = props.roles;
        this._estado = props.estado;
        this._version = props.version;
    }

    static crear(props: PropiedadesCrearCuentaEmpresa): CuentaEmpresa {
        if (!props.roles || props.roles.length === 0) {
            throw new RolNoAdmitido('Debe asignarse al menos un rol.');
        }

        const rolesSet = new Set<RolCodigo>();
        for (const r of props.roles) {
            if (r === RolCodigo.SUPER_ADMINISTRADOR) {
                throw new RolNoAdmitido('El rol SUPER_ADMINISTRADOR no puede asignarse a una Cuenta de Empresa.');
            }
            rolesSet.add(r);
        }

        const requiereEmpleado = rolesSet.has(RolCodigo.CAPATAZ) || rolesSet.has(RolCodigo.EMPLEADO);
        if (requiereEmpleado && !props.empleadoId) {
            throw new VinculoEmpleadoInvalido(
                'Los roles CAPATAZ o EMPLEADO exigen vincular un Empleado ACTIVO de la misma Empresa.',
            );
        }

        return new CuentaEmpresa({
            id: props.id,
            empresaId: props.empresaId,
            empleadoId: props.empleadoId,
            nombreMostrado: props.nombreMostrado,
            correoAcceso: props.correoAcceso,
            credencialHash: props.credencialHash,
            accesoWeb: props.accesoWeb,
            accesoMovil: props.accesoMovil,
            roles: rolesSet,
            estado: EstadoCuenta.ACTIVA,
            version: 1,
        });
    }

    static reconstituir(props: PropiedadesReconstituirCuentaEmpresa): CuentaEmpresa {
        return new CuentaEmpresa(props);
    }

    get id(): string {
        return this._id;
    }

    get empresaId(): string {
        return this._empresaId;
    }

    get empleadoId(): string | undefined {
        return this._empleadoId;
    }

    get nombreMostrado(): NombreMostrado | undefined {
        return this._nombreMostrado;
    }

    get correoAcceso(): CorreoAcceso {
        return this._correoAcceso;
    }

    get credencialHash(): string {
        return this._credencialHash;
    }

    get accesoWeb(): boolean {
        return this._accesoWeb;
    }

    get accesoMovil(): boolean {
        return this._accesoMovil;
    }

    get roles(): RolCodigo[] {
        return Array.from(this._roles);
    }

    get estado(): EstadoCuenta {
        return this._estado;
    }

    get version(): number {
        return this._version;
    }

    estaActiva(): boolean {
        return this._estado === EstadoCuenta.ACTIVA;
    }

    tieneCanal(canal: CanalAcceso): boolean {
        if (canal === CanalAcceso.WEB) {
            return this._accesoWeb;
        }
        if (canal === CanalAcceso.MOVIL) {
            return this._accesoMovil;
        }
        return false;
    }

    tieneRol(rol: RolCodigo): boolean {
        return this._roles.has(rol);
    }

    suspender(): void {
        if (this._estado === EstadoCuenta.SUSPENDIDA) {
            throw new TransicionNoPermitida(EstadoCuenta.SUSPENDIDA, EstadoCuenta.SUSPENDIDA);
        }
        this._estado = EstadoCuenta.SUSPENDIDA;
        this._version += 1;
    }

    reactivar(): void {
        if (this._estado === EstadoCuenta.ACTIVA) {
            throw new TransicionNoPermitida(EstadoCuenta.ACTIVA, EstadoCuenta.ACTIVA);
        }
        this._estado = EstadoCuenta.ACTIVA;
        this._version += 1;
    }

    actualizarCredencial(nuevoHash: string): void {
        this._credencialHash = nuevoHash;
        this._version += 1;
    }

    actualizarCanalesYRoles(accesoWeb: boolean, accesoMovil: boolean, roles: RolCodigo[]): void {
        if (!roles || roles.length === 0) {
            throw new RolNoAdmitido('Debe asignarse al menos un rol.');
        }

        const rolesSet = new Set<RolCodigo>();
        for (const r of roles) {
            if (r === RolCodigo.SUPER_ADMINISTRADOR) {
                throw new RolNoAdmitido('El rol SUPER_ADMINISTRADOR no puede asignarse a una Cuenta de Empresa.');
            }
            rolesSet.add(r);
        }

        const requiereEmpleado = rolesSet.has(RolCodigo.CAPATAZ) || rolesSet.has(RolCodigo.EMPLEADO);
        if (requiereEmpleado && !this._empleadoId) {
            throw new VinculoEmpleadoInvalido(
                'Los roles CAPATAZ o EMPLEADO exigen vincular un Empleado ACTIVO de la misma Empresa.',
            );
        }

        this._accesoWeb = accesoWeb;
        this._accesoMovil = accesoMovil;
        this._roles = rolesSet;
        this._version += 1;
    }

    vincularEmpleado(empleadoId: string, empresaIdEmpleado: string): void {
        if (this._empresaId !== empresaIdEmpleado) {
            throw new VinculacionEmpleadoInvalida('El Empleado pertenece a una Empresa diferente.');
        }

        if (this._empleadoId === empleadoId) {
            return;
        }

        if (this._empleadoId && this._empleadoId !== empleadoId) {
            throw new VinculacionEmpleadoInvalida('La cuenta ya está vinculada a otro Empleado.');
        }

        this._empleadoId = empleadoId;
        this._version += 1;
    }
}
