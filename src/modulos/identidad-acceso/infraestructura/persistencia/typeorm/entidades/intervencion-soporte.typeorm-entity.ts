import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

@Entity('intervenciones_soporte')
@Index('ix_intervenciones_empresa_ocurrida', ['empresaId', 'ocurridaEn'])
export class IntervencionSoporteTypeOrmEntity {
    @PrimaryColumn('uuid')
    id!: string;

    @Column('uuid', { name: 'usuario_plataforma_id' })
    usuarioPlataformaId!: string;

    @Column('uuid', { name: 'empresa_id' })
    empresaId!: string;

    @Column('varchar', { name: 'motivo', length: 1000 })
    motivo!: string;

    @Column('uuid', { name: 'sesion_id' })
    sesionId!: string;

    @Column('varchar', { name: 'solicitud_id', length: 64 })
    solicitudId!: string;

    @Column('timestamptz', { name: 'ocurrida_en' })
    ocurridaEn!: Date;

    @Column('timestamptz', { name: 'vence_en' })
    venceEn!: Date;
}
