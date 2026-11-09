import { PerfilCultivo } from '../../dominio/entidades/perfil-cultivo';
import { AlcancePerfil } from '../../dominio/enumeraciones/alcance-perfil';
import { EstadoPerfil } from '../../dominio/enumeraciones/estado-perfil';
import { EstadoCultivo } from '../../dominio/enumeraciones/estado-cultivo';
import { TipoCampoPerfil } from '../../dominio/enumeraciones/tipo-campo-perfil';
import {
  CampoPerfil,
  PropiedadesCampoPerfil,
} from '../../dominio/objetos-valor/campo-perfil';
import { ErrorDominioContextoProductivo } from '../../dominio/errores/error-dominio-contexto-productivo';
import { RepositorioCultivos } from '../puertos/salida/repositorio-cultivos.puerto';
import { RepositorioPerfiles } from '../puertos/salida/repositorio-perfiles.puerto';
import { ProveedorEmpresaCul } from '../puertos/salida/proveedor-empresa-cul.puerto';
import { ProveedorLoteCul } from '../puertos/salida/proveedor-lote-cul.puerto';
import { ProveedorUnidadCul } from '../puertos/salida/proveedor-unidad-cul.puerto';
import { ProveedorHabilitacionCultivo } from '../puertos/salida/proveedor-habilitacion-cultivo.puerto';
import { ContextoActorContextoProductivo } from '../puertos/salida/contexto-actor.puerto';
import { randomUUID } from 'crypto';

export interface ComandoCrearBorradorPerfilNuevo {
  alcance: AlcancePerfil;
  loteId?: string | null;
  perfilPadreId?: string | null;
  nombre: string;
  descripcion?: string | null;
  campos: PropiedadesCampoPerfil[];
}

export interface ComandoCrearBorradorNuevaVersion {
  versionOrigenId: string;
}

export type ComandoCrearBorradorPerfil =
  ComandoCrearBorradorPerfilNuevo | ComandoCrearBorradorNuevaVersion;

export class CrearBorradorPerfilCasoDeUso {
  public constructor(
    private readonly repositorioCultivos: RepositorioCultivos,
    private readonly repositorioPerfiles: RepositorioPerfiles,
    private readonly proveedorEmpresa: ProveedorEmpresaCul,
    private readonly proveedorLote: ProveedorLoteCul,
    private readonly proveedorUnidad: ProveedorUnidadCul,
    private readonly proveedorHabilitacion: ProveedorHabilitacionCultivo,
  ) {}

  public async ejecutar(
    cultivoId: string,
    comando: ComandoCrearBorradorPerfil,
    actor: ContextoActorContextoProductivo,
  ): Promise<PerfilCultivo> {
    const cultivo = await this.repositorioCultivos.buscarPorId(cultivoId);
    if (!cultivo) {
      throw new ErrorDominioContextoProductivo(
        'CUL_RECURSO_NO_ENCONTRADO',
        `No se encontró el cultivo con ID ${cultivoId}.`,
      );
    }

    if (cultivo.estado !== EstadoCultivo.ACTIVO) {
      throw new ErrorDominioContextoProductivo(
        'CUL_PERFIL_INCOMPATIBLE',
        'No se pueden crear perfiles para un cultivo inactivo.',
      );
    }

    if ('versionOrigenId' in comando) {
      return this.crearDesdeVersionExistente(
        cultivoId,
        comando.versionOrigenId,
        actor,
      );
    }

    return this.crearNuevoBorrador(cultivoId, comando, actor);
  }

  private async crearNuevoBorrador(
    cultivoId: string,
    comando: ComandoCrearBorradorPerfilNuevo,
    actor: ContextoActorContextoProductivo,
  ): Promise<PerfilCultivo> {
    let empresaId: string | null = null;

    if (comando.alcance === AlcancePerfil.BASE) {
      if (actor.rol !== 'SuperAdministrador') {
        throw new ErrorDominioContextoProductivo(
          'CUL_ACCESO_DENEGADO',
          'Solo un SuperAdministrador puede crear perfiles BASE.',
        );
      }
    } else {
      // Alcance EMPRESA o LOTE
      if (actor.rol === 'SuperAdministrador') {
        throw new ErrorDominioContextoProductivo(
          'CUL_ACCESO_DENEGADO',
          'El SuperAdministrador solo administra perfiles BASE.',
        );
      }

      if (actor.rol !== 'Administrador' || !actor.empresaId) {
        throw new ErrorDominioContextoProductivo(
          'CUL_ACCESO_DENEGADO',
          'Se requiere rol Administrador con contexto de Empresa.',
        );
      }

      empresaId = actor.empresaId;

      const empresaValida =
        await this.proveedorEmpresa.verificarEmpresaExisteYActiva(empresaId);
      if (!empresaValida) {
        throw new ErrorDominioContextoProductivo(
          'CUL_PERFIL_INCOMPATIBLE',
          `La empresa ${empresaId} no existe o no se encuentra activa.`,
        );
      }

      const habilitado =
        await this.proveedorHabilitacion.verificarCultivoHabilitadoParaEmpresa(
          cultivoId,
          empresaId,
        );
      if (!habilitado) {
        throw new ErrorDominioContextoProductivo(
          'CUL_CULTIVO_NO_HABILITADO',
          `El cultivo no se encuentra habilitado para la empresa ${empresaId}.`,
        );
      }

      if (comando.alcance === AlcancePerfil.LOTE) {
        if (!comando.loteId) {
          throw new ErrorDominioContextoProductivo(
            'CUL_PERFIL_INCOMPATIBLE',
            'Se requiere loteId para alcance LOTE.',
          );
        }
        const loteValido =
          await this.proveedorLote.verificarLotePerteneceAEmpresaYActivo(
            empresaId,
            comando.loteId,
          );
        if (!loteValido) {
          throw new ErrorDominioContextoProductivo(
            'CUL_PERFIL_INCOMPATIBLE',
            `El lote ${comando.loteId} no pertenece a la empresa o no está activo.`,
          );
        }
      }

      // Validar perfil padre
      if (!comando.perfilPadreId) {
        throw new ErrorDominioContextoProductivo(
          'CUL_PERFIL_INCOMPATIBLE',
          'Se requiere perfilPadreId para perfiles de alcance EMPRESA o LOTE.',
        );
      }

      const padre = await this.repositorioPerfiles.buscarPorId(
        comando.perfilPadreId,
      );
      if (!padre) {
        throw new ErrorDominioContextoProductivo(
          'CUL_PERFIL_INCOMPATIBLE',
          `No se encontró el perfil padre con ID ${comando.perfilPadreId}.`,
        );
      }

      if (padre.cultivoId !== cultivoId) {
        throw new ErrorDominioContextoProductivo(
          'CUL_PERFIL_INCOMPATIBLE',
          'El perfil padre no pertenece al mismo cultivo.',
        );
      }

      if (padre.estado !== EstadoPerfil.PUBLICADO) {
        throw new ErrorDominioContextoProductivo(
          'CUL_PERFIL_INCOMPATIBLE',
          'El perfil padre debe estar PUBLICADO.',
        );
      }
    }

    // Validar unidades de campos decimales
    const camposInstanciados: CampoPerfil[] = [];
    for (const c of comando.campos) {
      if (c.tipo === TipoCampoPerfil.DECIMAL && c.unidadId) {
        const unidadValida =
          await this.proveedorUnidad.verificarUnidadExisteYValida(c.unidadId);
        if (!unidadValida) {
          throw new ErrorDominioContextoProductivo(
            'CUL_CAMPO_PERFIL_INVALIDO',
            `La unidad ${c.unidadId} no es válida en el catálogo canónico.`,
          );
        }
      }
      camposInstanciados.push(CampoPerfil.crear(c));
    }

    const versionNumero =
      await this.repositorioPerfiles.obtenerSiguienteNumeroVersion(
        cultivoId,
        comando.alcance,
        empresaId,
        comando.loteId || null,
      );

    const perfil = PerfilCultivo.crearBorrador({
      id: randomUUID(),
      cultivoId,
      alcance: comando.alcance,
      empresaId,
      loteId: comando.loteId || null,
      perfilPadreId: comando.perfilPadreId || null,
      nombre: comando.nombre,
      descripcion: comando.descripcion,
      campos: camposInstanciados,
      version: versionNumero,
    });

    await this.repositorioPerfiles.guardar(perfil);
    return perfil;
  }

  private async crearDesdeVersionExistente(
    cultivoId: string,
    versionOrigenId: string,
    actor: ContextoActorContextoProductivo,
  ): Promise<PerfilCultivo> {
    const origen = await this.repositorioPerfiles.buscarPorId(versionOrigenId);
    if (!origen) {
      throw new ErrorDominioContextoProductivo(
        'CUL_RECURSO_NO_ENCONTRADO',
        `No se encontró el perfil origen con ID ${versionOrigenId}.`,
      );
    }

    if (origen.cultivoId !== cultivoId) {
      throw new ErrorDominioContextoProductivo(
        'CUL_PERFIL_INCOMPATIBLE',
        'El perfil origen no coincide con el cultivo solicitado.',
      );
    }

    if (origen.alcance === AlcancePerfil.BASE) {
      if (actor.rol !== 'SuperAdministrador') {
        throw new ErrorDominioContextoProductivo(
          'CUL_ACCESO_DENEGADO',
          'Solo un SuperAdministrador puede versionar perfiles BASE.',
        );
      }
    } else {
      if (
        actor.rol !== 'Administrador' ||
        actor.empresaId !== origen.empresaId
      ) {
        throw new ErrorDominioContextoProductivo(
          'CUL_ACCESO_DENEGADO',
          'No tiene permiso para versionar este perfil.',
        );
      }
    }

    const siguienteVersion =
      await this.repositorioPerfiles.obtenerSiguienteNumeroVersion(
        origen.cultivoId,
        origen.alcance,
        origen.empresaId,
        origen.loteId,
      );

    const nuevoBorrador = origen.copiarABorrador(
      randomUUID(),
      siguienteVersion,
    );
    await this.repositorioPerfiles.guardar(nuevoBorrador);
    return nuevoBorrador;
  }
}
