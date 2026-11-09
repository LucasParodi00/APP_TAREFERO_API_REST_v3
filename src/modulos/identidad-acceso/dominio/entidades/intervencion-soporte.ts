import { ErrorDominioIdentidadAcceso } from '../errores/error-dominio-identidad-acceso';
import { MotivoSoporte } from '../objetos-valor/motivo-soporte';

export interface PropsIntervencionSoporte {
  id: string;
  usuarioPlataformaId: string;
  empresaId: string;
  motivo: MotivoSoporte;
  sesionId: string;
  solicitudId: string;
  ocurridaEn?: Date;
}

export class IntervencionSoporte {
  private constructor(
    public readonly id: string,
    public readonly usuarioPlataformaId: string,
    public readonly empresaId: string,
    public readonly motivo: MotivoSoporte,
    public readonly sesionId: string,
    public readonly solicitudId: string,
    public readonly ocurridaEn: Date,
  ) {}

  public static crear(props: PropsIntervencionSoporte): IntervencionSoporte {
    if (
      !props.empresaId ||
      typeof props.empresaId !== 'string' ||
      props.empresaId.trim().length === 0
    ) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_CONTEXTO_SOPORTE_REQUERIDO',
        'La Empresa destino es obligatoria para la intervención de soporte',
      );
    }

    if (!props.motivo || !(props.motivo instanceof MotivoSoporte)) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_CONTEXTO_SOPORTE_REQUERIDO',
        'El motivo de soporte es obligatorio para la intervención',
      );
    }

    if (
      !props.usuarioPlataformaId ||
      typeof props.usuarioPlataformaId !== 'string'
    ) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_ACCESO_DENEGADO',
        'La identidad del SuperAdministrador es obligatoria',
      );
    }

    return new IntervencionSoporte(
      props.id,
      props.usuarioPlataformaId,
      props.empresaId.trim(),
      props.motivo,
      props.sesionId,
      props.solicitudId,
      props.ocurridaEn ?? new Date(),
    );
  }
}
