import { RepositorioEmpresas } from '../../dominio/repositorios/repositorio-empresas';
import { ContextoSolicitud } from '../puertos/comunes/contexto-solicitud';
import { EmpresaLectura } from '../modelos-lectura';
import { EmpresaNoEncontrada, PermisoDenegado, ConflictoConcurrencia } from '../errores';
import { MapeadorEmpresaLectura } from '../mapeadores/mapeador-empresa-lectura';

export interface ComandoReactivarEmpresa {
    id: string;
    versionEsperada: number;
}

export class ReactivarEmpresa {
    constructor(private readonly repositorio: RepositorioEmpresas) {}

    async ejecutar(comando: ComandoReactivarEmpresa, contexto: ContextoSolicitud): Promise<EmpresaLectura> {
        if (contexto.rol !== 'SUPER_ADMINISTRADOR') {
            throw new PermisoDenegado('Solo un SuperAdministrador puede reactivar una empresa.');
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

        empresa.reactivar(contexto.actorId);

        await this.repositorio.guardar(empresa);

        return MapeadorEmpresaLectura.aLectura(empresa);
    }
}
