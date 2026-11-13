import { CategoriaError, ErrorDominioBase } from '../../../../comun/dominio';

export abstract class ErrorDominioChacra extends ErrorDominioBase {}

export class ErrorNombreChacraInvalido extends ErrorDominioChacra {
    readonly codigo = 'TER_NOMBRE_CHACRA_INVALIDO';
    constructor(mensaje = 'El nombre de la chacra es obligatorio, no puede ser vacío y debe tener como máximo 150 caracteres.') {
        super(mensaje, CategoriaError.VALIDACION);
    }
}

export class ErrorNombreCortoInvalido extends ErrorDominioChacra {
    readonly codigo = 'TER_NOMBRE_CORTO_INVALIDO';
    constructor(
        mensaje = 'El nombre corto de la chacra es obligatorio, no puede ser vacío y debe tener como máximo 50 caracteres.',
    ) {
        super(mensaje, CategoriaError.VALIDACION);
    }
}

export class ErrorNombreCortoDuplicado extends ErrorDominioChacra {
    readonly codigo = 'TER_NOMBRE_CORTO_DUPLICADO';
    constructor(nombreCorto: string) {
        super(`Ya existe una chacra con el nombre corto "${nombreCorto}" en la misma empresa.`, CategoriaError.CONFLICTO);
    }
}

export class ErrorDireccionChacraInvalida extends ErrorDominioChacra {
    readonly codigo = 'TER_DIRECCION_CHACRA_INVALIDA';
    constructor(mensaje = 'La dirección no puede ser vacía, de sólo espacios, ni superar los 500 caracteres.') {
        super(mensaje, CategoriaError.VALIDACION);
    }
}

export class ErrorPuntoGeograficoInvalido extends ErrorDominioChacra {
    readonly codigo = 'TER_PUNTO_GEOGRAFICO_INVALIDO';
    constructor(mensaje = 'El punto geográfico debe tener latitud válida [-90, 90] y longitud válida [-180, 180].') {
        super(mensaje, CategoriaError.VALIDACION);
    }
}

export class ErrorResponsableChacraInvalido extends ErrorDominioChacra {
    readonly codigo = 'TER_RESPONSABLE_CHACRA_INVALIDO';
    constructor(mensaje = 'El responsable no puede exceder los 150 caracteres.') {
        super(mensaje, CategoriaError.VALIDACION);
    }
}

export class ErrorEstadoChacraInvalido extends ErrorDominioChacra {
    readonly codigo = 'TER_ESTADO_CHACRA_INVALIDO';
    constructor(mensaje = 'El estado de la chacra debe ser ACTIVA o INACTIVA.') {
        super(mensaje, CategoriaError.VALIDACION);
    }
}

export class ErrorTransicionChacraInvalida extends ErrorDominioChacra {
    readonly codigo = 'TER_TRANSICION_CHACRA_INVALIDA';
    constructor(mensaje = 'La transición de estado solicitada no es válida para la chacra.') {
        super(mensaje, CategoriaError.CONFLICTO);
    }
}

export class ErrorEliminacionNoPermitida extends ErrorDominioChacra {
    readonly codigo = 'TER_ELIMINACION_NO_PERMITIDA';
    constructor(mensaje = 'No se permite la eliminación física de una chacra; debe inactivarse.') {
        super(mensaje, CategoriaError.CONFLICTO);
    }
}

export class ErrorEstadoChacraLotesIncompatible extends ErrorDominioChacra {
    readonly codigo = 'TER_ESTADO_CHACRA_LOTES_INCOMPATIBLE';
    constructor(mensaje = 'No se puede inactivar la chacra porque contiene lotes activos.') {
        super(mensaje, CategoriaError.CONFLICTO);
    }
}

export class ErrorVersionConflicto extends ErrorDominioChacra {
    readonly codigo = 'TER_VERSION_CONFLICTO';
    constructor(mensaje = 'La versión de la chacra no coincide con la versión actual (conflicto de concurrencia optimista).') {
        super(mensaje, CategoriaError.PRECONDICION_FALLIDA);
    }
}

export class ErrorChacraNoEncontrada extends ErrorDominioChacra {
    readonly codigo = 'TER_CHACRA_NO_ENCONTRADA';
    constructor(chacraId: string) {
        super(`No se encontró la chacra solicitada con ID "${chacraId}".`, CategoriaError.NO_ENCONTRADO);
    }
}

export class ErrorAccesoDenegado extends ErrorDominioChacra {
    readonly codigo = 'TER_ACCESO_DENEGADO';
    constructor(mensaje = 'No posee permisos para operar sobre este recurso o se encuentra fuera de su alcance territorial.') {
        super(mensaje, CategoriaError.ACCESO_DENEGADO);
    }
}

export class ErrorConsultaInvalida extends ErrorDominioChacra {
    readonly codigo = 'TER_CONSULTA_INVALIDA';
    constructor(mensaje = 'Los parámetros de consulta especificados no son válidos.') {
        super(mensaje, CategoriaError.VALIDACION);
    }
}
