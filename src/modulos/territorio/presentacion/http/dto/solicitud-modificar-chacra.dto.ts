import { PuntoReferenciaDto } from './punto-referencia.dto';

export class SolicitudModificarChacraDto {
  nombre?: string;
  nombreCorto?: string;
  responsableNombre?: string | null;
  direccionTexto?: string | null;
  ubicacionGeografica?: PuntoReferenciaDto | null;
}
