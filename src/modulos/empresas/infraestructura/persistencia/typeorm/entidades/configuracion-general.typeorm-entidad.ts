import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

@Entity('configuraciones_empresa')
export class ConfiguracionGeneralTypeOrmEntidad {
  @PrimaryColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'empresa_id', type: 'uuid', unique: true })
  empresaId!: string;

  @Column({
    name: 'pais_referencia',
    type: 'varchar',
    length: 2,
    default: 'AR',
  })
  paisReferencia!: string;

  @Column({
    name: 'zona_horaria',
    type: 'varchar',
    length: 255,
    default: 'America/Argentina/Buenos_Aires',
  })
  zonaHoraria!: string;

  @Column({
    name: 'moneda_principal',
    type: 'varchar',
    length: 3,
    default: 'ARS',
  })
  monedaPrincipal!: string;

  @Column({ name: 'creado_en', type: 'timestamptz' })
  creadoEn!: Date;

  @Column({ name: 'creado_por', type: 'varchar', length: 120 })
  creadoPor!: string;

  @Column({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn!: Date;

  @Column({ name: 'actualizado_por', type: 'varchar', length: 120 })
  actualizadoPor!: string;

  @Column({ type: 'integer', default: 1 })
  version!: number;
}
