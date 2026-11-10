import { RegistrarEmpresa } from '../../aplicacion/comandos/registrar-empresa.caso-de-uso';
import { ConsultarEmpresa } from '../../aplicacion/consultas/consultar-empresa.caso-de-uso';
import { ListarEmpresas } from '../../aplicacion/consultas/listar-empresas.caso-de-uso';
import { ModificarEmpresa } from '../../aplicacion/comandos/modificar-empresa.caso-de-uso';
import { ModificarConfiguracionGeneral } from '../../aplicacion/comandos/modificar-configuracion-general.caso-de-uso';
import { RepositorioEmpresas } from '../../aplicacion/puertos/salida/repositorio-empresas.puerto';
import { VerificadorAsignacionComercial } from '../../aplicacion/puertos/salida/verificador-asignacion-comercial.puerto';
import { Empresa } from '../../dominio/agregados/empresa';
import {
  CriteriosListadoEmpresas,
  ResultadoListadoEmpresas,
} from '../../aplicacion/modelos-lectura';
import {
  PermisoDenegado,
  EmpresaNoEncontrada,
  ConflictoConcurrencia,
} from '../../aplicacion/errores';
import {
  AliasNoDisponible,
  AsignacionComercialRequerida,
} from '../../dominio/errores';
import { MapeadorEmpresaLectura } from '../../aplicacion/mapeadores/mapeador-empresa-lectura';

class RepositorioEmpresasEnMemoria implements RepositorioEmpresas {
  private empresas = new Map<string, Empresa>();

  guardar(empresa: Empresa): Promise<void> {
    this.empresas.set(empresa.id, empresa);
    return Promise.resolve();
  }

  obtenerPorId(id: string): Promise<Empresa | null> {
    return Promise.resolve(this.empresas.get(id) ?? null);
  }

  obtenerPorAlias(alias: string): Promise<Empresa | null> {
    for (const emp of this.empresas.values()) {
      if (emp.alias.valor === alias) {
        return Promise.resolve(emp);
      }
    }
    return Promise.resolve(null);
  }

  async existeAlias(alias: string): Promise<boolean> {
    const encontrada = await this.obtenerPorAlias(alias);
    return encontrada !== null;
  }

  listar(
    criterios: CriteriosListadoEmpresas,
  ): Promise<ResultadoListadoEmpresas> {
    let filtradas = Array.from(this.empresas.values());
    if (criterios.estado) {
      filtradas = filtradas.filter((e) => e.estado === criterios.estado);
    }
    if (criterios.nombre) {
      filtradas = filtradas.filter((e) =>
        e.nombre.valor.toLowerCase().includes(criterios.nombre!.toLowerCase()),
      );
    }
    const total = filtradas.length;
    const inicio = (criterios.pagina - 1) * criterios.limite;
    const paginadas = filtradas.slice(inicio, inicio + criterios.limite);
    return Promise.resolve({
      elementos: paginadas.map((e) => MapeadorEmpresaLectura.aLectura(e)),
      total,
      pagina: criterios.pagina,
      limite: criterios.limite,
      totalPaginas: Math.ceil(total / criterios.limite),
    });
  }
}

class VerificadorAsignacionComercialMock implements VerificadorAsignacionComercial {
  habilitado = true;
  confirmarAsignacion(): Promise<boolean> {
    return Promise.resolve(this.habilitado);
  }
}

describe('Casos de Uso — Gestión de Datos de Empresas (T04)', () => {
  let repo: RepositorioEmpresasEnMemoria;
  let verificador: VerificadorAsignacionComercialMock;
  const superAdminCtx = {
    actorId: 'super-admin-1',
    rol: 'SUPER_ADMINISTRADOR',
  };
  const adminEmpresa1Ctx = {
    actorId: 'admin-1',
    rol: 'ADMINISTRADOR',
    empresaId: 'empresa-1',
  };

  beforeEach(() => {
    repo = new RepositorioEmpresasEnMemoria();
    verificador = new VerificadorAsignacionComercialMock();
  });

  describe('EMP-UC-001 — RegistrarEmpresa', () => {
    it('permite al SuperAdministrador registrar una empresa válida', async () => {
      const uc = new RegistrarEmpresa(repo, verificador);
      const resultado = await uc.ejecutar(
        {
          id: 'empresa-1',
          nombre: 'Yerba Norte',
          alias: 'yerba-norte',
        },
        superAdminCtx,
      );

      expect(resultado.id).toBe('empresa-1');
      expect(resultado.nombre).toBe('Yerba Norte');
      expect(resultado.alias).toBe('yerba-norte');
      expect(resultado.estado).toBe('ACTIVA');
      expect(resultado.version).toBe(1);
      expect(resultado.configuracionGeneral.paisReferencia).toBe('AR');
    });

    it('rechaza con PermisoDenegado si el actor no es SuperAdministrador', async () => {
      const uc = new RegistrarEmpresa(repo, verificador);
      await expect(
        uc.ejecutar(
          { id: 'emp-2', nombre: 'Test', alias: 'test-emp' },
          adminEmpresa1Ctx,
        ),
      ).rejects.toThrow(PermisoDenegado);
    });

    it('rechaza con AliasNoDisponible si el alias ya existe', async () => {
      const uc = new RegistrarEmpresa(repo, verificador);
      await uc.ejecutar(
        { id: 'empresa-1', nombre: 'Yerba Norte', alias: 'yerba-norte' },
        superAdminCtx,
      );

      await expect(
        uc.ejecutar(
          { id: 'empresa-2', nombre: 'Otra', alias: 'yerba-norte' },
          superAdminCtx,
        ),
      ).rejects.toThrow(AliasNoDisponible);
    });

    it('rechaza si la asignación comercial no es confirmada', async () => {
      verificador.habilitado = false;
      const uc = new RegistrarEmpresa(repo, verificador);

      await expect(
        uc.ejecutar(
          { id: 'empresa-sin-plan', nombre: 'Sin Plan', alias: 'sin-plan' },
          superAdminCtx,
        ),
      ).rejects.toThrow(AsignacionComercialRequerida);
    });
  });

  describe('EMP-UC-002 — ConsultarEmpresa', () => {
    beforeEach(async () => {
      const registrar = new RegistrarEmpresa(repo, verificador);
      await registrar.ejecutar(
        { id: 'empresa-1', nombre: 'Yerba Norte', alias: 'yerba-norte' },
        superAdminCtx,
      );
    });

    it('permite al SuperAdministrador consultar cualquier empresa por ID o alias', async () => {
      const uc = new ConsultarEmpresa(repo);
      const resId = await uc.ejecutar({ idOAlias: 'empresa-1' }, superAdminCtx);
      expect(resId.nombre).toBe('Yerba Norte');

      const resAlias = await uc.ejecutar(
        { idOAlias: 'yerba-norte' },
        superAdminCtx,
      );
      expect(resAlias.id).toBe('empresa-1');
    });

    it('permite al Administrador consultar su propia empresa', async () => {
      const uc = new ConsultarEmpresa(repo);
      const res = await uc.ejecutar(
        { idOAlias: 'empresa-1' },
        adminEmpresa1Ctx,
      );
      expect(res.id).toBe('empresa-1');
    });

    it('rechaza con PermisoDenegado si el Administrador consulta otra empresa', async () => {
      const uc = new ConsultarEmpresa(repo);
      await expect(
        uc.ejecutar({ idOAlias: 'otra-empresa' }, adminEmpresa1Ctx),
      ).rejects.toThrow(PermisoDenegado);
    });

    it('rechaza con EmpresaNoEncontrada si no existe la empresa', async () => {
      const uc = new ConsultarEmpresa(repo);
      await expect(
        uc.ejecutar({ idOAlias: 'no-existe' }, superAdminCtx),
      ).rejects.toThrow(EmpresaNoEncontrada);
    });
  });

  describe('EMP-UC-003 — ListarEmpresas', () => {
    beforeEach(async () => {
      const registrar = new RegistrarEmpresa(repo, verificador);
      await registrar.ejecutar(
        { id: 'emp-1', nombre: 'Yerba 1', alias: 'yerba-1' },
        superAdminCtx,
      );
      await registrar.ejecutar(
        { id: 'emp-2', nombre: 'Yerba 2', alias: 'yerba-2' },
        superAdminCtx,
      );
    });

    it('permite al SuperAdministrador listar con paginación', async () => {
      const uc = new ListarEmpresas(repo);
      const res = await uc.ejecutar({ pagina: 1, limite: 10 }, superAdminCtx);
      expect(res.total).toBe(2);
      expect(res.elementos.length).toBe(2);
    });

    it('rechaza con PermisoDenegado a un Administrador', async () => {
      const uc = new ListarEmpresas(repo);
      await expect(
        uc.ejecutar({ pagina: 1, limite: 10 }, adminEmpresa1Ctx),
      ).rejects.toThrow(PermisoDenegado);
    });
  });

  describe('EMP-UC-004 — ModificarEmpresa', () => {
    beforeEach(async () => {
      const registrar = new RegistrarEmpresa(repo, verificador);
      await registrar.ejecutar(
        { id: 'empresa-1', nombre: 'Yerba Norte', alias: 'yerba-norte' },
        superAdminCtx,
      );
    });

    it('permite modificar respetando concurrencia optimista', async () => {
      const uc = new ModificarEmpresa(repo);
      const res = await uc.ejecutar(
        {
          id: 'empresa-1',
          versionEsperada: 1,
          nombre: 'Yerba Norte SA',
          cuit: '30777777779',
        },
        adminEmpresa1Ctx,
      );

      expect(res.nombre).toBe('Yerba Norte SA');
      expect(res.cuit).toBe('30777777779');
      expect(res.version).toBe(2);
    });

    it('rechaza con ConflictoConcurrencia si la version esperada no coincide', async () => {
      const uc = new ModificarEmpresa(repo);
      await expect(
        uc.ejecutar(
          {
            id: 'empresa-1',
            versionEsperada: 99,
            nombre: 'Nuevo',
          },
          adminEmpresa1Ctx,
        ),
      ).rejects.toThrow(ConflictoConcurrencia);
    });
  });

  describe('EMP-UC-008 — ModificarConfiguracionGeneral', () => {
    beforeEach(async () => {
      const registrar = new RegistrarEmpresa(repo, verificador);
      await registrar.ejecutar(
        { id: 'empresa-1', nombre: 'Yerba Norte', alias: 'yerba-norte' },
        superAdminCtx,
      );
    });

    it('permite modificar la configuración general con versión previa coincidente', async () => {
      const uc = new ModificarConfiguracionGeneral(repo);
      const res = await uc.ejecutar(
        {
          empresaId: 'empresa-1',
          versionEsperada: 1,
          paisReferencia: 'BR',
          zonaHoraria: 'America/Sao_Paulo',
          monedaPrincipal: 'BRL',
        },
        adminEmpresa1Ctx,
      );

      expect(res.configuracionGeneral.paisReferencia).toBe('BR');
      expect(res.configuracionGeneral.zonaHoraria).toBe('America/Sao_Paulo');
      expect(res.configuracionGeneral.monedaPrincipal).toBe('BRL');
      expect(res.version).toBe(2);
    });
  });
});
