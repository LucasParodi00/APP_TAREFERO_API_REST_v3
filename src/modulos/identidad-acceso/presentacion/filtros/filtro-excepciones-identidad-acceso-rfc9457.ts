import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import type { Response, Request } from 'express';
import { ErrorDominioIdentidadAcceso } from '../../dominio/errores/errores-identidad-acceso';
import { ErrorAplicacionIdentidadAcceso } from '../../aplicacion/errores/errores-aplicacion';

@Catch()
export class FiltroExcepcionesIdentidadAccesoRfc9457 implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let title = 'Internal Server Error';
        let detail = 'Ocurrió un error inesperado.';
        let codigo = 'ERROR_INTERNO';
        let errores: unknown = undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            title = exception.name || 'Error HTTP';
            const res = exception.getResponse();
            if (typeof res === 'object' && res !== null) {
                const bodyObj = res as Record<string, unknown>;
                detail =
                    (bodyObj.detail as string) ||
                    (Array.isArray(bodyObj.message) ? bodyObj.message.join('; ') : (bodyObj.message as string)) ||
                    exception.message;
                codigo = (bodyObj.codigo as string) || 'SOLICITUD_INVALIDA';
                errores = bodyObj.errors || (Array.isArray(bodyObj.message) ? bodyObj.message : undefined);
            } else {
                detail = String(res);
            }
        } else if (exception instanceof ErrorDominioIdentidadAcceso || exception instanceof ErrorAplicacionIdentidadAcceso) {
            detail = exception.message;
            codigo = exception.codigo;

            switch (exception.codigo) {
                case 'ACC_CUENTA_NO_ENCONTRADA':
                    status = HttpStatus.NOT_FOUND;
                    title = 'Not Found';
                    break;
                case 'ACC_ACCESO_DENEGADO':
                case 'EMP_NO_HABILITADA':
                    status = HttpStatus.FORBIDDEN;
                    title = 'Forbidden';
                    break;
                case 'ACC_CREDENCIALES_INVALIDAS':
                case 'ACC_SESION_REVOCADA':
                case 'ACC_SESION_EXPIRADA':
                case 'ACC_TOKEN_RENOVACION_INVALIDO':
                    status = HttpStatus.UNAUTHORIZED;
                    title = 'Unauthorized';
                    break;
                case 'ACC_VERSION_CONFLICTO':
                    status = HttpStatus.PRECONDITION_FAILED;
                    title = 'Precondition Failed';
                    break;
                case 'ACC_CORREO_DUPLICADO':
                case 'ACC_CUPO_EXCEDIDO':
                case 'ACC_EMPLEADO_NO_DISPONIBLE':
                case 'ACC_TRANSICION_NO_PERMITIDA':
                case 'ACC_INICIALIZACION_NO_PERMITIDA':
                case 'ACC_LIMITE_ACCESOS_ALCANZADO':
                case 'ACC_CUENTA_EMPLEADO_DUPLICADA':
                    status = HttpStatus.CONFLICT;
                    title = 'Conflict';
                    break;
                case 'ACC_CORREO_INVALIDO':
                case 'ACC_CONTRASENIA_INVALIDA':
                case 'ACC_MOTIVO_SOPORTE_INVALIDO':
                case 'ACC_NOMBRE_MOSTRADO_INVALIDO':
                case 'ACC_ROL_NO_ADMITIDO':
                case 'ACC_VINCULO_EMPLEADO_INVALIDO':
                case 'ACC_VINCULACION_EMPLEADO_INVALIDA':
                default:
                    status = HttpStatus.BAD_REQUEST;
                    title = 'Bad Request';
                    break;
            }
        }

        response.status(status).json({
            type: `https://tarefero.com/errores/${codigo.toLowerCase().replace(/_/g, '-')}`,
            title,
            status,
            detail,
            codigo,
            instance: request.url,
            ...(errores ? { errors: errores } : {}),
        });
    }
}
