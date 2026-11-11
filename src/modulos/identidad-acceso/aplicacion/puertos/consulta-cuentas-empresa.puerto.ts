export const CONSULTA_CUENTAS_EMPRESA = Symbol('CONSULTA_CUENTAS_EMPRESA');

export interface FiltrosListarCuentas {
    limite: number;
    desplazamiento: number;
    estado?: string;
    rol?: string;
}

export interface CuentaEmpresaLectura {
    id: string;
    empresaId: string;
    empleadoId?: string;
    nombreMostrado?: string;
    correoAcceso: string;
    accesoWeb: boolean;
    accesoMovil: boolean;
    roles: string[];
    estado: string;
    version: number;
    creadoEn?: Date;
    actualizadoEn?: Date;
}

export interface PaginacionLectura {
    limite: number;
    desplazamiento: number;
    total: number;
}

export interface ResultadoListadoCuentas {
    datos: CuentaEmpresaLectura[];
    paginacion: PaginacionLectura;
}

export interface ConsultaCuentasEmpresa {
    consultarPorId(empresaId: string, cuentaId: string): Promise<CuentaEmpresaLectura | null>;
    listarCuentas(empresaId: string, filtros: FiltrosListarCuentas): Promise<ResultadoListadoCuentas>;
}
