import { RepositorioCuentasEmpresa } from '../../dominio/repositorios/repositorio-cuentas-empresa';
import { RepositorioSesiones } from '../../dominio/repositorios/repositorio-sesiones';
import { ServicioHash } from '../puertos/servicio-hash.puerto';
import { Reloj } from '../puertos/reloj.puerto';
import { ContextoSolicitud } from '../puertos/contexto-solicitud';
import { ContraseniaPlana } from '../../dominio/objetos-valor/contrasenia-plana.vo';
import { EmpresaFueraDeAlcance } from '../../dominio/errores/errores-identidad-acceso';
import { AccesoDenegado, CuentaNoEncontrada } from '../errores/errores-aplicacion';

export interface ComandoRestablecerContrasenia {
    empresaId: string;
    cuentaId: string;
    contraseniaNueva: string;
}

export class RestablecerContrasenia {
    constructor(
        private readonly repoCuentas: RepositorioCuentasEmpresa,
        private readonly repoSesiones: RepositorioSesiones,
        private readonly servicioHash: ServicioHash,
        private readonly reloj: Reloj,
    ) {}

    async ejecutar(comando: ComandoRestablecerContrasenia, contexto: ContextoSolicitud): Promise<{ mensaje: string }> {
        if (!contexto.permisos.includes('ACC-UC-005')) {
            throw new AccesoDenegado('No tiene permisos para restablecer contraseñas.');
        }

        const empresaValida =
            contexto.empresaId === comando.empresaId ||
            (contexto.soporte && contexto.soporte.venceEn > new Date() && contexto.empresaId === comando.empresaId);

        if (!empresaValida) {
            throw new EmpresaFueraDeAlcance('La Empresa de la cuenta no coincide con el contexto autorizado.');
        }

        const cuenta = await this.repoCuentas.buscarPorId(comando.cuentaId, comando.empresaId);
        if (!cuenta) {
            throw new CuentaNoEncontrada();
        }

        const nuevaVo = ContraseniaPlana.crear(comando.contraseniaNueva);
        const nuevoHash = await this.servicioHash.hashearContrasenia(nuevaVo);

        cuenta.actualizarCredencial(nuevoHash);
        await this.repoCuentas.guardar(cuenta);

        await this.repoSesiones.revocarTodasDeCuenta(cuenta.id, this.reloj.ahora());

        return { mensaje: 'Contraseña restablecida exitosamente.' };
    }
}
