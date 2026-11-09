import { ErrorDominioIdentidadAcceso } from '../errores/error-dominio-identidad-acceso';

export class MotivoSoporte {
  private constructor(public readonly valor: string) {}

  public static crear(motivo: string): MotivoSoporte {
    if (!motivo || typeof motivo !== 'string') {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_MOTIVO_SOPORTE_INVALIDO',
        'El motivo de soporte es obligatorio',
      );
    }

    const valorNormalizado = motivo.trim();

    if (valorNormalizado.length === 0 || valorNormalizado.length > 1000) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_MOTIVO_SOPORTE_INVALIDO',
        'El motivo de soporte debe tener entre 1 y 1000 caracteres tras eliminar espacios exteriores',
      );
    }

    return new MotivoSoporte(valorNormalizado);
  }
}
