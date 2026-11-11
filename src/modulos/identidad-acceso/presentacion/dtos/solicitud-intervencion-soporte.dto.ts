import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SolicitudIntervencionSoporteDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    motivo!: string;
}
