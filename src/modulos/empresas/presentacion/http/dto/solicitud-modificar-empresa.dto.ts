import { PuntoGeograficoDto } from './solicitud-registrar-empresa.dto';

export class SolicitudModificarEmpresaDto {
  nombre?: string;
  alias?: string;
  cuit?: string | null;
  responsableNombre?: string | null;
  ubicacionTexto?: string | null;
  ubicacionGeografica?: PuntoGeograficoDto | null;
  descripcionActividad?: string | null;
}
