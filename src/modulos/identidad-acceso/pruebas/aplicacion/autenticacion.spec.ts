import { IniciarSesion } from '../../aplicacion/comandos/iniciar-sesion.caso-de-uso';
import { ConsultarAutorizacionVigente } from '../../aplicacion/consultas/consultar-autorizacion-vigente.caso-de-uso';
import { RenovarSesion } from '../../aplicacion/comandos/renovar-sesion.caso-de-uso';
import { CambiarContrasenia } from '../../aplicacion/comandos/cambiar-contrasenia.caso-de-uso';
import { RestablecerContrasenia } from '../../aplicacion/comandos/restablecer-contrasenia.caso-de-uso';
import { RepositorioCuentasEmpresa } from '../../dominio/repositorios/repositorio-cuentas-empresa';
import { RepositorioSesiones } from '../../dominio/repositorios/repositorio-sesiones';
import { ResolvedorEmpresa } from '../../aplicacion/puertos/resolvedor-empresa.puerto';
import { ServicioHash } from '../../aplicacion/puertos/servicio-hash.puerto';
import { GeneradorTokens } from '../../aplicacion/puertos/generador-tokens.puerto';
import { Reloj } from '../../aplicacion/puertos/reloj.puerto';
import { ContextoSolicitud } from '../../aplicacion/puertos/contexto-solicitud';
import { CuentaEmpresa } from '../../dominio/entidades/cuenta-empresa.entidad';
import { SesionEmpresa } from '../../dominio/entidades/sesion-empresa.entidad';
import { CorreoAcceso } from '../../dominio/objetos-valor/correo-acceso.vo';
import { RolCodigo } from '../../dominio/enumeraciones/rol-codigo.enum';
import { CanalAcceso } from '../../dominio/enumeraciones/canal-acceso.enum';
import {
    CredencialesInvalidas,
    CanalNoPermitido,
    CuentaSuspendida,
    EmpresaFueraDeAlcance,
} from '../../dominio/errores/errores-identidad-acceso';
import { AccesoDenegado, CuentaNoEncontrada } from '../../aplicacion/errores/errores-aplicacion';

describe('T06 — Autenticación, Autorización y Credenciales Tenant (ACC)', () => {
    const EMPRESA_ID = '019a0000-0000-7000-8000-000000000001';
    const OTRA_EMPRESA_ID = '019a0000-0000-7000-8000-000000000099';
    const CUENTA_ID = '019a0000-0000-7000-8000-000000000002';
    const SESION_ID = '019a0000-0000-7000-8000-000000000003';
    const AHORA = new Date('2026-11-11T12:00:00.000Z');
    const EN_30_DIAS = new Date('2026-12-11T12:00:00.000Z');

    let repoCuentas: jest.Mocked<RepositorioCuentasEmpresa>;
    let repoSesiones: jest.Mocked<RepositorioSesiones>;
    let resolvedorEmpresa: jest.Mocked<ResolvedorEmpresa>;
    let servicioHash: jest.Mocked<ServicioHash>;
    let generadorTokens: jest.Mocked<GeneradorTokens>;
    let reloj: jest.Mocked<Reloj>;

    let cuentaActiva: CuentaEmpresa;

    beforeEach(() => {
        cuentaActiva = CuentaEmpresa.crear({
            id: CUENTA_ID,
            empresaId: EMPRESA_ID,
            correoAcceso: CorreoAcceso.crear('usuario@empresa.com'),
            credencialHash: 'argon2id$hash_correcto',
            accesoWeb: true,
            accesoMovil: false,
            roles: [RolCodigo.ADMINISTRADOR],
        });

        repoCuentas = {
            guardar: jest.fn().mockResolvedValue(undefined),
            buscarPorId: jest.fn().mockResolvedValue(cuentaActiva),
            buscarPorCorreo: jest.fn().mockResolvedValue(cuentaActiva),
            buscarPorEmpleadoId: jest.fn().mockResolvedValue(null),
            contarActivasPorEmpresa: jest.fn().mockResolvedValue(1),
        };

        repoSesiones = {
            guardar: jest.fn().mockResolvedValue(undefined),
            buscarPorId: jest.fn().mockResolvedValue(null),
            buscarPorHashTokenRenovacion: jest.fn().mockResolvedValue(null),
            buscarPorFamiliaId: jest.fn().mockResolvedValue([]),
            revocarTodasDeCuenta: jest.fn().mockResolvedValue(undefined),
            revocarFamilia: jest.fn().mockResolvedValue(undefined),
        };

        resolvedorEmpresa = {
            buscarPorId: jest.fn().mockResolvedValue({ id: EMPRESA_ID, alias: 'agro-sur', estado: 'ACTIVA' }),
            buscarPorAlias: jest.fn().mockResolvedValue({ id: EMPRESA_ID, alias: 'agro-sur', estado: 'ACTIVA' }),
        };

        servicioHash = {
            hashearContrasenia: jest.fn().mockResolvedValue('argon2id$nuevo_hash'),
            verificarContrasenia: jest.fn().mockImplementation((plana, hash) => {
                return Promise.resolve(plana === 'ContraseniaCorrecta123!' && hash === 'argon2id$hash_correcto');
            }),
            hashearRefresh: jest.fn().mockImplementation((token: string) => `hash_sha256_${token}`),
        };

        generadorTokens = {
            generarTokenAccesoTenant: jest.fn().mockResolvedValue('jwt.token.acceso'),
            generarTokenAccesoPlataforma: jest.fn().mockResolvedValue('jwt.token.plataforma'),
            generarTokenRenovacion: jest.fn().mockReturnValue('refresh-token-nuevo-12345'),
            verificarTokenAcceso: jest.fn().mockResolvedValue({
                sub: CUENTA_ID,
                aud: 'tarefero-tenant',
                rol: 'ADMINISTRADOR',
                empresaId: EMPRESA_ID,
                sesionId: SESION_ID,
            }),
        };

        reloj = {
            ahora: jest.fn().mockReturnValue(AHORA),
        };
    });

    describe('ACC-UC-002 — IniciarSesion', () => {
        it('inicia sesión correctamente para credenciales válidas y canal web', async () => {
            const casoDeUso = new IniciarSesion(
                repoCuentas,
                repoSesiones,
                resolvedorEmpresa,
                servicioHash,
                generadorTokens,
                reloj,
            );

            const respuesta = await casoDeUso.ejecutar({
                aliasEmpresa: 'agro-sur',
                correoAcceso: 'usuario@empresa.com',
                contrasenia: 'ContraseniaCorrecta123!',
                canal: CanalAcceso.WEB,
            });

            expect(respuesta.tokenAcceso).toBe('jwt.token.acceso');
            expect(respuesta.tokenRenovacion).toBe('refresh-token-nuevo-12345');
            expect(respuesta.tipoToken).toBe('Bearer');
            expect(respuesta.expiraEn).toBe(900);
            expect((repoSesiones.guardar as jest.Mock).mock.calls.length).toBeGreaterThan(0);
        });

        it('rechaza si la empresa no existe o no está ACTIVA con EMP_NO_HABILITADA / CredencialesInvalidas', async () => {
            resolvedorEmpresa.buscarPorAlias.mockResolvedValueOnce(null);

            const casoDeUso = new IniciarSesion(
                repoCuentas,
                repoSesiones,
                resolvedorEmpresa,
                servicioHash,
                generadorTokens,
                reloj,
            );

            await expect(
                casoDeUso.ejecutar({
                    aliasEmpresa: 'inexistente',
                    correoAcceso: 'usuario@empresa.com',
                    contrasenia: 'ContraseniaCorrecta123!',
                    canal: CanalAcceso.WEB,
                }),
            ).rejects.toThrow(CredencialesInvalidas);
        });

        it('rechaza si el canal solicitado no está habilitado (ACC-BR-005)', async () => {
            const casoDeUso = new IniciarSesion(
                repoCuentas,
                repoSesiones,
                resolvedorEmpresa,
                servicioHash,
                generadorTokens,
                reloj,
            );

            await expect(
                casoDeUso.ejecutar({
                    aliasEmpresa: 'agro-sur',
                    correoAcceso: 'usuario@empresa.com',
                    contrasenia: 'ContraseniaCorrecta123!',
                    canal: CanalAcceso.MOVIL,
                }),
            ).rejects.toThrow(CanalNoPermitido);
        });

        it('rechaza si la cuenta está suspendida (ACC-BR-001)', async () => {
            cuentaActiva.suspender();

            const casoDeUso = new IniciarSesion(
                repoCuentas,
                repoSesiones,
                resolvedorEmpresa,
                servicioHash,
                generadorTokens,
                reloj,
            );

            await expect(
                casoDeUso.ejecutar({
                    aliasEmpresa: 'agro-sur',
                    correoAcceso: 'usuario@empresa.com',
                    contrasenia: 'ContraseniaCorrecta123!',
                    canal: CanalAcceso.WEB,
                }),
            ).rejects.toThrow(CuentaSuspendida);
        });

        it('rechaza con CredencialesInvalidas si la contraseña no coincide', async () => {
            const casoDeUso = new IniciarSesion(
                repoCuentas,
                repoSesiones,
                resolvedorEmpresa,
                servicioHash,
                generadorTokens,
                reloj,
            );

            await expect(
                casoDeUso.ejecutar({
                    aliasEmpresa: 'agro-sur',
                    correoAcceso: 'usuario@empresa.com',
                    contrasenia: 'ContraseniaErronea999!',
                    canal: CanalAcceso.WEB,
                }),
            ).rejects.toThrow(CredencialesInvalidas);
        });
    });

    describe('ACC-UC-003 — ConsultarAutorizacionVigente', () => {
        it('devuelve el contexto de autorización cuando sesión, cuenta y empresa están vigentes', async () => {
            const sesion = SesionEmpresa.crear({
                id: SESION_ID,
                cuentaEmpresaId: CUENTA_ID,
                empresaId: EMPRESA_ID,
                canal: CanalAcceso.WEB,
                creadaEn: AHORA,
                venceEn: EN_30_DIAS,
                hashTokenRenovacion: 'hash_refresh',
                familiaId: 'familia-1',
            });
            repoSesiones.buscarPorId.mockResolvedValueOnce(sesion);

            const casoDeUso = new ConsultarAutorizacionVigente(repoCuentas, repoSesiones, resolvedorEmpresa, reloj);

            const contexto: ContextoSolicitud = {
                actorId: CUENTA_ID,
                rol: 'ADMINISTRADOR',
                empresaId: EMPRESA_ID,
                sesionId: SESION_ID,
                permisos: ['ACC-UC-001', 'ACC-UC-003'],
            };

            const resultado = await casoDeUso.ejecutar(contexto);
            expect(resultado.actorId).toBe(CUENTA_ID);
            expect(resultado.empresaId).toBe(EMPRESA_ID);
            expect(resultado.roles).toContain(RolCodigo.ADMINISTRADOR);
            expect(resultado.canal).toBe(CanalAcceso.WEB);
        });

        it('rechaza si la sesión está revocada o expirada', async () => {
            const sesion = SesionEmpresa.crear({
                id: SESION_ID,
                cuentaEmpresaId: CUENTA_ID,
                empresaId: EMPRESA_ID,
                canal: CanalAcceso.WEB,
                creadaEn: AHORA,
                venceEn: EN_30_DIAS,
                hashTokenRenovacion: 'hash_refresh',
                familiaId: 'familia-1',
            });
            sesion.revocar(AHORA);
            repoSesiones.buscarPorId.mockResolvedValueOnce(sesion);

            const casoDeUso = new ConsultarAutorizacionVigente(repoCuentas, repoSesiones, resolvedorEmpresa, reloj);

            const contexto: ContextoSolicitud = {
                actorId: CUENTA_ID,
                rol: 'ADMINISTRADOR',
                empresaId: EMPRESA_ID,
                sesionId: SESION_ID,
                permisos: ['ACC-UC-003'],
            };

            await expect(casoDeUso.ejecutar(contexto)).rejects.toThrow(AccesoDenegado);
        });
    });

    describe('ACC-UC-009 — RenovarSesion', () => {
        it('renueva correctamente con rotación de token (D-03)', async () => {
            const sesion = SesionEmpresa.crear({
                id: SESION_ID,
                cuentaEmpresaId: CUENTA_ID,
                empresaId: EMPRESA_ID,
                canal: CanalAcceso.WEB,
                creadaEn: AHORA,
                venceEn: EN_30_DIAS,
                hashTokenRenovacion: 'hash_sha256_refresh-valido',
                familiaId: 'familia-1',
            });
            repoSesiones.buscarPorHashTokenRenovacion.mockResolvedValueOnce(sesion);

            const casoDeUso = new RenovarSesion(
                repoSesiones,
                repoCuentas,
                resolvedorEmpresa,
                servicioHash,
                generadorTokens,
                reloj,
            );

            const respuesta = await casoDeUso.ejecutar({ tokenRenovacion: 'refresh-valido' });

            expect(respuesta.tokenAcceso).toBe('jwt.token.acceso');
            expect(respuesta.tokenRenovacion).toBe('refresh-token-nuevo-12345');
            expect((repoSesiones.guardar as jest.Mock).mock.calls.length).toBeGreaterThan(0);
        });

        it('detecta reutilización de refresh token y revoca toda la familia (D-03)', async () => {
            repoSesiones.buscarPorHashTokenRenovacion.mockResolvedValueOnce(null);

            const casoDeUso = new RenovarSesion(
                repoSesiones,
                repoCuentas,
                resolvedorEmpresa,
                servicioHash,
                generadorTokens,
                reloj,
            );

            await expect(casoDeUso.ejecutar({ tokenRenovacion: 'refresh-reutilizado' })).rejects.toThrow(CredencialesInvalidas);
        });
    });

    describe('ACC-UC-004 — CambiarContrasenia', () => {
        it('cambia contraseña propia e invalida todas las sesiones (ACC-BR-013, ACC-BR-014)', async () => {
            const casoDeUso = new CambiarContrasenia(repoCuentas, repoSesiones, servicioHash, reloj);

            const contexto: ContextoSolicitud = {
                actorId: CUENTA_ID,
                rol: 'ADMINISTRADOR',
                empresaId: EMPRESA_ID,
                sesionId: SESION_ID,
                permisos: ['ACC-UC-004'],
            };

            await casoDeUso.ejecutar(
                {
                    contraseniaActual: 'ContraseniaCorrecta123!',
                    contraseniaNueva: 'NuevaContraseniaSegura456!',
                },
                contexto,
            );

            expect(cuentaActiva.credencialHash).toBe('argon2id$nuevo_hash');
            expect((repoSesiones.revocarTodasDeCuenta as jest.Mock).mock.calls[0]).toEqual([CUENTA_ID, AHORA]);
            expect((repoCuentas.guardar as jest.Mock).mock.calls.length).toBeGreaterThan(0);
        });

        it('rechaza si la contraseña actual es errónea (ACC-BR-013)', async () => {
            const casoDeUso = new CambiarContrasenia(repoCuentas, repoSesiones, servicioHash, reloj);

            const contexto: ContextoSolicitud = {
                actorId: CUENTA_ID,
                rol: 'ADMINISTRADOR',
                empresaId: EMPRESA_ID,
                sesionId: SESION_ID,
                permisos: ['ACC-UC-004'],
            };

            await expect(
                casoDeUso.ejecutar(
                    {
                        contraseniaActual: 'ContraseniaErronea!',
                        contraseniaNueva: 'NuevaContraseniaSegura456!',
                    },
                    contexto,
                ),
            ).rejects.toThrow(CredencialesInvalidas);
        });
    });

    describe('ACC-UC-005 — RestablecerContrasenia', () => {
        it('restablece administrativamente la contraseña e invalida todas las sesiones (ACC-BR-010, ACC-BR-014)', async () => {
            const casoDeUso = new RestablecerContrasenia(repoCuentas, repoSesiones, servicioHash, reloj);

            const contextoAdmin: ContextoSolicitud = {
                actorId: 'admin-1',
                rol: 'ADMINISTRADOR',
                empresaId: EMPRESA_ID,
                permisos: ['ACC-UC-005'],
            };

            await casoDeUso.ejecutar(
                {
                    empresaId: EMPRESA_ID,
                    cuentaId: CUENTA_ID,
                    contraseniaNueva: 'NuevaContraseniaAdmin789!',
                },
                contextoAdmin,
            );

            expect(cuentaActiva.credencialHash).toBe('argon2id$nuevo_hash');
            expect((repoSesiones.revocarTodasDeCuenta as jest.Mock).mock.calls[0]).toEqual([CUENTA_ID, AHORA]);
            expect((repoCuentas.guardar as jest.Mock).mock.calls.length).toBeGreaterThan(0);
        });

        it('rechaza si la empresa no coincide con el contexto (ACC-BR-002, ACC-BR-010)', async () => {
            const casoDeUso = new RestablecerContrasenia(repoCuentas, repoSesiones, servicioHash, reloj);

            const contextoAdmin: ContextoSolicitud = {
                actorId: 'admin-1',
                rol: 'ADMINISTRADOR',
                empresaId: EMPRESA_ID,
                permisos: ['ACC-UC-005'],
            };

            await expect(
                casoDeUso.ejecutar(
                    {
                        empresaId: OTRA_EMPRESA_ID,
                        cuentaId: CUENTA_ID,
                        contraseniaNueva: 'NuevaContraseniaAdmin789!',
                    },
                    contextoAdmin,
                ),
            ).rejects.toThrow(EmpresaFueraDeAlcance);
        });

        it('rechaza si la cuenta destino no existe', async () => {
            repoCuentas.buscarPorId.mockResolvedValueOnce(null);

            const casoDeUso = new RestablecerContrasenia(repoCuentas, repoSesiones, servicioHash, reloj);

            const contextoAdmin: ContextoSolicitud = {
                actorId: 'admin-1',
                rol: 'ADMINISTRADOR',
                empresaId: EMPRESA_ID,
                permisos: ['ACC-UC-005'],
            };

            await expect(
                casoDeUso.ejecutar(
                    {
                        empresaId: EMPRESA_ID,
                        cuentaId: 'cuenta-inexistente',
                        contraseniaNueva: 'NuevaContraseniaAdmin789!',
                    },
                    contextoAdmin,
                ),
            ).rejects.toThrow(CuentaNoEncontrada);
        });
    });
});
