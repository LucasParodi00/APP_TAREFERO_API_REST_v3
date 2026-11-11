import { InicializarSuperAdministrador } from '../../aplicacion/comandos/inicializar-super-administrador.caso-de-uso';
import { RegistrarIntervencionSoporte } from '../../aplicacion/comandos/registrar-intervencion-soporte.caso-de-uso';
import { ConsultarIntervencionesSoporte } from '../../aplicacion/consultas/consultar-intervenciones-soporte.caso-de-uso';
import { RepositorioUsuariosPlataforma } from '../../dominio/repositorios/repositorio-usuarios-plataforma';
import { RepositorioIntervencionesSoporte } from '../../dominio/repositorios/repositorio-intervenciones-soporte';
import { ResolvedorEmpresa } from '../../aplicacion/puertos/resolvedor-empresa.puerto';
import { ServicioHash } from '../../aplicacion/puertos/servicio-hash.puerto';
import { Reloj } from '../../aplicacion/puertos/reloj.puerto';
import { ConsultaIntervencionesSoporte } from '../../aplicacion/puertos/consulta-intervenciones-soporte.puerto';
import { ContextoSolicitud } from '../../aplicacion/puertos/contexto-solicitud';
import { RolCodigo } from '../../dominio/enumeraciones/rol-codigo.enum';
import {
    InicializacionNoPermitida,
    MotivoSoporteInvalido,
    EmpresaFueraDeAlcance,
} from '../../dominio/errores/errores-identidad-acceso';
import { AccesoDenegado, EmpresaNoHabilitada } from '../../aplicacion/errores/errores-aplicacion';

describe('T07 — Identidad de Plataforma y Soporte Técnico (ACC)', () => {
    const EMPRESA_ID = '019a0000-0000-7000-8000-000000000001';
    const OTRA_EMPRESA_ID = '019a0000-0000-7000-8000-000000000099';
    const SUPER_ADMIN_ID = '019a0000-0000-7000-8000-000000000002';
    const SESION_PLAT_ID = '019a0000-0000-7000-8000-000000000003';
    const SOLICITUD_ID = '019a0000-0000-7000-8000-000000000004';
    const AHORA = new Date('2026-11-11T12:00:00.000Z');

    let repoUsuariosPlat: jest.Mocked<RepositorioUsuariosPlataforma>;
    let repoIntervenciones: jest.Mocked<RepositorioIntervencionesSoporte>;
    let resolvedorEmpresa: jest.Mocked<ResolvedorEmpresa>;
    let servicioHash: jest.Mocked<ServicioHash>;
    let reloj: jest.Mocked<Reloj>;
    let consultaIntervenciones: jest.Mocked<ConsultaIntervencionesSoporte>;

    const contextoSuperAdmin: ContextoSolicitud = {
        actorId: SUPER_ADMIN_ID,
        rol: RolCodigo.SUPER_ADMINISTRADOR,
        sesionId: SESION_PLAT_ID,
        permisos: ['ACC-UC-006', 'ACC-UC-007', 'ACC-UC-011'],
    };

    const contextoAdminTenant: ContextoSolicitud = {
        actorId: 'admin-1',
        rol: RolCodigo.ADMINISTRADOR,
        empresaId: EMPRESA_ID,
        permisos: ['ACC-UC-011'],
    };

    beforeEach(() => {
        repoUsuariosPlat = {
            guardar: jest.fn().mockResolvedValue(undefined),
            buscarPorId: jest.fn().mockResolvedValue(null),
            buscarPorCorreo: jest.fn().mockResolvedValue(null),
            contarActivos: jest.fn().mockResolvedValue(0),
        };
        repoIntervenciones = {
            guardar: jest.fn().mockResolvedValue(undefined),
            buscarPorId: jest.fn().mockResolvedValue(null),
        };
        resolvedorEmpresa = {
            buscarPorId: jest.fn().mockResolvedValue({ id: EMPRESA_ID, alias: 'agro-sur', estado: 'ACTIVA' }),
            buscarPorAlias: jest.fn().mockResolvedValue({ id: EMPRESA_ID, alias: 'agro-sur', estado: 'ACTIVA' }),
        };
        servicioHash = {
            hashearContrasenia: jest.fn().mockResolvedValue('argon2id$mock_super'),
            verificarContrasenia: jest.fn().mockResolvedValue(true),
            hashearRefresh: jest.fn().mockReturnValue('sha256_mock'),
        };
        reloj = {
            ahora: jest.fn().mockReturnValue(AHORA),
        };
        consultaIntervenciones = {
            listarIntervenciones: jest.fn().mockResolvedValue({
                datos: [],
                paginacion: { limite: 25, desplazamiento: 0, total: 0 },
            }),
        };
    });

    describe('ACC-UC-006 — InicializarSuperAdministrador', () => {
        it('crea el primer SuperAdministrador mediante bootstrap con clave secreta válida', async () => {
            const casoDeUso = new InicializarSuperAdministrador(
                repoUsuariosPlat,
                servicioHash,
                reloj,
                'secreto_bootstrap_correcto',
            );

            const respuesta = await casoDeUso.ejecutar({
                claveSecretaBootstrapping: 'secreto_bootstrap_correcto',
                correoSuperAdmin: 'superadmin@tarefero.com',
                contraseniaSuperAdmin: 'SuperContrasenia123!',
            });

            expect(respuesta.mensaje).toBe('Plataforma inicializada exitosamente.');
            expect((repoUsuariosPlat.guardar as jest.Mock).mock.calls.length).toBeGreaterThan(0);
        });

        it('rechaza si la clave de bootstrap es incorrecta', async () => {
            const casoDeUso = new InicializarSuperAdministrador(
                repoUsuariosPlat,
                servicioHash,
                reloj,
                'secreto_bootstrap_correcto',
            );

            await expect(
                casoDeUso.ejecutar({
                    claveSecretaBootstrapping: 'clave_incorrecta',
                    correoSuperAdmin: 'superadmin@tarefero.com',
                    contraseniaSuperAdmin: 'SuperContrasenia123!',
                }),
            ).rejects.toThrow(AccesoDenegado);
        });

        it('rechaza con ACC_INICIALIZACION_NO_PERMITIDA si ya existe al menos un SuperAdmin activo', async () => {
            repoUsuariosPlat.contarActivos.mockResolvedValueOnce(1);

            const casoDeUso = new InicializarSuperAdministrador(
                repoUsuariosPlat,
                servicioHash,
                reloj,
                'secreto_bootstrap_correcto',
            );

            await expect(
                casoDeUso.ejecutar({
                    claveSecretaBootstrapping: 'secreto_bootstrap_correcto',
                    correoSuperAdmin: 'superadmin@tarefero.com',
                    contraseniaSuperAdmin: 'SuperContrasenia123!',
                }),
            ).rejects.toThrow(InicializacionNoPermitida);
        });
    });

    describe('ACC-UC-007 — RegistrarIntervencionSoporte', () => {
        it('registra exitosamente una intervención con vigencia de 15 minutos (D-08, ACC-BR-011)', async () => {
            const casoDeUso = new RegistrarIntervencionSoporte(repoIntervenciones, resolvedorEmpresa, reloj);

            const resultado = await casoDeUso.ejecutar(
                {
                    empresaId: EMPRESA_ID,
                    motivo: 'Asistencia para desbloqueo de cuenta del Administrador',
                    solicitudId: SOLICITUD_ID,
                },
                contextoSuperAdmin,
            );

            expect(resultado.empresaId).toBe(EMPRESA_ID);
            expect(resultado.usuarioPlataformaId).toBe(SUPER_ADMIN_ID);
            expect(resultado.motivo).toBe('Asistencia para desbloqueo de cuenta del Administrador');
            expect(resultado.ocurridaEn).toEqual(AHORA);
            expect(resultado.venceEn).toEqual(new Date(AHORA.getTime() + 15 * 60 * 1000));
            expect((repoIntervenciones.guardar as jest.Mock).mock.calls.length).toBeGreaterThan(0);
        });

        it('rechaza si el actor no es SuperAdministrador', async () => {
            const casoDeUso = new RegistrarIntervencionSoporte(repoIntervenciones, resolvedorEmpresa, reloj);

            await expect(
                casoDeUso.ejecutar(
                    {
                        empresaId: EMPRESA_ID,
                        motivo: 'Asistencia técnica',
                        solicitudId: SOLICITUD_ID,
                    },
                    contextoAdminTenant,
                ),
            ).rejects.toThrow(AccesoDenegado);
        });

        it('rechaza si la Empresa destino no existe o no está ACTIVA', async () => {
            resolvedorEmpresa.buscarPorId.mockResolvedValueOnce(null);

            const casoDeUso = new RegistrarIntervencionSoporte(repoIntervenciones, resolvedorEmpresa, reloj);

            await expect(
                casoDeUso.ejecutar(
                    {
                        empresaId: 'inexistente',
                        motivo: 'Asistencia técnica',
                        solicitudId: SOLICITUD_ID,
                    },
                    contextoSuperAdmin,
                ),
            ).rejects.toThrow(EmpresaNoHabilitada);
        });

        it('rechaza si el motivo está vacío o excede los 1000 caracteres (ACC-BR-020)', async () => {
            const casoDeUso = new RegistrarIntervencionSoporte(repoIntervenciones, resolvedorEmpresa, reloj);

            await expect(
                casoDeUso.ejecutar(
                    {
                        empresaId: EMPRESA_ID,
                        motivo: '   ',
                        solicitudId: SOLICITUD_ID,
                    },
                    contextoSuperAdmin,
                ),
            ).rejects.toThrow(MotivoSoporteInvalido);
        });
    });

    describe('ACC-UC-011 — ConsultarIntervencionesSoporte', () => {
        it('permite consultar el historial de intervenciones al Administrador de la Empresa', async () => {
            const casoDeUso = new ConsultarIntervencionesSoporte(consultaIntervenciones);

            await casoDeUso.ejecutar(EMPRESA_ID, { limite: 25, desplazamiento: 0 }, contextoAdminTenant);

            expect((consultaIntervenciones.listarIntervenciones as jest.Mock).mock.calls[0]).toEqual([
                EMPRESA_ID,
                { limite: 25, desplazamiento: 0 },
            ]);
        });

        it('rechaza si el Administrador intenta consultar intervenciones de otra Empresa', async () => {
            const casoDeUso = new ConsultarIntervencionesSoporte(consultaIntervenciones);

            await expect(
                casoDeUso.ejecutar(OTRA_EMPRESA_ID, { limite: 25, desplazamiento: 0 }, contextoAdminTenant),
            ).rejects.toThrow(EmpresaFueraDeAlcance);
        });
    });
});
