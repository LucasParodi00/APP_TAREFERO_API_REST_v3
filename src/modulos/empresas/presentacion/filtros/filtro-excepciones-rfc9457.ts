import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { ErrorDominioEmpresa } from '../../dominio/errores';
import { ErrorAplicacionEmpresa } from '../../aplicacion/errores';

@Catch()
export class FiltroExcepcionesRfc9457 implements ExceptionFilter {
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
        } else if (exception instanceof ErrorDominioEmpresa || exception instanceof ErrorAplicacionEmpresa) {
            detail = exception.message;
            codigo = exception.codigo;

            switch (exception.codigo) {
                case 'EMP_EMPRESA_NO_ENCONTRADA':
                    status = HttpStatus.NOT_FOUND;
                    title = 'Not Found';
                    break;
                case 'EMP_ACCESO_DENEGADO':
                    status = HttpStatus.FORBIDDEN;
                    title = 'Forbidden';
                    break;
                case 'EMP_CONFLICTO_CONCURRENCIA':
                    status = HttpStatus.PRECONDITION_FAILED;
                    title = 'Precondition Failed';
                    break;
                case 'EMP_ALIAS_NO_DISPONIBLE':
                case 'EMP_TRANSICION_ESTADO_INVALIDA':
                    status = HttpStatus.CONFLICT;
                    title = 'Conflict';
                    break;
                case 'EMP_NOMBRE_OBLIGATORIO':
                case 'EMP_NOMBRE_INVALIDO':
                case 'EMP_UBICACION_GEOGRAFICA_INVALIDA':
                case 'EMP_CUIT_INVALIDO':
                case 'EMP_TEXTO_INVALIDO':
                case 'EMP_ALIAS_INVALIDO':
                case 'EMP_CONFIGURACION_GENERAL_INVALIDA':
                case 'EMP_ALIAS_INMUTABLE':
                case 'EMP_MODIFICACION_NO_PERMITIDA':
                case 'EMP_ASIGNACION_COMERCIAL_REQUERIDA':
                case 'EMP_NO_HABILITADA':
                default:
                    status = HttpStatus.UNPROCESSABLE_ENTITY;
                    title = 'Unprocessable Entity';
                    break;
            }
        } else if (exception instanceof Error) {
            detail = exception.message;
        }

        const payload: Record<string, unknown> = {
            type: `https://httpstatuses.io/${status}`,
            title,
            status,
            detail,
            instance: request.url,
            codigo,
        };

        if (errores !== undefined) {
            payload.errores = errores;
        }

        response.status(status).contentType('application/problem+json').json(payload);
    }
}
