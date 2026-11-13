import { IdentificadorUuid } from '../../../../comun/dominio';
import { Indisponibilidad } from '../agregados/indisponibilidad';

export const REPOSITORIO_INDISPONIBILIDADES = Symbol('REPOSITORIO_INDISPONIBILIDADES');

export interface RepositorioIndisponibilidades {
    guardar(indisponibilidad: Indisponibilidad): Promise<void>;
    buscarPorId(empresaId: IdentificadorUuid, id: IdentificadorUuid): Promise<Indisponibilidad | null>;
}
