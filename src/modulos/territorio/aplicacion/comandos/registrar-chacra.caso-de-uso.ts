import { createHash, randomUUID } from 'crypto';
import {
  Chacra,
  normalizarClaveNombreCorto,
} from '../../dominio/entidades/chacra';
import { PuntoGeografico } from '../../dominio/objetos-valor/ubicacion-geografica';
import { ErrorDominioTerritorio } from '../../dominio/errores/error-dominio-territorio';
import { RepositorioChacras } from '../puertos/salida/repositorio-chacras';
import { VerificadorEmpresaPuertoTer } from '../puertos/salida/verificador-empresa.puerto';
import { GestorIdempotenciaTer } from '../puertos/salida/gestor-idempotencia-ter';
import { RegistradorIntervencionSoporteTer } from '../puertos/salida/registrador-intervencion-soporte.puerto';
import { ContextoActorTer } from '../puertos/salida/contexto-actor-ter';

export interface SolicitudRegistrarChacra {
  id?: string;
  nombre: string;
  nombreCorto: string;
  responsableNombre?: string | null;
  direccionTexto?: string | null;
  ubicacionGeografica?: PuntoGeografico | null;
  idempotencyKey?: string;
}

export interface RespuestaChacraDto {
  id: string;
  empresaId: string;
  nombre: string;
  nombreCorto: string;
  responsableNombre?: string | null;
  direccionTexto?: string | null;
  ubicacionGeografica?: PuntoGeografico;
  estado: string;
  version: number;
}

export class RegistrarChacra {
  constructor(
    private readonly repositorioChacras: RepositorioChacras,
    private readonly verificadorEmpresa: VerificadorEmpresaPuertoTer,
    private readonly gestorIdempotencia?: GestorIdempotenciaTer,
    private readonly registradorSoporte?: RegistradorIntervencionSoporteTer,
  ) {}

  public async ejecutar(
    empresaIdDestino: string,
    solicitud: SolicitudRegistrarChacra,
    contexto: ContextoActorTer,
  ): Promise<RespuestaChacraDto> {
    // 1. Autorización
    this.validarAutorizacion(empresaIdDestino, contexto);

    // 2. Verificación de existencia de Empresa
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

    // 3. Control de Idempotencia
    let solicitudHash = '';
    if (solicitud.idempotencyKey && this.gestorIdempotencia) {
      solicitudHash = createHash('sha256')
        .update(
          JSON.stringify({
            empresaId: empresaIdDestino,
            nombre: solicitud.nombre,
            nombreCorto: solicitud.nombreCorto,
            responsableNombre: solicitud.responsableNombre,
            direccionTexto: solicitud.direccionTexto,
            ubicacionGeografica: solicitud.ubicacionGeografica,
          }),
        )
        .digest('hex');

      const registroPrevio = await this.gestorIdempotencia.obtener(
        solicitud.idempotencyKey,
      );
      if (registroPrevio) {
        if (registroPrevio.solicitudHash !== solicitudHash) {
          throw new ErrorDominioTerritorio(
            'TER_IDEMPOTENCIA_CONFLICTO',
            'La clave de idempotencia ya fue utilizada con una solicitud distinta.',
          );
        }
        return JSON.parse(registroPrevio.respuestaJson) as RespuestaChacraDto;
      }
    }

    // 4. Verificación de unicidad de nombre corto en la Empresa
    const claveNombreCorto = normalizarClaveNombreCorto(solicitud.nombreCorto);
    const duplicado = await this.repositorioChacras.existeNombreCorto(
      empresaIdDestino,
      claveNombreCorto,
    );
    if (duplicado) {
      throw new ErrorDominioTerritorio(
        'TER_NOMBRE_CORTO_DUPLICADO',
        'Ya existe una Chacra con el mismo nombre corto en la Empresa.',
      );
    }

    // 5. Instanciación en el dominio
    const chacraId = solicitud.id ?? randomUUID();
    const chacra = Chacra.registrar({
      id: chacraId,
      empresaId: empresaIdDestino,
      nombre: solicitud.nombre,
      nombreCorto: solicitud.nombreCorto,
      responsableNombre: solicitud.responsableNombre,
      direccionTexto: solicitud.direccionTexto,
      ubicacionGeografica: solicitud.ubicacionGeografica,
      creadoPor: contexto.actorId,
    });

    // 6. Persistencia
    await this.repositorioChacras.guardar(chacra);

    // 7. Registro de auditoría si es soporte de plataforma
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
        codigoEstado: 201,
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
        'El rol del actor no tiene permisos para registrar Chacras.',
      );
    }
  }
}
