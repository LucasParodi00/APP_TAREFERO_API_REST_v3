import { ConsultaEmpresas } from '../puertos/consulta-empresas.puerto';
import { ContextoSolicitud } from '../puertos/contexto-solicitud';
import { CriteriosListadoEmpresas, ResultadoListadoEmpresas } from '../modelos-lectura';
import { PermisoDenegado } from '../errores';

export class ListarEmpresas {
    constructor(private readonly consultaEmpresas: ConsultaEmpresas) {}

    async ejecutar(criterios: CriteriosListadoEmpresas, contexto: ContextoSolicitud): Promise<ResultadoListadoEmpresas> {
        if (contexto.rol !== 'SUPER_ADMINISTRADOR') {
            throw new PermisoDenegado('Solo un SuperAdministrador puede listar las empresas.');
        }

        const pagina = Math.max(1, criterios.pagina || 1);
        const limite = Math.min(100, Math.max(1, criterios.limite || 20));

        return this.consultaEmpresas.listar({
            pagina,
            limite,
            estado: criterios.estado,
            nombre: criterios.nombre,
        });
    }
}
