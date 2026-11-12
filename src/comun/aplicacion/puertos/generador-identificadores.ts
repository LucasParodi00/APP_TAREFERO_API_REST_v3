export const GENERADOR_IDENTIFICADORES = Symbol('GENERADOR_IDENTIFICADORES');

export interface GeneradorIdentificadores {
    generar(): string;
}
