export class ErrorDominioTerritorio extends Error {
  constructor(
    public readonly codigo: string,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = 'ErrorDominioTerritorio';
  }
}
