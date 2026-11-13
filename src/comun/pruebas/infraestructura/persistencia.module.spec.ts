import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { PersistenciaModule } from '../../infraestructura/persistencia/persistencia.module';
import { UNIDAD_TRANSACCIONAL } from '../../aplicacion';
import { UnidadTransaccionalTypeOrm } from '../../infraestructura/persistencia/unidad-transaccional.typeorm';

describe('PersistenciaModule (Común)', () => {
    let modulo: TestingModule;

    beforeAll(async () => {
        // En prueba unitaria/de módulo, creamos el módulo reemplazando DataSource por un mock para no requerir conexión abierta
        const mockDataSource = {
            isInitialized: true,
            manager: {},
            transaction: jest.fn(),
            destroy: jest.fn().mockResolvedValue(undefined),
        };

        modulo = await Test.createTestingModule({
            imports: [PersistenciaModule],
        })
            .overrideProvider(DataSource)
            .useValue(mockDataSource)
            .compile();
    });

    afterAll(async () => {
        if (modulo) {
            await modulo.close();
        }
    });

    it('debe compilarse correctamente y resolver DataSource', () => {
        const ds = modulo.get<DataSource>(DataSource);
        expect(ds).toBeDefined();
        expect(ds.isInitialized).toBe(true);
    });

    it('debe proveer UNIDAD_TRANSACCIONAL como instancia de UnidadTransaccionalTypeOrm', () => {
        const ut = modulo.get<UnidadTransaccionalTypeOrm>(UNIDAD_TRANSACCIONAL);
        expect(ut).toBeDefined();
        expect(ut).toBeInstanceOf(UnidadTransaccionalTypeOrm);
    });
});
