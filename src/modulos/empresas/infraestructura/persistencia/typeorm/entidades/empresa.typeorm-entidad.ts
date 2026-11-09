import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ConfiguracionGeneralTypeOrmEntidad } from './configuracion-general.typeorm-entidad';

@Entity('empresas')
export class EmpresaTypeOrmEntidad {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  nombre!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 63, unique: true })
  alias!: string;

  @Column({ type: 'varchar', length: 11, nullable: true })
  cuit!: string | null;

  @Column({
    name: 'responsable_nombre',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  responsableNombre!: string | null;

  @Column({
    name: 'ubicacion_texto',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  ubicacionTexto!: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 7, nullable: true })
  latitud!: number | null;

  @Column({ type: 'numeric', precision: 10, scale: 7, nullable: true })
  longitud!: number | null;

  @Column({
    name: 'descripcion_actividad',
    type: 'varchar',
    length: 2000,
    nullable: true,
  })
  descripcionActividad!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVA' })
  estado!: string;

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

  @OneToOne(() => ConfiguracionGeneralTypeOrmEntidad)
  @JoinColumn({ name: 'id', referencedColumnName: 'empresaId' })
  configuracion!: ConfiguracionGeneralTypeOrmEntidad;
}
