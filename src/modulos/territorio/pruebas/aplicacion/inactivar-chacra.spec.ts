import { ContextoSolicitud, Reloj } from '../../../../comun/aplicacion';
import { InactivarChacraCasoDeUso, InactivarChacraComando } from '../../aplicacion/comandos/inactivar-chacra.caso-de-uso';
import { RepositorioChacras } from '../../dominio/repositorios';
import { ConsultaLotesActivosPorChacra } from '../../aplicacion/puertos';
import { Chacra } from '../../dominio/agregados';
import { NombreChacra, NombreCortoChacra } from '../../dominio/objetos-valor';
import { EstadoChacra } from '../../dominio/enumeraciones';
import {
    ErrorAccesoDenegado,
    ErrorChacraNoEncontrada,
    ErrorVersionConflicto,
    ErrorTransicionChacraInvalida,
    ErrorEstadoChacraLotesIncompatible,
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

    existePorNombreCorto(): Promise<boolean> {
        return Promise.resolve(false);
    }
}

class ConsultaLotesActivosDoble implements ConsultaLotesActivosPorChacra {
    public tieneLotes = false;

    tieneLotesActivos(): Promise<boolean> {
        return Promise.resolve(this.tieneLotes);
    }
}

class RelojFijo implements Reloj {
    constructor(private readonly fecha: Date) {}
    ahora(): Date {
        return this.fecha;
    }
}

describe('T06 — Aplicación: InactivarChacra (TER-UC-005, TER-BR-023)', () => {
    let repo: RepositorioChacrasEnMemoria;
    let consultaLotes: ConsultaLotesActivosDoble;
    let reloj: Reloj;
    let casoDeUso: InactivarChacraCasoDeUso;

    const empresaId = '018f6f5d-7a6b-7345-9123-000000000001';
    const actorId = '018f6f5d-7a6b-7345-9123-actor000001';
    const fechaInactivacion = new Date('2026-11-13T12:00:00.000Z');
    const chacraId = '018f6f5d-7a6b-7345-9123-chacra000001';

    const contextoValido: ContextoSolicitud = {
        solicitudId: '018f6f5d-7a6b-7345-9123-sol000000001',
        actorId,
        empresaId,
        roles: ['ADMINISTRADOR'],
        permisos: ['TER-UC-005'],
    };

    beforeEach(async () => {
        repo = new RepositorioChacrasEnMemoria();
        consultaLotes = new ConsultaLotesActivosDoble();
        reloj = new RelojFijo(fechaInactivacion);
        casoDeUso = new InactivarChacraCasoDeUso(repo, consultaLotes, reloj);

        const chacraInicial = Chacra.registrar({
            id: chacraId,
            empresaId,
            nombre: NombreChacra.crear('Chacra A Inactivar'),
            nombreCorto: NombreCortoChacra.crear('INACT'),
            responsableNombre: null,
            direccion: null,
            puntoGeograficoReferencia: null,
            creadoEn: new Date('2026-11-13T10:00:00.000Z'),
            creadoPor: actorId,
        });
        await repo.guardar(chacraInicial);
    });

    it('@TER-UC-005 @AC-01: debe inactivar la chacra cuando no tiene lotes activos', async () => {
        consultaLotes.tieneLotes = false;

        const comando: InactivarChacraComando = {
            chacraId,
            versionEsperada: 1,
        };

        const resultado = await casoDeUso.ejecutar(comando, contextoValido);

        expect(resultado.id).toBe(chacraId);
        expect(resultado.estado).toBe(EstadoChacra.INACTIVA);
        expect(resultado.version).toBe(2);
        expect(resultado.actualizadoEn).toBe(fechaInactivacion.toISOString());

        const persistida = await repo.obtenerPorId(chacraId, empresaId);
        expect(persistida?.estado).toBe(EstadoChacra.INACTIVA);
    });

    it('@TER-UC-005 @AC-09: debe rechazar la inactivación si la chacra contiene lotes activos (TER-BR-023)', async () => {
        consultaLotes.tieneLotes = true;

        const comando: InactivarChacraComando = {
            chacraId,
            versionEsperada: 1,
        };

        await expect(casoDeUso.ejecutar(comando, contextoValido)).rejects.toThrow(ErrorEstadoChacraLotesIncompatible);
    });

    it('@TER-UC-005 @AC-04: debe rechazar si la chacra ya está inactiva', async () => {
        consultaLotes.tieneLotes = false;
        await casoDeUso.ejecutar({ chacraId, versionEsperada: 1 }, contextoValido);

        await expect(casoDeUso.ejecutar({ chacraId, versionEsperada: 2 }, contextoValido)).rejects.toThrow(
            ErrorTransicionChacraInvalida,
        );
    });

    it('@TER-UC-005 @AC-05: debe rechazar ante conflicto de versión', async () => {
        const comando: InactivarChacraComando = {
            chacraId,
            versionEsperada: 99,
        };

        await expect(casoDeUso.ejecutar(comando, contextoValido)).rejects.toThrow(ErrorVersionConflicto);
    });

    it('@TER-UC-005 @AC-02: debe rechazar si falta permiso TER-UC-005', async () => {
        const contextoSinPermiso: ContextoSolicitud = {
            solicitudId: '018f6f5d-7a6b-7345-9123-sol000000001',
            actorId,
            empresaId,
            roles: ['CAPATAZ'],
            permisos: ['TER-UC-002'],
        };

        await expect(casoDeUso.ejecutar({ chacraId, versionEsperada: 1 }, contextoSinPermiso)).rejects.toThrow(
            ErrorAccesoDenegado,
        );
    });

    it('@TER-UC-005 @AC-06: debe rechazar si la chacra no existe', async () => {
        await expect(
            casoDeUso.ejecutar({ chacraId: '018f6f5d-7a6b-7345-9123-inexistente000', versionEsperada: 1 }, contextoValido),
        ).rejects.toThrow(ErrorChacraNoEncontrada);
    });
});
