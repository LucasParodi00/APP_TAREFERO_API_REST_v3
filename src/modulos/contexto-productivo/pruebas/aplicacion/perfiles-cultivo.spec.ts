import { CrearBorradorPerfilCasoDeUso } from '../../aplicacion/comandos/crear-borrador-perfil.caso-de-uso';
import { PublicarPerfilCasoDeUso } from '../../aplicacion/comandos/publicar-perfil.caso-de-uso';
import { InactivarPerfilCasoDeUso } from '../../aplicacion/comandos/inactivar-perfil.caso-de-uso';
import {
  RepositorioCultivos,
  OpcionesListadoCultivos,
  ResultadoListadoCultivos,
} from '../../aplicacion/puertos/salida/repositorio-cultivos.puerto';
import { RepositorioPerfiles } from '../../aplicacion/puertos/salida/repositorio-perfiles.puerto';
import { ProveedorEmpresaCul } from '../../aplicacion/puertos/salida/proveedor-empresa-cul.puerto';
import { ProveedorLoteCul } from '../../aplicacion/puertos/salida/proveedor-lote-cul.puerto';
import { ProveedorUnidadCul } from '../../aplicacion/puertos/salida/proveedor-unidad-cul.puerto';
import { ProveedorHabilitacionCultivo } from '../../aplicacion/puertos/salida/proveedor-habilitacion-cultivo.puerto';
import { Cultivo } from '../../dominio/entidades/cultivo';
import { PerfilCultivo } from '../../dominio/entidades/perfil-cultivo';
import { AlcancePerfil } from '../../dominio/enumeraciones/alcance-perfil';
import { EstadoPerfil } from '../../dominio/enumeraciones/estado-perfil';
import { CampoPerfil } from '../../dominio/objetos-valor/campo-perfil';
import { TipoCampoPerfil } from '../../dominio/enumeraciones/tipo-campo-perfil';
import { DestinoCampoPerfil } from '../../dominio/enumeraciones/destino-campo-perfil';

class RepositorioCultivosMemoria implements RepositorioCultivos {
  public items: Cultivo[] = [];
  public guardar(cultivo: Cultivo): Promise<void> {
    const idx = this.items.findIndex((c) => c.id === cultivo.id);
    if (idx >= 0) this.items[idx] = cultivo;
    else this.items.push(cultivo);
    return Promise.resolve();
  }
  public buscarPorId(id: string): Promise<Cultivo | null> {
    return Promise.resolve(this.items.find((c) => c.id === id) || null);
  }
  public buscarPorCodigo(codigo: string): Promise<Cultivo | null> {
    return Promise.resolve(
      this.items.find((c) => c.codigo === Cultivo.normalizarCodigo(codigo)) ||
        null,
    );
  }
  public buscarPorNombreNormalizado(nombre: string): Promise<Cultivo | null> {
    return Promise.resolve(
      this.items.find((c) => Cultivo.normalizarNombre(c.nombre) === nombre) ||
        null,
    );
  }
  public listar(
    opciones: OpcionesListadoCultivos,
  ): Promise<ResultadoListadoCultivos> {
    return Promise.resolve({
      datos: this.items.slice(0, opciones.limite),
      total: this.items.length,
    });
  }
}

class RepositorioPerfilesMemoria implements RepositorioPerfiles {
  public items: PerfilCultivo[] = [];

  public guardar(perfil: PerfilCultivo): Promise<void> {
    const idx = this.items.findIndex((p) => p.id === perfil.id);
    if (idx >= 0) this.items[idx] = perfil;
    else this.items.push(perfil);
    return Promise.resolve();
  }

  public buscarPorId(id: string): Promise<PerfilCultivo | null> {
    return Promise.resolve(this.items.find((p) => p.id === id) || null);
  }

  public obtenerSiguienteNumeroVersion(
    cultivoId: string,
    alcance: AlcancePerfil,
    empresaId: string | null,
    loteId: string | null,
  ): Promise<number> {
    const linea = this.items.filter(
      (p) =>
        p.cultivoId === cultivoId &&
        p.alcance === alcance &&
        p.empresaId === empresaId &&
        p.loteId === loteId,
    );
    if (linea.length === 0) return Promise.resolve(1);
    const max = Math.max(...linea.map((p) => p.version));
    return Promise.resolve(max + 1);
  }

  public buscarPorLineaYVersion(
    cultivoId: string,
    alcance: AlcancePerfil,
    empresaId: string | null,
    loteId: string | null,
    version: number,
  ): Promise<PerfilCultivo | null> {
    const found = this.items.find(
      (p) =>
        p.cultivoId === cultivoId &&
        p.alcance === alcance &&
        p.empresaId === empresaId &&
        p.loteId === loteId &&
        p.version === version,
    );
    return Promise.resolve(found || null);
  }
}

describe('Perfiles de cultivo - Casos de uso (CUL-UC-002)', () => {
  let repoCultivos: RepositorioCultivosMemoria;
  let repoPerfiles: RepositorioPerfilesMemoria;
  let provEmpresa: ProveedorEmpresaCul;
  let provLote: ProveedorLoteCul;
  let provUnidad: ProveedorUnidadCul;
  let provHabilitacion: ProveedorHabilitacionCultivo;

  const actorSuperAdmin = { actorId: 'admin-1', rol: 'SuperAdministrador' };
  const actorEmpresa1 = {
    actorId: 'user-emp1',
    rol: 'Administrador',
    empresaId: 'emp-1',
  };
  const actorEmpresa2 = {
    actorId: 'user-emp2',
    rol: 'Administrador',
    empresaId: 'emp-2',
  };

  let cultivoYerba: Cultivo;

  beforeEach(async () => {
    repoCultivos = new RepositorioCultivosMemoria();
    repoPerfiles = new RepositorioPerfilesMemoria();

    provEmpresa = {
      verificarEmpresaExisteYActiva: (empresaId: string) =>
        Promise.resolve(empresaId === 'emp-1' || empresaId === 'emp-2'),
    };
    provLote = {
      verificarLotePerteneceAEmpresaYActivo: (
        empresaId: string,
        loteId: string,
      ) => Promise.resolve(empresaId === 'emp-1' && loteId === 'lote-10'),
    };
    provUnidad = {
      verificarUnidadExisteYValida: (unidadId: string) =>
        Promise.resolve(unidadId === 'kg' || unidadId === 'tn'),
    };
    provHabilitacion = {
      verificarCultivoHabilitadoParaEmpresa: (
        cultivoId: string,
        empresaId: string,
      ) => Promise.resolve(empresaId === 'emp-1'), // Solo emp-1 tiene habilitado el cultivo
    };

    cultivoYerba = Cultivo.crear({
      id: 'cultivo-ym',
      codigo: 'YM',
      nombre: 'Yerba Mate',
    });
    await repoCultivos.guardar(cultivoYerba);
  });

  it('SuperAdministrador puede crear y publicar un perfil BASE', async () => {
    const ucCrear = new CrearBorradorPerfilCasoDeUso(
      repoCultivos,
      repoPerfiles,
      provEmpresa,
      provLote,
      provUnidad,
      provHabilitacion,
    );

    const perfilBase = await ucCrear.ejecutar(
      cultivoYerba.id,
      {
        alcance: AlcancePerfil.BASE,
        nombre: 'Perfil Base Yerba Mate',
        campos: [
          {
            codigo: 'DENSIDAD',
            nombre: 'Densidad',
            destino: DestinoCampoPerfil.IMPLANTACION,
            tipo: TipoCampoPerfil.ENTERO,
            obligatorio: true,
          },
        ],
      },
      actorSuperAdmin,
    );

    expect(perfilBase.alcance).toBe(AlcancePerfil.BASE);
    expect(perfilBase.estado).toBe(EstadoPerfil.BORRADOR);
    expect(perfilBase.version).toBe(1);

    const ucPublicar = new PublicarPerfilCasoDeUso(repoPerfiles);
    const publicado = await ucPublicar.ejecutar(
      cultivoYerba.id,
      perfilBase.id,
      actorSuperAdmin,
    );
    expect(publicado.estado).toBe(EstadoPerfil.PUBLICADO);
  });

  it('Administrador de Empresa puede crear borrador EMPRESA con cultivo habilitado y padre BASE', async () => {
    const ucCrear = new CrearBorradorPerfilCasoDeUso(
      repoCultivos,
      repoPerfiles,
      provEmpresa,
      provLote,
      provUnidad,
      provHabilitacion,
    );

    // Creamos y publicamos base primero
    const campoBase = CampoPerfil.crear({
      codigo: 'DENSIDAD',
      nombre: 'Densidad',
      destino: DestinoCampoPerfil.IMPLANTACION,
      tipo: TipoCampoPerfil.ENTERO,
      obligatorio: true,
    });
    const base = PerfilCultivo.crearBorrador({
      id: 'base-1',
      cultivoId: cultivoYerba.id,
      alcance: AlcancePerfil.BASE,
      nombre: 'Base',
      campos: [campoBase],
    });
    base.publicar();
    await repoPerfiles.guardar(base);

    // Empresa 1 (habilitada) crea perfil EMPRESA
    const perfilEmpresa = await ucCrear.ejecutar(
      cultivoYerba.id,
      {
        alcance: AlcancePerfil.EMPRESA,
        perfilPadreId: base.id,
        nombre: 'Perfil Empresa 1',
        campos: [
          {
            codigo: 'DENSIDAD',
            nombre: 'Densidad',
            destino: DestinoCampoPerfil.IMPLANTACION,
            tipo: TipoCampoPerfil.ENTERO,
            obligatorio: true,
          },
          {
            codigo: 'PESO_KG',
            nombre: 'Peso',
            destino: DestinoCampoPerfil.COSECHA,
            tipo: TipoCampoPerfil.DECIMAL,
            obligatorio: false,
            unidadId: 'kg',
          },
        ],
      },
      actorEmpresa1,
    );

    expect(perfilEmpresa.alcance).toBe(AlcancePerfil.EMPRESA);
    expect(perfilEmpresa.empresaId).toBe('emp-1');
  });

  it('debe rechazar perfil EMPRESA si el cultivo no está habilitado para la empresa (CUL-BR-003)', async () => {
    const ucCrear = new CrearBorradorPerfilCasoDeUso(
      repoCultivos,
      repoPerfiles,
      provEmpresa,
      provLote,
      provUnidad,
      provHabilitacion,
    );

    const base = PerfilCultivo.crearBorrador({
      id: 'base-1',
      cultivoId: cultivoYerba.id,
      alcance: AlcancePerfil.BASE,
      nombre: 'Base',
      campos: [],
    });
    base.publicar();
    await repoPerfiles.guardar(base);

    // Empresa 2 NO tiene habilitado el cultivo
    await expect(
      ucCrear.ejecutar(
        cultivoYerba.id,
        {
          alcance: AlcancePerfil.EMPRESA,
          perfilPadreId: base.id,
          nombre: 'Perfil Empresa 2',
          campos: [],
        },
        actorEmpresa2,
      ),
    ).rejects.toMatchObject({ codigo: 'CUL_CULTIVO_NO_HABILITADO' });
  });

  it('debe inactivar una versión publicada', async () => {
    const base = PerfilCultivo.crearBorrador({
      id: 'base-1',
      cultivoId: cultivoYerba.id,
      alcance: AlcancePerfil.BASE,
      nombre: 'Base',
      campos: [],
    });
    base.publicar();
    await repoPerfiles.guardar(base);

    const ucInactivar = new InactivarPerfilCasoDeUso(repoPerfiles);
    const inactivado = await ucInactivar.ejecutar(
      cultivoYerba.id,
      base.id,
      actorSuperAdmin,
    );
    expect(inactivado.estado).toBe(EstadoPerfil.INACTIVO);
  });
});
