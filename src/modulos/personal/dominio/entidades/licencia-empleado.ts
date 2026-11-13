import { IdentificadorUuid, FechaCivil } from '../../../../comun/dominio';
import { ErrorDatoPersonalInvalido } from '../errores';

export interface PropiedadesLicenciaEmpleado {
    id: IdentificadorUuid;
    empresaId: IdentificadorUuid;
    empleadoId: IdentificadorUuid;
    tipo: string;
    numero?: string;
    emitidaEn?: FechaCivil;
    venceEn?: FechaCivil;
    archivoId?: IdentificadorUuid;
}

export class LicenciaEmpleado {
    readonly id: IdentificadorUuid;
    readonly empresaId: IdentificadorUuid;
    readonly empleadoId: IdentificadorUuid;
    readonly tipo: string;
    readonly numero?: string;
    readonly emitidaEn?: FechaCivil;
    readonly venceEn?: FechaCivil;
    readonly archivoId?: IdentificadorUuid;

    constructor(props: PropiedadesLicenciaEmpleado) {
        if (!props.tipo || props.tipo.trim().length === 0 || props.tipo.trim().length > 150) {
            throw new ErrorDatoPersonalInvalido('El tipo de licencia debe tener entre 1 y 150 caracteres.');
        }
        if (props.numero !== undefined && props.numero !== null && props.numero.trim().length > 150) {
            throw new ErrorDatoPersonalInvalido('El número de licencia no puede superar los 150 caracteres.');
        }
        if (props.emitidaEn && props.venceEn && props.venceEn.valor < props.emitidaEn.valor) {
            throw new ErrorDatoPersonalInvalido('La fecha de vencimiento de la licencia no puede ser anterior a la de emisión.');
        }

        this.id = props.id;
        this.empresaId = props.empresaId;
        this.empleadoId = props.empleadoId;
        this.tipo = props.tipo.trim();
        this.numero = props.numero?.trim();
        this.emitidaEn = props.emitidaEn;
        this.venceEn = props.venceEn;
        this.archivoId = props.archivoId;
    }
}
