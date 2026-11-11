import { ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AutenticacionGuard } from '../../presentacion/guardias/autenticacion.guard';
import { GeneradorTokens } from '../../aplicacion/puertos/generador-tokens.puerto';
import { RepositorioSesiones } from '../../dominio/repositorios/repositorio-sesiones';
import { RepositorioCuentasEmpresa } from '../../dominio/repositorios/repositorio-cuentas-empresa';
import { Reloj } from '../../aplicacion/puertos/reloj.puerto';
import { RolCodigo } from '../../dominio/enumeraciones/rol-codigo.enum';
import { CanalAcceso } from '../../dominio/enumeraciones/canal-acceso.enum';
import { SesionEmpresa } from '../../dominio/entidades/sesion-empresa.entidad';
import { CuentaEmpresa } from '../../dominio/entidades/cuenta-empresa.entidad';
import { CorreoAcceso } from '../../dominio/objetos-valor/correo-acceso.vo';
import type { ContextoSolicitud } from '../../aplicacion/puertos/contexto-solicitud';

describe('T14 — Guardias de Autenticación, Autorización y ContextoSolicitud (ACC)', () => {
    let reflectorMock: jest.Mocked<Reflector>;
    let generadorTokensMock: jest.Mocked<GeneradorTokens>;
    let repoSesionesMock: jest.Mocked<RepositorioSesiones>;
    let repoCuentasMock: jest.Mocked<RepositorioCuentasEmpresa>;
    let relojMock: jest.Mocked<Reloj>;
    let guard: AutenticacionGuard;

    beforeEach(() => {
        reflectorMock = {
            getAllAndOverride: jest.fn(),
        } as unknown as jest.Mocked<Reflector>;

        generadorTokensMock = {
            generarTokenAccesoTenant: jest.fn(),
            generarTokenAccesoPlataforma: jest.fn(),
            generarTokenRenovacion: jest.fn(),
            verificarTokenAcceso: jest.fn(),
        };

        repoSesionesMock = {
            guardar: jest.fn(),
            buscarPorId: jest.fn(),
            buscarPorHashTokenRenovacion: jest.fn(),
            buscarPorFamiliaId: jest.fn(),
            revocarTodasDeCuenta: jest.fn(),
            revocarFamilia: jest.fn(),
        };

        repoCuentasMock = {
            guardar: jest.fn(),
            buscarPorId: jest.fn(),
            buscarPorCorreo: jest.fn(),
            buscarPorEmpleadoId: jest.fn(),
            contarActivasPorEmpresa: jest.fn(),
        };

        relojMock = {
            ahora: jest.fn().mockReturnValue(new Date()),
        };

        guard = new AutenticacionGuard(reflectorMock, generadorTokensMock, repoSesionesMock, repoCuentasMock, relojMock);
    });

    function crearMockExecutionContext(headers: Record<string, string> = {}): {
        ctx: ExecutionContext;
        req: Record<string, unknown>;
    } {
        const req: Record<string, unknown> = {
            headers,
        };
        const ctx = {
            getHandler: jest.fn(),
            getClass: jest.fn(),
            switchToHttp: () => ({
                getRequest: () => req,
                getResponse: () => ({}),
            }),
        } as unknown as ExecutionContext;
        return { ctx, req };
    }

    it('permite acceso sin token si el endpoint está marcado con @Publico()', async () => {
        reflectorMock.getAllAndOverride.mockReturnValueOnce(true); // esPublico

        const { ctx } = crearMockExecutionContext();
        const resultado = await guard.canActivate(ctx);

        expect(resultado).toBe(true);
        expect(generadorTokensMock.verificarTokenAcceso.mock.calls.length).toBe(0);
    });

    it('rechaza con 401 si no hay cabecera Authorization en endpoint protegido', async () => {
        reflectorMock.getAllAndOverride.mockReturnValueOnce(false); // no es publico

        const { ctx } = crearMockExecutionContext({});
        await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    });

    it('rechaza con 401 si la sesión persistente ha expirado o está revocada', async () => {
        reflectorMock.getAllAndOverride.mockReturnValueOnce(false);
        generadorTokensMock.verificarTokenAcceso.mockResolvedValue({
            sub: 'cuenta-1',
            empresaId: 'empresa-1',
            sesionId: 'sesion-1',
            rol: RolCodigo.ADMINISTRADOR,
            aud: 'tarefero:tenant',
        });

        // Sesión vencida en el pasado
        const sesionVencida = SesionEmpresa.crear({
            id: 'sesion-1',
            cuentaEmpresaId: 'cuenta-1',
            empresaId: 'empresa-1',
            canal: CanalAcceso.WEB,
            creadaEn: new Date(Date.now() - 100000),
            venceEn: new Date(Date.now() - 1000),
            hashTokenRenovacion: 'hash',
            familiaId: 'fam-1',
        });
        repoSesionesMock.buscarPorId.mockResolvedValue(sesionVencida);

        const { ctx } = crearMockExecutionContext({ authorization: 'Bearer token-valido' });
        await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    });

    it('valida exitosamente el token, construye ContextoSolicitud y verifica permisos requeridos', async () => {
        reflectorMock.getAllAndOverride
            .mockReturnValueOnce(false) // esPublico: false
            .mockReturnValueOnce(['ACC-UC-001']); // permisosRequeridos: ['ACC-UC-001']

        generadorTokensMock.verificarTokenAcceso.mockResolvedValue({
            sub: 'cuenta-1',
            empresaId: 'empresa-1',
            sesionId: 'sesion-1',
            rol: RolCodigo.ADMINISTRADOR,
            aud: 'tarefero:tenant',
        });

        const sesionActiva = SesionEmpresa.crear({
            id: 'sesion-1',
            cuentaEmpresaId: 'cuenta-1',
            empresaId: 'empresa-1',
            canal: CanalAcceso.WEB,
            creadaEn: new Date(),
            venceEn: new Date(Date.now() + 100000),
            hashTokenRenovacion: 'hash',
            familiaId: 'fam-1',
        });
        repoSesionesMock.buscarPorId.mockResolvedValue(sesionActiva);

        const cuentaActiva = CuentaEmpresa.crear({
            id: 'cuenta-1',
            empresaId: 'empresa-1',
            correoAcceso: CorreoAcceso.crear('admin@yerba.com'),
            credencialHash: '$hash',
            accesoWeb: true,
            accesoMovil: false,
            roles: [RolCodigo.ADMINISTRADOR],
        });
        repoCuentasMock.buscarPorId.mockResolvedValue(cuentaActiva);

        const { ctx, req } = crearMockExecutionContext({ authorization: 'Bearer token-valido' });
        const resultado = await guard.canActivate(ctx);

        expect(resultado).toBe(true);
        expect(req.contexto).toBeDefined();
        const contexto = req.contexto as ContextoSolicitud;
        expect(contexto.actorId).toBe('cuenta-1');
        expect(contexto.empresaId).toBe('empresa-1');
        expect(contexto.rol).toBe(RolCodigo.ADMINISTRADOR);
        expect(contexto.permisos).toContain('ACC-UC-001');
    });

    it('rechaza con 403 Forbidden si el usuario carece del permiso requerido por la ruta', async () => {
        reflectorMock.getAllAndOverride.mockReturnValueOnce(false).mockReturnValueOnce(['ACC-UC-006']); // Inicializar superadmin (no permitido a Administrador)

        generadorTokensMock.verificarTokenAcceso.mockResolvedValue({
            sub: 'cuenta-1',
            empresaId: 'empresa-1',
            sesionId: 'sesion-1',
            rol: RolCodigo.EMPLEADO,
            aud: 'tarefero:tenant',
        });

        const sesionActiva = SesionEmpresa.crear({
            id: 'sesion-1',
            cuentaEmpresaId: 'cuenta-1',
            empresaId: 'empresa-1',
            canal: CanalAcceso.WEB,
            creadaEn: new Date(),
            venceEn: new Date(Date.now() + 100000),
            hashTokenRenovacion: 'hash',
            familiaId: 'fam-1',
        });
        repoSesionesMock.buscarPorId.mockResolvedValue(sesionActiva);

        const cuentaActiva = CuentaEmpresa.crear({
            id: 'cuenta-1',
            empresaId: 'empresa-1',
            empleadoId: '019313ea-1111-7000-8000-000000000055',
            correoAcceso: CorreoAcceso.crear('emp@yerba.com'),
            credencialHash: '$hash',
            accesoWeb: true,
            accesoMovil: false,
            roles: [RolCodigo.EMPLEADO],
        });
        repoCuentasMock.buscarPorId.mockResolvedValue(cuentaActiva);

        const { ctx } = crearMockExecutionContext({ authorization: 'Bearer token-valido' });
        await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    });
});
