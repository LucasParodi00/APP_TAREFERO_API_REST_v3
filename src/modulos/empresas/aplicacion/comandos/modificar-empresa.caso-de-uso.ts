import { RepositorioEmpresas } from '../puertos/salida/repositorio-empresas';
import { ContextoActor } from '../puertos/salida/contexto-actor';
import { ErrorDominioEmpresa } from '../../dominio/errores/error-dominio-empresa';
import { PuntoGeografico } from '../../dominio/objetos-valor/ubicacion-geografica';
import { EstadoEmpresa } from '../../dominio/enumeraciones/estado-empresa';

export interface ComandoModificarEmpresa {
  id: string;
  versionConocida: number;
  nombre?: string;
  alias?: string;
  cuit?: string | null;
  responsableNombre?: string | null;
  ubicacionTexto?: string | null;
  ubicacionGeografica?: PuntoGeografico | null;
  descripcionActividad?: string | null;
}

export interface RespuestaModificarEmpresa {
  id: string;
  nombre: string;
  alias: string;
  cuit?: string;
  responsableNombre?: string;
  ubicacionTexto?: string;
  ubicacionGeografica?: PuntoGeografico;
  descripcionActividad?: string;
  estado: EstadoEmpresa;
  actualizadoEn: Date;
  actualizadoPor: string;
  version: number;
}

/**
 * EMP-UC-004 — Modificar Empresa
 * Actores: SuperAdministrador o Administrador (con EMP-BR-007 y EMP-BR-014).
 */
export class ModificarEmpresa {
  constructor(private readonly repositorioEmpresas: RepositorioEmpresas) {}

  public async ejecutar(
    comando: ComandoModificarEmpresa,
    contexto: ContextoActor,
  ): Promise<RespuestaModificarEmpresa> {
    // 2. Verificar permiso y alcance EMP-BR-007
    if (contexto.rol === 'Administrador') {
      if (!contexto.empresaId || contexto.empresaId !== comando.id) {
        throw new ErrorDominioEmpresa(
          'EMP_ACCESO_DENEGADO',
          'Un Administrador solo puede modificar su propia Empresa.',
        );
      }
    } else if (contexto.rol !== 'SuperAdministrador') {
      throw new ErrorDominioEmpresa(
        'EMP_ACCESO_DENEGADO',
        'No posee permisos para modificar esta Empresa.',
      );
    }

    // 3. Obtener la Empresa
    const empresa = await this.repositorioEmpresas.buscarPorId(comando.id);
    if (!empresa) {
      throw new ErrorDominioEmpresa(
        'EMP_EMPRESA_NO_ENCONTRADA',
        `No se encontró la Empresa con identificador '${comando.id}'.`,
      );
    }

    // 5. Verificar concurrencia optimista (convenciones.md §3.5)
    if (empresa.version !== comando.versionConocida) {
      throw new ErrorDominioEmpresa(
        'EMP_VERSION_CONFLICTO',
        `Conflicto de versión. La versión actual es ${empresa.version} y se proporcionó ${comando.versionConocida}.`,
      );
    }

    // 4 y 6. Modificar datos y aplicar reglas de estado (EMP-BR-013, EMP-BR-014, etc.)
    empresa.modificarDatos(
      {
        nombre: comando.nombre,
        alias: comando.alias,
        cuit: comando.cuit,
        responsableNombre: comando.responsableNombre,
        ubicacionTexto: comando.ubicacionTexto,
        ubicacionGeografica: comando.ubicacionGeografica,
        descripcionActividad: comando.descripcionActividad,
      },
      contexto.actorId,
      contexto.rol === 'SuperAdministrador',
    );

    await this.repositorioEmpresas.actualizar(empresa);

    return {
      id: empresa.id,
      nombre: empresa.nombre,
      alias: empresa.alias,
      cuit: empresa.cuit,
      responsableNombre: empresa.responsableNombre,
      ubicacionTexto: empresa.ubicacionTexto,
      ubicacionGeografica: empresa.ubicacionGeografica,
      descripcionActividad: empresa.descripcionActividad,
      estado: empresa.estado,
      actualizadoEn: empresa.actualizadoEn,
      actualizadoPor: empresa.actualizadoPor,
      version: empresa.version,
    };
  }
}
