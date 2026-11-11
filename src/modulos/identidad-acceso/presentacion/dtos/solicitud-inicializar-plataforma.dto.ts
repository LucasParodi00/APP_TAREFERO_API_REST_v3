import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class SolicitudInicializarPlataformaDto {
    @IsString()
    @IsNotEmpty()
    claveSecretaBootstrapping!: string;

    @IsEmail()
    correoSuperAdmin!: string;

    @IsString()
    @Length(15, 128)
    contraseniaSuperAdmin!: string;
}
