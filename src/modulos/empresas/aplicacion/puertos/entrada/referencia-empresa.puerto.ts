import { EstadoEmpresa } from '../../../dominio/enumeraciones/estado-empresa';

export interface ReferenciaEmpresa {
  id: string;
  alias: string;
  estado: EstadoEmpresa;
}

/**
 * EMP-DEP-003 — Puerto público de Aplicación para que otros módulos
 * (como Identidad y Acceso) resuelvan o validen una Empresa sin acoplarse
 * a la base de datos o casos de uso HTTP de EMP.
 */
export interface PuertoReferenciaEmpresa {
  obtenerPorId(id: string): Promise<ReferenciaEmpresa | null>;
  obtenerPorAlias(alias: string): Promise<ReferenciaEmpresa | null>;
}
