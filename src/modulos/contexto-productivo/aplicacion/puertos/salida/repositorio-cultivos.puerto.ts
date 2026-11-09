import { Cultivo } from '../../../dominio/entidades/cultivo';
import { EstadoCultivo } from '../../../dominio/enumeraciones/estado-cultivo';

export interface OpcionesListadoCultivos {
  limite: number;
  desplazamiento: number;
  estado?: EstadoCultivo;
  ordenCampo?: 'codigo' | 'nombre' | 'fechaCreacion';
  ordenDireccion?: 'ASC' | 'DESC';
}

export interface ResultadoListadoCultivos {
  datos: Cultivo[];
  total: number;
}

export const REPOSITORIO_CULTIVOS = Symbol('REPOSITORIO_CULTIVOS');

export interface RepositorioCultivos {
  guardar(cultivo: Cultivo): Promise<void>;
  buscarPorId(id: string): Promise<Cultivo | null>;
  buscarPorCodigo(codigo: string): Promise<Cultivo | null>;
  buscarPorNombreNormalizado(
    nombreNormalizado: string,
  ): Promise<Cultivo | null>;
  listar(opciones: OpcionesListadoCultivos): Promise<ResultadoListadoCultivos>;
}
