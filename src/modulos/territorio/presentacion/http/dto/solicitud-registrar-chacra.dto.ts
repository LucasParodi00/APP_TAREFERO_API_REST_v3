import { PuntoReferenciaDto } from './punto-referencia.dto';

export class SolicitudRegistrarChacraDto {
  nombre!: string;
  nombreCorto!: string;
  responsableNombre?: string | null;
  direccionTexto?: string | null;
  ubicacionGeografica?: PuntoReferenciaDto | null;
}
