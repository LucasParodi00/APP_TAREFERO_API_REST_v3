import { randomUUID, createHash } from 'crypto';
import { RepositorioCuentasEmpresa } from '../puertos/salida/repositorio-cuentas-empresa';
import { RepositorioIntervencionesSoporte } from '../puertos/salida/repositorio-intervenciones-soporte';
import { GestorIdempotenciaAcc } from '../puertos/salida/gestor-idempotencia-acc';
import { ContextoActorAcc } from '../puertos/salida/contexto-actor-acc';
import { MotivoSoporte } from '../../dominio/objetos-valor/motivo-soporte';
import { IntervencionSoporte } from '../../dominio/entidades/intervencion-soporte';
import { ErrorDominioIdentidadAcceso } from '../../dominio/errores/error-dominio-identidad-acceso';
import { RespuestaCuentaEmpresaDto } from './habilitar-cuenta-empresa.caso-de-uso';

export interface ComandoModificarHabilitacion {
  empresaId: string;
  cuentaId: string;
  versionConocida: number;
  roles?: string[];
  accesoWeb?: boolean;
  accesoMovil?: boolean;
  idempotencyKey?: string;
  motivoSoporte?: string;
}

export class ModificarHabilitacionCuenta {
  constructor(
    private readonly repositorioCuentas: RepositorioCuentasEmpresa,
    private readonly repositorioIntervenciones: RepositorioIntervencionesSoporte,
    private readonly gestorIdempotencia: GestorIdempotenciaAcc,
  ) {}

  public async ejecutar(
    comando: ComandoModificarHabilitacion,
    contexto: ContextoActorAcc,
  ): Promise<RespuestaCuentaEmpresaDto> {
    const claveIdempotencia = comando.idempotencyKey
      ? `acc:modificar:${contexto.actorId}:${comando.empresaId}:${comando.cuentaId}:${comando.idempotencyKey}`
      : undefined;

    if (claveIdempotencia) {
      const hashSolicitud = createHash('sha256')
        .update(JSON.stringify(comando))
        .digest('hex');
      const existente =
        await this.gestorIdempotencia.obtener(claveIdempotencia);
      if (existente) {
        if (existente.solicitudHash !== hashSolicitud) {
          throw new ErrorDominioIdentidadAcceso(
            'ACC_IDEMPOTENCIA_CONFLICTO',
            'La clave de idempotencia ya fue utilizada con otra solicitud.',
          );
        }
        return JSON.parse(existente.respuestaJson) as RespuestaCuentaEmpresaDto;
      }
    }

    if (contexto.rol === 'SUPER_ADMINISTRADOR') {
      if (!comando.motivoSoporte) {
        throw new ErrorDominioIdentidadAcceso(
          'ACC_CONTEXTO_SOPORTE_REQUERIDO',
          'Se requiere indicar un motivo de soporte para modificar la cuenta de la Empresa.',
        );
      }
    } else if (contexto.rol === 'ADMINISTRADOR') {
      if (!contexto.empresaId || contexto.empresaId !== comando.empresaId) {
        throw new ErrorDominioIdentidadAcceso(
          'ACC_EMPRESA_FUERA_DE_ALCANCE',
          'Un Administrador solo puede modificar cuentas de su propia Empresa.',
        );
      }
    } else {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_ACCESO_DENEGADO',
        'No posee permisos para modificar cuentas de Empresa.',
      );
    }

    const cuenta = await this.repositorioCuentas.buscarPorId(comando.cuentaId);
    if (!cuenta || cuenta.empresaId !== comando.empresaId) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_CUENTA_NO_ENCONTRADA',
        `No se encontró la cuenta '${comando.cuentaId}' en la Empresa.`,
      );
    }

    if (cuenta.version !== comando.versionConocida) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_VERSION_CONFLICTO',
        `Conflicto de versión: la versión actual es ${cuenta.version} y se esperaba ${comando.versionConocida}.`,
      );
    }

    cuenta.modificarHabilitacion(
      {
        roles: comando.roles,
        accesoWeb: comando.accesoWeb,
        accesoMovil: comando.accesoMovil,
      },
      contexto.actorId,
    );

    await this.repositorioCuentas.actualizar(cuenta);

    if (contexto.rol === 'SUPER_ADMINISTRADOR' && comando.motivoSoporte) {
      const motivoVO = MotivoSoporte.crear(comando.motivoSoporte);
      const intervencion = IntervencionSoporte.crear({
        id: randomUUID(),
        usuarioPlataformaId: contexto.actorId,
        empresaId: comando.empresaId,
        motivo: motivoVO,
        sesionId: contexto.sesionId ?? 'sesion-soporte',
        solicitudId: contexto.solicitudId ?? randomUUID(),
      });
      await this.repositorioIntervenciones.guardar(intervencion);
    }

    const respuesta: RespuestaCuentaEmpresaDto = {
      id: cuenta.id,
      empresaId: cuenta.empresaId,
      personaId: cuenta.personaId,
      correoAcceso: cuenta.correoAcceso.valor,
      accesoWeb: cuenta.accesoWeb,
      accesoMovil: cuenta.accesoMovil,
      roles: [...cuenta.roles],
      estado: cuenta.estado,
      version: cuenta.version,
    };

    if (claveIdempotencia) {
      const hashSolicitud = createHash('sha256')
        .update(JSON.stringify(comando))
        .digest('hex');
      await this.gestorIdempotencia.guardar({
        clave: claveIdempotencia,
        solicitudHash: hashSolicitud,
        respuestaJson: JSON.stringify(respuesta),
        codigoEstado: 200,
        creadoEn: new Date(),
      });
    }

    return respuesta;
  }
}
