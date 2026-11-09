import { Variedad } from '../../dominio/entidades/variedad';
import { ErrorDominioContextoProductivo } from '../../dominio/errores/error-dominio-contexto-productivo';
import { RepositorioCultivos } from '../puertos/salida/repositorio-cultivos.puerto';
import { RepositorioVariedades } from '../puertos/salida/repositorio-variedades.puerto';

export class ConsultarVariedadCasoDeUso {
  public constructor(
    private readonly repositorioCultivos: RepositorioCultivos,
    private readonly repositorioVariedades: RepositorioVariedades,
  ) {}

  public async ejecutar(
    cultivoId: string,
    variedadId: string,
  ): Promise<Variedad> {
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

    return variedad;
  }
}
