import { Entity, PrimaryColumn, Column, Index, CreateDateColumn, VersionColumn } from 'typeorm';

@Entity('usuarios_plataforma')
@Index('uq_usuarios_plataforma_correo', ['correo'], { unique: true })
export class UsuarioPlataformaTypeOrmEntity {
    @PrimaryColumn('uuid')
    id!: string;

    @Column('varchar', { name: 'correo', length: 254, unique: true })
    correo!: string;

    @Column('varchar', { name: 'contrasenia_hash', length: 255 })
    contraseniaHash!: string;

    @Column('varchar', { name: 'nombre_mostrado', length: 150 })
    nombreMostrado!: string;

    @Column('varchar', { name: 'rol', length: 30 })
    rol!: string;

    @Column('boolean', { name: 'activo', default: true })
    activo!: boolean;

    @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
    creadoEn!: Date;

    @VersionColumn({ name: 'version' })
    version!: number;
}
