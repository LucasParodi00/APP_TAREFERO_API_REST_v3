import { Injectable } from '@nestjs/common';
import type { ConsultaLotesActivosPorChacra } from '../../aplicacion/puertos';

@Injectable()
export class AdaptadorConsultaLotesActivosNulo implements ConsultaLotesActivosPorChacra {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tieneLotesActivos(_chacraId: string): Promise<boolean> {
        return Promise.resolve(false);
    }
}
