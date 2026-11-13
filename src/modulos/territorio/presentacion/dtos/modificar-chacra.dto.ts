import { IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PuntoGeograficoReferenciaDto } from './registrar-chacra.dto';

export class ModificarChacraDto {
    @IsOptional()
    @IsString()
    @MaxLength(150)
    nombre?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    nombreCorto?: string;

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
