import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ContextoSolicitud } from '../../../aplicacion/puertos/comunes/contexto-solicitud';

interface RequestConUsuario extends Request {
    user?: {
        id?: string;
        rol?: string;
        empresaId?: string;
    };
}

export const ContextoUsuario = createParamDecorator((_data: unknown, ctx: ExecutionContext): ContextoSolicitud => {
    const request = ctx.switchToHttp().getRequest<RequestConUsuario>();
    const headerActor = request.headers['x-actor-id'];
    const headerRol = request.headers['x-rol'];
    const headerEmpresa = request.headers['x-empresa-id'];

    const actorId = (typeof headerActor === 'string' ? headerActor : undefined) || request.user?.id || 'anonimo';
    const rol = (typeof headerRol === 'string' ? headerRol : undefined) || request.user?.rol || 'SUPER_ADMINISTRADOR';
    const empresaId = (typeof headerEmpresa === 'string' ? headerEmpresa : undefined) || request.user?.empresaId;

    return {
        actorId,
        rol,
        empresaId,
    };
});
