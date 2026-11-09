import { Entity, Column, PrimaryColumn, Unique, Index } from 'typeorm';

@Entity('chacras')
@Unique('uq_chacras_empresa_nombre_corto', ['empresaId', 'nombreCortoClave'])
export class ChacraTypeOrmEntidad {
  @PrimaryColumn('uuid')
  id!: string;

  @Index('ix_chacras_empresa_id')
  @Column({ type: 'uuid', name: 'empresa_id' })
  empresaId!: string;

  @Column({ type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ type: 'varchar', length: 50, name: 'nombre_corto' })
  nombreCorto!: string;

  @Column({ type: 'varchar', length: 60, name: 'nombre_corto_clave' })
  nombreCortoClave!: string;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
    name: 'responsable_nombre',
  })
  responsableNombre!: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'direccion_texto',
  })
  direccionTexto!: string | null;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 7,
    nullable: true,
    transformer: {
      to: (value?: number | null) =>
        value !== null && value !== undefined ? String(value) : null,
      from: (value?: string | null) =>
        value !== null && value !== undefined ? parseFloat(value) : null,
    },
  })
  latitud!: number | null;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 7,
    nullable: true,
    transformer: {
      to: (value?: number | null) =>
        value !== null && value !== undefined ? String(value) : null,
      from: (value?: string | null) =>
        value !== null && value !== undefined ? parseFloat(value) : null,
    },
  })
  longitud!: number | null;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVA' })
  estado!: string;

  @Column({ type: 'integer', default: 1 })
  version!: number;

  @Column({ type: 'timestamptz', name: 'creado_en' })
  creadoEn!: Date;

  @Column({ type: 'varchar', length: 120, name: 'creado_por' })
  creadoPor!: string;

  @Column({ type: 'timestamptz', name: 'actualizado_en' })
  actualizadoEn!: Date;

  @Column({ type: 'varchar', length: 120, name: 'actualizado_por' })
  actualizadoPor!: string;
}
