import { RepositorioEmpresas } from '../puertos/salida/repositorio-empresas';
import { ContextoActor } from '../puertos/salida/contexto-actor';
import { ErrorDominioEmpresa } from '../../dominio/errores/error-dominio-empresa';
import { EstadoEmpresa } from '../../dominio/enumeraciones/estado-empresa';

export interface ComandoModificarConfiguracionGeneral {
  empresaId: string;
  versionConocida: number;
  paisReferencia?: string;
  zonaHoraria?: string;
  monedaPrincipal?: string;
}

export interface RespuestaModificarConfiguracionGeneral {
  id: string;
  empresaId: string;
  paisReferencia: string;
  zonaHoraria: string;
  monedaPrincipal: string;
  actualizadoEn: Date;
  actualizadoPor: string;
  version: number;
}

/**
 * EMP-UC-008 — Modificar configuración general
 * Actores: SuperAdministrador o Administrador (con EMP-BR-007 y EMP-BR-014).
 */
export class ModificarConfiguracionGeneral {
  constructor(private readonly repositorioEmpresas: RepositorioEmpresas) {}

  public async ejecutar(
    comando: ComandoModificarConfiguracionGeneral,
    contexto: ContextoActor,
  ): Promise<RespuestaModificarConfiguracionGeneral> {
    // 2. Verificar permiso y alcance EMP-BR-007
    if (contexto.rol === 'Administrador') {
      if (!contexto.empresaId || contexto.empresaId !== comando.empresaId) {
        throw new ErrorDominioEmpresa(
          'EMP_ACCESO_DENEGADO',
          'Un Administrador solo puede modificar la configuración de su propia Empresa.',
        );
      }
    } else if (contexto.rol !== 'SuperAdministrador') {
      throw new ErrorDominioEmpresa(
        'EMP_ACCESO_DENEGADO',
        'No posee permisos para modificar esta configuración.',
      );
    }

    // 3. Obtener la Empresa y verificar EMP-BR-014
    const empresa = await this.repositorioEmpresas.buscarPorId(
      comando.empresaId,
    );
    if (!empresa) {
      throw new ErrorDominioEmpresa(
        'EMP_EMPRESA_NO_ENCONTRADA',
        `No se encontró la Empresa con identificador '${comando.empresaId}'.`,
      );
    }

    if (empresa.estado === EstadoEmpresa.CERRADA) {
      throw new ErrorDominioEmpresa(
        'EMP_MODIFICACION_NO_PERMITIDA',
        'Una Empresa cerrada no admite modificaciones.',
      );
    }

    if (
      empresa.estado === EstadoEmpresa.SUSPENDIDA &&
      contexto.rol !== 'SuperAdministrador'
    ) {
      throw new ErrorDominioEmpresa(
        'EMP_MODIFICACION_NO_PERMITIDA',
        'Una Empresa suspendida solo puede ser modificada por el SuperAdministrador.',
      );
    }

    // 5. Verificar concurrencia optimista en la configuración
    if (empresa.configuracion.version !== comando.versionConocida) {
      throw new ErrorDominioEmpresa(
        'EMP_VERSION_CONFLICTO',
        `Conflicto de versión en configuración. La versión actual es ${empresa.configuracion.version} y se proporcionó ${comando.versionConocida}.`,
      );
    }

    // 4 y 6. Modificar configuración y persistir
    empresa.configuracion.modificar({
      paisReferencia: comando.paisReferencia,
      zonaHoraria: comando.zonaHoraria,
      monedaPrincipal: comando.monedaPrincipal,
      actualizadoPor: contexto.actorId,
    });

    await this.repositorioEmpresas.actualizarConfiguracion(
      empresa.configuracion,
    );

    return {
      id: empresa.configuracion.id,
      empresaId: empresa.id,
      paisReferencia: empresa.configuracion.paisReferencia,
      zonaHoraria: empresa.configuracion.zonaHoraria,
      monedaPrincipal: empresa.configuracion.monedaPrincipal,
      actualizadoEn: empresa.configuracion.actualizadoEn,
      actualizadoPor: empresa.configuracion.actualizadoPor,
      version: empresa.configuracion.version,
    };
  }
}
