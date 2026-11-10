export abstract class ErrorDominioEmpresa extends Error {
  abstract readonly codigo: string;

  constructor(mensaje: string) {
    super(mensaje);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NombreEmpresaObligatorio extends ErrorDominioEmpresa {
  readonly codigo = 'EMP_NOMBRE_OBLIGATORIO';
  constructor() {
    super('El nombre de la empresa es obligatorio.');
  }
}

export class NombreEmpresaInvalido extends ErrorDominioEmpresa {
  readonly codigo = 'EMP_NOMBRE_INVALIDO';
  constructor(mensaje = 'El nombre de la empresa excede los 120 caracteres.') {
    super(mensaje);
  }
}

export class UbicacionGeograficaInvalida extends ErrorDominioEmpresa {
  readonly codigo = 'EMP_UBICACION_GEOGRAFICA_INVALIDA';
  constructor(
    mensaje = 'La ubicación geográfica debe tener latitud entre -90 y 90 y longitud entre -180 y 180.',
  ) {
    super(mensaje);
  }
}

export class CuitInvalido extends ErrorDominioEmpresa {
  readonly codigo = 'EMP_CUIT_INVALIDO';
  constructor(
    mensaje = 'El CUIT debe estar formado por exactamente 11 dígitos numéricos.',
  ) {
    super(mensaje);
  }
}

export class TextoDescriptivoInvalido extends ErrorDominioEmpresa {
  readonly codigo = 'EMP_TEXTO_INVALIDO';
  constructor(
    mensaje = 'El texto descriptivo excede la longitud máxima permitida.',
  ) {
    super(mensaje);
  }
}

export class AliasEmpresaInvalido extends ErrorDominioEmpresa {
  readonly codigo = 'EMP_ALIAS_INVALIDO';
  constructor(
    mensaje = 'El alias debe contener entre 3 y 63 caracteres en minúscula, dígitos o guiones, y comenzar y terminar con letra o dígito.',
  ) {
    super(mensaje);
  }
}

export class AliasNoDisponible extends ErrorDominioEmpresa {
  readonly codigo = 'EMP_ALIAS_NO_DISPONIBLE';
  constructor(alias: string) {
    super(`El alias "${alias}" no está disponible.`);
  }
}

export class AliasInmutable extends ErrorDominioEmpresa {
  readonly codigo = 'EMP_ALIAS_INMUTABLE';
  constructor() {
    super('El alias de la empresa no puede modificarse.');
  }
}

export class ConfiguracionGeneralInvalida extends ErrorDominioEmpresa {
  readonly codigo = 'EMP_CONFIGURACION_GENERAL_INVALIDA';
  constructor(mensaje = 'La configuración general especificada no es válida.') {
    super(mensaje);
  }
}

export class TransicionEstadoInvalida extends ErrorDominioEmpresa {
  readonly codigo = 'EMP_TRANSICION_ESTADO_INVALIDA';
  constructor(estadoActual: string, estadoDestino: string) {
    super(
      `No se permite la transición de estado desde "${estadoActual}" hacia "${estadoDestino}".`,
    );
  }
}

export class EmpresaNoHabilitada extends ErrorDominioEmpresa {
  readonly codigo = 'EMP_NO_HABILITADA';
  constructor(mensaje = 'La empresa no se encuentra activa para operar.') {
    super(mensaje);
  }
}

export class ModificacionNoPermitida extends ErrorDominioEmpresa {
  readonly codigo = 'EMP_MODIFICACION_NO_PERMITIDA';
  constructor(
    mensaje = 'No se permite modificar la empresa en su estado actual.',
  ) {
    super(mensaje);
  }
}

export class AsignacionComercialRequerida extends ErrorDominioEmpresa {
  readonly codigo = 'EMP_ASIGNACION_COMERCIAL_REQUERIDA';
  constructor(
    mensaje = 'La empresa no cuenta con una asignación comercial confirmada.',
  ) {
    super(mensaje);
  }
}
