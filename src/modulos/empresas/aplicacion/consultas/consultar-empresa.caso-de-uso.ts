import { RepositorioEmpresas } from '../puertos/salida/repositorio-empresas';
import { ContextoActor } from '../puertos/salida/contexto-actor';
import { ErrorDominioEmpresa } from '../../dominio/errores/error-dominio-empresa';
import { PuntoGeografico } from '../../dominio/objetos-valor/ubicacion-geografica';
import { EstadoEmpresa } from '../../dominio/enumeraciones/estado-empresa';

export interface RespuestaConsultarEmpresa {
  id: string;
  nombre: string;
  alias: string;
  cuit?: string;
  responsableNombre?: string;
  ubicacionTexto?: string;
  ubicacionGeografica?: PuntoGeografico;
  descripcionActividad?: string;
  estado: EstadoEmpresa;
  creadoEn: Date;
  creadoPor: string;
  actualizadoEn: Date;
  actualizadoPor: string;
  version: number;
  configuracion: {
    id: string;
    paisReferencia: string;
    zonaHoraria: string;
    monedaPrincipal: string;
    version: number;
    actualizadoEn: Date;
    actualizadoPor: string;
  };
}

/**
 * EMP-UC-002 — Consultar Empresa
 * Actores: SuperAdministrador o Administrador (con EMP-BR-007).
 */
export class ConsultarEmpresa {
  constructor(private readonly repositorioEmpresas: RepositorioEmpresas) {}

  public async ejecutar(
    id: string,
    contexto: ContextoActor,
  ): Promise<RespuestaConsultarEmpresa> {
    // 2. Verificar permiso y EMP-BR-007 para Administrador
    if (contexto.rol === 'Administrador') {
      if (!contexto.empresaId || contexto.empresaId !== id) {
        throw new ErrorDominioEmpresa(
          'EMP_ACCESO_DENEGADO',
          'Un Administrador solo puede consultar su propia Empresa.',
        );
      }
    } else if (contexto.rol !== 'SuperAdministrador') {
      throw new ErrorDominioEmpresa(
        'EMP_ACCESO_DENEGADO',
        'No posee permisos para consultar esta Empresa.',
      );
    }

    // 3. Obtener la Empresa
    const empresa = await this.repositorioEmpresas.buscarPorId(id);
    if (!empresa) {
      throw new ErrorDominioEmpresa(
        'EMP_EMPRESA_NO_ENCONTRADA',
        `No se encontró la Empresa con identificador '${id}'.`,
      );
    }

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
      creadoEn: empresa.creadoEn,
      creadoPor: empresa.creadoPor,
      actualizadoEn: empresa.actualizadoEn,
      actualizadoPor: empresa.actualizadoPor,
      version: empresa.version,
      configuracion: {
        id: empresa.configuracion.id,
        paisReferencia: empresa.configuracion.paisReferencia,
        zonaHoraria: empresa.configuracion.zonaHoraria,
        monedaPrincipal: empresa.configuracion.monedaPrincipal,
        version: empresa.configuracion.version,
        actualizadoEn: empresa.configuracion.actualizadoEn,
        actualizadoPor: empresa.configuracion.actualizadoPor,
      },
    };
  }
}
