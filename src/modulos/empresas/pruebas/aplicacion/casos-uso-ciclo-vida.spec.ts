import { SuspenderEmpresa } from '../../aplicacion/comandos/suspender-empresa.caso-de-uso';
import { ReactivarEmpresa } from '../../aplicacion/comandos/reactivar-empresa.caso-de-uso';
import { CerrarEmpresa } from '../../aplicacion/comandos/cerrar-empresa.caso-de-uso';
import { RepositorioEmpresas } from '../../dominio/repositorios/repositorio-empresas';
import { Empresa } from '../../dominio/agregados/empresa';
import { NombreEmpresa, AliasEmpresa } from '../../dominio/objetos-valor';
import { PermisoDenegado, EmpresaNoEncontrada, ConflictoConcurrencia } from '../../aplicacion/errores';
import { TransicionEstadoInvalida } from '../../dominio/errores';

class RepositorioEmpresasEnMemoria implements RepositorioEmpresas {
    private empresas = new Map<string, Empresa>();

    guardar(empresa: Empresa): Promise<void> {
        this.empresas.set(empresa.id, empresa);
        return Promise.resolve();
    }

    obtenerPorId(id: string): Promise<Empresa | null> {
        return Promise.resolve(this.empresas.get(id) ?? null);
    }

    async existeAlias(alias: string): Promise<boolean> {
        for (const emp of this.empresas.values()) {
            if (emp.alias.valor === alias) {
                return Promise.resolve(true);
            }
        }
        return Promise.resolve(false);
    }
}

describe('Casos de Uso — Ciclo de Vida de Empresas (T05)', () => {
    let repo: RepositorioEmpresasEnMemoria;
    const superAdminCtx = {
        actorId: 'super-admin-1',
        rol: 'SUPER_ADMINISTRADOR',
    };
    const adminCtx = {
        actorId: 'admin-1',
        rol: 'ADMINISTRADOR',
        empresaId: 'empresa-1',
    };

    beforeEach(async () => {
        repo = new RepositorioEmpresasEnMemoria();
        const empresa = Empresa.crear({
            id: 'empresa-1',
            nombre: new NombreEmpresa('Yerba Norte'),
            alias: new AliasEmpresa('yerba-norte'),
            actor: 'super-admin-1',
        });
        await repo.guardar(empresa);
    });

    describe('EMP-UC-005 — SuspenderEmpresa', () => {
        it('permite al SuperAdministrador suspender una empresa activa con versión coincidente', async () => {
            const uc = new SuspenderEmpresa(repo);
            const res = await uc.ejecutar({ id: 'empresa-1', versionEsperada: 1 }, superAdminCtx);

            expect(res.estado).toBe('SUSPENDIDA');
            expect(res.version).toBe(2);
        });

        it('rechaza con PermisoDenegado a un Administrador', async () => {
            const uc = new SuspenderEmpresa(repo);
            await expect(uc.ejecutar({ id: 'empresa-1', versionEsperada: 1 }, adminCtx)).rejects.toThrow(PermisoDenegado);
        });

        it('rechaza con ConflictoConcurrencia si la version esperada no coincide', async () => {
            const uc = new SuspenderEmpresa(repo);
            await expect(uc.ejecutar({ id: 'empresa-1', versionEsperada: 99 }, superAdminCtx)).rejects.toThrow(
                ConflictoConcurrencia,
            );
        });

        it('rechaza con EmpresaNoEncontrada si la empresa no existe', async () => {
            const uc = new SuspenderEmpresa(repo);
            await expect(uc.ejecutar({ id: 'inexistente', versionEsperada: 1 }, superAdminCtx)).rejects.toThrow(
                EmpresaNoEncontrada,
            );
        });
    });

    describe('EMP-UC-006 — ReactivarEmpresa', () => {
        beforeEach(async () => {
            const suspender = new SuspenderEmpresa(repo);
            await suspender.ejecutar({ id: 'empresa-1', versionEsperada: 1 }, superAdminCtx);
        });

        it('permite al SuperAdministrador reactivar una empresa suspendida', async () => {
            const uc = new ReactivarEmpresa(repo);
            const res = await uc.ejecutar({ id: 'empresa-1', versionEsperada: 2 }, superAdminCtx);

            expect(res.estado).toBe('ACTIVA');
            expect(res.version).toBe(3);
        });

        it('rechaza reactivación de una empresa que ya está activa', async () => {
            const reactivar = new ReactivarEmpresa(repo);
            await reactivar.ejecutar({ id: 'empresa-1', versionEsperada: 2 }, superAdminCtx);

            await expect(reactivar.ejecutar({ id: 'empresa-1', versionEsperada: 3 }, superAdminCtx)).rejects.toThrow(
                TransicionEstadoInvalida,
            );
        });
    });

    describe('EMP-UC-007 — CerrarEmpresa', () => {
        it('permite al SuperAdministrador cerrar una empresa activa o suspendida', async () => {
            const uc = new CerrarEmpresa(repo);
            const res = await uc.ejecutar({ id: 'empresa-1', versionEsperada: 1 }, superAdminCtx);

            expect(res.estado).toBe('CERRADA');
            expect(res.version).toBe(2);
        });

        it('rechaza volver a cerrar una empresa ya cerrada', async () => {
            const uc = new CerrarEmpresa(repo);
            await uc.ejecutar({ id: 'empresa-1', versionEsperada: 1 }, superAdminCtx);

            await expect(uc.ejecutar({ id: 'empresa-1', versionEsperada: 2 }, superAdminCtx)).rejects.toThrow(
                TransicionEstadoInvalida,
            );
        });
    });
});
