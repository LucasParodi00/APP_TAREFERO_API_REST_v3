import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearTablasContextoProductivo1731185000000 implements MigrationInterface {
  name = 'CrearTablasContextoProductivo1731185000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS cultivos (
        id UUID PRIMARY KEY,
        codigo VARCHAR(50) NOT NULL,
        nombre VARCHAR(150) NOT NULL,
        nombre_normalizado VARCHAR(150) NOT NULL,
        descripcion VARCHAR(1000),
        estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
        version INTEGER NOT NULL DEFAULT 1,
        fecha_creacion TIMESTAMPTZ NOT NULL,
        fecha_actualizacion TIMESTAMPTZ NOT NULL,
        CONSTRAINT uq_cultivos_codigo UNIQUE (codigo),
        CONSTRAINT uq_cultivos_nombre_normalizado UNIQUE (nombre_normalizado)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS variedades (
        id UUID PRIMARY KEY,
        cultivo_id UUID NOT NULL,
        codigo VARCHAR(50) NOT NULL,
        nombre VARCHAR(150) NOT NULL,
        nombre_normalizado VARCHAR(150) NOT NULL,
        descripcion VARCHAR(1000),
        estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
        version INTEGER NOT NULL DEFAULT 1,
        fecha_creacion TIMESTAMPTZ NOT NULL,
        fecha_actualizacion TIMESTAMPTZ NOT NULL,
        CONSTRAINT fk_variedades_cultivo FOREIGN KEY (cultivo_id) REFERENCES cultivos(id) ON DELETE RESTRICT,
        CONSTRAINT uq_variedades_cultivo_codigo UNIQUE (cultivo_id, codigo),
        CONSTRAINT uq_variedades_cultivo_nombre_normalizado UNIQUE (cultivo_id, nombre_normalizado)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_variedades_cultivo_id
      ON variedades(cultivo_id);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS perfiles_cultivo (
        id UUID PRIMARY KEY,
        cultivo_id UUID NOT NULL,
        alcance VARCHAR(20) NOT NULL,
        empresa_id UUID,
        lote_id UUID,
        perfil_padre_id UUID,
        nombre VARCHAR(150) NOT NULL,
        descripcion VARCHAR(1000),
        version INTEGER NOT NULL DEFAULT 1,
        estado VARCHAR(20) NOT NULL DEFAULT 'BORRADOR',
        campos JSONB NOT NULL DEFAULT '[]'::jsonb,
        fecha_creacion TIMESTAMPTZ NOT NULL,
        fecha_actualizacion TIMESTAMPTZ NOT NULL,
        CONSTRAINT fk_perfiles_cultivo FOREIGN KEY (cultivo_id) REFERENCES cultivos(id) ON DELETE RESTRICT,
        CONSTRAINT fk_perfiles_padre FOREIGN KEY (perfil_padre_id) REFERENCES perfiles_cultivo(id) ON DELETE RESTRICT
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_perfiles_cultivo_id
      ON perfiles_cultivo(cultivo_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_perfiles_empresa_id
      ON perfiles_cultivo(empresa_id);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS cultivos_habilitados_empresa (
        id UUID PRIMARY KEY,
        empresa_id UUID NOT NULL,
        cultivo_id UUID NOT NULL,
        habilitado BOOLEAN NOT NULL DEFAULT true,
        fecha_creacion TIMESTAMPTZ NOT NULL,
        CONSTRAINT fk_habilitacion_cultivo FOREIGN KEY (cultivo_id) REFERENCES cultivos(id) ON DELETE CASCADE,
        CONSTRAINT uq_empresa_cultivo UNIQUE (empresa_id, cultivo_id)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS registros_idempotencia_cul (
        clave VARCHAR(255) PRIMARY KEY,
        solicitud_hash VARCHAR(64) NOT NULL,
        respuesta_json TEXT NOT NULL,
        codigo_estado INTEGER NOT NULL,
        creado_en TIMESTAMPTZ NOT NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS registros_idempotencia_cul;`);
    await queryRunner.query(`DROP TABLE IF EXISTS cultivos_habilitados_empresa;`);
    await queryRunner.query(`DROP TABLE IF EXISTS perfiles_cultivo;`);
    await queryRunner.query(`DROP TABLE IF EXISTS variedades;`);
    await queryRunner.query(`DROP TABLE IF EXISTS cultivos;`);
  }
}
