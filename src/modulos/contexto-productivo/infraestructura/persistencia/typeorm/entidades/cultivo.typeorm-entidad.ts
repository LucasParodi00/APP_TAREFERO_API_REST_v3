import { Column, Entity, PrimaryColumn } from 'typeorm';
import { EstadoCultivo } from '../../../../dominio/enumeraciones/estado-cultivo';

@Entity('cultivos')
export class CultivoTypeOrmEntidad {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  codigo!: string;

  @Column({ type: 'varchar', length: 150 })
  nombre!: string;

  @Column({
    name: 'nombre_normalizado',
    type: 'varchar',
    length: 150,
    unique: true,
  })
  nombreNormalizado!: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  descripcion!: string | null;

  @Column({ type: 'varchar', length: 20, default: EstadoCultivo.ACTIVO })
  estado!: EstadoCultivo;

  @Column({ type: 'integer', default: 1 })
  version!: number;

  @Column({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @Column({ name: 'fecha_actualizacion', type: 'timestamptz' })
  fechaActualizacion!: Date;
}
