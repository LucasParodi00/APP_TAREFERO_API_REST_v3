import { IsOptional, IsString } from 'class-validator';
import { ConsultaPaginadaDto } from '../../../../comun/presentacion';

export class ListarChacrasDto extends ConsultaPaginadaDto {
    @IsOptional()
    @IsString()
    estado?: string;

    @IsOptional()
    @IsString()
    orden?: string;
}
