import { HabilitarCuentaEmpresa } from '../../aplicacion/comandos/habilitar-cuenta-empresa.caso-de-uso';
import { ConsultarCuentasEmpresa } from '../../aplicacion/consultas/consultar-cuentas-empresa.caso-de-uso';
import { CambiarEstadoCuenta } from '../../aplicacion/comandos/cambiar-estado-cuenta.caso-de-uso';
import { ActualizarRolesCanalesCuenta } from '../../aplicacion/comandos/actualizar-roles-canales-cuenta.caso-de-uso';
import { VincularEmpleado } from '../../aplicacion/comandos/vincular-empleado.caso-de-uso';
import { RepositorioCuentasEmpresa } from '../../dominio/repositorios/repositorio-cuentas-empresa';
import { RepositorioSesiones } from '../../dominio/repositorios/repositorio-sesiones';
import { ResolvedorEmpresa } from '../../aplicacion/puertos/resolvedor-empresa.puerto';
import { VerificadorCupoAcceso } from '../../aplicacion/puertos/verificador-cupo-acceso.puerto';
import { VerificadorEmpleado } from '../../aplicacion/puertos/verificador-empleado.puerto';
import { ServicioHash } from '../../aplicacion/puertos/servicio-hash.puerto';
import { Reloj } from '../../aplicacion/puertos/reloj.puerto';
import { ConsultaCuentasEmpresa } from '../../aplicacion/puertos/consulta-cuentas-empresa.puerto';
import { ContextoSolicitud } from '../../aplicacion/puertos/contexto-solicitud';
import { RolCodigo } from '../../dominio/enumeraciones/rol-codigo.enum';
import { EstadoCuenta } from '../../dominio/enumeraciones/estado-cuenta.enum';
import { CuentaEmpresa } from '../../dominio/entidades/cuenta-empresa.entidad';
import { CorreoAcceso } from '../../dominio/objetos-valor/correo-acceso.vo';
import {
    AccesoDenegado,
    EmpresaNoHabilitada,
    ConflictoVersionOptimista,
    EmpleadoNoDisponible,
} from '../../aplicacion/errores/errores-aplicacion';
import {
    CorreoDuplicado,
    EmpresaFueraDeAlcance,
    LimiteAccesosAlcanzado,
    CuentaEmpleadoDuplicada,
} from '../../dominio/errores/errores-identidad-acceso';

describe('T05 — Gestión de Cuentas de Empresa (ACC)', () => {
    const EMPRESA_ID = '019a0000-0000-7000-8000-000000000001';
    const OTRA_EMPRESA_ID = '019a0000-0000-7000-8000-000000000099';
    const EMPLEADO_ID = '019a0000-0000-7000-8000-000000000002';
    const CUENTA_ID = '019a0000-0000-7000-8000-000000000003';

    let repoCuentas: jest.Mocked<RepositorioCuentasEmpresa>;
    let repoSesiones: jest.Mocked<RepositorioSesiones>;
    let resolvedorEmpresa: jest.Mocked<ResolvedorEmpresa>;
    let verificadorCupo: jest.Mocked<VerificadorCupoAcceso>;
    let verificadorEmpleado: jest.Mocked<VerificadorEmpleado>;
    let servicioHash: jest.Mocked<ServicioHash>;
    let reloj: jest.Mocked<Reloj>;
    let consultaCuentas: jest.Mocked<ConsultaCuentasEmpresa>;

    const contextoAdmin: ContextoSolicitud = {
        actorId: 'admin-1',
        rol: 'ADMINISTRADOR',
        empresaId: EMPRESA_ID,
        permisos: ['ACC-UC-001', 'ACC-UC-008', 'ACC-UC-010', 'ACC-UC-012'],
    };

    beforeEach(() => {
        repoCuentas = {
            guardar: jest.fn().mockResolvedValue(undefined),
            buscarPorId: jest.fn().mockResolvedValue(null),
            buscarPorCorreo: jest.fn().mockResolvedValue(null),
            buscarPorEmpleadoId: jest.fn().mockResolvedValue(null),
            contarActivasPorEmpresa: jest.fn().mockResolvedValue(0),
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
        verificadorCupo = {
            verificarCupoDisponible: jest.fn().mockResolvedValue(true),
        };
        verificadorEmpleado = {
            verificarEmpleadoActivo: jest.fn().mockResolvedValue(true),
        };
        servicioHash = {
            hashearContrasenia: jest.fn().mockResolvedValue('argon2id$mock_hash'),
            verificarContrasenia: jest.fn().mockResolvedValue(true),
            hashearRefresh: jest.fn().mockReturnValue('sha256_mock'),
        };
        reloj = {
            ahora: jest.fn().mockReturnValue(new Date('2026-11-11T12:00:00.000Z')),
        };
        consultaCuentas = {
            consultarPorId: jest.fn().mockResolvedValue(null),
            listarCuentas: jest.fn().mockResolvedValue({
                datos: [],
                paginacion: { limite: 25, desplazamiento: 0, total: 0 },
            }),
        };
    });

    describe('ACC-UC-001 — HabilitarCuentaEmpresa', () => {
        it('crea exitosamente una cuenta para Administrador sin empleadoId', async () => {
            const casoDeUso = new HabilitarCuentaEmpresa(
                repoCuentas,
                resolvedorEmpresa,
                verificadorCupo,
                verificadorEmpleado,
                servicioHash,
            );

            const resultado = await casoDeUso.ejecutar(
                {
                    id: CUENTA_ID,
                    empresaId: EMPRESA_ID,
                    correoAcceso: 'admin@empresa.com',
                    contrasenia: 'ContraseniaSegura123!',
                    accesoWeb: true,
                    accesoMovil: false,
                    roles: [RolCodigo.ADMINISTRADOR],
                },
                contextoAdmin,
            );

            expect(resultado.id).toBe(CUENTA_ID);
            expect(resultado.correoAcceso).toBe('admin@empresa.com');
            expect(resultado.estado).toBe(EstadoCuenta.ACTIVA);
            expect(resultado.version).toBe(1);
            expect((repoCuentas.guardar as jest.Mock).mock.calls.length).toBeGreaterThan(0);
        });

        it('rechaza si el actor no tiene permiso ACC-UC-001', async () => {
            const casoDeUso = new HabilitarCuentaEmpresa(
                repoCuentas,
                resolvedorEmpresa,
                verificadorCupo,
                verificadorEmpleado,
                servicioHash,
            );

            const contextoSinPermiso: ContextoSolicitud = {
                actorId: 'user-1',
                rol: 'EMPLEADO',
                empresaId: EMPRESA_ID,
                permisos: [],
            };

            await expect(
                casoDeUso.ejecutar(
                    {
                        id: CUENTA_ID,
                        empresaId: EMPRESA_ID,
                        correoAcceso: 'admin@empresa.com',
                        contrasenia: 'ContraseniaSegura123!',
                        accesoWeb: true,
                        accesoMovil: false,
                        roles: [RolCodigo.ADMINISTRADOR],
                    },
                    contextoSinPermiso,
                ),
            ).rejects.toThrow(AccesoDenegado);
        });

        it('rechaza si empresaId no coincide con el contexto (ACC-BR-002)', async () => {
            const casoDeUso = new HabilitarCuentaEmpresa(
                repoCuentas,
                resolvedorEmpresa,
                verificadorCupo,
                verificadorEmpleado,
                servicioHash,
            );

            await expect(
                casoDeUso.ejecutar(
                    {
                        id: CUENTA_ID,
                        empresaId: OTRA_EMPRESA_ID,
                        correoAcceso: 'admin@empresa.com',
                        contrasenia: 'ContraseniaSegura123!',
                        accesoWeb: true,
                        accesoMovil: false,
                        roles: [RolCodigo.ADMINISTRADOR],
                    },
                    contextoAdmin,
                ),
            ).rejects.toThrow(EmpresaFueraDeAlcance);
        });

        it('rechaza si la empresa no está ACTIVA', async () => {
            resolvedorEmpresa.buscarPorId.mockResolvedValueOnce({
                id: EMPRESA_ID,
                alias: 'agro-sur',
                estado: 'SUSPENDIDA',
            });

            const casoDeUso = new HabilitarCuentaEmpresa(
                repoCuentas,
                resolvedorEmpresa,
                verificadorCupo,
                verificadorEmpleado,
                servicioHash,
            );

            await expect(
                casoDeUso.ejecutar(
                    {
                        id: CUENTA_ID,
                        empresaId: EMPRESA_ID,
                        correoAcceso: 'admin@empresa.com',
                        contrasenia: 'ContraseniaSegura123!',
                        accesoWeb: true,
                        accesoMovil: false,
                        roles: [RolCodigo.ADMINISTRADOR],
                    },
                    contextoAdmin,
                ),
            ).rejects.toThrow(EmpresaNoHabilitada);
        });

        it('rechaza si se superó el cupo de accesos (ACC-BR-006)', async () => {
            verificadorCupo.verificarCupoDisponible.mockResolvedValueOnce(false);

            const casoDeUso = new HabilitarCuentaEmpresa(
                repoCuentas,
                resolvedorEmpresa,
                verificadorCupo,
                verificadorEmpleado,
                servicioHash,
            );

            await expect(
                casoDeUso.ejecutar(
                    {
                        id: CUENTA_ID,
                        empresaId: EMPRESA_ID,
                        correoAcceso: 'admin@empresa.com',
                        contrasenia: 'ContraseniaSegura123!',
                        accesoWeb: true,
                        accesoMovil: false,
                        roles: [RolCodigo.ADMINISTRADOR],
                    },
                    contextoAdmin,
                ),
            ).rejects.toThrow(LimiteAccesosAlcanzado);
        });

        it('rechaza si el correo ya existe en la Empresa (ACC-BR-003)', async () => {
            const cuentaExistente = CuentaEmpresa.crear({
                id: 'otra-cuenta',
                empresaId: EMPRESA_ID,
                correoAcceso: CorreoAcceso.crear('admin@empresa.com'),
                credencialHash: 'hash',
                accesoWeb: true,
                accesoMovil: false,
                roles: [RolCodigo.ADMINISTRADOR],
            });
            repoCuentas.buscarPorCorreo.mockResolvedValueOnce(cuentaExistente);

            const casoDeUso = new HabilitarCuentaEmpresa(
                repoCuentas,
                resolvedorEmpresa,
                verificadorCupo,
                verificadorEmpleado,
                servicioHash,
            );

            await expect(
                casoDeUso.ejecutar(
                    {
                        id: CUENTA_ID,
                        empresaId: EMPRESA_ID,
                        correoAcceso: 'admin@empresa.com',
                        contrasenia: 'ContraseniaSegura123!',
                        accesoWeb: true,
                        accesoMovil: false,
                        roles: [RolCodigo.ADMINISTRADOR],
                    },
                    contextoAdmin,
                ),
            ).rejects.toThrow(CorreoDuplicado);
        });

        it('rechaza si el Empleado no es válido o no está activo en PER', async () => {
            verificadorEmpleado.verificarEmpleadoActivo.mockResolvedValueOnce(false);

            const casoDeUso = new HabilitarCuentaEmpresa(
                repoCuentas,
                resolvedorEmpresa,
                verificadorCupo,
                verificadorEmpleado,
                servicioHash,
            );

            await expect(
                casoDeUso.ejecutar(
                    {
                        id: CUENTA_ID,
                        empresaId: EMPRESA_ID,
                        empleadoId: EMPLEADO_ID,
                        correoAcceso: 'capataz@empresa.com',
                        contrasenia: 'ContraseniaSegura123!',
                        accesoWeb: false,
                        accesoMovil: true,
                        roles: [RolCodigo.CAPATAZ],
                    },
                    contextoAdmin,
                ),
            ).rejects.toThrow(EmpleadoNoDisponible);
        });
    });

    describe('ACC-UC-008 — ConsultarCuentasEmpresa', () => {
        it('delega a la consulta respetando filtros y permisos', async () => {
            const casoDeUso = new ConsultarCuentasEmpresa(consultaCuentas);

            await casoDeUso.ejecutar(EMPRESA_ID, { limite: 20, desplazamiento: 0 }, contextoAdmin);

            expect((consultaCuentas.listarCuentas as jest.Mock).mock.calls[0]).toEqual([
                EMPRESA_ID,
                { limite: 20, desplazamiento: 0 },
            ]);
        });

        it('rechaza si la empresa solicitada no es del contexto', async () => {
            const casoDeUso = new ConsultarCuentasEmpresa(consultaCuentas);

            await expect(casoDeUso.ejecutar(OTRA_EMPRESA_ID, { limite: 20, desplazamiento: 0 }, contextoAdmin)).rejects.toThrow(
                EmpresaFueraDeAlcance,
            );
        });
    });

    describe('ACC-UC-010 — CambiarEstadoCuenta y ActualizarRolesCanales', () => {
        it('suspende una cuenta activa, revoca sus sesiones e incrementa versión', async () => {
            const cuenta = CuentaEmpresa.crear({
                id: CUENTA_ID,
                empresaId: EMPRESA_ID,
                correoAcceso: CorreoAcceso.crear('admin@empresa.com'),
                credencialHash: 'hash',
                accesoWeb: true,
                accesoMovil: false,
                roles: [RolCodigo.ADMINISTRADOR],
            });
            repoCuentas.buscarPorId.mockResolvedValueOnce(cuenta);

            const casoDeUso = new CambiarEstadoCuenta(repoCuentas, repoSesiones, verificadorCupo, reloj);

            const resultado = await casoDeUso.ejecutar(
                {
                    empresaId: EMPRESA_ID,
                    cuentaId: CUENTA_ID,
                    nuevoEstado: EstadoCuenta.SUSPENDIDA,
                    versionEsperada: 1,
                },
                contextoAdmin,
            );

            expect(resultado.estado).toBe(EstadoCuenta.SUSPENDIDA);
            expect(resultado.version).toBe(2);
            expect((repoSesiones.revocarTodasDeCuenta as jest.Mock).mock.calls[0]).toEqual([CUENTA_ID, reloj.ahora()]);
            expect((repoCuentas.guardar as jest.Mock).mock.calls.length).toBeGreaterThan(0);
        });

        it('rechaza conflicto de versión optimista en If-Match', async () => {
            const cuenta = CuentaEmpresa.crear({
                id: CUENTA_ID,
                empresaId: EMPRESA_ID,
                correoAcceso: CorreoAcceso.crear('admin@empresa.com'),
                credencialHash: 'hash',
                accesoWeb: true,
                accesoMovil: false,
                roles: [RolCodigo.ADMINISTRADOR],
            });
            repoCuentas.buscarPorId.mockResolvedValueOnce(cuenta);

            const casoDeUso = new CambiarEstadoCuenta(repoCuentas, repoSesiones, verificadorCupo, reloj);

            await expect(
                casoDeUso.ejecutar(
                    {
                        empresaId: EMPRESA_ID,
                        cuentaId: CUENTA_ID,
                        nuevoEstado: EstadoCuenta.SUSPENDIDA,
                        versionEsperada: 99,
                    },
                    contextoAdmin,
                ),
            ).rejects.toThrow(ConflictoVersionOptimista);
        });

        it('actualiza canales y roles con versión optimista', async () => {
            const cuenta = CuentaEmpresa.crear({
                id: CUENTA_ID,
                empresaId: EMPRESA_ID,
                correoAcceso: CorreoAcceso.crear('admin@empresa.com'),
                credencialHash: 'hash',
                accesoWeb: true,
                accesoMovil: false,
                roles: [RolCodigo.ADMINISTRADOR],
            });
            repoCuentas.buscarPorId.mockResolvedValueOnce(cuenta);

            const casoDeUso = new ActualizarRolesCanalesCuenta(repoCuentas);

            const resultado = await casoDeUso.ejecutar(
                {
                    empresaId: EMPRESA_ID,
                    cuentaId: CUENTA_ID,
                    accesoWeb: true,
                    accesoMovil: true,
                    roles: [RolCodigo.ADMINISTRADOR],
                    versionEsperada: 1,
                },
                contextoAdmin,
            );

            expect(resultado.accesoMovil).toBe(true);
            expect(resultado.version).toBe(2);
        });
    });

    describe('ACC-UC-012 — VincularEmpleado', () => {
        it('vincula exitosamente un Administrador existente con un Empleado activo (ACC-BR-021, ACC-BR-022)', async () => {
            const cuenta = CuentaEmpresa.crear({
                id: CUENTA_ID,
                empresaId: EMPRESA_ID,
                correoAcceso: CorreoAcceso.crear('admin@empresa.com'),
                credencialHash: 'hash',
                accesoWeb: true,
                accesoMovil: false,
                roles: [RolCodigo.ADMINISTRADOR],
            });
            repoCuentas.buscarPorId.mockResolvedValueOnce(cuenta);

            const casoDeUso = new VincularEmpleado(repoCuentas, verificadorEmpleado);

            const resultado = await casoDeUso.ejecutar(
                {
                    empresaId: EMPRESA_ID,
                    cuentaId: CUENTA_ID,
                    empleadoId: EMPLEADO_ID,
                },
                contextoAdmin,
            );

            expect(resultado.empleadoId).toBe(EMPLEADO_ID);
            expect(resultado.version).toBe(2);
            expect((repoCuentas.guardar as jest.Mock).mock.calls.length).toBeGreaterThan(0);
        });

        it('rechaza si el Empleado ya está vinculado a otra Cuenta (ACC-BR-015)', async () => {
            const cuenta = CuentaEmpresa.crear({
                id: CUENTA_ID,
                empresaId: EMPRESA_ID,
                correoAcceso: CorreoAcceso.crear('admin@empresa.com'),
                credencialHash: 'hash',
                accesoWeb: true,
                accesoMovil: false,
                roles: [RolCodigo.ADMINISTRADOR],
            });
            const otraCuenta = CuentaEmpresa.crear({
                id: 'otra-cuenta',
                empresaId: EMPRESA_ID,
                empleadoId: EMPLEADO_ID,
                correoAcceso: CorreoAcceso.crear('otro@empresa.com'),
                credencialHash: 'hash',
                accesoWeb: false,
                accesoMovil: true,
                roles: [RolCodigo.CAPATAZ],
            });
            repoCuentas.buscarPorId.mockResolvedValueOnce(cuenta);
            repoCuentas.buscarPorEmpleadoId.mockResolvedValueOnce(otraCuenta);

            const casoDeUso = new VincularEmpleado(repoCuentas, verificadorEmpleado);

            await expect(
                casoDeUso.ejecutar(
                    {
                        empresaId: EMPRESA_ID,
                        cuentaId: CUENTA_ID,
                        empleadoId: EMPLEADO_ID,
                    },
                    contextoAdmin,
                ),
            ).rejects.toThrow(CuentaEmpleadoDuplicada);
        });
    });
});
