export abstract class ErrorAplicacionEmpresa extends Error {
    abstract readonly codigo: string;

    constructor(mensaje: string) {
        super(mensaje);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class EmpresaNoEncontrada extends ErrorAplicacionEmpresa {
    readonly codigo = 'EMP_EMPRESA_NO_ENCONTRADA';
    constructor(id: string) {
        super(`No se encontró la empresa con identificador o alias "${id}".`);
    }
}

export class PermisoDenegado extends ErrorAplicacionEmpresa {
    readonly codigo = 'EMP_ACCESO_DENEGADO';
    constructor(mensaje = 'No cuenta con los permisos necesarios para realizar esta operación.') {
        super(mensaje);
    }
}

export class ConflictoConcurrencia extends ErrorAplicacionEmpresa {
    readonly codigo = 'EMP_CONFLICTO_CONCURRENCIA';
    constructor(mensaje = 'La versión actual del recurso no coincide con la condición previa especificada.') {
        super(mensaje);
    }
}
