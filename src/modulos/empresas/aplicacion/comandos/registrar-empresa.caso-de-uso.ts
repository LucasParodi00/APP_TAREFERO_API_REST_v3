import { Empresa } from '../../dominio/entidades/empresa';
import { ConfiguracionGeneralEmpresa } from '../../dominio/entidades/configuracion-general-empresa';
import { AliasEmpresa } from '../../dominio/objetos-valor/alias-empresa';
import { PuntoGeografico } from '../../dominio/objetos-valor/ubicacion-geografica';
import { RepositorioEmpresas } from '../puertos/salida/repositorio-empresas';
import { VerificadorAsignacionComercial } from '../puertos/salida/verificador-asignacion-comercial';
import { ContextoActor } from '../puertos/salida/contexto-actor';
import { ErrorDominioEmpresa } from '../../dominio/errores/error-dominio-empresa';
import { randomUUID } from 'crypto';

export interface ComandoRegistrarEmpresa {
  id?: string;
  nombre: string;
  alias: string;
  cuit?: string | null;
  responsableNombre?: string | null;
  ubicacionTexto?: string | null;
  ubicacionGeografica?: PuntoGeografico | null;
  descripcionActividad?: string | null;
  configuracion?: {
    paisReferencia?: string;
    zonaHoraria?: string;
    monedaPrincipal?: string;
  };
}

export interface RespuestaRegistrarEmpresa {
  id: string;
  alias: string;
  estado: string;
  version: number;
}

/**
 * EMP-UC-001 — Registrar Empresa
 * Actor: SuperAdministrador (matriz de permisos §2).
 */
export class RegistrarEmpresa {
  constructor(
    private readonly repositorioEmpresas: RepositorioEmpresas,
    private readonly verificadorAsignacion: VerificadorAsignacionComercial,
  ) {}

  public async ejecutar(
    comando: ComandoRegistrarEmpresa,
    contexto: ContextoActor,
  ): Promise<RespuestaRegistrarEmpresa> {
    // 2. Verificación de permiso (matriz de permisos: solo SuperAdministrador)
    if (contexto.rol !== 'SuperAdministrador') {
      throw new ErrorDominioEmpresa(
        'EMP_ACCESO_DENEGADO',
        'Solo un SuperAdministrador puede registrar nuevas Empresas.',
      );
    }

    const aliasLimpio = (comando.alias ?? '').trim();
    // Validar formato del alias de inmediato según EMP-BR-011
    AliasEmpresa.crear(aliasLimpio);

    // 3. Validar EMP-BR-012 (Alias único y no reutilizable)
    const aliasExiste = await this.repositorioEmpresas.existeAlias(aliasLimpio);
    if (aliasExiste) {
      throw new ErrorDominioEmpresa(
        'EMP_ALIAS_NO_DISPONIBLE',
        `El alias '${aliasLimpio}' ya está en uso por otra Empresa.`,
      );
    }

    // 4. Validar EMP-BR-009 mediante EMP-DEP-002 (Asignación comercial requerida)
    const tieneAsignacion =
      await this.verificadorAsignacion.tieneAsignacionValida(aliasLimpio);
    if (!tieneAsignacion) {
      throw new ErrorDominioEmpresa(
        'EMP_ASIGNACION_COMERCIAL_REQUERIDA',
        `No se encontró una asignación comercial confirmada para el alias '${aliasLimpio}'.`,
      );
    }

    const empresaId = comando.id ?? randomUUID();
    const configId = randomUUID();

    // 5. Establecer la configuración de EMP-BR-006
    const configuracion = comando.configuracion
      ? ConfiguracionGeneralEmpresa.crear({
          id: configId,
          empresaId,
          paisReferencia: comando.configuracion.paisReferencia,
          zonaHoraria: comando.configuracion.zonaHoraria,
          monedaPrincipal: comando.configuracion.monedaPrincipal,
          creadoPor: contexto.actorId,
        })
      : ConfiguracionGeneralEmpresa.crearInicial({
          id: configId,
          empresaId,
          creadoPor: contexto.actorId,
        });

    // 6. Registrar la Empresa (valida EMP-BR-001, 002, 003, 010, 011, 013)
    const empresa = Empresa.registrar({
      id: empresaId,
      nombre: comando.nombre,
      alias: aliasLimpio,
      cuit: comando.cuit,
      responsableNombre: comando.responsableNombre,
      ubicacionTexto: comando.ubicacionTexto,
      ubicacionGeografica: comando.ubicacionGeografica,
      descripcionActividad: comando.descripcionActividad,
      creadoPor: contexto.actorId,
      configuracion,
    });

    await this.repositorioEmpresas.guardar(empresa);

    return {
      id: empresa.id,
      alias: empresa.alias,
      estado: empresa.estado,
      version: empresa.version,
    };
  }
}
