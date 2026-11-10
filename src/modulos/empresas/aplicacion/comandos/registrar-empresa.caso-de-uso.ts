import { RepositorioEmpresas } from '../puertos/salida/repositorio-empresas.puerto';
import { VerificadorAsignacionComercial } from '../puertos/salida/verificador-asignacion-comercial.puerto';
import { ContextoSolicitud } from '../puertos/comunes/contexto-solicitud';
import { EmpresaLectura } from '../modelos-lectura';
import { PermisoDenegado } from '../errores';
import {
  NombreEmpresa,
  AliasEmpresa,
  Cuit,
  PuntoGeografico,
  ResponsableNombre,
  UbicacionTexto,
  DescripcionActividad,
} from '../../dominio/objetos-valor';
import { Empresa } from '../../dominio/agregados/empresa';
import {
  AliasNoDisponible,
  AsignacionComercialRequerida,
} from '../../dominio/errores';
import { MapeadorEmpresaLectura } from '../mapeadores/mapeador-empresa-lectura';

export interface ComandoRegistrarEmpresa {
  id: string;
  nombre: string;
  alias: string;
  cuit?: string | null;
  responsableNombre?: string | null;
  ubicacionTexto?: string | null;
  ubicacionGeografica?: { latitud: number; longitud: number } | null;
  descripcionActividad?: string | null;
  configuracionGeneralId?: string;
}

export class RegistrarEmpresa {
  constructor(
    private readonly repositorio: RepositorioEmpresas,
    private readonly verificadorAsignacion: VerificadorAsignacionComercial,
  ) {}

  async ejecutar(
    comando: ComandoRegistrarEmpresa,
    contexto: ContextoSolicitud,
  ): Promise<EmpresaLectura> {
    if (contexto.rol !== 'SUPER_ADMINISTRADOR') {
      throw new PermisoDenegado(
        'Solo un SuperAdministrador puede registrar una empresa.',
      );
    }

    const nombre = new NombreEmpresa(comando.nombre);
    const alias = new AliasEmpresa(comando.alias);
    const cuit = new Cuit(comando.cuit);
    const responsableNombre = new ResponsableNombre(comando.responsableNombre);
    const ubicacionTexto = new UbicacionTexto(comando.ubicacionTexto);
    const ubicacionGeografica = comando.ubicacionGeografica
      ? new PuntoGeografico(
          comando.ubicacionGeografica.latitud,
          comando.ubicacionGeografica.longitud,
        )
      : null;
    const descripcionActividad = new DescripcionActividad(
      comando.descripcionActividad,
    );

    const existe = await this.repositorio.existeAlias(alias.valor);
    if (existe) {
      throw new AliasNoDisponible(alias.valor);
    }

    const asignacionValida =
      await this.verificadorAsignacion.confirmarAsignacion(comando.id);
    if (!asignacionValida) {
      throw new AsignacionComercialRequerida();
    }

    const empresa = Empresa.crear({
      id: comando.id,
      nombre,
      alias,
      cuit,
      responsableNombre,
      ubicacionTexto,
      ubicacionGeografica,
      descripcionActividad,
      actor: contexto.actorId,
      configuracionGeneralId: comando.configuracionGeneralId,
    });

    await this.repositorio.guardar(empresa);

    return MapeadorEmpresaLectura.aLectura(empresa);
  }
}
