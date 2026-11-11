import { createParamDecorator, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';

export const VersionIfMatch = createParamDecorator((_data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const ifMatch = request.headers['if-match'];

    if (!ifMatch || typeof ifMatch !== 'string') {
        throw new HttpException(
            {
                type: 'https://httpstatuses.io/428',
                title: 'Precondition Required',
                status: HttpStatus.PRECONDITION_REQUIRED,
                detail: 'La cabecera If-Match es requerida para esta operación.',
                instance: request.url,
                codigo: 'CABECERA_IF_MATCH_REQUERIDA',
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
                type: 'https://httpstatuses.io/400',
                title: 'Bad Request',
                status: HttpStatus.BAD_REQUEST,
                detail: 'El valor de la cabecera If-Match no representa una versión válida.',
                instance: request.url,
                codigo: 'IF_MATCH_INVALIDO',
            },
            HttpStatus.BAD_REQUEST,
        );
    }

    return version;
});
