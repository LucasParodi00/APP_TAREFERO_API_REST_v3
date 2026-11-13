import {
    NombreChacra,
    NombreCortoChacra,
    normalizarNombreCorto,
    DireccionChacra,
    PuntoGeograficoReferencia,
    ResponsableChacra,
} from '../../dominio/objetos-valor';
import { EstadoChacra } from '../../dominio/enumeraciones';
import {
    ErrorNombreChacraInvalido,
    ErrorNombreCortoInvalido,
    ErrorDireccionChacraInvalida,
    ErrorPuntoGeograficoInvalido,
    ErrorResponsableChacraInvalido,
    ErrorEstadoChacraInvalido,
} from '../../dominio/errores';

describe('T01 — Dominio: Objetos de valor, normalización y enumeraciones de Chacra', () => {
    describe('TER-BR-001 — NombreChacra', () => {
        it('debe crear un nombre válido recortando espacios exteriores y conservando interiores', () => {
            const nombre = NombreChacra.crear('  Chacra San Juan  ');
            expect(nombre.valor).toBe('Chacra San Juan');
        });

        it('debe rechazar nombres vacíos o sólo con espacios', () => {
            expect(() => NombreChacra.crear('')).toThrow(ErrorNombreChacraInvalido);
            expect(() => NombreChacra.crear('   ')).toThrow(ErrorNombreChacraInvalido);
        });

        it('debe rechazar nombres que superen 150 caracteres', () => {
            const nombreLargo = 'a'.repeat(151);
            expect(() => NombreChacra.crear(nombreLargo)).toThrow(ErrorNombreChacraInvalido);
        });

        it('debe aceptar nombres de exactamente 150 caracteres', () => {
            const nombreMax = 'a'.repeat(150);
            expect(NombreChacra.crear(nombreMax).valor).toBe(nombreMax);
        });
    });

    describe('TER-BR-002 y TER-BR-007 — NombreCortoChacra y normalización', () => {
        it('debe crear un nombre corto válido recortando espacios exteriores', () => {
            const nombreCorto = NombreCortoChacra.crear('  CH-01  ');
            expect(nombreCorto.valor).toBe('CH-01');
            expect(nombreCorto.claveNormalizada).toBe('ch-01');
        });

        it('debe rechazar nombres cortos vacíos o de sólo espacios', () => {
            expect(() => NombreCortoChacra.crear('')).toThrow(ErrorNombreCortoInvalido);
            expect(() => NombreCortoChacra.crear('   ')).toThrow(ErrorNombreCortoInvalido);
        });

        it('debe rechazar nombres cortos que superen 50 caracteres', () => {
            const cortoLargo = 'c'.repeat(51);
            expect(() => NombreCortoChacra.crear(cortoLargo)).toThrow(ErrorNombreCortoInvalido);
        });

        it('normalizarNombreCorto debe ignorar mayúsculas, tildes y colapsar espacios consecutivos', () => {
            const normalizado1 = normalizarNombreCorto('NÓRTE');
            const normalizado2 = normalizarNombreCorto('norte');
            const normalizado3 = normalizarNombreCorto('  Nórte   Central  ');

            expect(normalizado1).toBe('norte');
            expect(normalizado2).toBe('norte');
            expect(normalizado3).toBe('norte central');
            expect(normalizado1).toBe(normalizado2);
        });

        it('normalizarNombreCorto debe conservar la ñ como letra distinta de n', () => {
            const claveNino = normalizarNombreCorto('NINO');
            const claveNinoEne = normalizarNombreCorto('NIÑO');
            expect(claveNino).toBe('nino');
            expect(claveNinoEne).toBe('niño');
            expect(claveNino).not.toBe(claveNinoEne);
        });

        it('normalizarNombreCorto debe tratar por igual Unicode compuesto y descompuesto', () => {
            const compuesto = 'NIÑO'.normalize('NFC');
            const descompuesto = 'NIÑO'.normalize('NFD');
            expect(normalizarNombreCorto(compuesto)).toBe('niño');
            expect(normalizarNombreCorto(descompuesto)).toBe('niño');

            const conAcentoCompuesto = 'ÁÉÍÓÚ'.normalize('NFC');
            const conAcentoDescompuesto = 'ÁÉÍÓÚ'.normalize('NFD');
            expect(normalizarNombreCorto(conAcentoCompuesto)).toBe('aeiou');
            expect(normalizarNombreCorto(conAcentoDescompuesto)).toBe('aeiou');
        });
    });

    describe('TER-Q-018 — DireccionChacra', () => {
        it('debe crear dirección válida recortando espacios exteriores y conservando interiores', () => {
            const dir = DireccionChacra.crear('  Ruta 14 Km 42  ');
            expect(dir.valor).toBe('Ruta 14 Km 42');
        });

        it('debe rechazar dirección vacía o de sólo espacios', () => {
            expect(() => DireccionChacra.crear('')).toThrow(ErrorDireccionChacraInvalida);
            expect(() => DireccionChacra.crear('   ')).toThrow(ErrorDireccionChacraInvalida);
        });

        it('debe rechazar dirección de más de 500 caracteres', () => {
            const dirLarga = 'd'.repeat(501);
            expect(() => DireccionChacra.crear(dirLarga)).toThrow(ErrorDireccionChacraInvalida);
        });
    });

    describe('TER-Q-018 — PuntoGeograficoReferencia', () => {
        it('debe crear un punto geográfico válido con latitud y longitud', () => {
            const punto = PuntoGeograficoReferencia.crear(-27.36, -55.89);
            expect(punto.latitud).toBe(-27.36);
            expect(punto.longitud).toBe(-55.89);
        });

        it('debe rechazar latitud fuera de rango [-90, 90]', () => {
            expect(() => PuntoGeograficoReferencia.crear(-90.1, 0)).toThrow(ErrorPuntoGeograficoInvalido);
            expect(() => PuntoGeograficoReferencia.crear(90.1, 0)).toThrow(ErrorPuntoGeograficoInvalido);
        });

        it('debe rechazar longitud fuera de rango [-180, 180]', () => {
            expect(() => PuntoGeograficoReferencia.crear(0, -180.1)).toThrow(ErrorPuntoGeograficoInvalido);
            expect(() => PuntoGeograficoReferencia.crear(0, 180.1)).toThrow(ErrorPuntoGeograficoInvalido);
        });

        it('debe rechazar valores NaN o no numéricos', () => {
            expect(() => PuntoGeograficoReferencia.crear(NaN, 10)).toThrow(ErrorPuntoGeograficoInvalido);
            expect(() => PuntoGeograficoReferencia.crear(10, NaN)).toThrow(ErrorPuntoGeograficoInvalido);
        });
    });

    describe('ResponsableChacra', () => {
        it('debe crear responsable recortando espacios exteriores', () => {
            const resp = ResponsableChacra.crear('  Juan Pérez  ');
            expect(resp.valor).toBe('Juan Pérez');
        });

        it('debe rechazar responsable que supere 150 caracteres', () => {
            const largo = 'r'.repeat(151);
            expect(() => ResponsableChacra.crear(largo)).toThrow(ErrorResponsableChacraInvalido);
        });
    });

    describe('TER-BR-005 — EstadoChacra', () => {
        it('debe definir ACTIVA e INACTIVA', () => {
            expect(EstadoChacra.ACTIVA).toBe('ACTIVA');
            expect(EstadoChacra.INACTIVA).toBe('INACTIVA');
            expect(new ErrorEstadoChacraInvalido().codigo).toBe('TER_ESTADO_CHACRA_INVALIDO');
        });
    });
});
