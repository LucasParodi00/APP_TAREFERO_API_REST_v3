import { Repository } from 'typeorm';
import { RepositorioEmpresasTypeOrm } from '../../infraestructura/persistencia/repositorio-empresas.typeorm';
import { EmpresaTypeOrmEntity } from '../../infraestructura/persistencia/empresa.typeorm-entity';
import { Empresa } from '../../dominio/agregados/empresa';
import { NombreEmpresa, AliasEmpresa } from '../../dominio/objetos-valor';
import { AdaptadorAsignacionComercialProvisional } from '../../infraestructura/adaptadores/asignacion-comercial-provisional.adaptador';

describe('Infraestructura Persistencia — RepositorioEmpresasTypeOrm (T03/T07)', () => {
    let saveMock: jest.Mock;
    let findOneMock: jest.Mock;
    let countMock: jest.Mock;
    let repositorio: RepositorioEmpresasTypeOrm;

    beforeEach(() => {
        saveMock = jest.fn();
        findOneMock = jest.fn();
        countMock = jest.fn();

        const mockRepo = {
            save: saveMock,
            findOne: findOneMock,
            count: countMock,
        } as unknown as Repository<EmpresaTypeOrmEntity>;

        repositorio = new RepositorioEmpresasTypeOrm(mockRepo);
    });

    it('guarda una empresa mapeando a entidad TypeORM', async () => {
        const empresa = Empresa.crear({
            id: '019313ea-1111-7000-8000-000000000001',
            nombre: new NombreEmpresa('Yerba Misionera'),
            alias: new AliasEmpresa('yerba-misionera'),
            actor: 'super-admin',
        });

        saveMock.mockResolvedValue({});

        await repositorio.guardar(empresa);

        expect(saveMock).toHaveBeenCalledTimes(1);
        const primerLlamado = saveMock.mock.calls[0] as unknown[];
        const entidadGuardada = primerLlamado[0] as EmpresaTypeOrmEntity;
        expect(entidadGuardada.id).toBe(empresa.id);
        expect(entidadGuardada.alias).toBe('yerba-misionera');
    });

    it('obtiene por ID o retorna null si no existe', async () => {
        findOneMock.mockResolvedValueOnce(null);
        const resultadoNull = await repositorio.obtenerPorId('inexistente');
        expect(resultadoNull).toBeNull();
    });

    it('comprueba existencia de alias con count', async () => {
        countMock.mockResolvedValueOnce(1);
        const existe = await repositorio.existeAlias('yerba-misionera');
        expect(existe).toBe(true);
        expect(countMock).toHaveBeenCalledWith({
            where: { alias: 'yerba-misionera' },
        });
    });

    it('adaptador provisional de asignación comercial confirma asignación', async () => {
        const adaptador = new AdaptadorAsignacionComercialProvisional();
        const confirmada = await adaptador.confirmarAsignacion('empresa-1');
        expect(confirmada).toBe(true);
    });
});
