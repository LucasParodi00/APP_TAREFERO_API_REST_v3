import type { ContextoSolicitud } from '../../../../comun/aplicacion';
import { ErrorAccesoDenegado } from '../../dominio/errores';

export type AlcanceTerritorio = { tipo: 'TODAS' } | { tipo: 'SELECCION'; chacraIds: string[] };

export function resolverAlcanceTerritorio(contexto: ContextoSolicitud): AlcanceTerritorio {
    if (!contexto || !contexto.roles || contexto.roles.length === 0) {
        throw new ErrorAccesoDenegado('Contexto de solicitud no válido o roles no informados.');
    }

    if (contexto.roles.includes('ADMINISTRADOR')) {
        return { tipo: 'TODAS' };
    }

    if (contexto.roles.includes('SUPERADMINISTRADOR')) {
        if (
            contexto.soporte &&
            contexto.soporte.motivo &&
            contexto.soporte.motivo.trim().length > 0 &&
            (!contexto.soporte.venceEn || new Date(contexto.soporte.venceEn).getTime() > Date.now())
        ) {
            return { tipo: 'TODAS' };
        }
        throw new ErrorAccesoDenegado('Se requiere contexto de soporte vigente para operar como superadministrador.');
    }

    if (contexto.roles.includes('CAPATAZ')) {
        if (
            !contexto.alcance ||
            typeof contexto.alcance !== 'object' ||
            Array.isArray(contexto.alcance) ||
            !('chacras' in contexto.alcance) ||
            !Array.isArray((contexto.alcance as { chacras?: unknown }).chacras)
        ) {
            throw new ErrorAccesoDenegado('El capataz debe poseer un alcance territorial explícito y válido.');
        }

        return {
            tipo: 'SELECCION',
            chacraIds: (contexto.alcance as { chacras: unknown[] }).chacras.map(String),
        };
    }

    throw new ErrorAccesoDenegado('El rol del usuario no tiene autorización para operar en territorio.');
}
