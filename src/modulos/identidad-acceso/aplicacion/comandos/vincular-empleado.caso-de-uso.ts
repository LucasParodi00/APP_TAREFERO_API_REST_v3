import { RepositorioCuentasEmpresa } from '../../dominio/repositorios/repositorio-cuentas-empresa';
import { VerificadorEmpleado } from '../puertos/verificador-empleado.puerto';
import { ContextoSolicitud } from '../puertos/contexto-solicitud';
import { CuentaEmpresaLectura } from '../puertos/consulta-cuentas-empresa.puerto';
import { MapeadorCuentaLectura } from '../mapeadores/mapeador-cuenta-lectura';
import { AccesoDenegado, CuentaNoEncontrada, EmpleadoNoDisponible } from '../errores/errores-aplicacion';
import { EmpresaFueraDeAlcance, CuentaEmpleadoDuplicada } from '../../dominio/errores/errores-identidad-acceso';

export interface ComandoVincularEmpleado {
    empresaId: string;
    cuentaId: string;
    empleadoId: string;
}

export class VincularEmpleado {
    constructor(
        private readonly repoCuentas: RepositorioCuentasEmpresa,
        private readonly verificadorEmpleado: VerificadorEmpleado,
    ) {}

    async ejecutar(comando: ComandoVincularEmpleado, contexto: ContextoSolicitud): Promise<CuentaEmpresaLectura> {
        if (!contexto.permisos.includes('ACC-UC-012')) {
            throw new AccesoDenegado('No tiene permisos para vincular Cuentas con Empleados.');
        }

        if (contexto.empresaId !== comando.empresaId) {
            throw new EmpresaFueraDeAlcance('La Empresa de la cuenta no coincide con el contexto autorizado.');
        }

        const cuenta = await this.repoCuentas.buscarPorId(comando.cuentaId, comando.empresaId);
        if (!cuenta) {
            throw new CuentaNoEncontrada();
        }

        const empleadoValido = await this.verificadorEmpleado.verificarEmpleadoActivo(comando.empresaId, comando.empleadoId);
        if (!empleadoValido) {
            throw new EmpleadoNoDisponible('El Empleado no está activo o no pertenece a la Empresa.');
        }

        const cuentaExistente = await this.repoCuentas.buscarPorEmpleadoId(comando.empleadoId, comando.empresaId);
        if (cuentaExistente && cuentaExistente.id !== cuenta.id) {
            throw new CuentaEmpleadoDuplicada(comando.empleadoId);
        }

        cuenta.vincularEmpleado(comando.empleadoId, comando.empresaId);

        await this.repoCuentas.guardar(cuenta);

        return MapeadorCuentaLectura.aLectura(cuenta);
    }
}
