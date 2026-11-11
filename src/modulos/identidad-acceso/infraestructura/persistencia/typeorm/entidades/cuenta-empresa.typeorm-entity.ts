import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, VersionColumn, Index, OneToMany } from 'typeorm';
import { RolCuentaTypeOrmEntity } from './rol-cuenta.typeorm-entity';

@Entity('cuentas_empresa')
@Index('uq_cuentas_empresa_correo', ['empresaId', 'correoAcceso'], { unique: true })
@Index('ix_cuentas_empresa_estado', ['empresaId', 'estado'])
export class CuentaEmpresaTypeOrmEntity {
    @PrimaryColumn('uuid')
    id!: string;

    @Column('uuid', { name: 'empresa_id' })
    empresaId!: string;

    @Column('uuid', { name: 'empleado_id', nullable: true })
    empleadoId!: string | null;

    @Column('varchar', { name: 'nombre_mostrado', length: 150, nullable: true })
    nombreMostrado!: string | null;

    @Column('varchar', { name: 'correo_acceso', length: 254 })
    correoAcceso!: string;

    @Column('varchar', { name: 'contrasenia_hash', length: 255 })
    contraseniaHash!: string;

    @Column('boolean', { name: 'acceso_web', default: false })
    accesoWeb!: boolean;

    @Column('boolean', { name: 'acceso_movil', default: false })
    accesoMovil!: boolean;

    @Column('varchar', { name: 'estado', length: 20 })
    estado!: string;

    @OneToMany(() => RolCuentaTypeOrmEntity, (rol) => rol.cuenta, {
        cascade: true,
        eager: true,
    })
    roles!: RolCuentaTypeOrmEntity[];

    @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
    creadoEn!: Date;

    @Column('varchar', { name: 'creado_por', length: 120 })
    creadoPor!: string;

    @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
    actualizadoEn!: Date;

    @Column('varchar', { name: 'actualizado_por', length: 120 })
    actualizadoPor!: string;

    @VersionColumn({ name: 'version' })
    version!: number;
}
