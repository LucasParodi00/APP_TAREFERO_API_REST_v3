import { Module } from '@nestjs/common';
import { ControladorChacras } from './presentacion/controladores/controlador-chacras';
import { RegistrarChacraCasoDeUso } from './aplicacion/comandos/registrar-chacra.caso-de-uso';
import { ConsultarChacraCasoDeUso } from './aplicacion/consultas/consultar-chacra.caso-de-uso';
import { ListarChacrasCasoDeUso } from './aplicacion/consultas/listar-chacras.caso-de-uso';
import { ModificarChacraCasoDeUso } from './aplicacion/comandos/modificar-chacra.caso-de-uso';
import { InactivarChacraCasoDeUso } from './aplicacion/comandos/inactivar-chacra.caso-de-uso';
import { TOKEN_REPOSITORIO_CHACRAS, RepositorioChacras } from './dominio/repositorios';
import { TOKEN_CONSULTA_CHACRAS, ConsultaChacras } from './aplicacion/consultas';
import { GENERADOR_IDENTIFICADORES, RELOJ, GeneradorIdentificadores, Reloj } from '../../comun/aplicacion';
import {
    TOKEN_CONSULTA_LOTES_ACTIVOS_POR_CHACRA,
    TOKEN_RESOLVEDOR_CHACRA_PUBLICO,
    ConsultaLotesActivosPorChacra,
} from './aplicacion/puertos';
import { AdaptadorConsultaLotesActivosNulo } from './infraestructura/adaptadores/consulta-lotes-activos-nulo.adaptador';
import { AdaptadorResolvedorChacraPublico } from './infraestructura/adaptadores/resolvedor-chacra-publico.adaptador';

@Module({
    controllers: [ControladorChacras],
    providers: [
        {
            provide: TOKEN_CONSULTA_LOTES_ACTIVOS_POR_CHACRA,
            useClass: AdaptadorConsultaLotesActivosNulo,
        },
        {
            provide: TOKEN_RESOLVEDOR_CHACRA_PUBLICO,
            useFactory: (consulta: ConsultaChacras) => new AdaptadorResolvedorChacraPublico(consulta),
            inject: [TOKEN_CONSULTA_CHACRAS],
        },
        {
            provide: RegistrarChacraCasoDeUso,
            useFactory: (repo: RepositorioChacras, gen: GeneradorIdentificadores, reloj: Reloj) =>
                new RegistrarChacraCasoDeUso(repo, gen, reloj),
            inject: [TOKEN_REPOSITORIO_CHACRAS, GENERADOR_IDENTIFICADORES, RELOJ],
        },
        {
            provide: ConsultarChacraCasoDeUso,
            useFactory: (consulta: ConsultaChacras) => new ConsultarChacraCasoDeUso(consulta),
            inject: [TOKEN_CONSULTA_CHACRAS],
        },
        {
            provide: ListarChacrasCasoDeUso,
            useFactory: (consulta: ConsultaChacras) => new ListarChacrasCasoDeUso(consulta),
            inject: [TOKEN_CONSULTA_CHACRAS],
        },
        {
            provide: ModificarChacraCasoDeUso,
            useFactory: (repo: RepositorioChacras, reloj: Reloj) => new ModificarChacraCasoDeUso(repo, reloj),
            inject: [TOKEN_REPOSITORIO_CHACRAS, RELOJ],
        },
        {
            provide: InactivarChacraCasoDeUso,
            useFactory: (repo: RepositorioChacras, consultaLotes: ConsultaLotesActivosPorChacra, reloj: Reloj) =>
                new InactivarChacraCasoDeUso(repo, consultaLotes, reloj),
            inject: [TOKEN_REPOSITORIO_CHACRAS, TOKEN_CONSULTA_LOTES_ACTIVOS_POR_CHACRA, RELOJ],
        },
    ],
    exports: [
        TOKEN_RESOLVEDOR_CHACRA_PUBLICO,
        RegistrarChacraCasoDeUso,
        ConsultarChacraCasoDeUso,
        ListarChacrasCasoDeUso,
        ModificarChacraCasoDeUso,
        InactivarChacraCasoDeUso,
    ],
})
export class TerritorioModule {}
