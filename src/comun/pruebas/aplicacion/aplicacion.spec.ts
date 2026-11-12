import { CategoriaError } from '../../dominio';
import {
    ErrorAplicacionBase,
    ErrorPaginacionInvalida,
    CriteriosPaginacion,
    ResultadoPaginado,
    Paginacion,
    ContextoSolicitud,
    GeneradorIdentificadores,
    GENERADOR_IDENTIFICADORES,
    Reloj,
    RELOJ,
} from '../../aplicacion';

class ErrorAplicacionPrueba extends ErrorAplicacionBase {
    readonly codigo = 'CMN_APP_ERROR';
    constructor(mensaje = 'Error de aplicación', causa?: unknown) {
        super(mensaje, CategoriaError.ACCESO_DENEGADO, causa);
    }
}

describe('Aplicación Común - Errores Base', () => {
    it('debe crear un error de aplicación con código, mensaje, categoría y causa opcional', () => {
        const causa = new Error('Causa original');
        const error = new ErrorAplicacionPrueba('Operación no permitida', causa);

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ErrorAplicacionBase);
        expect(error.codigo).toBe('CMN_APP_ERROR');
        expect(error.message).toBe('Operación no permitida');
        expect(error.categoria).toBe(CategoriaError.ACCESO_DENEGADO);
        expect(error.causa).toBe(causa);
        expect(error.name).toBe('ErrorAplicacionPrueba');
    });

    it('debe instanciar ErrorPaginacionInvalida con mensaje por defecto', () => {
        const err = new ErrorPaginacionInvalida();
        expect(err.codigo).toBe('CMN_PAGINACION_INVALIDA');
        expect(err.categoria).toBe(CategoriaError.VALIDACION);
    });
});

describe('Aplicación Común - Modelos de Lectura de Paginación', () => {
    describe('CriteriosPaginacion', () => {
        it('debe usar valores predeterminados (limite 25, desplazamiento 0) si no se especifican', () => {
            const criterios = CriteriosPaginacion.crear();
            expect(criterios.limite).toBe(25);
            expect(criterios.desplazamiento).toBe(0);
        });

        it('debe aceptar valores válidos dentro del rango permitido (hasta 100)', () => {
            const criterios = CriteriosPaginacion.crear({ limite: 50, desplazamiento: 10 });
            expect(criterios.limite).toBe(50);
            expect(criterios.desplazamiento).toBe(10);

            const limiteMaximo = CriteriosPaginacion.crear({ limite: 100, desplazamiento: 0 });
            expect(limiteMaximo.limite).toBe(100);
        });

        it('debe rechazar límites menores a 1 o mayores a 100', () => {
            expect(() => CriteriosPaginacion.crear({ limite: 0 })).toThrow(ErrorPaginacionInvalida);
            expect(() => CriteriosPaginacion.crear({ limite: -5 })).toThrow(ErrorPaginacionInvalida);
            expect(() => CriteriosPaginacion.crear({ limite: 101 })).toThrow(ErrorPaginacionInvalida);
            expect(() => CriteriosPaginacion.crear({ limite: NaN })).toThrow(ErrorPaginacionInvalida);
            expect(() => CriteriosPaginacion.crear({ limite: 'abc' as unknown as number })).toThrow(ErrorPaginacionInvalida);
        });

        it('debe rechazar desplazamientos negativos o no numéricos', () => {
            expect(() => CriteriosPaginacion.crear({ desplazamiento: -1 })).toThrow(ErrorPaginacionInvalida);
            expect(() => CriteriosPaginacion.crear({ desplazamiento: NaN })).toThrow(ErrorPaginacionInvalida);
            expect(() => CriteriosPaginacion.crear({ desplazamiento: 'abc' as unknown as number })).toThrow(
                ErrorPaginacionInvalida,
            );
        });

        it('debe ser inmutable', () => {
            const criterios = CriteriosPaginacion.crear({ limite: 10, desplazamiento: 5 });
            expect(() => {
                (criterios as unknown as { limite: number }).limite = 20;
            }).toThrow();
        });
    });

    describe('ResultadoPaginado', () => {
        it('debe encapsular datos y paginación correctamente', () => {
            const datos = [
                { id: '1', nombre: 'Test 1' },
                { id: '2', nombre: 'Test 2' },
            ];
            const paginacion: Paginacion = {
                limite: 25,
                desplazamiento: 0,
                total: 2,
            };

            const resultado: ResultadoPaginado<{ id: string; nombre: string }> = {
                datos,
                paginacion,
            };

            expect(resultado.datos).toHaveLength(2);
            expect(resultado.paginacion.total).toBe(2);
            expect(resultado.paginacion.limite).toBe(25);
            expect(resultado.paginacion.desplazamiento).toBe(0);
        });

        it('debe permitir crear ResultadoPaginado con helper estático', () => {
            const datos = ['item1', 'item2'];
            const criterios = CriteriosPaginacion.crear({ limite: 10, desplazamiento: 20 });
            const resultado = ResultadoPaginado.crear(datos, 100, criterios);

            expect(resultado.datos).toEqual(datos);
            expect(resultado.paginacion.total).toBe(100);
            expect(resultado.paginacion.limite).toBe(10);
            expect(resultado.paginacion.desplazamiento).toBe(20);
        });
    });
});

describe('Aplicación Común - Puertos', () => {
    it('debe validar la estructura canónica de ContextoSolicitud', () => {
        const contexto: ContextoSolicitud = {
            solicitudId: '018f2d5c-9c76-7889-b88d-71b34fa365ba',
            actorId: '018f2d5c-9c76-7889-b88d-71b34fa365bb',
            cuentaEmpresaId: '018f2d5c-9c76-7889-b88d-71b34fa365bc',
            empresaId: '018f2d5c-9c76-7889-b88d-71b34fa365bd',
            sesionId: '018f2d5c-9c76-7889-b88d-71b34fa365be',
            roles: ['ADMINISTRADOR'],
            permisos: ['ACC_LEER_CUENTAS', 'ACC_MODIFICAR_CUENTAS'],
            alcance: 'GLOBAL',
            empleadoId: '018f2d5c-9c76-7889-b88d-71b34fa365bf',
        };

        expect(contexto.solicitudId).toBeDefined();
        expect(contexto.actorId).toBeDefined();
        expect(contexto.cuentaEmpresaId).toBeDefined();
        expect(contexto.empresaId).toBeDefined();
        expect(contexto.sesionId).toBeDefined();
        expect(contexto.roles).toContain('ADMINISTRADOR');
        expect(contexto.permisos).toHaveLength(2);
        expect(contexto.alcance).toBe('GLOBAL');
        expect(contexto.empleadoId).toBeDefined();
    });

    it('debe permitir sustituir el puerto GeneradorIdentificadores con dobles de prueba', () => {
        expect(typeof GENERADOR_IDENTIFICADORES).toBe('symbol');

        class DobleGenerador implements GeneradorIdentificadores {
            private contador = 1;
            generar(): string {
                return `id-fijo-${this.contador++}`;
            }
        }

        const generador: GeneradorIdentificadores = new DobleGenerador();
        expect(generador.generar()).toBe('id-fijo-1');
        expect(generador.generar()).toBe('id-fijo-2');
    });

    it('debe permitir sustituir el puerto Reloj con dobles de prueba', () => {
        expect(typeof RELOJ).toBe('symbol');

        const fechaFija = new Date('2026-11-12T12:00:00.000Z');
        class DobleReloj implements Reloj {
            ahora(): Date {
                return fechaFija;
            }
        }

        const reloj: Reloj = new DobleReloj();
        expect(reloj.ahora()).toEqual(fechaFija);
    });
});
