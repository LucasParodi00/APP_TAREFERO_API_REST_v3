import { RepositorioCultivos } from '../puertos/salida/repositorio-cultivos.puerto';
import {
  RepositorioVariedades,
  OpcionesListadoVariedades,
  ResultadoListadoVariedades,
} from '../puertos/salida/repositorio-variedades.puerto';
import { ErrorDominioContextoProductivo } from '../../dominio/errores/error-dominio-contexto-productivo';

export class ListarVariedadesCasoDeUso {
  public constructor(
    private readonly repositorioCultivos: RepositorioCultivos,
    private readonly repositorioVariedades: RepositorioVariedades,
  ) {}

  public async ejecutar(
    cultivoId: string,
    opciones: OpcionesListadoVariedades,
  ): Promise<ResultadoListadoVariedades> {
    const cultivo = await this.repositorioCultivos.buscarPorId(cultivoId);
    if (!cultivo) {
      throw new ErrorDominioContextoProductivo(
        'CUL_RECURSO_NO_ENCONTRADO',
        `No se encontró el cultivo con ID ${cultivoId}.`,
      );
    }

    return this.repositorioVariedades.listar(cultivoId, opciones);
  }
}
