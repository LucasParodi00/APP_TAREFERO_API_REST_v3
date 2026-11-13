export interface ConsultaLotesActivosPorChacra {
    tieneLotesActivos(chacraId: string): Promise<boolean>;
}

export const TOKEN_CONSULTA_LOTES_ACTIVOS_POR_CHACRA = Symbol('TOKEN_CONSULTA_LOTES_ACTIVOS_POR_CHACRA');
