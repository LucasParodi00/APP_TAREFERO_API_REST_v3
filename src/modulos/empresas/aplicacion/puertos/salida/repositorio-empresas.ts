import { Empresa } from '../../../dominio/entidades/empresa';
import { ConfiguracionGeneralEmpresa } from '../../../dominio/entidades/configuracion-general-empresa';
import { EstadoEmpresa } from '../../../dominio/enumeraciones/estado-empresa';

export interface CriteriosListadoEmpresas {
  estado?: EstadoEmpresa;
  nombre?: string;
  limite: number;
  desplazamiento: number;
  orden?: {
    campo: 'nombre' | 'creadoEn' | 'actualizadoEn';
    direccion: 'asc' | 'desc';
  };
}

export interface ResultadoPaginado<T> {
  datos: T[];
  paginacion: {
    limite: number;
    desplazamiento: number;
    total: number;
  };
}

export interface RepositorioEmpresas {
  guardar(empresa: Empresa): Promise<void>;
  buscarPorId(id: string): Promise<Empresa | null>;
  buscarPorAlias(alias: string): Promise<Empresa | null>;
  existeAlias(alias: string): Promise<boolean>;
  listar(
    criterios: CriteriosListadoEmpresas,
  ): Promise<ResultadoPaginado<Empresa>>;
  actualizar(empresa: Empresa): Promise<void>;
  actualizarConfiguracion(
    configuracion: ConfiguracionGeneralEmpresa,
  ): Promise<void>;
}
