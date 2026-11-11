import { randomUUID } from 'crypto';
import { RepositorioCuentasEmpresa } from '../../dominio/repositorios/repositorio-cuentas-empresa';
import { RepositorioSesiones } from '../../dominio/repositorios/repositorio-sesiones';
import { ResolvedorEmpresa } from '../puertos/resolvedor-empresa.puerto';
import { ServicioHash } from '../puertos/servicio-hash.puerto';
import { GeneradorTokens } from '../puertos/generador-tokens.puerto';
import { Reloj } from '../puertos/reloj.puerto';
import { CanalAcceso } from '../../dominio/enumeraciones/canal-acceso.enum';
import { CorreoAcceso } from '../../dominio/objetos-valor/correo-acceso.vo';
import { SesionEmpresa } from '../../dominio/entidades/sesion-empresa.entidad';
import { CredencialesInvalidas, CanalNoPermitido, CuentaSuspendida } from '../../dominio/errores/errores-identidad-acceso';

export interface ComandoIniciarSesion {
    aliasEmpresa: string;
    correoAcceso: string;
    contrasenia: string;
    canal: CanalAcceso;
    dispositivoId?: string;
}

export interface RespuestaLoginAplicacion {
    tokenAcceso: string;
    tokenRenovacion: string;
    sesionId: string;
    tipoToken: string;
    expiraEn: number;
}

export class IniciarSesion {
    constructor(
        private readonly repoCuentas: RepositorioCuentasEmpresa,
        private readonly repoSesiones: RepositorioSesiones,
        private readonly resolvedorEmpresa: ResolvedorEmpresa,
        private readonly servicioHash: ServicioHash,
        private readonly generadorTokens: GeneradorTokens,
        private readonly reloj: Reloj,
    ) {}

    async ejecutar(comando: ComandoIniciarSesion): Promise<RespuestaLoginAplicacion> {
        const empresa = await this.resolvedorEmpresa.buscarPorAlias(comando.aliasEmpresa);
        if (!empresa || empresa.estado !== 'ACTIVA') {
            throw new CredencialesInvalidas();
        }

        const correoVo = CorreoAcceso.crear(comando.correoAcceso);
        const cuenta = await this.repoCuentas.buscarPorCorreo(correoVo, empresa.id);
        if (!cuenta) {
            throw new CredencialesInvalidas();
        }

        if (!cuenta.tieneCanal(comando.canal)) {
            throw new CanalNoPermitido('La cuenta no tiene habilitado el canal solicitado.');
        }

        if (!cuenta.estaActiva()) {
            throw new CuentaSuspendida();
        }

        const contraseniaValida = await this.servicioHash.verificarContrasenia(comando.contrasenia, cuenta.credencialHash);
        if (!contraseniaValida) {
            throw new CredencialesInvalidas();
        }

        const ahora = this.reloj.ahora();
        const venceEn = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);
        const sesionId = randomUUID();
        const familiaId = randomUUID();
        const tokenRenovacion = this.generadorTokens.generarTokenRenovacion();
        const hashRefresh = this.servicioHash.hashearRefresh(tokenRenovacion);

        const sesion = SesionEmpresa.crear({
            id: sesionId,
            cuentaEmpresaId: cuenta.id,
            empresaId: empresa.id,
            canal: comando.canal,
            creadaEn: ahora,
            venceEn: venceEn,
            hashTokenRenovacion: hashRefresh,
            familiaId: familiaId,
            dispositivoId: comando.dispositivoId,
        });

        await this.repoSesiones.guardar(sesion);

        const tokenAcceso = await this.generadorTokens.generarTokenAccesoTenant({
            sub: cuenta.id,
            empresaId: empresa.id,
            sesionId: sesionId,
            rol: cuenta.roles[0],
            roles: cuenta.roles,
            canal: comando.canal,
        });

        return {
            tokenAcceso,
            tokenRenovacion,
            sesionId,
            tipoToken: 'Bearer',
            expiraEn: 900,
        };
    }
}
