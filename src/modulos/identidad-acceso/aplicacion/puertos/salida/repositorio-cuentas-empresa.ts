import { CuentaEmpresa } from '../../../dominio/entidades/cuenta-empresa';

export interface CriteriosListadoCuentas {
  empresaId: string;
  limite: number;
  desplazamiento: number;
}

export interface ResultadoPaginado<T> {
  datos: T[];
  paginacion: {
    total: number;
    limite: number;
    desplazamiento: number;
  };
}

export interface RepositorioCuentasEmpresa {
  guardar(cuenta: CuentaEmpresa): Promise<void>;
  actualizar(cuenta: CuentaEmpresa): Promise<void>;
  buscarPorId(id: string): Promise<CuentaEmpresa | null>;
  buscarPorCorreo(
    empresaId: string,
    correoNormalizado: string,
  ): Promise<CuentaEmpresa | null>;
  buscarPorPersona(
    empresaId: string,
    personaId: string,
  ): Promise<CuentaEmpresa | null>;
  contarPorEmpresa(empresaId: string): Promise<number>;
  contarActivas(empresaId: string): Promise<number>;
  listar(
    criterios: CriteriosListadoCuentas,
  ): Promise<ResultadoPaginado<CuentaEmpresa>>;
}
