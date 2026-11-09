import { RegistrarEmpresa } from '../../aplicacion/comandos/registrar-empresa.caso-de-uso';
import { ConsultarEmpresa } from '../../aplicacion/consultas/consultar-empresa.caso-de-uso';
import { ListarEmpresas } from '../../aplicacion/consultas/listar-empresas.caso-de-uso';
import { ModificarEmpresa } from '../../aplicacion/comandos/modificar-empresa.caso-de-uso';
import { ModificarConfiguracionGeneral } from '../../aplicacion/comandos/modificar-configuracion-general.caso-de-uso';
import { SuspenderEmpresa } from '../../aplicacion/comandos/suspender-empresa.caso-de-uso';
import { ReactivarEmpresa } from '../../aplicacion/comandos/reactivar-empresa.caso-de-uso';
import { CerrarEmpresa } from '../../aplicacion/comandos/cerrar-empresa.caso-de-uso';
import { ServicioReferenciaEmpresa } from '../../aplicacion/servicios/servicio-referencia-empresa';
import {
  CriteriosListadoEmpresas,
  RepositorioEmpresas,
  ResultadoPaginado,
} from '../../aplicacion/puertos/salida/repositorio-empresas';
import { VerificadorAsignacionComercial } from '../../aplicacion/puertos/salida/verificador-asignacion-comercial';
import { Empresa } from '../../dominio/entidades/empresa';
import { ConfiguracionGeneralEmpresa } from '../../dominio/entidades/configuracion-general-empresa';
import { EstadoEmpresa } from '../../dominio/enumeraciones/estado-empresa';

class RepositorioEmpresasEnMemoria implements RepositorioEmpresas {
  public empresas = new Map<string, Empresa>();

  public guardar(empresa: Empresa): Promise<void> {
    this.empresas.set(empresa.id, empresa);
    return Promise.resolve();
  }

  public buscarPorId(id: string): Promise<Empresa | null> {
    return Promise.resolve(this.empresas.get(id) ?? null);
  }

  public buscarPorAlias(alias: string): Promise<Empresa | null> {
    for (const emp of this.empresas.values()) {
      if (emp.alias === alias) return Promise.resolve(emp);
    }
    return Promise.resolve(null);
  }

  public async existeAlias(alias: string): Promise<boolean> {
    const encontrado = await this.buscarPorAlias(alias);
    return encontrado !== null;
  }

  public listar(
    criterios: CriteriosListadoEmpresas,
  ): Promise<ResultadoPaginado<Empresa>> {
    let lista = Array.from(this.empresas.values());

    if (criterios.estado) {
      lista = lista.filter((e) => e.estado === criterios.estado);
    }
    if (criterios.nombre) {
      lista = lista.filter((e) =>
        e.nombre.toLowerCase().includes(criterios.nombre!.toLowerCase()),
      );
    }

    const total = lista.length;
    const paginados = lista.slice(
      criterios.desplazamiento,
      criterios.desplazamiento + criterios.limite,
    );

    return Promise.resolve({
      datos: paginados,
      paginacion: {
        total,
        limite: criterios.limite,
        desplazamiento: criterios.desplazamiento,
      },
    });
  }

  public actualizar(empresa: Empresa): Promise<void> {
    this.empresas.set(empresa.id, empresa);
    return Promise.resolve();
  }

  public actualizarConfiguracion(
    configuracion: ConfiguracionGeneralEmpresa,
  ): Promise<void> {
    const empresa = this.empresas.get(configuracion.empresaId);
    if (empresa) {
      empresa.actualizarConfiguracion(configuracion);
    }
    return Promise.resolve();
  }
}

class VerificadorAsignacionComercialMock implements VerificadorAsignacionComercial {
  public aliasValidos = new Set<string>();

  public tieneAsignacionValida(alias: string): Promise<boolean> {
    return Promise.resolve(this.aliasValidos.has(alias));
  }
}

describe('Aplicación: Casos de uso de Empresas (T02, T03, T04)', () => {
  let repo: RepositorioEmpresasEnMemoria;
  let asignacion: VerificadorAsignacionComercialMock;
  let registrarEmpresa: RegistrarEmpresa;
  let consultarEmpresa: ConsultarEmpresa;
  let listarEmpresas: ListarEmpresas;
  let modificarEmpresa: ModificarEmpresa;
  let modificarConfig: ModificarConfiguracionGeneral;
  let suspenderEmpresa: SuspenderEmpresa;
  let reactivarEmpresa: ReactivarEmpresa;
  let cerrarEmpresa: CerrarEmpresa;
  let servicioReferencia: ServicioReferenciaEmpresa;

  beforeEach(() => {
    repo = new RepositorioEmpresasEnMemoria();
    asignacion = new VerificadorAsignacionComercialMock();
    registrarEmpresa = new RegistrarEmpresa(repo, asignacion);
    consultarEmpresa = new ConsultarEmpresa(repo);
    listarEmpresas = new ListarEmpresas(repo);
    modificarEmpresa = new ModificarEmpresa(repo);
    modificarConfig = new ModificarConfiguracionGeneral(repo);
    suspenderEmpresa = new SuspenderEmpresa(repo);
    reactivarEmpresa = new ReactivarEmpresa(repo);
    cerrarEmpresa = new CerrarEmpresa(repo);
    servicioReferencia = new ServicioReferenciaEmpresa(repo);
  });

  function expectErrorDominio(fn: () => Promise<unknown>, codigo: string) {
    return expect(fn()).rejects.toMatchObject({ codigo });
  }

  describe('EMP-UC-001 — Registrar Empresa', () => {
    it('registra una empresa exitosamente cuando el actor es SuperAdministrador y tiene asignación', async () => {
      asignacion.aliasValidos.add('yerba-norte');

      const res = await registrarEmpresa.ejecutar(
        {
          nombre: 'Yerba Norte',
          alias: 'yerba-norte',
        },
        { actorId: 'admin-1', rol: 'SuperAdministrador' },
      );

      expect(res.alias).toBe('yerba-norte');
      expect(res.estado).toBe(EstadoEmpresa.ACTIVA);
      expect(res.version).toBe(1);

      const guardada = await repo.buscarPorId(res.id);
      expect(guardada).toBeDefined();
      expect(guardada?.configuracion.monedaPrincipal).toBe('ARS');
    });

    it('rechaza con EMP_ACCESO_DENEGADO si el actor no es SuperAdministrador', async () => {
      asignacion.aliasValidos.add('yerba-norte');

      await expectErrorDominio(
        () =>
          registrarEmpresa.ejecutar(
            { nombre: 'Yerba Norte', alias: 'yerba-norte' },
            { actorId: 'usr-1', rol: 'Administrador' },
          ),
        'EMP_ACCESO_DENEGADO',
      );
    });

    it('rechaza con EMP_ASIGNACION_COMERCIAL_REQUERIDA si el alias no tiene asignación', async () => {
      await expectErrorDominio(
        () =>
          registrarEmpresa.ejecutar(
            { nombre: 'Yerba Norte', alias: 'sin-asignacion' },
            { actorId: 'admin-1', rol: 'SuperAdministrador' },
          ),
        'EMP_ASIGNACION_COMERCIAL_REQUERIDA',
      );
    });

    it('rechaza con EMP_ALIAS_NO_DISPONIBLE si el alias ya existe', async () => {
      asignacion.aliasValidos.add('yerba-norte');
      await registrarEmpresa.ejecutar(
        { nombre: 'Yerba Norte', alias: 'yerba-norte' },
        { actorId: 'admin-1', rol: 'SuperAdministrador' },
      );

      await expectErrorDominio(
        () =>
          registrarEmpresa.ejecutar(
            { nombre: 'Otra Yerba', alias: 'yerba-norte' },
            { actorId: 'admin-1', rol: 'SuperAdministrador' },
          ),
        'EMP_ALIAS_NO_DISPONIBLE',
      );
    });
  });

  describe('EMP-UC-002 — Consultar Empresa', () => {
    it('permite al Administrador consultar su propia Empresa', async () => {
      asignacion.aliasValidos.add('yerba-norte');
      const creada = await registrarEmpresa.ejecutar(
        { nombre: 'Yerba Norte', alias: 'yerba-norte' },
        { actorId: 'admin-1', rol: 'SuperAdministrador' },
      );

      const res = await consultarEmpresa.ejecutar(creada.id, {
        actorId: 'usr-admin',
        rol: 'Administrador',
        empresaId: creada.id,
      });

      expect(res.id).toBe(creada.id);
      expect(res.nombre).toBe('Yerba Norte');
    });

    it('rechaza con EMP_ACCESO_DENEGADO si un Administrador consulta otra Empresa (EMP-BR-007)', async () => {
      asignacion.aliasValidos.add('yerba-norte');
      const creada = await registrarEmpresa.ejecutar(
        { nombre: 'Yerba Norte', alias: 'yerba-norte' },
        { actorId: 'admin-1', rol: 'SuperAdministrador' },
      );

      await expectErrorDominio(
        () =>
          consultarEmpresa.ejecutar(creada.id, {
            actorId: 'usr-admin',
            rol: 'Administrador',
            empresaId: 'otra-empresa-id',
          }),
        'EMP_ACCESO_DENEGADO',
      );
    });

    it('rechaza con EMP_EMPRESA_NO_ENCONTRADA si la Empresa no existe', async () => {
      await expectErrorDominio(
        () =>
          consultarEmpresa.ejecutar('inexistente-id', {
            actorId: 'admin-1',
            rol: 'SuperAdministrador',
          }),
        'EMP_EMPRESA_NO_ENCONTRADA',
      );
    });
  });

  describe('EMP-UC-003 — Listar Empresas', () => {
    it('permite a un SuperAdministrador listar con paginación', async () => {
      asignacion.aliasValidos.add('yerba-1');
      asignacion.aliasValidos.add('yerba-2');
      await registrarEmpresa.ejecutar(
        { nombre: 'Yerba 1', alias: 'yerba-1' },
        { actorId: 'admin-1', rol: 'SuperAdministrador' },
      );
      await registrarEmpresa.ejecutar(
        { nombre: 'Yerba 2', alias: 'yerba-2' },
        { actorId: 'admin-1', rol: 'SuperAdministrador' },
      );

      const res = await listarEmpresas.ejecutar(
        { limite: 10, desplazamiento: 0 },
        { actorId: 'admin-1', rol: 'SuperAdministrador' },
      );

      expect(res.datos.length).toBe(2);
      expect(res.paginacion.total).toBe(2);
    });

    it('rechaza con EMP_ACCESO_DENEGADO a un Administrador', async () => {
      await expectErrorDominio(
        () =>
          listarEmpresas.ejecutar(
            { limite: 10, desplazamiento: 0 },
            { actorId: 'usr-1', rol: 'Administrador', empresaId: 'emp-1' },
          ),
        'EMP_ACCESO_DENEGADO',
      );
    });

    it('rechaza con EMP_CONSULTA_INVALIDA límites fuera de rango', async () => {
      await expectErrorDominio(
        () =>
          listarEmpresas.ejecutar(
            { limite: 101, desplazamiento: 0 },
            { actorId: 'admin-1', rol: 'SuperAdministrador' },
          ),
        'EMP_CONSULTA_INVALIDA',
      );
    });
  });

  describe('EMP-UC-004 — Modificar Empresa', () => {
    it('modifica datos y actualiza versión con concurrencia optimista', async () => {
      asignacion.aliasValidos.add('yerba-norte');
      const creada = await registrarEmpresa.ejecutar(
        { nombre: 'Yerba Norte', alias: 'yerba-norte' },
        { actorId: 'admin-1', rol: 'SuperAdministrador' },
      );

      const mod = await modificarEmpresa.ejecutar(
        {
          id: creada.id,
          versionConocida: 1,
          nombre: 'Yerba Norte Modificada',
        },
        { actorId: 'usr-admin', rol: 'Administrador', empresaId: creada.id },
      );

      expect(mod.nombre).toBe('Yerba Norte Modificada');
      expect(mod.version).toBe(2);
    });

    it('rechaza con EMP_VERSION_CONFLICTO si la versión conocida no coincide', async () => {
      asignacion.aliasValidos.add('yerba-norte');
      const creada = await registrarEmpresa.ejecutar(
        { nombre: 'Yerba Norte', alias: 'yerba-norte' },
        { actorId: 'admin-1', rol: 'SuperAdministrador' },
      );

      await expectErrorDominio(
        () =>
          modificarEmpresa.ejecutar(
            {
              id: creada.id,
              versionConocida: 99,
              nombre: 'Yerba Norte Modificada',
            },
            {
              actorId: 'usr-admin',
              rol: 'Administrador',
              empresaId: creada.id,
            },
          ),
        'EMP_VERSION_CONFLICTO',
      );
    });
  });

  describe('EMP-UC-008 — Modificar configuración general', () => {
    it('modifica moneda y zona horaria validando versión', async () => {
      asignacion.aliasValidos.add('yerba-norte');
      const creada = await registrarEmpresa.ejecutar(
        { nombre: 'Yerba Norte', alias: 'yerba-norte' },
        { actorId: 'admin-1', rol: 'SuperAdministrador' },
      );

      const mod = await modificarConfig.ejecutar(
        {
          empresaId: creada.id,
          versionConocida: 1,
          zonaHoraria: 'America/Montevideo',
          monedaPrincipal: 'UYU',
        },
        { actorId: 'usr-admin', rol: 'Administrador', empresaId: creada.id },
      );

      expect(mod.zonaHoraria).toBe('America/Montevideo');
      expect(mod.monedaPrincipal).toBe('UYU');
      expect(mod.version).toBe(2);
    });
  });

  describe('EMP-UC-005, EMP-UC-006, EMP-UC-007 — Ciclo de vida de Empresas', () => {
    it('ejecuta el ciclo suspender -> reactivar -> cerrar validando versiones y roles', async () => {
      asignacion.aliasValidos.add('yerba-ciclo');
      const creada = await registrarEmpresa.ejecutar(
        { nombre: 'Yerba Ciclo', alias: 'yerba-ciclo' },
        { actorId: 'admin-1', rol: 'SuperAdministrador' },
      );

      // 1. Suspender
      const suspendida = await suspenderEmpresa.ejecutar(
        { id: creada.id, versionConocida: 1 },
        { actorId: 'admin-1', rol: 'SuperAdministrador' },
      );
      expect(suspendida.estado).toBe(EstadoEmpresa.SUSPENDIDA);
      expect(suspendida.version).toBe(2);

      // Suspender de nuevo falla
      await expectErrorDominio(
        () =>
          suspenderEmpresa.ejecutar(
            { id: creada.id, versionConocida: 2 },
            { actorId: 'admin-1', rol: 'SuperAdministrador' },
          ),
        'EMP_TRANSICION_ESTADO_INVALIDA',
      );

      // 2. Reactivar
      const reactivada = await reactivarEmpresa.ejecutar(
        { id: creada.id, versionConocida: 2 },
        { actorId: 'admin-1', rol: 'SuperAdministrador' },
      );
      expect(reactivada.estado).toBe(EstadoEmpresa.ACTIVA);
      expect(reactivada.version).toBe(3);

      // Reactivar cuando ya está activa falla
      await expectErrorDominio(
        () =>
          reactivarEmpresa.ejecutar(
            { id: creada.id, versionConocida: 3 },
            { actorId: 'admin-1', rol: 'SuperAdministrador' },
          ),
        'EMP_TRANSICION_ESTADO_INVALIDA',
      );

      // 3. Cerrar
      const cerrada = await cerrarEmpresa.ejecutar(
        { id: creada.id, versionConocida: 3 },
        { actorId: 'admin-1', rol: 'SuperAdministrador' },
      );
      expect(cerrada.estado).toBe(EstadoEmpresa.CERRADA);
      expect(cerrada.version).toBe(4);

      // Cerrar una empresa ya cerrada falla
      await expectErrorDominio(
        () =>
          cerrarEmpresa.ejecutar(
            { id: creada.id, versionConocida: 4 },
            { actorId: 'admin-1', rol: 'SuperAdministrador' },
          ),
        'EMP_TRANSICION_ESTADO_INVALIDA',
      );
    });

    it('rechaza operaciones si el rol no es SuperAdministrador', async () => {
      asignacion.aliasValidos.add('yerba-rol');
      const creada = await registrarEmpresa.ejecutar(
        { nombre: 'Yerba Rol', alias: 'yerba-rol' },
        { actorId: 'admin-1', rol: 'SuperAdministrador' },
      );

      await expectErrorDominio(
        () =>
          suspenderEmpresa.ejecutar(
            { id: creada.id, versionConocida: 1 },
            {
              actorId: 'usr-admin',
              rol: 'Administrador',
              empresaId: creada.id,
            },
          ),
        'EMP_ACCESO_DENEGADO',
      );
    });
  });

  describe('EMP-DEP-003 — Puerto de Referencia Empresa', () => {
    it('resuelve referencia por id y por alias', async () => {
      asignacion.aliasValidos.add('yerba-norte');
      const creada = await registrarEmpresa.ejecutar(
        { nombre: 'Yerba Norte', alias: 'yerba-norte' },
        { actorId: 'admin-1', rol: 'SuperAdministrador' },
      );

      const refId = await servicioReferencia.obtenerPorId(creada.id);
      expect(refId?.alias).toBe('yerba-norte');
      expect(refId?.estado).toBe(EstadoEmpresa.ACTIVA);

      const refAlias = await servicioReferencia.obtenerPorAlias('yerba-norte');
      expect(refAlias?.id).toBe(creada.id);
    });
  });
});
