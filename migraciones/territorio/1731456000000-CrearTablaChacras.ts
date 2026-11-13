import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CrearTablaChacras1731456000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'chacras',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                    },
                    {
                        name: 'empresa_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'nombre',
                        type: 'varchar',
                        length: '150',
                        isNullable: false,
                    },
                    {
                        name: 'nombre_corto',
                        type: 'varchar',
                        length: '50',
                        isNullable: false,
                    },
                    {
                        name: 'nombre_corto_normalizado',
                        type: 'varchar',
                        length: '50',
                        isNullable: false,
                    },
                    {
                        name: 'responsable_nombre',
                        type: 'varchar',
                        length: '150',
                        isNullable: true,
                    },
                    {
                        name: 'direccion',
                        type: 'varchar',
                        length: '500',
                        isNullable: true,
                    },
                    {
                        name: 'punto_geografico_latitud',
                        type: 'double precision',
                        isNullable: true,
                    },
                    {
                        name: 'punto_geografico_longitud',
                        type: 'double precision',
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
                        default: 'now()',
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
                        default: 'now()',
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
            'chacras',
            new TableIndex({
                name: 'uq_chacras_empresa_nombre_corto_normalizado',
                columnNames: ['empresa_id', 'nombre_corto_normalizado'],
                isUnique: true,
            }),
        );

        await queryRunner.createIndex(
            'chacras',
            new TableIndex({
                name: 'ix_chacras_empresa_estado',
                columnNames: ['empresa_id', 'estado'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('chacras', true);
    }
}
