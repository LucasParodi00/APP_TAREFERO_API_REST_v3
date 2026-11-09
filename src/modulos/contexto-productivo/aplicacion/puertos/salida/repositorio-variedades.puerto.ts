import { Variedad } from '../../../dominio/entidades/variedad';
import { EstadoVariedad } from '../../../dominio/enumeraciones/estado-variedad';

export interface OpcionesListadoVariedades {
  limite: number;
  desplazamiento: number;
  estado?: EstadoVariedad;
  ordenCampo?: 'codigo' | 'nombre' | 'fechaCreacion';
  ordenDireccion?: 'ASC' | 'DESC';
}

export interface ResultadoListadoVariedades {
  datos: Variedad[];
  total: number;
}

export const REPOSITORIO_VARIEDADES = Symbol('REPOSITORIO_VARIEDADES');

export interface RepositorioVariedades {
  guardar(variedad: Variedad): Promise<void>;
  buscarPorId(cultivoId: string, id: string): Promise<Variedad | null>;
  buscarPorCodigo(cultivoId: string, codigo: string): Promise<Variedad | null>;
  buscarPorNombreNormalizado(
    cultivoId: string,
    nombreNormalizado: string,
  ): Promise<Variedad | null>;
  listar(
    cultivoId: string,
    opciones: OpcionesListadoVariedades,
  ): Promise<ResultadoListadoVariedades>;
}
