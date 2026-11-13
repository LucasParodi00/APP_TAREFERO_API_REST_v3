import { randomUUID } from 'crypto';
import { IdentificadorUuid, FechaCivil, FechaHoraUtc } from '../../../../comun/dominio';
import { GrupoSanguineo, FactorSanguineo, EstadoEmpleado } from '../enumeraciones';
import {
    DocumentoIdentidad,
    NombrePersona,
    ApellidoPersona,
    TelefonoContacto,
    DomicilioEmpleado,
    EspecialidadEmpleado,
    NotasEmpleado,
    MotivoFinPeriodo,
} from '../objetos-valor';
import { PeriodoLaboral, ContactoEmergencia, LicenciaEmpleado } from '../entidades';
import { ErrorTransicionEmpleadoInvalida } from '../errores';

export interface ParametrosCrearEmpleado {
    id: IdentificadorUuid;
    empresaId: IdentificadorUuid;
    documento: DocumentoIdentidad;
    nombre: NombrePersona;
    apellido: ApellidoPersona;
    telefonoContacto: TelefonoContacto;
    fechaInicioLaboral: FechaCivil;
    primerPeriodoId?: IdentificadorUuid;
    fechaNacimiento?: FechaCivil;
    domicilio?: DomicilioEmpleado;
    grupoSanguineo?: GrupoSanguineo;
    factorSanguineo?: FactorSanguineo;
    especialidad?: EspecialidadEmpleado;
    notas?: NotasEmpleado;
}

export interface PropiedadesReconstituirEmpleado {
    id: IdentificadorUuid;
    empresaId: IdentificadorUuid;
    documento: DocumentoIdentidad;
    nombre: NombrePersona;
    apellido: ApellidoPersona;
    telefonoContacto: TelefonoContacto;
    estado: EstadoEmpleado;
    fechaNacimiento?: FechaCivil;
    domicilio?: DomicilioEmpleado;
    grupoSanguineo?: GrupoSanguineo;
    factorSanguineo?: FactorSanguineo;
    especialidad?: EspecialidadEmpleado;
    notas?: NotasEmpleado;
    version: number;
    creadoEn: FechaHoraUtc;
    actualizadoEn: FechaHoraUtc;
    periodosLaborales: PeriodoLaboral[];
    contactosEmergencia: ContactoEmergencia[];
    licencias: LicenciaEmpleado[];
}

export class Empleado {
    readonly id: IdentificadorUuid;
    readonly empresaId: IdentificadorUuid;
    private _documento: DocumentoIdentidad;
    private _nombre: NombrePersona;
    private _apellido: ApellidoPersona;
    private _telefonoContacto: TelefonoContacto;
    private _estado: EstadoEmpleado;
    private _fechaNacimiento?: FechaCivil;
    private _domicilio?: DomicilioEmpleado;
    private _grupoSanguineo?: GrupoSanguineo;
    private _factorSanguineo?: FactorSanguineo;
    private _especialidad?: EspecialidadEmpleado;
    private _notas?: NotasEmpleado;
    private _version: number;
    private _creadoEn: FechaHoraUtc;
    private _actualizadoEn: FechaHoraUtc;
    private _periodosLaborales: PeriodoLaboral[] = [];
    private _contactosEmergencia: ContactoEmergencia[] = [];
    private _licencias: LicenciaEmpleado[] = [];

    private constructor(props: PropiedadesReconstituirEmpleado) {
        this.id = props.id;
        this.empresaId = props.empresaId;
        this._documento = props.documento;
        this._nombre = props.nombre;
        this._apellido = props.apellido;
        this._telefonoContacto = props.telefonoContacto;
        this._estado = props.estado;
        this._fechaNacimiento = props.fechaNacimiento;
        this._domicilio = props.domicilio;
        this._grupoSanguineo = props.grupoSanguineo;
        this._factorSanguineo = props.factorSanguineo;
        this._especialidad = props.especialidad;
        this._notas = props.notas;
        this._version = props.version;
        this._creadoEn = props.creadoEn;
        this._actualizadoEn = props.actualizadoEn;
        this._periodosLaborales = [...props.periodosLaborales];
        this._contactosEmergencia = [...props.contactosEmergencia];
        this._licencias = [...props.licencias];
    }

    static crearNuevo(params: ParametrosCrearEmpleado): Empleado {
        const ahora = FechaHoraUtc.desdeDate(new Date());
        const primerPeriodo = new PeriodoLaboral({
            id: params.primerPeriodoId ?? new IdentificadorUuid(randomUUID()),
            empresaId: params.empresaId,
            empleadoId: params.id,
            inicio: params.fechaInicioLaboral,
        });

        return new Empleado({
            id: params.id,
            empresaId: params.empresaId,
            documento: params.documento,
            nombre: params.nombre,
            apellido: params.apellido,
            telefonoContacto: params.telefonoContacto,
            estado: EstadoEmpleado.ACTIVO,
            fechaNacimiento: params.fechaNacimiento,
            domicilio: params.domicilio,
            grupoSanguineo: params.grupoSanguineo,
            factorSanguineo: params.factorSanguineo,
            especialidad: params.especialidad,
            notas: params.notas,
            version: 1,
            creadoEn: ahora,
            actualizadoEn: ahora,
            periodosLaborales: [primerPeriodo],
            contactosEmergencia: [],
            licencias: [],
        });
    }

    static reconstituir(props: PropiedadesReconstituirEmpleado): Empleado {
        return new Empleado(props);
    }

    get documento(): DocumentoIdentidad {
        return this._documento;
    }

    get nombre(): NombrePersona {
        return this._nombre;
    }

    get apellido(): ApellidoPersona {
        return this._apellido;
    }

    get telefonoContacto(): TelefonoContacto {
        return this._telefonoContacto;
    }

    get estado(): EstadoEmpleado {
        return this._estado;
    }

    get fechaNacimiento(): FechaCivil | undefined {
        return this._fechaNacimiento;
    }

    get domicilio(): DomicilioEmpleado | undefined {
        return this._domicilio;
    }

    get grupoSanguineo(): GrupoSanguineo | undefined {
        return this._grupoSanguineo;
    }

    get factorSanguineo(): FactorSanguineo | undefined {
        return this._factorSanguineo;
    }

    get especialidad(): EspecialidadEmpleado | undefined {
        return this._especialidad;
    }

    get notas(): NotasEmpleado | undefined {
        return this._notas;
    }

    get version(): number {
        return this._version;
    }

    get creadoEn(): FechaHoraUtc {
        return this._creadoEn;
    }

    get actualizadoEn(): FechaHoraUtc {
        return this._actualizadoEn;
    }

    get periodosLaborales(): readonly PeriodoLaboral[] {
        return this._periodosLaborales;
    }

    get contactosEmergencia(): readonly ContactoEmergencia[] {
        return this._contactosEmergencia;
    }

    get licencias(): readonly LicenciaEmpleado[] {
        return this._licencias;
    }

    estaActivo(): boolean {
        return this._estado === EstadoEmpleado.ACTIVO;
    }

    inactivar(fechaFin: FechaCivil, motivoFin: MotivoFinPeriodo): void {
        if (!this.estaActivo()) {
            throw new ErrorTransicionEmpleadoInvalida('Solo se puede inactivar un Empleado que se encuentra ACTIVO.');
        }

        const periodoAbierto = this._periodosLaborales.find((p) => p.fin === undefined);
        if (!periodoAbierto) {
            throw new ErrorTransicionEmpleadoInvalida('El Empleado no posee un período laboral activo para cerrar.');
        }

        periodoAbierto.cerrar(fechaFin, motivoFin);
        this._estado = EstadoEmpleado.INACTIVO;
        this._actualizadoEn = FechaHoraUtc.desdeDate(new Date());
    }

    reactivar(nuevaFechaInicio: FechaCivil, nuevoPeriodoId?: IdentificadorUuid): void {
        if (this.estaActivo()) {
            throw new ErrorTransicionEmpleadoInvalida('Solo se puede reactivar un Empleado que se encuentra INACTIVO.');
        }

        const ultimosPeriodos = [...this._periodosLaborales].sort((a, b) => (a.inicio.valor < b.inicio.valor ? -1 : 1));
        const ultimoPeriodo = ultimosPeriodos[ultimosPeriodos.length - 1];

        if (ultimoPeriodo?.fin && nuevaFechaInicio.valor < ultimoPeriodo.fin.valor) {
            throw new ErrorTransicionEmpleadoInvalida(
                `La fecha de inicio de reactivación (${nuevaFechaInicio.valor}) no puede ser anterior al fin del período previo (${ultimoPeriodo.fin.valor}).`,
            );
        }

        const nuevoPeriodo = new PeriodoLaboral({
            id: nuevoPeriodoId ?? new IdentificadorUuid(randomUUID()),
            empresaId: this.empresaId,
            empleadoId: this.id,
            inicio: nuevaFechaInicio,
        });

        this._periodosLaborales.push(nuevoPeriodo);
        this._estado = EstadoEmpleado.ACTIVO;
        this._actualizadoEn = FechaHoraUtc.desdeDate(new Date());
    }

    actualizarDatos(datos: {
        documento?: DocumentoIdentidad;
        nombre?: NombrePersona;
        apellido?: ApellidoPersona;
        telefonoContacto?: TelefonoContacto;
        fechaNacimiento?: FechaCivil | null;
        domicilio?: DomicilioEmpleado | null;
        grupoSanguineo?: GrupoSanguineo | null;
        factorSanguineo?: FactorSanguineo | null;
        especialidad?: EspecialidadEmpleado | null;
        notas?: NotasEmpleado | null;
    }): void {
        if (datos.documento) this._documento = datos.documento;
        if (datos.nombre) this._nombre = datos.nombre;
        if (datos.apellido) this._apellido = datos.apellido;
        if (datos.telefonoContacto) this._telefonoContacto = datos.telefonoContacto;

        if (datos.fechaNacimiento !== undefined) this._fechaNacimiento = datos.fechaNacimiento ?? undefined;
        if (datos.domicilio !== undefined) this._domicilio = datos.domicilio ?? undefined;
        if (datos.grupoSanguineo !== undefined) this._grupoSanguineo = datos.grupoSanguineo ?? undefined;
        if (datos.factorSanguineo !== undefined) this._factorSanguineo = datos.factorSanguineo ?? undefined;
        if (datos.especialidad !== undefined) this._especialidad = datos.especialidad ?? undefined;
        if (datos.notas !== undefined) this._notas = datos.notas ?? undefined;

        this._actualizadoEn = FechaHoraUtc.desdeDate(new Date());
    }

    sincronizarContactos(contactos: Array<{ id?: IdentificadorUuid; nombre: string; vinculo: string; telefono: string }>): void {
        this._contactosEmergencia = contactos.map(
            (c) =>
                new ContactoEmergencia({
                    id: c.id ?? new IdentificadorUuid(randomUUID()),
                    empresaId: this.empresaId,
                    empleadoId: this.id,
                    nombre: c.nombre,
                    vinculo: c.vinculo,
                    telefono: c.telefono,
                }),
        );
        this._actualizadoEn = FechaHoraUtc.desdeDate(new Date());
    }

    sincronizarLicencias(
        licencias: Array<{
            id?: IdentificadorUuid;
            tipo: string;
            numero?: string;
            emitidaEn?: FechaCivil;
            venceEn?: FechaCivil;
            archivoId?: IdentificadorUuid;
        }>,
    ): void {
        this._licencias = licencias.map(
            (l) =>
                new LicenciaEmpleado({
                    id: l.id ?? new IdentificadorUuid(randomUUID()),
                    empresaId: this.empresaId,
                    empleadoId: this.id,
                    tipo: l.tipo,
                    numero: l.numero,
                    emitidaEn: l.emitidaEn,
                    venceEn: l.venceEn,
                    archivoId: l.archivoId,
                }),
        );
        this._actualizadoEn = FechaHoraUtc.desdeDate(new Date());
    }
}
