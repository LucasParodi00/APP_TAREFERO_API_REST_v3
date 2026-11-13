import {
    VERIFICADOR_EMPLEADO_PUBLICO,
    VerificadorEmpleadoPublico,
    VERIFICADOR_CUPO_EMPLEADOS,
    VerificadorCupoEmpleados,
    COORDINADOR_ACCESO_EMPLEADO,
    CoordinadorAccesoEmpleado,
    VALIDADOR_ARCHIVO_PRIVADO,
    ValidadorArchivoPrivado,
    CONSULTA_EMPLEADOS,
    ConsultaEmpleados,
    CONSULTA_NOVEDADES,
    ConsultaNovedades,
} from '../../aplicacion/puertos';

describe('T04 — Contratos y puertos de Personal', () => {
    it('debe definir símbolos de inyección únicos para cada puerto', () => {
        expect(typeof VERIFICADOR_EMPLEADO_PUBLICO).toBe('symbol');
        expect(typeof VERIFICADOR_CUPO_EMPLEADOS).toBe('symbol');
        expect(typeof COORDINADOR_ACCESO_EMPLEADO).toBe('symbol');
        expect(typeof VALIDADOR_ARCHIVO_PRIVADO).toBe('symbol');
        expect(typeof CONSULTA_EMPLEADOS).toBe('symbol');
        expect(typeof CONSULTA_NOVEDADES).toBe('symbol');
    });

    it('debe permitir implementar el contrato público de VerificadorEmpleadoPublico sin dependencias de infraestructura', async () => {
        const fakeVerificador: VerificadorEmpleadoPublico = {
            verificarEmpleadoActivo: jest.fn().mockResolvedValue(true),
            obtenerEmpleadoPublico: jest.fn().mockResolvedValue({
                id: '018f2d5c-9c76-7889-b88d-71b34fa365ba',
                empresaId: '018f2d5c-9c76-7889-b88d-71b34fa365bb',
                estado: 'ACTIVO',
                nombre: 'Juan',
                apellido: 'Pérez',
                documento: '30123456',
            }),
        };

        const activo = await fakeVerificador.verificarEmpleadoActivo('empresa-id', 'empleado-id');
        expect(activo).toBe(true);
    });

    it('debe permitir implementar VerificadorCupoEmpleados determinista para pruebas', async () => {
        const fakeCupo: VerificadorCupoEmpleados = {
            verificarCupoDisponible: jest.fn().mockResolvedValue(true),
        };

        const disponible = await fakeCupo.verificarCupoDisponible('empresa-id', 5);
        expect(disponible).toBe(true);
    });

    it('debe permitir tipar dobles para CoordinadorAcceso, ValidadorArchivo y Consultas', () => {
        const coordinador: CoordinadorAccesoEmpleado = {
            habilitarAcceso: jest.fn(),
            suspenderYRevocarAcceso: jest.fn(),
            revocarAcceso: jest.fn(),
        };
        const validador: ValidadorArchivoPrivado = {
            validarArchivoPerteneceAEmpresa: jest.fn(),
        };
        const consultaEmp: ConsultaEmpleados = {
            listar: jest.fn(),
            buscarDetallePorId: jest.fn(),
        };
        const consultaNov: ConsultaNovedades = {
            listarRestriccionesPorEmpleado: jest.fn(),
            buscarRestriccionPorId: jest.fn(),
            listarIndisponibilidadesPorEmpleado: jest.fn(),
            buscarIndisponibilidadPorId: jest.fn(),
        };

        expect(coordinador).toBeDefined();
        expect(validador).toBeDefined();
        expect(consultaEmp).toBeDefined();
        expect(consultaNov).toBeDefined();
    });
});
