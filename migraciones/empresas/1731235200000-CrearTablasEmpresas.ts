import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CrearTablasEmpresas1731235200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'empresas',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'nombre',
            type: 'varchar',
            length: '120',
            isNullable: false,
          },
          {
            name: 'alias',
            type: 'varchar',
            length: '63',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'cuit',
            type: 'varchar',
            length: '11',
            isNullable: true,
          },
          {
            name: 'responsable_nombre',
            type: 'varchar',
            length: '120',
            isNullable: true,
          },
          {
            name: 'ubicacion_texto',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'ubicacion_latitud',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'ubicacion_longitud',
            type: 'double precision',
            isNullable: true,
          },
          {
            name: 'descripcion_actividad',
            type: 'varchar',
            length: '2000',
            isNullable: true,
          },
          {
            name: 'estado',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'creado_en',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'creado_por',
            type: 'varchar',
            length: '120',
            isNullable: false,
          },
          {
            name: 'actualizado_en',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'actualizado_por',
            type: 'varchar',
            length: '120',
            isNullable: false,
          },
          {
            name: 'version',
            type: 'integer',
            default: 1,
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'empresas',
      new TableIndex({
        name: 'uq_empresas_alias',
        columnNames: ['alias'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'empresas',
      new TableIndex({
        name: 'ix_empresas_estado_nombre',
        columnNames: ['estado', 'nombre'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'configuracion_general_empresas',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'empresa_id',
            type: 'uuid',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'pais_referencia',
            type: 'varchar',
            length: '2',
            isNullable: false,
          },
          {
            name: 'zona_horaria',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'moneda_principal',
            type: 'varchar',
            length: '3',
            isNullable: false,
          },
          {
            name: 'creado_en',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'creado_por',
            type: 'varchar',
            length: '120',
            isNullable: false,
          },
          {
            name: 'actualizado_en',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'actualizado_por',
            type: 'varchar',
            length: '120',
            isNullable: false,
          },
          {
            name: 'version',
            type: 'integer',
            default: 1,
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'configuracion_general_empresas',
      new TableForeignKey({
        name: 'fk_configuracion_general_empresas_empresa',
        columnNames: ['empresa_id'],
        referencedTableName: 'empresas',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('configuracion_general_empresas', true);
    await queryRunner.dropTable('empresas', true);
  }
}
