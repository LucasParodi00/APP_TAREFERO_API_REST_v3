import { createHash } from 'crypto';
import { normalizarClaveNombreCorto } from '../../dominio/entidades/chacra';
import { PuntoGeografico } from '../../dominio/objetos-valor/ubicacion-geografica';
import { ErrorDominioTerritorio } from '../../dominio/errores/error-dominio-territorio';
import { RepositorioChacras } from '../puertos/salida/repositorio-chacras';
import { VerificadorEmpresaPuertoTer } from '../puertos/salida/verificador-empresa.puerto';
import { GestorIdempotenciaTer } from '../puertos/salida/gestor-idempotencia-ter';
import { RegistradorIntervencionSoporteTer } from '../puertos/salida/registrador-intervencion-soporte.puerto';
import { ContextoActorTer } from '../puertos/salida/contexto-actor-ter';
import { RespuestaChacraDto } from './registrar-chacra.caso-de-uso';

export interface SolicitudModificarChacra {
  nombre?: string;
  nombreCorto?: string;
  responsableNombre?: string | null;
  direccionTexto?: string | null;
  ubicacionGeografica?: PuntoGeografico | null;
  versionEsperada?: number;
  idempotencyKey?: string;
}

export class ModificarChacra {
  constructor(
    private readonly repositorioChacras: RepositorioChacras,
    private readonly verificadorEmpresa: VerificadorEmpresaPuertoTer,
    private readonly gestorIdempotencia?: GestorIdempotenciaTer,
    private readonly registradorSoporte?: RegistradorIntervencionSoporteTer,
  ) {}

  public async ejecutar(
    empresaIdDestino: string,
    chacraId: string,
    solicitud: SolicitudModificarChacra,
    contexto: ContextoActorTer,
  ): Promise<RespuestaChacraDto> {
    // 1. Autorización
    this.validarAutorizacion(empresaIdDestino, contexto);

    // 2. Existencia de Empresa
    const existeEmpresa =
      await this.verificadorEmpresa.existeEmpresa(empresaIdDestino);
    if (!existeEmpresa) {
      if (contexto.rol === 'SUPER_ADMINISTRADOR') {
        throw new ErrorDominioTerritorio(
          'ACC_EMPRESA_NO_ENCONTRADA',
          'La Empresa destino no existe.',
        );
      }
      throw new ErrorDominioTerritorio(
        'ACC_EMPRESA_FUERA_DE_ALCANCE',
        'La Empresa solicitada no existe o está fuera del alcance.',
      );
    }

    // 3. Control de idempotencia
    let solicitudHash = '';
    if (solicitud.idempotencyKey && this.gestorIdempotencia) {
      solicitudHash = createHash('sha256')
        .update(
          JSON.stringify({
            empresaId: empresaIdDestino,
            chacraId,
            versionEsperada: solicitud.versionEsperada,
            nombre: solicitud.nombre,
            nombreCorto: solicitud.nombreCorto,
            responsableNombre: solicitud.responsableNombre,
            direccionTexto: solicitud.direccionTexto,
            ubicacionGeografica: solicitud.ubicacionGeografica,
          }),
        )
        .digest('hex');

      const previo = await this.gestorIdempotencia.obtener(
        solicitud.idempotencyKey,
      );
      if (previo) {
        if (previo.solicitudHash !== solicitudHash) {
          throw new ErrorDominioTerritorio(
            'TER_IDEMPOTENCIA_CONFLICTO',
            'La clave de idempotencia ya fue utilizada con una solicitud distinta.',
          );
        }
        return JSON.parse(previo.respuestaJson) as RespuestaChacraDto;
      }
    }

    // 4. Búsqueda con bloqueo
    const chacra = await this.repositorioChacras.buscarPorIdConBloqueo(
      empresaIdDestino,
      chacraId,
    );
    if (!chacra) {
      throw new ErrorDominioTerritorio(
        'TER_CHACRA_NO_ENCONTRADA',
        'La Chacra indicada no existe en la Empresa.',
      );
    }

    // 5. Control de concurrencia optimista (If-Match)
    if (
      solicitud.versionEsperada !== undefined &&
      solicitud.versionEsperada !== chacra.version
    ) {
      throw new ErrorDominioTerritorio(
        'TER_VERSION_CONFLICTO',
        `Conflicto de versión. Versión actual: ${chacra.version}, esperada: ${solicitud.versionEsperada}`,
      );
    }

    // 6. Si cambia nombreCorto, validar unicidad
    if (solicitud.nombreCorto !== undefined) {
      const nuevaClave = normalizarClaveNombreCorto(solicitud.nombreCorto);
      if (nuevaClave !== chacra.nombreCortoClave) {
        const existeOtro = await this.repositorioChacras.existeNombreCorto(
          empresaIdDestino,
          nuevaClave,
          chacra.id,
        );
        if (existeOtro) {
          throw new ErrorDominioTerritorio(
            'TER_NOMBRE_CORTO_DUPLICADO',
            'Ya existe otra Chacra con el mismo nombre corto en la Empresa.',
          );
        }
      }
    }

    // 7. Modificación en el dominio (aplica TER-BR-008 e invariantes)
    chacra.modificar({
      nombre: solicitud.nombre,
      nombreCorto: solicitud.nombreCorto,
      responsableNombre: solicitud.responsableNombre,
      direccionTexto: solicitud.direccionTexto,
      ubicacionGeografica: solicitud.ubicacionGeografica,
      actualizadoPor: contexto.actorId,
    });

    // 8. Persistencia
    await this.repositorioChacras.guardar(chacra);

    // 9. Auditoría si es soporte de plataforma
    if (contexto.rol === 'SUPER_ADMINISTRADOR' && this.registradorSoporte) {
      await this.registradorSoporte.registrar({
        usuarioPlataformaId: contexto.actorId,
        empresaId: empresaIdDestino,
        motivo: contexto.motivoSoporte!,
        solicitudId: contexto.solicitudId,
        sesionId: contexto.sesionId,
      });
    }

    const respuesta: RespuestaChacraDto = {
      id: chacra.id,
      empresaId: chacra.empresaId,
      nombre: chacra.nombre,
      nombreCorto: chacra.nombreCorto,
      responsableNombre: chacra.responsableNombre,
      direccionTexto: chacra.direccionTexto,
      ubicacionGeografica: chacra.ubicacionGeografica?.toJSON(),
      estado: chacra.estado,
      version: chacra.version,
    };

    if (solicitud.idempotencyKey && this.gestorIdempotencia) {
      await this.gestorIdempotencia.guardar({
        clave: solicitud.idempotencyKey,
        solicitudHash,
        respuestaJson: JSON.stringify(respuesta),
        codigoEstado: 200,
        creadoEn: new Date(),
      });
    }

    return respuesta;
  }

  private validarAutorizacion(
    empresaIdDestino: string,
    contexto: ContextoActorTer,
  ): void {
    if (contexto.rol === 'ADMINISTRADOR') {
      if (contexto.empresaId !== empresaIdDestino) {
        throw new ErrorDominioTerritorio(
          'ACC_EMPRESA_FUERA_DE_ALCANCE',
          'El Administrador no puede operar en otra Empresa.',
        );
      }
    } else if (contexto.rol === 'SUPER_ADMINISTRADOR') {
      if (
        !contexto.motivoSoporte ||
        contexto.motivoSoporte.trim().length === 0
      ) {
        throw new ErrorDominioTerritorio(
          'ACC_CONTEXTO_SOPORTE_REQUERIDO',
          'Se requiere un motivo de soporte para operar como SuperAdministrador.',
        );
      }
      if (contexto.motivoSoporte.length > 1000) {
        throw new ErrorDominioTerritorio(
          'ACC_MOTIVO_SOPORTE_INVALIDO',
          'El motivo de soporte no puede superar los 1000 caracteres.',
        );
      }
    } else {
      throw new ErrorDominioTerritorio(
        'TER_ACCESO_DENEGADO',
        'El rol del actor no tiene permisos para modificar Chacras.',
      );
    }
  }
}
