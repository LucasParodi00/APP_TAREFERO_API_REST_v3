import { Cultivo } from '../../dominio/entidades/cultivo';
import { ErrorDominioContextoProductivo } from '../../dominio/errores/error-dominio-contexto-productivo';
import { RepositorioCultivos } from '../puertos/salida/repositorio-cultivos.puerto';
import { ContextoActorContextoProductivo } from '../puertos/salida/contexto-actor.puerto';

export class InactivarCultivoCasoDeUso {
  public constructor(
    private readonly repositorioCultivos: RepositorioCultivos,
  ) {}

  public async ejecutar(
    cultivoId: string,
    versionEsperada: number,
    actor: ContextoActorContextoProductivo,
  ): Promise<Cultivo> {
    if (actor.rol !== 'SuperAdministrador') {
      throw new ErrorDominioContextoProductivo(
        'CUL_ACCESO_DENEGADO',
        'Solo un SuperAdministrador puede inactivar cultivos del catálogo global.',
      );
    }

    const cultivo = await this.repositorioCultivos.buscarPorId(cultivoId);
    if (!cultivo) {
      throw new ErrorDominioContextoProductivo(
        'CUL_RECURSO_NO_ENCONTRADO',
        `No se encontró el cultivo con ID ${cultivoId}.`,
      );
    }

    if (cultivo.version !== versionEsperada) {
      throw new ErrorDominioContextoProductivo(
        'CUL_VERSION_CONFLICTO',
        `Conflicto de concurrencia: la versión del cultivo es ${cultivo.version} y se esperaba ${versionEsperada}.`,
      );
    }

    cultivo.inactivar();
    await this.repositorioCultivos.guardar(cultivo);
    return cultivo;
  }
}
