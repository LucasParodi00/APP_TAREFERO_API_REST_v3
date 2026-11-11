import { ArrayNotEmpty, IsArray, IsBoolean, IsEnum } from 'class-validator';
import { RolCodigo } from '../../dominio/enumeraciones/rol-codigo.enum';

export class SolicitudActualizarRolesCanalesDto {
    @IsBoolean()
    accesoWeb!: boolean;

    @IsBoolean()
    accesoMovil!: boolean;

    @IsArray()
    @ArrayNotEmpty()
    @IsEnum(RolCodigo, { each: true })
    roles!: RolCodigo[];
}
