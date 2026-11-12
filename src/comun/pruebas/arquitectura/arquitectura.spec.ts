import { execSync } from 'child_process';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const config = require('../../../../.dependency-cruiser.js');

describe('Arquitectura - Blindaje de fronteras hexagonales en src/comun', () => {
    it('no debe presentar violaciones arquitectónicas al ejecutar depcruise', () => {
        const salida = execSync('yarn test:arquitectura', { encoding: 'utf-8' });
        expect(salida).toContain('no dependency violations found');
    });

    it('debe contener las reglas de frontera aprobadas en ADR-0012 y arquitectura §17', () => {
        const nombresReglas = config.forbidden.map((r: { name: string }) => r.name);

        expect(nombresReglas).toContain('comun-no-depende-de-modulos');
        expect(nombresReglas).toContain('comun-dominio-no-depende-de-otras-capas');
        expect(nombresReglas).toContain('comun-aplicacion-no-depende-de-infra-ni-presentacion');
        expect(nombresReglas).toContain('comun-infraestructura-no-depende-de-presentacion');
        expect(nombresReglas).toContain('modulo-dominio-solo-usa-comun-dominio');
        expect(nombresReglas).toContain('modulo-aplicacion-no-usa-comun-infra-ni-presentacion');
        expect(nombresReglas).toContain('modulo-infraestructura-no-usa-comun-presentacion');
        expect(nombresReglas).toContain('modulo-presentacion-no-usa-comun-infraestructura');
    });

    it('las reglas de comun deben prohibir explícitamente dependencias indebidas', () => {
        // comun no depende de modulos
        const reglaComunNoModulos = config.forbidden.find((r: { name: string }) => r.name === 'comun-no-depende-de-modulos');
        expect(reglaComunNoModulos.from.path).toBe('^src/comun');
        expect(reglaComunNoModulos.to.path).toContain('^src/modulos');

        // modulo dominio solo comun dominio
        const reglaModDom = config.forbidden.find((r: { name: string }) => r.name === 'modulo-dominio-solo-usa-comun-dominio');
        expect(reglaModDom.to.path).toContain('^src/comun/aplicacion');
        expect(reglaModDom.to.path).toContain('^src/comun/infraestructura');
        expect(reglaModDom.to.path).toContain('^src/comun/presentacion');
    });
});
