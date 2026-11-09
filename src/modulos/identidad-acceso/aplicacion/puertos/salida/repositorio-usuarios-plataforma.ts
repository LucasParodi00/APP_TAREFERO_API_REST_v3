import { UsuarioPlataforma } from '../../../dominio/entidades/usuario-plataforma';

export interface RepositorioUsuariosPlataforma {
  contarTotal(): Promise<number>;
  contarActivos(): Promise<number>;
  buscarPorId(id: string): Promise<UsuarioPlataforma | null>;
  guardar(usuario: UsuarioPlataforma): Promise<void>;
}
