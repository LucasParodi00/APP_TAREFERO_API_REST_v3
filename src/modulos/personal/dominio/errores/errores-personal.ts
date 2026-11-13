import { CategoriaError, ErrorDominioBase } from '../../../../comun/dominio';

export abstract class ErrorDominioPersonal extends ErrorDominioBase {}

export class ErrorTenantInvalido extends ErrorDominioPersonal {
    readonly codigo = 'PER_TENANT_INVALIDO';
    constructor(mensaje = 'El registro o la referencia no pertenece a la Empresa autorizada.') {
        super(mensaje, CategoriaError.VALIDACION);
    }
}

export class ErrorDocumentoDuplicado extends ErrorDominioPersonal {
    readonly codigo = 'PER_DOCUMENTO_DUPLICADO';
    constructor(tipo: string, numero: string) {
        super(`Ya existe un Empleado con documento ${tipo} ${numero} en esta Empresa.`, CategoriaError.CONFLICTO);
    }
}

export class ErrorEmpleadoInvalido extends ErrorDominioPersonal {
    readonly codigo = 'PER_EMPLEADO_INVALIDO';
    constructor(mensaje = 'Los datos obligatorios del Empleado no son válidos o están incompletos.') {
        super(mensaje, CategoriaError.VALIDACION);
    }
}

export class ErrorDatoPersonalInvalido extends ErrorDominioPersonal {
    readonly codigo = 'PER_DATO_PERSONAL_INVALIDO';
    constructor(mensaje = 'Los datos personales u opcionales del Empleado no cumplen con el formato o límites aprobados.') {
        super(mensaje, CategoriaError.VALIDACION);
    }
}

export class ErrorTransicionEmpleadoInvalida extends ErrorDominioPersonal {
    readonly codigo = 'PER_TRANSICION_EMPLEADO_INVALIDA';
    constructor(mensaje = 'La transición de estado o ciclo laboral del Empleado no es válida.') {
        super(mensaje, CategoriaError.CONFLICTO);
    }
}

export class ErrorRestriccionInvalida extends ErrorDominioPersonal {
    readonly codigo = 'PER_RESTRICCION_INVALIDA';
    constructor(mensaje = 'Los datos de la restricción operativa no son válidos o vulneran la privacidad.') {
        super(mensaje, CategoriaError.VALIDACION);
    }
}

export class ErrorIndisponibilidadInvalida extends ErrorDominioPersonal {
    readonly codigo = 'PER_INDISPONIBILIDAD_INVALIDA';
    constructor(mensaje = 'Los datos de la indisponibilidad no son válidos o se solapan indebidamente.') {
        super(mensaje, CategoriaError.VALIDACION);
    }
}

export class ErrorAnulacionNovedadInvalida extends ErrorDominioPersonal {
    readonly codigo = 'PER_ANULACION_NOVEDAD_INVALIDA';
    constructor(mensaje = 'La anulación de la novedad requiere motivo válido, actor y fecha/hora.') {
        super(mensaje, CategoriaError.VALIDACION);
    }
}

export class ErrorAccesoEmpleadoInvalido extends ErrorDominioPersonal {
    readonly codigo = 'PER_ACCESO_EMPLEADO_INVALIDO';
    constructor(mensaje = 'La ficha laboral no admite la operación de acceso o no se encuentra activa.') {
        super(mensaje, CategoriaError.VALIDACION);
    }
}

export class ErrorVersionConflicto extends ErrorDominioPersonal {
    readonly codigo = 'PER_VERSION_CONFLICTO';
    constructor(mensaje = 'La versión del recurso no coincide con la actual (conflicto de concurrencia optimista).') {
        super(mensaje, CategoriaError.PRECONDICION_FALLIDA);
    }
}

export class ErrorEmpleadoNoEncontrado extends ErrorDominioPersonal {
    readonly codigo = 'PER_EMPLEADO_NO_ENCONTRADO';
    constructor(empleadoId: string) {
        super(`No se encontró el Empleado con ID "${empleadoId}" en la Empresa autorizada.`, CategoriaError.NO_ENCONTRADO);
    }
}

export class ErrorNovedadNoEncontrada extends ErrorDominioPersonal {
    readonly codigo = 'PER_NOVEDAD_NO_ENCONTRADA';
    constructor(novedadId: string) {
        super(`No se encontró la novedad con ID "${novedadId}" en la Empresa autorizada.`, CategoriaError.NO_ENCONTRADO);
    }
}

export class ErrorLimiteEmpleadosAlcanzado extends ErrorDominioPersonal {
    readonly codigo = 'PER_LIMITE_EMPLEADOS_ALCANZADO';
    constructor(mensaje = 'Se alcanzó el cupo máximo de Empleados activos permitido por la suscripción.') {
        super(mensaje, CategoriaError.CONFLICTO);
    }
}

export class ErrorSuspensionAccesoFallida extends ErrorDominioPersonal {
    readonly codigo = 'PER_SUSPENSION_ACCESO_FALLIDA';
    constructor(mensaje = 'No se pudo suspender la cuenta y revocar las sesiones en el módulo de acceso.') {
        super(mensaje, CategoriaError.PRECONDICION_FALLIDA);
    }
}
