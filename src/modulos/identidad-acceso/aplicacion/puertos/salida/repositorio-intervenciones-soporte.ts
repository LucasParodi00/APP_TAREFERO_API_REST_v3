import { IntervencionSoporte } from '../../../dominio/entidades/intervencion-soporte';

export interface OpcionesPaginacionIntervenciones {
  limite: number;
  desplazamiento: number;
  orden?: 'ocurridaEn:asc' | 'ocurridaEn:desc';
}

export interface RepositorioIntervencionesSoporte {
  guardar(intervencion: IntervencionSoporte): Promise<void>;
  listarPorEmpresa(
    empresaId: string,
    opciones: OpcionesPaginacionIntervenciones,
  ): Promise<{ datos: IntervencionSoporte[]; total: number }>;
}
