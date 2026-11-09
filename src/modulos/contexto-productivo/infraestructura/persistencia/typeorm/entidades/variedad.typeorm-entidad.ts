import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EstadoVariedad } from '../../../../dominio/enumeraciones/estado-variedad';
import { CultivoTypeOrmEntidad } from './cultivo.typeorm-entidad';

@Entity('variedades')
export class VariedadTypeOrmEntidad {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ name: 'cultivo_id', type: 'uuid' })
  cultivoId!: string;

  @ManyToOne(() => CultivoTypeOrmEntidad, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cultivo_id' })
  cultivo?: CultivoTypeOrmEntidad;

  @Column({ type: 'varchar', length: 50 })
  codigo!: string;

  @Column({ type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ name: 'nombre_normalizado', type: 'varchar', length: 150 })
  nombreNormalizado!: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  descripcion!: string | null;

  @Column({ type: 'varchar', length: 20, default: EstadoVariedad.ACTIVA })
  estado!: EstadoVariedad;

  @Column({ type: 'integer', default: 1 })
  version!: number;

  @Column({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @Column({ name: 'fecha_actualizacion', type: 'timestamptz' })
  fechaActualizacion!: Date;
}
