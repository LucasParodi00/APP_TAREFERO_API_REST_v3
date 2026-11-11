import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { GENERADOR_TOKENS } from '../../aplicacion/puertos/generador-tokens.puerto';
import type { GeneradorTokens, PayloadTokenVerificado } from '../../aplicacion/puertos/generador-tokens.puerto';
import { REPOSITORIO_SESIONES } from '../../dominio/repositorios/repositorio-sesiones';
import type { RepositorioSesiones } from '../../dominio/repositorios/repositorio-sesiones';
import { REPOSITORIO_CUENTAS_EMPRESA } from '../../dominio/repositorios/repositorio-cuentas-empresa';
import type { RepositorioCuentasEmpresa } from '../../dominio/repositorios/repositorio-cuentas-empresa';
import { RELOJ } from '../../aplicacion/puertos/reloj.puerto';
import type { Reloj } from '../../aplicacion/puertos/reloj.puerto';
import type { ContextoSolicitud } from '../../aplicacion/puertos/contexto-solicitud';
import { ES_PUBLICO_KEY } from './publico.decorador';
import { PERMISOS_REQUERIDOS_KEY } from './requiere-permiso.decorador';

export function derivarPermisos(roles: string[]): string[] {
    const permisos = new Set<string>();
    for (const rol of roles) {
        if (rol === 'SUPER_ADMINISTRADOR') {
            [
                'ACC-UC-001',
                'ACC-UC-005',
                'ACC-UC-006',
                'ACC-UC-007',
                'ACC-UC-008',
                'ACC-UC-010',
                'ACC-UC-011',
                'ACC-UC-012',
            ].forEach((p) => permisos.add(p));
        } else if (rol === 'ADMINISTRADOR') {
            [
                'ACC-UC-001',
                'ACC-UC-002',
                'ACC-UC-003',
                'ACC-UC-004',
                'ACC-UC-005',
                'ACC-UC-008',
                'ACC-UC-009',
                'ACC-UC-010',
                'ACC-UC-011',
                'ACC-UC-012',
            ].forEach((p) => permisos.add(p));
        } else if (rol === 'CAPATAZ' || rol === 'EMPLEADO') {
            ['ACC-UC-002', 'ACC-UC-003', 'ACC-UC-004', 'ACC-UC-009'].forEach((p) => permisos.add(p));
        }
    }
    return Array.from(permisos);
}

@Injectable()
export class AutenticacionGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        @Inject(GENERADOR_TOKENS) private readonly generadorTokens: GeneradorTokens,
        @Inject(REPOSITORIO_SESIONES) private readonly repoSesiones: RepositorioSesiones,
        @Inject(REPOSITORIO_CUENTAS_EMPRESA) private readonly repoCuentas: RepositorioCuentasEmpresa,
        @Inject(RELOJ) private readonly reloj: Reloj,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const esPublico = this.reflector.getAllAndOverride<boolean>(ES_PUBLICO_KEY, [context.getHandler(), context.getClass()]);

        if (esPublico) {
            return true;
        }

        const req = context.switchToHttp().getRequest<Request & { contexto?: ContextoSolicitud }>();
        const authHeader = (req.headers.authorization || req.headers.Authorization) as string | undefined;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Token de acceso Bearer requerido.');
        }

        const token = authHeader.slice(7).trim();
        let payload: PayloadTokenVerificado;
        try {
            payload = await this.generadorTokens.verificarTokenAcceso(token);
        } catch {
            throw new UnauthorizedException('Token de acceso inválido o expirado.');
        }

        let contexto: ContextoSolicitud;

        if (payload.aud === 'tarefero:plataforma') {
            contexto = {
                actorId: payload.sub,
                rol: 'SUPER_ADMINISTRADOR',
                permisos: derivarPermisos(['SUPER_ADMINISTRADOR']),
                sesionId: payload.sesionId,
            };
        } else {
            if (!payload.sesionId || !payload.empresaId) {
                throw new UnauthorizedException('Token tenant incompleto.');
            }

            const sesion = await this.repoSesiones.buscarPorId(payload.sesionId);
            if (!sesion || !sesion.estaVigente(this.reloj.ahora())) {
                throw new UnauthorizedException('Sesión expirada o revocada.');
            }

            const cuenta = await this.repoCuentas.buscarPorId(payload.sub, payload.empresaId);
            if (!cuenta || !cuenta.estaActiva()) {
                throw new UnauthorizedException('Cuenta inexistente o suspendida.');
            }

            contexto = {
                actorId: cuenta.id,
                empresaId: payload.empresaId,
                sesionId: payload.sesionId,
                rol: payload.rol,
                permisos: derivarPermisos(cuenta.roles),
                empleadoId: cuenta.empleadoId,
            };
        }

        req.contexto = contexto;

        const permisosRequeridos = this.reflector.getAllAndOverride<string[]>(PERMISOS_REQUERIDOS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (permisosRequeridos && permisosRequeridos.length > 0) {
            const tienePermiso = permisosRequeridos.every((p) => contexto.permisos.includes(p));
            if (!tienePermiso) {
                throw new ForbiddenException('ACC_ACCESO_DENEGADO');
            }
        }

        return true;
    }
}
