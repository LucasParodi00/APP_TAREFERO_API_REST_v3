import { Repository } from 'typeorm';
import { ConsultaEmpresasTypeOrm } from '../../infraestructura/persistencia/consulta-empresas.typeorm';
import { EmpresaTypeOrmEntity } from '../../infraestructura/persistencia/empresa.typeorm-entity';
import { ConfiguracionGeneralEmpresaTypeOrmEntity } from '../../infraestructura/persistencia/configuracion-general-empresa.typeorm-entity';

describe('Infraestructura Persistencia — ConsultaEmpresasTypeOrm (T03)', () => {
    let findOneMock: jest.Mock;
    let findAndCountMock: jest.Mock;
    let consulta: ConsultaEmpresasTypeOrm;

    const crearEntidadPrueba = (id: string, alias: string, nombre: string): EmpresaTypeOrmEntity => {
        const cfg = new ConfiguracionGeneralEmpresaTypeOrmEntity();
        cfg.id = 'cfg-1';
        cfg.empresaId = id;
        cfg.paisReferencia = 'AR';
        cfg.zonaHoraria = 'America/Argentina/Buenos_Aires';
        cfg.monedaPrincipal = 'ARS';
        cfg.creadoEn = new Date('2026-11-10T10:00:00.000Z');
        cfg.creadoPor = 'admin';
        cfg.actualizadoEn = new Date('2026-11-10T10:00:00.000Z');
        cfg.actualizadoPor = 'admin';
        cfg.version = 1;

        const entidad = new EmpresaTypeOrmEntity();
        entidad.id = id;
        entidad.nombre = nombre;
        entidad.alias = alias;
        entidad.cuit = '30777777779';
        entidad.responsableNombre = 'Juan Perez';
        entidad.ubicacionTexto = 'Posadas';
        entidad.ubicacionLatitud = -27.36;
        entidad.ubicacionLongitud = -55.89;
        entidad.descripcionActividad = 'Cultivo yerba mate';
        entidad.estado = 'ACTIVA';
        entidad.configuracionGeneral = cfg;
        entidad.creadoEn = new Date('2026-11-10T10:00:00.000Z');
        entidad.creadoPor = 'admin';
        entidad.actualizadoEn = new Date('2026-11-10T10:00:00.000Z');
        entidad.actualizadoPor = 'admin';
        entidad.version = 1;

        return entidad;
    };

    beforeEach(() => {
        findOneMock = jest.fn();
        findAndCountMock = jest.fn();

        const mockRepo = {
            findOne: findOneMock,
            findAndCount: findAndCountMock,
        } as unknown as Repository<EmpresaTypeOrmEntity>;

        consulta = new ConsultaEmpresasTypeOrm(mockRepo);
    });

    describe('obtenerPorIdOAlias', () => {
        it('retorna la proyección EmpresaLectura cuando existe por id o alias', async () => {
            const entidad = crearEntidadPrueba('emp-1', 'yerba-central', 'Yerba Central');
            findOneMock.mockResolvedValueOnce(entidad);

            const resultado = await consulta.obtenerPorIdOAlias('emp-1');

            expect(resultado).not.toBeNull();
            expect(resultado!.id).toBe('emp-1');
            expect(resultado!.alias).toBe('yerba-central');
            expect(resultado!.nombre).toBe('Yerba Central');
            expect(resultado!.ubicacionGeografica).toEqual({
                latitud: -27.36,
                longitud: -55.89,
            });
            expect(resultado!.configuracionGeneral.paisReferencia).toBe('AR');
            expect(findOneMock).toHaveBeenCalledWith({
                where: [{ id: 'emp-1' }, { alias: 'emp-1' }],
                relations: { configuracionGeneral: true },
            });
        });

        it('retorna null si no se encuentra la entidad', async () => {
            findOneMock.mockResolvedValueOnce(null);

            const resultado = await consulta.obtenerPorIdOAlias('no-existe');

            expect(resultado).toBeNull();
        });
    });

    describe('listar', () => {
        it('retorna lista paginada proyectada directamente sin reconstituir agregados', async () => {
            const entidad1 = crearEntidadPrueba('emp-1', 'yerba-1', 'Yerba 1');
            const entidad2 = crearEntidadPrueba('emp-2', 'yerba-2', 'Yerba 2');
            findAndCountMock.mockResolvedValueOnce([[entidad1, entidad2], 25]);

            const resultado = await consulta.listar({
                pagina: 2,
                limite: 10,
                estado: 'ACTIVA',
                nombre: 'Yerba',
            });

            expect(resultado.total).toBe(25);
            expect(resultado.pagina).toBe(2);
            expect(resultado.limite).toBe(10);
            expect(resultado.totalPaginas).toBe(3);
            expect(resultado.elementos).toHaveLength(2);
            expect(resultado.elementos[0].id).toBe('emp-1');
            expect(resultado.elementos[1].id).toBe('emp-2');
            expect(findAndCountMock).toHaveBeenCalledTimes(1);
        });
    });
});
