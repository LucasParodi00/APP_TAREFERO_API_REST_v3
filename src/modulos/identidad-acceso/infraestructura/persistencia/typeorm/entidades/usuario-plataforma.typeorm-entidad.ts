import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('usuarios_plataforma')
export class UsuarioPlataformaTypeOrmEntidad {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, default: 'SUPER_ADMINISTRADOR' })
  rol!: string;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @Column({ type: 'timestamptz', name: 'creado_en' })
  creadoEn!: Date;
}
