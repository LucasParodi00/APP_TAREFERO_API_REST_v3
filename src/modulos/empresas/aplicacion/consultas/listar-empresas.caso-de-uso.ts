import {
  CriteriosListadoEmpresas,
  RepositorioEmpresas,
  ResultadoPaginado,
} from '../puertos/salida/repositorio-empresas';
import { ContextoActor } from '../puertos/salida/contexto-actor';
import { ErrorDominioEmpresa } from '../../dominio/errores/error-dominio-empresa';
import { EstadoEmpresa } from '../../dominio/enumeraciones/estado-empresa';

export interface SolicitudListarEmpresas {
  estado?: EstadoEmpresa;
  nombre?: string;
  limite?: number;
  desplazamiento?: number;
  orden?: {
    campo: 'nombre' | 'creadoEn' | 'actualizadoEn';
    direccion: 'asc' | 'desc';
  };
}

export interface RespuestaResumenEmpresa {
  id: string;
  nombre: string;
  alias: string;
  cuit?: string;
  estado: EstadoEmpresa;
  creadoEn: Date;
  version: number;
}

/**
 * EMP-UC-003 — Listar Empresas
 * Actor: SuperAdministrador (matriz de permisos §2).
 */
export class ListarEmpresas {
  constructor(private readonly repositorioEmpresas: RepositorioEmpresas) {}

  public async ejecutar(
    solicitud: SolicitudListarEmpresas,
    contexto: ContextoActor,
  ): Promise<ResultadoPaginado<RespuestaResumenEmpresa>> {
    // 2. Verificar permiso
    if (contexto.rol !== 'SuperAdministrador') {
      throw new ErrorDominioEmpresa(
        'EMP_ACCESO_DENEGADO',
        'Solo un SuperAdministrador puede listar todas las Empresas.',
      );
    }

    const limite = solicitud.limite ?? 25;
    const desplazamiento = solicitud.desplazamiento ?? 0;

    // Validación de paginación según convenciones.md §3.2
    if (limite < 1 || limite > 100 || desplazamiento < 0) {
      throw new ErrorDominioEmpresa(
        'EMP_CONSULTA_INVALIDA',
        'Los parámetros de paginación son inválidos (límite entre 1 y 100, desplazamiento no negativo).',
      );
    }

    if (
      solicitud.estado &&
      !Object.values(EstadoEmpresa).includes(solicitud.estado)
    ) {
      throw new ErrorDominioEmpresa(
        'EMP_CONSULTA_INVALIDA',
        'El estado de filtro indicado no es válido.',
      );
    }

    const criterios: CriteriosListadoEmpresas = {
      estado: solicitud.estado,
      nombre: solicitud.nombre,
      limite,
      desplazamiento,
      orden: solicitud.orden,
    };

    const resultado = await this.repositorioEmpresas.listar(criterios);

    return {
      datos: resultado.datos.map((emp) => ({
        id: emp.id,
        nombre: emp.nombre,
        alias: emp.alias,
        cuit: emp.cuit,
        estado: emp.estado,
        creadoEn: emp.creadoEn,
        version: emp.version,
      })),
      paginacion: resultado.paginacion,
    };
  }
}
