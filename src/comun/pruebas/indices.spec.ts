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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dom = Dominio as any;
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const app = Aplicacion as any;
        expect(app.GeneradorUuidV7).toBeUndefined();
        expect(app.PaginadorTypeOrm).toBeUndefined();
        expect(app.FiltroExcepcionesRfc9457).toBeUndefined();
    });

    it('debe exponer todas las APIs públicas de infraestructura y ninguna de presentación', () => {
        expect(Infraestructura.GeneradorUuidV7).toBeDefined();
        expect(Infraestructura.RelojSistema).toBeDefined();
        expect(Infraestructura.PaginadorTypeOrm).toBeDefined();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const infra = Infraestructura as any;
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
