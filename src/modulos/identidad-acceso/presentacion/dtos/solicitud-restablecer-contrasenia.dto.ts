import { IsString, Length } from 'class-validator';

export class SolicitudRestablecerContraseniaDto {
    @IsString()
    @Length(15, 128)
    nuevaContrasenia!: string;
}
