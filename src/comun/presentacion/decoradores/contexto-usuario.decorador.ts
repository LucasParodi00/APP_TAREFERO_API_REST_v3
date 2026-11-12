import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ContextoSolicitud } from '../../aplicacion';

export function extraerContextoUsuario(ctx: ExecutionContext): ContextoSolicitud {
    const req = ctx.switchToHttp().getRequest<Request & { contexto?: ContextoSolicitud }>();
    if (!req || !req.contexto) {
        throw new UnauthorizedException('No existe un contexto de solicitud autenticado.');
    }
    return req.contexto;
}

export const ContextoUsuario = createParamDecorator((_data: unknown, ctx: ExecutionContext): ContextoSolicitud => {
    return extraerContextoUsuario(ctx);
});
