import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ConsultaListarEmpresasDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limite?: number = 25;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  desplazamiento?: number = 0;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  nombre?: string;
}
