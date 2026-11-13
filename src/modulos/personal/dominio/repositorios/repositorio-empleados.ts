import { IdentificadorUuid } from '../../../../comun/dominio';
import { TipoDocumento } from '../enumeraciones';
import { Empleado } from '../agregados/empleado';

export const REPOSITORIO_EMPLEADOS = Symbol('REPOSITORIO_EMPLEADOS');

export interface RepositorioEmpleados {
    guardar(empleado: Empleado): Promise<void>;
    buscarPorId(empresaId: IdentificadorUuid, id: IdentificadorUuid): Promise<Empleado | null>;
    buscarPorDocumento(empresaId: IdentificadorUuid, tipo: TipoDocumento, numero: string): Promise<Empleado | null>;
    contarActivos(empresaId: IdentificadorUuid): Promise<number>;
}
