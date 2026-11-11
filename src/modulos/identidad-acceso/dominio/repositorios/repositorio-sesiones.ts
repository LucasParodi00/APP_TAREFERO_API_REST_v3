import { SesionEmpresa } from '../entidades/sesion-empresa.entidad';

export const REPOSITORIO_SESIONES = Symbol('REPOSITORIO_SESIONES');

export interface RepositorioSesiones {
    guardar(sesion: SesionEmpresa): Promise<void>;
    buscarPorId(id: string): Promise<SesionEmpresa | null>;
    buscarPorHashTokenRenovacion(hash: string): Promise<SesionEmpresa | null>;
    buscarPorFamiliaId(familiaId: string): Promise<SesionEmpresa[]>;
    revocarTodasDeCuenta(cuentaEmpresaId: string, ahora: Date): Promise<void>;
    revocarFamilia(familiaId: string, ahora: Date): Promise<void>;
}
