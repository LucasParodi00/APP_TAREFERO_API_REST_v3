import { RepositorioEmpresas } from '../puertos/salida/repositorio-empresas.puerto';
import { ContextoSolicitud } from '../puertos/comunes/contexto-solicitud';
import { EmpresaLectura } from '../modelos-lectura';
import {
  EmpresaNoEncontrada,
  PermisoDenegado,
  ConflictoConcurrencia,
} from '../errores';
import { MapeadorEmpresaLectura } from '../mapeadores/mapeador-empresa-lectura';

export interface ComandoSuspenderEmpresa {
  id: string;
  versionEsperada: number;
}

export class SuspenderEmpresa {
  constructor(private readonly repositorio: RepositorioEmpresas) {}

  async ejecutar(
    comando: ComandoSuspenderEmpresa,
    contexto: ContextoSolicitud,
  ): Promise<EmpresaLectura> {
    if (contexto.rol !== 'SUPER_ADMINISTRADOR') {
      throw new PermisoDenegado(
        'Solo un SuperAdministrador puede suspender una empresa.',
      );
    }

    const empresa = await this.repositorio.obtenerPorId(comando.id);
    if (!empresa) {
      throw new EmpresaNoEncontrada(comando.id);
    }

    if (empresa.version !== comando.versionEsperada) {
      throw new ConflictoConcurrencia(
        `La versión actual (${empresa.version}) no coincide con la versión esperada (${comando.versionEsperada}).`,
      );
    }

    empresa.suspender(contexto.actorId);

    await this.repositorio.guardar(empresa);

    return MapeadorEmpresaLectura.aLectura(empresa);
  }
}
