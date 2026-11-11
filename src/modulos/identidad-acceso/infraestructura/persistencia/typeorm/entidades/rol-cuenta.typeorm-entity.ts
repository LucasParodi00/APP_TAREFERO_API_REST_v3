import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CuentaEmpresaTypeOrmEntity } from './cuenta-empresa.typeorm-entity';

@Entity('roles_cuenta')
export class RolCuentaTypeOrmEntity {
    @PrimaryColumn('uuid', { name: 'cuenta_empresa_id' })
    cuentaEmpresaId!: string;

    @PrimaryColumn('varchar', { name: 'rol', length: 30 })
    rol!: string;

    @ManyToOne(() => CuentaEmpresaTypeOrmEntity, (cuenta) => cuenta.roles, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'cuenta_empresa_id' })
    cuenta!: CuentaEmpresaTypeOrmEntity;
}
