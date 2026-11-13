import { ContextoSolicitud, GeneradorIdentificadores, Reloj } from '../../../../comun/aplicacion';
import { RegistrarChacraCasoDeUso, RegistrarChacraComando } from '../../aplicacion/comandos/registrar-chacra.caso-de-uso';
import { RepositorioChacras } from '../../dominio/repositorios';
import { Chacra } from '../../dominio/agregados';
import { ErrorAccesoDenegado, ErrorNombreCortoDuplicado, ErrorNombreChacraInvalido } from '../../dominio/errores';

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

class GeneradorIdentificadoresFijo implements GeneradorIdentificadores {
    constructor(private readonly id: string) {}
    generar(): string {
        return this.id;
    }
}

class RelojFijo implements Reloj {
    constructor(private readonly fecha: Date) {}
    ahora(): Date {
        return this.fecha;
    }
}

describe('T04 — Aplicación: RegistrarChacra (TER-UC-001)', () => {
    let repo: RepositorioChacrasEnMemoria;
    let generador: GeneradorIdentificadores;
    let reloj: Reloj;
    let casoDeUso: RegistrarChacraCasoDeUso;

    const empresaId = '018f6f5d-7a6b-7345-9123-000000000001';
    const actorId = '018f6f5d-7a6b-7345-9123-actor000001';
    const fechaFija = new Date('2026-11-13T12:00:00.000Z');
    const nuevoId = '018f6f5d-7a6b-7345-9123-chacra000099';

    const contextoValido: ContextoSolicitud = {
        solicitudId: '018f6f5d-7a6b-7345-9123-sol000000001',
        actorId,
        empresaId,
        roles: ['ADMINISTRADOR'],
        permisos: ['TER-UC-001'],
    };

    beforeEach(() => {
        repo = new RepositorioChacrasEnMemoria();
        generador = new GeneradorIdentificadoresFijo(nuevoId);
        reloj = new RelojFijo(fechaFija);
        casoDeUso = new RegistrarChacraCasoDeUso(repo, generador, reloj);
    });

    it('@TER-UC-001 @AC-01: debe registrar una chacra válida con todos sus campos', async () => {
        const comando: RegistrarChacraComando = {
            nombre: 'Chacra Doña María',
            nombreCorto: 'DONA-MARIA',
            responsableNombre: 'Esteban Quito',
            direccion: 'Ruta 12 Km 100',
            puntoGeograficoReferencia: { latitud: -27.3, longitud: -55.9 },
        };

        const resultado = await casoDeUso.ejecutar(comando, contextoValido);

        expect(resultado.id).toBe(nuevoId);
        expect(resultado.empresaId).toBe(empresaId);
        expect(resultado.nombre).toBe('Chacra Doña María');
        expect(resultado.nombreCorto).toBe('DONA-MARIA');
        expect(resultado.responsableNombre).toBe('Esteban Quito');
        expect(resultado.direccion).toBe('Ruta 12 Km 100');
        expect(resultado.puntoGeograficoReferencia).toEqual({ latitud: -27.3, longitud: -55.9 });
        expect(resultado.estado).toBe('ACTIVA');
        expect(resultado.version).toBe(1);
        expect(resultado.creadoEn).toBe(fechaFija.toISOString());

        expect(repo.chacras).toHaveLength(1);
    });

    it('@TER-UC-001 @AC-11: debe registrar chacra omitiendo campos opcionales', async () => {
        const comando: RegistrarChacraComando = {
            nombre: 'Chacra Simple',
            nombreCorto: 'SIMPLE',
        };

        const resultado = await casoDeUso.ejecutar(comando, contextoValido);

        expect(resultado.direccion).toBeNull();
        expect(resultado.puntoGeograficoReferencia).toBeNull();
        expect(resultado.responsableNombre).toBeNull();
    });

    it('@TER-UC-001 @AC-02: debe rechazar si falta permiso TER-UC-001', async () => {
        const contextoSinPermiso: ContextoSolicitud = {
            solicitudId: '018f6f5d-7a6b-7345-9123-sol000000001',
            actorId,
            empresaId,
            roles: ['CAPATAZ'],
            permisos: ['TER-UC-002'],
        };

        const comando: RegistrarChacraComando = {
            nombre: 'Chacra Sin Permiso',
            nombreCorto: 'SIN-PERMISO',
        };

        await expect(casoDeUso.ejecutar(comando, contextoSinPermiso)).rejects.toThrow(ErrorAccesoDenegado);
    });

    it('@TER-UC-001 @AC-03: debe rechazar nombre inválido', async () => {
        const comando: RegistrarChacraComando = {
            nombre: '   ',
            nombreCorto: 'VALIDO',
        };

        await expect(casoDeUso.ejecutar(comando, contextoValido)).rejects.toThrow(ErrorNombreChacraInvalido);
    });

    it('@TER-UC-001 @AC-04: debe rechazar nombre corto duplicado en la misma empresa (TER-BR-007)', async () => {
        const comando1: RegistrarChacraComando = {
            nombre: 'Chacra Norte 1',
            nombreCorto: 'NORTE',
        };
        await casoDeUso.ejecutar(comando1, contextoValido);

        const comando2: RegistrarChacraComando = {
            nombre: 'Chacra Norte 2',
            nombreCorto: '  nórte  ',
        };

        await expect(casoDeUso.ejecutar(comando2, contextoValido)).rejects.toThrow(ErrorNombreCortoDuplicado);
    });
});
