import { Entity, PrimaryColumn, Column, OneToOne, Index, CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';
import { ConfiguracionGeneralEmpresaTypeOrmEntity } from './configuracion-general-empresa.typeorm-entity';

@Entity('empresas')
@Index('uq_empresas_alias', ['alias'], { unique: true })
@Index('ix_empresas_estado_nombre', ['estado', 'nombre'])
export class EmpresaTypeOrmEntity {
    @PrimaryColumn('uuid')
    id!: string;

    @Column('varchar', { name: 'nombre', length: 120 })
    nombre!: string;

    @Column('varchar', { name: 'alias', length: 63, unique: true })
    alias!: string;

    @Column('varchar', { name: 'cuit', length: 11, nullable: true })
    cuit!: string | null;

    @Column('varchar', {
        name: 'responsable_nombre',
        length: 120,
        nullable: true,
    })
    responsableNombre!: string | null;

    @Column('varchar', { name: 'ubicacion_texto', length: 500, nullable: true })
    ubicacionTexto!: string | null;

    @Column('double precision', { name: 'ubicacion_latitud', nullable: true })
    ubicacionLatitud!: number | null;

    @Column('double precision', { name: 'ubicacion_longitud', nullable: true })
    ubicacionLongitud!: number | null;

    @Column('varchar', {
        name: 'descripcion_actividad',
        length: 2000,
        nullable: true,
    })
    descripcionActividad!: string | null;

    @Column('varchar', { name: 'estado', length: 20 })
    estado!: string;

    @OneToOne(() => ConfiguracionGeneralEmpresaTypeOrmEntity, (cfg) => cfg.empresa, {
        cascade: true,
        eager: true,
    })
    configuracionGeneral!: ConfiguracionGeneralEmpresaTypeOrmEntity;

    @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
    creadoEn!: Date;

    @Column('varchar', { name: 'creado_por', length: 120 })
    creadoPor!: string;

    @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
    actualizadoEn!: Date;

    @Column('varchar', { name: 'actualizado_por', length: 120 })
    actualizadoPor!: string;

    @VersionColumn({ name: 'version' })
    version!: number;
}
