import { Repository } from 'typeorm';
import { RepositorioUsuariosPlataforma } from '../../../../dominio/repositorios/repositorio-usuarios-plataforma';
import { UsuarioPlataforma } from '../../../../dominio/entidades/usuario-plataforma.entidad';
import { CorreoAcceso } from '../../../../dominio/objetos-valor/correo-acceso.vo';
import { UsuarioPlataformaTypeOrmEntity } from '../entidades/usuario-plataforma.typeorm-entity';
import { MapeadorUsuarioPlataformaTypeOrm } from '../mapeadores/mapeador-usuario-plataforma.typeorm';

export class RepositorioUsuariosPlataformaTypeOrm implements RepositorioUsuariosPlataforma {
    constructor(private readonly repository: Repository<UsuarioPlataformaTypeOrmEntity>) {}

    async guardar(usuario: UsuarioPlataforma): Promise<void> {
        const entity = MapeadorUsuarioPlataformaTypeOrm.aPersistencia(usuario);
        await this.repository.save(entity);
    }

    async buscarPorId(id: string): Promise<UsuarioPlataforma | null> {
        const entity = await this.repository.findOne({
            where: { id },
        });

        if (!entity) {
            return null;
        }

        return MapeadorUsuarioPlataformaTypeOrm.aDominio(entity);
    }

    async buscarPorCorreo(correo: CorreoAcceso): Promise<UsuarioPlataforma | null> {
        const entity = await this.repository.findOne({
            where: { correo: correo.valor },
        });

        if (!entity) {
            return null;
        }

        return MapeadorUsuarioPlataformaTypeOrm.aDominio(entity);
    }

    async contarActivos(): Promise<number> {
        return this.repository.count({
            where: { activo: true },
        });
    }
}
