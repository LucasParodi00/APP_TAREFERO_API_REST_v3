import { Cultivo } from '../../dominio/entidades/cultivo';
import { ErrorDominioContextoProductivo } from '../../dominio/errores/error-dominio-contexto-productivo';
import { RepositorioCultivos } from '../puertos/salida/repositorio-cultivos.puerto';
import { ContextoActorContextoProductivo } from '../puertos/salida/contexto-actor.puerto';
import { randomUUID } from 'crypto';

export interface ComandoRegistrarCultivo {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
}

export class RegistrarCultivoCasoDeUso {
  public constructor(
    private readonly repositorioCultivos: RepositorioCultivos,
  ) {}

  public async ejecutar(
    comando: ComandoRegistrarCultivo,
    actor: ContextoActorContextoProductivo,
  ): Promise<Cultivo> {
    if (actor.rol !== 'SuperAdministrador') {
      throw new ErrorDominioContextoProductivo(
        'CUL_ACCESO_DENEGADO',
        'Solo un SuperAdministrador puede administrar el catálogo global de cultivos.',
      );
    }

    const codigoNormalizado = Cultivo.normalizarCodigo(comando.codigo || '');
    const existentePorCodigo =
      await this.repositorioCultivos.buscarPorCodigo(codigoNormalizado);
    if (existentePorCodigo) {
      throw new ErrorDominioContextoProductivo(
        'CUL_CULTIVO_DUPLICADO',
        `Ya existe un cultivo con el código "${codigoNormalizado}".`,
      );
    }

    const nombreNormalizado = Cultivo.normalizarNombre(comando.nombre || '');
    const existentePorNombre =
      await this.repositorioCultivos.buscarPorNombreNormalizado(
        nombreNormalizado,
      );
    if (existentePorNombre) {
      throw new ErrorDominioContextoProductivo(
        'CUL_CULTIVO_DUPLICADO',
        `Ya existe un cultivo con el nombre "${comando.nombre.trim()}".`,
      );
    }

    const cultivo = Cultivo.crear({
      id: randomUUID(),
      codigo: comando.codigo,
      nombre: comando.nombre,
      descripcion: comando.descripcion,
    });

    await this.repositorioCultivos.guardar(cultivo);
    return cultivo;
  }
}
