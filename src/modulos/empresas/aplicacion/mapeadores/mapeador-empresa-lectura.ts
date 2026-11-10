import { Empresa } from '../../dominio/agregados/empresa';
import { EmpresaLectura } from '../modelos-lectura';

export class MapeadorEmpresaLectura {
  static aLectura(empresa: Empresa): EmpresaLectura {
    return {
      id: empresa.id,
      nombre: empresa.nombre.valor,
      alias: empresa.alias.valor,
      cuit: empresa.cuit.valor,
      responsableNombre: empresa.responsableNombre.valor,
      ubicacionTexto: empresa.ubicacionTexto.valor,
      ubicacionGeografica: empresa.ubicacionGeografica
        ? {
            latitud: empresa.ubicacionGeografica.latitud,
            longitud: empresa.ubicacionGeografica.longitud,
          }
        : null,
      descripcionActividad: empresa.descripcionActividad.valor,
      estado: empresa.estado,
      configuracionGeneral: {
        id: empresa.configuracionGeneral.id,
        empresaId: empresa.configuracionGeneral.empresaId,
        paisReferencia: empresa.configuracionGeneral.paisReferencia.valor,
        zonaHoraria: empresa.configuracionGeneral.zonaHoraria.valor,
        monedaPrincipal: empresa.configuracionGeneral.monedaPrincipal.valor,
        creadoEn: empresa.configuracionGeneral.creadoEn.toISOString(),
        creadoPor: empresa.configuracionGeneral.creadoPor,
        actualizadoEn: empresa.configuracionGeneral.actualizadoEn.toISOString(),
        actualizadoPor: empresa.configuracionGeneral.actualizadoPor,
        version: empresa.configuracionGeneral.version,
      },
      creadoEn: empresa.creadoEn.toISOString(),
      creadoPor: empresa.creadoPor,
      actualizadoEn: empresa.actualizadoEn.toISOString(),
      actualizadoPor: empresa.actualizadoPor,
      version: empresa.version,
    };
  }
}
