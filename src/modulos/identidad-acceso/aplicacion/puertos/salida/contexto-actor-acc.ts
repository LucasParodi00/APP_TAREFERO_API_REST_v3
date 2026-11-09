export type RolActorAcc =
  | 'SUPER_ADMINISTRADOR'
  | 'ADMINISTRADOR'
  | 'CAPATAZ'
  | 'EMPLEADO'
  | 'PROCESO_INICIALIZACION';

export interface ContextoActorAcc {
  actorId: string;
  rol: RolActorAcc;
  cuentaId?: string;
  empresaId?: string;
  sesionId?: string;
  solicitudId?: string;
}
