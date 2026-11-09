import { DestinoCampoPerfil } from '../enumeraciones/destino-campo-perfil';
import { TipoCampoPerfil } from '../enumeraciones/tipo-campo-perfil';
import { ErrorDominioContextoProductivo } from '../errores/error-dominio-contexto-productivo';

export interface ValidacionesCampoTexto {
  longitudMinima?: number;
  longitudMaxima?: number;
}

export interface ValidacionesCampoEntero {
  minimo?: number;
  maximo?: number;
}

export interface ValidacionesCampoDecimal {
  minimo?: string;
  maximo?: string;
}

export interface ValidacionesCampoFecha {
  minimo?: string;
  maximo?: string;
}

export interface ValidacionesCampoSeleccion {
  valoresPermitidos: string[];
}

export type ValidacionesCampo =
  | ValidacionesCampoTexto
  | ValidacionesCampoEntero
  | ValidacionesCampoDecimal
  | ValidacionesCampoFecha
  | ValidacionesCampoSeleccion
  | Record<string, unknown>;

export interface PropiedadesCampoPerfil {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  destino: DestinoCampoPerfil;
  tipo: TipoCampoPerfil;
  obligatorio: boolean;
  unidadId?: string | null;
  validaciones?: ValidacionesCampo | null;
}

export class CampoPerfil {
  private constructor(
    public readonly codigo: string,
    public readonly nombre: string,
    public readonly descripcion: string | null,
    public readonly destino: DestinoCampoPerfil,
    public readonly tipo: TipoCampoPerfil,
    public readonly obligatorio: boolean,
    public readonly unidadId: string | null,
    public readonly validaciones: ValidacionesCampo | null,
  ) {}

  public static crear(props: PropiedadesCampoPerfil): CampoPerfil {
    const codigoNormalizado = props.codigo?.trim().toUpperCase();
    if (
      !codigoNormalizado ||
      codigoNormalizado.length < 1 ||
      codigoNormalizado.length > 100
    ) {
      throw new ErrorDominioContextoProductivo(
        'CUL_CAMPO_PERFIL_INVALIDO',
        'El código de campo debe tener entre 1 y 100 caracteres.',
      );
    }

    const nombreNormalizado = props.nombre?.trim();
    if (
      !nombreNormalizado ||
      nombreNormalizado.length < 1 ||
      nombreNormalizado.length > 150
    ) {
      throw new ErrorDominioContextoProductivo(
        'CUL_CAMPO_PERFIL_INVALIDO',
        'El nombre de campo debe tener entre 1 y 150 caracteres.',
      );
    }

    const descripcionNormalizada = props.descripcion?.trim() || null;
    if (descripcionNormalizada && descripcionNormalizada.length > 1000) {
      throw new ErrorDominioContextoProductivo(
        'CUL_CAMPO_PERFIL_INVALIDO',
        'La descripción no puede superar 1000 caracteres.',
      );
    }

    if (!Object.values(DestinoCampoPerfil).includes(props.destino)) {
      throw new ErrorDominioContextoProductivo(
        'CUL_CAMPO_PERFIL_INVALIDO',
        `Destino de campo inválido: ${props.destino}`,
      );
    }

    if (!Object.values(TipoCampoPerfil).includes(props.tipo)) {
      throw new ErrorDominioContextoProductivo(
        'CUL_CAMPO_PERFIL_INVALIDO',
        `Tipo de campo inválido: ${props.tipo}`,
      );
    }

    let unidadId: string | null = null;
    if (props.tipo === TipoCampoPerfil.DECIMAL) {
      if (!props.unidadId || props.unidadId.trim().length === 0) {
        throw new ErrorDominioContextoProductivo(
          'CUL_CAMPO_PERFIL_INVALIDO',
          'El tipo DECIMAL requiere una unidadId especificada.',
        );
      }
      unidadId = props.unidadId.trim();
    }

    CampoPerfil.validarEstructuraValidaciones(props.tipo, props.validaciones);

    return new CampoPerfil(
      codigoNormalizado,
      nombreNormalizado,
      descripcionNormalizada,
      props.destino,
      props.tipo,
      Boolean(props.obligatorio),
      unidadId,
      props.validaciones ?? null,
    );
  }

  private static validarEstructuraValidaciones(
    tipo: TipoCampoPerfil,
    validaciones?: ValidacionesCampo | null,
  ): void {
    if (!validaciones) {
      if (tipo === TipoCampoPerfil.SELECCION) {
        throw new ErrorDominioContextoProductivo(
          'CUL_CAMPO_PERFIL_INVALIDO',
          'El tipo SELECCION requiere valoresPermitidos.',
        );
      }
      return;
    }

    if (tipo === TipoCampoPerfil.TEXTO) {
      const v = validaciones as ValidacionesCampoTexto;
      if (v.longitudMinima !== undefined && v.longitudMinima < 0) {
        throw new ErrorDominioContextoProductivo(
          'CUL_CAMPO_PERFIL_INVALIDO',
          'longitudMinima no puede ser negativa.',
        );
      }
      if (
        v.longitudMinima !== undefined &&
        v.longitudMaxima !== undefined &&
        v.longitudMinima > v.longitudMaxima
      ) {
        throw new ErrorDominioContextoProductivo(
          'CUL_CAMPO_PERFIL_INVALIDO',
          'longitudMinima no puede ser mayor que longitudMaxima.',
        );
      }
    } else if (tipo === TipoCampoPerfil.ENTERO) {
      const v = validaciones as ValidacionesCampoEntero;
      if (
        v.minimo !== undefined &&
        v.maximo !== undefined &&
        v.minimo > v.maximo
      ) {
        throw new ErrorDominioContextoProductivo(
          'CUL_CAMPO_PERFIL_INVALIDO',
          'minimo no puede ser mayor que maximo.',
        );
      }
    } else if (tipo === TipoCampoPerfil.DECIMAL) {
      const v = validaciones as ValidacionesCampoDecimal;
      if (v.minimo !== undefined && v.maximo !== undefined) {
        const minNum = parseFloat(v.minimo);
        const maxNum = parseFloat(v.maximo);
        if (minNum > maxNum) {
          throw new ErrorDominioContextoProductivo(
            'CUL_CAMPO_PERFIL_INVALIDO',
            'minimo decimal no puede ser mayor que maximo decimal.',
          );
        }
      }
    } else if (tipo === TipoCampoPerfil.SELECCION) {
      const v = validaciones as ValidacionesCampoSeleccion;
      if (
        !Array.isArray(v.valoresPermitidos) ||
        v.valoresPermitidos.length === 0 ||
        v.valoresPermitidos.some(
          (val) => typeof val !== 'string' || val.trim().length === 0,
        )
      ) {
        throw new ErrorDominioContextoProductivo(
          'CUL_CAMPO_PERFIL_INVALIDO',
          'valoresPermitidos debe ser un array con al menos un elemento no vacío.',
        );
      }
    }
  }
}
