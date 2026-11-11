import { IsString, MaxLength, Matches, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PuntoGeograficoDto } from './solicitud-registrar-empresa.dto';

export class SolicitudModificarEmpresaDto {
    @IsOptional()
    @IsString()
    @MaxLength(120)
    nombre?: string;

    @IsOptional()
    @IsString()
    @Matches(/^\d{11}$/, {
        message: 'El CUIT debe tener exactamente 11 dígitos numéricos.',
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
}
