import {
  IsString,
  IsNotEmpty,
  MaxLength,
  Matches,
  IsOptional,
  ValidateNested,
  IsNumber,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";

export class PuntoGeograficoDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud!: number;
}

export class SolicitudRegistrarEmpresaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/, {
    message:
      "El alias debe contener entre 3 y 63 caracteres en minúscula, dígitos o guiones, y comenzar y terminar con letra o dígito.",
  })
  alias!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, {
    message: "El CUIT debe tener exactamente 11 dígitos numéricos.",
  })
  cuit?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  responsableNombre?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  ubicacionTexto?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => PuntoGeograficoDto)
  ubicacionGeografica?: PuntoGeograficoDto | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descripcionActividad?: string | null;

  @IsOptional()
  @IsString()
  configuracionGeneralId?: string;
}
