import { MigrationInterface, QueryRunner } from 'typeorm';

export class HabilitarExtensionPostgis1731450000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async down(_queryRunner: QueryRunner): Promise<void> {
        // Operación no destructiva: la extensión PostGIS es compartida globalmente por múltiples módulos (p. ej. territorio).
        // Deshabilitarla o borrarla destruiría tipos y columnas de datos espaciales preexistentes.
    }
}
