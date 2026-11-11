import { Entity, PrimaryColumn, Column, Index, VersionColumn } from 'typeorm';

@Entity('sesiones_empresa')
@Index('ix_sesiones_hash_token_renovacion', ['hashTokenRenovacion'])
@Index('ix_sesiones_familia_id', ['familiaId'])
@Index('ix_sesiones_cuenta_id', ['cuentaEmpresaId'])
export class SesionEmpresaTypeOrmEntity {
    @PrimaryColumn('uuid')
    id!: string;

    @Column('uuid', { name: 'cuenta_empresa_id' })
    cuentaEmpresaId!: string;

    @Column('uuid', { name: 'empresa_id' })
    empresaId!: string;

    @Column('varchar', { name: 'canal', length: 20 })
    canal!: string;

    @Column('varchar', { name: 'hash_token_renovacion', length: 64 })
    hashTokenRenovacion!: string;

    @Column('uuid', { name: 'familia_id' })
    familiaId!: string;

    @Column('integer', { name: 'rotaciones', default: 0 })
    rotaciones!: number;

    @Column('timestamptz', { name: 'creada_en' })
    creadaEn!: Date;

    @Column('timestamptz', { name: 'vence_en' })
    venceEn!: Date;

    @Column('timestamptz', { name: 'revocada_en', nullable: true })
    revocadaEn!: Date | null;

    @VersionColumn({ name: 'version' })
    version!: number;
}
