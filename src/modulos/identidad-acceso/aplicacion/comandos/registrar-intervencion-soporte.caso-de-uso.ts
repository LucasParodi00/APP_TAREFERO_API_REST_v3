import { randomUUID } from 'crypto';
import { RepositorioIntervencionesSoporte } from '../../dominio/repositorios/repositorio-intervenciones-soporte';
import { ResolvedorEmpresa } from '../puertos/resolvedor-empresa.puerto';
import { Reloj } from '../puertos/reloj.puerto';
import { ContextoSolicitud } from '../puertos/contexto-solicitud';
import { IntervencionSoporteLectura } from '../puertos/consulta-intervenciones-soporte.puerto';
import { IntervencionSoporte } from '../../dominio/entidades/intervencion-soporte.entidad';
import { MotivoSoporte } from '../../dominio/objetos-valor/motivo-soporte.vo';
import { AccesoDenegado, EmpresaNoHabilitada } from '../errores/errores-aplicacion';

export interface ComandoRegistrarIntervencionSoporte {
    empresaId: string;
    motivo: string;
    solicitudId: string;
}

export class RegistrarIntervencionSoporte {
    constructor(
        private readonly repoIntervenciones: RepositorioIntervencionesSoporte,
        private readonly resolvedorEmpresa: ResolvedorEmpresa,
        private readonly reloj: Reloj,
    ) {}

    async ejecutar(
        comando: ComandoRegistrarIntervencionSoporte,
        contexto: ContextoSolicitud,
    ): Promise<IntervencionSoporteLectura> {
        if (contexto.rol !== 'SUPER_ADMINISTRADOR' || !contexto.permisos.includes('ACC-UC-007') || !contexto.sesionId) {
            throw new AccesoDenegado('Solo un SuperAdministrador autenticado puede registrar intervenciones.');
        }

        const empresa = await this.resolvedorEmpresa.buscarPorId(comando.empresaId);
        if (!empresa || empresa.estado !== 'ACTIVA') {
            throw new EmpresaNoHabilitada('La Empresa destino debe existir y estar ACTIVA.');
        }

        const motivoVo = MotivoSoporte.crear(comando.motivo);
        const ocurridaEn = this.reloj.ahora();
        const venceEn = new Date(ocurridaEn.getTime() + 15 * 60 * 1000);
        const id = randomUUID();

        const intervencion = IntervencionSoporte.crear({
            id,
            usuarioPlataformaId: contexto.actorId,
            empresaId: comando.empresaId,
            motivo: motivoVo,
            sesionId: contexto.sesionId,
            solicitudId: comando.solicitudId,
            ocurridaEn,
            venceEn,
        });

        await this.repoIntervenciones.guardar(intervencion);

        return {
            id: intervencion.id,
            usuarioPlataformaId: intervencion.usuarioPlataformaId,
            empresaId: intervencion.empresaId,
            motivo: intervencion.motivo.valor,
            ocurridaEn: intervencion.ocurridaEn,
            venceEn: intervencion.venceEn,
        };
    }
}
