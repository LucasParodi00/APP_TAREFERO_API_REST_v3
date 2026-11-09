import { PerfilCultivo } from '../../dominio/entidades/perfil-cultivo';
import { AlcancePerfil } from '../../dominio/enumeraciones/alcance-perfil';
import { TipoCampoPerfil } from '../../dominio/enumeraciones/tipo-campo-perfil';
import {
  CampoPerfil,
  PropiedadesCampoPerfil,
} from '../../dominio/objetos-valor/campo-perfil';
import { ErrorDominioContextoProductivo } from '../../dominio/errores/error-dominio-contexto-productivo';
import { RepositorioPerfiles } from '../puertos/salida/repositorio-perfiles.puerto';
import { ProveedorUnidadCul } from '../puertos/salida/proveedor-unidad-cul.puerto';
import { ContextoActorContextoProductivo } from '../puertos/salida/contexto-actor.puerto';

export interface ComandoEditarBorradorPerfil {
  nombre?: string;
  descripcion?: string | null;
  campos?: PropiedadesCampoPerfil[];
}

export class EditarBorradorPerfilCasoDeUso {
  public constructor(
    private readonly repositorioPerfiles: RepositorioPerfiles,
    private readonly proveedorUnidad: ProveedorUnidadCul,
  ) {}

  public async ejecutar(
    cultivoId: string,
    perfilId: string,
    comando: ComandoEditarBorradorPerfil,
    actor: ContextoActorContextoProductivo,
    versionEsperada?: number,
  ): Promise<PerfilCultivo> {
    const perfil = await this.repositorioPerfiles.buscarPorId(perfilId);
    if (!perfil || perfil.cultivoId !== cultivoId) {
      throw new ErrorDominioContextoProductivo(
        'CUL_RECURSO_NO_ENCONTRADO',
        `No se encontró el perfil con ID ${perfilId}.`,
      );
    }

    if (perfil.alcance === AlcancePerfil.BASE) {
      if (actor.rol !== 'SuperAdministrador') {
        throw new ErrorDominioContextoProductivo(
          'CUL_ACCESO_DENEGADO',
          'Solo un SuperAdministrador puede editar perfiles BASE.',
        );
      }
    } else {
      if (
        actor.rol !== 'Administrador' ||
        actor.empresaId !== perfil.empresaId
      ) {
        throw new ErrorDominioContextoProductivo(
          'CUL_ACCESO_DENEGADO',
          'No tiene permiso para editar este perfil.',
        );
      }
    }

    if (versionEsperada !== undefined && perfil.version !== versionEsperada) {
      throw new ErrorDominioContextoProductivo(
        'CUL_VERSION_CONFLICTO',
        `Conflicto de concurrencia: versión actual ${perfil.version}, esperada ${versionEsperada}.`,
      );
    }

    let camposInstanciados: CampoPerfil[] | undefined;
    if (comando.campos) {
      camposInstanciados = [];
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
    }

    perfil.editarBorrador({
      nombre: comando.nombre,
      descripcion: comando.descripcion,
      campos: camposInstanciados,
    });

    await this.repositorioPerfiles.guardar(perfil);
    return perfil;
  }
}
