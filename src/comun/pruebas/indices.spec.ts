import 'reflect-metadata';
import * as Dominio from '../dominio';
import * as Aplicacion from '../aplicacion';
import * as Infraestructura from '../infraestructura';
import * as Presentacion from '../presentacion';

describe('Común - Verificación de APIs públicas por capa (index.ts)', () => {
    it('debe exponer todas las APIs públicas de dominio y ninguna de capas externas', () => {
        expect(Dominio.CategoriaError).toBeDefined();
        expect(Dominio.ErrorDominioBase).toBeDefined();
        expect(Dominio.IdentificadorUuid).toBeDefined();
        expect(Dominio.FechaCivil).toBeDefined();
        expect(Dominio.FechaHoraUtc).toBeDefined();
        expect(Dominio.CodigoMoneda).toBeDefined();
        expect(Dominio.Dinero).toBeDefined();

        // Dominio no debe exponer nada de aplicación, infraestructura ni presentación
        const dom = Dominio as Record<string, unknown>;
        expect(dom.CriteriosPaginacion).toBeUndefined();
        expect(dom.GeneradorUuidV7).toBeUndefined();
        expect(dom.FiltroExcepcionesRfc9457).toBeUndefined();
    });

    it('debe exponer todas las APIs públicas de aplicación y ninguna de infraestructura o presentación', () => {
        expect(Aplicacion.ErrorAplicacionBase).toBeDefined();
        expect(Aplicacion.ErrorPaginacionInvalida).toBeDefined();
        expect(Aplicacion.CriteriosPaginacion).toBeDefined();
        expect(Aplicacion.ResultadoPaginado).toBeDefined();
        expect(Aplicacion.GENERADOR_IDENTIFICADORES).toBeDefined();
        expect(Aplicacion.RELOJ).toBeDefined();
        expect(Aplicacion.UNIDAD_TRANSACCIONAL).toBeDefined();

        const app = Aplicacion as Record<string, unknown>;
        expect(app.GeneradorUuidV7).toBeUndefined();
        expect(app.PaginadorTypeOrm).toBeUndefined();
        expect(app.FiltroExcepcionesRfc9457).toBeUndefined();
    });

    it('debe exponer todas las APIs públicas de infraestructura y ninguna de presentación', () => {
        expect(Infraestructura.GeneradorUuidV7).toBeDefined();
        expect(Infraestructura.RelojSistema).toBeDefined();
        expect(Infraestructura.PaginadorTypeOrm).toBeDefined();
        expect(Infraestructura.crearOpcionesDataSource).toBeDefined();
        expect(Infraestructura.crearDataSource).toBeDefined();
        expect(Infraestructura.UnidadTransaccionalTypeOrm).toBeDefined();
        expect(Infraestructura.PersistenciaModule).toBeDefined();

        const infra = Infraestructura as Record<string, unknown>;
        expect(infra.FiltroExcepcionesRfc9457).toBeUndefined();
        expect(infra.ConsultaPaginadaDto).toBeUndefined();
    });

    it('debe exponer todas las APIs públicas de presentación', () => {
        expect(Presentacion.ConsultaPaginadaDto).toBeDefined();
        expect(Presentacion.RespuestaPaginadaDto).toBeDefined();
        expect(Presentacion.ContextoUsuario).toBeDefined();
        expect(Presentacion.VersionIfMatch).toBeDefined();
        expect(Presentacion.IdempotencyKey).toBeDefined();
        expect(Presentacion.FiltroExcepcionesRfc9457).toBeDefined();
    });
});
