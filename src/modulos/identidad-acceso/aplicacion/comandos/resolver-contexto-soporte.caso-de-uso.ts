import { randomUUID } from 'crypto';
import { IntervencionSoporte } from '../../dominio/entidades/intervencion-soporte';
import { MotivoSoporte } from '../../dominio/objetos-valor/motivo-soporte';
import { ErrorDominioIdentidadAcceso } from '../../dominio/errores/error-dominio-identidad-acceso';
import { RepositorioIntervencionesSoporte } from '../puertos/salida/repositorio-intervenciones-soporte';
import { VerificadorEmpresaPuerto } from '../puertos/salida/verificador-empresa.puerto';
import { ContextoActorAcc } from '../puertos/salida/contexto-actor-acc';

export interface SolicitudResolverContextoSoporte {
  empresaId: string;
  motivo: string;
}

export interface ContextoSoporte {
  intervencionId: string;
  actorId: string;
  empresaId: string;
  motivo: string;
  sesionId: string;
  solicitudId: string;
}

export class ResolverContextoSoporte {
  constructor(
    private readonly repositorioIntervenciones: RepositorioIntervencionesSoporte,
    private readonly verificadorEmpresa: VerificadorEmpresaPuerto,
  ) {}

  public async ejecutar(
    solicitud: SolicitudResolverContextoSoporte,
    contexto: ContextoActorAcc,
  ): Promise<ContextoSoporte> {
    // 1. Autorización: solo SuperAdministrador
    if (contexto.rol !== 'SUPER_ADMINISTRADOR') {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_ACCESO_DENEGADO',
        'Solo un SuperAdministrador puede solicitar un contexto de soporte de plataforma',
      );
    }

    // 2. Comprobar presencia de campos requeridos (ACC-BR-011)
    if (
      !solicitud.empresaId ||
      typeof solicitud.empresaId !== 'string' ||
      solicitud.empresaId.trim().length === 0 ||
      !solicitud.motivo ||
      typeof solicitud.motivo !== 'string' ||
      solicitud.motivo.trim().length === 0
    ) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_CONTEXTO_SOPORTE_REQUERIDO',
        'La Empresa destino y el motivo son obligatorios para el contexto de soporte',
      );
    }

    // 3. Validar motivo (ACC-BR-020)
    const motivoObjeto = MotivoSoporte.crear(solicitud.motivo);

    // 4. Comprobar existencia de Empresa (ACC-DEP-001)
    const empresaExiste = await this.verificadorEmpresa.existeEmpresa(
      solicitud.empresaId.trim(),
    );
    if (!empresaExiste) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_EMPRESA_NO_ENCONTRADA',
        `La empresa ${solicitud.empresaId} no fue encontrada`,
      );
    }

    // 5. Crear intervención y persistir
    const intervencion = IntervencionSoporte.crear({
      id: randomUUID(),
      usuarioPlataformaId: contexto.actorId,
      empresaId: solicitud.empresaId.trim(),
      motivo: motivoObjeto,
      sesionId: contexto.sesionId ?? 'sesion-plataforma-default',
      solicitudId: contexto.solicitudId ?? randomUUID(),
      ocurridaEn: new Date(),
    });

    await this.repositorioIntervenciones.guardar(intervencion);

    return {
      intervencionId: intervencion.id,
      actorId: contexto.actorId,
      empresaId: intervencion.empresaId,
      motivo: intervencion.motivo.valor,
      sesionId: intervencion.sesionId,
      solicitudId: intervencion.solicitudId,
    };
  }
}
