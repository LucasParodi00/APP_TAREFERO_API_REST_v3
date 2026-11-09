import { PerfilCultivo } from '../../dominio/entidades/perfil-cultivo';
import { AlcancePerfil } from '../../dominio/enumeraciones/alcance-perfil';
import { ErrorDominioContextoProductivo } from '../../dominio/errores/error-dominio-contexto-productivo';
import { RepositorioPerfiles } from '../puertos/salida/repositorio-perfiles.puerto';
import { ContextoActorContextoProductivo } from '../puertos/salida/contexto-actor.puerto';

export class PublicarPerfilCasoDeUso {
  public constructor(
    private readonly repositorioPerfiles: RepositorioPerfiles,
  ) {}

  public async ejecutar(
    cultivoId: string,
    perfilId: string,
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
          'Solo un SuperAdministrador puede publicar perfiles BASE.',
        );
      }
    } else {
      if (
        actor.rol !== 'Administrador' ||
        actor.empresaId !== perfil.empresaId
      ) {
        throw new ErrorDominioContextoProductivo(
          'CUL_ACCESO_DENEGADO',
          'No tiene permiso para publicar este perfil.',
        );
      }
    }

    if (versionEsperada !== undefined && perfil.version !== versionEsperada) {
      throw new ErrorDominioContextoProductivo(
        'CUL_VERSION_CONFLICTO',
        `Conflicto de concurrencia: versión actual ${perfil.version}, esperada ${versionEsperada}.`,
      );
    }

    let padre: PerfilCultivo | undefined;
    if (perfil.perfilPadreId) {
      const padreEncontrado = await this.repositorioPerfiles.buscarPorId(
        perfil.perfilPadreId,
      );
      if (!padreEncontrado) {
        throw new ErrorDominioContextoProductivo(
          'CUL_PERFIL_INCOMPATIBLE',
          `No se encontró el perfil padre con ID ${perfil.perfilPadreId}.`,
        );
      }
      padre = padreEncontrado;
    }

    perfil.publicar(padre);
    await this.repositorioPerfiles.guardar(perfil);
    return perfil;
  }
}
