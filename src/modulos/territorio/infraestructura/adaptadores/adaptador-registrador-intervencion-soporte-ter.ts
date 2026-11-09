import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import {
  DatosIntervencionSoporteTer,
  RegistradorIntervencionSoporteTer,
} from '../../aplicacion/puertos/salida/registrador-intervencion-soporte.puerto';

export class AdaptadorRegistradorIntervencionSoporteTer implements RegistradorIntervencionSoporteTer {
  constructor(private readonly dataSource: DataSource) {}

  public async registrar(datos: DatosIntervencionSoporteTer): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO intervenciones_soporte (id, usuario_plataforma_id, empresa_id, motivo, sesion_id, solicitud_id, ocurrida_en)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        randomUUID(),
        datos.usuarioPlataformaId,
        datos.empresaId,
        datos.motivo,
        datos.sesionId ?? 'sesion-plataforma',
        datos.solicitudId,
      ],
    );
  }
}
