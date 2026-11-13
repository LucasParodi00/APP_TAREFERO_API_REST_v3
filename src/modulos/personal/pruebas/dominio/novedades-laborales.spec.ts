import { randomUUID } from 'crypto';
import { IdentificadorUuid, FechaCivil } from '../../../../comun/dominio';
import { TipoIndisponibilidad } from '../../dominio/enumeraciones';
import { MensajeOperativo, MotivoAnulacionNovedad } from '../../dominio/objetos-valor';
import { RestriccionOperativa } from '../../dominio/agregados/restriccion-operativa';
import { Indisponibilidad } from '../../dominio/agregados/indisponibilidad';
import { ErrorRestriccionInvalida, ErrorIndisponibilidadInvalida, ErrorAnulacionNovedadInvalida } from '../../dominio/errores';

describe('T03 — Dominio: Agregados RestriccionOperativa e Indisponibilidad', () => {
    const empresaId = new IdentificadorUuid(randomUUID());
    const empleadoId = new IdentificadorUuid(randomUUID());
    const cuentaAdminId = new IdentificadorUuid(randomUUID());

    describe('PER-BR-021 y PER-BR-028 — RestriccionOperativa', () => {
        it('debe crear una RestriccionOperativa válida con vigencia y mensaje operativo', () => {
            const restriccion = RestriccionOperativa.crearNueva({
                id: new IdentificadorUuid(randomUUID()),
                empresaId,
                empleadoId,
                tipo: 'Salud - Movilidad reducida',
                inicio: new FechaCivil('2026-02-01'),
                fin: new FechaCivil('2026-02-28'),
                mensajeOperativo: MensajeOperativo.crear('Solo tareas livianas en empaque'),
            });

            expect(restriccion.tipo).toBe('Salud - Movilidad reducida');
            expect(restriccion.inicio.toString()).toBe('2026-02-01');
            expect(restriccion.fin?.toString()).toBe('2026-02-28');
            expect(restriccion.mensajeOperativo.valor).toBe('Solo tareas livianas en empaque');
            expect(restriccion.estaAnulada()).toBe(false);
            expect(restriccion.version).toBe(1);
        });

        it('debe permitir crear una restricción de vigencia indefinida (sin fin)', () => {
            const restriccion = RestriccionOperativa.crearNueva({
                id: new IdentificadorUuid(randomUUID()),
                empresaId,
                empleadoId,
                tipo: 'Recomendación ergonomía',
                inicio: new FechaCivil('2026-01-01'),
                mensajeOperativo: MensajeOperativo.crear('Uso obligatorio de faja lumbar'),
            });

            expect(restriccion.fin).toBeUndefined();
            expect(restriccion.estaAnulada()).toBe(false);
        });

        it('debe rechazar restricción con fecha fin anterior al inicio', () => {
            expect(() =>
                RestriccionOperativa.crearNueva({
                    id: new IdentificadorUuid(randomUUID()),
                    empresaId,
                    empleadoId,
                    tipo: 'Test',
                    inicio: new FechaCivil('2026-05-10'),
                    fin: new FechaCivil('2026-05-09'),
                    mensajeOperativo: MensajeOperativo.crear('Mensaje'),
                }),
            ).toThrow(ErrorRestriccionInvalida);
        });

        it('debe rechazar tipo vacío o mayor a 150 caracteres', () => {
            expect(() =>
                RestriccionOperativa.crearNueva({
                    id: new IdentificadorUuid(randomUUID()),
                    empresaId,
                    empleadoId,
                    tipo: '',
                    inicio: new FechaCivil('2026-01-01'),
                    mensajeOperativo: MensajeOperativo.crear('Mensaje'),
                }),
            ).toThrow(ErrorRestriccionInvalida);

            expect(() =>
                RestriccionOperativa.crearNueva({
                    id: new IdentificadorUuid(randomUUID()),
                    empresaId,
                    empleadoId,
                    tipo: 'A'.repeat(151),
                    inicio: new FechaCivil('2026-01-01'),
                    mensajeOperativo: MensajeOperativo.crear('Mensaje'),
                }),
            ).toThrow(ErrorRestriccionInvalida);
        });

        it('debe anular una restricción con auditoría completa (actor, fecha y motivo)', () => {
            const restriccion = RestriccionOperativa.crearNueva({
                id: new IdentificadorUuid(randomUUID()),
                empresaId,
                empleadoId,
                tipo: 'Tipo',
                inicio: new FechaCivil('2026-01-01'),
                mensajeOperativo: MensajeOperativo.crear('Mensaje'),
            });

            const motivo = MotivoAnulacionNovedad.crear('Alta médica anticipada');
            restriccion.anular(cuentaAdminId, motivo);

            expect(restriccion.estaAnulada()).toBe(true);
            expect(restriccion.anuladaPorCuentaId?.equals(cuentaAdminId)).toBe(true);
            expect(restriccion.motivoAnulacion?.valor).toBe('Alta médica anticipada');
            expect(restriccion.anuladaEn).toBeDefined();
        });

        it('debe rechazar anular una restricción ya anulada', () => {
            const restriccion = RestriccionOperativa.crearNueva({
                id: new IdentificadorUuid(randomUUID()),
                empresaId,
                empleadoId,
                tipo: 'Tipo',
                inicio: new FechaCivil('2026-01-01'),
                mensajeOperativo: MensajeOperativo.crear('Mensaje'),
            });

            restriccion.anular(cuentaAdminId, MotivoAnulacionNovedad.crear('Motivo inicial'));

            expect(() => restriccion.anular(cuentaAdminId, MotivoAnulacionNovedad.crear('Segundo intento'))).toThrow(
                ErrorAnulacionNovedadInvalida,
            );
        });

        it('debe rechazar modificar una restricción ya anulada', () => {
            const restriccion = RestriccionOperativa.crearNueva({
                id: new IdentificadorUuid(randomUUID()),
                empresaId,
                empleadoId,
                tipo: 'Tipo',
                inicio: new FechaCivil('2026-01-01'),
                mensajeOperativo: MensajeOperativo.crear('Mensaje'),
            });

            restriccion.anular(cuentaAdminId, MotivoAnulacionNovedad.crear('Anulado'));

            expect(() =>
                restriccion.modificar({
                    mensajeOperativo: MensajeOperativo.crear('Nuevo mensaje'),
                }),
            ).toThrow(ErrorRestriccionInvalida);
        });
    });

    describe('PER-BR-022 y PER-BR-028 — Indisponibilidad justificada', () => {
        it('debe crear una Indisponibilidad válida con tipo catalogado y vigencia obligatoria', () => {
            const indisponibilidad = Indisponibilidad.crearNueva({
                id: new IdentificadorUuid(randomUUID()),
                empresaId,
                empleadoId,
                tipo: TipoIndisponibilidad.VACACIONES,
                inicio: new FechaCivil('2026-07-01'),
                fin: new FechaCivil('2026-07-15'),
                mensajeOperativo: MensajeOperativo.crear('Vacaciones anuales reglamentarias'),
            });

            expect(indisponibilidad.tipo).toBe(TipoIndisponibilidad.VACACIONES);
            expect(indisponibilidad.inicio.toString()).toBe('2026-07-01');
            expect(indisponibilidad.fin.toString()).toBe('2026-07-15');
            expect(indisponibilidad.mensajeOperativo.valor).toBe('Vacaciones anuales reglamentarias');
            expect(indisponibilidad.estaAnulada()).toBe(false);
            expect(indisponibilidad.version).toBe(1);
        });

        it('debe rechazar Indisponibilidad con fecha fin anterior al inicio', () => {
            expect(() =>
                Indisponibilidad.crearNueva({
                    id: new IdentificadorUuid(randomUUID()),
                    empresaId,
                    empleadoId,
                    tipo: TipoIndisponibilidad.LICENCIA_MEDICA,
                    inicio: new FechaCivil('2026-08-10'),
                    fin: new FechaCivil('2026-08-05'),
                    mensajeOperativo: MensajeOperativo.crear('Reposo 5 días'),
                }),
            ).toThrow(ErrorIndisponibilidadInvalida);
        });

        it('debe aceptar referencia opcional a archivo ARC', () => {
            const archivoId = new IdentificadorUuid(randomUUID());
            const indisponibilidad = Indisponibilidad.crearNueva({
                id: new IdentificadorUuid(randomUUID()),
                empresaId,
                empleadoId,
                tipo: TipoIndisponibilidad.LICENCIA_MEDICA,
                inicio: new FechaCivil('2026-09-01'),
                fin: new FechaCivil('2026-09-03'),
                mensajeOperativo: MensajeOperativo.crear('Certificado médico adjunto'),
                archivoId,
            });

            expect(indisponibilidad.archivoId?.equals(archivoId)).toBe(true);
        });

        it('debe anular una indisponibilidad con auditoría completa y motivo', () => {
            const indisponibilidad = Indisponibilidad.crearNueva({
                id: new IdentificadorUuid(randomUUID()),
                empresaId,
                empleadoId,
                tipo: TipoIndisponibilidad.OTRA_JUSTIFICADA,
                inicio: new FechaCivil('2026-10-01'),
                fin: new FechaCivil('2026-10-02'),
                mensajeOperativo: MensajeOperativo.crear('Trámite judicial'),
            });

            indisponibilidad.anular(cuentaAdminId, MotivoAnulacionNovedad.crear('Audiencia suspendida'));

            expect(indisponibilidad.estaAnulada()).toBe(true);
            expect(indisponibilidad.anuladaPorCuentaId?.equals(cuentaAdminId)).toBe(true);
            expect(indisponibilidad.motivoAnulacion?.valor).toBe('Audiencia suspendida');
            expect(indisponibilidad.anuladaEn).toBeDefined();
        });

        it('debe rechazar anular una indisponibilidad ya anulada', () => {
            const indisponibilidad = Indisponibilidad.crearNueva({
                id: new IdentificadorUuid(randomUUID()),
                empresaId,
                empleadoId,
                tipo: TipoIndisponibilidad.SUSPENSION,
                inicio: new FechaCivil('2026-11-01'),
                fin: new FechaCivil('2026-11-03'),
                mensajeOperativo: MensajeOperativo.crear('Sanción disciplinaria'),
            });

            indisponibilidad.anular(cuentaAdminId, MotivoAnulacionNovedad.crear('Revocación de sanción'));

            expect(() => indisponibilidad.anular(cuentaAdminId, MotivoAnulacionNovedad.crear('Segundo intento'))).toThrow(
                ErrorAnulacionNovedadInvalida,
            );
        });

        it('debe rechazar modificar una indisponibilidad ya anulada', () => {
            const indisponibilidad = Indisponibilidad.crearNueva({
                id: new IdentificadorUuid(randomUUID()),
                empresaId,
                empleadoId,
                tipo: TipoIndisponibilidad.VACACIONES,
                inicio: new FechaCivil('2026-12-01'),
                fin: new FechaCivil('2026-12-15'),
                mensajeOperativo: MensajeOperativo.crear('Vacaciones'),
            });

            indisponibilidad.anular(cuentaAdminId, MotivoAnulacionNovedad.crear('Canceladas'));

            expect(() =>
                indisponibilidad.modificar({
                    mensajeOperativo: MensajeOperativo.crear('Cambio de fecha'),
                }),
            ).toThrow(ErrorIndisponibilidadInvalida);
        });
    });
});
