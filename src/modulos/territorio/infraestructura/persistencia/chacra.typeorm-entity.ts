import { Entity, PrimaryColumn, Column, Index, CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

@Entity('chacras')
@Index('uq_chacras_empresa_nombre_corto_normalizado', ['empresaId', 'nombreCortoNormalizado'], { unique: true })
@Index('ix_chacras_empresa_estado', ['empresaId', 'estado'])
export class ChacraTypeOrmEntity {
    @PrimaryColumn('uuid')
    id!: string;

    @Column('uuid', { name: 'empresa_id' })
    empresaId!: string;

    @Column('varchar', { name: 'nombre', length: 150 })
    nombre!: string;

    @Column('varchar', { name: 'nombre_corto', length: 50 })
    nombreCorto!: string;

    @Column('varchar', { name: 'nombre_corto_normalizado', length: 50 })
    nombreCortoNormalizado!: string;

    @Column('varchar', { name: 'responsable_nombre', length: 150, nullable: true })
    responsableNombre!: string | null;

    @Column('varchar', { name: 'direccion', length: 500, nullable: true })
    direccion!: string | null;

    @Column('double precision', { name: 'punto_geografico_latitud', nullable: true })
    puntoGeograficoLatitud!: number | null;

    @Column('double precision', { name: 'punto_geografico_longitud', nullable: true })
    puntoGeograficoLongitud!: number | null;

    @Column('varchar', { name: 'estado', length: 20 })
    estado!: string;

    @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
    creadoEn!: Date;

    @Column('varchar', { name: 'creado_por', length: 120 })
    creadoPor!: string;

    @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
    actualizadoEn!: Date;

    @Column('varchar', { name: 'actualizado_por', length: 120 })
    actualizadoPor!: string;

    @VersionColumn({ name: 'version', default: 1 })
    version!: number;
}
