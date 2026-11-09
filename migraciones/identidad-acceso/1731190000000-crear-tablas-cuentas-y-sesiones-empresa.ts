import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearTablasCuentasYSesionesEmpresa1731190000000
  implements MigrationInterface
{
  name = 'CrearTablasCuentasYSesionesEmpresa1731190000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS cuentas_empresa (
        id UUID PRIMARY KEY,
        empresa_id UUID NOT NULL,
        persona_id UUID NOT NULL,
        correo_acceso VARCHAR(254) NOT NULL,
        hash_contrasenia VARCHAR(255) NOT NULL,
        acceso_web BOOLEAN NOT NULL DEFAULT false,
        acceso_movil BOOLEAN NOT NULL DEFAULT false,
        roles TEXT NOT NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
        creado_en TIMESTAMPTZ NOT NULL,
        creado_por VARCHAR(100) NOT NULL,
        actualizado_en TIMESTAMPTZ NOT NULL,
        actualizado_por VARCHAR(100) NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        CONSTRAINT fk_cuentas_empresa_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
        CONSTRAINT uq_cuentas_empresa_empresa_correo UNIQUE (empresa_id, correo_acceso),
        CONSTRAINT uq_cuentas_empresa_empresa_persona UNIQUE (empresa_id, persona_id)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_cuentas_empresa_empresa_id
      ON cuentas_empresa(empresa_id, id);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS sesiones_empresa (
        id UUID PRIMARY KEY,
        empresa_id UUID NOT NULL,
        cuenta_empresa_id UUID NOT NULL,
        canal VARCHAR(10) NOT NULL,
        token_renovacion_hash VARCHAR(128) NOT NULL,
        creada_en TIMESTAMPTZ NOT NULL,
        vence_en TIMESTAMPTZ NOT NULL,
        revocada_en TIMESTAMPTZ NULL,
        revocada_por VARCHAR(100) NULL,
        motivo_revocacion VARCHAR(255) NULL,
        CONSTRAINT fk_sesiones_empresa_cuenta FOREIGN KEY (cuenta_empresa_id) REFERENCES cuentas_empresa(id) ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_sesiones_empresa_cuenta
      ON sesiones_empresa(cuenta_empresa_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_sesiones_empresa_token_hash
      ON sesiones_empresa(token_renovacion_hash);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS huellas_renovacion_sesion (
        id UUID PRIMARY KEY,
        sesion_id UUID NOT NULL,
        token_hash VARCHAR(128) NOT NULL,
        consumido_en TIMESTAMPTZ NOT NULL,
        CONSTRAINT fk_huellas_renovacion_sesion FOREIGN KEY (sesion_id) REFERENCES sesiones_empresa(id) ON DELETE CASCADE,
        CONSTRAINT uq_huellas_renovacion_token_hash UNIQUE (token_hash)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS huellas_renovacion_sesion;`);
    await queryRunner.query(`DROP TABLE IF EXISTS sesiones_empresa;`);
    await queryRunner.query(`DROP TABLE IF EXISTS cuentas_empresa;`);
  }
}
