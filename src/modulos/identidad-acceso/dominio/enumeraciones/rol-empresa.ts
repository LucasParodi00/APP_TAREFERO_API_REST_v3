export enum RolEmpresa {
  ADMINISTRADOR = 'ADMINISTRADOR',
  CAPATAZ = 'CAPATAZ',
  EMPLEADO = 'EMPLEADO',
}

export const ROLES_EMPRESA_VALIDOS: readonly string[] = [
  RolEmpresa.ADMINISTRADOR,
  RolEmpresa.CAPATAZ,
  RolEmpresa.EMPLEADO,
];
