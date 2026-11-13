import { Inject, Injectable } from '@nestjs/common';
import type { ContextoSolicitud, Reloj } from '../../../../comun/aplicacion';
import { RELOJ } from '../../../../comun/aplicacion';
import { EstadoChacra } from '../../dominio/enumeraciones';
import type { RepositorioChacras } from '../../dominio/repositorios';
import { TOKEN_REPOSITORIO_CHACRAS } from '../../dominio/repositorios';
import type { ConsultaLotesActivosPorChacra } from '../puertos';
import { TOKEN_CONSULTA_LOTES_ACTIVOS_POR_CHACRA } from '../puertos';
import {
    ErrorAccesoDenegado,
    ErrorChacraNoEncontrada,
    ErrorVersionConflicto,
    ErrorTransicionChacraInvalida,
    ErrorEstadoChacraLotesIncompatible,
} from '../../dominio/errores';

export interface InactivarChacraComando {
    chacraId: string;
    versionEsperada: number;
}

export interface ResultadoInactivarChacra {
    id: string;
    estado: EstadoChacra;
    actualizadoEn: string;
    version: number;
}

@Injectable()
export class InactivarChacraCasoDeUso {
    constructor(
        @Inject(TOKEN_REPOSITORIO_CHACRAS)
        private readonly repositorio: RepositorioChacras,
        @Inject(TOKEN_CONSULTA_LOTES_ACTIVOS_POR_CHACRA)
        private readonly consultaLotes: ConsultaLotesActivosPorChacra,
        @Inject(RELOJ)
        private readonly reloj: Reloj,
    ) {}

    async ejecutar(comando: InactivarChacraComando, contexto: ContextoSolicitud): Promise<ResultadoInactivarChacra> {
        if (!contexto?.permisos?.includes('TER-UC-005')) {
            throw new ErrorAccesoDenegado('No posee permiso TER-UC-005 para inactivar una chacra.');
        }

        if (!contexto?.empresaId) {
            throw new ErrorAccesoDenegado('Contexto inválido: empresa no identificada.');
        }

        const chacra = await this.repositorio.obtenerPorId(comando.chacraId, contexto.empresaId);
        if (!chacra) {
            throw new ErrorChacraNoEncontrada(comando.chacraId);
        }

        if (chacra.version !== comando.versionEsperada) {
            throw new ErrorVersionConflicto();
        }

        if (chacra.estado === EstadoChacra.INACTIVA) {
            throw new ErrorTransicionChacraInvalida('La chacra ya se encuentra inactiva.');
        }

        const tieneLotesActivos = await this.consultaLotes.tieneLotesActivos(chacra.id);
        if (tieneLotesActivos) {
            throw new ErrorEstadoChacraLotesIncompatible('No se puede inactivar la chacra porque contiene lotes activos.');
        }

        const ahora = this.reloj.ahora();
        const actorId = contexto.actorId;

        chacra.inactivar(ahora, actorId);
        await this.repositorio.guardar(chacra);

        return {
            id: chacra.id,
            estado: chacra.estado,
            actualizadoEn: ahora.toISOString(),
            version: chacra.version,
        };
    }
}
