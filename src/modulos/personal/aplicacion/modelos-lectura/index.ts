export interface EmpleadoResumenLectura {
    id: string;
    empresaId: string;
    tipoDocumento: string;
    detalleTipoDocumento?: string;
    numeroDocumento: string;
    nombre: string;
    apellido: string;
    telefonoContacto: string;
    estado: string;
    especialidad?: string;
    fechaInicioLaboral?: string;
    version: number;
    creadoEn: string;
    actualizadoEn: string;
}

export interface EmpleadoDetalleLectura extends EmpleadoResumenLectura {
    fechaNacimiento?: string;
    domicilio?: string;
    grupoSanguineo?: string;
    factorSanguineo?: string;
    notas?: string;
    periodosLaborales: Array<{
        id: string;
        inicio: string;
        fin?: string;
        motivoFin?: string;
    }>;
    contactosEmergencia: Array<{
        id: string;
        nombre: string;
        vinculo: string;
        telefono: string;
    }>;
    licencias: Array<{
        id: string;
        tipo: string;
        numero?: string;
        emitidaEn?: string;
        venceEn?: string;
        archivoId?: string;
    }>;
}

export interface RestriccionOperativaLectura {
    id: string;
    empresaId: string;
    empleadoId: string;
    tipo: string;
    inicio: string;
    fin?: string;
    mensajeOperativo: string;
    anulada: boolean;
    anuladaEn?: string;
    anuladaPorCuentaId?: string;
    motivoAnulacion?: string;
    version: number;
    creadoEn: string;
    actualizadoEn: string;
}

export interface IndisponibilidadLectura {
    id: string;
    empresaId: string;
    empleadoId: string;
    tipo: string;
    inicio: string;
    fin: string;
    mensajeOperativo: string;
    archivoId?: string;
    anulada: boolean;
    anuladaEn?: string;
    anuladaPorCuentaId?: string;
    motivoAnulacion?: string;
    version: number;
    creadoEn: string;
    actualizadoEn: string;
}
