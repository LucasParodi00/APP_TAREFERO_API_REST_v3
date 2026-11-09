import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorDominioEmpresa } from '../../modulos/empresas/dominio/errores/error-dominio-empresa';
import { ErrorDominioIdentidadAcceso } from '../../modulos/identidad-acceso/dominio/errores/error-dominio-identidad-acceso';
import { ErrorDominioTerritorio } from '../../modulos/territorio/dominio/errores/error-dominio-territorio';
import { ErrorDominioContextoProductivo } from '../../modulos/contexto-productivo/dominio/errores/error-dominio-contexto-productivo';
import { randomUUID } from 'crypto';

@Catch()
export class FiltroExcepcionesHttp implements ExceptionFilter {
  public catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const solicitudId =
      (request.headers['x-request-id'] as string) || randomUUID();

    if (exception instanceof ErrorDominioEmpresa) {
      const status = this.mapearCodigoEmpresaAEstadoHttp(exception.codigo);
      response
        .status(status)
        .contentType('application/problem+json')
        .json({
          type: `urn:tarefero:error:${exception.codigo.toLowerCase()}`,
          title: this.obtenerTituloParaCodigoEmpresa(exception.codigo),
          status,
          detail: exception.message,
          instance: request.originalUrl,
          code: exception.codigo,
          solicitudId,
        });
      return;
    }

    if (exception instanceof ErrorDominioIdentidadAcceso) {
      const status = this.mapearCodigoAccAEstadoHttp(exception.codigo);
      response
        .status(status)
        .contentType('application/problem+json')
        .json({
          type: `urn:tarefero:error:${exception.codigo.toLowerCase()}`,
          title: this.obtenerTituloParaCodigoAcc(exception.codigo),
          status,
          detail: exception.message,
          instance: request.originalUrl,
          code: exception.codigo,
          solicitudId,
        });
      return;
    }

    if (exception instanceof ErrorDominioTerritorio) {
      const status = this.mapearCodigoTerAEstadoHttp(exception.codigo);
      response
        .status(status)
        .contentType('application/problem+json')
        .json({
          type: `urn:tarefero:error:${exception.codigo.toLowerCase()}`,
          title: this.obtenerTituloParaCodigoTer(exception.codigo),
          status,
          detail: exception.message,
          instance: request.originalUrl,
          code: exception.codigo,
          solicitudId,
        });
      return;
    }

    if (exception instanceof ErrorDominioContextoProductivo) {
      const status = this.mapearCodigoCulAEstadoHttp(exception.codigo);
      response
        .status(status)
        .contentType('application/problem+json')
        .json({
          type: `urn:tarefero:error:${exception.codigo.toLowerCase()}`,
          title: this.obtenerTituloParaCodigoCul(exception.codigo),
          status,
          detail: exception.message,
          instance: request.originalUrl,
          code: exception.codigo,
          solicitudId,
        });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const detail =
        typeof res === 'object' && res !== null && 'message' in res
          ? Array.isArray(res.message)
            ? (res as { message: string[] }).message.join(', ')
            : String(res.message)
          : exception.message;

      response
        .status(status)
        .contentType('application/problem+json')
        .json({
          type: 'urn:tarefero:error:http',
          title: exception.name,
          status,
          detail,
          instance: request.originalUrl,
          code: `HTTP_${status}`,
          solicitudId,
        });
      return;
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    response
      .status(status)
      .contentType('application/problem+json')
      .json({
        type: 'urn:tarefero:error:interno',
        title: 'Error Interno del Servidor',
        status,
        detail:
          exception instanceof Error
            ? exception.message
            : 'Ocurrió un error inesperado',
        instance: request.originalUrl,
        code: 'ERROR_INTERNO',
        solicitudId,
      });
  }

  private mapearCodigoEmpresaAEstadoHttp(codigo: string): number {
    switch (codigo) {
      case 'EMP_ACCESO_DENEGADO':
        return HttpStatus.FORBIDDEN; // 403
      case 'EMP_EMPRESA_NO_ENCONTRADA':
        return HttpStatus.NOT_FOUND; // 404
      case 'EMP_ALIAS_NO_DISPONIBLE':
      case 'EMP_VERSION_CONFLICTO':
        return HttpStatus.CONFLICT; // 409
      case 'EMP_CONSULTA_INVALIDA':
        return HttpStatus.BAD_REQUEST; // 400
      default:
        // Reglas de negocio incumplidas (BR)
        return HttpStatus.UNPROCESSABLE_ENTITY; // 422
    }
  }

  private obtenerTituloParaCodigoEmpresa(codigo: string): string {
    switch (codigo) {
      case 'EMP_ACCESO_DENEGADO':
        return 'Acceso denegado';
      case 'EMP_EMPRESA_NO_ENCONTRADA':
        return 'Empresa no encontrada';
      case 'EMP_ALIAS_NO_DISPONIBLE':
        return 'Alias no disponible';
      case 'EMP_VERSION_CONFLICTO':
        return 'Conflicto de versión';
      case 'EMP_CONSULTA_INVALIDA':
        return 'Consulta inválida';
      default:
        return 'Regla de negocio incumplida';
    }
  }

  private mapearCodigoAccAEstadoHttp(codigo: string): number {
    switch (codigo) {
      case 'ACC_AUTENTICACION_INVALIDA':
      case 'ACC_SESION_NO_VIGENTE':
      case 'ACC_RENOVACION_INVALIDA':
        return HttpStatus.UNAUTHORIZED; // 401
      case 'ACC_ACCESO_DENEGADO':
      case 'ACC_EMPRESA_FUERA_DE_ALCANCE':
      case 'ACC_CUENTA_EMPRESA_INCOMPATIBLE':
      case 'ACC_ACCESO_NO_HABILITADO':
      case 'ACC_CAMBIO_PROPIO_NO_AUTORIZADO':
      case 'ACC_RESTABLECIMIENTO_FUERA_DE_ALCANCE':
      case 'ACC_IDENTIDAD_PLATAFORMA_NO_VISIBLE':
      case 'ACC_CONTEXTO_SOPORTE_REQUERIDO':
        return HttpStatus.FORBIDDEN; // 403
      case 'ACC_EMPRESA_NO_ENCONTRADA':
      case 'ACC_CUENTA_NO_ENCONTRADA':
        return HttpStatus.NOT_FOUND; // 404
      case 'ACC_CORREO_DUPLICADO':
      case 'ACC_CUENTA_PERSONA_DUPLICADA':
      case 'ACC_LIMITE_ACCESOS_ALCANZADO':
      case 'ACC_VERSION_CONFLICTO':
      case 'ACC_IDEMPOTENCIA_CONFLICTO':
      case 'ACC_INICIALIZACION_NO_PERMITIDA':
        return HttpStatus.CONFLICT; // 409
      case 'ACC_VALIDACION_COMERCIAL_NO_DISPONIBLE':
        return HttpStatus.SERVICE_UNAVAILABLE; // 503
      case 'ACC_CAMBIO_CREDENCIAL_NO_COMPLETADO':
        return HttpStatus.INTERNAL_SERVER_ERROR; // 500
      default:
        // ACC_CREDENCIALES_REQUERIDAS, ACC_CORREO_INVALIDO, ACC_CONTRASENIA_INVALIDA,
        // ACC_ROL_NO_ADMITIDO, ACC_PERSONA_NO_DISPONIBLE, ACC_TRANSICION_NO_PERMITIDA,
        // ACC_ELIMINACION_NO_PERMITIDA, ACC_MOTIVO_SOPORTE_INVALIDO, ACC_ULTIMO_SUPERADMINISTRADOR
        return HttpStatus.UNPROCESSABLE_ENTITY; // 422
    }
  }

  private obtenerTituloParaCodigoAcc(codigo: string): string {
    switch (codigo) {
      case 'ACC_AUTENTICACION_INVALIDA':
        return 'Autenticación inválida';
      case 'ACC_SESION_NO_VIGENTE':
        return 'Sesión no vigente';
      case 'ACC_RENOVACION_INVALIDA':
        return 'Renovación inválida';
      case 'ACC_ACCESO_DENEGADO':
        return 'Acceso denegado';
      case 'ACC_EMPRESA_FUERA_DE_ALCANCE':
        return 'Empresa fuera de alcance';
      case 'ACC_CUENTA_EMPRESA_INCOMPATIBLE':
        return 'Cuenta de empresa incompatible';
      case 'ACC_CANAL_NO_HABILITADO':
        return 'Canal no habilitado';
      case 'ACC_ACCESO_NO_HABILITADO':
        return 'Acceso no habilitado';
      case 'ACC_CAMBIO_PROPIO_NO_AUTORIZADO':
        return 'Cambio propio no autorizado';
      case 'ACC_RESTABLECIMIENTO_FUERA_DE_ALCANCE':
        return 'Restablecimiento fuera de alcance';
      case 'ACC_IDENTIDAD_PLATAFORMA_NO_VISIBLE':
        return 'Identidad de plataforma no visible';
      case 'ACC_CONTEXTO_SOPORTE_REQUERIDO':
        return 'Contexto de soporte requerido';
      case 'ACC_EMPRESA_NO_ENCONTRADA':
        return 'Empresa no encontrada';
      case 'ACC_CUENTA_NO_ENCONTRADA':
        return 'Cuenta no encontrada';
      case 'ACC_CORREO_DUPLICADO':
        return 'Correo duplicado';
      case 'ACC_CUENTA_PERSONA_DUPLICADA':
        return 'Cuenta para persona duplicada';
      case 'ACC_LIMITE_ACCESOS_ALCANZADO':
        return 'Límite de accesos alcanzado';
      case 'ACC_VERSION_CONFLICTO':
        return 'Conflicto de versión';
      case 'ACC_IDEMPOTENCIA_CONFLICTO':
        return 'Conflicto de idempotencia';
      case 'ACC_INICIALIZACION_NO_PERMITIDA':
        return 'Inicialización no permitida';
      case 'ACC_CREDENCIALES_REQUERIDAS':
        return 'Credenciales requeridas';
      case 'ACC_CORREO_INVALIDO':
        return 'Correo inválido';
      case 'ACC_CONTRASENIA_INVALIDA':
        return 'Contraseña inválida';
      case 'ACC_ROL_NO_ADMITIDO':
        return 'Rol no admitido';
      case 'ACC_PERSONA_NO_DISPONIBLE':
        return 'Persona no disponible';
      case 'ACC_TRANSICION_NO_PERMITIDA':
        return 'Transición no permitida';
      case 'ACC_ELIMINACION_NO_PERMITIDA':
        return 'Eliminación no permitida';
      case 'ACC_MOTIVO_SOPORTE_INVALIDO':
        return 'Motivo de soporte inválido';
      case 'ACC_ULTIMO_SUPERADMINISTRADOR':
        return 'Último superadministrador activo';
      case 'ACC_VALIDACION_COMERCIAL_NO_DISPONIBLE':
        return 'Validación comercial no disponible';
      case 'ACC_CAMBIO_CREDENCIAL_NO_COMPLETADO':
        return 'Cambio de credencial no completado';
      default:
        return 'Regla de negocio incumplida';
    }
  }

  private mapearCodigoTerAEstadoHttp(codigo: string): number {
    switch (codigo) {
      case 'TER_ACCESO_DENEGADO':
      case 'ACC_CONTEXTO_SOPORTE_REQUERIDO':
      case 'ACC_EMPRESA_FUERA_DE_ALCANCE':
        return HttpStatus.FORBIDDEN; // 403
      case 'TER_CHACRA_NO_ENCONTRADA':
      case 'ACC_EMPRESA_NO_ENCONTRADA':
        return HttpStatus.NOT_FOUND; // 404
      case 'TER_NOMBRE_CORTO_DUPLICADO':
      case 'TER_VERSION_CONFLICTO':
      case 'TER_IDEMPOTENCIA_CONFLICTO':
        return HttpStatus.CONFLICT; // 409
      default:
        // TER_NOMBRE_OBLIGATORIO, TER_NOMBRE_CORTO_OBLIGATORIO, TER_TEXTO_INVALIDO,
        // TER_UBICACION_GEOGRAFICA_INVALIDA, ACC_MOTIVO_SOPORTE_INVALIDO, TER_EMPRESA_REQUERIDA,
        // TER_OPERACION_INACTIVA_INVALIDA, TER_TRANSICION_ESTADO_INVALIDA, TER_ESTADO_CHACRA_LOTES_INCOMPATIBLE
        return HttpStatus.UNPROCESSABLE_ENTITY; // 422
    }
  }

  private obtenerTituloParaCodigoTer(codigo: string): string {
    switch (codigo) {
      case 'TER_ACCESO_DENEGADO':
        return 'Acceso denegado';
      case 'ACC_CONTEXTO_SOPORTE_REQUERIDO':
        return 'Contexto de soporte requerido';
      case 'ACC_EMPRESA_FUERA_DE_ALCANCE':
        return 'Empresa fuera de alcance';
      case 'TER_CHACRA_NO_ENCONTRADA':
        return 'Chacra no encontrada';
      case 'ACC_EMPRESA_NO_ENCONTRADA':
        return 'Empresa no encontrada';
      case 'TER_NOMBRE_CORTO_DUPLICADO':
        return 'Nombre corto duplicado';
      case 'TER_VERSION_CONFLICTO':
        return 'Conflicto de versión';
      case 'TER_IDEMPOTENCIA_CONFLICTO':
        return 'Conflicto de idempotencia';
      case 'TER_OPERACION_INACTIVA_INVALIDA':
        return 'Operación sobre Chacra inactiva no permitida';
      case 'TER_TRANSICION_ESTADO_INVALIDA':
        return 'Transición de estado inválida';
      case 'TER_ESTADO_CHACRA_LOTES_INCOMPATIBLE':
        return 'Estado de Chacra incompatible con sus Lotes';
      case 'TER_UBICACION_GEOGRAFICA_INVALIDA':
        return 'Ubicación geográfica inválida';
      default:
        return 'Regla de negocio incumplida';
    }
  }

  private mapearCodigoCulAEstadoHttp(codigo: string): number {
    switch (codigo) {
      case 'CUL_ACCESO_DENEGADO':
        return HttpStatus.FORBIDDEN; // 403
      case 'CUL_RECURSO_NO_ENCONTRADO':
        return HttpStatus.NOT_FOUND; // 404
      case 'CUL_CULTIVO_DUPLICADO':
      case 'CUL_IDEMPOTENCIA_CONFLICTO':
      case 'CUL_VERSION_CONFLICTO':
      case 'CUL_REGISTRO_HISTORICO_EN_USO':
        return HttpStatus.CONFLICT; // 409
      default:
        // CUL_VARIEDAD_INVALIDA, CUL_CULTIVO_NO_HABILITADO, CUL_PERFIL_INCOMPATIBLE,
        // CUL_CAMPO_PERFIL_INVALIDO, CUL_VERSION_PERFIL_INMUTABLE
        return HttpStatus.UNPROCESSABLE_ENTITY; // 422
    }
  }

  private obtenerTituloParaCodigoCul(codigo: string): string {
    switch (codigo) {
      case 'CUL_ACCESO_DENEGADO':
        return 'Acceso denegado';
      case 'CUL_RECURSO_NO_ENCONTRADO':
        return 'Recurso no encontrado';
      case 'CUL_CULTIVO_DUPLICADO':
        return 'Cultivo duplicado';
      case 'CUL_IDEMPOTENCIA_CONFLICTO':
        return 'Conflicto de idempotencia';
      case 'CUL_VERSION_CONFLICTO':
        return 'Conflicto de versión';
      case 'CUL_REGISTRO_HISTORICO_EN_USO':
        return 'Registro histórico en uso';
      case 'CUL_VARIEDAD_INVALIDA':
        return 'Variedad inválida';
      case 'CUL_CULTIVO_NO_HABILITADO':
        return 'Cultivo no habilitado para la empresa';
      case 'CUL_PERFIL_INCOMPATIBLE':
        return 'Perfil incompatible';
      case 'CUL_CAMPO_PERFIL_INVALIDO':
        return 'Campo de perfil inválido';
      case 'CUL_VERSION_PERFIL_INMUTABLE':
        return 'Versión de perfil inmutable';
      default:
        return 'Regla de negocio incumplida';
    }
  }
}
