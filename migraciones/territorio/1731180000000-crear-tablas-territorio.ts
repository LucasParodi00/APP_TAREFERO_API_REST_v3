import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearTablasTerritorio1731180000000 implements MigrationInterface {
  name = 'CrearTablasTerritorio1731180000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS chacras (
        id UUID PRIMARY KEY,
        empresa_id UUID NOT NULL,
        nombre VARCHAR(150) NOT NULL,
        nombre_corto VARCHAR(50) NOT NULL,
        nombre_corto_clave VARCHAR(60) NOT NULL,
        responsable_nombre VARCHAR(150),
        direccion_texto VARCHAR(500),
        latitud NUMERIC(10, 7),
        longitud NUMERIC(10, 7),
        estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
        version INTEGER NOT NULL DEFAULT 1,
        creado_en TIMESTAMPTZ NOT NULL,
        creado_por VARCHAR(120) NOT NULL,
        actualizado_en TIMESTAMPTZ NOT NULL,
        actualizado_por VARCHAR(120) NOT NULL,
        CONSTRAINT fk_chacras_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
        CONSTRAINT uq_chacras_empresa_nombre_corto UNIQUE (empresa_id, nombre_corto_clave)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_chacras_empresa_id
      ON chacras(empresa_id);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS registros_idempotencia_ter (
        clave VARCHAR(255) PRIMARY KEY,
        solicitud_hash VARCHAR(64) NOT NULL,
        respuesta_json TEXT NOT NULL,
        codigo_estado INTEGER NOT NULL,
        creado_en TIMESTAMPTZ NOT NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS registros_idempotencia_ter;`);
    await queryRunner.query(`DROP TABLE IF EXISTS chacras;`);
  }
}
