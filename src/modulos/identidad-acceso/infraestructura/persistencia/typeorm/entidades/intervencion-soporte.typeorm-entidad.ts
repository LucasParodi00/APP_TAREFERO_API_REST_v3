import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('intervenciones_soporte')
export class IntervencionSoporteTypeOrmEntidad {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'usuario_plataforma_id' })
  usuarioPlataformaId!: string;

  @Column({ type: 'uuid', name: 'empresa_id' })
  empresaId!: string;

  @Column({ type: 'varchar', length: 1000 })
  motivo!: string;

  @Column({ type: 'varchar', length: 120, name: 'sesion_id' })
  sesionId!: string;

  @Column({ type: 'uuid', name: 'solicitud_id' })
  solicitudId!: string;

  @Column({ type: 'timestamptz', name: 'ocurrida_en' })
  ocurridaEn!: Date;
}
