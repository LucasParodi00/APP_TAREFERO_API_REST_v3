import {
    ArrayNotEmpty,
    IsArray,
    IsBoolean,
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    IsUUID,
    Length,
    MaxLength,
} from 'class-validator';
import { RolCodigo } from '../../dominio/enumeraciones/rol-codigo.enum';

export class SolicitudHabilitarCuentaDto {
    @IsOptional()
    @IsUUID()
    empleadoId?: string;

    @IsOptional()
    @IsString()
    @MaxLength(150)
    nombreMostrado?: string;

    @IsEmail()
    @MaxLength(254)
    correoAcceso!: string;

    @IsString()
    @Length(15, 128)
    contrasenia!: string;

    @IsBoolean()
    accesoWeb!: boolean;

    @IsBoolean()
    accesoMovil!: boolean;

    @IsArray()
    @ArrayNotEmpty()
    @IsEnum(RolCodigo, { each: true })
    roles!: RolCodigo[];
}
