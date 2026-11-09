import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity('huellas_renovacion_sesion')
@Index('ix_huellas_renovacion_token_hash', ['tokenHash'], { unique: true })
export class HuellaRenovacionTypeOrmEntidad {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'sesion_id' })
  sesionId!: string;

  @Column('varchar', { name: 'token_hash', length: 128 })
  tokenHash!: string;

  @Column('timestamptz', { name: 'consumido_en' })
  consumidoEn!: Date;
}
