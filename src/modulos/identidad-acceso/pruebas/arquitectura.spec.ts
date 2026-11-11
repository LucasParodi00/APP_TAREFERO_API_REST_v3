import { Test, TestingModule } from '@nestjs/testing';
import { IdentidadAccesoModule } from '../identidad-acceso.module';

describe('IdentidadAccesoModule - Arquitectura y Base Técnica', () => {
    it('debe compilar el módulo base sin errores', async () => {
        const modulo: TestingModule = await Test.createTestingModule({
            imports: [IdentidadAccesoModule],
        }).compile();

        expect(modulo).toBeDefined();
        expect(modulo.get(IdentidadAccesoModule)).toBeInstanceOf(IdentidadAccesoModule);
    });
});
