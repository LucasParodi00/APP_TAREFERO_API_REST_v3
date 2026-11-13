import { ContextoSolicitud, Reloj } from '../../../../comun/aplicacion';
import { ModificarChacraCasoDeUso, ModificarChacraComando } from '../../aplicacion/comandos/modificar-chacra.caso-de-uso';
import { RepositorioChacras } from '../../dominio/repositorios';
import { Chacra } from '../../dominio/agregados';
import {
    NombreChacra,
    NombreCortoChacra,
    DireccionChacra,
    PuntoGeograficoReferencia,
    ResponsableChacra,
} from '../../dominio/objetos-valor';
import {
    ErrorAccesoDenegado,
    ErrorChacraNoEncontrada,
    ErrorVersionConflicto,
    ErrorNombreCortoDuplicado,
    ErrorConsultaInvalida,
} from '../../dominio/errores';

class RepositorioChacrasEnMemoria implements RepositorioChacras {
    public chacras: Chacra[] = [];

    guardar(chacra: Chacra): Promise<void> {
        const index = this.chacras.findIndex((c) => c.id === chacra.id);
        if (index >= 0) {
            this.chacras[index] = chacra;
        } else {
            this.chacras.push(chacra);
        }
        return Promise.resolve();
    }

    obtenerPorId(id: string, empresaId: string): Promise<Chacra | null> {
        return Promise.resolve(this.chacras.find((c) => c.id === id && c.empresaId === empresaId) ?? null);
    }

    existePorNombreCorto(empresaId: string, claveNormalizada: string, excluirId?: string): Promise<boolean> {
        return Promise.resolve(
            this.chacras.some(
                (c) => c.empresaId === empresaId && c.nombreCorto.claveNormalizada === claveNormalizada && c.id !== excluirId,
            ),
        );
    }
}

class RelojFijo implements Reloj {
    constructor(private readonly fecha: Date) {}
    ahora(): Date {
        return this.fecha;
    }
}

describe('T05 — Aplicación: ModificarChacra (TER-UC-004)', () => {
    let repo: RepositorioChacrasEnMemoria;
    let reloj: Reloj;
    let casoDeUso: ModificarChacraCasoDeUso;

    const empresaId = '018f6f5d-7a6b-7345-9123-000000000001';
    const actorId = '018f6f5d-7a6b-7345-9123-actor000001';
    const fechaCreacion = new Date('2026-11-13T10:00:00.000Z');
    const fechaModificacion = new Date('2026-11-13T12:00:00.000Z');
    const chacraId = '018f6f5d-7a6b-7345-9123-chacra000001';

    const contextoValido: ContextoSolicitud = {
        solicitudId: '018f6f5d-7a6b-7345-9123-sol000000001',
        actorId,
        empresaId,
        roles: ['ADMINISTRADOR'],
        permisos: ['TER-UC-004'],
    };

    beforeEach(async () => {
        repo = new RepositorioChacrasEnMemoria();
        reloj = new RelojFijo(fechaModificacion);
        casoDeUso = new ModificarChacraCasoDeUso(repo, reloj);

        const chacraInicial = Chacra.registrar({
            id: chacraId,
            empresaId,
            nombre: NombreChacra.crear('Chacra Inicial'),
            nombreCorto: NombreCortoChacra.crear('INICIAL'),
            responsableNombre: ResponsableChacra.crear('Responsable Inicial'),
            direccion: DireccionChacra.crear('Dirección Inicial'),
            puntoGeograficoReferencia: PuntoGeograficoReferencia.crear(-27.0, -55.0),
            creadoEn: fechaCreacion,
            creadoPor: actorId,
        });
        await repo.guardar(chacraInicial);
    });

    it('@TER-UC-004 @AC-01: debe modificar datos conservando campos omitidos e incrementando versión', async () => {
        const comando: ModificarChacraComando = {
            chacraId,
            versionEsperada: 1,
            nombre: 'Chacra Modificada',
        };

        const resultado = await casoDeUso.ejecutar(comando, contextoValido);

        expect(resultado.id).toBe(chacraId);
        expect(resultado.nombre).toBe('Chacra Modificada');
        expect(resultado.nombreCorto).toBe('INICIAL');
        expect(resultado.responsableNombre).toBe('Responsable Inicial');
        expect(resultado.direccion).toBe('Dirección Inicial');
        expect(resultado.version).toBe(2);
        expect(resultado.actualizadoEn).toBe(fechaModificacion.toISOString());
    });

    it('@TER-UC-004 @AC-12: debe limpiar campos opcionales cuando se envía explícitamente null', async () => {
        const comando: ModificarChacraComando = {
            chacraId,
            versionEsperada: 1,
            responsableNombre: null,
            direccion: null,
            puntoGeograficoReferencia: null,
        };

        const resultado = await casoDeUso.ejecutar(comando, contextoValido);

        expect(resultado.responsableNombre).toBeNull();
        expect(resultado.direccion).toBeNull();
        expect(resultado.puntoGeograficoReferencia).toBeNull();
        expect(resultado.nombre).toBe('Chacra Inicial');
        expect(resultado.version).toBe(2);
    });

    it('@TER-UC-004: debe rechazar si no se envía ningún campo a modificar', async () => {
        const comandoVacio: ModificarChacraComando = {
            chacraId,
            versionEsperada: 1,
        };

        await expect(casoDeUso.ejecutar(comandoVacio, contextoValido)).rejects.toThrow(ErrorConsultaInvalida);
    });

    it('@TER-UC-004 @AC-05: debe rechazar ante conflicto de versión (If-Match)', async () => {
        const comando: ModificarChacraComando = {
            chacraId,
            versionEsperada: 99,
            nombre: 'Intento Concurrente',
        };

        await expect(casoDeUso.ejecutar(comando, contextoValido)).rejects.toThrow(ErrorVersionConflicto);
    });

    it('@TER-UC-004 @AC-06: debe rechazar si la chacra no existe', async () => {
        const comando: ModificarChacraComando = {
            chacraId: '018f6f5d-7a6b-7345-9123-inexistente000',
            versionEsperada: 1,
            nombre: 'Chacra Fantasma',
        };

        await expect(casoDeUso.ejecutar(comando, contextoValido)).rejects.toThrow(ErrorChacraNoEncontrada);
    });

    it('@TER-UC-004 @AC-02: debe rechazar si falta permiso TER-UC-004', async () => {
        const contextoSinPermiso: ContextoSolicitud = {
            solicitudId: '018f6f5d-7a6b-7345-9123-sol000000001',
            actorId,
            empresaId,
            roles: ['CAPATAZ'],
            permisos: ['TER-UC-002'],
        };

        const comando: ModificarChacraComando = {
            chacraId,
            versionEsperada: 1,
            nombre: 'Sin Permiso',
        };

        await expect(casoDeUso.ejecutar(comando, contextoSinPermiso)).rejects.toThrow(ErrorAccesoDenegado);
    });

    it('@TER-UC-004 @AC-04: debe rechazar si nuevo nombre corto ya existe en otra chacra', async () => {
        const otraChacra = Chacra.registrar({
            id: '018f6f5d-7a6b-7345-9123-chacra000002',
            empresaId,
            nombre: NombreChacra.crear('Chacra Vecina'),
            nombreCorto: NombreCortoChacra.crear('VECINA'),
            responsableNombre: null,
            direccion: null,
            puntoGeograficoReferencia: null,
            creadoEn: fechaCreacion,
            creadoPor: actorId,
        });
        await repo.guardar(otraChacra);

        const comando: ModificarChacraComando = {
            chacraId,
            versionEsperada: 1,
            nombreCorto: 'vecina',
        };

        await expect(casoDeUso.ejecutar(comando, contextoValido)).rejects.toThrow(ErrorNombreCortoDuplicado);
    });
});
