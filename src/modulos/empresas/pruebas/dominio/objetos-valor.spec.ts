import {
    NombreEmpresa,
    AliasEmpresa,
    Cuit,
    PuntoGeografico,
    ResponsableNombre,
    UbicacionTexto,
    DescripcionActividad,
    PaisReferencia,
    ZonaHoraria,
    MonedaPrincipal,
} from '../../dominio/objetos-valor';
import {
    ErrorDominioEmpresa,
    NombreEmpresaObligatorio,
    NombreEmpresaInvalido,
    AliasEmpresaInvalido,
    CuitInvalido,
    UbicacionGeograficaInvalida,
    TextoDescriptivoInvalido,
    ConfiguracionGeneralInvalida,
} from '../../dominio/errores';

describe('Dominio Empresas — Objetos de Valor', () => {
    describe('EMP-BR-001 — NombreEmpresa', () => {
        it('acepta y recorta espacios exteriores', () => {
            const nombre = new NombreEmpresa(' Yerba Norte ');
            expect(nombre.valor).toBe('Yerba Norte');
        });

        it('acepta un nombre de 120 caracteres', () => {
            const valor = 'A'.repeat(120);
            const nombre = new NombreEmpresa(valor);
            expect(nombre.valor).toBe(valor);
        });

        it('rechaza si es ausente, vacío o solo espacios con EMP_NOMBRE_OBLIGATORIO', () => {
            expect(() => new NombreEmpresa('')).toThrow(NombreEmpresaObligatorio);
            expect(() => new NombreEmpresa('   ')).toThrow(NombreEmpresaObligatorio);
            expect(() => new NombreEmpresa(null as unknown as string)).toThrow(NombreEmpresaObligatorio);
            try {
                new NombreEmpresa('  ');
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(ErrorDominioEmpresa);
                expect((e as ErrorDominioEmpresa).codigo).toBe('EMP_NOMBRE_OBLIGATORIO');
            }
        });

        it('rechaza si supera 120 caracteres con EMP_NOMBRE_INVALIDO', () => {
            const largo = 'A'.repeat(121);
            expect(() => new NombreEmpresa(largo)).toThrow(NombreEmpresaInvalido);
            try {
                new NombreEmpresa(largo);
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(ErrorDominioEmpresa);
                expect((e as ErrorDominioEmpresa).codigo).toBe('EMP_NOMBRE_INVALIDO');
            }
        });
    });

    describe('EMP-BR-011 — AliasEmpresa', () => {
        it('acepta alias válido como yerba-norte', () => {
            const alias = new AliasEmpresa('yerba-norte');
            expect(alias.valor).toBe('yerba-norte');
        });

        it('acepta alias de 3 caracteres y de 63 caracteres', () => {
            const min = new AliasEmpresa('abc');
            expect(min.valor).toBe('abc');

            const max = new AliasEmpresa('a' + 'b'.repeat(61) + 'c');
            expect(max.valor.length).toBe(63);
        });

        it('rechaza con EMP_ALIAS_INVALIDO formatos no permitidos o longitudes fuera de rango', () => {
            expect(() => new AliasEmpresa('ab')).toThrow(AliasEmpresaInvalido);
            expect(() => new AliasEmpresa('a'.repeat(64))).toThrow(AliasEmpresaInvalido);
            expect(() => new AliasEmpresa('-Yerba Norte-')).toThrow(AliasEmpresaInvalido);
            expect(() => new AliasEmpresa('yerba_norte')).toThrow(AliasEmpresaInvalido);
            expect(() => new AliasEmpresa('yerba-')).toThrow(AliasEmpresaInvalido);
            try {
                new AliasEmpresa('-abc');
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(ErrorDominioEmpresa);
                expect((e as ErrorDominioEmpresa).codigo).toBe('EMP_ALIAS_INVALIDO');
            }
        });
    });

    describe('EMP-BR-003 — Cuit', () => {
        it('acepta CUIT nulo o indefinido', () => {
            const cuit1 = new Cuit(null);
            expect(cuit1.valor).toBeNull();
            const cuit2 = new Cuit(undefined);
            expect(cuit2.valor).toBeNull();
            const cuit3 = new Cuit('');
            expect(cuit3.valor).toBeNull();
        });

        it('acepta CUIT de 11 dígitos', () => {
            const cuit = new Cuit('20123456789');
            expect(cuit.valor).toBe('20123456789');
        });

        it('rechaza con EMP_CUIT_INVALIDO si contiene guiones, espacios o cantidad distinta de 11', () => {
            expect(() => new Cuit('20-12345678-9')).toThrow(CuitInvalido);
            expect(() => new Cuit('2012345678')).toThrow(CuitInvalido);
            expect(() => new Cuit('201234567890')).toThrow(CuitInvalido);
            expect(() => new Cuit('2012345678a')).toThrow(CuitInvalido);
            try {
                new Cuit('12345');
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(ErrorDominioEmpresa);
                expect((e as ErrorDominioEmpresa).codigo).toBe('EMP_CUIT_INVALIDO');
            }
        });
    });

    describe('EMP-BR-002 — PuntoGeografico', () => {
        it('acepta latitud y longitud válidas', () => {
            const punto = new PuntoGeografico(-27.36, -55.9);
            expect(punto.latitud).toBe(-27.36);
            expect(punto.longitud).toBe(-55.9);
        });

        it('rechaza con EMP_UBICACION_GEOGRAFICA_INVALIDA fuera de rango o NaN', () => {
            expect(() => new PuntoGeografico(-90.1, 0)).toThrow(UbicacionGeograficaInvalida);
            expect(() => new PuntoGeografico(90.1, 0)).toThrow(UbicacionGeograficaInvalida);
            expect(() => new PuntoGeografico(0, -180.1)).toThrow(UbicacionGeograficaInvalida);
            expect(() => new PuntoGeografico(0, 180.1)).toThrow(UbicacionGeograficaInvalida);
            expect(() => new PuntoGeografico(NaN, 0)).toThrow(UbicacionGeograficaInvalida);
            try {
                new PuntoGeografico(100, 20);
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(ErrorDominioEmpresa);
                expect((e as ErrorDominioEmpresa).codigo).toBe('EMP_UBICACION_GEOGRAFICA_INVALIDA');
            }
        });
    });

    describe('EMP-BR-010 — Textos descriptivos', () => {
        it('normaliza y recorta responsableNombre', () => {
            const resp = new ResponsableNombre('  Juan Perez  ');
            expect(resp.valor).toBe('Juan Perez');
            expect(new ResponsableNombre('   ').valor).toBeNull();
            expect(new ResponsableNombre(null).valor).toBeNull();
        });

        it('rechaza responsableNombre mayor a 120 caracteres', () => {
            expect(() => new ResponsableNombre('A'.repeat(121))).toThrow(TextoDescriptivoInvalido);
        });

        it('normaliza y valida ubicacionTexto hasta 500 caracteres', () => {
            const ubi = new UbicacionTexto(' Ruta 12 Km 50 ');
            expect(ubi.valor).toBe('Ruta 12 Km 50');
            expect(new UbicacionTexto('A'.repeat(500)).valor?.length).toBe(500);
            expect(() => new UbicacionTexto('A'.repeat(501))).toThrow(TextoDescriptivoInvalido);
        });

        it('normaliza y valida descripcionActividad hasta 2000 caracteres', () => {
            const desc = new DescripcionActividad(' Cultivo de yerba mate ');
            expect(desc.valor).toBe('Cultivo de yerba mate');
            expect(new DescripcionActividad('A'.repeat(2000)).valor?.length).toBe(2000);
            expect(() => new DescripcionActividad('A'.repeat(2001))).toThrow(TextoDescriptivoInvalido);
        });
    });

    describe('EMP-BR-006 — Configuración general', () => {
        it('valida país ISO 3166-1 alfa-2', () => {
            const pais = new PaisReferencia('AR');
            expect(pais.valor).toBe('AR');
            expect(() => new PaisReferencia('ARG')).toThrow(ConfiguracionGeneralInvalida);
            expect(() => new PaisReferencia('12')).toThrow(ConfiguracionGeneralInvalida);
        });

        it('valida zona horaria IANA', () => {
            const zh = new ZonaHoraria('America/Argentina/Buenos_Aires');
            expect(zh.valor).toBe('America/Argentina/Buenos_Aires');
            expect(() => new ZonaHoraria('Inexistente/Falsa')).toThrow(ConfiguracionGeneralInvalida);
        });

        it('valida moneda ISO 4217', () => {
            const mon = new MonedaPrincipal('ARS');
            expect(mon.valor).toBe('ARS');
            expect(() => new MonedaPrincipal('PESOS')).toThrow(ConfiguracionGeneralInvalida);
        });
    });
});
