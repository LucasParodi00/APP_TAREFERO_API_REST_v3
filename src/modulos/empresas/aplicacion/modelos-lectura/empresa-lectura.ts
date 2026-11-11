export interface ConfiguracionGeneralLectura {
    id: string;
    empresaId: string;
    paisReferencia: string;
    zonaHoraria: string;
    monedaPrincipal: string;
    creadoEn: string;
    creadoPor: string;
    actualizadoEn: string;
    actualizadoPor: string;
    version: number;
}

export interface PuntoGeograficoLectura {
    latitud: number;
    longitud: number;
}

export interface EmpresaLectura {
    id: string;
    nombre: string;
    alias: string;
    cuit: string | null;
    responsableNombre: string | null;
    ubicacionTexto: string | null;
    ubicacionGeografica: PuntoGeograficoLectura | null;
    descripcionActividad: string | null;
    estado: string;
    configuracionGeneral: ConfiguracionGeneralLectura;
    creadoEn: string;
    creadoPor: string;
    actualizadoEn: string;
    actualizadoPor: string;
    version: number;
}
