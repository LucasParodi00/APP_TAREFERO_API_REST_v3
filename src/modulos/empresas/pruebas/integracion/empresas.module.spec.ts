import { Test, TestingModule } from '@nestjs/testing';
import { Module, Global } from '@nestjs/common';
import { EmpresasModule } from '../../empresas.module';
import { REPOSITORIO_EMPRESAS } from '../../dominio/repositorios/repositorio-empresas';
import { CONSULTA_EMPRESAS } from '../../aplicacion/puertos/consulta-empresas.puerto';
import { RegistrarEmpresa } from '../../aplicacion/comandos/registrar-empresa.caso-de-uso';
import { ConsultarEmpresa } from '../../aplicacion/consultas/consultar-empresa.caso-de-uso';
import { ListarEmpresas } from '../../aplicacion/consultas/listar-empresas.caso-de-uso';
import { ModificarEmpresa } from '../../aplicacion/comandos/modificar-empresa.caso-de-uso';
import { ModificarConfiguracionGeneral } from '../../aplicacion/comandos/modificar-configuracion-general.caso-de-uso';
import { SuspenderEmpresa } from '../../aplicacion/comandos/suspender-empresa.caso-de-uso';
import { ReactivarEmpresa } from '../../aplicacion/comandos/reactivar-empresa.caso-de-uso';
import { CerrarEmpresa } from '../../aplicacion/comandos/cerrar-empresa.caso-de-uso';
import { ControladorEmpresas } from '../../presentacion/controladores/controlador-empresas';

describe('EmpresasModule — Composición (T05)', () => {
    let moduleRef: TestingModule;

    beforeEach(async () => {
        const mockRepositorio = {
            guardar: jest.fn(),
            obtenerPorId: jest.fn(),
            existeAlias: jest.fn(),
        };

        const mockConsulta = {
            obtenerPorIdOAlias: jest.fn(),
            listar: jest.fn(),
        };

        @Global()
        @Module({
            providers: [
                { provide: REPOSITORIO_EMPRESAS, useValue: mockRepositorio },
                { provide: CONSULTA_EMPRESAS, useValue: mockConsulta },
            ],
            exports: [REPOSITORIO_EMPRESAS, CONSULTA_EMPRESAS],
        })
        class PersistenciaMockModule {}

        moduleRef = await Test.createTestingModule({
            imports: [PersistenciaMockModule, EmpresasModule],
        }).compile();
    });

    it('instancia el controlador y todos los casos de uso con tokens separados', () => {
        const controlador = moduleRef.get<ControladorEmpresas>(ControladorEmpresas);
        expect(controlador).toBeDefined();

        expect(moduleRef.get(RegistrarEmpresa)).toBeInstanceOf(RegistrarEmpresa);
        expect(moduleRef.get(ConsultarEmpresa)).toBeInstanceOf(ConsultarEmpresa);
        expect(moduleRef.get(ListarEmpresas)).toBeInstanceOf(ListarEmpresas);
        expect(moduleRef.get(ModificarEmpresa)).toBeInstanceOf(ModificarEmpresa);
        expect(moduleRef.get(ModificarConfiguracionGeneral)).toBeInstanceOf(ModificarConfiguracionGeneral);
        expect(moduleRef.get(SuspenderEmpresa)).toBeInstanceOf(SuspenderEmpresa);
        expect(moduleRef.get(ReactivarEmpresa)).toBeInstanceOf(ReactivarEmpresa);
        expect(moduleRef.get(CerrarEmpresa)).toBeInstanceOf(CerrarEmpresa);
    });
});
