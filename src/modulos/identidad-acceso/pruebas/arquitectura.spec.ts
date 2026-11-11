import { Test, TestingModule } from '@nestjs/testing';
import { Global, Module } from '@nestjs/common';
import { IdentidadAccesoModule } from '../identidad-acceso.module';
import { REPOSITORIO_CUENTAS_EMPRESA } from '../dominio/repositorios/repositorio-cuentas-empresa';
import { REPOSITORIO_SESIONES } from '../dominio/repositorios/repositorio-sesiones';
import { REPOSITORIO_USUARIOS_PLATAFORMA } from '../dominio/repositorios/repositorio-usuarios-plataforma';
import { REPOSITORIO_INTERVENCIONES_SOPORTE } from '../dominio/repositorios/repositorio-intervenciones-soporte';
import { CONSULTA_CUENTAS_EMPRESA } from '../aplicacion/puertos/consulta-cuentas-empresa.puerto';
import { CONSULTA_INTERVENCIONES_SOPORTE } from '../aplicacion/puertos/consulta-intervenciones-soporte.puerto';
import { RESOLVEDOR_EMPRESA_PUBLICO } from '../../empresas/aplicacion/puertos/resolvedor-empresa-publico.puerto';

describe('IdentidadAccesoModule - Arquitectura y Base Técnica', () => {
    it('debe compilar el módulo base sin errores', async () => {
        @Global()
        @Module({
            providers: [
                { provide: REPOSITORIO_CUENTAS_EMPRESA, useValue: {} },
                { provide: REPOSITORIO_SESIONES, useValue: {} },
                { provide: REPOSITORIO_USUARIOS_PLATAFORMA, useValue: {} },
                { provide: REPOSITORIO_INTERVENCIONES_SOPORTE, useValue: {} },
                { provide: CONSULTA_CUENTAS_EMPRESA, useValue: {} },
                { provide: CONSULTA_INTERVENCIONES_SOPORTE, useValue: {} },
                { provide: RESOLVEDOR_EMPRESA_PUBLICO, useValue: {} },
            ],
            exports: [
                REPOSITORIO_CUENTAS_EMPRESA,
                REPOSITORIO_SESIONES,
                REPOSITORIO_USUARIOS_PLATAFORMA,
                REPOSITORIO_INTERVENCIONES_SOPORTE,
                CONSULTA_CUENTAS_EMPRESA,
                CONSULTA_INTERVENCIONES_SOPORTE,
                RESOLVEDOR_EMPRESA_PUBLICO,
            ],
        })
        class PersistenciaMockModule {}

        const modulo: TestingModule = await Test.createTestingModule({
            imports: [PersistenciaMockModule, IdentidadAccesoModule],
        }).compile();

        expect(modulo).toBeDefined();
        expect(modulo.get(IdentidadAccesoModule)).toBeInstanceOf(IdentidadAccesoModule);
    });
});
