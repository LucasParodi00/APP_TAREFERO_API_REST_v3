import { RepositorioEmpresas } from '../puertos/salida/repositorio-empresas';
import { ContextoActor } from '../puertos/salida/contexto-actor';
import { ErrorDominioEmpresa } from '../../dominio/errores/error-dominio-empresa';
import { EstadoEmpresa } from '../../dominio/enumeraciones/estado-empresa';
import { PuntoGeografico } from '../../dominio/objetos-valor/ubicacion-geografica';

export interface ComandoCerrarEmpresa {
  id: string;
  versionConocida: number;
}

export interface RespuestaCerrarEmpresa {
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
 * EMP-UC-007 — Cerrar Empresa
 * Actor: SuperAdministrador
 */
export class CerrarEmpresa {
  public constructor(
    private readonly repositorioEmpresas: RepositorioEmpresas,
  ) {}

  public async ejecutar(
    comando: ComandoCerrarEmpresa,
    contexto: ContextoActor,
  ): Promise<RespuestaCerrarEmpresa> {
    if (contexto.rol !== 'SuperAdministrador') {
      throw new ErrorDominioEmpresa(
        'EMP_ACCESO_DENEGADO',
        'Solo un SuperAdministrador puede cerrar una Empresa.',
      );
    }

    const empresa = await this.repositorioEmpresas.buscarPorId(comando.id);
    if (!empresa) {
      throw new ErrorDominioEmpresa(
        'EMP_EMPRESA_NO_ENCONTRADA',
        `No se encontró la Empresa con ID ${comando.id}.`,
      );
    }

    if (empresa.version !== comando.versionConocida) {
      throw new ErrorDominioEmpresa(
        'EMP_VERSION_CONFLICTO',
        `Conflicto de versión: la versión actual es ${empresa.version} y se esperaba ${comando.versionConocida}.`,
      );
    }

    empresa.cerrar(contexto.actorId);
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
