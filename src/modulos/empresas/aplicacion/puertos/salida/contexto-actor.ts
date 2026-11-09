/**
 * EMP-DEP-001 — Contexto de autenticación y autorización
 * Proporcionado por Identidad y Acceso (ACC).
 */
export type RolActor = 'SuperAdministrador' | 'Administrador' | 'Invitado';

export interface ContextoActor {
  actorId: string;
  rol: RolActor;
  empresaId?: string;
}
