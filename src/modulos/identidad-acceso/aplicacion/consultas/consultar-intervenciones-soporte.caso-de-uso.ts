import { ErrorDominioIdentidadAcceso } from '../../dominio/errores/error-dominio-identidad-acceso';
import { RepositorioIntervencionesSoporte } from '../puertos/salida/repositorio-intervenciones-soporte';
import { VerificadorEmpresaPuerto } from '../puertos/salida/verificador-empresa.puerto';
import { ResolverContextoSoporte } from '../comandos/resolver-contexto-soporte.caso-de-uso';
import { ContextoActorAcc } from '../puertos/salida/contexto-actor-acc';

export interface SolicitudConsultarIntervenciones {
  empresaId: string;
  motivoSoporte?: string;
  limite?: number;
  desplazamiento?: number;
  orden?: 'ocurridaEn:asc' | 'ocurridaEn:desc';
}

export interface ResumenIntervencionDto {
  id: string;
  ocurridaEn: string;
  actor: 'Soporte de plataforma';
}

export interface RespuestaListadoIntervenciones {
  datos: ResumenIntervencionDto[];
  paginacion: {
    limite: number;
    desplazamiento: number;
    total: number;
  };
}

export class ConsultarIntervencionesSoporte {
  constructor(
    private readonly repositorioIntervenciones: RepositorioIntervencionesSoporte,
    private readonly verificadorEmpresa: VerificadorEmpresaPuerto,
    private readonly resolverContextoSoporte: ResolverContextoSoporte,
  ) {}

  public async ejecutar(
    solicitud: SolicitudConsultarIntervenciones,
    contexto: ContextoActorAcc,
  ): Promise<RespuestaListadoIntervenciones> {
    const empresaId = solicitud.empresaId.trim();

    // 1. Autorización por rol
    if (contexto.rol === 'ADMINISTRADOR') {
      // ACC-BR-002: Debe coincidir con la Empresa del Administrador
      if (!contexto.empresaId || contexto.empresaId !== empresaId) {
        throw new ErrorDominioIdentidadAcceso(
          'ACC_EMPRESA_FUERA_DE_ALCANCE',
          'El Administrador no puede consultar intervenciones de otra Empresa',
        );
      }
    } else if (contexto.rol === 'SUPER_ADMINISTRADOR') {
      // SuperAdministrador operando en soporte técnico sobre la empresa
      if (
        !solicitud.motivoSoporte ||
        solicitud.motivoSoporte.trim().length === 0
      ) {
        throw new ErrorDominioIdentidadAcceso(
          'ACC_CONTEXTO_SOPORTE_REQUERIDO',
          'El SuperAdministrador requiere indicar el Motivo-Soporte para consultar intervenciones',
        );
      }

      // Resolver e insertar intervención de soporte de esta consulta
      await this.resolverContextoSoporte.ejecutar(
        {
          empresaId,
          motivo: solicitud.motivoSoporte,
        },
        contexto,
      );
    } else {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_ACCESO_DENEGADO',
        'No tiene autorización para consultar intervenciones de soporte',
      );
    }

    // 2. Verificar existencia de la Empresa si no fue verificada previamente
    if (contexto.rol === 'ADMINISTRADOR') {
      const existe = await this.verificadorEmpresa.existeEmpresa(empresaId);
      if (!existe) {
        throw new ErrorDominioIdentidadAcceso(
          'ACC_EMPRESA_NO_ENCONTRADA',
          `La empresa ${empresaId} no fue encontrada`,
        );
      }
    }

    // 3. Paginación y orden
    const limite = Math.max(1, Math.min(100, solicitud.limite ?? 25));
    const desplazamiento = Math.max(0, solicitud.desplazamiento ?? 0);
    const orden = solicitud.orden ?? 'ocurridaEn:desc';

    const resultado = await this.repositorioIntervenciones.listarPorEmpresa(
      empresaId,
      {
        limite,
        desplazamiento,
        orden,
      },
    );

    // 4. Proyección segura (ACC-BR-009 / ACC-Q-008)
    const datos: ResumenIntervencionDto[] = resultado.datos.map(
      (intervencion) => ({
        id: intervencion.id,
        ocurridaEn: intervencion.ocurridaEn.toISOString(),
        actor: 'Soporte de plataforma',
      }),
    );

    return {
      datos,
      paginacion: {
        limite,
        desplazamiento,
        total: resultado.total,
      },
    };
  }
}
