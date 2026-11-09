import { PerfilCultivo } from '../../dominio/entidades/perfil-cultivo';
import { AlcancePerfil } from '../../dominio/enumeraciones/alcance-perfil';
import { ErrorDominioContextoProductivo } from '../../dominio/errores/error-dominio-contexto-productivo';
import { RepositorioPerfiles } from '../puertos/salida/repositorio-perfiles.puerto';
import { ContextoActorContextoProductivo } from '../puertos/salida/contexto-actor.puerto';

export class ConsultarPerfilCasoDeUso {
  public constructor(
    private readonly repositorioPerfiles: RepositorioPerfiles,
  ) {}

  public async ejecutar(
    cultivoId: string,
    perfilId: string,
    actor: ContextoActorContextoProductivo,
  ): Promise<PerfilCultivo> {
    const perfil = await this.repositorioPerfiles.buscarPorId(perfilId);
    if (!perfil || perfil.cultivoId !== cultivoId) {
      throw new ErrorDominioContextoProductivo(
        'CUL_RECURSO_NO_ENCONTRADO',
        `No se encontró el perfil con ID ${perfilId} en el cultivo ${cultivoId}.`,
      );
    }

    if (perfil.alcance !== AlcancePerfil.BASE) {
      if (
        actor.rol !== 'SuperAdministrador' &&
        (actor.rol !== 'Administrador' || actor.empresaId !== perfil.empresaId)
      ) {
        throw new ErrorDominioContextoProductivo(
          'CUL_ACCESO_DENEGADO',
          'No tiene acceso para consultar este perfil.',
        );
      }
    }

    return perfil;
  }
}
