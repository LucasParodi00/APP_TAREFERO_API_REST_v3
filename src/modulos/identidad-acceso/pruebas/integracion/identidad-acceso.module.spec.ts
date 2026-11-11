import { Test, TestingModule } from '@nestjs/testing';
import { Module, Global } from '@nestjs/common';
import { IdentidadAccesoModule } from '../../identidad-acceso.module';
import { ControladorAutenticacion } from '../../presentacion/controladores/controlador-autenticacion';
import { ControladorCuentasEmpresa } from '../../presentacion/controladores/controlador-cuentas-empresa';
import { ControladorPlataformaSoporte } from '../../presentacion/controladores/controlador-plataforma-soporte';
import { REPOSITORIO_CUENTAS_EMPRESA } from '../../dominio/repositorios/repositorio-cuentas-empresa';
import { REPOSITORIO_SESIONES } from '../../dominio/repositorios/repositorio-sesiones';
import { REPOSITORIO_USUARIOS_PLATAFORMA } from '../../dominio/repositorios/repositorio-usuarios-plataforma';
import { REPOSITORIO_INTERVENCIONES_SOPORTE } from '../../dominio/repositorios/repositorio-intervenciones-soporte';
import { CONSULTA_CUENTAS_EMPRESA } from '../../aplicacion/puertos/consulta-cuentas-empresa.puerto';
import { CONSULTA_INTERVENCIONES_SOPORTE } from '../../aplicacion/puertos/consulta-intervenciones-soporte.puerto';
import { RESOLVEDOR_EMPRESA_PUBLICO } from '../../../empresas/aplicacion/puertos/resolvedor-empresa-publico.puerto';
import { HabilitarCuentaEmpresa } from '../../aplicacion/comandos/habilitar-cuenta-empresa.caso-de-uso';
import { IniciarSesion } from '../../aplicacion/comandos/iniciar-sesion.caso-de-uso';
import { InicializarSuperAdministrador } from '../../aplicacion/comandos/inicializar-super-administrador.caso-de-uso';
import { RegistrarIntervencionSoporte } from '../../aplicacion/comandos/registrar-intervencion-soporte.caso-de-uso';
import { AutenticacionGuard } from '../../presentacion/guardias/autenticacion.guard';

describe('T15 — IdentidadAccesoModule Composición (ACC)', () => {
    let moduleRef: TestingModule;

    beforeEach(async () => {
        const mockRepoCuentas = {
            guardar: jest.fn(),
            buscarPorId: jest.fn(),
            buscarPorEmpresaYCorreo: jest.fn(),
            buscarPorEmpresaYEmpleado: jest.fn(),
            contarPorEmpresa: jest.fn(),
        };

        const mockRepoSesiones = {
            guardar: jest.fn(),
            buscarPorId: jest.fn(),
            revocarPorCuenta: jest.fn(),
        };

        const mockRepoUsuariosPlataforma = {
            guardar: jest.fn(),
            buscarPorId: jest.fn(),
            buscarPorIdentificador: jest.fn(),
            contarSuperAdministradores: jest.fn(),
        };

        const mockRepoIntervencionesSoporte = {
            guardar: jest.fn(),
            buscarPorId: jest.fn(),
        };

        const mockConsultaCuentas = {
            listarPorEmpresa: jest.fn(),
            obtenerPorId: jest.fn(),
        };

        const mockConsultaIntervenciones = {
            listarPorEmpresa: jest.fn(),
            obtenerPorId: jest.fn(),
        };

        const mockResolvedorEmpresaPublico = {
            resolverPorId: jest.fn(),
            resolverPorAlias: jest.fn(),
        };

        @Global()
        @Module({
            providers: [
                { provide: REPOSITORIO_CUENTAS_EMPRESA, useValue: mockRepoCuentas },
                { provide: REPOSITORIO_SESIONES, useValue: mockRepoSesiones },
                {
                    provide: REPOSITORIO_USUARIOS_PLATAFORMA,
                    useValue: mockRepoUsuariosPlataforma,
                },
                {
                    provide: REPOSITORIO_INTERVENCIONES_SOPORTE,
                    useValue: mockRepoIntervencionesSoporte,
                },
                { provide: CONSULTA_CUENTAS_EMPRESA, useValue: mockConsultaCuentas },
                {
                    provide: CONSULTA_INTERVENCIONES_SOPORTE,
                    useValue: mockConsultaIntervenciones,
                },
                {
                    provide: RESOLVEDOR_EMPRESA_PUBLICO,
                    useValue: mockResolvedorEmpresaPublico,
                },
            ],
            exports: [
                REPOSITORIO_CUENTAS_EMPRESA,
                REPOSITORIO_SESIONES,
                REPOSITORIO_USUARIOS_PLATAFORMA,
                REPOSITORIO_INTERVENCIONES_SOPORTE,
                CONSULTA_CUENTAS_EMPRESA,
                CONSULTA_INTERVENCIONES_SOPORTE,
                RESOLVEDOR_EMPRESA_PUBLICO,
            ],
        })
        class PersistenciaMockModule {}

        moduleRef = await Test.createTestingModule({
            imports: [PersistenciaMockModule, IdentidadAccesoModule],
        }).compile();
    });

    it('instancia todos los controladores de identidad-acceso', () => {
        expect(moduleRef.get(ControladorAutenticacion)).toBeInstanceOf(ControladorAutenticacion);
        expect(moduleRef.get(ControladorCuentasEmpresa)).toBeInstanceOf(ControladorCuentasEmpresa);
        expect(moduleRef.get(ControladorPlataformaSoporte)).toBeInstanceOf(ControladorPlataformaSoporte);
    });

    it('instancia casos de uso principales', () => {
        expect(moduleRef.get(HabilitarCuentaEmpresa)).toBeInstanceOf(HabilitarCuentaEmpresa);
        expect(moduleRef.get(IniciarSesion)).toBeInstanceOf(IniciarSesion);
        expect(moduleRef.get(InicializarSuperAdministrador)).toBeInstanceOf(InicializarSuperAdministrador);
        expect(moduleRef.get(RegistrarIntervencionSoporte)).toBeInstanceOf(RegistrarIntervencionSoporte);
    });

    it('instancia el AutenticacionGuard con sus dependencias resueltas', () => {
        expect(moduleRef.get(AutenticacionGuard)).toBeInstanceOf(AutenticacionGuard);
    });
});
