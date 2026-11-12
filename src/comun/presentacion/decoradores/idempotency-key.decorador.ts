import { createParamDecorator, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';

export interface OpcionesIdempotencyKey {
    requerido?: boolean;
}

export function extraerIdempotencyKey(opciones: OpcionesIdempotencyKey | undefined, ctx: ExecutionContext): string | undefined {
    const request = ctx.switchToHttp().getRequest<Request>();
    const key = request?.headers ? request.headers['idempotency-key'] : undefined;

    if (!key || typeof key !== 'string' || key.trim() === '') {
        if (opciones?.requerido) {
            throw new HttpException(
                {
                    type: 'about:blank',
                    title: 'Bad Request',
                    status: HttpStatus.BAD_REQUEST,
                    code: 'CABECERA_IDEMPOTENCY_KEY_REQUERIDA',
                    detail: 'La cabecera Idempotency-Key es obligatoria para esta operación.',
                    instance: request?.url,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        return undefined;
    }

    const valorLimpio = key.trim();
    if (valorLimpio.length > 255) {
        throw new HttpException(
            {
                type: 'about:blank',
                title: 'Bad Request',
                status: HttpStatus.BAD_REQUEST,
                code: 'IDEMPOTENCY_KEY_INVALIDA',
                detail: 'La cabecera Idempotency-Key excede la longitud máxima permitida.',
                instance: request?.url,
            },
            HttpStatus.BAD_REQUEST,
        );
    }

    return valorLimpio;
}

export const IdempotencyKey = createParamDecorator(
    (opciones: OpcionesIdempotencyKey | undefined, ctx: ExecutionContext): string | undefined => {
        return extraerIdempotencyKey(opciones, ctx);
    },
);
