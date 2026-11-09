export class ErrorDominioEmpresa extends Error {
  constructor(
    public readonly codigo: string,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = 'ErrorDominioEmpresa';
  }
}
