import { Response } from 'express';
import { ControladorAutenticacion } from '../../presentacion/controladores/controlador-autenticacion';
import { ControladorCuentasEmpresa } from '../../presentacion/controladores/controlador-cuentas-empresa';
import { ControladorPlataformaSoporte } from '../../presentacion/controladores/controlador-plataforma-soporte';
import { IniciarSesion } from '../../aplicacion/comandos/iniciar-sesion.caso-de-uso';
import { ConsultarAutorizacionVigente } from '../../aplicacion/consultas/consultar-autorizacion-vigente.caso-de-uso';
import { RenovarSesion } from '../../aplicacion/comandos/renovar-sesion.caso-de-uso';
import { CambiarContrasenia } from '../../aplicacion/comandos/cambiar-contrasenia.caso-de-uso';
import { RestablecerContrasenia } from '../../aplicacion/comandos/restablecer-contrasenia.caso-de-uso';
import { HabilitarCuentaEmpresa } from '../../aplicacion/comandos/habilitar-cuenta-empresa.caso-de-uso';
import { ConsultarCuentasEmpresa } from '../../aplicacion/consultas/consultar-cuentas-empresa.caso-de-uso';
import { CambiarEstadoCuenta } from '../../aplicacion/comandos/cambiar-estado-cuenta.caso-de-uso';
import { ActualizarRolesCanalesCuenta } from '../../aplicacion/comandos/actualizar-roles-canales-cuenta.caso-de-uso';
import { VincularEmpleado } from '../../aplicacion/comandos/vincular-empleado.caso-de-uso';
import { InicializarSuperAdministrador } from '../../aplicacion/comandos/inicializar-super-administrador.caso-de-uso';
import { RegistrarIntervencionSoporte } from '../../aplicacion/comandos/registrar-intervencion-soporte.caso-de-uso';
import { ConsultarIntervencionesSoporte } from '../../aplicacion/consultas/consultar-intervenciones-soporte.caso-de-uso';
import { ContextoSolicitud } from '../../aplicacion/puertos/contexto-solicitud';
import { RolCodigo } from '../../dominio/enumeraciones/rol-codigo.enum';
import { CanalAcceso } from '../../dominio/enumeraciones/canal-acceso.enum';

describe('T13 — Presentación: Controladores HTTP y Filtro RFC 9457 (ACC)', () => {
    let mockResponse: jest.Mocked<Response>;

    beforeEach(() => {
        mockResponse = {
            setHeader: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        } as unknown as jest.Mocked<Response>;
    });

    describe('ControladorAutenticacion', () => {
        let iniciarSesionMock: jest.Mocked<IniciarSesion>;
        let autorizacionMock: jest.Mocked<ConsultarAutorizacionVigente>;
        let renovarSesionMock: jest.Mocked<RenovarSesion>;
        let cambiarContraseniaMock: jest.Mocked<CambiarContrasenia>;
        let controlador: ControladorAutenticacion;

        beforeEach(() => {
            iniciarSesionMock = { ejecutar: jest.fn() } as unknown as jest.Mocked<IniciarSesion>;
            autorizacionMock = { ejecutar: jest.fn() } as unknown as jest.Mocked<ConsultarAutorizacionVigente>;
            renovarSesionMock = { ejecutar: jest.fn() } as unknown as jest.Mocked<RenovarSesion>;
            cambiarContraseniaMock = { ejecutar: jest.fn() } as unknown as jest.Mocked<CambiarContrasenia>;

            controlador = new ControladorAutenticacion(
                iniciarSesionMock,
                autorizacionMock,
                renovarSesionMock,
                cambiarContraseniaMock,
            );
        });

        it('login delega a IniciarSesion y retorna RespuestaLogin', async () => {
            iniciarSesionMock.ejecutar.mockResolvedValue({
                tokenAcceso: 'jwt-123',
                tokenRenovacion: 'ref-123',
                tipoToken: 'Bearer',
                expiraEn: 900,
                sesionId: 'sesion-1',
            });

            const res = await controlador.iniciarSesion({
                aliasEmpresa: 'yerba-srl',
                correoAcceso: 'admin@yerba.com',
                contrasenia: 'ContraseniaRobusta#2026',
                canal: CanalAcceso.WEB,
            });

            expect(res.tokenAcceso).toBe('jwt-123');
            expect(iniciarSesionMock.ejecutar.mock.calls.length).toBe(1);
        });

        it('yo delega a ConsultarAutorizacionVigente', async () => {
            const contexto: ContextoSolicitud = {
                actorId: 'cuenta-1',
                empresaId: 'empresa-1',
                sesionId: 'sesion-1',
                rol: RolCodigo.ADMINISTRADOR,
                permisos: ['ACC-UC-001', 'ACC-UC-008'],
            };

            autorizacionMock.ejecutar.mockResolvedValue({
                actorId: 'cuenta-1',
                empresaId: 'empresa-1',
                canal: CanalAcceso.WEB,
                roles: [RolCodigo.ADMINISTRADOR],
                permisos: ['ACC-UC-001', 'ACC-UC-008'],
            });

            const res = await controlador.consultarAutorizacionVigente(contexto);
            expect(res.actorId).toBe('cuenta-1');
            expect(res.permisos).toContain('ACC-UC-001');
        });

        it('renovar delega a RenovarSesion', async () => {
            renovarSesionMock.ejecutar.mockResolvedValue({
                tokenAcceso: 'jwt-nuevo',
                tokenRenovacion: 'ref-nuevo',
                tipoToken: 'Bearer',
                expiraEn: 900,
                sesionId: 'sesion-1',
            });

            const res = await controlador.renovarSesion({ tokenRenovacion: 'ref-viejo' });
            expect(res.tokenAcceso).toBe('jwt-nuevo');
        });

        it('cambiarContrasenia delega a CambiarContrasenia', async () => {
            const contexto: ContextoSolicitud = {
                actorId: 'cuenta-1',
                empresaId: 'empresa-1',
                sesionId: 'sesion-1',
                rol: RolCodigo.ADMINISTRADOR,
                permisos: ['ACC-UC-004'],
            };

            cambiarContraseniaMock.ejecutar.mockResolvedValue({ mensaje: 'Contraseña actualizada' });

            await controlador.cambiarContrasenia(
                { contraseniaActual: 'ContraseniaVieja#2026', nuevaContrasenia: 'ContraseniaNueva#2026' },
                contexto,
            );

            expect(cambiarContraseniaMock.ejecutar.mock.calls.length).toBe(1);
        });
    });

    describe('ControladorCuentasEmpresa', () => {
        let habilitarCuentaMock: jest.Mocked<HabilitarCuentaEmpresa>;
        let consultarCuentasMock: jest.Mocked<ConsultarCuentasEmpresa>;
        let restablecerContraseniaMock: jest.Mocked<RestablecerContrasenia>;
        let cambiarEstadoMock: jest.Mocked<CambiarEstadoCuenta>;
        let actualizarRolesCanalesMock: jest.Mocked<ActualizarRolesCanalesCuenta>;
        let vincularEmpleadoMock: jest.Mocked<VincularEmpleado>;
        let controlador: ControladorCuentasEmpresa;

        beforeEach(() => {
            habilitarCuentaMock = { ejecutar: jest.fn() } as unknown as jest.Mocked<HabilitarCuentaEmpresa>;
            consultarCuentasMock = { ejecutar: jest.fn() } as unknown as jest.Mocked<ConsultarCuentasEmpresa>;
            restablecerContraseniaMock = { ejecutar: jest.fn() } as unknown as jest.Mocked<RestablecerContrasenia>;
            cambiarEstadoMock = { ejecutar: jest.fn() } as unknown as jest.Mocked<CambiarEstadoCuenta>;
            actualizarRolesCanalesMock = { ejecutar: jest.fn() } as unknown as jest.Mocked<ActualizarRolesCanalesCuenta>;
            vincularEmpleadoMock = { ejecutar: jest.fn() } as unknown as jest.Mocked<VincularEmpleado>;

            controlador = new ControladorCuentasEmpresa(
                habilitarCuentaMock,
                consultarCuentasMock,
                restablecerContraseniaMock,
                cambiarEstadoMock,
                actualizarRolesCanalesMock,
                vincularEmpleadoMock,
            );
        });

        it('habilitarCuenta delega y fija cabecera ETag', async () => {
            const contexto: ContextoSolicitud = {
                actorId: 'admin-1',
                empresaId: 'empresa-1',
                rol: RolCodigo.ADMINISTRADOR,
                permisos: ['ACC-UC-001'],
            };

            habilitarCuentaMock.ejecutar.mockResolvedValue({
                id: 'cuenta-nueva-1',
                empresaId: 'empresa-1',
                correoAcceso: 'nuevo@yerba.com',
                accesoWeb: true,
                accesoMovil: false,
                roles: [RolCodigo.ADMINISTRADOR],
                estado: 'ACTIVA',
                version: 1,
            });

            const res = await controlador.habilitarCuentaEmpresa(
                'empresa-1',
                {
                    correoAcceso: 'nuevo@yerba.com',
                    contrasenia: 'ContraseniaNueva#2026',
                    accesoWeb: true,
                    accesoMovil: false,
                    roles: [RolCodigo.ADMINISTRADOR],
                },
                contexto,
                mockResponse,
            );

            expect(res.id).toBe('cuenta-nueva-1');
            expect(mockResponse.setHeader.mock.calls[0]).toEqual(['ETag', '"1"']);
        });

        it('consultarCuentasEmpresa delega la consulta paginada', async () => {
            const contexto: ContextoSolicitud = {
                actorId: 'admin-1',
                empresaId: 'empresa-1',
                rol: RolCodigo.ADMINISTRADOR,
                permisos: ['ACC-UC-008'],
            };

            consultarCuentasMock.ejecutar.mockResolvedValue({
                datos: [],
                paginacion: { limite: 25, desplazamiento: 0, total: 0 },
            });

            const res = await controlador.consultarCuentasEmpresa('empresa-1', { limite: 25, desplazamiento: 0 }, contexto);
            expect(res.paginacion.total).toBe(0);
        });

        it('vincularEmpleado delega a VincularEmpleado con If-Match', async () => {
            const contexto: ContextoSolicitud = {
                actorId: 'admin-1',
                empresaId: 'empresa-1',
                rol: RolCodigo.ADMINISTRADOR,
                permisos: ['ACC-UC-012'],
            };

            vincularEmpleadoMock.ejecutar.mockResolvedValue({
                id: 'cuenta-1',
                empresaId: 'empresa-1',
                empleadoId: 'empleado-100',
                correoAcceso: 'cuenta@yerba.com',
                accesoWeb: true,
                accesoMovil: false,
                roles: [RolCodigo.ADMINISTRADOR],
                estado: 'ACTIVA',
                version: 2,
            });

            const res = await controlador.vincularEmpleado(
                'empresa-1',
                'cuenta-1',
                { empleadoId: 'empleado-100' },
                '"1"',
                contexto,
                mockResponse,
            );

            expect(res.empleadoId).toBe('empleado-100');
            expect(mockResponse.setHeader.mock.calls[0]).toEqual(['ETag', '"2"']);
        });
    });

    describe('ControladorPlataformaSoporte', () => {
        let bootstrapMock: jest.Mocked<InicializarSuperAdministrador>;
        let registrarIntervencionMock: jest.Mocked<RegistrarIntervencionSoporte>;
        let consultarIntervencionesMock: jest.Mocked<ConsultarIntervencionesSoporte>;
        let controlador: ControladorPlataformaSoporte;

        beforeEach(() => {
            bootstrapMock = { ejecutar: jest.fn() } as unknown as jest.Mocked<InicializarSuperAdministrador>;
            registrarIntervencionMock = { ejecutar: jest.fn() } as unknown as jest.Mocked<RegistrarIntervencionSoporte>;
            consultarIntervencionesMock = { ejecutar: jest.fn() } as unknown as jest.Mocked<ConsultarIntervencionesSoporte>;

            controlador = new ControladorPlataformaSoporte(bootstrapMock, registrarIntervencionMock, consultarIntervencionesMock);
        });

        it('inicializarSuperAdministrador delega bootstrapping', async () => {
            bootstrapMock.ejecutar.mockResolvedValue({
                mensaje: 'SuperAdministrador inicializado con éxito.',
            });

            const res = await controlador.inicializarSuperAdministrador({
                claveSecretaBootstrapping: 'clave-secreta',
                correoSuperAdmin: 'super@tarefero.com',
                contraseniaSuperAdmin: 'ContraseniaSuperRobusta#2026',
            });

            expect(res.mensaje).toContain('inicializado');
        });

        it('registrarIntervencionSoporte delega con contexto y empresaId', async () => {
            const contexto: ContextoSolicitud = {
                actorId: 'super-admin-1',
                rol: 'SUPER_ADMINISTRADOR',
                permisos: ['ACC-UC-007'],
                sesionId: 'sesion-plataforma-1',
            };

            registrarIntervencionMock.ejecutar.mockResolvedValue({
                id: 'intervencion-1',
                usuarioPlataformaId: 'super-admin-1',
                empresaId: 'empresa-1',
                motivo: 'Revision de sincronizacion',
                ocurridaEn: new Date(),
                venceEn: new Date(Date.now() + 15 * 60 * 1000),
            });

            const res = await controlador.registrarIntervencionSoporte(
                'empresa-1',
                { motivo: 'Revision de sincronizacion' },
                contexto,
            );

            expect(res.id).toBe('intervencion-1');
        });

        it('consultarIntervencionesSoporte delega la consulta', async () => {
            const contexto: ContextoSolicitud = {
                actorId: 'admin-1',
                rol: 'ADMINISTRADOR',
                permisos: ['ACC-UC-011'],
                empresaId: 'empresa-1',
            };

            consultarIntervencionesMock.ejecutar.mockResolvedValue({
                datos: [],
                paginacion: { limite: 25, desplazamiento: 0, total: 0 },
            });

            const res = await controlador.consultarIntervencionesSoporte(
                'empresa-1',
                { limite: 25, desplazamiento: 0 },
                contexto,
            );

            expect(res.paginacion.total).toBe(0);
        });
    });
});
