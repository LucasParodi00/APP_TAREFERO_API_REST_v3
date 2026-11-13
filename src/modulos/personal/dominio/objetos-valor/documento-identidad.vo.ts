import { TipoDocumento } from '../enumeraciones';
import { ErrorEmpleadoInvalido } from '../errores';

export class DocumentoIdentidad {
    private constructor(
        readonly tipo: TipoDocumento,
        readonly numero: string,
        readonly detalleTipo?: string,
    ) {}

    static crear(tipo: TipoDocumento, numero: string, detalleTipo?: string): DocumentoIdentidad {
        if (!numero || typeof numero !== 'string') {
            throw new ErrorEmpleadoInvalido('El número de documento es obligatorio.');
        }

        const numeroNormalizado = numero.trim().toUpperCase();
        if (numeroNormalizado.length === 0) {
            throw new ErrorEmpleadoInvalido('El número de documento no puede ser vacío.');
        }

        if (numeroNormalizado.length > 50) {
            throw new ErrorEmpleadoInvalido('El número de documento no puede superar los 50 caracteres.');
        }

        let detalleNormalizado: string | undefined = undefined;

        if (tipo === TipoDocumento.OTRO) {
            if (!detalleTipo || typeof detalleTipo !== 'string' || detalleTipo.trim().length === 0) {
                throw new ErrorEmpleadoInvalido('Para tipo de documento OTRO, debe especificar el detalle.');
            }
            detalleNormalizado = detalleTipo.trim();
            if (detalleNormalizado.length > 150) {
                throw new ErrorEmpleadoInvalido('El detalle del tipo de documento no puede superar los 150 caracteres.');
            }
        } else if (detalleTipo !== undefined && detalleTipo !== null && detalleTipo.trim().length > 0) {
            throw new ErrorEmpleadoInvalido(`El detalle del tipo de documento solo se admite para tipo OTRO.`);
        }

        return new DocumentoIdentidad(tipo, numeroNormalizado, detalleNormalizado);
    }
}
