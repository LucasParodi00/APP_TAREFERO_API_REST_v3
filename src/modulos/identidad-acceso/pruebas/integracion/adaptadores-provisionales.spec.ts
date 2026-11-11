import { VerificadorCupoAccesoProvisional } from '../../infraestructura/adaptadores/verificador-cupo-acceso-provisional';
import { VerificadorEmpleadoProvisional } from '../../infraestructura/adaptadores/verificador-empleado-provisional';

describe('T12 — Adaptadores Provisionales de Integración (SUS y PER)', () => {
    describe('VerificadorCupoAccesoProvisional (SUS)', () => {
        it('permite cupo disponible en modo permisivo no productivo por defecto', async () => {
            const verificador = new VerificadorCupoAccesoProvisional(true);
            const disponible = await verificador.verificarCupoDisponible('empresa-uuid-001');
            expect(disponible).toBe(true);
        });

        it('falla de forma cerrada (fail-closed, ACC-BR-006) cuando está configurado en modo estricto', async () => {
            const verificador = new VerificadorCupoAccesoProvisional(false);
            const disponible = await verificador.verificarCupoDisponible('empresa-uuid-001');
            expect(disponible).toBe(false);
        });
    });

    describe('VerificadorEmpleadoProvisional (PER)', () => {
        it('valida empleado activo registrado para la empresa correspondiente', async () => {
            const verificador = new VerificadorEmpleadoProvisional();
            verificador.registrarEmpleadoActivo('empresa-uuid-001', 'empleado-uuid-100');

            const esActivo = await verificador.verificarEmpleadoActivo('empresa-uuid-001', 'empleado-uuid-100');
            expect(esActivo).toBe(true);
        });

        it('rechaza empleado si pertenece a otra empresa o no está registrado (ACC-BR-015, ACC-BR-021)', async () => {
            const verificador = new VerificadorEmpleadoProvisional();
            verificador.registrarEmpleadoActivo('empresa-uuid-001', 'empleado-uuid-100');

            const esActivoOtraEmpresa = await verificador.verificarEmpleadoActivo('empresa-uuid-002', 'empleado-uuid-100');
            expect(esActivoOtraEmpresa).toBe(false);

            const esActivoInexistente = await verificador.verificarEmpleadoActivo('empresa-uuid-001', 'empleado-inexistente');
            expect(esActivoInexistente).toBe(false);
        });

        it('permite validar en modo abierto provisional cuando se configura permisivo', async () => {
            const verificador = new VerificadorEmpleadoProvisional(true);
            const esActivo = await verificador.verificarEmpleadoActivo(
                'empresa-uuid-001',
                '019313ea-1111-7000-8000-000000000099',
            );
            expect(esActivo).toBe(true);
        });
    });
});
