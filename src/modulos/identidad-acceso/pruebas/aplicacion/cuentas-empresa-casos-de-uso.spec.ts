import { HabilitarCuentaEmpresa } from '../../aplicacion/comandos/habilitar-cuenta-empresa.caso-de-uso';
import { ConsultarCuentaEmpresa } from '../../aplicacion/consultas/consultar-cuenta-empresa.caso-de-uso';
import { ListarCuentasEmpresa } from '../../aplicacion/consultas/listar-cuentas-empresa.caso-de-uso';
import { ModificarHabilitacionCuenta } from '../../aplicacion/comandos/modificar-habilitacion-cuenta.caso-de-uso';
import { SuspenderCuentaEmpresa } from '../../aplicacion/comandos/suspender-cuenta-empresa.caso-de-uso';
import { ReactivarCuentaEmpresa } from '../../aplicacion/comandos/reactivar-cuenta-empresa.caso-de-uso';
import {
  RepositorioCuentasEmpresa,
  CriteriosListadoCuentas,
  ResultadoPaginado,
} from '../../aplicacion/puertos/salida/repositorio-cuentas-empresa';
import { VerificadorEmpresaPuerto } from '../../aplicacion/puertos/salida/verificador-empresa.puerto';
import {
  VerificadorPersona,
  EstadoVerificacionPersona,
} from '../../aplicacion/puertos/salida/verificador-persona.puerto';
import {
  VerificadorElegibilidadComercial,
  ResultadoElegibilidadComercial,
} from '../../aplicacion/puertos/salida/verificador-elegibilidad-comercial.puerto';
import {
  ServicioCriptografia,
  PayloadTokenAcceso,
} from '../../aplicacion/puertos/salida/servicio-criptografia.puerto';
import { RepositorioIntervencionesSoporte } from '../../aplicacion/puertos/salida/repositorio-intervenciones-soporte';
import {
  GestorIdempotenciaAcc,
  RegistroIdempotencia,
} from '../../aplicacion/puertos/salida/gestor-idempotencia-acc';
import { CuentaEmpresa } from '../../dominio/entidades/cuenta-empresa';
import { IntervencionSoporte } from '../../dominio/entidades/intervencion-soporte';
import { EstadoCuentaEmpresa } from '../../dominio/enumeraciones/estado-cuenta-empresa';

class RepositorioCuentasMemoria implements RepositorioCuentasEmpresa {
  public cuentas = new Map<string, CuentaEmpresa>();

  public guardar(cuenta: CuentaEmpresa): Promise<void> {
    this.cuentas.set(cuenta.id, cuenta);
    return Promise.resolve();
  }

  public actualizar(cuenta: CuentaEmpresa): Promise<void> {
    this.cuentas.set(cuenta.id, cuenta);
    return Promise.resolve();
  }

  public buscarPorId(id: string): Promise<CuentaEmpresa | null> {
    return Promise.resolve(this.cuentas.get(id) ?? null);
  }

  public buscarPorCorreo(
    empresaId: string,
    correoNormalizado: string,
  ): Promise<CuentaEmpresa | null> {
    for (const c of this.cuentas.values()) {
      if (
        c.empresaId === empresaId &&
        c.correoAcceso.valor === correoNormalizado
      ) {
        return Promise.resolve(c);
      }
    }
    return Promise.resolve(null);
  }

  public buscarPorPersona(
    empresaId: string,
    personaId: string,
  ): Promise<CuentaEmpresa | null> {
    for (const c of this.cuentas.values()) {
      if (c.empresaId === empresaId && c.personaId === personaId) {
        return Promise.resolve(c);
      }
    }
    return Promise.resolve(null);
  }

  public contarPorEmpresa(empresaId: string): Promise<number> {
    let count = 0;
    for (const c of this.cuentas.values()) {
      if (c.empresaId === empresaId) count++;
    }
    return Promise.resolve(count);
  }

  public contarActivas(empresaId: string): Promise<number> {
    let count = 0;
    for (const c of this.cuentas.values()) {
      if (
        c.empresaId === empresaId &&
        c.estado === EstadoCuentaEmpresa.ACTIVA
      ) {
        count++;
      }
    }
    return Promise.resolve(count);
  }

  public listar(
    criterios: CriteriosListadoCuentas,
  ): Promise<ResultadoPaginado<CuentaEmpresa>> {
    const filtradas = Array.from(this.cuentas.values())
      .filter((c) => c.empresaId === criterios.empresaId)
      .sort((a, b) => a.id.localeCompare(b.id));

    const total = filtradas.length;
    const paginadas = filtradas.slice(
      criterios.desplazamiento,
      criterios.desplazamiento + criterios.limite,
    );

    return Promise.resolve({
      datos: paginadas,
      paginacion: {
        total,
        limite: criterios.limite,
        desplazamiento: criterios.desplazamiento,
      },
    });
  }
}

class VerificadorEmpresaMock implements VerificadorEmpresaPuerto {
  public empresasValidas = new Map<string, { alias: string; estado: string }>();

  public existeEmpresa(empresaId: string): Promise<boolean> {
    return Promise.resolve(this.empresasValidas.has(empresaId));
  }

  public obtenerPorId(
    empresaId: string,
  ): Promise<{ id: string; alias: string; estado: string } | null> {
    const e = this.empresasValidas.get(empresaId);
    if (!e) return Promise.resolve(null);
    return Promise.resolve({ id: empresaId, alias: e.alias, estado: e.estado });
  }

  public obtenerPorAlias(
    alias: string,
  ): Promise<{ id: string; alias: string; estado: string } | null> {
    for (const [id, e] of this.empresasValidas.entries()) {
      if (e.alias === alias) {
        return Promise.resolve({ id, alias: e.alias, estado: e.estado });
      }
    }
    return Promise.resolve(null);
  }
}

class VerificadorPersonaMock implements VerificadorPersona {
  public incompatibles = new Set<string>();
  public noDisponibles = new Set<string>();

  public verificar(
    empresaId: string,
    personaId: string,
  ): Promise<EstadoVerificacionPersona> {
    if (this.incompatibles.has(personaId)) {
      return Promise.resolve(EstadoVerificacionPersona.EMPRESA_INCOMPATIBLE);
    }
    if (this.noDisponibles.has(personaId)) {
      return Promise.resolve(EstadoVerificacionPersona.NO_DISPONIBLE);
    }
    return Promise.resolve(EstadoVerificacionPersona.VALIDA);
  }
}

class VerificadorElegibilidadMock implements VerificadorElegibilidadComercial {
  public cupos = new Map<string, number>();
  public fallas = new Set<string>();
  public deshabilitadas = new Set<string>();

  public obtenerElegibilidad(
    empresaId: string,
  ): Promise<ResultadoElegibilidadComercial> {
    if (this.fallas.has(empresaId)) {
      return Promise.reject(new Error('Falla'));
    }
    return Promise.resolve({
      habilitada: !this.deshabilitadas.has(empresaId),
      cupoMaximo: this.cupos.get(empresaId) ?? 5,
    });
  }
}

class ServicioCriptografiaMock implements ServicioCriptografia {
  public hashearContrasenia(c: string): Promise<string> {
    return Promise.resolve(`hash-${c}`);
  }
  public verificarContrasenia(c: string, hash: string): Promise<boolean> {
    return Promise.resolve(hash === `hash-${c}`);
  }
  public generarTokenAleatorio(): string {
    return 'token-aleatorio-mock';
  }
  public hashearToken(t: string): string {
    return `hash-${t}`;
  }
  public generarTokenAcceso(payload: PayloadTokenAcceso): string {
    return `access-${payload.sesionId}`;
  }
  public verificarTokenAcceso(token: string): PayloadTokenAcceso | null {
    if (token.startsWith('access-')) {
      return {
        sesionId: token.replace('access-', ''),
        cuentaId: 'cuenta-mock',
        empresaId: 'empresa-mock',
        roles: ['ADMINISTRADOR'],
      };
    }
    return null;
  }
}

class RepositorioIntervencionesMock implements RepositorioIntervencionesSoporte {
  public intervenciones: IntervencionSoporte[] = [];

  public guardar(intervencion: IntervencionSoporte): Promise<void> {
    this.intervenciones.push(intervencion);
    return Promise.resolve();
  }

  public listarPorEmpresa(): Promise<{
    datos: IntervencionSoporte[];
    total: number;
  }> {
    return Promise.resolve({
      datos: this.intervenciones,
      total: this.intervenciones.length,
    });
  }
}

class GestorIdempotenciaMock implements GestorIdempotenciaAcc {
  public registros = new Map<string, RegistroIdempotencia>();

  public obtener(clave: string): Promise<RegistroIdempotencia | null> {
    return Promise.resolve(this.registros.get(clave) ?? null);
  }

  public guardar(reg: RegistroIdempotencia): Promise<void> {
    this.registros.set(reg.clave, reg);
    return Promise.resolve();
  }
}

describe('Aplicación: Casos de uso de Cuentas de Empresa (PLAN-ACC-0002)', () => {
  let repoCuentas: RepositorioCuentasMemoria;
  let verifEmpresa: VerificadorEmpresaMock;
  let verifPersona: VerificadorPersonaMock;
  let verifElegibilidad: VerificadorElegibilidadMock;
  let cripto: ServicioCriptografiaMock;
  let repoIntervenciones: RepositorioIntervencionesMock;
  let gestorIdemp: GestorIdempotenciaMock;

  let habilitarCuenta: HabilitarCuentaEmpresa;
  let consultarCuenta: ConsultarCuentaEmpresa;
  let listarCuentas: ListarCuentasEmpresa;
  let modificarHabilitacion: ModificarHabilitacionCuenta;
  let suspenderCuenta: SuspenderCuentaEmpresa;
  let reactivarCuenta: ReactivarCuentaEmpresa;

  const empresaId = '550e8400-e29b-41d4-a716-446655440000';
  const superAdminId = 'c7e0c457-3f9b-4bf4-bb85-055f69e6b360';
  const adminId = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';

  beforeEach(() => {
    repoCuentas = new RepositorioCuentasMemoria();
    verifEmpresa = new VerificadorEmpresaMock();
    verifPersona = new VerificadorPersonaMock();
    verifElegibilidad = new VerificadorElegibilidadMock();
    cripto = new ServicioCriptografiaMock();
    repoIntervenciones = new RepositorioIntervencionesMock();
    gestorIdemp = new GestorIdempotenciaMock();

    verifEmpresa.empresasValidas.set(empresaId, {
      alias: 'yerba-san-pedro',
      estado: 'ACTIVA',
    });

    habilitarCuenta = new HabilitarCuentaEmpresa(
      repoCuentas,
      verifEmpresa,
      verifPersona,
      verifElegibilidad,
      cripto,
      repoIntervenciones,
      gestorIdemp,
    );

    consultarCuenta = new ConsultarCuentaEmpresa(
      repoCuentas,
      repoIntervenciones,
    );
    listarCuentas = new ListarCuentasEmpresa(repoCuentas, repoIntervenciones);
    modificarHabilitacion = new ModificarHabilitacionCuenta(
      repoCuentas,
      repoIntervenciones,
      gestorIdemp,
    );
    suspenderCuenta = new SuspenderCuentaEmpresa(
      repoCuentas,
      repoIntervenciones,
      gestorIdemp,
    );
    reactivarCuenta = new ReactivarCuentaEmpresa(
      repoCuentas,
      verifElegibilidad,
      repoIntervenciones,
      gestorIdemp,
    );
  });

  function expectErrorDominio(fn: () => Promise<unknown>, codigo: string) {
    return expect(fn()).rejects.toMatchObject({ codigo });
  }

  describe('ACC-UC-001 — Habilitar Cuenta de Empresa', () => {
    it('SuperAdmin realiza alta inicial de Administrador sin requerir motivo de soporte (ACC-Q-015)', async () => {
      const res = await habilitarCuenta.ejecutar(
        {
          empresaId,
          personaId: 'persona-1',
          correoAcceso: 'Admin@Yerba.com',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: true,
          accesoMovil: false,
          roles: ['ADMINISTRADOR'],
        },
        { actorId: superAdminId, rol: 'SUPER_ADMINISTRADOR' },
      );

      expect(res.id).toBeDefined();
      expect(res.correoAcceso).toBe('admin@yerba.com');
      expect(res.estado).toBe('ACTIVA');
      expect(res.roles).toEqual(['ADMINISTRADOR']);
      expect(res.version).toBe(1);
      // No requirió intervención de soporte porque fue alta inicial
      expect(repoIntervenciones.intervenciones.length).toBe(0);
    });

    it('SuperAdmin en alta posterior exige motivo de soporte y audita la intervención (ACC-BR-011)', async () => {
      // 1. Alta inicial
      await habilitarCuenta.ejecutar(
        {
          empresaId,
          personaId: 'persona-1',
          correoAcceso: 'admin@yerba.com',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: true,
          accesoMovil: false,
          roles: ['ADMINISTRADOR'],
        },
        { actorId: superAdminId, rol: 'SUPER_ADMINISTRADOR' },
      );

      // 2. Alta posterior sin motivo falla
      await expectErrorDominio(
        () =>
          habilitarCuenta.ejecutar(
            {
              empresaId,
              personaId: 'persona-2',
              correoAcceso: 'capataz@yerba.com',
              contrasenia: 'ClaveSegura12345!',
              accesoWeb: true,
              accesoMovil: true,
              roles: ['CAPATAZ'],
            },
            { actorId: superAdminId, rol: 'SUPER_ADMINISTRADOR' },
          ),
        'ACC_CONTEXTO_SOPORTE_REQUERIDO',
      );

      // 3. Alta posterior con motivo se audita
      const res2 = await habilitarCuenta.ejecutar(
        {
          empresaId,
          personaId: 'persona-2',
          correoAcceso: 'capataz@yerba.com',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: true,
          accesoMovil: true,
          roles: ['CAPATAZ'],
          motivoSoporte: 'Soporte solicita alta de capataz',
        },
        { actorId: superAdminId, rol: 'SUPER_ADMINISTRADOR' },
      );

      expect(res2.correoAcceso).toBe('capataz@yerba.com');
      expect(repoIntervenciones.intervenciones.length).toBe(1);
      expect(repoIntervenciones.intervenciones[0].motivo.valor).toBe(
        'Soporte solicita alta de capataz',
      );
    });

    it('Administrador de la Empresa habilita cuenta ordinaria', async () => {
      const res = await habilitarCuenta.ejecutar(
        {
          empresaId,
          personaId: 'persona-emp-1',
          correoAcceso: 'empleado1@yerba.com',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: false,
          accesoMovil: true,
          roles: ['EMPLEADO'],
        },
        { actorId: adminId, rol: 'ADMINISTRADOR', empresaId },
      );

      expect(res.roles).toEqual(['EMPLEADO']);
      expect(res.accesoMovil).toBe(true);
    });

    it('rechaza con ACC_EMPRESA_FUERA_DE_ALCANCE si Administrador opera en otra Empresa', async () => {
      await expectErrorDominio(
        () =>
          habilitarCuenta.ejecutar(
            {
              empresaId: 'otra-empresa-id',
              personaId: 'persona-1',
              correoAcceso: 'admin@otra.com',
              contrasenia: 'ClaveSegura12345!',
              accesoWeb: true,
              accesoMovil: true,
              roles: ['ADMINISTRADOR'],
            },
            { actorId: adminId, rol: 'ADMINISTRADOR', empresaId },
          ),
        'ACC_EMPRESA_FUERA_DE_ALCANCE',
      );
    });

    it('rechaza rol SUPER_ADMINISTRADOR para Cuenta de Empresa con ACC_ROL_NO_ADMITIDO (ACC-BR-007)', async () => {
      await expectErrorDominio(
        () =>
          habilitarCuenta.ejecutar(
            {
              empresaId,
              personaId: 'persona-1',
              correoAcceso: 'admin@yerba.com',
              contrasenia: 'ClaveSegura12345!',
              accesoWeb: true,
              accesoMovil: true,
              roles: ['SUPER_ADMINISTRADOR'],
            },
            { actorId: superAdminId, rol: 'SUPER_ADMINISTRADOR' },
          ),
        'ACC_ROL_NO_ADMITIDO',
      );
    });

    it('rechaza correo duplicado en la misma Empresa con ACC_CORREO_DUPLICADO (ACC-BR-003)', async () => {
      await habilitarCuenta.ejecutar(
        {
          empresaId,
          personaId: 'persona-1',
          correoAcceso: 'usuario@yerba.com',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: true,
          accesoMovil: false,
          roles: ['ADMINISTRADOR'],
        },
        { actorId: superAdminId, rol: 'SUPER_ADMINISTRADOR' },
      );

      await expectErrorDominio(
        () =>
          habilitarCuenta.ejecutar(
            {
              empresaId,
              personaId: 'persona-2',
              correoAcceso: '  USUARIO@yerba.com ',
              contrasenia: 'ClaveSegura12345!',
              accesoWeb: true,
              accesoMovil: false,
              roles: ['CAPATAZ'],
              motivoSoporte: 'Reintento con mismo correo',
            },
            { actorId: superAdminId, rol: 'SUPER_ADMINISTRADOR' },
          ),
        'ACC_CORREO_DUPLICADO',
      );
    });

    it('rechaza persona duplicada en la misma Empresa con ACC_CUENTA_PERSONA_DUPLICADA (ACC-BR-015)', async () => {
      await habilitarCuenta.ejecutar(
        {
          empresaId,
          personaId: 'persona-1',
          correoAcceso: 'usuario1@yerba.com',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: true,
          accesoMovil: false,
          roles: ['ADMINISTRADOR'],
        },
        { actorId: superAdminId, rol: 'SUPER_ADMINISTRADOR' },
      );

      await expectErrorDominio(
        () =>
          habilitarCuenta.ejecutar(
            {
              empresaId,
              personaId: 'persona-1',
              correoAcceso: 'usuario2@yerba.com',
              contrasenia: 'ClaveSegura12345!',
              accesoWeb: true,
              accesoMovil: false,
              roles: ['CAPATAZ'],
              motivoSoporte: 'Misma persona otro correo',
            },
            { actorId: superAdminId, rol: 'SUPER_ADMINISTRADOR' },
          ),
        'ACC_CUENTA_PERSONA_DUPLICADA',
      );
    });

    it('rechaza con ACC_LIMITE_ACCESOS_ALCANZADO cuando el cupo está agotado (ACC-BR-006)', async () => {
      verifElegibilidad.cupos.set(empresaId, 1);

      await habilitarCuenta.ejecutar(
        {
          empresaId,
          personaId: 'persona-1',
          correoAcceso: 'usuario1@yerba.com',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: true,
          accesoMovil: false,
          roles: ['ADMINISTRADOR'],
        },
        { actorId: superAdminId, rol: 'SUPER_ADMINISTRADOR' },
      );

      await expectErrorDominio(
        () =>
          habilitarCuenta.ejecutar(
            {
              empresaId,
              personaId: 'persona-2',
              correoAcceso: 'usuario2@yerba.com',
              contrasenia: 'ClaveSegura12345!',
              accesoWeb: true,
              accesoMovil: false,
              roles: ['CAPATAZ'],
              motivoSoporte: 'Intento con cupo lleno',
            },
            { actorId: superAdminId, rol: 'SUPER_ADMINISTRADOR' },
          ),
        'ACC_LIMITE_ACCESOS_ALCANZADO',
      );
    });
  });

  describe('ACC-UC-008 — Consultar y Listar Cuentas de Empresa', () => {
    it('consulta y lista cuentas paginadas para el Administrador', async () => {
      const c1 = await habilitarCuenta.ejecutar(
        {
          empresaId,
          personaId: 'persona-1',
          correoAcceso: 'admin@yerba.com',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: true,
          accesoMovil: false,
          roles: ['ADMINISTRADOR'],
        },
        { actorId: superAdminId, rol: 'SUPER_ADMINISTRADOR' },
      );

      const consultada = await consultarCuenta.ejecutar(
        { empresaId, cuentaId: c1.id },
        { actorId: adminId, rol: 'ADMINISTRADOR', empresaId },
      );
      expect(consultada.id).toBe(c1.id);
      expect(consultada.correoAcceso).toBe('admin@yerba.com');

      const listado = await listarCuentas.ejecutar(
        { empresaId, limite: 10, desplazamiento: 0 },
        { actorId: adminId, rol: 'ADMINISTRADOR', empresaId },
      );
      expect(listado.paginacion.total).toBe(1);
      expect(listado.datos.length).toBe(1);
    });
  });

  describe('ACC-UC-010 — Modificar Habilitación, Suspender y Reactivar', () => {
    it('modifica canales y roles con concurrencia optimista', async () => {
      const c1 = await habilitarCuenta.ejecutar(
        {
          empresaId,
          personaId: 'persona-1',
          correoAcceso: 'admin@yerba.com',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: true,
          accesoMovil: false,
          roles: ['ADMINISTRADOR'],
        },
        { actorId: superAdminId, rol: 'SUPER_ADMINISTRADOR' },
      );

      const mod = await modificarHabilitacion.ejecutar(
        {
          empresaId,
          cuentaId: c1.id,
          versionConocida: 1,
          accesoMovil: true,
          roles: ['ADMINISTRADOR', 'CAPATAZ'],
        },
        { actorId: adminId, rol: 'ADMINISTRADOR', empresaId },
      );

      expect(mod.accesoMovil).toBe(true);
      expect(mod.roles).toEqual(['ADMINISTRADOR', 'CAPATAZ']);
      expect(mod.version).toBe(2);

      // Conflicto de versión
      await expectErrorDominio(
        () =>
          modificarHabilitacion.ejecutar(
            {
              empresaId,
              cuentaId: c1.id,
              versionConocida: 1,
              accesoMovil: false,
            },
            { actorId: adminId, rol: 'ADMINISTRADOR', empresaId },
          ),
        'ACC_VERSION_CONFLICTO',
      );
    });

    it('suspende y reactiva validando transiciones y cupo comercial', async () => {
      verifElegibilidad.cupos.set(empresaId, 1);

      const c1 = await habilitarCuenta.ejecutar(
        {
          empresaId,
          personaId: 'persona-1',
          correoAcceso: 'admin@yerba.com',
          contrasenia: 'ClaveSegura12345!',
          accesoWeb: true,
          accesoMovil: false,
          roles: ['ADMINISTRADOR'],
        },
        { actorId: superAdminId, rol: 'SUPER_ADMINISTRADOR' },
      );

      // 1. Suspender
      const susp = await suspenderCuenta.ejecutar(
        { empresaId, cuentaId: c1.id, versionConocida: 1 },
        { actorId: adminId, rol: 'ADMINISTRADOR', empresaId },
      );
      expect(susp.estado).toBe('SUSPENDIDA');
      expect(susp.version).toBe(2);

      // 2. Suspender cuando ya está suspendida falla
      await expectErrorDominio(
        () =>
          suspenderCuenta.ejecutar(
            { empresaId, cuentaId: c1.id, versionConocida: 2 },
            { actorId: adminId, rol: 'ADMINISTRADOR', empresaId },
          ),
        'ACC_TRANSICION_NO_PERMITIDA',
      );

      // 3. Reactivar exitosamente
      const react = await reactivarCuenta.ejecutar(
        { empresaId, cuentaId: c1.id, versionConocida: 2 },
        { actorId: adminId, rol: 'ADMINISTRADOR', empresaId },
      );
      expect(react.estado).toBe('ACTIVA');
      expect(react.version).toBe(3);
    });
  });
});
