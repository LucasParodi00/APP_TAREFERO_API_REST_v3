import { VerificadorEmpleado } from '../../aplicacion/puertos/verificador-empleado.puerto';

export class VerificadorEmpleadoProvisional implements VerificadorEmpleado {
    private readonly empleadosActivosPorEmpresa = new Map<string, Set<string>>();

    constructor(private readonly modoPermisivo = false) {}

    registrarEmpleadoActivo(empresaId: string, empleadoId: string): void {
        let empleados = this.empleadosActivosPorEmpresa.get(empresaId);
        if (!empleados) {
            empleados = new Set<string>();
            this.empleadosActivosPorEmpresa.set(empresaId, empleados);
        }
        empleados.add(empleadoId);
    }

    verificarEmpleadoActivo(empresaId: string, empleadoId: string): Promise<boolean> {
        if (this.modoPermisivo) {
            return Promise.resolve(Boolean(empresaId && empleadoId));
        }

        const empleados = this.empleadosActivosPorEmpresa.get(empresaId);
        if (!empleados) {
            return Promise.resolve(false);
        }

        return Promise.resolve(empleados.has(empleadoId));
    }
}
