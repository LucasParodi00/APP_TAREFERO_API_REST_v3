import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { CategoriaError, ErrorDominioBase } from '../../dominio';
import { ErrorAplicacionBase, ContextoSolicitud } from '../../aplicacion';

const MAPA_CATEGORIAS: Record<CategoriaError, { status: number; title: string }> = {
    [CategoriaError.VALIDACION]: {
        status: HttpStatus.BAD_REQUEST,
        title: 'Bad Request',
    },
    [CategoriaError.NO_AUTENTICADO]: {
        status: HttpStatus.UNAUTHORIZED,
        title: 'Unauthorized',
    },
    [CategoriaError.ACCESO_DENEGADO]: {
        status: HttpStatus.FORBIDDEN,
        title: 'Forbidden',
    },
    [CategoriaError.NO_ENCONTRADO]: {
        status: HttpStatus.NOT_FOUND,
        title: 'Not Found',
    },
    [CategoriaError.CONFLICTO]: {
        status: HttpStatus.CONFLICT,
        title: 'Conflict',
    },
    [CategoriaError.PRECONDICION_FALLIDA]: {
        status: HttpStatus.PRECONDITION_FAILED,
        title: 'Precondition Failed',
    },
    [CategoriaError.PRECONDICION_REQUERIDA]: {
        status: HttpStatus.PRECONDITION_REQUIRED,
        title: 'Precondition Required',
    },
    [CategoriaError.NO_DISPONIBLE]: {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        title: 'Service Unavailable',
    },
};

const TITULOS_HTTP: Record<number, string> = {
    [HttpStatus.BAD_REQUEST]: 'Bad Request',
    [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
    [HttpStatus.FORBIDDEN]: 'Forbidden',
    [HttpStatus.NOT_FOUND]: 'Not Found',
    [HttpStatus.CONFLICT]: 'Conflict',
    [HttpStatus.PRECONDITION_FAILED]: 'Precondition Failed',
    [HttpStatus.PRECONDITION_REQUIRED]: 'Precondition Required',
    [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
    [HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
    [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
};

@Catch()
export class FiltroExcepcionesRfc9457 implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request & { contexto?: ContextoSolicitud; solicitudId?: string }>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let title = 'Internal Server Error';
        let detail = 'Ocurrió un error inesperado en el servidor.';
        let code = 'ERROR_INTERNO';
        let errores: unknown = undefined;

        const solicitudId =
            request?.contexto?.solicitudId ||
            (request?.headers
                ? (request.headers['x-solicitud-id'] as string) || (request.headers['x-request-id'] as string)
                : undefined) ||
            request?.solicitudId ||
            '00000000-0000-0000-0000-000000000000';

        if (exception instanceof ErrorDominioBase || exception instanceof ErrorAplicacionBase) {
            const mapeo = MAPA_CATEGORIAS[exception.categoria] ?? {
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                title: 'Unprocessable Entity',
            };
            status = mapeo.status;
            title = mapeo.title;
            code = exception.codigo;
            detail = exception.message;
        } else if (exception instanceof HttpException) {
            status = exception.getStatus();
            title = TITULOS_HTTP[status] || exception.name || 'Error HTTP';
            const res = exception.getResponse();

            if (typeof res === 'object' && res !== null) {
                const bodyObj = res as Record<string, unknown>;
                code = (bodyObj.code as string) || (bodyObj.codigo as string) || 'SOLICITUD_INVALIDA';
                detail =
                    (bodyObj.detail as string) ||
                    (Array.isArray(bodyObj.message) ? 'La solicitud contiene datos inválidos.' : (bodyObj.message as string)) ||
                    exception.message;
                errores = bodyObj.errores || bodyObj.errors || (Array.isArray(bodyObj.message) ? bodyObj.message : undefined);
            } else {
                detail = String(res);
            }
        }

        const payload: Record<string, unknown> = {
            type: 'about:blank',
            title,
            status,
            code,
            detail,
            instance: request?.originalUrl || request?.url || '',
            solicitudId,
        };

        if (errores !== undefined) {
            payload.errores = errores;
        }

        response.status(status).contentType('application/problem+json').json(payload);
    }
}
