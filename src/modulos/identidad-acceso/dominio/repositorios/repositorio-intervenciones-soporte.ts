import { IntervencionSoporte } from '../entidades/intervencion-soporte.entidad';

export const REPOSITORIO_INTERVENCIONES_SOPORTE = Symbol('REPOSITORIO_INTERVENCIONES_SOPORTE');

export interface RepositorioIntervencionesSoporte {
    guardar(intervencion: IntervencionSoporte): Promise<void>;
    buscarPorId(id: string): Promise<IntervencionSoporte | null>;
}
