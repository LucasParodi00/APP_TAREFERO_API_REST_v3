export class SolicitudHabilitarCuentaDto {
  personaId!: string;
  correoAcceso!: string;
  contrasenia!: string;
  accesoWeb!: boolean;
  accesoMovil!: boolean;
  roles!: string[];
}
