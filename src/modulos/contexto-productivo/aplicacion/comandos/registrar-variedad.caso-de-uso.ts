import { Variedad } from '../../dominio/entidades/variedad';
import { EstadoCultivo } from '../../dominio/enumeraciones/estado-cultivo';
import { ErrorDominioContextoProductivo } from '../../dominio/errores/error-dominio-contexto-productivo';
import { RepositorioCultivos } from '../puertos/salida/repositorio-cultivos.puerto';
import { RepositorioVariedades } from '../puertos/salida/repositorio-variedades.puerto';
import { ContextoActorContextoProductivo } from '../puertos/salida/contexto-actor.puerto';
import { randomUUID } from 'crypto';

export interface ComandoRegistrarVariedad {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
}

export class RegistrarVariedadCasoDeUso {
  public constructor(
    private readonly repositorioCultivos: RepositorioCultivos,
    private readonly repositorioVariedades: RepositorioVariedades,
  ) {}

  public async ejecutar(
    cultivoId: string,
    comando: ComandoRegistrarVariedad,
    actor: ContextoActorContextoProductivo,
  ): Promise<Variedad> {
    if (actor.rol !== 'SuperAdministrador') {
      throw new ErrorDominioContextoProductivo(
        'CUL_ACCESO_DENEGADO',
        'Solo un SuperAdministrador puede registrar variedades.',
      );
    }

    const cultivo = await this.repositorioCultivos.buscarPorId(cultivoId);
    if (!cultivo) {
      throw new ErrorDominioContextoProductivo(
        'CUL_RECURSO_NO_ENCONTRADO',
        `No se encontró el cultivo con ID ${cultivoId}.`,
      );
    }

    if (cultivo.estado !== EstadoCultivo.ACTIVO) {
      throw new ErrorDominioContextoProductivo(
        'CUL_VARIEDAD_INVALIDA',
        'No se pueden agregar variedades a un cultivo inactivo.',
      );
    }

    const codigoNormalizado = Variedad.normalizarCodigo(comando.codigo || '');
    const existentePorCodigo = await this.repositorioVariedades.buscarPorCodigo(
      cultivoId,
      codigoNormalizado,
    );
    if (existentePorCodigo) {
      throw new ErrorDominioContextoProductivo(
        'CUL_VARIEDAD_INVALIDA',
        `Ya existe una variedad con el código "${codigoNormalizado}" para este cultivo.`,
      );
    }

    const nombreNormalizado = Variedad.normalizarNombre(comando.nombre || '');
    const existentePorNombre =
      await this.repositorioVariedades.buscarPorNombreNormalizado(
        cultivoId,
        nombreNormalizado,
      );
    if (existentePorNombre) {
      throw new ErrorDominioContextoProductivo(
        'CUL_VARIEDAD_INVALIDA',
        `Ya existe una variedad con el nombre "${comando.nombre.trim()}" para este cultivo.`,
      );
    }

    const variedad = Variedad.crear({
      id: randomUUID(),
      cultivoId,
      codigo: comando.codigo,
      nombre: comando.nombre,
      descripcion: comando.descripcion,
    });

    await this.repositorioVariedades.guardar(variedad);
    return variedad;
  }
}
