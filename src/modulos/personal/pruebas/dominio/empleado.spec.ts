import { randomUUID } from 'crypto';
import { IdentificadorUuid, FechaCivil } from '../../../../comun/dominio';
import { TipoDocumento, GrupoSanguineo, FactorSanguineo, EstadoEmpleado } from '../../dominio/enumeraciones';
import {
    DocumentoIdentidad,
    NombrePersona,
    ApellidoPersona,
    TelefonoContacto,
    DomicilioEmpleado,
    EspecialidadEmpleado,
    NotasEmpleado,
    MotivoFinPeriodo,
} from '../../dominio/objetos-valor';
import { Empleado } from '../../dominio/agregados/empleado';
import { ErrorTransicionEmpleadoInvalida, ErrorDatoPersonalInvalido } from '../../dominio/errores';

describe('T02 — Dominio: Agregado Empleado y ciclo laboral', () => {
    const empresaId = new IdentificadorUuid(randomUUID());
    const empleadoId = new IdentificadorUuid(randomUUID());
    const documento = DocumentoIdentidad.crear(TipoDocumento.DNI, '30123456');
    const nombre = NombrePersona.crear('Juan');
    const apellido = ApellidoPersona.crear('Pérez');
    const telefono = TelefonoContacto.crear('+54 376 4112233');
    const fechaInicio = new FechaCivil('2026-01-15');

    describe('PER-BR-003 y PER-BR-005 — Alta de Empleado ACTIVO con primer período laboral', () => {
        it('debe crear un Empleado en estado ACTIVO con un período laboral abierto', () => {
            const empleado = Empleado.crearNuevo({
                id: empleadoId,
                empresaId,
                documento,
                nombre,
                apellido,
                telefonoContacto: telefono,
                fechaInicioLaboral: fechaInicio,
            });

            expect(empleado.id.equals(empleadoId)).toBe(true);
            expect(empleado.empresaId.equals(empresaId)).toBe(true);
            expect(empleado.documento).toBe(documento);
            expect(empleado.nombre).toBe(nombre);
            expect(empleado.apellido).toBe(apellido);
            expect(empleado.telefonoContacto).toBe(telefono);
            expect(empleado.estado).toBe(EstadoEmpleado.ACTIVO);
            expect(empleado.estaActivo()).toBe(true);

            expect(empleado.periodosLaborales).toHaveLength(1);
            const periodo = empleado.periodosLaborales[0];
            expect(periodo.inicio.toString()).toBe('2026-01-15');
            expect(periodo.fin).toBeUndefined();
            expect(periodo.motivoFin).toBeUndefined();
            expect(periodo.empresaId.equals(empresaId)).toBe(true);
            expect(periodo.empleadoId.equals(empleadoId)).toBe(true);
        });

        it('debe aceptar datos opcionales válidos en el alta', () => {
            const empleado = Empleado.crearNuevo({
                id: empleadoId,
                empresaId,
                documento,
                nombre,
                apellido,
                telefonoContacto: telefono,
                fechaInicioLaboral: fechaInicio,
                fechaNacimiento: new FechaCivil('1990-05-20'),
                domicilio: DomicilioEmpleado.crear('Barrio Centro'),
                grupoSanguineo: GrupoSanguineo.O,
                factorSanguineo: FactorSanguineo.POSITIVO,
                especialidad: EspecialidadEmpleado.crear('Poda'),
                notas: NotasEmpleado.crear('Ficha creada desde RRHH'),
            });

            expect(empleado.fechaNacimiento?.toString()).toBe('1990-05-20');
            expect(empleado.domicilio?.valor).toBe('Barrio Centro');
            expect(empleado.grupoSanguineo).toBe(GrupoSanguineo.O);
            expect(empleado.factorSanguineo).toBe(FactorSanguineo.POSITIVO);
            expect(empleado.especialidad?.valor).toBe('Poda');
            expect(empleado.notas?.valor).toBe('Ficha creada desde RRHH');
        });
    });

    describe('PER-BR-005 — Inactivación y Reactivación (Ciclo laboral e historia)', () => {
        it('debe inactivar un Empleado activo cerrando el período laboral vigente', () => {
            const empleado = Empleado.crearNuevo({
                id: empleadoId,
                empresaId,
                documento,
                nombre,
                apellido,
                telefonoContacto: telefono,
                fechaInicioLaboral: fechaInicio,
            });

            const fechaFin = new FechaCivil('2026-06-30');
            const motivoFin = MotivoFinPeriodo.crear('Fin de contrato temporal');

            empleado.inactivar(fechaFin, motivoFin);

            expect(empleado.estado).toBe(EstadoEmpleado.INACTIVO);
            expect(empleado.estaActivo()).toBe(false);
            expect(empleado.periodosLaborales).toHaveLength(1);
            expect(empleado.periodosLaborales[0].fin?.toString()).toBe('2026-06-30');
            expect(empleado.periodosLaborales[0].motivoFin?.valor).toBe('Fin de contrato temporal');
        });

        it('debe rechazar inactivar un Empleado que ya está INACTIVO', () => {
            const empleado = Empleado.crearNuevo({
                id: empleadoId,
                empresaId,
                documento,
                nombre,
                apellido,
                telefonoContacto: telefono,
                fechaInicioLaboral: fechaInicio,
            });

            empleado.inactivar(new FechaCivil('2026-06-30'), MotivoFinPeriodo.crear('Motivo 1'));

            expect(() => empleado.inactivar(new FechaCivil('2026-07-01'), MotivoFinPeriodo.crear('Motivo 2'))).toThrow(
                ErrorTransicionEmpleadoInvalida,
            );
        });

        it('debe rechazar fecha de fin anterior al inicio del período laboral actual', () => {
            const empleado = Empleado.crearNuevo({
                id: empleadoId,
                empresaId,
                documento,
                nombre,
                apellido,
                telefonoContacto: telefono,
                fechaInicioLaboral: new FechaCivil('2026-06-01'),
            });

            expect(() => empleado.inactivar(new FechaCivil('2026-05-31'), MotivoFinPeriodo.crear('Fecha anterior'))).toThrow(
                ErrorTransicionEmpleadoInvalida,
            );
        });

        it('debe reactivar un Empleado inactivo abriendo un nuevo período laboral', () => {
            const empleado = Empleado.crearNuevo({
                id: empleadoId,
                empresaId,
                documento,
                nombre,
                apellido,
                telefonoContacto: telefono,
                fechaInicioLaboral: new FechaCivil('2026-01-01'),
            });

            empleado.inactivar(new FechaCivil('2026-06-30'), MotivoFinPeriodo.crear('Fin de temporada'));

            const nuevaFechaInicio = new FechaCivil('2026-09-01');
            empleado.reactivar(nuevaFechaInicio);

            expect(empleado.estado).toBe(EstadoEmpleado.ACTIVO);
            expect(empleado.estaActivo()).toBe(true);
            expect(empleado.periodosLaborales).toHaveLength(2);

            const [p1, p2] = empleado.periodosLaborales;
            expect(p1.inicio.toString()).toBe('2026-01-01');
            expect(p1.fin?.toString()).toBe('2026-06-30');
            expect(p2.inicio.toString()).toBe('2026-09-01');
            expect(p2.fin).toBeUndefined();
        });

        it('debe rechazar reactivar un Empleado que ya está ACTIVO', () => {
            const empleado = Empleado.crearNuevo({
                id: empleadoId,
                empresaId,
                documento,
                nombre,
                apellido,
                telefonoContacto: telefono,
                fechaInicioLaboral: fechaInicio,
            });

            expect(() => empleado.reactivar(new FechaCivil('2026-08-01'))).toThrow(ErrorTransicionEmpleadoInvalida);
        });

        it('debe rechazar reactivar con fecha anterior al fin del período laboral anterior', () => {
            const empleado = Empleado.crearNuevo({
                id: empleadoId,
                empresaId,
                documento,
                nombre,
                apellido,
                telefonoContacto: telefono,
                fechaInicioLaboral: new FechaCivil('2026-01-01'),
            });

            empleado.inactivar(new FechaCivil('2026-06-30'), MotivoFinPeriodo.crear('Fin temporada'));

            expect(() => empleado.reactivar(new FechaCivil('2026-06-15'))).toThrow(ErrorTransicionEmpleadoInvalida);
        });
    });

    describe('Modificación de datos básicos y colecciones dependientes (D-02)', () => {
        it('debe permitir actualizar datos personales y opcionales', () => {
            const empleado = Empleado.crearNuevo({
                id: empleadoId,
                empresaId,
                documento,
                nombre,
                apellido,
                telefonoContacto: telefono,
                fechaInicioLaboral: fechaInicio,
            });

            const nuevoTelefono = TelefonoContacto.crear('+54 376 4998877');
            const nuevoDomicilio = DomicilioEmpleado.crear('Av. Corrientes 100');

            empleado.actualizarDatos({
                nombre: NombrePersona.crear('Juan Alberto'),
                apellido,
                telefonoContacto: nuevoTelefono,
                domicilio: nuevoDomicilio,
            });

            expect(empleado.nombre.valor).toBe('Juan Alberto');
            expect(empleado.telefonoContacto.valor).toBe('+54 376 4998877');
            expect(empleado.domicilio?.valor).toBe('Av. Corrientes 100');
        });

        it('debe sincronizar Contactos de emergencia respetando la empresa del empleado', () => {
            const empleado = Empleado.crearNuevo({
                id: empleadoId,
                empresaId,
                documento,
                nombre,
                apellido,
                telefonoContacto: telefono,
                fechaInicioLaboral: fechaInicio,
            });

            empleado.sincronizarContactos([
                {
                    nombre: 'María Gómez',
                    vinculo: 'Cónyuge',
                    telefono: '+54 376 4111222',
                },
            ]);

            expect(empleado.contactosEmergencia).toHaveLength(1);
            expect(empleado.contactosEmergencia[0].nombre).toBe('María Gómez');
            expect(empleado.contactosEmergencia[0].vinculo).toBe('Cónyuge');
            expect(empleado.contactosEmergencia[0].empresaId.equals(empresaId)).toBe(true);
            expect(empleado.contactosEmergencia[0].empleadoId.equals(empleadoId)).toBe(true);
        });

        it('debe sincronizar Licencias de Empleado validando fechas coherentes', () => {
            const empleado = Empleado.crearNuevo({
                id: empleadoId,
                empresaId,
                documento,
                nombre,
                apellido,
                telefonoContacto: telefono,
                fechaInicioLaboral: fechaInicio,
            });

            empleado.sincronizarLicencias([
                {
                    tipo: 'Conducir Categoría B',
                    numero: 'B-123456',
                    emitidaEn: new FechaCivil('2024-01-01'),
                    venceEn: new FechaCivil('2029-01-01'),
                },
            ]);

            expect(empleado.licencias).toHaveLength(1);
            expect(empleado.licencias[0].tipo).toBe('Conducir Categoría B');
            expect(empleado.licencias[0].numero).toBe('B-123456');
            expect(empleado.licencias[0].empresaId.equals(empresaId)).toBe(true);
        });

        it('debe rechazar Licencia si la fecha de vencimiento es anterior a la de emisión', () => {
            const empleado = Empleado.crearNuevo({
                id: empleadoId,
                empresaId,
                documento,
                nombre,
                apellido,
                telefonoContacto: telefono,
                fechaInicioLaboral: fechaInicio,
            });

            expect(() =>
                empleado.sincronizarLicencias([
                    {
                        tipo: 'Habilitación Fitosanitarios',
                        emitidaEn: new FechaCivil('2026-05-10'),
                        venceEn: new FechaCivil('2026-05-09'),
                    },
                ]),
            ).toThrow(ErrorDatoPersonalInvalido);
        });
    });
});
