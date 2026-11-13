import { ContextoSolicitud, GeneradorIdentificadores, Reloj, ResultadoPaginado } from '../../../../comun/aplicacion';
import { RegistrarChacraCasoDeUso } from '../../aplicacion/comandos/registrar-chacra.caso-de-uso';
import { ModificarChacraCasoDeUso } from '../../aplicacion/comandos/modificar-chacra.caso-de-uso';
import { InactivarChacraCasoDeUso } from '../../aplicacion/comandos/inactivar-chacra.caso-de-uso';
import { ConsultarChacraCasoDeUso } from '../../aplicacion/consultas/consultar-chacra.caso-de-uso';
import { ListarChacrasCasoDeUso } from '../../aplicacion/consultas/listar-chacras.caso-de-uso';
import { RepositorioChacras } from '../../dominio/repositorios';
import { ConsultaChacras, ParametrosListarChacras } from '../../aplicacion/consultas';
import { ConsultaLotesActivosPorChacra } from '../../aplicacion/puertos';
import { Chacra } from '../../dominio/agregados';
import { EstadoChacra } from '../../dominio/enumeraciones';
import { ChacraDetalleLectura, ChacraResumenLectura } from '../../aplicacion/modelos-lectura';
import {
    ErrorAccesoDenegado,
    ErrorChacraNoEncontrada,
    ErrorVersionConflicto,
    ErrorEstadoChacraLotesIncompatible,
} from '../../dominio/errores';

class RepositorioChacrasAceptacion implements RepositorioChacras {
    public chacras = new Map<string, Chacra>();

    guardar(chacra: Chacra): Promise<void> {
        this.chacras.set(chacra.id, chacra);
        return Promise.resolve();
    }

    obtenerPorId(id: string, empresaId: string): Promise<Chacra | null> {
        const c = this.chacras.get(id);
        if (c && c.empresaId === empresaId) {
            return Promise.resolve(c);
        }
        return Promise.resolve(null);
    }

    existePorNombreCorto(empresaId: string, claveNormalizada: string, excluirId?: string): Promise<boolean> {
        for (const c of this.chacras.values()) {
            if (c.empresaId === empresaId && c.nombreCorto.claveNormalizada === claveNormalizada && c.id !== excluirId) {
                return Promise.resolve(true);
            }
        }
        return Promise.resolve(false);
    }
}

class ConsultaChacrasAceptacion implements ConsultaChacras {
    constructor(private readonly repo: RepositorioChacrasAceptacion) {}

    async obtenerDetallePorId(id: string, empresaId: string): Promise<ChacraDetalleLectura | null> {
        const c = await this.repo.obtenerPorId(id, empresaId);
        if (!c) return null;
        return {
            id: c.id,
            empresaId: c.empresaId,
            nombre: c.nombre.valor,
            nombreCorto: c.nombreCorto.valor,
            responsableNombre: c.responsableNombre ? c.responsableNombre.valor : null,
            direccion: c.direccion ? c.direccion.valor : null,
            puntoGeograficoReferencia: c.puntoGeograficoReferencia
                ? { latitud: c.puntoGeograficoReferencia.latitud, longitud: c.puntoGeograficoReferencia.longitud }
                : null,
            estado: c.estado,
            creadoEn: c.creadoEn.toISOString(),
            creadoPor: c.creadoPor,
            actualizadoEn: c.actualizadoEn.toISOString(),
            actualizadoPor: c.actualizadoPor,
            version: c.version,
        };
    }

    listar(params: ParametrosListarChacras): Promise<ResultadoPaginado<ChacraResumenLectura>> {
        let items: Chacra[] = Array.from(this.repo.chacras.values()).filter((c) => c.empresaId === params.empresaId);

        if (params.estado) {
            items = items.filter((c) => c.estado === params.estado);
        }

        if (params.alcanceChacraIds) {
            items = items.filter((c) => params.alcanceChacraIds!.includes(c.id));
        }

        const ordenCampo = params.campoOrden ?? 'creadoEn';
        const direccion = params.direccionOrden ?? 'DESC';

        items.sort((a, b) => {
            let valA: any = a.creadoEn.getTime();
            let valB: any = b.creadoEn.getTime();
            if (ordenCampo === 'nombre') {
                valA = a.nombre.valor;
                valB = b.nombre.valor;
            } else if (ordenCampo === 'nombreCorto') {
                valA = a.nombreCorto.valor;
                valB = b.nombreCorto.valor;
            }

            if (valA < valB) return direccion === 'ASC' ? -1 : 1;
            if (valA > valB) return direccion === 'ASC' ? 1 : -1;
            return a.id.localeCompare(b.id);
        });

        const paginados = items.slice(
            params.paginacion.desplazamiento,
            params.paginacion.desplazamiento + params.paginacion.limite,
        );

        const resumenes: ChacraResumenLectura[] = paginados.map((c) => ({
            id: c.id,
            empresaId: c.empresaId,
            nombre: c.nombre.valor,
            nombreCorto: c.nombreCorto.valor,
            responsableNombre: c.responsableNombre ? c.responsableNombre.valor : null,
            direccion: c.direccion ? c.direccion.valor : null,
            puntoGeograficoReferencia: c.puntoGeograficoReferencia
                ? { latitud: c.puntoGeograficoReferencia.latitud, longitud: c.puntoGeograficoReferencia.longitud }
                : null,
            estado: c.estado,
            creadoEn: c.creadoEn.toISOString(),
            version: c.version,
        }));

        return Promise.resolve(ResultadoPaginado.crear(resumenes, items.length, params.paginacion));
    }
}

class ConsultaLotesActivosAceptacion implements ConsultaLotesActivosPorChacra {
    public chacrasConLotesActivos = new Set<string>();

    tieneLotesActivos(chacraId: string): Promise<boolean> {
        return Promise.resolve(this.chacrasConLotesActivos.has(chacraId));
    }
}

class GeneradorIdentificadoresSecuencial implements GeneradorIdentificadores {
    private contador = 0;
    generar(): string {
        this.contador += 1;
        return `018f6f5d-7a6b-7345-9123-chacra00000${this.contador}`;
    }
}

class RelojAceptacion implements Reloj {
    public tiempoActual = new Date('2026-11-13T10:00:00.000Z');
    ahora(): Date {
        return this.tiempoActual;
    }
}

describe('T13 — Aceptación: Territorio (Chacras: TER-TASK-002 y TER-TASK-003)', () => {
    let repo: RepositorioChacrasAceptacion;
    let consulta: ConsultaChacrasAceptacion;
    let consultaLotes: ConsultaLotesActivosAceptacion;
    let generador: GeneradorIdentificadores;
    let reloj: RelojAceptacion;

    let registrarUc: RegistrarChacraCasoDeUso;
    let modificarUc: ModificarChacraCasoDeUso;
    let inactivarUc: InactivarChacraCasoDeUso;
    let consultarUc: ConsultarChacraCasoDeUso;
    let listarUc: ListarChacrasCasoDeUso;

    const empresaA = '018f6f5d-7a6b-7345-9123-000000000001';
    const empresaB = '018f6f5d-7a6b-7345-9123-000000000002';
    const usuarioAdmin = '018f6f5d-7a6b-7345-9123-useradmin001';
    const usuarioCapataz = '018f6f5d-7a6b-7345-9123-usercapataz01';

    const contextoAdminA: ContextoSolicitud = {
        solicitudId: '018f6f5d-7a6b-7345-9123-sol000000001',
        actorId: usuarioAdmin,
        empresaId: empresaA,
        roles: ['ADMINISTRADOR'],
        permisos: ['TER-UC-001', 'TER-UC-002', 'TER-UC-003', 'TER-UC-004', 'TER-UC-005'],
    };

    beforeEach(() => {
        repo = new RepositorioChacrasAceptacion();
        consulta = new ConsultaChacrasAceptacion(repo);
        consultaLotes = new ConsultaLotesActivosAceptacion();
        generador = new GeneradorIdentificadoresSecuencial();
        reloj = new RelojAceptacion();

        registrarUc = new RegistrarChacraCasoDeUso(repo, generador, reloj);
        modificarUc = new ModificarChacraCasoDeUso(repo, reloj);
        inactivarUc = new InactivarChacraCasoDeUso(repo, consultaLotes, reloj);
        consultarUc = new ConsultarChacraCasoDeUso(consulta);
        listarUc = new ListarChacrasCasoDeUso(consulta);
    });

    describe('Flujo integral de ciclo de vida de Chacra', () => {
        it('registra, modifica datos parciales, consulta, lista e inactiva una chacra verificando versiones', async () => {
            // 1. Registrar
            const creada = await registrarUc.ejecutar(
                {
                    nombre: 'Chacra Santa Inés',
                    nombreCorto: 'STA-INES',
                    responsableNombre: 'Juan Gomez',
                    direccion: 'Ruta 105 Km 8',
                    puntoGeograficoReferencia: { latitud: -27.4, longitud: -55.85 },
                },
                contextoAdminA,
            );

            expect(creada.id).toBeDefined();
            expect(creada.estado).toBe('ACTIVA');
            expect(creada.version).toBe(1);

            // 2. Consultar
            const ficha = await consultarUc.ejecutar(creada.id, contextoAdminA);
            expect(ficha.id).toBe(creada.id);
            expect(ficha.nombre).toBe('Chacra Santa Inés');
            expect(ficha.version).toBe(1);

            // 3. Modificar
            reloj.tiempoActual = new Date('2026-11-13T11:00:00.000Z');
            const modificada = await modificarUc.ejecutar(
                {
                    chacraId: creada.id,
                    versionEsperada: 1,
                    nombre: 'Chacra Santa Inés Modificada',
                },
                contextoAdminA,
            );
            expect(modificada.version).toBe(2);
            expect(modificada.nombre).toBe('Chacra Santa Inés Modificada');
            expect(modificada.nombreCorto).toBe('STA-INES'); // conservado

            // 4. Inactivar con verificación de lotes (TER-BR-023)
            reloj.tiempoActual = new Date('2026-11-13T12:00:00.000Z');
            const inactivada = await inactivarUc.ejecutar(
                {
                    chacraId: creada.id,
                    versionEsperada: 2,
                },
                contextoAdminA,
            );
            expect(inactivada.estado).toBe(EstadoChacra.INACTIVA);
            expect(inactivada.version).toBe(3);

            // 5. Consultar inactiva (TER-BR-008)
            const fichaInactiva = await consultarUc.ejecutar(creada.id, contextoAdminA);
            expect(fichaInactiva.estado).toBe(EstadoChacra.INACTIVA);

            // 6. Listar con filtro INACTIVA
            const lista = await listarUc.ejecutar({ estado: 'INACTIVA' }, contextoAdminA);
            expect(lista.paginacion.total).toBe(1);
            expect(lista.datos[0].id).toBe(creada.id);
        });
    });

    describe('Matriz de permisos y defensa de aislamiento de Empresa', () => {
        it('deniega acceso cruzado entre Empresas en consulta y modificación', async () => {
            const creadaEnA = await registrarUc.ejecutar({ nombre: 'Chacra Privada A', nombreCorto: 'PRIV-A' }, contextoAdminA);

            const contextoAdminB: ContextoSolicitud = {
                solicitudId: '018f6f5d-7a6b-7345-9123-sol000000002',
                actorId: '018f6f5d-7a6b-7345-9123-adminB0000001',
                empresaId: empresaB,
                roles: ['ADMINISTRADOR'],
                permisos: ['TER-UC-001', 'TER-UC-002', 'TER-UC-003', 'TER-UC-004', 'TER-UC-005'],
            };

            await expect(consultarUc.ejecutar(creadaEnA.id, contextoAdminB)).rejects.toThrow(ErrorChacraNoEncontrada);
            await expect(
                modificarUc.ejecutar({ chacraId: creadaEnA.id, versionEsperada: 1, nombre: 'Hack' }, contextoAdminB),
            ).rejects.toThrow(ErrorChacraNoEncontrada);
        });

        it('restringe las consultas del Capataz exclusivamente a su selección de Chacras', async () => {
            const chacra1 = await registrarUc.ejecutar({ nombre: 'Chacra 1', nombreCorto: 'C1' }, contextoAdminA);
            const chacra2 = await registrarUc.ejecutar({ nombre: 'Chacra 2', nombreCorto: 'C2' }, contextoAdminA);

            const contextoCapataz: ContextoSolicitud = {
                solicitudId: '018f6f5d-7a6b-7345-9123-sol000000003',
                actorId: usuarioCapataz,
                empresaId: empresaA,
                roles: ['CAPATAZ'],
                permisos: ['TER-UC-002', 'TER-UC-003'],
                alcance: { chacras: [chacra1.id] },
            };

            // Consulta de chacra asignada: permitida
            const detalle = await consultarUc.ejecutar(chacra1.id, contextoCapataz);
            expect(detalle.id).toBe(chacra1.id);

            // Consulta de chacra no asignada: denegada
            await expect(consultarUc.ejecutar(chacra2.id, contextoCapataz)).rejects.toThrow(ErrorAccesoDenegado);

            // Listado: solo ve la chacra asignada
            const listado = await listarUc.ejecutar({}, contextoCapataz);
            expect(listado.paginacion.total).toBe(1);
            expect(listado.datos[0].id).toBe(chacra1.id);
        });
    });

    describe('Regla TER-BR-023 y conflicto de concurrencia optimista', () => {
        it('impide inactivar si la chacra tiene lotes activos', async () => {
            const chacra = await registrarUc.ejecutar({ nombre: 'Chacra Con Lotes', nombreCorto: 'CON-LOTES' }, contextoAdminA);

            consultaLotes.chacrasConLotesActivos.add(chacra.id);

            await expect(inactivarUc.ejecutar({ chacraId: chacra.id, versionEsperada: 1 }, contextoAdminA)).rejects.toThrow(
                ErrorEstadoChacraLotesIncompatible,
            );
        });

        it('impide modificar o inactivar con versión obsoleta (conflicto If-Match)', async () => {
            const chacra = await registrarUc.ejecutar({ nombre: 'Chacra Concurrente', nombreCorto: 'CONC' }, contextoAdminA);

            await expect(
                modificarUc.ejecutar({ chacraId: chacra.id, versionEsperada: 99, nombre: 'Cambio' }, contextoAdminA),
            ).rejects.toThrow(ErrorVersionConflicto);

            await expect(inactivarUc.ejecutar({ chacraId: chacra.id, versionEsperada: 99 }, contextoAdminA)).rejects.toThrow(
                ErrorVersionConflicto,
            );
        });
    });
});
