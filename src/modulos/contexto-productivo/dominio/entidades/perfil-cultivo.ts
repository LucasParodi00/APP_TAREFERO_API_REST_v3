import { AlcancePerfil } from '../enumeraciones/alcance-perfil';
import { EstadoPerfil } from '../enumeraciones/estado-perfil';
import { CampoPerfil } from '../objetos-valor/campo-perfil';
import { ErrorDominioContextoProductivo } from '../errores/error-dominio-contexto-productivo';

export interface PropiedadesCrearPerfilBorrador {
  id: string;
  cultivoId: string;
  alcance: AlcancePerfil;
  empresaId?: string | null;
  loteId?: string | null;
  perfilPadreId?: string | null;
  nombre: string;
  descripcion?: string | null;
  campos: CampoPerfil[];
  version?: number;
}

export interface PropiedadesEditarPerfilBorrador {
  nombre?: string;
  descripcion?: string | null;
  campos?: CampoPerfil[];
}

export interface PropiedadesPerfilCultivo {
  id: string;
  cultivoId: string;
  alcance: AlcancePerfil;
  empresaId: string | null;
  loteId: string | null;
  perfilPadreId: string | null;
  nombre: string;
  descripcion: string | null;
  version: number;
  estado: EstadoPerfil;
  campos: CampoPerfil[];
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export class PerfilCultivo {
  private constructor(
    public readonly id: string,
    public readonly cultivoId: string,
    public readonly alcance: AlcancePerfil,
    public readonly empresaId: string | null,
    public readonly loteId: string | null,
    public readonly perfilPadreId: string | null,
    private _nombre: string,
    private _descripcion: string | null,
    public readonly version: number,
    private _estado: EstadoPerfil,
    private _campos: CampoPerfil[],
    public readonly fechaCreacion: Date,
    private _fechaActualizacion: Date,
  ) {}

  public get nombre(): string {
    return this._nombre;
  }

  public get descripcion(): string | null {
    return this._descripcion;
  }

  public get estado(): EstadoPerfil {
    return this._estado;
  }

  public get campos(): CampoPerfil[] {
    return [...this._campos];
  }

  public get fechaActualizacion(): Date {
    return this._fechaActualizacion;
  }

  public static crearBorrador(
    props: PropiedadesCrearPerfilBorrador,
  ): PerfilCultivo {
    if (!props.cultivoId || props.cultivoId.trim().length === 0) {
      throw new ErrorDominioContextoProductivo(
        'CUL_CAMPO_PERFIL_INVALIDO',
        'El perfil debe pertenecer a un Cultivo.',
      );
    }

    const nombreLimpio = props.nombre?.trim();
    if (!nombreLimpio || nombreLimpio.length < 1 || nombreLimpio.length > 150) {
      throw new ErrorDominioContextoProductivo(
        'CUL_CAMPO_PERFIL_INVALIDO',
        'El nombre de perfil debe tener entre 1 y 150 caracteres.',
      );
    }

    const descripcionLimpia = props.descripcion?.trim() || null;
    if (descripcionLimpia && descripcionLimpia.length > 1000) {
      throw new ErrorDominioContextoProductivo(
        'CUL_CAMPO_PERFIL_INVALIDO',
        'La descripción no puede superar 1000 caracteres.',
      );
    }

    const empresaIdLimpio = props.empresaId?.trim() || null;
    const loteIdLimpio = props.loteId?.trim() || null;
    const perfilPadreIdLimpio = props.perfilPadreId?.trim() || null;

    if (props.alcance === AlcancePerfil.BASE) {
      if (
        empresaIdLimpio !== null ||
        loteIdLimpio !== null ||
        perfilPadreIdLimpio !== null
      ) {
        throw new ErrorDominioContextoProductivo(
          'CUL_PERFIL_INCOMPATIBLE',
          'Un Perfil BASE no puede tener empresaId, loteId ni perfilPadreId.',
        );
      }
    } else if (props.alcance === AlcancePerfil.EMPRESA) {
      if (!empresaIdLimpio || !perfilPadreIdLimpio || loteIdLimpio !== null) {
        throw new ErrorDominioContextoProductivo(
          'CUL_PERFIL_INCOMPATIBLE',
          'Un Perfil EMPRESA requiere empresaId y perfilPadreId, y no debe tener loteId.',
        );
      }
    } else if (props.alcance === AlcancePerfil.LOTE) {
      if (!empresaIdLimpio || !loteIdLimpio || !perfilPadreIdLimpio) {
        throw new ErrorDominioContextoProductivo(
          'CUL_PERFIL_INCOMPATIBLE',
          'Un Perfil LOTE requiere empresaId, loteId y perfilPadreId.',
        );
      }
    } else {
      throw new ErrorDominioContextoProductivo(
        'CUL_PERFIL_INCOMPATIBLE',
        `Alcance de perfil desconocido: ${String(props.alcance)}`,
      );
    }

    PerfilCultivo.validarCamposUnicos(props.campos || []);

    const ahora = new Date();
    return new PerfilCultivo(
      props.id,
      props.cultivoId,
      props.alcance,
      empresaIdLimpio,
      loteIdLimpio,
      perfilPadreIdLimpio,
      nombreLimpio,
      descripcionLimpia,
      props.version ?? 1,
      EstadoPerfil.BORRADOR,
      props.campos || [],
      ahora,
      ahora,
    );
  }

  public editarBorrador(props: PropiedadesEditarPerfilBorrador): void {
    if (this._estado !== EstadoPerfil.BORRADOR) {
      throw new ErrorDominioContextoProductivo(
        'CUL_VERSION_PERFIL_INMUTABLE',
        'Solo se pueden modificar perfiles en estado BORRADOR.',
      );
    }

    if (props.nombre !== undefined) {
      const nombreLimpio = props.nombre.trim();
      if (
        !nombreLimpio ||
        nombreLimpio.length < 1 ||
        nombreLimpio.length > 150
      ) {
        throw new ErrorDominioContextoProductivo(
          'CUL_CAMPO_PERFIL_INVALIDO',
          'El nombre de perfil debe tener entre 1 y 150 caracteres.',
        );
      }
      this._nombre = nombreLimpio;
    }

    if (props.descripcion !== undefined) {
      const descripcionLimpia = props.descripcion?.trim() || null;
      if (descripcionLimpia && descripcionLimpia.length > 1000) {
        throw new ErrorDominioContextoProductivo(
          'CUL_CAMPO_PERFIL_INVALIDO',
          'La descripción no puede superar 1000 caracteres.',
        );
      }
      this._descripcion = descripcionLimpia;
    }

    if (props.campos !== undefined) {
      PerfilCultivo.validarCamposUnicos(props.campos);
      this._campos = [...props.campos];
    }

    this._fechaActualizacion = new Date();
  }

  public publicar(perfilPadre?: PerfilCultivo): void {
    if (this._estado !== EstadoPerfil.BORRADOR) {
      throw new ErrorDominioContextoProductivo(
        'CUL_VERSION_PERFIL_INMUTABLE',
        'Solo se puede publicar un perfil en estado BORRADOR.',
      );
    }

    if (this.alcance !== AlcancePerfil.BASE) {
      if (!perfilPadre) {
        throw new ErrorDominioContextoProductivo(
          'CUL_PERFIL_INCOMPATIBLE',
          'Se requiere el perfil padre para validar la publicación.',
        );
      }

      if (perfilPadre.id !== this.perfilPadreId) {
        throw new ErrorDominioContextoProductivo(
          'CUL_PERFIL_INCOMPATIBLE',
          'El perfil padre provisto no coincide con perfilPadreId.',
        );
      }

      if (perfilPadre.cultivoId !== this.cultivoId) {
        throw new ErrorDominioContextoProductivo(
          'CUL_PERFIL_INCOMPATIBLE',
          'El perfil padre pertenece a un cultivo distinto.',
        );
      }

      if (perfilPadre.estado !== EstadoPerfil.PUBLICADO) {
        throw new ErrorDominioContextoProductivo(
          'CUL_PERFIL_INCOMPATIBLE',
          'El perfil padre debe estar en estado PUBLICADO.',
        );
      }

      // Validar precedencia e incompatibilidad CUL-BR-004:
      // Campos base obligatorios no pueden ser desactivados ni eliminados.
      const mapaCamposHijo = new Map(this._campos.map((c) => [c.codigo, c]));

      for (const campoPadre of perfilPadre.campos) {
        if (campoPadre.obligatorio) {
          const campoHijo = mapaCamposHijo.get(campoPadre.codigo);
          if (!campoHijo) {
            throw new ErrorDominioContextoProductivo(
              'CUL_PERFIL_INCOMPATIBLE',
              `El campo base obligatorio "${campoPadre.codigo}" no puede omitirse.`,
            );
          }
          if (!campoHijo.obligatorio) {
            throw new ErrorDominioContextoProductivo(
              'CUL_PERFIL_INCOMPATIBLE',
              `El campo base obligatorio "${campoPadre.codigo}" no puede desactivarse como opcional.`,
            );
          }
          if (campoHijo.tipo !== campoPadre.tipo) {
            throw new ErrorDominioContextoProductivo(
              'CUL_PERFIL_INCOMPATIBLE',
              `El tipo de campo para "${campoPadre.codigo}" no coincide con el padre.`,
            );
          }
        }
      }
    }

    this._estado = EstadoPerfil.PUBLICADO;
    this._fechaActualizacion = new Date();
  }

  public inactivar(): void {
    if (this._estado !== EstadoPerfil.PUBLICADO) {
      throw new ErrorDominioContextoProductivo(
        'CUL_VERSION_PERFIL_INMUTABLE',
        'Solo se puede inactivar una versión de Perfil en estado PUBLICADO.',
      );
    }
    this._estado = EstadoPerfil.INACTIVO;
    this._fechaActualizacion = new Date();
  }

  public copiarABorrador(
    nuevoId: string,
    nuevaVersionNumero: number,
  ): PerfilCultivo {
    return PerfilCultivo.crearBorrador({
      id: nuevoId,
      cultivoId: this.cultivoId,
      alcance: this.alcance,
      empresaId: this.empresaId,
      loteId: this.loteId,
      perfilPadreId: this.perfilPadreId,
      nombre: this._nombre,
      descripcion: this._descripcion,
      campos: [...this._campos],
      version: nuevaVersionNumero,
    });
  }

  private static validarCamposUnicos(campos: CampoPerfil[]): void {
    const codigos = new Set<string>();
    for (const c of campos) {
      if (codigos.has(c.codigo)) {
        throw new ErrorDominioContextoProductivo(
          'CUL_CAMPO_PERFIL_INVALIDO',
          `Código de campo duplicado en el perfil: ${c.codigo}`,
        );
      }
      codigos.add(c.codigo);
    }
  }

  public static reconstituir(props: PropiedadesPerfilCultivo): PerfilCultivo {
    return new PerfilCultivo(
      props.id,
      props.cultivoId,
      props.alcance,
      props.empresaId,
      props.loteId,
      props.perfilPadreId,
      props.nombre,
      props.descripcion,
      props.version,
      props.estado,
      props.campos,
      props.fechaCreacion,
      props.fechaActualizacion,
    );
  }
}
