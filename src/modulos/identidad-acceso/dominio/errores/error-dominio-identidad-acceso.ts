export class ErrorDominioIdentidadAcceso extends Error {
  constructor(
    public readonly codigo: string,
    mensaje?: string,
  ) {
    super(mensaje ?? codigo);
    this.name = 'ErrorDominioIdentidadAcceso';
  }
}
