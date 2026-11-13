import { Test, TestingModule } from '@nestjs/testing';
import { Module, Global } from '@nestjs/common';
import { TerritorioModule } from '../../territorio.module';
import { TOKEN_REPOSITORIO_CHACRAS } from '../../dominio/repositorios';
import { TOKEN_CONSULTA_CHACRAS } from '../../aplicacion/consultas';
import { GENERADOR_IDENTIFICADORES, RELOJ } from '../../../../comun/aplicacion';
import { ResolvedorChacraPublico, TOKEN_RESOLVEDOR_CHACRA_PUBLICO } from '../../aplicacion/puertos';
import { RegistrarChacraCasoDeUso } from '../../aplicacion/comandos/registrar-chacra.caso-de-uso';
import { ConsultarChacraCasoDeUso } from '../../aplicacion/consultas/consultar-chacra.caso-de-uso';
import { ListarChacrasCasoDeUso } from '../../aplicacion/consultas/listar-chacras.caso-de-uso';
import { ModificarChacraCasoDeUso } from '../../aplicacion/comandos/modificar-chacra.caso-de-uso';
import { InactivarChacraCasoDeUso } from '../../aplicacion/comandos/inactivar-chacra.caso-de-uso';
import { ControladorChacras } from '../../presentacion/controladores/controlador-chacras';

describe('T12 — Composición: TerritorioModule', () => {
    let moduleRef: TestingModule;

    beforeEach(async () => {
        const mockRepositorio = {
            guardar: jest.fn(),
            obtenerPorId: jest.fn(),
            existePorNombreCorto: jest.fn(),
        };

        const mockConsulta = {
            obtenerDetallePorId: jest.fn(),
            listar: jest.fn(),
        };

        const mockGenerador = {
            generar: jest.fn().mockReturnValue('018f6f5d-7a6b-7345-9123-chacra000001'),
        };

        const mockReloj = {
            ahora: jest.fn().mockReturnValue(new Date()),
        };

        @Global()
        @Module({
            providers: [
                { provide: TOKEN_REPOSITORIO_CHACRAS, useValue: mockRepositorio },
                { provide: TOKEN_CONSULTA_CHACRAS, useValue: mockConsulta },
                { provide: GENERADOR_IDENTIFICADORES, useValue: mockGenerador },
                { provide: RELOJ, useValue: mockReloj },
            ],
            exports: [TOKEN_REPOSITORIO_CHACRAS, TOKEN_CONSULTA_CHACRAS, GENERADOR_IDENTIFICADORES, RELOJ],
        })
        class DependenciasExternasMockModule {}

        moduleRef = await Test.createTestingModule({
            imports: [DependenciasExternasMockModule, TerritorioModule],
        }).compile();
    });

    it('debe instanciar el controlador y todos los casos de uso', () => {
        const controlador = moduleRef.get<ControladorChacras>(ControladorChacras);
        expect(controlador).toBeDefined();

        expect(moduleRef.get(RegistrarChacraCasoDeUso)).toBeInstanceOf(RegistrarChacraCasoDeUso);
        expect(moduleRef.get(ConsultarChacraCasoDeUso)).toBeInstanceOf(ConsultarChacraCasoDeUso);
        expect(moduleRef.get(ListarChacrasCasoDeUso)).toBeInstanceOf(ListarChacrasCasoDeUso);
        expect(moduleRef.get(ModificarChacraCasoDeUso)).toBeInstanceOf(ModificarChacraCasoDeUso);
        expect(moduleRef.get(InactivarChacraCasoDeUso)).toBeInstanceOf(InactivarChacraCasoDeUso);
    });

    it('debe exportar el TOKEN_RESOLVEDOR_CHACRA_PUBLICO para consumidores externos (ACC-DEP-005)', () => {
        const resolvedor = moduleRef.get<ResolvedorChacraPublico>(TOKEN_RESOLVEDOR_CHACRA_PUBLICO);
        expect(resolvedor).toBeDefined();
        expect(typeof resolvedor.resolverPorId).toBe('function');
    });
});
