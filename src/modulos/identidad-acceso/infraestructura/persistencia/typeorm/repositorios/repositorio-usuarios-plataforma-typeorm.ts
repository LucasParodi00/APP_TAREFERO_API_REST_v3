import { Repository } from 'typeorm';
import { UsuarioPlataforma } from '../../../../dominio/entidades/usuario-plataforma';
import { RepositorioUsuariosPlataforma } from '../../../../aplicacion/puertos/salida/repositorio-usuarios-plataforma';
import { UsuarioPlataformaTypeOrmEntidad } from '../entidades/usuario-plataforma.typeorm-entidad';

export class RepositorioUsuariosPlataformaTypeOrm implements RepositorioUsuariosPlataforma {
  constructor(
    private readonly repositorioTypeOrm: Repository<UsuarioPlataformaTypeOrmEntidad>,
  ) {}

  public async contarTotal(): Promise<number> {
    return this.repositorioTypeOrm.count();
  }

  public async contarActivos(): Promise<number> {
    return this.repositorioTypeOrm.count({ where: { activo: true } });
  }

  public async buscarPorId(id: string): Promise<UsuarioPlataforma | null> {
    const entidad = await this.repositorioTypeOrm.findOne({ where: { id } });
    if (!entidad) {
      return null;
    }
    return UsuarioPlataforma.crear({
      id: entidad.id,
      rol: 'SUPER_ADMINISTRADOR',
      activo: entidad.activo,
      creadoEn: entidad.creadoEn,
    });
  }

  public async guardar(usuario: UsuarioPlataforma): Promise<void> {
    await this.repositorioTypeOrm.save({
      id: usuario.id,
      rol: usuario.rol,
      activo: usuario.activo,
      creadoEn: usuario.creadoEn,
    });
  }
}
