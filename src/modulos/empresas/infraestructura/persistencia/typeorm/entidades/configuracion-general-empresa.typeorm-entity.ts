import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';
import type { EmpresaTypeOrmEntity } from './empresa.typeorm-entity';

@Entity('configuracion_general_empresas')
export class ConfiguracionGeneralEmpresaTypeOrmEntity {
    @PrimaryColumn('uuid')
    id!: string;

    @Column('uuid', { name: 'empresa_id', unique: true })
    empresaId!: string;

    @OneToOne('EmpresaTypeOrmEntity', 'configuracionGeneral', {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'empresa_id' })
    empresa?: EmpresaTypeOrmEntity;

    @Column('varchar', { name: 'pais_referencia', length: 2 })
    paisReferencia!: string;

    @Column('varchar', { name: 'zona_horaria', length: 255 })
    zonaHoraria!: string;

    @Column('varchar', { name: 'moneda_principal', length: 3 })
    monedaPrincipal!: string;

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
