import { Cultivo } from '../../dominio/entidades/cultivo';
import { ErrorDominioContextoProductivo } from '../../dominio/errores/error-dominio-contexto-productivo';
import { RepositorioCultivos } from '../puertos/salida/repositorio-cultivos.puerto';

export class ConsultarCultivoCasoDeUso {
  public constructor(
    private readonly repositorioCultivos: RepositorioCultivos,
  ) {}

  public async ejecutar(cultivoId: string): Promise<Cultivo> {
    const cultivo = await this.repositorioCultivos.buscarPorId(cultivoId);
    if (!cultivo) {
      throw new ErrorDominioContextoProductivo(
        'CUL_RECURSO_NO_ENCONTRADO',
        `No se encontró el cultivo con ID ${cultivoId}.`,
      );
    }
    return cultivo;
  }
}
