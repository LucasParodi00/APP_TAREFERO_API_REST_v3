import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity('sesiones_empresa')
@Index('ix_sesiones_empresa_cuenta', ['cuentaEmpresaId'])
@Index('ix_sesiones_empresa_token_hash', ['tokenRenovacionHash'])
export class SesionEmpresaTypeOrmEntidad {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'empresa_id' })
  empresaId!: string;

  @Column('uuid', { name: 'cuenta_empresa_id' })
  cuentaEmpresaId!: string;

  @Column('varchar', { length: 10 })
  canal!: string;

  @Column('varchar', { name: 'token_renovacion_hash', length: 128 })
  tokenRenovacionHash!: string;

  @Column('timestamptz', { name: 'creada_en' })
  creadaEn!: Date;

  @Column('timestamptz', { name: 'vence_en' })
  venceEn!: Date;

  @Column('timestamptz', { name: 'revocada_en', nullable: true })
  revocadaEn!: Date | null;

  @Column('varchar', { name: 'revocada_por', length: 100, nullable: true })
  revocadaPor!: string | null;

  @Column('varchar', { name: 'motivo_revocacion', length: 255, nullable: true })
  motivoRevocacion!: string | null;
}
