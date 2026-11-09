import { RegistrarCultivoCasoDeUso } from '../../aplicacion/comandos/registrar-cultivo.caso-de-uso';
import { ListarCultivosCasoDeUso } from '../../aplicacion/consultas/listar-cultivos.caso-de-uso';
import { ConsultarCultivoCasoDeUso } from '../../aplicacion/consultas/consultar-cultivo.caso-de-uso';
import { InactivarCultivoCasoDeUso } from '../../aplicacion/comandos/inactivar-cultivo.caso-de-uso';
import { RegistrarVariedadCasoDeUso } from '../../aplicacion/comandos/registrar-variedad.caso-de-uso';
import { ListarVariedadesCasoDeUso } from '../../aplicacion/consultas/listar-variedades.caso-de-uso';
import { ConsultarVariedadCasoDeUso } from '../../aplicacion/consultas/consultar-variedad.caso-de-uso';
import { InactivarVariedadCasoDeUso } from '../../aplicacion/comandos/inactivar-variedad.caso-de-uso';
import {
  RepositorioCultivos,
  OpcionesListadoCultivos,
  ResultadoListadoCultivos,
} from '../../aplicacion/puertos/salida/repositorio-cultivos.puerto';
import {
  RepositorioVariedades,
  OpcionesListadoVariedades,
  ResultadoListadoVariedades,
} from '../../aplicacion/puertos/salida/repositorio-variedades.puerto';
import { Cultivo } from '../../dominio/entidades/cultivo';
import { Variedad } from '../../dominio/entidades/variedad';
import { EstadoCultivo } from '../../dominio/enumeraciones/estado-cultivo';

class RepositorioCultivosMemoria implements RepositorioCultivos {
  public items: Cultivo[] = [];

  public guardar(cultivo: Cultivo): Promise<void> {
    const idx = this.items.findIndex((c) => c.id === cultivo.id);
    if (idx >= 0) {
      this.items[idx] = cultivo;
    } else {
      this.items.push(cultivo);
    }
    return Promise.resolve();
  }

  public buscarPorId(id: string): Promise<Cultivo | null> {
    const found = this.items.find((c) => c.id === id) || null;
    return Promise.resolve(found);
  }

  public buscarPorCodigo(codigo: string): Promise<Cultivo | null> {
    const normal = Cultivo.normalizarCodigo(codigo);
    const found = this.items.find((c) => c.codigo === normal) || null;
    return Promise.resolve(found);
  }

  public buscarPorNombreNormalizado(
    nombreNormalizado: string,
  ): Promise<Cultivo | null> {
    const found =
      this.items.find(
        (c) => Cultivo.normalizarNombre(c.nombre) === nombreNormalizado,
      ) || null;
    return Promise.resolve(found);
  }

  public listar(
    opciones: OpcionesListadoCultivos,
  ): Promise<ResultadoListadoCultivos> {
    let filtrados = this.items;
    if (opciones.estado) {
      filtrados = filtrados.filter((c) => c.estado === opciones.estado);
    }
    const total = filtrados.length;
    const datos = filtrados.slice(
      opciones.desplazamiento,
      opciones.desplazamiento + opciones.limite,
    );
    return Promise.resolve({ datos, total });
  }
}

class RepositorioVariedadesMemoria implements RepositorioVariedades {
  public items: Variedad[] = [];

  public guardar(variedad: Variedad): Promise<void> {
    const idx = this.items.findIndex((v) => v.id === variedad.id);
    if (idx >= 0) {
      this.items[idx] = variedad;
    } else {
      this.items.push(variedad);
    }
    return Promise.resolve();
  }

  public buscarPorId(cultivoId: string, id: string): Promise<Variedad | null> {
    const found =
      this.items.find((v) => v.cultivoId === cultivoId && v.id === id) || null;
    return Promise.resolve(found);
  }

  public buscarPorCodigo(
    cultivoId: string,
    codigo: string,
  ): Promise<Variedad | null> {
    const normal = Variedad.normalizarCodigo(codigo);
    const found =
      this.items.find(
        (v) => v.cultivoId === cultivoId && v.codigo === normal,
      ) || null;
    return Promise.resolve(found);
  }

  public buscarPorNombreNormalizado(
    cultivoId: string,
    nombreNormalizado: string,
  ): Promise<Variedad | null> {
    const found =
      this.items.find(
        (v) =>
          v.cultivoId === cultivoId &&
          Variedad.normalizarNombre(v.nombre) === nombreNormalizado,
      ) || null;
    return Promise.resolve(found);
  }

  public listar(
    cultivoId: string,
    opciones: OpcionesListadoVariedades,
  ): Promise<ResultadoListadoVariedades> {
    let filtrados = this.items.filter((v) => v.cultivoId === cultivoId);
    if (opciones.estado) {
      filtrados = filtrados.filter((v) => v.estado === opciones.estado);
    }
    const total = filtrados.length;
    const datos = filtrados.slice(
      opciones.desplazamiento,
      opciones.desplazamiento + opciones.limite,
    );
    return Promise.resolve({ datos, total });
  }
}

describe('Catálogo productivo - Casos de uso (CUL-UC-001)', () => {
  let repoCultivos: RepositorioCultivosMemoria;
  let repoVariedades: RepositorioVariedadesMemoria;

  const actorSuperAdmin = { actorId: 'admin-1', rol: 'SuperAdministrador' };
  const actorComun = { actorId: 'user-1', rol: 'Operario' };

  beforeEach(() => {
    repoCultivos = new RepositorioCultivosMemoria();
    repoVariedades = new RepositorioVariedadesMemoria();
  });

  it('debe registrar un cultivo si el actor es SuperAdministrador y no existe duplicado', async () => {
    const uc = new RegistrarCultivoCasoDeUso(repoCultivos);

    const resultado = await uc.ejecutar(
      {
        codigo: 'yerba-mate',
        nombre: 'Yerba Mate',
        descripcion: 'Cultivo regional',
      },
      actorSuperAdmin,
    );

    expect(resultado.codigo).toBe('YERBA-MATE');
    expect(resultado.nombre).toBe('Yerba Mate');
    expect(resultado.estado).toBe(EstadoCultivo.ACTIVO);

    // No debe permitir registrarlo de nuevo por código o nombre (CUL-BR-001)
    await expect(
      uc.ejecutar(
        {
          codigo: 'YERBA-MATE',
          nombre: 'Otro Nombre',
        },
        actorSuperAdmin,
      ),
    ).rejects.toMatchObject({ codigo: 'CUL_CULTIVO_DUPLICADO' });

    await expect(
      uc.ejecutar(
        {
          codigo: 'OTRO',
          nombre: '  yerba   mate  ',
        },
        actorSuperAdmin,
      ),
    ).rejects.toMatchObject({ codigo: 'CUL_CULTIVO_DUPLICADO' });
  });

  it('debe rechazar registro de cultivo si el actor no es SuperAdministrador', async () => {
    const uc = new RegistrarCultivoCasoDeUso(repoCultivos);

    await expect(
      uc.ejecutar(
        {
          codigo: 'TE',
          nombre: 'Té',
        },
        actorComun,
      ),
    ).rejects.toMatchObject({ codigo: 'CUL_ACCESO_DENEGADO' });
  });

  it('debe listar y consultar cultivo por ID', async () => {
    const ucRegistrar = new RegistrarCultivoCasoDeUso(repoCultivos);
    const cultivo = await ucRegistrar.ejecutar(
      { codigo: 'TE', nombre: 'Té' },
      actorSuperAdmin,
    );

    const ucListar = new ListarCultivosCasoDeUso(repoCultivos);
    const listado = await ucListar.ejecutar({ limite: 10, desplazamiento: 0 });
    expect(listado.datos).toHaveLength(1);
    expect(listado.total).toBe(1);

    const ucConsultar = new ConsultarCultivoCasoDeUso(repoCultivos);
    const encontrado = await ucConsultar.ejecutar(cultivo.id);
    expect(encontrado.id).toBe(cultivo.id);

    await expect(ucConsultar.ejecutar('inexistente')).rejects.toMatchObject({
      codigo: 'CUL_RECURSO_NO_ENCONTRADO',
    });
  });

  it('debe inactivar un cultivo verificando concurrencia If-Match', async () => {
    const ucRegistrar = new RegistrarCultivoCasoDeUso(repoCultivos);
    const cultivo = await ucRegistrar.ejecutar(
      { codigo: 'SOJA', nombre: 'Soja' },
      actorSuperAdmin,
    );

    const ucInactivar = new InactivarCultivoCasoDeUso(repoCultivos);

    // Con versión incorrecta falla por CUL_VERSION_CONFLICTO
    await expect(
      ucInactivar.ejecutar(cultivo.id, 999, actorSuperAdmin),
    ).rejects.toMatchObject({ codigo: 'CUL_VERSION_CONFLICTO' });

    const inactivado = await ucInactivar.ejecutar(
      cultivo.id,
      1,
      actorSuperAdmin,
    );
    expect(inactivado.estado).toBe(EstadoCultivo.INACTIVO);
  });

  it('debe registrar y consultar variedades bajo un cultivo', async () => {
    const ucRegCultivo = new RegistrarCultivoCasoDeUso(repoCultivos);
    const cultivo = await ucRegCultivo.ejecutar(
      { codigo: 'YERBA', nombre: 'Yerba' },
      actorSuperAdmin,
    );

    const ucRegVariedad = new RegistrarVariedadCasoDeUso(
      repoCultivos,
      repoVariedades,
    );
    const variedad = await ucRegVariedad.ejecutar(
      cultivo.id,
      { codigo: 'CRIOLLA', nombre: 'Criolla' },
      actorSuperAdmin,
    );

    expect(variedad.cultivoId).toBe(cultivo.id);
    expect(variedad.codigo).toBe('CRIOLLA');

    // Variedad duplicada dentro del mismo cultivo se rechaza (CUL-BR-002)
    await expect(
      ucRegVariedad.ejecutar(
        cultivo.id,
        { codigo: 'CRIOLLA', nombre: 'Otra' },
        actorSuperAdmin,
      ),
    ).rejects.toMatchObject({ codigo: 'CUL_VARIEDAD_INVALIDA' });

    const ucListarVar = new ListarVariedadesCasoDeUso(
      repoCultivos,
      repoVariedades,
    );
    const listado = await ucListarVar.ejecutar(cultivo.id, {
      limite: 10,
      desplazamiento: 0,
    });
    expect(listado.datos).toHaveLength(1);

    const ucConsVar = new ConsultarVariedadCasoDeUso(
      repoCultivos,
      repoVariedades,
    );
    const consultada = await ucConsVar.ejecutar(cultivo.id, variedad.id);
    expect(consultada.id).toBe(variedad.id);

    const ucInactVar = new InactivarVariedadCasoDeUso(
      repoCultivos,
      repoVariedades,
    );
    const inactivada = await ucInactVar.ejecutar(
      cultivo.id,
      variedad.id,
      1,
      actorSuperAdmin,
    );
    expect(inactivada.estado).toBe('INACTIVA');
  });
});
