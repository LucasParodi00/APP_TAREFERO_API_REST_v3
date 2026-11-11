import { Repository, UpdateResult, IsNull } from 'typeorm';
import { CuentaEmpresaTypeOrmEntity } from '../../infraestructura/persistencia/typeorm/entidades/cuenta-empresa.typeorm-entity';
import { RolCuentaTypeOrmEntity } from '../../infraestructura/persistencia/typeorm/entidades/rol-cuenta.typeorm-entity';
import { SesionEmpresaTypeOrmEntity } from '../../infraestructura/persistencia/typeorm/entidades/sesion-empresa.typeorm-entity';
import { UsuarioPlataformaTypeOrmEntity } from '../../infraestructura/persistencia/typeorm/entidades/usuario-plataforma.typeorm-entity';
import { IntervencionSoporteTypeOrmEntity } from '../../infraestructura/persistencia/typeorm/entidades/intervencion-soporte.typeorm-entity';
import { RepositorioCuentasEmpresaTypeOrm } from '../../infraestructura/persistencia/typeorm/repositorios/repositorio-cuentas-empresa.typeorm';
import { RepositorioSesionesTypeOrm } from '../../infraestructura/persistencia/typeorm/repositorios/repositorio-sesiones.typeorm';
import { RepositorioUsuariosPlataformaTypeOrm } from '../../infraestructura/persistencia/typeorm/repositorios/repositorio-usuarios-plataforma.typeorm';
import { RepositorioIntervencionesSoporteTypeOrm } from '../../infraestructura/persistencia/typeorm/repositorios/repositorio-intervenciones-soporte.typeorm';
import { ConsultaCuentasEmpresaTypeOrm } from '../../infraestructura/persistencia/typeorm/consultas/consulta-cuentas-empresa.typeorm';
import { ConsultaIntervencionesSoporteTypeOrm } from '../../infraestructura/persistencia/typeorm/consultas/consulta-intervenciones-soporte.typeorm';
import { CuentaEmpresa } from '../../dominio/entidades/cuenta-empresa.entidad';
import { SesionEmpresa } from '../../dominio/entidades/sesion-empresa.entidad';
import { UsuarioPlataforma } from '../../dominio/entidades/usuario-plataforma.entidad';
import { IntervencionSoporte } from '../../dominio/entidades/intervencion-soporte.entidad';
import { CorreoAcceso } from '../../dominio/objetos-valor/correo-acceso.vo';
import { NombreMostrado } from '../../dominio/objetos-valor/nombre-mostrado.vo';
import { MotivoSoporte } from '../../dominio/objetos-valor/motivo-soporte.vo';
import { RolCodigo } from '../../dominio/enumeraciones/rol-codigo.enum';
import { CanalAcceso } from '../../dominio/enumeraciones/canal-acceso.enum';

describe('T09 — Persistencia TypeORM e Integración de Repositorios (ACC)', () => {
    describe('RepositorioCuentasEmpresaTypeOrm', () => {
        let repoTypeOrm: jest.Mocked<Repository<CuentaEmpresaTypeOrmEntity>>;
        let repositorio: RepositorioCuentasEmpresaTypeOrm;

        beforeEach(() => {
            repoTypeOrm = {
                save: jest.fn(),
                findOne: jest.fn(),
                count: jest.fn(),
            } as unknown as jest.Mocked<Repository<CuentaEmpresaTypeOrmEntity>>;
            repositorio = new RepositorioCuentasEmpresaTypeOrm(repoTypeOrm);
        });

        it('guarda una CuentaEmpresa mapeando entidad y roles en cascada', async () => {
            const cuenta = CuentaEmpresa.crear({
                id: 'cuenta-uuid-001',
                empresaId: 'empresa-uuid-001',
                correoAcceso: CorreoAcceso.crear('admin@yerba.com'),
                credencialHash: '$argon2id$mockhash',
                accesoWeb: true,
                accesoMovil: false,
                roles: [RolCodigo.ADMINISTRADOR],
                nombreMostrado: NombreMostrado.crear('Administrador Principal'),
            });

            repoTypeOrm.save.mockResolvedValue({} as CuentaEmpresaTypeOrmEntity);

            await repositorio.guardar(cuenta);

            expect(repoTypeOrm.save.mock.calls.length).toBe(1);
            const entidadGuardada = repoTypeOrm.save.mock.calls[0][0] as CuentaEmpresaTypeOrmEntity;
            expect(entidadGuardada.id).toBe('cuenta-uuid-001');
            expect(entidadGuardada.empresaId).toBe('empresa-uuid-001');
            expect(entidadGuardada.correoAcceso).toBe('admin@yerba.com');
            expect(entidadGuardada.roles).toHaveLength(1);
            expect(entidadGuardada.roles[0].rol).toBe(RolCodigo.ADMINISTRADOR);
        });

        it('obtiene una cuenta por ID y empresaId reconstituyendo el dominio', async () => {
            const entidad: CuentaEmpresaTypeOrmEntity = {
                id: 'cuenta-uuid-001',
                empresaId: 'empresa-uuid-001',
                empleadoId: null,
                nombreMostrado: 'Admin',
                correoAcceso: 'admin@yerba.com',
                contraseniaHash: '$argon2id$mockhash',
                accesoWeb: true,
                accesoMovil: true,
                estado: 'ACTIVA',
                roles: [{ cuentaEmpresaId: 'cuenta-uuid-001', rol: RolCodigo.ADMINISTRADOR } as RolCuentaTypeOrmEntity],
                creadoEn: new Date(),
                creadoPor: 'sistema',
                actualizadoEn: new Date(),
                actualizadoPor: 'sistema',
                version: 1,
            };

            repoTypeOrm.findOne.mockResolvedValue(entidad);

            const cuenta = await repositorio.buscarPorId('cuenta-uuid-001', 'empresa-uuid-001');
            expect(cuenta).not.toBeNull();
            expect(cuenta?.id).toBe('cuenta-uuid-001');
            expect(cuenta?.correoAcceso.valor).toBe('admin@yerba.com');
            expect(cuenta?.tieneRol(RolCodigo.ADMINISTRADOR)).toBe(true);
        });

        it('retorna null si la cuenta no existe o no pertenece a la empresa', async () => {
            repoTypeOrm.findOne.mockResolvedValue(null);

            const cuenta = await repositorio.buscarPorId('cuenta-uuid-001', 'otra-empresa');
            expect(cuenta).toBeNull();
        });

        it('cuenta cuentas activas por empresa', async () => {
            repoTypeOrm.count.mockResolvedValue(5);

            const activas = await repositorio.contarActivasPorEmpresa('empresa-uuid-001');
            expect(activas).toBe(5);
            expect(repoTypeOrm.count.mock.calls[0][0]).toEqual({
                where: { empresaId: 'empresa-uuid-001', estado: 'ACTIVA' },
            });
        });
    });

    describe('RepositorioSesionesTypeOrm', () => {
        let repoTypeOrm: jest.Mocked<Repository<SesionEmpresaTypeOrmEntity>>;
        let repositorio: RepositorioSesionesTypeOrm;

        beforeEach(() => {
            repoTypeOrm = {
                save: jest.fn(),
                findOne: jest.fn(),
                find: jest.fn(),
                update: jest.fn(),
            } as unknown as jest.Mocked<Repository<SesionEmpresaTypeOrmEntity>>;
            repositorio = new RepositorioSesionesTypeOrm(repoTypeOrm);
        });

        it('guarda una sesion mapeando campos de auditoria y rotacion', async () => {
            const sesion = SesionEmpresa.crear({
                id: 'sesion-uuid-001',
                cuentaEmpresaId: 'cuenta-uuid-001',
                empresaId: 'empresa-uuid-001',
                canal: CanalAcceso.WEB,
                creadaEn: new Date(),
                venceEn: new Date(Date.now() + 10000),
                hashTokenRenovacion: 'hashsha256',
                familiaId: 'familia-uuid-001',
            });

            repoTypeOrm.save.mockResolvedValue({} as SesionEmpresaTypeOrmEntity);

            await repositorio.guardar(sesion);

            expect(repoTypeOrm.save.mock.calls.length).toBe(1);
            const entidadGuardada = repoTypeOrm.save.mock.calls[0][0] as SesionEmpresaTypeOrmEntity;
            expect(entidadGuardada.id).toBe('sesion-uuid-001');
            expect(entidadGuardada.hashTokenRenovacion).toBe('hashsha256');
        });

        it('revoca todas las sesiones de una cuenta', async () => {
            const dummyUpdateResult: UpdateResult = { affected: 1, raw: [], generatedMaps: [] };
            repoTypeOrm.update.mockResolvedValue(dummyUpdateResult);
            const ahora = new Date();

            await repositorio.revocarTodasDeCuenta('cuenta-uuid-001', ahora);

            expect(repoTypeOrm.update.mock.calls.length).toBe(1);
            expect(repoTypeOrm.update.mock.calls[0][0]).toEqual({
                cuentaEmpresaId: 'cuenta-uuid-001',
                revocadaEn: IsNull(),
            });
            expect(repoTypeOrm.update.mock.calls[0][1]).toEqual({
                revocadaEn: ahora,
            });
        });

        it('revoca todas las sesiones de una familia ante reutilización detectada (D-03)', async () => {
            const dummyUpdateResult: UpdateResult = { affected: 1, raw: [], generatedMaps: [] };
            repoTypeOrm.update.mockResolvedValue(dummyUpdateResult);
            const ahora = new Date();

            await repositorio.revocarFamilia('familia-uuid-001', ahora);

            expect(repoTypeOrm.update.mock.calls.length).toBe(1);
            expect(repoTypeOrm.update.mock.calls[0][0]).toEqual({
                familiaId: 'familia-uuid-001',
                revocadaEn: IsNull(),
            });
            expect(repoTypeOrm.update.mock.calls[0][1]).toEqual({
                revocadaEn: ahora,
            });
        });
    });

    describe('RepositorioUsuariosPlataformaTypeOrm', () => {
        let repoTypeOrm: jest.Mocked<Repository<UsuarioPlataformaTypeOrmEntity>>;
        let repositorio: RepositorioUsuariosPlataformaTypeOrm;

        beforeEach(() => {
            repoTypeOrm = {
                save: jest.fn(),
                findOne: jest.fn(),
                count: jest.fn(),
            } as unknown as jest.Mocked<Repository<UsuarioPlataformaTypeOrmEntity>>;
            repositorio = new RepositorioUsuariosPlataformaTypeOrm(repoTypeOrm);
        });

        it('guarda un usuario de plataforma reconstituyendo rol SUPER_ADMINISTRADOR', async () => {
            const usuario = UsuarioPlataforma.crear({
                id: 'super-admin-001',
                correo: CorreoAcceso.crear('super@tarefero.com'),
                credencialHash: '$argon2id$mockhash',
                creadoEn: new Date(),
            });

            repoTypeOrm.save.mockResolvedValue({} as UsuarioPlataformaTypeOrmEntity);

            await repositorio.guardar(usuario);
            expect(repoTypeOrm.save.mock.calls.length).toBe(1);
        });

        it('cuenta los usuarios activos de plataforma', async () => {
            repoTypeOrm.count.mockResolvedValue(1);

            const total = await repositorio.contarActivos();
            expect(total).toBe(1);
            expect(repoTypeOrm.count.mock.calls[0][0]).toEqual({
                where: { activo: true },
            });
        });
    });

    describe('RepositorioIntervencionesSoporteTypeOrm', () => {
        let repoTypeOrm: jest.Mocked<Repository<IntervencionSoporteTypeOrmEntity>>;
        let repositorio: RepositorioIntervencionesSoporteTypeOrm;

        beforeEach(() => {
            repoTypeOrm = {
                save: jest.fn(),
                findOne: jest.fn(),
            } as unknown as jest.Mocked<Repository<IntervencionSoporteTypeOrmEntity>>;
            repositorio = new RepositorioIntervencionesSoporteTypeOrm(repoTypeOrm);
        });

        it('guarda una intervencion de soporte con fecha de vencimiento acotada (D-08)', async () => {
            const intervencion = IntervencionSoporte.crear({
                id: 'intervencion-001',
                usuarioPlataformaId: 'super-admin-001',
                empresaId: 'empresa-uuid-001',
                motivo: MotivoSoporte.crear('Diagnostico tecnico de sincronizacion'),
                sesionId: 'sesion-001',
                solicitudId: 'solicitud-001',
                ocurridaEn: new Date(),
                venceEn: new Date(Date.now() + 15 * 60 * 1000),
            });

            repoTypeOrm.save.mockResolvedValue({} as IntervencionSoporteTypeOrmEntity);

            await repositorio.guardar(intervencion);
            expect(repoTypeOrm.save.mock.calls.length).toBe(1);
            const guardada = repoTypeOrm.save.mock.calls[0][0] as IntervencionSoporteTypeOrmEntity;
            expect(guardada.motivo).toBe('Diagnostico tecnico de sincronizacion');
        });
    });

    describe('ConsultaCuentasEmpresaTypeOrm y ConsultaIntervencionesSoporteTypeOrm', () => {
        let repoCuentas: jest.Mocked<Repository<CuentaEmpresaTypeOrmEntity>>;
        let repoIntervenciones: jest.Mocked<Repository<IntervencionSoporteTypeOrmEntity>>;

        beforeEach(() => {
            repoCuentas = {
                findOne: jest.fn(),
                findAndCount: jest.fn(),
            } as unknown as jest.Mocked<Repository<CuentaEmpresaTypeOrmEntity>>;

            repoIntervenciones = {
                findAndCount: jest.fn(),
            } as unknown as jest.Mocked<Repository<IntervencionSoporteTypeOrmEntity>>;
        });

        it('consulta una cuenta por ID para lectura', async () => {
            const consulta = new ConsultaCuentasEmpresaTypeOrm(repoCuentas);
            repoCuentas.findOne.mockResolvedValue({
                id: 'cuenta-001',
                empresaId: 'empresa-001',
                correoAcceso: 'test@empresa.com',
                accesoWeb: true,
                accesoMovil: false,
                estado: 'ACTIVA',
                roles: [{ rol: RolCodigo.ADMINISTRADOR } as RolCuentaTypeOrmEntity],
                version: 1,
            } as CuentaEmpresaTypeOrmEntity);

            const res = await consulta.consultarPorId('empresa-001', 'cuenta-001');
            expect(res).not.toBeNull();
            expect(res?.correoAcceso).toBe('test@empresa.com');
            expect(res?.roles).toEqual([RolCodigo.ADMINISTRADOR]);
        });

        it('lista cuentas paginadas con filtros', async () => {
            const consulta = new ConsultaCuentasEmpresaTypeOrm(repoCuentas);
            repoCuentas.findAndCount.mockResolvedValue([
                [
                    {
                        id: 'cuenta-001',
                        empresaId: 'empresa-001',
                        correoAcceso: 'test@empresa.com',
                        accesoWeb: true,
                        accesoMovil: false,
                        estado: 'ACTIVA',
                        roles: [{ rol: RolCodigo.ADMINISTRADOR } as RolCuentaTypeOrmEntity],
                        version: 1,
                    } as CuentaEmpresaTypeOrmEntity,
                ],
                1,
            ]);

            const res = await consulta.listarCuentas('empresa-001', {
                limite: 10,
                desplazamiento: 0,
                estado: 'ACTIVA',
            });

            expect(res.datos).toHaveLength(1);
            expect(res.paginacion.total).toBe(1);
            expect(res.paginacion.limite).toBe(10);
        });

        it('lista intervenciones de soporte para una empresa', async () => {
            const consulta = new ConsultaIntervencionesSoporteTypeOrm(repoIntervenciones);
            repoIntervenciones.findAndCount.mockResolvedValue([
                [
                    {
                        id: 'inter-001',
                        usuarioPlataformaId: 'super-001',
                        empresaId: 'empresa-001',
                        motivo: 'Revision de sincronizacion',
                        sesionId: 'sesion-001',
                        solicitudId: 'solicitud-001',
                        ocurridaEn: new Date(),
                        venceEn: new Date(),
                    },
                ],
                1,
            ]);

            const res = await consulta.listarIntervenciones('empresa-001', {
                limite: 10,
                desplazamiento: 0,
            });

            expect(res.datos).toHaveLength(1);
            expect(res.datos[0].motivo).toBe('Revision de sincronizacion');
            expect(res.paginacion.total).toBe(1);
        });
    });
});
