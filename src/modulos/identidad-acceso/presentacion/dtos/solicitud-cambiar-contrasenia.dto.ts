import { IsString, Length } from 'class-validator';

export class SolicitudCambiarContraseniaDto {
    @IsString()
    @Length(15, 128)
    contraseniaActual!: string;

    @IsString()
    @Length(15, 128)
    nuevaContrasenia!: string;
}
