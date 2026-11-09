import { Variedad } from '../../dominio/entidades/variedad';
import { ErrorDominioContextoProductivo } from '../../dominio/errores/error-dominio-contexto-productivo';
import { RepositorioCultivos } from '../puertos/salida/repositorio-cultivos.puerto';
import { RepositorioVariedades } from '../puertos/salida/repositorio-variedades.puerto';
import { ContextoActorContextoProductivo } from '../puertos/salida/contexto-actor.puerto';

export class InactivarVariedadCasoDeUso {
  public constructor(
    private readonly repositorioCultivos: RepositorioCultivos,
    private readonly repositorioVariedades: RepositorioVariedades,
  ) {}

  public async ejecutar(
    cultivoId: string,
    variedadId: string,
    versionEsperada: number,
    actor: ContextoActorContextoProductivo,
  ): Promise<Variedad> {
    if (actor.rol !== 'SuperAdministrador') {
      throw new ErrorDominioContextoProductivo(
        'CUL_ACCESO_DENEGADO',
        'Solo un SuperAdministrador puede inactivar variedades.',
      );
    }

    const cultivo = await this.repositorioCultivos.buscarPorId(cultivoId);
    if (!cultivo) {
      throw new ErrorDominioContextoProductivo(
        'CUL_RECURSO_NO_ENCONTRADO',
        `No se encontró el cultivo con ID ${cultivoId}.`,
      );
    }

    const variedad = await this.repositorioVariedades.buscarPorId(
      cultivoId,
      variedadId,
    );
    if (!variedad) {
      throw new ErrorDominioContextoProductivo(
        'CUL_RECURSO_NO_ENCONTRADO',
        `No se encontró la variedad con ID ${variedadId} en el cultivo ${cultivoId}.`,
      );
    }

    if (variedad.version !== versionEsperada) {
      throw new ErrorDominioContextoProductivo(
        'CUL_VERSION_CONFLICTO',
        `Conflicto de concurrencia: la versión de la variedad es ${variedad.version} y se esperaba ${versionEsperada}.`,
      );
    }

    variedad.inactivar();
    await this.repositorioVariedades.guardar(variedad);
    return variedad;
  }
}
