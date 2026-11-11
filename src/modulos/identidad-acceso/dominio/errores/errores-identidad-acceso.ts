export abstract class ErrorDominioIdentidadAcceso extends Error {
    abstract readonly codigo: string;

    constructor(mensaje: string) {
        super(mensaje);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class CorreoInvalido extends ErrorDominioIdentidadAcceso {
    readonly codigo = 'ACC_CORREO_INVALIDO';
    constructor(mensaje = 'El correo de acceso no es válido o excede los 254 caracteres.') {
        super(mensaje);
    }
}

export class ContraseniaInvalida extends ErrorDominioIdentidadAcceso {
    readonly codigo = 'ACC_CONTRASENIA_INVALIDA';
    constructor(mensaje = 'La contraseña debe contener entre 15 y 128 caracteres.') {
        super(mensaje);
    }
}

export class MotivoSoporteInvalido extends ErrorDominioIdentidadAcceso {
    readonly codigo = 'ACC_MOTIVO_SOPORTE_INVALIDO';
    constructor(mensaje = 'El motivo de soporte no puede estar vacío ni superar los 1000 caracteres.') {
        super(mensaje);
    }
}

export class VinculoEmpleadoInvalido extends ErrorDominioIdentidadAcceso {
    readonly codigo = 'ACC_VINCULO_EMPLEADO_INVALIDO';
    constructor(mensaje = 'El rol exige vincular un Empleado ACTIVO de la misma Empresa.') {
        super(mensaje);
    }
}

export class VinculacionEmpleadoInvalida extends ErrorDominioIdentidadAcceso {
    readonly codigo = 'ACC_VINCULACION_EMPLEADO_INVALIDA';
    constructor(mensaje = 'No se puede vincular la cuenta con el Empleado especificado.') {
        super(mensaje);
    }
}

export class CorreoDuplicado extends ErrorDominioIdentidadAcceso {
    readonly codigo = 'ACC_CORREO_DUPLICADO';
    constructor(correo: string) {
        super(`El correo de acceso "${correo}" ya existe en esta Empresa.`);
    }
}

export class TransicionNoPermitida extends ErrorDominioIdentidadAcceso {
    readonly codigo = 'ACC_TRANSICION_NO_PERMITIDA';
    constructor(origen: string, destino: string) {
        super(`No se permite la transición de estado desde "${origen}" hacia "${destino}".`);
    }
}

export class EliminacionNoPermitida extends ErrorDominioIdentidadAcceso {
    readonly codigo = 'ACC_ELIMINACION_NO_PERMITIDA';
    constructor() {
        super('Una Cuenta de Empresa no puede eliminarse físicamente.');
    }
}

export class RolNoAdmitido extends ErrorDominioIdentidadAcceso {
    readonly codigo = 'ACC_ROL_NO_ADMITIDO';
    constructor(mensaje = 'El rol solicitado no es admitido para esta operación.') {
        super(mensaje);
    }
}

export class CanalNoPermitido extends ErrorDominioIdentidadAcceso {
    readonly codigo = 'ACC_CANAL_NO_PERMITIDO';
    constructor(mensaje = 'La cuenta no tiene habilitado el canal de acceso solicitado.') {
        super(mensaje);
    }
}

export class CredencialesInvalidas extends ErrorDominioIdentidadAcceso {
    readonly codigo = 'ACC_CREDENCIALES_INVALIDAS';
    constructor() {
        super('Las credenciales de acceso son incorrectas.');
    }
}

export class CuentaSuspendida extends ErrorDominioIdentidadAcceso {
    readonly codigo = 'ACC_CUENTA_SUSPENDIDA';
    constructor() {
        super('La cuenta de acceso se encuentra suspendida.');
    }
}

export class EmpresaFueraDeAlcance extends ErrorDominioIdentidadAcceso {
    readonly codigo = 'ACC_EMPRESA_FUERA_DE_ALCANCE';
    constructor(mensaje = 'La operación solicitada no corresponde a la Empresa del contexto autorizado.') {
        super(mensaje);
    }
}

export class CuentaEmpleadoDuplicada extends ErrorDominioIdentidadAcceso {
    readonly codigo = 'ACC_CUENTA_EMPLEADO_DUPLICADA';
    constructor(empleadoId: string) {
        super(`El Empleado "${empleadoId}" ya tiene una Cuenta de Empresa asignada.`);
    }
}

export class LimiteAccesosAlcanzado extends ErrorDominioIdentidadAcceso {
    readonly codigo = 'ACC_LIMITE_ACCESOS_ALCANZADO';
    constructor() {
        super('Se ha alcanzado el límite de accesos activos contratados para la Empresa.');
    }
}

export class UltimoSuperAdministrador extends ErrorDominioIdentidadAcceso {
    readonly codigo = 'ACC_ULTIMO_SUPERADMINISTRADOR';
    constructor() {
        super('No se puede desactivar al único SuperAdministrador activo de la plataforma.');
    }
}

export class InicializacionNoPermitida extends ErrorDominioIdentidadAcceso {
    readonly codigo = 'ACC_INICIALIZACION_NO_PERMITIDA';
    constructor() {
        super('La plataforma ya ha sido inicializada y no admite un nuevo arranque inicial.');
    }
}

export class IntervencionSoporteExpirada extends ErrorDominioIdentidadAcceso {
    readonly codigo = 'ACC_INTERVENCION_SOPORTE_EXPIRADA';
    constructor() {
        super('La intervención de soporte ha expirado o no es válida.');
    }
}

export class TextoNombreMostradoInvalido extends ErrorDominioIdentidadAcceso {
    readonly codigo = 'ACC_NOMBRE_MOSTRADO_INVALIDO';
    constructor() {
        super('El nombre mostrado excede los 150 caracteres.');
    }
}
