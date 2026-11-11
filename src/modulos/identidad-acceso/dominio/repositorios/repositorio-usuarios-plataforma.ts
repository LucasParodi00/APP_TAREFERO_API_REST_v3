import { UsuarioPlataforma } from '../entidades/usuario-plataforma.entidad';
import { CorreoAcceso } from '../objetos-valor/correo-acceso.vo';

export const REPOSITORIO_USUARIOS_PLATAFORMA = Symbol('REPOSITORIO_USUARIOS_PLATAFORMA');

export interface RepositorioUsuariosPlataforma {
    guardar(usuario: UsuarioPlataforma): Promise<void>;
    buscarPorId(id: string): Promise<UsuarioPlataforma | null>;
    buscarPorCorreo(correo: CorreoAcceso): Promise<UsuarioPlataforma | null>;
    contarActivos(): Promise<number>;
}
