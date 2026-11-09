import {
  RepositorioCultivos,
  OpcionesListadoCultivos,
  ResultadoListadoCultivos,
} from '../puertos/salida/repositorio-cultivos.puerto';

export class ListarCultivosCasoDeUso {
  public constructor(
    private readonly repositorioCultivos: RepositorioCultivos,
  ) {}

  public async ejecutar(
    opciones: OpcionesListadoCultivos,
  ): Promise<ResultadoListadoCultivos> {
    return this.repositorioCultivos.listar(opciones);
  }
}
