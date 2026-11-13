/* eslint-disable @typescript-eslint/unbound-method */
import { QueryRunner } from 'typeorm';
import { HabilitarExtensionPostgis1731450000000 } from '../../../../migraciones/comun/1731450000000-HabilitarExtensionPostgis';

describe('Migración Técnica Común - Habilitación PostGIS', () => {
    let mockQueryRunner: jest.Mocked<QueryRunner>;
    let migracion: HabilitarExtensionPostgis1731450000000;

    beforeEach(() => {
        mockQueryRunner = {
            query: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<QueryRunner>;

        migracion = new HabilitarExtensionPostgis1731450000000();
    });

    it('debe ejecutar CREATE EXTENSION IF NOT EXISTS postgis en el método up', async () => {
        await migracion.up(mockQueryRunner);

        expect(mockQueryRunner.query).toHaveBeenCalledWith('CREATE EXTENSION IF NOT EXISTS postgis;');
    });

    it('no debe eliminar la extensión PostGIS en el método down para proteger datos espaciales compartidos', async () => {
        await migracion.down(mockQueryRunner);

        // down() debe ser no destructivo y no ejecutar DROP EXTENSION
        expect(mockQueryRunner.query).not.toHaveBeenCalledWith(expect.stringContaining('DROP EXTENSION'));
    });
});
