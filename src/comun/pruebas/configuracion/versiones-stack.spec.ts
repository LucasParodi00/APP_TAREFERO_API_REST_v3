import * as fs from 'fs';
import * as path from 'path';

interface PackageJsonEstructura {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
}

describe('Configuración - Auditoría de Versiones Exactas del Stack', () => {
    const packageJsonPath = path.resolve(__dirname, '../../../../package.json');
    const contenido = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(contenido) as PackageJsonEstructura;

    const dependenciasCriticas = ['@nestjs/common', '@nestjs/core', '@nestjs/platform-express', 'typeorm', 'pg', 'uuid'];

    const devDependenciasCriticas = ['@nestjs/cli', '@nestjs/schematics', '@nestjs/testing', 'typescript'];

    test.each(dependenciasCriticas)('la dependencia %s debe estar fijada en una versión exacta sin rangos (^ o ~)', (dep) => {
        const version = packageJson.dependencies[dep];
        expect(version).toBeDefined();
        expect(version).not.toMatch(/^[\^~><=]/);
    });

    test.each(devDependenciasCriticas)(
        'la dependencia de desarrollo %s debe estar fijada en una versión exacta sin rangos (^ o ~)',
        (dep) => {
            const version = packageJson.devDependencies[dep];
            expect(version).toBeDefined();
            expect(version).not.toMatch(/^[\^~><=]/);
        },
    );
});
