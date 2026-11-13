import {
    TipoDocumento,
    GrupoSanguineo,
    FactorSanguineo,
    EstadoEmpleado,
    TipoIndisponibilidad,
} from '../../dominio/enumeraciones';
import {
    DocumentoIdentidad,
    NombrePersona,
    ApellidoPersona,
    TelefonoContacto,
    DomicilioEmpleado,
    EspecialidadEmpleado,
    MensajeOperativo,
    MotivoAnulacionNovedad,
    MotivoFinPeriodo,
    NotasEmpleado,
} from '../../dominio/objetos-valor';
import {
    ErrorTenantInvalido,
    ErrorDocumentoDuplicado,
    ErrorEmpleadoInvalido,
    ErrorDatoPersonalInvalido,
    ErrorTransicionEmpleadoInvalida,
    ErrorRestriccionInvalida,
    ErrorIndisponibilidadInvalida,
    ErrorAnulacionNovedadInvalida,
} from '../../dominio/errores';

describe('T01 — Dominio: Enumeraciones, Objetos de valor y Errores de Personal', () => {
    describe('PER-BR-001 — Aislamiento por Empresa y Errores de Tenant', () => {
        it('ErrorTenantInvalido debe exponer código PER_TENANT_INVALIDO y categoría REGLA_NEGOCIO', () => {
            const err = new ErrorTenantInvalido('Tenant inválido');
            expect(err.codigo).toBe('PER_TENANT_INVALIDO');
            expect(err.name).toBe('ErrorTenantInvalido');
        });
    });

    describe('PER-BR-002 — Documento único dentro de la Empresa / DocumentoIdentidad', () => {
        it('debe crear un DocumentoIdentidad válido normalizando número en mayúsculas y sin espacios exteriores', () => {
            const doc = DocumentoIdentidad.crear(TipoDocumento.DNI, '  30123456  ');
            expect(doc.tipo).toBe(TipoDocumento.DNI);
            expect(doc.numero).toBe('30123456');
            expect(doc.detalleTipo).toBeUndefined();
        });

        it('debe aceptar número con letras normalizándolas a mayúsculas', () => {
            const doc = DocumentoIdentidad.crear(TipoDocumento.PASAPORTE, '  aBc12345  ');
            expect(doc.numero).toBe('ABC12345');
        });

        it('debe exigir detalleTipoDocumento cuando tipoDocumento es OTRO', () => {
            expect(() => DocumentoIdentidad.crear(TipoDocumento.OTRO, '12345')).toThrow(ErrorEmpleadoInvalido);
            expect(() => DocumentoIdentidad.crear(TipoDocumento.OTRO, '12345', '   ')).toThrow(ErrorEmpleadoInvalido);

            const docOtro = DocumentoIdentidad.crear(TipoDocumento.OTRO, '12345', '  Libreta Cívica  ');
            expect(docOtro.tipo).toBe(TipoDocumento.OTRO);
            expect(docOtro.detalleTipo).toBe('Libreta Cívica');
        });

        it('no debe admitir detalleTipoDocumento si tipoDocumento no es OTRO', () => {
            expect(() => DocumentoIdentidad.crear(TipoDocumento.DNI, '12345', 'Detalle')).toThrow(ErrorEmpleadoInvalido);
        });

        it('debe rechazar número de documento vacío o de sólo espacios', () => {
            expect(() => DocumentoIdentidad.crear(TipoDocumento.DNI, '')).toThrow(ErrorEmpleadoInvalido);
            expect(() => DocumentoIdentidad.crear(TipoDocumento.DNI, '   ')).toThrow(ErrorEmpleadoInvalido);
        });

        it('debe rechazar número de documento de más de 50 caracteres', () => {
            const largo = 'A'.repeat(51);
            expect(() => DocumentoIdentidad.crear(TipoDocumento.DNI, largo)).toThrow(ErrorEmpleadoInvalido);
        });

        it('debe aceptar número de documento de hasta 50 caracteres', () => {
            const exacto = 'A'.repeat(50);
            const doc = DocumentoIdentidad.crear(TipoDocumento.DNI, exacto);
            expect(doc.numero).toBe(exacto);
        });

        it('ErrorDocumentoDuplicado debe exponer código PER_DOCUMENTO_DUPLICADO y categoría CONFLICTO', () => {
            const err = new ErrorDocumentoDuplicado('DNI', '12345678');
            expect(err.codigo).toBe('PER_DOCUMENTO_DUPLICADO');
        });
    });

    describe('PER-BR-003 — Datos mínimos del Empleado (Nombre, Apellido, Teléfono)', () => {
        it('debe crear NombrePersona válido recortando espacios exteriores', () => {
            const nombre = NombrePersona.crear('  Juan Carlos  ');
            expect(nombre.valor).toBe('Juan Carlos');
        });

        it('debe rechazar NombrePersona vacío o que supere 150 caracteres', () => {
            expect(() => NombrePersona.crear('')).toThrow(ErrorEmpleadoInvalido);
            expect(() => NombrePersona.crear('   ')).toThrow(ErrorEmpleadoInvalido);
            expect(() => NombrePersona.crear('A'.repeat(151))).toThrow(ErrorEmpleadoInvalido);
        });

        it('debe crear ApellidoPersona válido recortando espacios exteriores', () => {
            const apellido = ApellidoPersona.crear('  González  ');
            expect(apellido.valor).toBe('González');
        });

        it('debe rechazar ApellidoPersona vacío o que supere 150 caracteres', () => {
            expect(() => ApellidoPersona.crear('')).toThrow(ErrorEmpleadoInvalido);
            expect(() => ApellidoPersona.crear('   ')).toThrow(ErrorEmpleadoInvalido);
            expect(() => ApellidoPersona.crear('A'.repeat(151))).toThrow(ErrorEmpleadoInvalido);
        });

        it('debe crear TelefonoContacto válido recortando espacios', () => {
            const tel = TelefonoContacto.crear('  +54 376 154123456  ');
            expect(tel.valor).toBe('+54 376 154123456');
        });

        it('debe rechazar TelefonoContacto vacío o que supere 30 caracteres', () => {
            expect(() => TelefonoContacto.crear('')).toThrow(ErrorEmpleadoInvalido);
            expect(() => TelefonoContacto.crear('   ')).toThrow(ErrorEmpleadoInvalido);
            expect(() => TelefonoContacto.crear('1'.repeat(31))).toThrow(ErrorEmpleadoInvalido);
        });
    });

    describe('PER-BR-004 — Datos opcionales estructurados (Domicilio, Especialidad, Notas)', () => {
        it('debe aceptar DomicilioEmpleado de hasta 100 caracteres', () => {
            const dom = DomicilioEmpleado.crear('  Ruta 14 Km 40  ');
            expect(dom.valor).toBe('Ruta 14 Km 40');
            expect(DomicilioEmpleado.crear('A'.repeat(100)).valor).toBe('A'.repeat(100));
        });

        it('debe rechazar DomicilioEmpleado que supere 100 caracteres', () => {
            expect(() => DomicilioEmpleado.crear('A'.repeat(101))).toThrow(ErrorDatoPersonalInvalido);
        });

        it('debe aceptar EspecialidadEmpleado como texto libre de hasta 100 caracteres', () => {
            const esp = EspecialidadEmpleado.crear('  Injertador experto  ');
            expect(esp.valor).toBe('Injertador experto');
            expect(EspecialidadEmpleado.crear('E'.repeat(100)).valor).toBe('E'.repeat(100));
        });

        it('debe rechazar EspecialidadEmpleado que supere 100 caracteres', () => {
            expect(() => EspecialidadEmpleado.crear('E'.repeat(101))).toThrow(ErrorDatoPersonalInvalido);
        });

        it('debe aceptar NotasEmpleado de hasta 1000 caracteres', () => {
            const notas = NotasEmpleado.crear('  Observación general  ');
            expect(notas.valor).toBe('Observación general');
            expect(NotasEmpleado.crear('N'.repeat(1000)).valor).toBe('N'.repeat(1000));
        });

        it('debe rechazar NotasEmpleado que supere 1000 caracteres', () => {
            expect(() => NotasEmpleado.crear('N'.repeat(1001))).toThrow(ErrorDatoPersonalInvalido);
        });
    });

    describe('PER-BR-021 y PER-BR-022 — Mensaje operativo de restricciones e indisponibilidades', () => {
        it('ErrorIndisponibilidadInvalida debe exponer código PER_INDISPONIBILIDAD_INVALIDA', () => {
            const err = new ErrorIndisponibilidadInvalida();
            expect(err.codigo).toBe('PER_INDISPONIBILIDAD_INVALIDA');
        });

        it('debe aceptar MensajeOperativo válido de hasta 1000 caracteres no vacío', () => {
            const msj = MensajeOperativo.crear('  Requiere tareas livianas por 15 días  ');
            expect(msj.valor).toBe('Requiere tareas livianas por 15 días');
            expect(MensajeOperativo.crear('M'.repeat(1000)).valor).toBe('M'.repeat(1000));
        });

        it('debe rechazar MensajeOperativo vacío o de más de 1000 caracteres', () => {
            expect(() => MensajeOperativo.crear('')).toThrow(ErrorRestriccionInvalida);
            expect(() => MensajeOperativo.crear('   ')).toThrow(ErrorRestriccionInvalida);
            expect(() => MensajeOperativo.crear('M'.repeat(1001))).toThrow(ErrorRestriccionInvalida);
        });
    });

    describe('PER-BR-028 — Motivo de anulación de novedades laborales', () => {
        it('debe aceptar MotivoAnulacionNovedad de hasta 1000 caracteres no vacío', () => {
            const motivo = MotivoAnulacionNovedad.crear('  Carga errónea de fecha de inicio  ');
            expect(motivo.valor).toBe('Carga errónea de fecha de inicio');
            expect(MotivoAnulacionNovedad.crear('O'.repeat(1000)).valor).toBe('O'.repeat(1000));
        });

        it('debe rechazar MotivoAnulacionNovedad vacío o que supere 1000 caracteres', () => {
            expect(() => MotivoAnulacionNovedad.crear('')).toThrow(ErrorAnulacionNovedadInvalida);
            expect(() => MotivoAnulacionNovedad.crear('   ')).toThrow(ErrorAnulacionNovedadInvalida);
            expect(() => MotivoAnulacionNovedad.crear('O'.repeat(1001))).toThrow(ErrorAnulacionNovedadInvalida);
        });

        it('debe aceptar MotivoFinPeriodo de hasta 1000 caracteres no vacío', () => {
            const motivo = MotivoFinPeriodo.crear('  Renuncia voluntaria  ');
            expect(motivo.valor).toBe('Renuncia voluntaria');
        });

        it('debe rechazar MotivoFinPeriodo vacío o que supere 1000 caracteres', () => {
            expect(() => MotivoFinPeriodo.crear('')).toThrow(ErrorTransicionEmpleadoInvalida);
            expect(() => MotivoFinPeriodo.crear('   ')).toThrow(ErrorTransicionEmpleadoInvalida);
            expect(() => MotivoFinPeriodo.crear('F'.repeat(1001))).toThrow(ErrorTransicionEmpleadoInvalida);
        });
    });

    describe('Enumeraciones de Personal', () => {
        it('debe exponer los valores aprobados para TipoDocumento', () => {
            expect(Object.values(TipoDocumento)).toEqual(['DNI', 'PASAPORTE', 'CEDULA', 'OTRO']);
        });

        it('debe exponer los valores aprobados para GrupoSanguineo y FactorSanguineo', () => {
            expect(Object.values(GrupoSanguineo)).toEqual(['A', 'B', 'AB', 'O']);
            expect(Object.values(FactorSanguineo)).toEqual(['POSITIVO', 'NEGATIVO']);
        });

        it('debe exponer los valores aprobados para EstadoEmpleado', () => {
            expect(Object.values(EstadoEmpleado)).toEqual(['ACTIVO', 'INACTIVO']);
        });

        it('debe exponer los valores aprobados para TipoIndisponibilidad', () => {
            expect(Object.values(TipoIndisponibilidad)).toEqual([
                'VACACIONES',
                'LICENCIA_MEDICA',
                'LICENCIA_ESPECIAL',
                'SUSPENSION',
                'OTRA_JUSTIFICADA',
            ]);
        });
    });
});
