export interface DatosIntervencionSoporteTer {
  usuarioPlataformaId: string;
  empresaId: string;
  motivo: string;
  solicitudId: string;
  sesionId?: string;
}

export interface RegistradorIntervencionSoporteTer {
  registrar(datos: DatosIntervencionSoporteTer): Promise<void>;
}
