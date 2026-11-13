export const VALIDADOR_ARCHIVO_PRIVADO = Symbol('VALIDADOR_ARCHIVO_PRIVADO');

export interface ValidadorArchivoPrivado {
    validarArchivoPerteneceAEmpresa(empresaId: string, archivoId: string): Promise<boolean>;
}
