import { IniciarSesionEmpresa } from '../../aplicacion/comandos/iniciar-sesion-empresa.caso-de-uso';
import { RenovarSesionEmpresa } from '../../aplicacion/comandos/renovar-sesion-empresa.caso-de-uso';
import { CambiarContraseniaPropia } from '../../aplicacion/comandos/cambiar-contrasenia-propia.caso-de-uso';
import { RestablecerContraseniaCuentaEmpresa } from '../../aplicacion/comandos/restablecer-contrasenia-cuenta-empresa.caso-de-uso';
import { ValidarAccesoVigente } from '../../aplicacion/consultas/validar-acceso-vigente.caso-de-uso';
import {
  RepositorioCuentasEmpresa,
  CriteriosListadoCuentas,
  ResultadoPaginado,
} from '../../aplicacion/puertos/salida/repositorio-cuentas-empresa';
import { RepositorioSesionesEmpresa } from '../../aplicacion/puertos/salida/repositorio-sesiones-empresa';
import { VerificadorEmpresaPuerto } from '../../aplicacion/puertos/salida/verificador-empresa.puerto';
import {
  VerificadorElegibilidadComercial,
  ResultadoElegibilidadComercial,
} from '../../aplicacion/puertos/salida/verificador-elegibilidad-comercial.puerto';
import {
  ServicioCriptografia,
  PayloadTokenAcceso,
} from '../../aplicacion/puertos/salida/servicio-criptografia.puerto';
import { RepositorioIntervencionesSoporte } from '../../aplicacion/puertos/salida/repositorio-intervenciones-soporte';
import { CuentaEmpresa } from '../../dominio/entidades/cuenta-empresa';
import { SesionEmpresa } from '../../dominio/entidades/sesion-empresa';
import { IntervencionSoporte } from '../../dominio/entidades/intervencion-soporte';
import { CorreoAcceso } from '../../dominio/objetos-valor/correo-acceso';
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

  public contarPorEmpresa(): Promise<number> {
    return Promise.resolve(this.cuentas.size);
  }

  public contarActivas(): Promise<number> {
    return Promise.resolve(
      Array.from(this.cuentas.values()).filter(
        (c) => c.estado === EstadoCuentaEmpresa.ACTIVA,
      ).length,
    );
  }

  public listar(
    criterios: CriteriosListadoCuentas,
  ): Promise<ResultadoPaginado<CuentaEmpresa>> {
    const arr = Array.from(this.cuentas.values());
    return Promise.resolve({
      datos: arr,
      paginacion: {
        total: arr.length,
        limite: criterios.limite,
        desplazamiento: criterios.desplazamiento,
      },
    });
  }
}

class RepositorioSesionesMemoria implements RepositorioSesionesEmpresa {
  public sesiones = new Map<string, SesionEmpresa>();
  public huellas = new Set<string>();

  public guardar(sesion: SesionEmpresa): Promise<void> {
    this.sesiones.set(sesion.id, sesion);
    return Promise.resolve();
  }

  public actualizar(sesion: SesionEmpresa): Promise<void> {
    this.sesiones.set(sesion.id, sesion);
    return Promise.resolve();
  }

  public buscarPorId(id: string): Promise<SesionEmpresa | null> {
    return Promise.resolve(this.sesiones.get(id) ?? null);
  }

  public buscarPorTokenRenovacion(
    tokenRenovacionHash: string,
  ): Promise<SesionEmpresa | null> {
    for (const s of this.sesiones.values()) {
      if (s.tokenRenovacionHash === tokenRenovacionHash) {
        return Promise.resolve(s);
      }
    }
    return Promise.resolve(null);
  }

  public revocarTodasPorCuenta(
    cuentaEmpresaId: string,
    motivo: string,
    actorId: string,
    fecha?: Date,
  ): Promise<void> {
    for (const s of this.sesiones.values()) {
      if (s.cuentaEmpresaId === cuentaEmpresaId) {
        s.revocar(motivo, actorId, fecha);
      }
    }
    return Promise.resolve();
  }

  public registrarHuellaRenovacion(
    _sesionId: string,
    tokenHash: string,
  ): Promise<void> {
    this.huellas.add(tokenHash);
    return Promise.resolve();
  }

  public existeHuellaRenovacion(tokenHash: string): Promise<boolean> {
    return Promise.resolve(this.huellas.has(tokenHash));
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

class VerificadorElegibilidadMock implements VerificadorElegibilidadComercial {
  public deshabilitadas = new Set<string>();

  public obtenerElegibilidad(
    empresaId: string,
  ): Promise<ResultadoElegibilidadComercial> {
    return Promise.resolve({
      habilitada: !this.deshabilitadas.has(empresaId),
      cupoMaximo: 50,
    });
  }
}

class ServicioCriptografiaMock implements ServicioCriptografia {
  private seq = 1;

  public hashearContrasenia(c: string): Promise<string> {
    return Promise.resolve(`hash-${c}`);
  }
  public verificarContrasenia(c: string, hash: string): Promise<boolean> {
    return Promise.resolve(hash === `hash-${c}`);
  }
  public generarTokenAleatorio(): string {
    return `token-aleatorio-${this.seq++}`;
  }
  public hashearToken(t: string): string {
    return `hash-${t}`;
  }
  public generarTokenAcceso(payload: PayloadTokenAcceso): string {
    return `jwt:${payload.sesionId}:${payload.cuentaId}:${payload.empresaId}`;
  }
  public verificarTokenAcceso(token: string): PayloadTokenAcceso | null {
    if (token.startsWith('jwt:')) {
      const [, sesionId, cuentaId, empresaId] = token.split(':');
      return {
        sesionId,
        cuentaId,
        empresaId,
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

describe('Aplicación: Sesiones y Autorización (PLAN-ACC-0003)', () => {
  let repoCuentas: RepositorioCuentasMemoria;
  let repoSesiones: RepositorioSesionesMemoria;
  let verifEmpresa: VerificadorEmpresaMock;
  let verifElegibilidad: VerificadorElegibilidadMock;
  let cripto: ServicioCriptografiaMock;
  let repoIntervenciones: RepositorioIntervencionesMock;

  let iniciarSesion: IniciarSesionEmpresa;
  let renovarSesion: RenovarSesionEmpresa;
  let cambiarContrasenia: CambiarContraseniaPropia;
  let restablecerContrasenia: RestablecerContraseniaCuentaEmpresa;
  let validarAcceso: ValidarAccesoVigente;

  const empresaId = '550e8400-e29b-41d4-a716-446655440000';
  const cuentaId = '123e4567-e89b-12d3-a456-426614174001';
  const superAdminId = 'c7e0c457-3f9b-4bf4-bb85-055f69e6b360';

  beforeEach(() => {
    repoCuentas = new RepositorioCuentasMemoria();
    repoSesiones = new RepositorioSesionesMemoria();
    verifEmpresa = new VerificadorEmpresaMock();
    verifElegibilidad = new VerificadorElegibilidadMock();
    cripto = new ServicioCriptografiaMock();
    repoIntervenciones = new RepositorioIntervencionesMock();

    verifEmpresa.empresasValidas.set(empresaId, {
      alias: 'yerba-san-pedro',
      estado: 'ACTIVA',
    });

    // Crear cuenta activa
    const cuenta = CuentaEmpresa.crear({
      id: cuentaId,
      empresaId,
      personaId: 'persona-1',
      correoAcceso: new CorreoAcceso('admin@yerba.com'),
      hashContrasenia: 'hash-ClaveSegura12345!',
      accesoWeb: true,
      accesoMovil: false,
      roles: ['ADMINISTRADOR'],
      creadoPor: 'sistema',
    });
    await repoCuentas.guardar(cuenta);

    iniciarSesion = new IniciarSesionEmpresa(
      repoCuentas,
      repoSesiones,
      verifEmpresa,
      verifElegibilidad,
      cripto,
    );
    renovarSesion = new RenovarSesionEmpresa(
      repoCuentas,
      repoSesiones,
      verifElegibilidad,
      cripto,
    );
    cambiarContrasenia = new CambiarContraseniaPropia(
      repoCuentas,
      repoSesiones,
      cripto,
    );
    restablecerContrasenia = new RestablecerContraseniaCuentaEmpresa(
      repoCuentas,
      repoSesiones,
      repoIntervenciones,
      cripto,
    );
    validarAcceso = new ValidarAccesoVigente(
      repoCuentas,
      repoSesiones,
      verifEmpresa,
      cripto,
    );
  });

  function expectErrorDominio(fn: () => Promise<unknown>, codigo: string) {
    return expect(fn()).rejects.toMatchObject({ codigo });
  }

  describe('ACC-UC-002 — Iniciar Sesión de Empresa', () => {
    it('inicia sesión exitosamente y emite tokens', async () => {
      const res = await iniciarSesion.ejecutar({
        aliasEmpresa: 'yerba-san-pedro',
        correoAcceso: 'admin@yerba.com',
        contrasenia: 'ClaveSegura12345!',
        canal: 'WEB',
      });

      expect(res.empresaId).toBe(empresaId);
      expect(res.cuentaId).toBe(cuentaId);
      expect(res.tokenAcceso).toBeDefined();
      expect(res.tokenRenovacion).toBeDefined();
    });

    it('rechaza con ACC_AUTENTICACION_INVALIDA si la contraseña es errónea', async () => {
      await expectErrorDominio(
        () =>
          iniciarSesion.ejecutar({
            aliasEmpresa: 'yerba-san-pedro',
            correoAcceso: 'admin@yerba.com',
            contrasenia: 'ClaveIncorrecta123!',
            canal: 'WEB',
          }),
        'ACC_AUTENTICACION_INVALIDA',
      );
    });

    it('rechaza con ACC_CANAL_NO_HABILITADO si el canal no está habilitado (ACC-BR-005)', async () => {
      await expectErrorDominio(
        () =>
          iniciarSesion.ejecutar({
            aliasEmpresa: 'yerba-san-pedro',
            correoAcceso: 'admin@yerba.com',
            contrasenia: 'ClaveSegura12345!',
            canal: 'MOVIL',
          }),
        'ACC_CANAL_NO_HABILITADO',
      );
    });
  });

  describe('ACC-UC-009 — Renovar Sesión de Empresa y Detección de Reutilización', () => {
    it('renueva y rota el token de renovación (ADR-0006)', async () => {
      const ses = await iniciarSesion.ejecutar({
        aliasEmpresa: 'yerba-san-pedro',
        correoAcceso: 'admin@yerba.com',
        contrasenia: 'ClaveSegura12345!',
        canal: 'WEB',
      });

      const renovacion = await renovarSesion.ejecutar({
        tokenRenovacion: ses.tokenRenovacion,
        canal: 'WEB',
      });

      expect(renovacion.tokenRenovacion).toBeDefined();
      expect(renovacion.tokenRenovacion).not.toBe(ses.tokenRenovacion);

      // Si intentamos usar el token viejo de nuevo -> DETECCIÓN DE REUTILIZACIÓN
      await expectErrorDominio(
        () =>
          renovarSesion.ejecutar({
            tokenRenovacion: ses.tokenRenovacion,
            canal: 'WEB',
          }),
        'ACC_RENOVACION_INVALIDA',
      );
    });
  });

  describe('ACC-UC-004 — Cambiar contraseña propia', () => {
    it('cambia contraseña propia y revoca todas las sesiones previas (ACC-BR-014)', async () => {
      const ses = await iniciarSesion.ejecutar({
        aliasEmpresa: 'yerba-san-pedro',
        correoAcceso: 'admin@yerba.com',
        contrasenia: 'ClaveSegura12345!',
        canal: 'WEB',
      });

      // Validar acceso antes del cambio funciona
      const accesoAntes = await validarAcceso.ejecutar(ses.tokenAcceso);
      expect(accesoAntes.cuentaId).toBe(cuentaId);

      // Cambiar contraseña
      await cambiarContrasenia.ejecutar(
        {
          empresaId,
          cuentaId,
          contraseniaActual: 'ClaveSegura12345!',
          contraseniaNueva: 'NuevaClaveSegura999!',
        },
        { actorId: cuentaId, cuentaId, rol: 'ADMINISTRADOR', empresaId },
      );

      // La sesión anterior queda revocada inmediatamente
      await expectErrorDominio(
        () => validarAcceso.ejecutar(ses.tokenAcceso),
        'ACC_SESION_NO_VIGENTE',
      );

      // Y se puede iniciar sesión con la nueva contraseña
      const nuevoLogin = await iniciarSesion.ejecutar({
        aliasEmpresa: 'yerba-san-pedro',
        correoAcceso: 'admin@yerba.com',
        contrasenia: 'NuevaClaveSegura999!',
        canal: 'WEB',
      });
      expect(nuevoLogin.tokenAcceso).toBeDefined();
    });

    it('rechaza si no es el titular con ACC_CAMBIO_PROPIO_NO_AUTORIZADO (ACC-BR-013)', async () => {
      await expectErrorDominio(
        () =>
          cambiarContrasenia.ejecutar(
            {
              empresaId,
              cuentaId,
              contraseniaActual: 'ClaveSegura12345!',
              contraseniaNueva: 'NuevaClaveSegura999!',
            },
            {
              actorId: 'otro-usuario',
              cuentaId: 'otro-usuario',
              rol: 'ADMINISTRADOR',
              empresaId,
            },
          ),
        'ACC_CAMBIO_PROPIO_NO_AUTORIZADO',
      );
    });
  });

  describe('ACC-UC-005 — Restablecer contraseña administrativo', () => {
    it('SuperAdmin restablece con motivo de soporte y revoca sesiones (ACC-BR-010, ACC-BR-014)', async () => {
      const ses = await iniciarSesion.ejecutar({
        aliasEmpresa: 'yerba-san-pedro',
        correoAcceso: 'admin@yerba.com',
        contrasenia: 'ClaveSegura12345!',
        canal: 'WEB',
      });

      await restablecerContrasenia.ejecutar(
        {
          empresaId,
          cuentaId,
          contraseniaNueva: 'ClaveRestablecida123!',
          motivoSoporte: 'Cliente olvidó su contraseña',
        },
        { actorId: superAdminId, rol: 'SUPER_ADMINISTRADOR' },
      );

      // Sesión anterior revocada
      await expectErrorDominio(
        () => validarAcceso.ejecutar(ses.tokenAcceso),
        'ACC_SESION_NO_VIGENTE',
      );

      // Intervención registrada
      expect(repoIntervenciones.intervenciones.length).toBe(1);
    });
  });
});
