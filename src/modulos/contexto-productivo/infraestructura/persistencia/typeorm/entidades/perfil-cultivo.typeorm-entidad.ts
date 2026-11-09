import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AlcancePerfil } from '../../../../dominio/enumeraciones/alcance-perfil';
import { EstadoPerfil } from '../../../../dominio/enumeraciones/estado-perfil';
import { CultivoTypeOrmEntidad } from './cultivo.typeorm-entidad';

@Entity('perfiles_cultivo')
export class PerfilCultivoTypeOrmEntidad {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ name: 'cultivo_id', type: 'uuid' })
  cultivoId!: string;

  @ManyToOne(() => CultivoTypeOrmEntidad, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cultivo_id' })
  cultivo?: CultivoTypeOrmEntidad;

  @Column({ type: 'varchar', length: 20 })
  alcance!: AlcancePerfil;

  @Column({ name: 'empresa_id', type: 'uuid', nullable: true })
  empresaId!: string | null;

  @Column({ name: 'lote_id', type: 'uuid', nullable: true })
  loteId!: string | null;

  @Column({ name: 'perfil_padre_id', type: 'uuid', nullable: true })
  perfilPadreId!: string | null;

  @ManyToOne(() => PerfilCultivoTypeOrmEntidad, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn({ name: 'perfil_padre_id' })
  perfilPadre?: PerfilCultivoTypeOrmEntidad;

  @Column({ type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  descripcion!: string | null;

  @Column({ type: 'integer', default: 1 })
  version!: number;

  @Column({ type: 'varchar', length: 20, default: EstadoPerfil.BORRADOR })
  estado!: EstadoPerfil;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  campos!: Record<string, unknown>[];

  @Column({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @Column({ name: 'fecha_actualizacion', type: 'timestamptz' })
  fechaActualizacion!: Date;
}
