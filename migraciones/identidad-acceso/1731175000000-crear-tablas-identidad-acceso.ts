import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrearTablasIdentidadAcceso1731175000000
  implements MigrationInterface
{
  name = 'CrearTablasIdentidadAcceso1731175000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS usuarios_plataforma (
        id UUID PRIMARY KEY,
        rol VARCHAR(50) NOT NULL DEFAULT 'SUPER_ADMINISTRADOR',
        activo BOOLEAN NOT NULL DEFAULT true,
        creado_en TIMESTAMPTZ NOT NULL
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS intervenciones_soporte (
        id UUID PRIMARY KEY,
        usuario_plataforma_id UUID NOT NULL,
        empresa_id UUID NOT NULL,
        motivo VARCHAR(1000) NOT NULL,
        sesion_id VARCHAR(120) NOT NULL,
        solicitud_id UUID NOT NULL,
        ocurrida_en TIMESTAMPTZ NOT NULL,
        CONSTRAINT fk_intervenciones_soporte_usuario FOREIGN KEY (usuario_plataforma_id) REFERENCES usuarios_plataforma(id) ON DELETE RESTRICT,
        CONSTRAINT fk_intervenciones_soporte_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS ix_intervenciones_soporte_empresa_ocurrida
      ON intervenciones_soporte(empresa_id, ocurrida_en DESC);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS registros_idempotencia_acc (
        clave VARCHAR(255) PRIMARY KEY,
        solicitud_hash VARCHAR(64) NOT NULL,
        respuesta_json TEXT NOT NULL,
        codigo_estado INTEGER NOT NULL,
        creado_en TIMESTAMPTZ NOT NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS registros_idempotencia_acc;`);
    await queryRunner.query(`DROP TABLE IF EXISTS intervenciones_soporte;`);
    await queryRunner.query(`DROP TABLE IF EXISTS usuarios_plataforma;`);
  }
}
