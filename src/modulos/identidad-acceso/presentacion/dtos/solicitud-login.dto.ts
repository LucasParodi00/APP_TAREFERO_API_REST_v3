import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { CanalAcceso } from '../../dominio/enumeraciones/canal-acceso.enum';

export class SolicitudLoginDto {
    @IsString()
    @IsNotEmpty()
    aliasEmpresa!: string;

    @IsEmail()
    @MaxLength(254)
    correoAcceso!: string;

    @IsString()
    @Length(15, 128)
    contrasenia!: string;

    @IsEnum(CanalAcceso)
    canal!: CanalAcceso;

    @IsOptional()
    @IsString()
    dispositivoId?: string;
}
