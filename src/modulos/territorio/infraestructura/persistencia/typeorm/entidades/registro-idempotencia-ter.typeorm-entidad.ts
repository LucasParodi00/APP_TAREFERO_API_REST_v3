import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('registros_idempotencia_ter')
export class RegistroIdempotenciaTerTypeOrmEntidad {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  clave!: string;

  @Column({ type: 'varchar', length: 64, name: 'solicitud_hash' })
  solicitudHash!: string;

  @Column({ type: 'text', name: 'respuesta_json' })
  respuestaJson!: string;

  @Column({ type: 'integer', name: 'codigo_estado' })
  codigoEstado!: number;

  @Column({ type: 'timestamptz', name: 'creado_en' })
  creadoEn!: Date;
}
