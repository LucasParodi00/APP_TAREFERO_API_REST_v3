import { IdentificadorUuid } from '../../../../comun/dominio';
import { ErrorDatoPersonalInvalido } from '../errores';

export interface PropiedadesContactoEmergencia {
    id: IdentificadorUuid;
    empresaId: IdentificadorUuid;
    empleadoId: IdentificadorUuid;
    nombre: string;
    vinculo: string;
    telefono: string;
}

export class ContactoEmergencia {
    readonly id: IdentificadorUuid;
    readonly empresaId: IdentificadorUuid;
    readonly empleadoId: IdentificadorUuid;
    readonly nombre: string;
    readonly vinculo: string;
    readonly telefono: string;

    constructor(props: PropiedadesContactoEmergencia) {
        if (!props.nombre || props.nombre.trim().length === 0 || props.nombre.trim().length > 150) {
            throw new ErrorDatoPersonalInvalido('El nombre del contacto de emergencia debe tener entre 1 y 150 caracteres.');
        }
        if (!props.vinculo || props.vinculo.trim().length === 0 || props.vinculo.trim().length > 150) {
            throw new ErrorDatoPersonalInvalido('El vínculo del contacto de emergencia debe tener entre 1 y 150 caracteres.');
        }
        if (!props.telefono || props.telefono.trim().length === 0 || props.telefono.trim().length > 30) {
            throw new ErrorDatoPersonalInvalido('El teléfono del contacto de emergencia debe tener entre 1 y 30 caracteres.');
        }

        this.id = props.id;
        this.empresaId = props.empresaId;
        this.empleadoId = props.empleadoId;
        this.nombre = props.nombre.trim();
        this.vinculo = props.vinculo.trim();
        this.telefono = props.telefono.trim();
    }
}
