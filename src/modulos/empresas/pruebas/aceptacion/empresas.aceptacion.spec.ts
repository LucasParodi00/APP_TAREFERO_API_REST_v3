import { RegistrarEmpresa } from '../../aplicacion/comandos/registrar-empresa.caso-de-uso';
import { ConsultarEmpresa } from '../../aplicacion/consultas/consultar-empresa.caso-de-uso';
import { ListarEmpresas } from '../../aplicacion/consultas/listar-empresas.caso-de-uso';
import { ModificarEmpresa } from '../../aplicacion/comandos/modificar-empresa.caso-de-uso';
import { ModificarConfiguracionGeneral } from '../../aplicacion/comandos/modificar-configuracion-general.caso-de-uso';
import { SuspenderEmpresa } from '../../aplicacion/comandos/suspender-empresa.caso-de-uso';
import { ReactivarEmpresa } from '../../aplicacion/comandos/reactivar-empresa.caso-de-uso';
import { CerrarEmpresa } from '../../aplicacion/comandos/cerrar-empresa.caso-de-uso';
import { RepositorioEmpresas } from '../../aplicacion/puertos/salida/repositorio-empresas.puerto';
import { VerificadorAsignacionComercial } from '../../aplicacion/puertos/salida/verificador-asignacion-comercial.puerto';
import { Empresa } from '../../dominio/agregados/empresa';
import {
  CriteriosListadoEmpresas,
  ResultadoListadoEmpresas,
} from '../../aplicacion/modelos-lectura';
import { MapeadorEmpresaLectura } from '../../aplicacion/mapeadores/mapeador-empresa-lectura';
import {
  PermisoDenegado,
  EmpresaNoEncontrada,
  ConflictoConcurrencia,
} from '../../aplicacion/errores';
import {
  NombreEmpresaObligatorio,
  NombreEmpresaInvalido,
  AliasEmpresaInvalido,
  AliasNoDisponible,
  CuitInvalido,
  UbicacionGeograficaInvalida,
  TextoDescriptivoInvalido,
  AsignacionComercialRequerida,
  TransicionEstadoInvalida,
  AliasInmutable,
  ModificacionNoPermitida,
  ConfiguracionGeneralInvalida,
} from '../../dominio/errores';

class RepositorioAceptacion implements RepositorioEmpresas {
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

class VerificadorAsignacionComercialAceptacion implements VerificadorAsignacionComercial {
  habilitado = true;
  confirmarAsignacion(empresaId: string): Promise<boolean> {
    void empresaId;
    return Promise.resolve(this.habilitado);
  }
}

describe('Pruebas de Aceptación — Módulo Empresas (T09)', () => {
  let repo: RepositorioAceptacion;
  let verificador: VerificadorAsignacionComercialAceptacion;

  const superAdmin = {
    actorId: 'super-admin-1',
    rol: 'SUPER_ADMINISTRADOR',
  };

  const adminPropia = {
    actorId: 'admin-emp-1',
    rol: 'ADMINISTRADOR',
    empresaId: '019313ea-1111-7000-8000-000000000001',
  };

  const adminOtra = {
    actorId: 'admin-otra',
    rol: 'ADMINISTRADOR',
    empresaId: '019313ea-9999-7000-8000-000000000099',
  };

  beforeEach(() => {
    repo = new RepositorioAceptacion();
    verificador = new VerificadorAsignacionComercialAceptacion();
  });

  describe('@EMP-UC-001 Registrar Empresa', () => {
    it('@EMP-UC-001 @AC-01 registro exitoso con datos mínimos', async () => {
      const uc = new RegistrarEmpresa(repo, verificador);
      const res = await uc.ejecutar(
        {
          id: '019313ea-1111-7000-8000-000000000001',
          nombre: 'Yerba Norte',
          alias: 'yerba-norte',
        },
        superAdmin,
      );
      expect(res.estado).toBe('ACTIVA');
      expect(res.configuracionGeneral.paisReferencia).toBe('AR');
      expect(res.configuracionGeneral.zonaHoraria).toBe(
        'America/Argentina/Buenos_Aires',
      );
      expect(res.configuracionGeneral.monedaPrincipal).toBe('ARS');
    });

    it('@EMP-UC-001 @AC-02 registro exitoso con datos completos', async () => {
      const uc = new RegistrarEmpresa(repo, verificador);
      const res = await uc.ejecutar(
        {
          id: '019313ea-1111-7000-8000-000000000001',
          nombre: 'Yerba Norte',
          alias: 'yerba-norte',
          cuit: '20123456789',
          responsableNombre: 'Juan Perez',
          ubicacionTexto: 'Ruta 12',
          ubicacionGeografica: { latitud: -27.36, longitud: -55.9 },
          descripcionActividad: 'Secadero de yerba',
        },
        superAdmin,
      );
      expect(res.cuit).toBe('20123456789');
      expect(res.ubicacionGeografica?.latitud).toBe(-27.36);
    });

    it('@EMP-UC-001 @AC-03 normalización de espacios en textos', async () => {
      const uc = new RegistrarEmpresa(repo, verificador);
      const res = await uc.ejecutar(
        {
          id: '019313ea-1111-7000-8000-000000000001',
          nombre: '  Yerba Norte  ',
          alias: 'yerba-norte',
          responsableNombre: '  Juan Perez  ',
        },
        superAdmin,
      );
      expect(res.nombre).toBe('Yerba Norte');
      expect(res.responsableNombre).toBe('Juan Perez');
    });

    it('@EMP-UC-001 @AC-04 rechazo por nombre vacío o solo espacios', async () => {
      const uc = new RegistrarEmpresa(repo, verificador);
      await expect(
        uc.ejecutar(
          {
            id: '019313ea-1111-7000-8000-000000000001',
            nombre: '   ',
            alias: 'yerba-norte',
          },
          superAdmin,
        ),
      ).rejects.toThrow(NombreEmpresaObligatorio);
    });

    it('@EMP-UC-001 @AC-05 rechazo por actor no autorizado', async () => {
      const uc = new RegistrarEmpresa(repo, verificador);
      await expect(
        uc.ejecutar(
          {
            id: '019313ea-1111-7000-8000-000000000001',
            nombre: 'Yerba Norte',
            alias: 'yerba-norte',
          },
          adminPropia,
        ),
      ).rejects.toThrow(PermisoDenegado);
    });

    it('@EMP-UC-001 @AC-06 rechazo por alias duplicado', async () => {
      const uc = new RegistrarEmpresa(repo, verificador);
      await uc.ejecutar(
        {
          id: '019313ea-1111-7000-8000-000000000001',
          nombre: 'Yerba Norte',
          alias: 'yerba-norte',
        },
        superAdmin,
      );
      await expect(
        uc.ejecutar(
          {
            id: '019313ea-2222-7000-8000-000000000002',
            nombre: 'Otra Yerba',
            alias: 'yerba-norte',
          },
          superAdmin,
        ),
      ).rejects.toThrow(AliasNoDisponible);
    });

    it('@EMP-UC-001 @AC-07 rechazo por formato de alias inválido', async () => {
      const uc = new RegistrarEmpresa(repo, verificador);
      await expect(
        uc.ejecutar(
          {
            id: '019313ea-1111-7000-8000-000000000001',
            nombre: 'Yerba Norte',
            alias: '-invalido-',
          },
          superAdmin,
        ),
      ).rejects.toThrow(AliasEmpresaInvalido);
    });

    it('@EMP-UC-001 @AC-08 rechazo por CUIT no numérico o cantidad distinta de 11', async () => {
      const uc = new RegistrarEmpresa(repo, verificador);
      await expect(
        uc.ejecutar(
          {
            id: '019313ea-1111-7000-8000-000000000001',
            nombre: 'Yerba Norte',
            alias: 'yerba-norte',
            cuit: '20-12345678-9',
          },
          superAdmin,
        ),
      ).rejects.toThrow(CuitInvalido);
    });

    it('@EMP-UC-001 @AC-09 rechazo por punto geográfico incompleto o fuera de rango', async () => {
      const uc = new RegistrarEmpresa(repo, verificador);
      await expect(
        uc.ejecutar(
          {
            id: '019313ea-1111-7000-8000-000000000001',
            nombre: 'Yerba Norte',
            alias: 'yerba-norte',
            ubicacionGeografica: { latitud: -95, longitud: -55.9 },
          },
          superAdmin,
        ),
      ).rejects.toThrow(UbicacionGeograficaInvalida);
    });

    it('@EMP-UC-001 @AC-10 rechazo por textos que superan longitud máxima', async () => {
      const uc = new RegistrarEmpresa(repo, verificador);
      await expect(
        uc.ejecutar(
          {
            id: '019313ea-1111-7000-8000-000000000001',
            nombre: 'Yerba Norte',
            alias: 'yerba-norte',
            responsableNombre: 'A'.repeat(121),
          },
          superAdmin,
        ),
      ).rejects.toThrow(TextoDescriptivoInvalido);
    });

    it('@EMP-UC-001 @AC-11 rechazo por falta de asignación comercial confirmada', async () => {
      verificador.habilitado = false;
      const uc = new RegistrarEmpresa(repo, verificador);
      await expect(
        uc.ejecutar(
          {
            id: '019313ea-1111-7000-8000-000000000001',
            nombre: 'Yerba Norte',
            alias: 'yerba-norte',
          },
          superAdmin,
        ),
      ).rejects.toThrow(AsignacionComercialRequerida);
    });
  });

  describe('@EMP-UC-002 Consultar Empresa', () => {
    beforeEach(async () => {
      const registrar = new RegistrarEmpresa(repo, verificador);
      await registrar.ejecutar(
        {
          id: '019313ea-1111-7000-8000-000000000001',
          nombre: 'Yerba Norte',
          alias: 'yerba-norte',
        },
        superAdmin,
      );
    });

    it('@EMP-UC-002 @AC-01 consulta exitosa por SuperAdministrador', async () => {
      const uc = new ConsultarEmpresa(repo);
      const res = await uc.ejecutar(
        { idOAlias: '019313ea-1111-7000-8000-000000000001' },
        superAdmin,
      );
      expect(res.nombre).toBe('Yerba Norte');
    });

    it('@EMP-UC-002 @AC-02 consulta exitosa por Administrador sobre su Empresa', async () => {
      const uc = new ConsultarEmpresa(repo);
      const res = await uc.ejecutar(
        { idOAlias: '019313ea-1111-7000-8000-000000000001' },
        adminPropia,
      );
      expect(res.id).toBe('019313ea-1111-7000-8000-000000000001');
    });

    it('@EMP-UC-002 @AC-03 rechazo por Administrador que intenta acceder a otra Empresa', async () => {
      const uc = new ConsultarEmpresa(repo);
      await expect(
        uc.ejecutar(
          { idOAlias: '019313ea-1111-7000-8000-000000000001' },
          adminOtra,
        ),
      ).rejects.toThrow(PermisoDenegado);
    });
  });

  describe('@EMP-UC-003 Listar Empresas', () => {
    beforeEach(async () => {
      const registrar = new RegistrarEmpresa(repo, verificador);
      await registrar.ejecutar(
        {
          id: '019313ea-1111-7000-8000-000000000001',
          nombre: 'Yerba Alfa',
          alias: 'yerba-alfa',
        },
        superAdmin,
      );
      await registrar.ejecutar(
        {
          id: '019313ea-2222-7000-8000-000000000002',
          nombre: 'Yerba Beta',
          alias: 'yerba-beta',
        },
        superAdmin,
      );
    });

    it('@EMP-UC-003 @AC-01 listado exitoso con paginación', async () => {
      const uc = new ListarEmpresas(repo);
      const res = await uc.ejecutar({ pagina: 1, limite: 10 }, superAdmin);
      expect(res.total).toBe(2);
      expect(res.elementos.length).toBe(2);
    });

    it('@EMP-UC-003 @AC-02 filtrado por estado y nombre', async () => {
      const uc = new ListarEmpresas(repo);
      const res = await uc.ejecutar(
        { pagina: 1, limite: 10, nombre: 'Alfa' },
        superAdmin,
      );
      expect(res.total).toBe(1);
      expect(res.elementos[0].alias).toBe('yerba-alfa');
    });

    it('@EMP-UC-003 @AC-03 rechazo por actor no autorizado', async () => {
      const uc = new ListarEmpresas(repo);
      await expect(
        uc.ejecutar({ pagina: 1, limite: 10 }, adminPropia),
      ).rejects.toThrow(PermisoDenegado);
    });
  });

  describe('@EMP-UC-004 Modificar Empresa', () => {
    beforeEach(async () => {
      const registrar = new RegistrarEmpresa(repo, verificador);
      await registrar.ejecutar(
        {
          id: '019313ea-1111-7000-8000-000000000001',
          nombre: 'Yerba Norte',
          alias: 'yerba-norte',
        },
        superAdmin,
      );
    });

    it('@EMP-UC-004 @AC-01 modificación exitosa por Administrador en su Empresa activa', async () => {
      const uc = new ModificarEmpresa(repo);
      const res = await uc.ejecutar(
        {
          id: '019313ea-1111-7000-8000-000000000001',
          versionEsperada: 1,
          nombre: 'Yerba Norte Renovada',
        },
        adminPropia,
      );
      expect(res.nombre).toBe('Yerba Norte Renovada');
      expect(res.version).toBe(2);
    });

    it('@EMP-UC-004 @AC-02 modificación exitosa por SuperAdministrador en Empresa suspendida', async () => {
      const suspender = new SuspenderEmpresa(repo);
      await suspender.ejecutar(
        { id: '019313ea-1111-7000-8000-000000000001', versionEsperada: 1 },
        superAdmin,
      );

      const uc = new ModificarEmpresa(repo);
      const res = await uc.ejecutar(
        {
          id: '019313ea-1111-7000-8000-000000000001',
          versionEsperada: 2,
          responsableNombre: 'Nuevo Responsable',
        },
        superAdmin,
      );
      expect(res.responsableNombre).toBe('Nuevo Responsable');
    });

    it('@EMP-UC-004 @AC-03 rechazo por intento de modificar el alias', async () => {
      const uc = new ModificarEmpresa(repo);
      await expect(
        uc.ejecutar(
          {
            id: '019313ea-1111-7000-8000-000000000001',
            versionEsperada: 1,
            nuevoAlias: 'otro-alias',
          },
          superAdmin,
        ),
      ).rejects.toThrow(AliasInmutable);
    });

    it('@EMP-UC-004 @AC-04 rechazo por Administrador en Empresa suspendida', async () => {
      const suspender = new SuspenderEmpresa(repo);
      await suspender.ejecutar(
        { id: '019313ea-1111-7000-8000-000000000001', versionEsperada: 1 },
        superAdmin,
      );

      const uc = new ModificarEmpresa(repo);
      await expect(
        uc.ejecutar(
          {
            id: '019313ea-1111-7000-8000-000000000001',
            versionEsperada: 2,
            nombre: 'Intento',
          },
          adminPropia,
        ),
      ).rejects.toThrow(ModificacionNoPermitida);
    });

    it('@EMP-UC-004 @AC-05 rechazo por modificación en Empresa cerrada', async () => {
      const cerrar = new CerrarEmpresa(repo);
      await cerrar.ejecutar(
        { id: '019313ea-1111-7000-8000-000000000001', versionEsperada: 1 },
        superAdmin,
      );

      const uc = new ModificarEmpresa(repo);
      await expect(
        uc.ejecutar(
          {
            id: '019313ea-1111-7000-8000-000000000001',
            versionEsperada: 2,
            nombre: 'Intento',
          },
          superAdmin,
        ),
      ).rejects.toThrow(ModificacionNoPermitida);
    });

    it('@EMP-UC-004 @AC-06 rechazo por versión previa no coincidente', async () => {
      const uc = new ModificarEmpresa(repo);
      await expect(
        uc.ejecutar(
          {
            id: '019313ea-1111-7000-8000-000000000001',
            versionEsperada: 99,
            nombre: 'Intento',
          },
          superAdmin,
        ),
      ).rejects.toThrow(ConflictoConcurrencia);
    });

    it('@EMP-UC-004 @AC-07 rechazo por Administrador en otra Empresa', async () => {
      const uc = new ModificarEmpresa(repo);
      await expect(
        uc.ejecutar(
          {
            id: '019313ea-1111-7000-8000-000000000001',
            versionEsperada: 1,
            nombre: 'Intento',
          },
          adminOtra,
        ),
      ).rejects.toThrow(PermisoDenegado);
    });

    it('@EMP-UC-004 @AC-08 rechazo por Empresa inexistente', async () => {
      const uc = new ModificarEmpresa(repo);
      await expect(
        uc.ejecutar(
          {
            id: '019313ea-0000-0000-0000-000000000000',
            versionEsperada: 1,
            nombre: 'Intento',
          },
          superAdmin,
        ),
      ).rejects.toThrow(EmpresaNoEncontrada);
    });

    it('@EMP-UC-004 @AC-09 rechazo por nombre vacío o que supera límite', async () => {
      const uc = new ModificarEmpresa(repo);
      await expect(
        uc.ejecutar(
          {
            id: '019313ea-1111-7000-8000-000000000001',
            versionEsperada: 1,
            nombre: 'A'.repeat(121),
          },
          superAdmin,
        ),
      ).rejects.toThrow(NombreEmpresaInvalido);
    });

    it('@EMP-UC-004 @AC-10 rechazo por CUIT inválido', async () => {
      const uc = new ModificarEmpresa(repo);
      await expect(
        uc.ejecutar(
          {
            id: '019313ea-1111-7000-8000-000000000001',
            versionEsperada: 1,
            cuit: 'invalido',
          },
          superAdmin,
        ),
      ).rejects.toThrow(CuitInvalido);
    });
  });

  describe('@EMP-UC-005 Suspender Empresa', () => {
    beforeEach(async () => {
      const registrar = new RegistrarEmpresa(repo, verificador);
      await registrar.ejecutar(
        {
          id: '019313ea-1111-7000-8000-000000000001',
          nombre: 'Yerba Norte',
          alias: 'yerba-norte',
        },
        superAdmin,
      );
    });

    it('@EMP-UC-005 @AC-01 suspensión exitosa de Empresa activa', async () => {
      const uc = new SuspenderEmpresa(repo);
      const res = await uc.ejecutar(
        { id: '019313ea-1111-7000-8000-000000000001', versionEsperada: 1 },
        superAdmin,
      );
      expect(res.estado).toBe('SUSPENDIDA');
      expect(res.version).toBe(2);
    });

    it('@EMP-UC-005 @AC-02 rechazo por Empresa que ya no está activa', async () => {
      const uc = new SuspenderEmpresa(repo);
      await uc.ejecutar(
        { id: '019313ea-1111-7000-8000-000000000001', versionEsperada: 1 },
        superAdmin,
      );
      await expect(
        uc.ejecutar(
          { id: '019313ea-1111-7000-8000-000000000001', versionEsperada: 2 },
          superAdmin,
        ),
      ).rejects.toThrow(TransicionEstadoInvalida);
    });

    it('@EMP-UC-005 @AC-03 rechazo por actor no autorizado', async () => {
      const uc = new SuspenderEmpresa(repo);
      await expect(
        uc.ejecutar(
          { id: '019313ea-1111-7000-8000-000000000001', versionEsperada: 1 },
          adminPropia,
        ),
      ).rejects.toThrow(PermisoDenegado);
    });
  });

  describe('@EMP-UC-006 Reactivar Empresa', () => {
    beforeEach(async () => {
      const registrar = new RegistrarEmpresa(repo, verificador);
      await registrar.ejecutar(
        {
          id: '019313ea-1111-7000-8000-000000000001',
          nombre: 'Yerba Norte',
          alias: 'yerba-norte',
        },
        superAdmin,
      );
      const suspender = new SuspenderEmpresa(repo);
      await suspender.ejecutar(
        { id: '019313ea-1111-7000-8000-000000000001', versionEsperada: 1 },
        superAdmin,
      );
    });

    it('@EMP-UC-006 @AC-01 reactivación exitosa de Empresa suspendida', async () => {
      const uc = new ReactivarEmpresa(repo);
      const res = await uc.ejecutar(
        { id: '019313ea-1111-7000-8000-000000000001', versionEsperada: 2 },
        superAdmin,
      );
      expect(res.estado).toBe('ACTIVA');
      expect(res.version).toBe(3);
    });

    it('@EMP-UC-006 @AC-02 rechazo por Empresa no suspendida', async () => {
      const reactivar = new ReactivarEmpresa(repo);
      await reactivar.ejecutar(
        { id: '019313ea-1111-7000-8000-000000000001', versionEsperada: 2 },
        superAdmin,
      );

      await expect(
        reactivar.ejecutar(
          { id: '019313ea-1111-7000-8000-000000000001', versionEsperada: 3 },
          superAdmin,
        ),
      ).rejects.toThrow(TransicionEstadoInvalida);
    });

    it('@EMP-UC-006 @AC-03 rechazo por actor no autorizado', async () => {
      const uc = new ReactivarEmpresa(repo);
      await expect(
        uc.ejecutar(
          { id: '019313ea-1111-7000-8000-000000000001', versionEsperada: 2 },
          adminPropia,
        ),
      ).rejects.toThrow(PermisoDenegado);
    });
  });

  describe('@EMP-UC-007 Cerrar Empresa', () => {
    beforeEach(async () => {
      const registrar = new RegistrarEmpresa(repo, verificador);
      await registrar.ejecutar(
        {
          id: '019313ea-1111-7000-8000-000000000001',
          nombre: 'Yerba Norte',
          alias: 'yerba-norte',
        },
        superAdmin,
      );
    });

    it('@EMP-UC-007 @AC-01 cierre exitoso de Empresa activa o suspendida', async () => {
      const uc = new CerrarEmpresa(repo);
      const res = await uc.ejecutar(
        { id: '019313ea-1111-7000-8000-000000000001', versionEsperada: 1 },
        superAdmin,
      );
      expect(res.estado).toBe('CERRADA');
    });

    it('@EMP-UC-007 @AC-02 rechazo por Empresa ya cerrada', async () => {
      const uc = new CerrarEmpresa(repo);
      await uc.ejecutar(
        { id: '019313ea-1111-7000-8000-000000000001', versionEsperada: 1 },
        superAdmin,
      );
      await expect(
        uc.ejecutar(
          { id: '019313ea-1111-7000-8000-000000000001', versionEsperada: 2 },
          superAdmin,
        ),
      ).rejects.toThrow(TransicionEstadoInvalida);
    });

    it('@EMP-UC-007 @AC-03 rechazo por actor no autorizado', async () => {
      const uc = new CerrarEmpresa(repo);
      await expect(
        uc.ejecutar(
          { id: '019313ea-1111-7000-8000-000000000001', versionEsperada: 1 },
          adminPropia,
        ),
      ).rejects.toThrow(PermisoDenegado);
    });
  });

  describe('@EMP-UC-008 Modificar Configuración General', () => {
    beforeEach(async () => {
      const registrar = new RegistrarEmpresa(repo, verificador);
      await registrar.ejecutar(
        {
          id: '019313ea-1111-7000-8000-000000000001',
          nombre: 'Yerba Norte',
          alias: 'yerba-norte',
        },
        superAdmin,
      );
    });

    it('@EMP-UC-008 @AC-01 modificación exitosa con valores válidos', async () => {
      const uc = new ModificarConfiguracionGeneral(repo);
      const res = await uc.ejecutar(
        {
          empresaId: '019313ea-1111-7000-8000-000000000001',
          versionEsperada: 1,
          paisReferencia: 'BR',
          zonaHoraria: 'America/Sao_Paulo',
          monedaPrincipal: 'BRL',
        },
        adminPropia,
      );
      expect(res.configuracionGeneral.paisReferencia).toBe('BR');
      expect(res.configuracionGeneral.zonaHoraria).toBe('America/Sao_Paulo');
      expect(res.configuracionGeneral.monedaPrincipal).toBe('BRL');
    });

    it('@EMP-UC-008 @AC-02 rechazo por país no ISO 3166-1', async () => {
      const uc = new ModificarConfiguracionGeneral(repo);
      await expect(
        uc.ejecutar(
          {
            empresaId: '019313ea-1111-7000-8000-000000000001',
            versionEsperada: 1,
            paisReferencia: 'ARG',
            zonaHoraria: 'America/Argentina/Buenos_Aires',
            monedaPrincipal: 'ARS',
          },
          superAdmin,
        ),
      ).rejects.toThrow(ConfiguracionGeneralInvalida);
    });

    it('@EMP-UC-008 @AC-03 rechazo por zona horaria inexistente', async () => {
      const uc = new ModificarConfiguracionGeneral(repo);
      await expect(
        uc.ejecutar(
          {
            empresaId: '019313ea-1111-7000-8000-000000000001',
            versionEsperada: 1,
            paisReferencia: 'AR',
            zonaHoraria: 'Inexistente/Falsa',
            monedaPrincipal: 'ARS',
          },
          superAdmin,
        ),
      ).rejects.toThrow(ConfiguracionGeneralInvalida);
    });

    it('@EMP-UC-008 @AC-04 rechazo por moneda no ISO 4217', async () => {
      const uc = new ModificarConfiguracionGeneral(repo);
      await expect(
        uc.ejecutar(
          {
            empresaId: '019313ea-1111-7000-8000-000000000001',
            versionEsperada: 1,
            paisReferencia: 'AR',
            zonaHoraria: 'America/Argentina/Buenos_Aires',
            monedaPrincipal: 'PESOS',
          },
          superAdmin,
        ),
      ).rejects.toThrow(ConfiguracionGeneralInvalida);
    });

    it('@EMP-UC-008 @AC-05 rechazo por versión previa no coincidente', async () => {
      const uc = new ModificarConfiguracionGeneral(repo);
      await expect(
        uc.ejecutar(
          {
            empresaId: '019313ea-1111-7000-8000-000000000001',
            versionEsperada: 99,
            paisReferencia: 'BR',
            zonaHoraria: 'America/Sao_Paulo',
            monedaPrincipal: 'BRL',
          },
          superAdmin,
        ),
      ).rejects.toThrow(ConflictoConcurrencia);
    });
  });
});
