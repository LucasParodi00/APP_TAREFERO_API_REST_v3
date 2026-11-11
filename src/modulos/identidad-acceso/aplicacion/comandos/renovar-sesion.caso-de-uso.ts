import { RepositorioSesiones } from '../../dominio/repositorios/repositorio-sesiones';
import { RepositorioCuentasEmpresa } from '../../dominio/repositorios/repositorio-cuentas-empresa';
import { ResolvedorEmpresa } from '../puertos/resolvedor-empresa.puerto';
import { ServicioHash } from '../puertos/servicio-hash.puerto';
import { GeneradorTokens } from '../puertos/generador-tokens.puerto';
import { Reloj } from '../puertos/reloj.puerto';
import { RespuestaLoginAplicacion } from './iniciar-sesion.caso-de-uso';
import { CredencialesInvalidas, CuentaSuspendida } from '../../dominio/errores/errores-identidad-acceso';
import { EmpresaNoHabilitada } from '../errores/errores-aplicacion';

export interface ComandoRenovarSesion {
    tokenRenovacion: string;
}

export class RenovarSesion {
    constructor(
        private readonly repoSesiones: RepositorioSesiones,
        private readonly repoCuentas: RepositorioCuentasEmpresa,
        private readonly resolvedorEmpresa: ResolvedorEmpresa,
        private readonly servicioHash: ServicioHash,
        private readonly generadorTokens: GeneradorTokens,
        private readonly reloj: Reloj,
    ) {}

    async ejecutar(comando: ComandoRenovarSesion): Promise<RespuestaLoginAplicacion> {
        const hashRefresh = this.servicioHash.hashearRefresh(comando.tokenRenovacion);
        const sesion = await this.repoSesiones.buscarPorHashTokenRenovacion(hashRefresh);

        if (!sesion) {
            throw new CredencialesInvalidas();
        }

        const ahora = this.reloj.ahora();
        if (!sesion.estaVigente(ahora)) {
            await this.repoSesiones.revocarFamilia(sesion.familiaId, ahora);
            throw new CredencialesInvalidas();
        }

        const empresa = await this.resolvedorEmpresa.buscarPorId(sesion.empresaId);
        if (!empresa || empresa.estado !== 'ACTIVA') {
            throw new EmpresaNoHabilitada('La Empresa debe encontrarse ACTIVA.');
        }

        const cuenta = await this.repoCuentas.buscarPorId(sesion.cuentaEmpresaId, sesion.empresaId);
        if (!cuenta || !cuenta.estaActiva()) {
            throw new CuentaSuspendida('La cuenta se encuentra inactiva o suspendida.');
        }

        const nuevoToken = this.generadorTokens.generarTokenRenovacion();
        const nuevoHash = this.servicioHash.hashearRefresh(nuevoToken);
        const nuevoVenceEn = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);

        sesion.rotarTokenRenovacion(nuevoHash, nuevoVenceEn);
        await this.repoSesiones.guardar(sesion);

        const tokenAcceso = await this.generadorTokens.generarTokenAccesoTenant({
            sub: cuenta.id,
            empresaId: empresa.id,
            sesionId: sesion.id,
            rol: cuenta.roles[0],
            roles: cuenta.roles,
            canal: sesion.canal,
        });

        return {
            tokenAcceso,
            tokenRenovacion: nuevoToken,
            sesionId: sesion.id,
            tipoToken: 'Bearer',
            expiraEn: 900,
        };
    }
}
