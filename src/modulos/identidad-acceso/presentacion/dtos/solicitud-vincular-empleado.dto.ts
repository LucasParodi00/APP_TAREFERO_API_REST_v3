import { IsUUID } from 'class-validator';

export class SolicitudVincularEmpleadoDto {
    @IsUUID()
    empleadoId!: string;
}
