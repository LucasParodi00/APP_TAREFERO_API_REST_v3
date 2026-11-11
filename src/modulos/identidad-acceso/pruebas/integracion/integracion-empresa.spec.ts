import { ResolvedorEmpresaDesdeModuloEmpresas } from '../../infraestructura/adaptadores/resolvedor-empresa-desde-modulo-empresas';
import {
    ResolvedorEmpresaPublico,
    EmpresaPublicaLectura,
} from '../../../empresas/aplicacion/puertos/resolvedor-empresa-publico.puerto';
import { AdaptadorResolvedorEmpresaPublico } from '../../../empresas/infraestructura/adaptadores/resolvedor-empresa-publico.adaptador';
import { ConsultaEmpresas } from '../../../empresas/aplicacion/puertos/consulta-empresas.puerto';
import { EmpresaLectura } from '../../../empresas/aplicacion/modelos-lectura';

describe('T11 — Adaptador de Integración con Empresa (D-05, EMP-DEP-003)', () => {
    describe('AdaptadorResolvedorEmpresaPublico (EMP)', () => {
        let consultaEmpresasMock: jest.Mocked<ConsultaEmpresas>;
        let adaptadorEmp: AdaptadorResolvedorEmpresaPublico;

        beforeEach(() => {
            consultaEmpresasMock = {
                obtenerPorIdOAlias: jest.fn(),
                listar: jest.fn(),
            };
            adaptadorEmp = new AdaptadorResolvedorEmpresaPublico(consultaEmpresasMock);
        });

        it('resuelve una empresa por ID exponiendo solo id, alias y estado sin filtrar datos sensibles', async () => {
            const empresaLecturaCompleta: EmpresaLectura = {
                id: 'empresa-uuid-001',
                nombre: 'Yerba SRL',
                alias: 'yerba-srl',
                cuit: '20123456789',
                responsableNombre: 'Juan Perez',
                ubicacionTexto: 'Ruta 12',
                ubicacionGeografica: null,
                descripcionActividad: 'Secado',
                estado: 'ACTIVA',
                configuracionGeneral: {
                    id: 'cfg-001',
                    empresaId: 'empresa-uuid-001',
                    paisReferencia: 'ARG',
                    zonaHoraria: 'America/Argentina/Buenos_Aires',
                    monedaPrincipal: 'ARS',
                    creadoEn: '2026-11-11T00:00:00.000Z',
                    creadoPor: 'admin',
                    actualizadoEn: '2026-11-11T00:00:00.000Z',
                    actualizadoPor: 'admin',
                    version: 1,
                },
                creadoEn: '2026-11-11T00:00:00.000Z',
                creadoPor: 'admin',
                actualizadoEn: '2026-11-11T00:00:00.000Z',
                actualizadoPor: 'admin',
                version: 1,
            };

            consultaEmpresasMock.obtenerPorIdOAlias.mockResolvedValue(empresaLecturaCompleta);

            const res = await adaptadorEmp.resolverPorId('empresa-uuid-001');

            expect(res).not.toBeNull();
            expect(res).toEqual({
                id: 'empresa-uuid-001',
                alias: 'yerba-srl',
                estado: 'ACTIVA',
            });
            // Aseguramos que no expone CUIT ni configuraciones internas de EMP
            expect(res && 'cuit' in res).toBe(false);
            expect(res && 'configuracionGeneral' in res).toBe(false);
        });

        it('retorna null si la empresa no existe por alias', async () => {
            consultaEmpresasMock.obtenerPorIdOAlias.mockResolvedValue(null);

            const res = await adaptadorEmp.resolverPorAlias('inexistente');
            expect(res).toBeNull();
        });
    });

    describe('ResolvedorEmpresaDesdeModuloEmpresas (ACC)', () => {
        let resolvedorPublicoMock: jest.Mocked<ResolvedorEmpresaPublico>;
        let resolvedorAcc: ResolvedorEmpresaDesdeModuloEmpresas;

        beforeEach(() => {
            resolvedorPublicoMock = {
                resolverPorId: jest.fn(),
                resolverPorAlias: jest.fn(),
            };
            resolvedorAcc = new ResolvedorEmpresaDesdeModuloEmpresas(resolvedorPublicoMock);
        });

        it('resuelve empresa por ID y traduce al contrato de aplicacion de ACC', async () => {
            const empresaPublica: EmpresaPublicaLectura = {
                id: 'empresa-uuid-001',
                alias: 'yerba-srl',
                estado: 'ACTIVA',
            };
            resolvedorPublicoMock.resolverPorId.mockResolvedValue(empresaPublica);

            const resultado = await resolvedorAcc.buscarPorId('empresa-uuid-001');

            expect(resultado).not.toBeNull();
            expect(resultado?.id).toBe('empresa-uuid-001');
            expect(resultado?.alias).toBe('yerba-srl');
            expect(resultado?.estado).toBe('ACTIVA');
            expect(resolvedorPublicoMock.resolverPorId.mock.calls.length).toBe(1);
        });

        it('resuelve empresa por alias', async () => {
            const empresaPublica: EmpresaPublicaLectura = {
                id: 'empresa-uuid-001',
                alias: 'yerba-srl',
                estado: 'SUSPENDIDA',
            };
            resolvedorPublicoMock.resolverPorAlias.mockResolvedValue(empresaPublica);

            const resultado = await resolvedorAcc.buscarPorAlias('yerba-srl');

            expect(resultado).not.toBeNull();
            expect(resultado?.alias).toBe('yerba-srl');
            expect(resultado?.estado).toBe('SUSPENDIDA');
        });

        it('retorna null si la empresa no es encontrada en el modulo de empresas', async () => {
            resolvedorPublicoMock.resolverPorId.mockResolvedValue(null);

            const resultado = await resolvedorAcc.buscarPorId('no-existe');
            expect(resultado).toBeNull();
        });
    });
});
