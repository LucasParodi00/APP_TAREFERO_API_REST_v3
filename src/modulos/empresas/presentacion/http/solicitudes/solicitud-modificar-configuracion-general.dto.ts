import { IsString, IsNotEmpty, Length, MaxLength } from 'class-validator';

export class SolicitudModificarConfiguracionGeneralDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 2, {
    message:
      'El país de referencia debe ser un código ISO 3166-1 alfa-2 de 2 letras.',
  })
  paisReferencia!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  zonaHoraria!: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 3, {
    message: 'La moneda principal debe ser un código ISO 4217 de 3 letras.',
  })
  monedaPrincipal!: string;
}
