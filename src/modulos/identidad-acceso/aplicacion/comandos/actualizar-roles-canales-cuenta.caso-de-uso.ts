import { RepositorioCuentasEmpresa } from '../../dominio/repositorios/repositorio-cuentas-empresa';
import { ContextoSolicitud } from '../puertos/contexto-solicitud';
import { CuentaEmpresaLectura } from '../puertos/consulta-cuentas-empresa.puerto';
import { RolCodigo } from '../../dominio/enumeraciones/rol-codigo.enum';
import { MapeadorCuentaLectura } from '../mapeadores/mapeador-cuenta-lectura';
import { AccesoDenegado, CuentaNoEncontrada, ConflictoVersionOptimista } from '../errores/errores-aplicacion';
import { EmpresaFueraDeAlcance } from '../../dominio/errores/errores-identidad-acceso';

export interface ComandoActualizarRolesCanalesCuenta {
    empresaId: string;
    cuentaId: string;
    accesoWeb: boolean;
    accesoMovil: boolean;
    roles: RolCodigo[];
    versionEsperada: number;
}

export class ActualizarRolesCanalesCuenta {
    constructor(private readonly repoCuentas: RepositorioCuentasEmpresa) {}

    async ejecutar(comando: ComandoActualizarRolesCanalesCuenta, contexto: ContextoSolicitud): Promise<CuentaEmpresaLectura> {
        if (!contexto.permisos.includes('ACC-UC-010')) {
            throw new AccesoDenegado('No tiene permisos para modificar roles y canales de la cuenta.');
        }

        if (contexto.empresaId !== comando.empresaId) {
            throw new EmpresaFueraDeAlcance('La Empresa de la cuenta no coincide con el contexto autorizado.');
        }

        const cuenta = await this.repoCuentas.buscarPorId(comando.cuentaId, comando.empresaId);
        if (!cuenta) {
            throw new CuentaNoEncontrada();
        }

        if (cuenta.version !== comando.versionEsperada) {
            throw new ConflictoVersionOptimista();
        }

        cuenta.actualizarCanalesYRoles(comando.accesoWeb, comando.accesoMovil, comando.roles);

        await this.repoCuentas.guardar(cuenta);

        return MapeadorCuentaLectura.aLectura(cuenta);
    }
}
