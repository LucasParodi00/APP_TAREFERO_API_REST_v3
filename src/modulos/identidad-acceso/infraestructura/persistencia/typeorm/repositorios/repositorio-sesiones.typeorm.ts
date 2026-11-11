import { Repository, IsNull } from 'typeorm';
import { RepositorioSesiones } from '../../../../dominio/repositorios/repositorio-sesiones';
import { SesionEmpresa } from '../../../../dominio/entidades/sesion-empresa.entidad';
import { SesionEmpresaTypeOrmEntity } from '../entidades/sesion-empresa.typeorm-entity';
import { MapeadorSesionEmpresaTypeOrm } from '../mapeadores/mapeador-sesion-empresa.typeorm';

export class RepositorioSesionesTypeOrm implements RepositorioSesiones {
    constructor(private readonly repository: Repository<SesionEmpresaTypeOrmEntity>) {}

    async guardar(sesion: SesionEmpresa): Promise<void> {
        const entity = MapeadorSesionEmpresaTypeOrm.aPersistencia(sesion);
        await this.repository.save(entity);
    }

    async buscarPorId(id: string): Promise<SesionEmpresa | null> {
        const entity = await this.repository.findOne({
            where: { id },
        });

        if (!entity) {
            return null;
        }

        return MapeadorSesionEmpresaTypeOrm.aDominio(entity);
    }

    async buscarPorHashTokenRenovacion(hash: string): Promise<SesionEmpresa | null> {
        const entity = await this.repository.findOne({
            where: { hashTokenRenovacion: hash },
        });

        if (!entity) {
            return null;
        }

        return MapeadorSesionEmpresaTypeOrm.aDominio(entity);
    }

    async buscarPorFamiliaId(familiaId: string): Promise<SesionEmpresa[]> {
        const entities = await this.repository.find({
            where: { familiaId },
        });

        return entities.map((e) => MapeadorSesionEmpresaTypeOrm.aDominio(e));
    }

    async revocarTodasDeCuenta(cuentaEmpresaId: string, ahora: Date): Promise<void> {
        await this.repository.update({ cuentaEmpresaId, revocadaEn: IsNull() }, { revocadaEn: ahora });
    }

    async revocarFamilia(familiaId: string, ahora: Date): Promise<void> {
        await this.repository.update({ familiaId, revocadaEn: IsNull() }, { revocadaEn: ahora });
    }
}
