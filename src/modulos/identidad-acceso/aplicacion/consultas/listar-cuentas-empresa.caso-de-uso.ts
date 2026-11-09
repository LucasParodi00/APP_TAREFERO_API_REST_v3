import { randomUUID } from 'crypto';
import {
  RepositorioCuentasEmpresa,
  ResultadoPaginado,
} from '../puertos/salida/repositorio-cuentas-empresa';
import { RepositorioIntervencionesSoporte } from '../puertos/salida/repositorio-intervenciones-soporte';
import { ContextoActorAcc } from '../puertos/salida/contexto-actor-acc';
import { MotivoSoporte } from '../../dominio/objetos-valor/motivo-soporte';
import { IntervencionSoporte } from '../../dominio/entidades/intervencion-soporte';
import { ErrorDominioIdentidadAcceso } from '../../dominio/errores/error-dominio-identidad-acceso';
import { RespuestaCuentaEmpresaDto } from '../comandos/habilitar-cuenta-empresa.caso-de-uso';

export interface ConsultaListarCuentas {
  empresaId: string;
  limite?: number;
  desplazamiento?: number;
  motivoSoporte?: string;
}

export class ListarCuentasEmpresa {
  constructor(
    private readonly repositorioCuentas: RepositorioCuentasEmpresa,
    private readonly repositorioIntervenciones: RepositorioIntervencionesSoporte,
  ) {}

  public async ejecutar(
    consulta: ConsultaListarCuentas,
    contexto: ContextoActorAcc,
  ): Promise<ResultadoPaginado<RespuestaCuentaEmpresaDto>> {
    if (contexto.rol === 'SUPER_ADMINISTRADOR') {
      if (!consulta.motivoSoporte) {
        throw new ErrorDominioIdentidadAcceso(
          'ACC_CONTEXTO_SOPORTE_REQUERIDO',
          'Se requiere indicar un motivo de soporte para listar las cuentas de la Empresa.',
        );
      }
    } else if (contexto.rol === 'ADMINISTRADOR') {
      if (!contexto.empresaId || contexto.empresaId !== consulta.empresaId) {
        throw new ErrorDominioIdentidadAcceso(
          'ACC_EMPRESA_FUERA_DE_ALCANCE',
          'Un Administrador solo puede listar cuentas de su propia Empresa.',
        );
      }
    } else {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_ACCESO_DENEGADO',
        'No posee permisos para listar cuentas de Empresa.',
      );
    }

    const limite = consulta.limite ?? 25;
    const desplazamiento = consulta.desplazamiento ?? 0;

    const resultado = await this.repositorioCuentas.listar({
      empresaId: consulta.empresaId,
      limite,
      desplazamiento,
    });

    if (contexto.rol === 'SUPER_ADMINISTRADOR' && consulta.motivoSoporte) {
      const motivoVO = MotivoSoporte.crear(consulta.motivoSoporte);
      const intervencion = IntervencionSoporte.crear({
        id: randomUUID(),
        usuarioPlataformaId: contexto.actorId,
        empresaId: consulta.empresaId,
        motivo: motivoVO,
        sesionId: contexto.sesionId ?? 'sesion-soporte',
        solicitudId: contexto.solicitudId ?? randomUUID(),
      });
      await this.repositorioIntervenciones.guardar(intervencion);
    }

    return {
      datos: resultado.datos.map((cuenta) => ({
        id: cuenta.id,
        empresaId: cuenta.empresaId,
        personaId: cuenta.personaId,
        correoAcceso: cuenta.correoAcceso.valor,
        accesoWeb: cuenta.accesoWeb,
        accesoMovil: cuenta.accesoMovil,
        roles: [...cuenta.roles],
        estado: cuenta.estado,
        version: cuenta.version,
      })),
      paginacion: resultado.paginacion,
    };
  }
}
