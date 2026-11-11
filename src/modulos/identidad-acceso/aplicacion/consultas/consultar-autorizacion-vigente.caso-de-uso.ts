import { RepositorioCuentasEmpresa } from '../../dominio/repositorios/repositorio-cuentas-empresa';
import { RepositorioSesiones } from '../../dominio/repositorios/repositorio-sesiones';
import { ResolvedorEmpresa } from '../puertos/resolvedor-empresa.puerto';
import { Reloj } from '../puertos/reloj.puerto';
import { ContextoSolicitud } from '../puertos/contexto-solicitud';
import { RolCodigo } from '../../dominio/enumeraciones/rol-codigo.enum';
import { CanalAcceso } from '../../dominio/enumeraciones/canal-acceso.enum';
import { AccesoDenegado, EmpresaNoHabilitada } from '../errores/errores-aplicacion';
import { CuentaSuspendida } from '../../dominio/errores/errores-identidad-acceso';

export interface RespuestaAutorizacionVigente {
    actorId: string;
    empresaId: string;
    empleadoId?: string;
    roles: RolCodigo[];
    permisos: string[];
    canal: CanalAcceso;
}

export class ConsultarAutorizacionVigente {
    constructor(
        private readonly repoCuentas: RepositorioCuentasEmpresa,
        private readonly repoSesiones: RepositorioSesiones,
        private readonly resolvedorEmpresa: ResolvedorEmpresa,
        private readonly reloj: Reloj,
    ) {}

    async ejecutar(contexto: ContextoSolicitud): Promise<RespuestaAutorizacionVigente> {
        if (!contexto.sesionId || !contexto.empresaId) {
            throw new AccesoDenegado('Contexto de autenticación requerido.');
        }

        const sesion = await this.repoSesiones.buscarPorId(contexto.sesionId);
        if (!sesion || !sesion.estaVigente(this.reloj.ahora())) {
            throw new AccesoDenegado('La sesión no es válida o ha expirado.');
        }

        const empresa = await this.resolvedorEmpresa.buscarPorId(contexto.empresaId);
        if (!empresa || empresa.estado !== 'ACTIVA') {
            throw new EmpresaNoHabilitada('La Empresa debe encontrarse ACTIVA.');
        }

        const cuenta = await this.repoCuentas.buscarPorId(contexto.actorId, contexto.empresaId);
        if (!cuenta) {
            throw new AccesoDenegado('La cuenta no existe.');
        }

        if (!cuenta.estaActiva()) {
            throw new CuentaSuspendida('La cuenta se encuentra suspendida.');
        }

        return {
            actorId: cuenta.id,
            empresaId: cuenta.empresaId,
            empleadoId: cuenta.empleadoId,
            roles: cuenta.roles,
            permisos: contexto.permisos,
            canal: sesion.canal,
        };
    }
}
