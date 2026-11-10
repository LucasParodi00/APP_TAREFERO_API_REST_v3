import { RepositorioEmpresas } from '../puertos/salida/repositorio-empresas.puerto';
import { ContextoSolicitud } from '../puertos/comunes/contexto-solicitud';
import { EmpresaLectura } from '../modelos-lectura';
import {
  EmpresaNoEncontrada,
  PermisoDenegado,
  ConflictoConcurrencia,
} from '../errores';
import {
  NombreEmpresa,
  AliasEmpresa,
  Cuit,
  PuntoGeografico,
  ResponsableNombre,
  UbicacionTexto,
  DescripcionActividad,
} from '../../dominio/objetos-valor';
import { MapeadorEmpresaLectura } from '../mapeadores/mapeador-empresa-lectura';

export interface ComandoModificarEmpresa {
  id: string;
  versionEsperada: number;
  nombre?: string;
  nuevoAlias?: string;
  cuit?: string | null;
  responsableNombre?: string | null;
  ubicacionTexto?: string | null;
  ubicacionGeografica?: { latitud: number; longitud: number } | null;
  descripcionActividad?: string | null;
}

export class ModificarEmpresa {
  constructor(private readonly repositorio: RepositorioEmpresas) {}

  async ejecutar(
    comando: ComandoModificarEmpresa,
    contexto: ContextoSolicitud,
  ): Promise<EmpresaLectura> {
    const esSuperAdmin = contexto.rol === 'SUPER_ADMINISTRADOR';
    const esAdmin = contexto.rol === 'ADMINISTRADOR';

    if (!esSuperAdmin && !esAdmin) {
      throw new PermisoDenegado();
    }

    if (esAdmin && contexto.empresaId !== comando.id) {
      throw new PermisoDenegado(
        'Un administrador solo puede modificar su propia empresa.',
      );
    }

    const empresa = await this.repositorio.obtenerPorId(comando.id);
    if (!empresa) {
      throw new EmpresaNoEncontrada(comando.id);
    }

    if (empresa.version !== comando.versionEsperada) {
      throw new ConflictoConcurrencia(
        `La versión actual (${empresa.version}) no coincide con la versión esperada (${comando.versionEsperada}).`,
      );
    }

    const nombre = comando.nombre
      ? new NombreEmpresa(comando.nombre)
      : undefined;
    const nuevoAlias = comando.nuevoAlias
      ? new AliasEmpresa(comando.nuevoAlias)
      : undefined;
    const cuit =
      comando.cuit !== undefined ? new Cuit(comando.cuit) : undefined;
    const responsableNombre =
      comando.responsableNombre !== undefined
        ? new ResponsableNombre(comando.responsableNombre)
        : undefined;
    const ubicacionTexto =
      comando.ubicacionTexto !== undefined
        ? new UbicacionTexto(comando.ubicacionTexto)
        : undefined;
    const ubicacionGeografica =
      comando.ubicacionGeografica !== undefined
        ? comando.ubicacionGeografica
          ? new PuntoGeografico(
              comando.ubicacionGeografica.latitud,
              comando.ubicacionGeografica.longitud,
            )
          : null
        : undefined;
    const descripcionActividad =
      comando.descripcionActividad !== undefined
        ? new DescripcionActividad(comando.descripcionActividad)
        : undefined;

    empresa.modificarDatos({
      nombre,
      nuevoAlias,
      cuit,
      responsableNombre,
      ubicacionTexto,
      ubicacionGeografica,
      descripcionActividad,
      esSuperAdmin,
      actor: contexto.actorId,
    });

    await this.repositorio.guardar(empresa);

    return MapeadorEmpresaLectura.aLectura(empresa);
  }
}
