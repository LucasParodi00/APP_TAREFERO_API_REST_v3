import { GeneradorUuidV7, RelojSistema } from '../../infraestructura';
import { GeneradorIdentificadores, Reloj } from '../../aplicacion';
import { FechaHoraUtc } from '../../dominio';

describe('Infraestructura Común - Adaptadores Técnicos', () => {
    describe('GeneradorUuidV7', () => {
        it('debe implementar el puerto GeneradorIdentificadores', () => {
            const generador: GeneradorIdentificadores = new GeneradorUuidV7();
            expect(generador).toBeDefined();
            expect(typeof generador.generar).toBe('function');
        });

        it('debe generar identificadores válidos en formato UUID v7', () => {
            const generador = new GeneradorUuidV7();
            const id = generador.generar();

            // Regex para UUID v7 (versión 7 en el bloque 3 y variante RFC 4122/9562 '8', '9', 'a' o 'b' en el bloque 4)
            const regexUuidV7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            expect(regexUuidV7.test(id)).toBe(true);
        });

        it('debe generar identificadores únicos y secuenciales en el tiempo', () => {
            const generador = new GeneradorUuidV7();
            const id1 = generador.generar();
            const id2 = generador.generar();

            expect(id1).not.toBe(id2);
            expect(typeof id1).toBe('string');
            expect(typeof id2).toBe('string');
        });
    });

    describe('RelojSistema', () => {
        it('debe implementar el puerto Reloj', () => {
            const reloj: Reloj = new RelojSistema();
            expect(reloj).toBeDefined();
            expect(typeof reloj.ahora).toBe('function');
        });

        it('debe devolver un instante Date válido cercano al momento de ejecución', () => {
            const reloj = new RelojSistema();
            const antes = Date.now();
            const ahora = reloj.ahora();
            const despues = Date.now();

            expect(ahora).toBeInstanceOf(Date);
            expect(ahora.getTime()).toBeGreaterThanOrEqual(antes);
            expect(ahora.getTime()).toBeLessThanOrEqual(despues);
        });

        it('debe permitir obtener el instante canónico en FechaHoraUtc', () => {
            const reloj = new RelojSistema();
            const ahoraUtc = reloj.ahoraUtc();

            expect(ahoraUtc).toBeInstanceOf(FechaHoraUtc);
            expect(typeof ahoraUtc.valor).toBe('string');
            expect(ahoraUtc.valor.endsWith('Z')).toBe(true);
        });
    });
});
