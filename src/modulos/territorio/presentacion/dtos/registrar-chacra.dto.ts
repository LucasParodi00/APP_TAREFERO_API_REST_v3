import { IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PuntoGeograficoReferenciaDto {
    latitud!: number;
    longitud!: number;
}

export class RegistrarChacraDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(150)
    nombre!: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    nombreCorto!: string;

    @IsOptional()
    @IsString()
    @MaxLength(150)
    responsableNombre?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    direccion?: string | null;

    @IsOptional()
    @ValidateNested()
    @Type(() => PuntoGeograficoReferenciaDto)
    puntoGeograficoReferencia?: PuntoGeograficoReferenciaDto | null;
}
