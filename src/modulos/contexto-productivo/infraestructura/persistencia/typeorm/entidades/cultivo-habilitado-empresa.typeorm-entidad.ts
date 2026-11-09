import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('cultivos_habilitados_empresa')
export class CultivoHabilitadoEmpresaTypeOrmEntidad {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId!: string;

  @Column({ name: 'cultivo_id', type: 'uuid' })
  cultivoId!: string;

  @Column({ type: 'boolean', default: true })
  habilitado!: boolean;

  @Column({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;
}
