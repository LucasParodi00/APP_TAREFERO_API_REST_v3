import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearTablasEmpresas1731170000000 implements MigrationInterface {
  name = 'CrearTablasEmpresas1731170000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis;`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS empresas (
        id UUID PRIMARY KEY,
        nombre VARCHAR(120) NOT NULL,
        alias VARCHAR(63) NOT NULL,
        cuit VARCHAR(11) NULL,
        responsable_nombre VARCHAR(120) NULL,
        ubicacion_texto VARCHAR(500) NULL,
        latitud NUMERIC(10, 7) NULL,
        longitud NUMERIC(10, 7) NULL,
        ubicacion_geografica GEOMETRY(Point, 4326) NULL,
        descripcion_actividad VARCHAR(2000) NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
        creado_en TIMESTAMPTZ NOT NULL,
        creado_por VARCHAR(120) NOT NULL,
        actualizado_en TIMESTAMPTZ NOT NULL,
        actualizado_por VARCHAR(120) NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        CONSTRAINT uq_empresas_alias UNIQUE (alias)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_empresas_estado ON empresas(estado);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_empresas_nombre ON empresas(nombre);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS configuraciones_empresa (
        id UUID PRIMARY KEY,
        empresa_id UUID NOT NULL,
        pais_referencia VARCHAR(2) NOT NULL DEFAULT 'AR',
        zona_horaria VARCHAR(255) NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
        moneda_principal VARCHAR(3) NOT NULL DEFAULT 'ARS',
        creado_en TIMESTAMPTZ NOT NULL,
        creado_por VARCHAR(120) NOT NULL,
        actualizado_en TIMESTAMPTZ NOT NULL,
        actualizado_por VARCHAR(120) NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        CONSTRAINT uq_configuraciones_empresa_empresa_id UNIQUE (empresa_id),
        CONSTRAINT fk_configuraciones_empresa_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS configuraciones_empresa;`);
    await queryRunner.query(`DROP TABLE IF EXISTS empresas;`);
  }
}
