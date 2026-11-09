export class PuntoGeograficoDto {
  latitud!: number;
  longitud!: number;
}

export class ConfiguracionInicialDto {
  paisReferencia?: string;
  zonaHoraria?: string;
  monedaPrincipal?: string;
}

export class SolicitudRegistrarEmpresaDto {
  nombre!: string;
  alias!: string;
  cuit?: string | null;
  responsableNombre?: string | null;
  ubicacionTexto?: string | null;
  ubicacionGeografica?: PuntoGeograficoDto | null;
  descripcionActividad?: string | null;
  configuracion?: ConfiguracionInicialDto;
}
