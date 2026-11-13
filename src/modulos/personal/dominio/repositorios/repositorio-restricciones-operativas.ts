import { IdentificadorUuid } from '../../../../comun/dominio';
import { RestriccionOperativa } from '../agregados/restriccion-operativa';

export const REPOSITORIO_RESTRICCIONES_OPERATIVAS = Symbol('REPOSITORIO_RESTRICCIONES_OPERATIVAS');

export interface RepositorioRestriccionesOperativas {
    guardar(restriccion: RestriccionOperativa): Promise<void>;
    buscarPorId(empresaId: IdentificadorUuid, id: IdentificadorUuid): Promise<RestriccionOperativa | null>;
}
