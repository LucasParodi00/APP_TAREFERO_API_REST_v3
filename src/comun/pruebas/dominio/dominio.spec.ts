import {
    CategoriaError,
    ErrorDominioBase,
    ErrorIdentificadorUuidInvalido,
    ErrorFechaCivilInvalida,
    ErrorFechaHoraUtcInvalida,
    ErrorCodigoMonedaInvalido,
    ErrorDineroInvalido,
    IdentificadorUuid,
    FechaCivil,
    FechaHoraUtc,
    CodigoMoneda,
    Dinero,
} from '../../dominio';

class ErrorPrueba extends ErrorDominioBase {
    readonly codigo = 'CMN_PRUEBA_ERROR';
    constructor(mensaje = 'Error de prueba', causa?: unknown) {
        super(mensaje, CategoriaError.VALIDACION, causa);
    }
}

describe('Dominio Común - Errores Base', () => {
    it('debe crear un error de dominio con código, mensaje, categoría y causa opcional', () => {
        const causa = new Error('Causa original');
        const error = new ErrorPrueba('Ocurrió un error', causa);

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ErrorDominioBase);
        expect(error.codigo).toBe('CMN_PRUEBA_ERROR');
        expect(error.message).toBe('Ocurrió un error');
        expect(error.categoria).toBe(CategoriaError.VALIDACION);
        expect(error.causa).toBe(causa);
        expect(error.name).toBe('ErrorPrueba');
    });

    it('debe tener las categorías de error semánticas requeridas', () => {
        expect(CategoriaError.VALIDACION).toBe('VALIDACION');
        expect(CategoriaError.NO_AUTENTICADO).toBe('NO_AUTENTICADO');
        expect(CategoriaError.ACCESO_DENEGADO).toBe('ACCESO_DENEGADO');
        expect(CategoriaError.NO_ENCONTRADO).toBe('NO_ENCONTRADO');
        expect(CategoriaError.CONFLICTO).toBe('CONFLICTO');
        expect(CategoriaError.PRECONDICION_FALLIDA).toBe('PRECONDICION_FALLIDA');
        expect(CategoriaError.PRECONDICION_REQUERIDA).toBe('PRECONDICION_REQUERIDA');
        expect(CategoriaError.NO_DISPONIBLE).toBe('NO_DISPONIBLE');
    });

    it('debe instanciar los errores concretos de objetos de valor con mensajes predeterminados', () => {
        const e1 = new ErrorIdentificadorUuidInvalido();
        expect(e1.codigo).toBe('CMN_IDENTIFICADOR_INVALIDO');
        expect(e1.categoria).toBe(CategoriaError.VALIDACION);

        const e2 = new ErrorFechaCivilInvalida();
        expect(e2.codigo).toBe('CMN_FECHA_CIVIL_INVALIDA');

        const e3 = new ErrorFechaHoraUtcInvalida();
        expect(e3.codigo).toBe('CMN_FECHA_HORA_INVALIDA');

        const e4 = new ErrorCodigoMonedaInvalido();
        expect(e4.codigo).toBe('CMN_CODIGO_MONEDA_INVALIDO');

        const e5 = new ErrorDineroInvalido();
        expect(e5.codigo).toBe('CMN_DINERO_INVALIDO');
    });
});

describe('Dominio Común - Objetos de Valor', () => {
    describe('IdentificadorUuid', () => {
        it('debe crear una instancia válida para UUID v4 y UUID v7', () => {
            const uuidV4 = '9c6e127f-57b2-41ef-822b-1a347818dae3';
            const uuidV7 = '018f2d5c-9c76-7889-b88d-71b34fa365ba';

            const id1 = new IdentificadorUuid(uuidV4);
            const id2 = new IdentificadorUuid(uuidV7);

            expect(id1.valor).toBe(uuidV4);
            expect(id2.valor).toBe(uuidV7);
        });

        it('debe normalizar a minúsculas', () => {
            const uuidMayus = '9C6E127F-57B2-41EF-822B-1A347818DAE3';
            const id = new IdentificadorUuid(uuidMayus);
            expect(id.valor).toBe(uuidMayus.toLowerCase());
        });

        it('debe fallar ante cadenas inválidas o vacías', () => {
            expect(() => new IdentificadorUuid('')).toThrow();
            expect(() => new IdentificadorUuid('invalido')).toThrow();
            expect(() => new IdentificadorUuid('12345678-1234-1234-1234-12345678901z')).toThrow();
            expect(() => new IdentificadorUuid(null as unknown as string)).toThrow();
        });

        it('debe verificar igualdad', () => {
            const val = '018f2d5c-9c76-7889-b88d-71b34fa365ba';
            const id1 = new IdentificadorUuid(val);
            const id2 = new IdentificadorUuid(val);
            const id3 = new IdentificadorUuid('9c6e127f-57b2-41ef-822b-1a347818dae3');

            expect(id1.equals(id2)).toBe(true);
            expect(id1.equals(id3)).toBe(false);
            expect(id1.equals(null)).toBe(false);
            expect(id1.toString()).toBe(val);
            expect(id1.toJSON()).toBe(val);
        });

        it('debe ser inmutable', () => {
            const id = new IdentificadorUuid('018f2d5c-9c76-7889-b88d-71b34fa365ba');
            expect(() => {
                (id as unknown as { valor: string }).valor = 'otro';
            }).toThrow();
        });
    });

    describe('FechaCivil', () => {
        it('debe aceptar fechas reales en formato AAAA-MM-DD', () => {
            const fc = new FechaCivil('2024-02-29'); // Año bisiesto
            expect(fc.valor).toBe('2024-02-29');
            expect(fc.anio).toBe(2024);
            expect(fc.mes).toBe(2);
            expect(fc.dia).toBe(29);
        });

        it('debe rechazar fechas inválidas o inexistentes', () => {
            expect(() => new FechaCivil('2023-02-29')).toThrow(); // No bisiesto
            expect(() => new FechaCivil('2024-04-31')).toThrow(); // Abril tiene 30 días
            expect(() => new FechaCivil('2024-13-01')).toThrow(); // Mes inválido
            expect(() => new FechaCivil('29/02/2024')).toThrow(); // Formato no permitido en API
            expect(() => new FechaCivil('2024-2-5')).toThrow(); // Sin padding
            expect(() => new FechaCivil('')).toThrow();
        });

        it('debe verificar igualdad', () => {
            const fc1 = new FechaCivil('2026-11-12');
            const fc2 = new FechaCivil('2026-11-12');
            const fc3 = new FechaCivil('2026-11-13');

            expect(fc1.equals(fc2)).toBe(true);
            expect(fc1.equals(fc3)).toBe(false);
            expect(fc1.equals(null)).toBe(false);
            expect(fc1.toString()).toBe('2026-11-12');
            expect(fc1.toJSON()).toBe('2026-11-12');
        });

        it('debe ser inmutable', () => {
            const fc = new FechaCivil('2026-11-12');
            expect(() => {
                (fc as unknown as { valor: string }).valor = '2026-11-13';
            }).toThrow();
        });
    });

    describe('FechaHoraUtc', () => {
        it('debe aceptar ISO 8601 con UTC y normalizarlo', () => {
            const fhu = new FechaHoraUtc('2026-11-12T08:30:00.000Z');
            expect(fhu.valor).toBe('2026-11-12T08:30:00.000Z');
        });

        it('debe normalizar timestamps con offset a UTC', () => {
            const fhu = new FechaHoraUtc('2026-11-12T05:30:00-03:00');
            expect(fhu.valor).toBe('2026-11-12T08:30:00.000Z');
        });

        it('debe aceptar objeto Date sin exponer referencia mutable', () => {
            const d = new Date('2026-11-12T08:30:00.000Z');
            const fhu = FechaHoraUtc.desdeDate(d);
            d.setFullYear(2020);
            expect(fhu.valor).toBe('2026-11-12T08:30:00.000Z');

            const exportedDate = fhu.aDate();
            exportedDate.setFullYear(2030);
            expect(fhu.valor).toBe('2026-11-12T08:30:00.000Z');
        });

        it('debe rechazar cadenas inválidas', () => {
            expect(() => new FechaHoraUtc('invalido')).toThrow();
            expect(() => new FechaHoraUtc('')).toThrow();
            expect(() => FechaHoraUtc.desdeDate(null as unknown as Date)).toThrow();
        });

        it('debe comparar orden e igualdad', () => {
            const f1 = new FechaHoraUtc('2026-11-12T08:00:00.000Z');
            const f2 = new FechaHoraUtc('2026-11-12T08:00:00.000Z');
            const f3 = new FechaHoraUtc('2026-11-12T09:00:00.000Z');

            expect(f1.equals(f2)).toBe(true);
            expect(f1.equals(null)).toBe(false);
            expect(f1.esAnteriorA(f3)).toBe(true);
            expect(f3.esPosteriorA(f1)).toBe(true);
            expect(f1.esPosteriorA(f3)).toBe(false);
            expect(f1.toString()).toBe('2026-11-12T08:00:00.000Z');
            expect(f1.toJSON()).toBe('2026-11-12T08:00:00.000Z');
        });

        it('debe ser inmutable', () => {
            const f1 = new FechaHoraUtc('2026-11-12T08:00:00.000Z');
            expect(() => {
                (f1 as unknown as { valor: string }).valor = 'otro';
            }).toThrow();
        });
    });

    describe('CodigoMoneda', () => {
        it('debe aceptar códigos ISO 4217 de 3 letras mayúsculas', () => {
            const cm = new CodigoMoneda('ARS');
            expect(cm.valor).toBe('ARS');
        });

        it('debe rechazar códigos que no sean de 3 letras mayúsculas', () => {
            expect(() => new CodigoMoneda('ars')).toThrow();
            expect(() => new CodigoMoneda('AR')).toThrow();
            expect(() => new CodigoMoneda('ARSS')).toThrow();
            expect(() => new CodigoMoneda('123')).toThrow();
            expect(() => new CodigoMoneda('')).toThrow();
        });

        it('debe verificar igualdad', () => {
            const cm1 = new CodigoMoneda('ARS');
            const cm2 = new CodigoMoneda('ARS');
            const cm3 = new CodigoMoneda('USD');

            expect(cm1.equals(cm2)).toBe(true);
            expect(cm1.equals(cm3)).toBe(false);
            expect(cm1.equals(null)).toBe(false);
            expect(cm1.toString()).toBe('ARS');
            expect(cm1.toJSON()).toBe('ARS');
        });

        it('debe ser inmutable', () => {
            const cm = new CodigoMoneda('ARS');
            expect(() => {
                (cm as unknown as { valor: string }).valor = 'USD';
            }).toThrow();
        });
    });

    describe('Dinero', () => {
        it('debe crear Dinero con monto decimal string y código de moneda', () => {
            const d = new Dinero('1500.50', new CodigoMoneda('ARS'));
            expect(d.monto).toBe('1500.50');
            expect(d.moneda.valor).toBe('ARS');
        });

        it('debe permitir instanciar con string de moneda', () => {
            const d = new Dinero('100', 'USD');
            expect(d.monto).toBe('100');
            expect(d.moneda.valor).toBe('USD');
        });

        it('debe permitir montos negativos o con signo', () => {
            const d1 = new Dinero('-50.25', 'ARS');
            expect(d1.monto).toBe('-50.25');

            const d2 = new Dinero('+50.25', 'ARS');
            expect(d2.monto).toBe('50.25');
        });

        it('debe rechazar comas decimales o formatos no numéricos', () => {
            expect(() => new Dinero('1500,50', 'ARS')).toThrow();
            expect(() => new Dinero('abc', 'ARS')).toThrow();
            expect(() => new Dinero('', 'ARS')).toThrow();
            expect(() => new Dinero('12.34.56', 'ARS')).toThrow();
        });

        it('debe verificar igualdad y serializar a objeto/JSON', () => {
            const d1 = new Dinero('100.00', 'ARS');
            const d2 = new Dinero('100.00', 'ARS');
            const d3 = new Dinero('100', 'ARS');
            const d4 = new Dinero('100.00', 'USD');

            expect(d1.equals(d2)).toBe(true);
            expect(d1.equals(d3)).toBe(false);
            expect(d1.equals(d4)).toBe(false);
            expect(d1.equals(null)).toBe(false);

            expect(d1.aObjeto()).toEqual({ monto: '100.00', moneda: 'ARS' });
            expect(JSON.stringify(d1)).toBe(JSON.stringify({ monto: '100.00', moneda: 'ARS' }));
        });

        it('debe ser inmutable', () => {
            const d = new Dinero('100.00', 'ARS');
            expect(() => {
                (d as unknown as { monto: string }).monto = '200.00';
            }).toThrow();
        });
    });
});
