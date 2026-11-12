import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { CriteriosPaginacion } from '../../aplicacion';

export class ConsultaPaginadaDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El límite debe ser un número entero.' })
    @Min(1, { message: 'El límite debe ser de al menos 1.' })
    @Max(CriteriosPaginacion.LIMITE_MAXIMO, {
        message: `El límite no puede ser mayor a ${CriteriosPaginacion.LIMITE_MAXIMO}.`,
    })
    limite?: number = CriteriosPaginacion.LIMITE_PREDETERMINADO;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El desplazamiento debe ser un número entero.' })
    @Min(0, { message: 'El desplazamiento no puede ser negativo.' })
    desplazamiento?: number = CriteriosPaginacion.DESPLAZAMIENTO_PREDETERMINADO;

    aCriterios(): CriteriosPaginacion {
        return CriteriosPaginacion.crear({
            limite: this.limite,
            desplazamiento: this.desplazamiento,
        });
    }
}
