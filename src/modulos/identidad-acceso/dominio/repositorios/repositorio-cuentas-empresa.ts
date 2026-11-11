import { CuentaEmpresa } from '../entidades/cuenta-empresa.entidad';
import { CorreoAcceso } from '../objetos-valor/correo-acceso.vo';

export const REPOSITORIO_CUENTAS_EMPRESA = Symbol('REPOSITORIO_CUENTAS_EMPRESA');

export interface RepositorioCuentasEmpresa {
    guardar(cuenta: CuentaEmpresa): Promise<void>;
    buscarPorId(id: string, empresaId: string): Promise<CuentaEmpresa | null>;
    buscarPorCorreo(correo: CorreoAcceso, empresaId: string): Promise<CuentaEmpresa | null>;
    buscarPorEmpleadoId(empleadoId: string, empresaId: string): Promise<CuentaEmpresa | null>;
    contarActivasPorEmpresa(empresaId: string): Promise<number>;
}
