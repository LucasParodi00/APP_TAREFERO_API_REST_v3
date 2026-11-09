import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('registros_idempotencia_cul')
export class RegistroIdempotenciaCulTypeOrmEntidad {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  clave!: string;

  @Column({ name: 'solicitud_hash', type: 'varchar', length: 64 })
  solicitudHash!: string;

  @Column({ name: 'respuesta_json', type: 'text' })
  respuestaJson!: string;

  @Column({ name: 'codigo_estado', type: 'integer' })
  codigoEstado!: number;

  @Column({ name: 'creado_en', type: 'timestamptz' })
  creadoEn!: Date;
}
