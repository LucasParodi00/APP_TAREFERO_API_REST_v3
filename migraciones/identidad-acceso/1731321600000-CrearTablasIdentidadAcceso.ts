import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CrearTablasIdentidadAcceso1731321600000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Tabla cuentas_empresa
        await queryRunner.createTable(
            new Table({
                name: 'cuentas_empresa',
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
                        name: 'empleado_id',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        name: 'nombre_mostrado',
                        type: 'varchar',
                        length: '150',
                        isNullable: true,
                    },
                    {
                        name: 'correo_acceso',
                        type: 'varchar',
                        length: '254',
                        isNullable: false,
                    },
                    {
                        name: 'contrasenia_hash',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'acceso_web',
                        type: 'boolean',
                        default: false,
                        isNullable: false,
                    },
                    {
                        name: 'acceso_movil',
                        type: 'boolean',
                        default: false,
                        isNullable: false,
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
            'cuentas_empresa',
            new TableIndex({
                name: 'uq_cuentas_empresa_correo',
                columnNames: ['empresa_id', 'correo_acceso'],
                isUnique: true,
            }),
        );

        await queryRunner.createIndex(
            'cuentas_empresa',
            new TableIndex({
                name: 'ix_cuentas_empresa_estado',
                columnNames: ['empresa_id', 'estado'],
            }),
        );

        // Unicidad parcial para empleadoId no nulo por empresa (ACC-BR-015, ADR-0010)
        await queryRunner.query(
            'CREATE UNIQUE INDEX uq_cuentas_empresa_empleado ON cuentas_empresa (empresa_id, empleado_id) WHERE empleado_id IS NOT NULL;',
        );

        // 2. Tabla roles_cuenta
        await queryRunner.createTable(
            new Table({
                name: 'roles_cuenta',
                columns: [
                    {
                        name: 'cuenta_empresa_id',
                        type: 'uuid',
                        isPrimary: true,
                    },
                    {
                        name: 'rol',
                        type: 'varchar',
                        length: '30',
                        isPrimary: true,
                    },
                ],
            }),
            true,
        );

        await queryRunner.createForeignKey(
            'roles_cuenta',
            new TableForeignKey({
                name: 'fk_roles_cuenta_cuenta',
                columnNames: ['cuenta_empresa_id'],
                referencedTableName: 'cuentas_empresa',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );

        // 3. Tabla sesiones_empresa
        await queryRunner.createTable(
            new Table({
                name: 'sesiones_empresa',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                    },
                    {
                        name: 'cuenta_empresa_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'empresa_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'canal',
                        type: 'varchar',
                        length: '20',
                        isNullable: false,
                    },
                    {
                        name: 'hash_token_renovacion',
                        type: 'varchar',
                        length: '64',
                        isNullable: false,
                    },
                    {
                        name: 'familia_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'rotaciones',
                        type: 'integer',
                        default: 0,
                        isNullable: false,
                    },
                    {
                        name: 'creada_en',
                        type: 'timestamptz',
                        isNullable: false,
                    },
                    {
                        name: 'vence_en',
                        type: 'timestamptz',
                        isNullable: false,
                    },
                    {
                        name: 'revocada_en',
                        type: 'timestamptz',
                        isNullable: true,
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
            'sesiones_empresa',
            new TableForeignKey({
                name: 'fk_sesiones_empresa_cuenta',
                columnNames: ['cuenta_empresa_id'],
                referencedTableName: 'cuentas_empresa',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createIndex(
            'sesiones_empresa',
            new TableIndex({
                name: 'ix_sesiones_hash_token_renovacion',
                columnNames: ['hash_token_renovacion'],
            }),
        );

        await queryRunner.createIndex(
            'sesiones_empresa',
            new TableIndex({
                name: 'ix_sesiones_familia_id',
                columnNames: ['familia_id'],
            }),
        );

        await queryRunner.createIndex(
            'sesiones_empresa',
            new TableIndex({
                name: 'ix_sesiones_cuenta_id',
                columnNames: ['cuenta_empresa_id'],
            }),
        );

        // 4. Tabla usuarios_plataforma
        await queryRunner.createTable(
            new Table({
                name: 'usuarios_plataforma',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                    },
                    {
                        name: 'correo',
                        type: 'varchar',
                        length: '254',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'contrasenia_hash',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'nombre_mostrado',
                        type: 'varchar',
                        length: '150',
                        isNullable: false,
                    },
                    {
                        name: 'rol',
                        type: 'varchar',
                        length: '30',
                        isNullable: false,
                    },
                    {
                        name: 'activo',
                        type: 'boolean',
                        default: true,
                        isNullable: false,
                    },
                    {
                        name: 'creado_en',
                        type: 'timestamptz',
                        default: 'CURRENT_TIMESTAMP',
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

        // 5. Tabla intervenciones_soporte
        await queryRunner.createTable(
            new Table({
                name: 'intervenciones_soporte',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                    },
                    {
                        name: 'usuario_plataforma_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'empresa_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'motivo',
                        type: 'varchar',
                        length: '1000',
                        isNullable: false,
                    },
                    {
                        name: 'sesion_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'solicitud_id',
                        type: 'varchar',
                        length: '64',
                        isNullable: false,
                    },
                    {
                        name: 'ocurrida_en',
                        type: 'timestamptz',
                        isNullable: false,
                    },
                    {
                        name: 'vence_en',
                        type: 'timestamptz',
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        await queryRunner.createForeignKey(
            'intervenciones_soporte',
            new TableForeignKey({
                name: 'fk_intervenciones_soporte_usuario',
                columnNames: ['usuario_plataforma_id'],
                referencedTableName: 'usuarios_plataforma',
                referencedColumnNames: ['id'],
                onDelete: 'RESTRICT',
            }),
        );

        await queryRunner.createIndex(
            'intervenciones_soporte',
            new TableIndex({
                name: 'ix_intervenciones_empresa_ocurrida',
                columnNames: ['empresa_id', 'ocurrida_en'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('intervenciones_soporte', true);
        await queryRunner.dropTable('usuarios_plataforma', true);
        await queryRunner.dropTable('sesiones_empresa', true);
        await queryRunner.dropTable('roles_cuenta', true);
        await queryRunner.query('DROP INDEX IF EXISTS uq_cuentas_empresa_empleado;');
        await queryRunner.dropTable('cuentas_empresa', true);
    }
}
