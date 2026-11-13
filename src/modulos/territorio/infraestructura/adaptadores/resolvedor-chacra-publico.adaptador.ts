import { Inject, Injectable } from '@nestjs/common';
import type { ConsultaChacras } from '../../aplicacion/consultas';
import { TOKEN_CONSULTA_CHACRAS } from '../../aplicacion/consultas';
import type { ChacraPublica, ResolvedorChacraPublico } from '../../aplicacion/puertos';

@Injectable()
export class AdaptadorResolvedorChacraPublico implements ResolvedorChacraPublico {
    constructor(
        @Inject(TOKEN_CONSULTA_CHACRAS)
        private readonly consultaChacras: ConsultaChacras,
    ) {}

    async resolverPorId(chacraId: string): Promise<ChacraPublica | null> {
        if (this.consultaChacras.resolverPublicoPorId) {
            return this.consultaChacras.resolverPublicoPorId(chacraId);
        }
        return null;
    }
}
