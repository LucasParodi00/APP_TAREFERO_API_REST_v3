import { RepositorioCuentasEmpresa } from '../../dominio/repositorios/repositorio-cuentas-empresa';
import { RepositorioSesiones } from '../../dominio/repositorios/repositorio-sesiones';
import { ServicioHash } from '../puertos/servicio-hash.puerto';
import { Reloj } from '../puertos/reloj.puerto';
import { ContextoSolicitud } from '../puertos/contexto-solicitud';
import { ContraseniaPlana } from '../../dominio/objetos-valor/contrasenia-plana.vo';
import { CredencialesInvalidas } from '../../dominio/errores/errores-identidad-acceso';
import { AccesoDenegado, CuentaNoEncontrada } from '../errores/errores-aplicacion';

export interface ComandoCambiarContrasenia {
    contraseniaActual: string;
    contraseniaNueva: string;
}

export class CambiarContrasenia {
    constructor(
        private readonly repoCuentas: RepositorioCuentasEmpresa,
        private readonly repoSesiones: RepositorioSesiones,
        private readonly servicioHash: ServicioHash,
        private readonly reloj: Reloj,
    ) {}

    async ejecutar(comando: ComandoCambiarContrasenia, contexto: ContextoSolicitud): Promise<{ mensaje: string }> {
        if (!contexto.permisos.includes('ACC-UC-004')) {
            throw new AccesoDenegado('No tiene permisos para cambiar su contraseña.');
        }

        if (!contexto.empresaId || !contexto.actorId) {
            throw new AccesoDenegado('Contexto de autenticación inválido.');
        }

        const cuenta = await this.repoCuentas.buscarPorId(contexto.actorId, contexto.empresaId);
        if (!cuenta) {
            throw new CuentaNoEncontrada();
        }

        const coincide = await this.servicioHash.verificarContrasenia(comando.contraseniaActual, cuenta.credencialHash);
        if (!coincide) {
            throw new CredencialesInvalidas();
        }

        const nuevaVo = ContraseniaPlana.crear(comando.contraseniaNueva);
        const nuevoHash = await this.servicioHash.hashearContrasenia(nuevaVo);

        cuenta.actualizarCredencial(nuevoHash);
        await this.repoCuentas.guardar(cuenta);

        await this.repoSesiones.revocarTodasDeCuenta(cuenta.id, this.reloj.ahora());

        return { mensaje: 'Contraseña modificada exitosamente.' };
    }
}
