import { IsEnum } from 'class-validator';
import { EstadoCuenta } from '../../dominio/enumeraciones/estado-cuenta.enum';

export class SolicitudCambiarEstadoCuentaDto {
    @IsEnum(EstadoCuenta)
    estado!: EstadoCuenta;
}
