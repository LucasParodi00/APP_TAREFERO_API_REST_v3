import { Inject, Injectable } from '@nestjs/common';
import type { ContextoSolicitud } from '../../../../comun/aplicacion';
import { resolverAlcanceTerritorio } from '../alcance';
import type { ChacraDetalleLectura } from '../modelos-lectura';
import type { ConsultaChacras } from './consulta-chacras.puerto';
import { TOKEN_CONSULTA_CHACRAS } from './consulta-chacras.puerto';
import { ErrorAccesoDenegado, ErrorChacraNoEncontrada } from '../../dominio/errores';

@Injectable()
export class ConsultarChacraCasoDeUso {
    constructor(
        @Inject(TOKEN_CONSULTA_CHACRAS)
        private readonly consultaChacras: ConsultaChacras,
    ) {}

    async ejecutar(chacraId: string, contexto: ContextoSolicitud): Promise<ChacraDetalleLectura> {
        if (!contexto?.permisos?.includes('TER-UC-002')) {
            throw new ErrorAccesoDenegado('No posee permiso TER-UC-002 para consultar una chacra.');
        }

        if (!contexto?.empresaId) {
            throw new ErrorAccesoDenegado('Contexto inválido: empresa no identificada.');
        }

        const alcance = resolverAlcanceTerritorio(contexto);
        if (alcance.tipo === 'SELECCION' && !alcance.chacraIds.includes(chacraId)) {
            throw new ErrorAccesoDenegado('La chacra solicitada se encuentra fuera del alcance territorial autorizado.');
        }

        const detalle = await this.consultaChacras.obtenerDetallePorId(chacraId, contexto.empresaId);
        if (!detalle) {
            throw new ErrorChacraNoEncontrada(chacraId);
        }

        return detalle;
    }
}
