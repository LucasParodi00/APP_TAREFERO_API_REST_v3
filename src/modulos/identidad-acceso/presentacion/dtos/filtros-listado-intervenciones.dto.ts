import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class FiltrosListadoIntervencionesDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limite = 25;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    desplazamiento = 0;
}
