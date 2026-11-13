import { Inject, Injectable } from '@nestjs/common';
import type { ContextoSolicitud } from '../../../../comun/aplicacion';
import { CriteriosPaginacion, ResultadoPaginado } from '../../../../comun/aplicacion';
import { EstadoChacra } from '../../dominio/enumeraciones';
import { resolverAlcanceTerritorio } from '../alcance';
import type { ChacraResumenLectura } from '../modelos-lectura';
import type { ConsultaChacras } from './consulta-chacras.puerto';
import { TOKEN_CONSULTA_CHACRAS } from './consulta-chacras.puerto';
import { ErrorAccesoDenegado, ErrorConsultaInvalida } from '../../dominio/errores';

export interface ListarChacrasConsulta {
    limite?: number;
    desplazamiento?: number;
    estado?: string;
    orden?: string;
}

const CAMPOS_ORDEN_PERMITIDOS = ['nombre', 'nombreCorto', 'creadoEn'] as const;
type CampoOrdenPermitido = (typeof CAMPOS_ORDEN_PERMITIDOS)[number];

@Injectable()
export class ListarChacrasCasoDeUso {
    constructor(
        @Inject(TOKEN_CONSULTA_CHACRAS)
        private readonly consultaChacras: ConsultaChacras,
    ) {}

    async ejecutar(
        consulta: ListarChacrasConsulta,
        contexto: ContextoSolicitud,
    ): Promise<ResultadoPaginado<ChacraResumenLectura>> {
        if (!contexto?.permisos?.includes('TER-UC-003')) {
            throw new ErrorAccesoDenegado('No posee permiso TER-UC-003 para listar chacras.');
        }

        if (!contexto?.empresaId) {
            throw new ErrorAccesoDenegado('Contexto inválido: empresa no identificada.');
        }

        const alcance = resolverAlcanceTerritorio(contexto);
        const paginacion = CriteriosPaginacion.crear({
            limite: consulta.limite,
            desplazamiento: consulta.desplazamiento,
        });

        if (alcance.tipo === 'SELECCION' && alcance.chacraIds.length === 0) {
            return ResultadoPaginado.crear([], 0, paginacion);
        }

        let estadoFiltro: EstadoChacra | undefined = undefined;
        if (consulta.estado) {
            const estadoMayus = consulta.estado.toUpperCase();
            const estadosPermitidos: string[] = [EstadoChacra.ACTIVA, EstadoChacra.INACTIVA];
            if (!estadosPermitidos.includes(estadoMayus)) {
                throw new ErrorConsultaInvalida(`El estado "${consulta.estado}" no es válido. Debe ser ACTIVA o INACTIVA.`);
            }
            estadoFiltro = estadoMayus as EstadoChacra;
        }

        let campoOrden: CampoOrdenPermitido = 'creadoEn';
        let direccionOrden: 'ASC' | 'DESC' = 'DESC';

        if (consulta.orden) {
            const partes = consulta.orden.split(':');
            const campo = partes[0].trim();
            const direccion = partes[1]?.trim().toUpperCase();

            if (!CAMPOS_ORDEN_PERMITIDOS.includes(campo as CampoOrdenPermitido)) {
                throw new ErrorConsultaInvalida(
                    `El campo de ordenamiento "${campo}" no es válido. Permitidos: ${CAMPOS_ORDEN_PERMITIDOS.join(', ')}.`,
                );
            }

            if (direccion && direccion !== 'ASC' && direccion !== 'DESC') {
                throw new ErrorConsultaInvalida('El sentido de ordenamiento debe ser ASC o DESC.');
            }

            campoOrden = campo as CampoOrdenPermitido;
            if (direccion) {
                direccionOrden = direccion as 'ASC' | 'DESC';
            }
        }

        return this.consultaChacras.listar({
            empresaId: contexto.empresaId,
            estado: estadoFiltro,
            alcanceChacraIds: alcance.tipo === 'SELECCION' ? alcance.chacraIds : undefined,
            paginacion,
            campoOrden,
            direccionOrden,
        });
    }
}
