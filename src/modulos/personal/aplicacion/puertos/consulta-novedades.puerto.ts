import { RestriccionOperativaLectura, IndisponibilidadLectura } from '../modelos-lectura';

export const CONSULTA_NOVEDADES = Symbol('CONSULTA_NOVEDADES');

export interface ConsultaNovedades {
    listarRestriccionesPorEmpleado(empresaId: string, empleadoId: string): Promise<RestriccionOperativaLectura[]>;
    buscarRestriccionPorId(empresaId: string, id: string): Promise<RestriccionOperativaLectura | null>;
    listarIndisponibilidadesPorEmpleado(empresaId: string, empleadoId: string): Promise<IndisponibilidadLectura[]>;
    buscarIndisponibilidadPorId(empresaId: string, id: string): Promise<IndisponibilidadLectura | null>;
}
