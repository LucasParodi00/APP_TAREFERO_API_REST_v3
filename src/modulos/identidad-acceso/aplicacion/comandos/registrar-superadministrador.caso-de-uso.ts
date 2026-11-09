import { createHash, randomUUID } from 'crypto';
import { UsuarioPlataforma } from '../../dominio/entidades/usuario-plataforma';
import { ErrorDominioIdentidadAcceso } from '../../dominio/errores/error-dominio-identidad-acceso';
import { RepositorioUsuariosPlataforma } from '../puertos/salida/repositorio-usuarios-plataforma';
import { GestorIdempotenciaAcc } from '../puertos/salida/gestor-idempotencia-acc';
import { ContextoActorAcc } from '../puertos/salida/contexto-actor-acc';

export interface SolicitudRegistrarSuperAdministrador {
  id?: string;
  rol?: string;
  idempotencyKey?: string;
}

export interface RespuestaRegistrarSuperAdministrador {
  id: string;
  rol: 'SUPER_ADMINISTRADOR';
  activo: boolean;
}

export class RegistrarSuperAdministrador {
  constructor(
    private readonly repositorioUsuarios: RepositorioUsuariosPlataforma,
    private readonly gestorIdempotencia?: GestorIdempotenciaAcc,
  ) {}

  public async ejecutar(
    solicitud: SolicitudRegistrarSuperAdministrador,
    contexto: ContextoActorAcc,
  ): Promise<RespuestaRegistrarSuperAdministrador> {
    // 1. Autorización e inicialización
    if (contexto.rol === 'PROCESO_INICIALIZACION') {
      const total = await this.repositorioUsuarios.contarTotal();
      if (total > 0) {
        throw new ErrorDominioIdentidadAcceso(
          'ACC_INICIALIZACION_NO_PERMITIDA',
          'La plataforma ya ha sido inicializada previamente',
        );
      }
    } else if (contexto.rol !== 'SUPER_ADMINISTRADOR') {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_ACCESO_DENEGADO',
        'Solo un SuperAdministrador puede crear otros SuperAdministradores',
      );
    }

    // 2. Control de idempotencia
    let solicitudHash = '';
    if (solicitud.idempotencyKey && this.gestorIdempotencia) {
      solicitudHash = createHash('sha256')
        .update(
          JSON.stringify({
            id: solicitud.id ?? null,
            rol: solicitud.rol ?? 'SUPER_ADMINISTRADOR',
          }),
        )
        .digest('hex');

      const registroExistente = await this.gestorIdempotencia.obtener(
        solicitud.idempotencyKey,
      );

      if (registroExistente) {
        if (registroExistente.solicitudHash !== solicitudHash) {
          throw new ErrorDominioIdentidadAcceso(
            'ACC_IDEMPOTENCIA_CONFLICTO',
            'La clave de idempotencia ya fue utilizada con una carga diferente',
          );
        }
        return JSON.parse(
          registroExistente.respuestaJson,
        ) as RespuestaRegistrarSuperAdministrador;
      }
    }

    // 3. Regla ACC-BR-007
    const rol = solicitud.rol ?? 'SUPER_ADMINISTRADOR';
    if (rol !== 'SUPER_ADMINISTRADOR') {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_ROL_NO_ADMITIDO',
        'El rol especificado no corresponde a una identidad de plataforma',
      );
    }

    // 4. Crear y persistir
    const nuevoUsuario = UsuarioPlataforma.crear({
      id: solicitud.id ?? randomUUID(),
      rol: 'SUPER_ADMINISTRADOR',
      activo: true,
    });

    await this.repositorioUsuarios.guardar(nuevoUsuario);

    const respuesta: RespuestaRegistrarSuperAdministrador = {
      id: nuevoUsuario.id,
      rol: nuevoUsuario.rol,
      activo: nuevoUsuario.activo,
    };

    // 5. Registrar idempotencia
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
}
