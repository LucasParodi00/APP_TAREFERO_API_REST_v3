import { ExecutionContext, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
    ConsultaPaginadaDto,
    RespuestaPaginadaDto,
    ContextoUsuario,
    VersionIfMatch,
    IdempotencyKey,
    FiltroExcepcionesRfc9457,
    extraerContextoUsuario,
    extraerVersionIfMatch,
    extraerIdempotencyKey,
} from '../../presentacion';
import { CategoriaError, ErrorDominioBase } from '../../dominio';
import { ErrorAplicacionBase, ContextoSolicitud, ResultadoPaginado, CriteriosPaginacion } from '../../aplicacion';

function crearMockContexto(request: Record<string, unknown>, response?: Record<string, unknown>): ExecutionContext {
    const res = response ?? {
        status: jest.fn().mockReturnThis(),
        contentType: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };
    return {
        switchToHttp: () => ({
            getRequest: () => request,
            getResponse: () => res,
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
    } as unknown as ExecutionContext;
}

class ErrorDominioEjemplo extends ErrorDominioBase {
    readonly codigo: string;
    constructor(codigo: string, mensaje: string, categoria: CategoriaError) {
        super(mensaje, categoria);
        this.codigo = codigo;
    }
}

class ErrorAplicacionEjemplo extends ErrorAplicacionBase {
    readonly codigo: string;
    constructor(codigo: string, mensaje: string, categoria: CategoriaError) {
        super(mensaje, categoria);
        this.codigo = codigo;
    }
}

describe('Presentación Común - DTOs de Paginación', () => {
    describe('ConsultaPaginadaDto', () => {
        it('debe usar valores predeterminados (25 y 0)', () => {
            const dto = new ConsultaPaginadaDto();
            expect(dto.limite).toBe(25);
            expect(dto.desplazamiento).toBe(0);

            const criterios = dto.aCriterios();
            expect(criterios.limite).toBe(25);
            expect(criterios.desplazamiento).toBe(0);
        });

        it('debe validar límites válidos entre 1 y 100', async () => {
            const dto = plainToInstance(ConsultaPaginadaDto, { limite: 50, desplazamiento: 10 });
            const errores = await validate(dto);
            expect(errores).toHaveLength(0);
        });

        it('debe rechazar límites fuera de rango o negativos', async () => {
            const dtoInvalido = plainToInstance(ConsultaPaginadaDto, { limite: 101, desplazamiento: -1 });
            const errores = await validate(dtoInvalido);
            expect(errores.length).toBeGreaterThan(0);
        });
    });

    describe('RespuestaPaginadaDto', () => {
        it('debe construir respuesta paginada desde ResultadoPaginado', () => {
            const criterios = CriteriosPaginacion.crear({ limite: 10, desplazamiento: 0 });
            const resultado = ResultadoPaginado.crear(['alpha', 'beta'], 2, criterios);

            const respuesta = RespuestaPaginadaDto.desdeResultado(resultado);
            expect(respuesta.datos).toEqual(['alpha', 'beta']);
            expect(respuesta.paginacion.total).toBe(2);
            expect(respuesta.paginacion.limite).toBe(10);
            expect(respuesta.paginacion.desplazamiento).toBe(0);
        });

        it('debe soportar transformación de datos opcional', () => {
            const criterios = CriteriosPaginacion.crear({ limite: 10, desplazamiento: 0 });
            const resultado = ResultadoPaginado.crear([1, 2], 2, criterios);

            const respuesta = RespuestaPaginadaDto.desdeResultado(resultado, (n) => `num-${n}`);
            expect(respuesta.datos).toEqual(['num-1', 'num-2']);
        });
    });
});

describe('Presentación Común - Decoradores', () => {
    describe('ContextoUsuario', () => {
        it('debe extraer el contexto únicamente de request.contexto', () => {
            const contextoMock: ContextoSolicitud = {
                solicitudId: '018f2d5c-0000-7000-8000-000000000001',
                actorId: '018f2d5c-0000-7000-8000-000000000002',
                roles: ['ADMINISTRADOR'],
                permisos: ['ACC_LEER'],
            };

            const ctxValido = crearMockContexto({ contexto: contextoMock, headers: { 'x-rol': 'SUPER_ADMINISTRADOR' } });
            const res = extraerContextoUsuario(ctxValido);
            expect(res).toBe(contextoMock);
        });

        it('debe lanzar UnauthorizedException si no existe contexto en el request', () => {
            const ctxInvalido = crearMockContexto({ headers: { 'x-rol': 'SUPER_ADMINISTRADOR' } });
            expect(() => extraerContextoUsuario(ctxInvalido)).toThrow(UnauthorizedException);
        });

        it('debe existir el decorador de parámetro', () => {
            expect(ContextoUsuario).toBeDefined();
        });
    });

    describe('VersionIfMatch', () => {
        it('debe extraer la versión numérica ignorando comillas o prefijo W/', () => {
            const ctx1 = crearMockContexto({ headers: { 'if-match': '"42"' } });
            expect(extraerVersionIfMatch(ctx1)).toBe(42);

            const ctx2 = crearMockContexto({ headers: { 'if-match': 'W/"7"' } });
            expect(extraerVersionIfMatch(ctx2)).toBe(7);

            const ctx3 = crearMockContexto({ headers: { 'if-match': '10' } });
            expect(extraerVersionIfMatch(ctx3)).toBe(10);
        });

        it('debe rechazar con HTTP 428 si falta la cabecera If-Match', () => {
            const ctx = crearMockContexto({ headers: {} });
            expect(() => extraerVersionIfMatch(ctx)).toThrow(HttpException);
            try {
                extraerVersionIfMatch(ctx);
            } catch (e) {
                expect((e as HttpException).getStatus()).toBe(HttpStatus.PRECONDITION_REQUIRED);
            }
        });

        it('debe rechazar con HTTP 400 si If-Match no es un número entero positivo', () => {
            const ctx1 = crearMockContexto({ headers: { 'if-match': 'invalido' } });
            expect(() => extraerVersionIfMatch(ctx1)).toThrow(HttpException);

            const ctx2 = crearMockContexto({ headers: { 'if-match': '0' } });
            expect(() => extraerVersionIfMatch(ctx2)).toThrow(HttpException);
        });

        it('debe existir el decorador de parámetro', () => {
            expect(VersionIfMatch).toBeDefined();
        });
    });

    describe('IdempotencyKey', () => {
        it('debe devolver undefined si no se provee y no es requerido', () => {
            const ctx = crearMockContexto({ headers: {} });
            expect(extraerIdempotencyKey(undefined, ctx)).toBeUndefined();
            expect(extraerIdempotencyKey({ requerido: false }, ctx)).toBeUndefined();
        });

        it('debe devolver la clave limpia si se provee', () => {
            const ctx = crearMockContexto({ headers: { 'idempotency-key': '  clave-1234  ' } });
            expect(extraerIdempotencyKey(undefined, ctx)).toBe('clave-1234');
        });

        it('debe rechazar con HTTP 400 si es requerido y falta la cabecera', () => {
            const ctx = crearMockContexto({ headers: {} });
            expect(() => extraerIdempotencyKey({ requerido: true }, ctx)).toThrow(HttpException);
        });

        it('debe rechazar con HTTP 400 si excede los 255 caracteres', () => {
            const ctx = crearMockContexto({ headers: { 'idempotency-key': 'a'.repeat(256) } });
            expect(() => extraerIdempotencyKey(undefined, ctx)).toThrow(HttpException);
        });

        it('debe existir el decorador de parámetro', () => {
            expect(IdempotencyKey).toBeDefined();
        });
    });
});

describe('Presentación Común - FiltroExcepcionesRfc9457', () => {
    let filtro: FiltroExcepcionesRfc9457;
    let mockResponse: {
        status: jest.Mock;
        contentType: jest.Mock;
        json: jest.Mock;
    };

    beforeEach(() => {
        filtro = new FiltroExcepcionesRfc9457();
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            contentType: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
    });

    const categoriasYEstados: Array<[CategoriaError, number]> = [
        [CategoriaError.VALIDACION, 400],
        [CategoriaError.NO_AUTENTICADO, 401],
        [CategoriaError.ACCESO_DENEGADO, 403],
        [CategoriaError.NO_ENCONTRADO, 404],
        [CategoriaError.CONFLICTO, 409],
        [CategoriaError.PRECONDICION_FALLIDA, 412],
        [CategoriaError.PRECONDICION_REQUERIDA, 428],
        [CategoriaError.NO_DISPONIBLE, 503],
    ];

    test.each(categoriasYEstados)('debe mapear categoría %s a HTTP %i con formato RFC 9457', (categoria, expectedStatus) => {
        const req = {
            url: '/api/v1/test',
            headers: { 'x-solicitud-id': '018f2d5c-0000-7000-8000-000000000001' },
        };
        const ctx = crearMockContexto(req, mockResponse);
        const error = new ErrorDominioEjemplo('CMN_TEST_ERROR', 'Mensaje de error seguro', categoria);

        filtro.catch(error, ctx);

        expect(mockResponse.status).toHaveBeenCalledWith(expectedStatus);
        expect(mockResponse.contentType).toHaveBeenCalledWith('application/problem+json');
        expect(mockResponse.json).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'about:blank',
                status: expectedStatus,
                code: 'CMN_TEST_ERROR',
                detail: 'Mensaje de error seguro',
                instance: '/api/v1/test',
                solicitudId: '018f2d5c-0000-7000-8000-000000000001',
            }),
        );
    });

    it('debe mapear errores de aplicación con CategoriaError', () => {
        const req = { url: '/api/v1/test' };
        const ctx = crearMockContexto(req, mockResponse);
        const error = new ErrorAplicacionEjemplo('CMN_APP_CONFLICTO', 'Conflicto de estado', CategoriaError.CONFLICTO);

        filtro.catch(error, ctx);

        expect(mockResponse.status).toHaveBeenCalledWith(409);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 409,
                code: 'CMN_APP_CONFLICTO',
                detail: 'Conflicto de estado',
            }),
        );
    });

    it('debe manejar HttpException de NestJS', () => {
        const req = { url: '/api/v1/test', headers: { 'x-solicitud-id': 'sol-123' } };
        const ctx = crearMockContexto(req, mockResponse);
        const httpException = new HttpException(
            {
                message: ['el campo nombre es requerido'],
                error: 'Bad Request',
                statusCode: 400,
            },
            HttpStatus.BAD_REQUEST,
        );

        filtro.catch(httpException, ctx);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 400,
                code: 'SOLICITUD_INVALIDA',
                solicitudId: 'sol-123',
                errores: ['el campo nombre es requerido'],
            }),
        );
    });

    it('debe ocultar detalles de errores desconocidos y responder 500 seguro', () => {
        const req = { url: '/api/v1/test' };
        const ctx = crearMockContexto(req, mockResponse);
        const errorInesperado = new Error('Database password leak: postgresql://admin:secret123@host');

        filtro.catch(errorInesperado, ctx);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 500,
                code: 'ERROR_INTERNO',
                detail: 'Ocurrió un error inesperado en el servidor.',
                instance: '/api/v1/test',
            }),
        );
        const primerLlamado = mockResponse.json.mock.calls[0] as unknown[];
        const jsonCall = primerLlamado[0] as { detail: string };
        expect(jsonCall.detail).not.toContain('secret123');
        expect(jsonCall.detail).not.toContain('Database password');
    });
});
