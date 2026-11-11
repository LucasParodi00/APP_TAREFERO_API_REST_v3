import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ContextoSolicitud } from '../../aplicacion/puertos/contexto-solicitud';

export const ContextoUsuario = createParamDecorator((_data: unknown, ctx: ExecutionContext): ContextoSolicitud => {
    const req = ctx.switchToHttp().getRequest<Request & { contexto?: ContextoSolicitud }>();
    if (req.contexto) {
        return req.contexto;
    }

    const rolHeader = (req.headers['x-rol'] as string) || 'ANONIMO';
    const permisosHeader = (req.headers['x-permisos'] as string) || '';
    const permisos = permisosHeader ? permisosHeader.split(',') : [];

    return {
        actorId: (req.headers['x-actor-id'] as string) || (req.headers['x-usuario-id'] as string) || 'anonimo',
        rol: rolHeader,
        permisos,
        empresaId: req.headers['x-empresa-id'] as string | undefined,
        sesionId: req.headers['x-sesion-id'] as string | undefined,
        empleadoId: req.headers['x-empleado-id'] as string | undefined,
    };
});
