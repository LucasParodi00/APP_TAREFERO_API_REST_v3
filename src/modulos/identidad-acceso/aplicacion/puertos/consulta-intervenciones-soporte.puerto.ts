import { PaginacionLectura } from './consulta-cuentas-empresa.puerto';

export const CONSULTA_INTERVENCIONES_SOPORTE = Symbol('CONSULTA_INTERVENCIONES_SOPORTE');

export interface FiltrosListarIntervenciones {
    limite: number;
    desplazamiento: number;
}

export interface IntervencionSoporteLectura {
    id: string;
    usuarioPlataformaId: string;
    empresaId: string;
    motivo: string;
    ocurridaEn: Date;
    venceEn: Date;
}

export interface ResultadoListadoIntervenciones {
    datos: IntervencionSoporteLectura[];
    paginacion: PaginacionLectura;
}

export interface ConsultaIntervencionesSoporte {
    listarIntervenciones(empresaId: string, filtros: FiltrosListarIntervenciones): Promise<ResultadoListadoIntervenciones>;
}
