import { RepositorioCuentasEmpresa } from '../../dominio/repositorios/repositorio-cuentas-empresa';
import { RepositorioSesiones } from '../../dominio/repositorios/repositorio-sesiones';
import { VerificadorCupoAcceso } from '../puertos/verificador-cupo-acceso.puerto';
import { Reloj } from '../puertos/reloj.puerto';
import { ContextoSolicitud } from '../puertos/contexto-solicitud';
import { CuentaEmpresaLectura } from '../puertos/consulta-cuentas-empresa.puerto';
import { EstadoCuenta } from '../../dominio/enumeraciones/estado-cuenta.enum';
import { MapeadorCuentaLectura } from '../mapeadores/mapeador-cuenta-lectura';
import { AccesoDenegado, CuentaNoEncontrada, ConflictoVersionOptimista } from '../errores/errores-aplicacion';
import { EmpresaFueraDeAlcance, LimiteAccesosAlcanzado } from '../../dominio/errores/errores-identidad-acceso';

export interface ComandoCambiarEstadoCuenta {
    empresaId: string;
    cuentaId: string;
    nuevoEstado: EstadoCuenta;
    versionEsperada: number;
}

export class CambiarEstadoCuenta {
    constructor(
        private readonly repoCuentas: RepositorioCuentasEmpresa,
        private readonly repoSesiones: RepositorioSesiones,
        private readonly verificadorCupo: VerificadorCupoAcceso,
        private readonly reloj: Reloj,
    ) {}

    async ejecutar(comando: ComandoCambiarEstadoCuenta, contexto: ContextoSolicitud): Promise<CuentaEmpresaLectura> {
        if (!contexto.permisos.includes('ACC-UC-010')) {
            throw new AccesoDenegado('No tiene permisos para modificar el estado de la cuenta.');
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

        if (comando.nuevoEstado === EstadoCuenta.ACTIVA) {
            const cupoDisponible = await this.verificadorCupo.verificarCupoDisponible(comando.empresaId);
            if (!cupoDisponible) {
                throw new LimiteAccesosAlcanzado();
            }
            cuenta.reactivar();
        } else if (comando.nuevoEstado === EstadoCuenta.SUSPENDIDA) {
            cuenta.suspender();
            await this.repoSesiones.revocarTodasDeCuenta(cuenta.id, this.reloj.ahora());
        }

        await this.repoCuentas.guardar(cuenta);

        return MapeadorCuentaLectura.aLectura(cuenta);
    }
}
