import { Repository } from 'typeorm';
import { RepositorioChacrasTypeOrm } from '../../infraestructura/persistencia/repositorio-chacras.typeorm';
import { AdaptadorResolvedorChacraPublico } from '../../infraestructura/adaptadores/resolvedor-chacra-publico.adaptador';
import { AdaptadorConsultaLotesActivosNulo } from '../../infraestructura/adaptadores/consulta-lotes-activos-nulo.adaptador';
import { ChacraTypeOrmEntity } from '../../infraestructura/persistencia/chacra.typeorm-entity';
import { Chacra } from '../../dominio/agregados';
import { NombreChacra, NombreCortoChacra } from '../../dominio/objetos-valor';
import { EstadoChacra } from '../../dominio/enumeraciones';
import { ConsultaChacras } from '../../aplicacion/consultas';

describe('T10 — Infraestructura: Repositorio, Consulta, Resolvedor Público y Adaptador Nulo', () => {
    const id = '018f6f5d-7a6b-7345-9123-456789abcdef';
    const empresaId = '018f6f5d-7a6b-7345-9123-000000000001';
    const actorId = '018f6f5d-7a6b-7345-9123-actor000001';
    const fecha = new Date('2026-11-13T10:00:00.000Z');

    describe('RepositorioChacrasTypeOrm', () => {
        let repoMock: Partial<Repository<ChacraTypeOrmEntity>>;
        let repositorio: RepositorioChacrasTypeOrm;

        beforeEach(() => {
            repoMock = {
                save: jest.fn().mockResolvedValue({}),
                findOne: jest.fn(),
                createQueryBuilder: jest.fn(),
            };
            repositorio = new RepositorioChacrasTypeOrm(repoMock as Repository<ChacraTypeOrmEntity>);
        });

        it('debe guardar agregados delegando en el repositorio TypeORM', async () => {
            const chacra = Chacra.registrar({
                id,
                empresaId,
                nombre: NombreChacra.crear('Chacra Test'),
                nombreCorto: NombreCortoChacra.crear('TEST'),
                responsableNombre: null,
                direccion: null,
                puntoGeograficoReferencia: null,
                creadoEn: fecha,
                creadoPor: actorId,
            });

            await repositorio.guardar(chacra);
            expect(repoMock.save).toHaveBeenCalledTimes(1);
        });

        it('debe devolver null cuando la chacra no existe por ID y empresa', async () => {
            (repoMock.findOne as jest.Mock).mockResolvedValueOnce(null);
            const resultado = await repositorio.obtenerPorId('inexistente', empresaId);
            expect(resultado).toBeNull();
        });
    });

    describe('AdaptadorResolvedorChacraPublico (ACC-DEP-005, D-12)', () => {
        let consultaMock: { resolverPublicoPorId: jest.Mock };
        let resolvedor: AdaptadorResolvedorChacraPublico;

        beforeEach(() => {
            consultaMock = {
                resolverPublicoPorId: jest.fn(),
            };
            resolvedor = new AdaptadorResolvedorChacraPublico(consultaMock as unknown as ConsultaChacras);
        });

        it('debe resolver chacra pública retornando solo id, empresaId y estado', async () => {
            consultaMock.resolverPublicoPorId.mockResolvedValueOnce({
                id,
                empresaId,
                estado: EstadoChacra.ACTIVA,
            });

            const resultado = await resolvedor.resolverPorId(id);
            expect(resultado).toEqual({
                id,
                empresaId,
                estado: EstadoChacra.ACTIVA,
            });
        });

        it('debe devolver null si la chacra no existe', async () => {
            consultaMock.resolverPublicoPorId.mockResolvedValueOnce(null);
            const resultado = await resolvedor.resolverPorId('inexistente');
            expect(resultado).toBeNull();
        });
    });

    describe('AdaptadorConsultaLotesActivosNulo (D-04)', () => {
        it('debe indicar siempre que no tiene lotes activos', async () => {
            const adaptador = new AdaptadorConsultaLotesActivosNulo();
            const resultado = await adaptador.tieneLotesActivos(id);
            expect(resultado).toBe(false);
        });
    });
});
