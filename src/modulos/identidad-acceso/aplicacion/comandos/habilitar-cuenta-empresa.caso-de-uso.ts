import { randomUUID, createHash } from 'crypto';
import { RepositorioCuentasEmpresa } from '../puertos/salida/repositorio-cuentas-empresa';
import { VerificadorEmpresaPuerto } from '../puertos/salida/verificador-empresa.puerto';
import {
  VerificadorPersona,
  EstadoVerificacionPersona,
} from '../puertos/salida/verificador-persona.puerto';
import { VerificadorElegibilidadComercial } from '../puertos/salida/verificador-elegibilidad-comercial.puerto';
import { ServicioCriptografia } from '../puertos/salida/servicio-criptografia.puerto';
import { RepositorioIntervencionesSoporte } from '../puertos/salida/repositorio-intervenciones-soporte';
import { GestorIdempotenciaAcc } from '../puertos/salida/gestor-idempotencia-acc';
import { ContextoActorAcc } from '../puertos/salida/contexto-actor-acc';
import { CuentaEmpresa } from '../../dominio/entidades/cuenta-empresa';
import { CorreoAcceso } from '../../dominio/objetos-valor/correo-acceso';
import { ContraseniaAcceso } from '../../dominio/objetos-valor/contrasenia-acceso';
import { MotivoSoporte } from '../../dominio/objetos-valor/motivo-soporte';
import { IntervencionSoporte } from '../../dominio/entidades/intervencion-soporte';
import { ErrorDominioIdentidadAcceso } from '../../dominio/errores/error-dominio-identidad-acceso';

export interface ComandoHabilitarCuenta {
  empresaId: string;
  personaId: string;
  correoAcceso: string;
  contrasenia: string;
  accesoWeb: boolean;
  accesoMovil: boolean;
  roles: string[];
  idempotencyKey?: string;
  motivoSoporte?: string;
}

export interface RespuestaCuentaEmpresaDto {
  id: string;
  empresaId: string;
  personaId: string;
  correoAcceso: string;
  accesoWeb: boolean;
  accesoMovil: boolean;
  roles: string[];
  estado: string;
  version: number;
}

export class HabilitarCuentaEmpresa {
  constructor(
    private readonly repositorioCuentas: RepositorioCuentasEmpresa,
    private readonly verificadorEmpresa: VerificadorEmpresaPuerto,
    private readonly verificadorPersona: VerificadorPersona,
    private readonly verificadorElegibilidad: VerificadorElegibilidadComercial,
    private readonly servicioCriptografia: ServicioCriptografia,
    private readonly repositorioIntervenciones: RepositorioIntervencionesSoporte,
    private readonly gestorIdempotencia: GestorIdempotenciaAcc,
  ) {}

  public async ejecutar(
    comando: ComandoHabilitarCuenta,
    contexto: ContextoActorAcc,
  ): Promise<RespuestaCuentaEmpresaDto> {
    const claveIdempotencia = comando.idempotencyKey
      ? `acc:habilitar:${contexto.actorId}:${comando.empresaId}:${comando.idempotencyKey}`
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

    // 1. Autorización según actor
    let esAltaInicial = false;
    if (contexto.rol === 'SUPER_ADMINISTRADOR') {
      const totalCuentas = await this.repositorioCuentas.contarPorEmpresa(
        comando.empresaId,
      );
      if (totalCuentas === 0) {
        esAltaInicial = true;
      } else {
        if (!comando.motivoSoporte) {
          throw new ErrorDominioIdentidadAcceso(
            'ACC_CONTEXTO_SOPORTE_REQUERIDO',
            'Se requiere indicar un motivo de soporte para operar sobre las cuentas de la Empresa.',
          );
        }
      }
    } else if (contexto.rol === 'ADMINISTRADOR') {
      if (!contexto.empresaId || contexto.empresaId !== comando.empresaId) {
        throw new ErrorDominioIdentidadAcceso(
          'ACC_EMPRESA_FUERA_DE_ALCANCE',
          'Un Administrador solo puede habilitar cuentas para su propia Empresa.',
        );
      }
    } else {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_ACCESO_DENEGADO',
        'No posee permisos para habilitar cuentas de Empresa.',
      );
    }

    // 2. Verificar existencia y estado de Empresa (ACC-DEP-001)
    const refEmpresa = await this.verificadorEmpresa.obtenerPorId(
      comando.empresaId,
    );
    if (!refEmpresa) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_EMPRESA_NO_ENCONTRADA',
        `No se encontró la Empresa '${comando.empresaId}'.`,
      );
    }
    if (refEmpresa.estado === 'CERRADA') {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_ACCESO_DENEGADO',
        'La Empresa se encuentra CERRADA y no admite nuevas cuentas.',
      );
    }

    // 3. Verificar Persona (ACC-DEP-003, ADR-0013)
    const estadoPersona = await this.verificadorPersona.verificar(
      comando.empresaId,
      comando.personaId,
    );
    if (estadoPersona === EstadoVerificacionPersona.EMPRESA_INCOMPATIBLE) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_CUENTA_EMPRESA_INCOMPATIBLE',
        'La Persona indicada pertenece a otra Empresa.',
      );
    }
    if (estadoPersona === EstadoVerificacionPersona.NO_DISPONIBLE) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_PERSONA_NO_DISPONIBLE',
        'La Persona indicada no está disponible o no se pudo verificar.',
      );
    }

    // 4. Objetos de valor para Correo y Contraseña
    const correoVO = new CorreoAcceso(comando.correoAcceso);
    const contraseniaVO = new ContraseniaAcceso(comando.contrasenia);

    // 5. Unicidad de Correo y Persona en la Empresa (ACC-BR-003, ACC-BR-015)
    const cuentaExistenteCorreo = await this.repositorioCuentas.buscarPorCorreo(
      comando.empresaId,
      correoVO.valor,
    );
    if (cuentaExistenteCorreo) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_CORREO_DUPLICADO',
        `El correo '${correoVO.valor}' ya se encuentra registrado en esta Empresa.`,
      );
    }

    const cuentaExistentePersona =
      await this.repositorioCuentas.buscarPorPersona(
        comando.empresaId,
        comando.personaId,
      );
    if (cuentaExistentePersona) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_CUENTA_PERSONA_DUPLICADA',
        'La Persona ya posee una cuenta registrada en esta Empresa.',
      );
    }

    // 6. Verificar elegibilidad y cupo comercial (ACC-DEP-002, ACC-BR-006)
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

    // 7. Hash de contraseña
    const hash = await this.servicioCriptografia.hashearContrasenia(
      contraseniaVO.valor,
    );

    // 8. Crear y persistir CuentaEmpresa
    const cuenta = CuentaEmpresa.crear({
      id: randomUUID(),
      empresaId: comando.empresaId,
      personaId: comando.personaId,
      correoAcceso: correoVO,
      hashContrasenia: hash,
      accesoWeb: comando.accesoWeb,
      accesoMovil: comando.accesoMovil,
      roles: comando.roles,
      creadoPor: contexto.actorId,
    });

    await this.repositorioCuentas.guardar(cuenta);

    // 9. Registrar auditoría de soporte si aplica
    if (
      contexto.rol === 'SUPER_ADMINISTRADOR' &&
      !esAltaInicial &&
      comando.motivoSoporte
    ) {
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
        codigoEstado: 201,
        creadoEn: new Date(),
      });
    }

    return respuesta;
  }
}
