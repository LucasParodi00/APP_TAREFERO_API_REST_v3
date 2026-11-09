import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity('cuentas_empresa')
@Index('ix_cuentas_empresa_empresa_id', ['empresaId', 'id'])
@Index('uq_cuentas_empresa_empresa_correo', ['empresaId', 'correoAcceso'], {
  unique: true,
})
@Index('uq_cuentas_empresa_empresa_persona', ['empresaId', 'personaId'], {
  unique: true,
})
export class CuentaEmpresaTypeOrmEntidad {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'empresa_id' })
  empresaId!: string;

  @Column('uuid', { name: 'persona_id' })
  personaId!: string;

  @Column('varchar', { name: 'correo_acceso', length: 254 })
  correoAcceso!: string;

  @Column('varchar', { name: 'hash_contrasenia', length: 255 })
  hashContrasenia!: string;

  @Column('boolean', { name: 'acceso_web', default: false })
  accesoWeb!: boolean;

  @Column('boolean', { name: 'acceso_movil', default: false })
  accesoMovil!: boolean;

  @Column('text')
  roles!: string;

  @Column('varchar', { length: 20, default: 'ACTIVA' })
  estado!: string;

  @Column('timestamptz', { name: 'creado_en' })
  creadoEn!: Date;

  @Column('varchar', { name: 'creado_por', length: 100 })
  creadoPor!: string;

  @Column('timestamptz', { name: 'actualizado_en' })
  actualizadoEn!: Date;

  @Column('varchar', { name: 'actualizado_por', length: 100 })
  actualizadoPor!: string;

  @Column('integer', { default: 1 })
  version!: number;
}
