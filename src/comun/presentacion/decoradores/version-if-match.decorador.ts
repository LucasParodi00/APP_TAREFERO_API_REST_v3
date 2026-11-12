import { createParamDecorator, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';

export function extraerVersionIfMatch(ctx: ExecutionContext): number {
    const request = ctx.switchToHttp().getRequest<Request>();
    const ifMatch = request?.headers ? request.headers['if-match'] : undefined;

    if (!ifMatch || typeof ifMatch !== 'string') {
        throw new HttpException(
            {
                type: 'about:blank',
                title: 'Precondition Required',
                status: HttpStatus.PRECONDITION_REQUIRED,
                code: 'CABECERA_IF_MATCH_REQUERIDA',
                detail: 'La cabecera If-Match es requerida para esta operación.',
                instance: request?.url,
            },
            HttpStatus.PRECONDITION_REQUIRED,
        );
    }

    const versionStr = ifMatch
        .replace(/^[Ww]\//, '')
        .replace(/"/g, '')
        .trim();
    const version = parseInt(versionStr, 10);

    if (isNaN(version) || version < 1) {
        throw new HttpException(
            {
                type: 'about:blank',
                title: 'Bad Request',
                status: HttpStatus.BAD_REQUEST,
                code: 'IF_MATCH_INVALIDO',
                detail: 'El valor de la cabecera If-Match no representa una versión válida.',
                instance: request?.url,
            },
            HttpStatus.BAD_REQUEST,
        );
    }

    return version;
}

export const VersionIfMatch = createParamDecorator((_data: unknown, ctx: ExecutionContext): number => {
    return extraerVersionIfMatch(ctx);
});
