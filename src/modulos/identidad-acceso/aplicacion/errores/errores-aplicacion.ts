export abstract class ErrorAplicacionIdentidadAcceso extends Error {
    abstract readonly codigo: string;

    constructor(mensaje: string) {
        super(mensaje);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class AccesoDenegado extends ErrorAplicacionIdentidadAcceso {
    readonly codigo = 'ACC_ACCESO_DENEGADO';
    constructor(mensaje = 'No tiene permisos para realizar esta operación.') {
        super(mensaje);
    }
}

export class EmpresaNoHabilitada extends ErrorAplicacionIdentidadAcceso {
    readonly codigo = 'EMP_NO_HABILITADA';
    constructor(mensaje = 'La empresa no se encuentra habilitada u operativa.') {
        super(mensaje);
    }
}

export class ValidacionComercialNoDisponible extends ErrorAplicacionIdentidadAcceso {
    readonly codigo = 'ACC_VALIDACION_COMERCIAL_NO_DISPONIBLE';
    constructor(mensaje = 'No se pudo verificar el cupo comercial de la Empresa.') {
        super(mensaje);
    }
}

export class EmpleadoNoDisponible extends ErrorAplicacionIdentidadAcceso {
    readonly codigo = 'ACC_EMPLEADO_NO_DISPONIBLE';
    constructor(mensaje = 'El Empleado especificado no está activo o no pertenece a la Empresa.') {
        super(mensaje);
    }
}

export class CuentaNoEncontrada extends ErrorAplicacionIdentidadAcceso {
    readonly codigo = 'ACC_CUENTA_NO_ENCONTRADA';
    constructor(mensaje = 'La Cuenta de Empresa solicitada no existe dentro del alcance autorizado.') {
        super(mensaje);
    }
}

export class ConflictoVersionOptimista extends ErrorAplicacionIdentidadAcceso {
    readonly codigo = 'ACC_VERSION_CONFLICTO';
    constructor(mensaje = 'La versión provista en If-Match no coincide con la versión vigente del recurso.') {
        super(mensaje);
    }
}

export class ContextoSoporteRequerido extends ErrorAplicacionIdentidadAcceso {
    readonly codigo = 'ACC_CONTEXTO_SOPORTE_REQUERIDO';
    constructor(mensaje = 'La operación de plataforma exige un contexto de soporte válido y vigente.') {
        super(mensaje);
    }
}
