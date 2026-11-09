import { randomUUID, createHash } from 'crypto';
import { RepositorioCuentasEmpresa } from '../puertos/salida/repositorio-cuentas-empresa';
import { VerificadorElegibilidadComercial } from '../puertos/salida/verificador-elegibilidad-comercial.puerto';
import { RepositorioIntervencionesSoporte } from '../puertos/salida/repositorio-intervenciones-soporte';
import { GestorIdempotenciaAcc } from '../puertos/salida/gestor-idempotencia-acc';
import { ContextoActorAcc } from '../puertos/salida/contexto-actor-acc';
import { MotivoSoporte } from '../../dominio/objetos-valor/motivo-soporte';
import { IntervencionSoporte } from '../../dominio/entidades/intervencion-soporte';
import { ErrorDominioIdentidadAcceso } from '../../dominio/errores/error-dominio-identidad-acceso';
import { RespuestaCuentaEmpresaDto } from './habilitar-cuenta-empresa.caso-de-uso';

export interface ComandoReactivarCuenta {
  empresaId: string;
  cuentaId: string;
  versionConocida: number;
  idempotencyKey?: string;
  motivoSoporte?: string;
}

export class ReactivarCuentaEmpresa {
  constructor(
    private readonly repositorioCuentas: RepositorioCuentasEmpresa,
    private readonly verificadorElegibilidad: VerificadorElegibilidadComercial,
    private readonly repositorioIntervenciones: RepositorioIntervencionesSoporte,
    private readonly gestorIdempotencia: GestorIdempotenciaAcc,
  ) {}

  public async ejecutar(
    comando: ComandoReactivarCuenta,
    contexto: ContextoActorAcc,
  ): Promise<RespuestaCuentaEmpresaDto> {
    const claveIdempotencia = comando.idempotencyKey
      ? `acc:reactivar:${contexto.actorId}:${comando.empresaId}:${comando.cuentaId}:${comando.idempotencyKey}`
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
          'Se requiere indicar un motivo de soporte para reactivar la cuenta de la Empresa.',
        );
      }
    } else if (contexto.rol === 'ADMINISTRADOR') {
      if (!contexto.empresaId || contexto.empresaId !== comando.empresaId) {
        throw new ErrorDominioIdentidadAcceso(
          'ACC_EMPRESA_FUERA_DE_ALCANCE',
          'Un Administrador solo puede reactivar cuentas de su propia Empresa.',
        );
      }
    } else {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_ACCESO_DENEGADO',
        'No posee permisos para reactivar cuentas de Empresa.',
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

    // Verificar cupo comercial vigente (ACC-BR-006, ACC-DEP-002)
    try {
      const elegibilidad =
        await this.verificadorElegibilidad.obtenerElegibilidad(
          comando.empresaId,
        );
      if (!elegibilidad.habilitada) {
        throw new ErrorDominioIdentidadAcceso(
          'ACC_VALIDACION_COMERCIAL_NO_DISPONIBLE',
          'La Empresa no cuenta con habilitación comercial vigente.',
        );
      }

      const cuentasActivas = await this.repositorioCuentas.contarActivas(
        comando.empresaId,
      );
      if (cuentasActivas >= elegibilidad.cupoMaximo) {
        throw new ErrorDominioIdentidadAcceso(
          'ACC_LIMITE_ACCESOS_ALCANZADO',
          'Se ha alcanzado el límite de cuentas activas permitido por la suscripción.',
        );
      }
    } catch (error) {
      if (error instanceof ErrorDominioIdentidadAcceso) {
        throw error;
      }
      throw new ErrorDominioIdentidadAcceso(
        'ACC_VALIDACION_COMERCIAL_NO_DISPONIBLE',
        'No se pudo verificar la elegibilidad comercial de la Empresa.',
      );
    }

    cuenta.reactivar(contexto.actorId);
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
