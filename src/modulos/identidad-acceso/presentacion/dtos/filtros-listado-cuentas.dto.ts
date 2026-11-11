import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { EstadoCuenta } from '../../dominio/enumeraciones/estado-cuenta.enum';
import { RolCodigo } from '../../dominio/enumeraciones/rol-codigo.enum';

export class FiltrosListadoCuentasDto {
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

    @IsOptional()
    @IsEnum(EstadoCuenta)
    estado?: EstadoCuenta;

    @IsOptional()
    @IsEnum(RolCodigo)
    rol?: RolCodigo;
}
