import { RepositorioEmpresas } from '../puertos/salida/repositorio-empresas.puerto';
import { ContextoSolicitud } from '../puertos/comunes/contexto-solicitud';
import { CriteriosListadoEmpresas, ResultadoListadoEmpresas } from '../modelos-lectura';
import { PermisoDenegado } from '../errores';

export class ListarEmpresas {
    constructor(private readonly repositorio: RepositorioEmpresas) {}

    async ejecutar(criterios: CriteriosListadoEmpresas, contexto: ContextoSolicitud): Promise<ResultadoListadoEmpresas> {
        if (contexto.rol !== 'SUPER_ADMINISTRADOR') {
            throw new PermisoDenegado('Solo un SuperAdministrador puede listar las empresas.');
        }

        const pagina = Math.max(1, criterios.pagina || 1);
        const limite = Math.min(100, Math.max(1, criterios.limite || 20));

        return this.repositorio.listar({
            pagina,
            limite,
            estado: criterios.estado,
            nombre: criterios.nombre,
        });
    }
}
