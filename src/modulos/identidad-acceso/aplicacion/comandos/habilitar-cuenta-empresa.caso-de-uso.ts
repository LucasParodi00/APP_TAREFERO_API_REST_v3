import { RepositorioCuentasEmpresa } from '../../dominio/repositorios/repositorio-cuentas-empresa';
import { ResolvedorEmpresa } from '../puertos/resolvedor-empresa.puerto';
import { VerificadorCupoAcceso } from '../puertos/verificador-cupo-acceso.puerto';
import { VerificadorEmpleado } from '../puertos/verificador-empleado.puerto';
import { ServicioHash } from '../puertos/servicio-hash.puerto';
import { ContextoSolicitud } from '../puertos/contexto-solicitud';
import { CuentaEmpresaLectura } from '../puertos/consulta-cuentas-empresa.puerto';
import { CuentaEmpresa } from '../../dominio/entidades/cuenta-empresa.entidad';
import { CorreoAcceso } from '../../dominio/objetos-valor/correo-acceso.vo';
import { ContraseniaPlana } from '../../dominio/objetos-valor/contrasenia-plana.vo';
import { NombreMostrado } from '../../dominio/objetos-valor/nombre-mostrado.vo';
import { RolCodigo } from '../../dominio/enumeraciones/rol-codigo.enum';
import { MapeadorCuentaLectura } from '../mapeadores/mapeador-cuenta-lectura';
import { AccesoDenegado, EmpresaNoHabilitada, EmpleadoNoDisponible } from '../errores/errores-aplicacion';
import {
    CorreoDuplicado,
    EmpresaFueraDeAlcance,
    LimiteAccesosAlcanzado,
    CuentaEmpleadoDuplicada,
} from '../../dominio/errores/errores-identidad-acceso';

export interface ComandoHabilitarCuentaEmpresa {
    id: string;
    empresaId: string;
    correoAcceso: string;
    contrasenia: string;
    accesoWeb: boolean;
    accesoMovil: boolean;
    roles: RolCodigo[];
    empleadoId?: string;
    nombreMostrado?: string;
}

export class HabilitarCuentaEmpresa {
    constructor(
        private readonly repoCuentas: RepositorioCuentasEmpresa,
        private readonly resolvedorEmpresa: ResolvedorEmpresa,
        private readonly verificadorCupo: VerificadorCupoAcceso,
        private readonly verificadorEmpleado: VerificadorEmpleado,
        private readonly servicioHash: ServicioHash,
    ) {}

    async ejecutar(comando: ComandoHabilitarCuentaEmpresa, contexto: ContextoSolicitud): Promise<CuentaEmpresaLectura> {
        if (!contexto.permisos.includes('ACC-UC-001')) {
            throw new AccesoDenegado('No tiene permisos para habilitar Cuentas de Empresa.');
        }

        const empresaValida =
            contexto.empresaId === comando.empresaId ||
            (contexto.soporte && contexto.soporte.venceEn > new Date() && contexto.empresaId === comando.empresaId);

        if (!empresaValida) {
            throw new EmpresaFueraDeAlcance('La Empresa de la cuenta no coincide con el contexto autorizado.');
        }

        const empresa = await this.resolvedorEmpresa.buscarPorId(comando.empresaId);
        if (!empresa || empresa.estado !== 'ACTIVA') {
            throw new EmpresaNoHabilitada('La Empresa debe existir y encontrarse ACTIVA.');
        }

        const cupoDisponible = await this.verificadorCupo.verificarCupoDisponible(comando.empresaId);
        if (!cupoDisponible) {
            throw new LimiteAccesosAlcanzado();
        }

        if (comando.empleadoId) {
            const empleadoValido = await this.verificadorEmpleado.verificarEmpleadoActivo(comando.empresaId, comando.empleadoId);
            if (!empleadoValido) {
                throw new EmpleadoNoDisponible('El Empleado no está activo o no pertenece a la Empresa.');
            }

            const cuentaConEmpleado = await this.repoCuentas.buscarPorEmpleadoId(comando.empleadoId, comando.empresaId);
            if (cuentaConEmpleado) {
                throw new CuentaEmpleadoDuplicada(comando.empleadoId);
            }
        }

        const correoVo = CorreoAcceso.crear(comando.correoAcceso);
        const cuentaConCorreo = await this.repoCuentas.buscarPorCorreo(correoVo, comando.empresaId);
        if (cuentaConCorreo) {
            throw new CorreoDuplicado(correoVo.valor);
        }

        const contraseniaVo = ContraseniaPlana.crear(comando.contrasenia);
        const hash = await this.servicioHash.hashearContrasenia(contraseniaVo);

        const cuenta = CuentaEmpresa.crear({
            id: comando.id,
            empresaId: comando.empresaId,
            empleadoId: comando.empleadoId,
            nombreMostrado: NombreMostrado.crear(comando.nombreMostrado),
            correoAcceso: correoVo,
            credencialHash: hash,
            accesoWeb: comando.accesoWeb,
            accesoMovil: comando.accesoMovil,
            roles: comando.roles,
        });

        await this.repoCuentas.guardar(cuenta);

        return MapeadorCuentaLectura.aLectura(cuenta);
    }
}
