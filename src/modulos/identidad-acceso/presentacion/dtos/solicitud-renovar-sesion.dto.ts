import { IsNotEmpty, IsString } from 'class-validator';

export class SolicitudRenovarSesionDto {
    @IsString()
    @IsNotEmpty()
    tokenRenovacion!: string;
}
