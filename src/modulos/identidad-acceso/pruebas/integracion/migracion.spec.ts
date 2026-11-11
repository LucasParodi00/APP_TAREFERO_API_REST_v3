import { QueryRunner, Table } from 'typeorm';
import { CrearTablasIdentidadAcceso1731321600000 } from '../../../../../migraciones/identidad-acceso/1731321600000-CrearTablasIdentidadAcceso';

describe('T10 — Migración Inicial SQL de Identidad y Acceso (ACC)', () => {
    let migracion: CrearTablasIdentidadAcceso1731321600000;
    let queryRunner: jest.Mocked<QueryRunner>;

    beforeEach(() => {
        migracion = new CrearTablasIdentidadAcceso1731321600000();
        queryRunner = {
            createTable: jest.fn().mockResolvedValue(undefined),
            createIndex: jest.fn().mockResolvedValue(undefined),
            createForeignKey: jest.fn().mockResolvedValue(undefined),
            dropTable: jest.fn().mockResolvedValue(undefined),
            query: jest.fn().mockResolvedValue([]),
        } as unknown as jest.Mocked<QueryRunner>;
    });

    it('ejecuta UP creando las 5 tablas, índices y claves foráneas requeridas', async () => {
        await migracion.up(queryRunner);

        // Verifica creación de tablas
        expect(queryRunner.createTable.mock.calls.length).toBe(5);
        const nombresTablas = queryRunner.createTable.mock.calls.map((c) => (c[0] instanceof Table ? c[0].name : ''));
        expect(nombresTablas).toEqual([
            'cuentas_empresa',
            'roles_cuenta',
            'sesiones_empresa',
            'usuarios_plataforma',
            'intervenciones_soporte',
        ]);

        // Verifica creación de índices
        expect(queryRunner.createIndex.mock.calls.length).toBe(6);

        // Verifica creación del índice único parcial para empleadoId (ACC-BR-015, ADR-0010)
        expect(queryRunner.query.mock.calls.length).toBe(1);
        const sqlIndiceParcial = String(queryRunner.query.mock.calls[0][0]);
        expect(sqlIndiceParcial).toContain('CREATE UNIQUE INDEX uq_cuentas_empresa_empleado');
        expect(sqlIndiceParcial).toContain('WHERE empleado_id IS NOT NULL');

        // Verifica claves foráneas
        expect(queryRunner.createForeignKey.mock.calls.length).toBe(3);
    });

    it('ejecuta DOWN eliminando las tablas en orden inverso respetando integridad referencial', async () => {
        await migracion.down(queryRunner);

        expect(queryRunner.dropTable.mock.calls.length).toBe(5);
        const tablasEliminadas = queryRunner.dropTable.mock.calls.map((c) => (typeof c[0] === 'string' ? c[0] : c[0].name));
        expect(tablasEliminadas).toEqual([
            'intervenciones_soporte',
            'usuarios_plataforma',
            'sesiones_empresa',
            'roles_cuenta',
            'cuentas_empresa',
        ]);

        expect(queryRunner.query.mock.calls.length).toBe(1);
        const dropIndice = String(queryRunner.query.mock.calls[0][0]);
        expect(dropIndice).toContain('DROP INDEX IF EXISTS uq_cuentas_empresa_empleado');
    });
});
