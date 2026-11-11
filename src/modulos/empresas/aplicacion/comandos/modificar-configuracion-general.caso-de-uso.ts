import { RepositorioEmpresas } from '../../dominio/repositorios/repositorio-empresas';
import { ContextoSolicitud } from '../puertos/comunes/contexto-solicitud';
import { EmpresaLectura } from '../modelos-lectura';
import { EmpresaNoEncontrada, PermisoDenegado, ConflictoConcurrencia } from '../errores';
import { PaisReferencia, ZonaHoraria, MonedaPrincipal } from '../../dominio/objetos-valor';
import { MapeadorEmpresaLectura } from '../mapeadores/mapeador-empresa-lectura';

export interface ComandoModificarConfiguracionGeneral {
    empresaId: string;
    versionEsperada: number;
    paisReferencia: string;
    zonaHoraria: string;
    monedaPrincipal: string;
}

export class ModificarConfiguracionGeneral {
    constructor(private readonly repositorio: RepositorioEmpresas) {}

    async ejecutar(comando: ComandoModificarConfiguracionGeneral, contexto: ContextoSolicitud): Promise<EmpresaLectura> {
        const esSuperAdmin = contexto.rol === 'SUPER_ADMINISTRADOR';
        const esAdmin = contexto.rol === 'ADMINISTRADOR';

        if (!esSuperAdmin && !esAdmin) {
            throw new PermisoDenegado();
        }

        if (esAdmin && contexto.empresaId !== comando.empresaId) {
            throw new PermisoDenegado('Un administrador solo puede modificar su propia empresa.');
        }

        const empresa = await this.repositorio.obtenerPorId(comando.empresaId);
        if (!empresa) {
            throw new EmpresaNoEncontrada(comando.empresaId);
        }

        if (empresa.version !== comando.versionEsperada) {
            throw new ConflictoConcurrencia(
                `La versión actual (${empresa.version}) no coincide con la versión esperada (${comando.versionEsperada}).`,
            );
        }

        const pais = new PaisReferencia(comando.paisReferencia);
        const zonaHoraria = new ZonaHoraria(comando.zonaHoraria);
        const moneda = new MonedaPrincipal(comando.monedaPrincipal);

        empresa.modificarConfiguracionGeneral({
            paisReferencia: pais,
            zonaHoraria,
            monedaPrincipal: moneda,
            esSuperAdmin,
            actor: contexto.actorId,
        });

        await this.repositorio.guardar(empresa);

        return MapeadorEmpresaLectura.aLectura(empresa);
    }
}
