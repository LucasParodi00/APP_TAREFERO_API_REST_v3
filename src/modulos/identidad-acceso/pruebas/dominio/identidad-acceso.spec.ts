import { UsuarioPlataforma } from '../../dominio/entidades/usuario-plataforma';
import { IntervencionSoporte } from '../../dominio/entidades/intervencion-soporte';
import { MotivoSoporte } from '../../dominio/objetos-valor/motivo-soporte';
import { CorreoAcceso } from '../../dominio/objetos-valor/correo-acceso';
import { ContraseniaAcceso } from '../../dominio/objetos-valor/contrasenia-acceso';
import { CuentaEmpresa } from '../../dominio/entidades/cuenta-empresa';
import { SesionEmpresa } from '../../dominio/entidades/sesion-empresa';
import { RolEmpresa } from '../../dominio/enumeraciones/rol-empresa';
import { EstadoCuentaEmpresa } from '../../dominio/enumeraciones/estado-cuenta-empresa';
import { CanalSesion } from '../../dominio/enumeraciones/canal-sesion';
import { ErrorDominioIdentidadAcceso } from '../../dominio/errores/error-dominio-identidad-acceso';

describe('Identidad y Acceso — Dominio (T01)', () => {
  const superAdminId = 'c7e0c457-3f9b-4bf4-bb85-055f69e6b360';
  const empresaId = '550e8400-e29b-41d4-a716-446655440000';
  const solicitudId = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';

  function expectErrorDominio(fn: () => void, codigoEsperado: string): void {
    try {
      fn();
      throw new Error('Se esperaba ErrorDominioIdentidadAcceso');
    } catch (error) {
      expect(error).toBeInstanceOf(ErrorDominioIdentidadAcceso);
      expect((error as ErrorDominioIdentidadAcceso).codigo).toBe(
        codigoEsperado,
      );
    }
  }

  describe('ACC-ENT-004 y ACC-BR-007 — Usuario de plataforma y roles admitidos', () => {
    it('debe crear un SuperAdministrador activo válido', () => {
      const usuario = UsuarioPlataforma.crear({
        id: superAdminId,
        rol: 'SUPER_ADMINISTRADOR',
        activo: true,
      });

      expect(usuario.id).toBe(superAdminId);
      expect(usuario.rol).toBe('SUPER_ADMINISTRADOR');
      expect(usuario.activo).toBe(true);
      expect(usuario.creadoEn).toBeInstanceOf(Date);
    });

    it('debe rechazar un rol no admitido para plataforma con ACC_ROL_NO_ADMITIDO (ACC-BR-007)', () => {
      expectErrorDominio(() => {
        UsuarioPlataforma.crear({
          id: superAdminId,
          rol: 'ADMINISTRADOR' as unknown as 'SUPER_ADMINISTRADOR',
          activo: true,
        });
      }, 'ACC_ROL_NO_ADMITIDO');

      expectErrorDominio(() => {
        UsuarioPlataforma.crear({
          id: superAdminId,
          rol: 'CAPATAZ' as unknown as 'SUPER_ADMINISTRADOR',
          activo: true,
        });
      }, 'ACC_ROL_NO_ADMITIDO');
    });

    it('debe rechazar desactivar al último SuperAdministrador con ACC_ULTIMO_SUPERADMINISTRADOR (ACC-BR-008)', () => {
      const usuario = UsuarioPlataforma.crear({
        id: superAdminId,
        rol: 'SUPER_ADMINISTRADOR',
        activo: true,
      });

      // Si sólo queda 1 activo, no puede desactivarse
      expectErrorDominio(() => {
        usuario.desactivar(1);
      }, 'ACC_ULTIMO_SUPERADMINISTRADOR');

      // Si quedan 2 activos, sí puede desactivarse
      usuario.desactivar(2);
      expect(usuario.activo).toBe(false);
    });
  });

  describe('MotivoSoporte y ACC-BR-020 — Normalización y límites de motivo', () => {
    it('debe normalizar eliminando espacios exteriores', () => {
      const motivo = MotivoSoporte.crear(
        '  Revisión solicitada por la Empresa  ',
      );
      expect(motivo.valor).toBe('Revisión solicitada por la Empresa');
    });

    it('debe admitir un motivo de exactamente 1000 caracteres', () => {
      const texto1000 = 'a'.repeat(1000);
      const motivo = MotivoSoporte.crear(`  ${texto1000}  `);
      expect(motivo.valor.length).toBe(1000);
    });

    it('debe rechazar motivo vacío o sólo espacios con ACC_MOTIVO_SOPORTE_INVALIDO', () => {
      expectErrorDominio(() => {
        MotivoSoporte.crear('    ');
      }, 'ACC_MOTIVO_SOPORTE_INVALIDO');

      expectErrorDominio(() => {
        MotivoSoporte.crear('');
      }, 'ACC_MOTIVO_SOPORTE_INVALIDO');
    });

    it('debe rechazar motivo mayor a 1000 caracteres con ACC_MOTIVO_SOPORTE_INVALIDO', () => {
      const texto1001 = 'a'.repeat(1001);
      expectErrorDominio(() => {
        MotivoSoporte.crear(texto1001);
      }, 'ACC_MOTIVO_SOPORTE_INVALIDO');
    });
  });

  describe('ACC-ENT-005 y ACC-BR-011 — Intervención de soporte y contexto explícito', () => {
    it('debe crear una intervención de soporte válida', () => {
      const intervencion = IntervencionSoporte.crear({
        id: '123e4567-e89b-12d3-a456-426614174000',
        usuarioPlataformaId: superAdminId,
        empresaId,
        motivo: MotivoSoporte.crear('Diagnóstico de sincronización'),
        sesionId: 'sesion-plataforma-1',
        solicitudId,
        ocurridaEn: new Date('2026-11-09T12:00:00Z'),
      });

      expect(intervencion.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(intervencion.usuarioPlataformaId).toBe(superAdminId);
      expect(intervencion.empresaId).toBe(empresaId);
      expect(intervencion.motivo.valor).toBe('Diagnóstico de sincronización');
      expect(intervencion.sesionId).toBe('sesion-plataforma-1');
      expect(intervencion.solicitudId).toBe(solicitudId);
    });

    it('debe rechazar intervención sin empresaId con ACC_CONTEXTO_SOPORTE_REQUERIDO (ACC-BR-011)', () => {
      expectErrorDominio(() => {
        IntervencionSoporte.crear({
          id: '123e4567-e89b-12d3-a456-426614174000',
          usuarioPlataformaId: superAdminId,
          empresaId: '',
          motivo: MotivoSoporte.crear('Diagnóstico'),
          sesionId: 'sesion-1',
          solicitudId,
        });
      }, 'ACC_CONTEXTO_SOPORTE_REQUERIDO');

      expectErrorDominio(() => {
        IntervencionSoporte.crear({
          id: '123e4567-e89b-12d3-a456-426614174000',
          usuarioPlataformaId: superAdminId,
          empresaId: '   ',
          motivo: MotivoSoporte.crear('Diagnóstico'),
          sesionId: 'sesion-1',
          solicitudId,
        });
      }, 'ACC_CONTEXTO_SOPORTE_REQUERIDO');
    });

    it('debe rechazar intervención sin motivo con ACC_CONTEXTO_SOPORTE_REQUERIDO (ACC-BR-011)', () => {
      expectErrorDominio(() => {
        IntervencionSoporte.crear({
          id: '123e4567-e89b-12d3-a456-426614174000',
          usuarioPlataformaId: superAdminId,
          empresaId,
          motivo: null as unknown as MotivoSoporte,
          sesionId: 'sesion-1',
          solicitudId,
        });
      }, 'ACC_CONTEXTO_SOPORTE_REQUERIDO');

      expectErrorDominio(() => {
        IntervencionSoporte.crear({
          id: '123e4567-e89b-12d3-a456-426614174000',
          usuarioPlataformaId: superAdminId,
          empresaId,
          motivo: undefined as unknown as MotivoSoporte,
          sesionId: 'sesion-1',
          solicitudId,
        });
      }, 'ACC_CONTEXTO_SOPORTE_REQUERIDO');
    });
  });

  describe('ACC-ENT-001 y ACC-BR-018 — CorreoAcceso', () => {
    it('normaliza a minúsculas y elimina espacios exteriores', () => {
      const correo = new CorreoAcceso('  Admin@Empresa.COM  ');
      expect(correo.valor).toBe('admin@empresa.com');
    });

    it('rechaza correo vacío o superior a 254 caracteres con ACC_CORREO_INVALIDO', () => {
      expectErrorDominio(() => new CorreoAcceso(''), 'ACC_CORREO_INVALIDO');
      expectErrorDominio(() => new CorreoAcceso('   '), 'ACC_CORREO_INVALIDO');
      const largo = 'a'.repeat(250) + '@test.com';
      expectErrorDominio(() => new CorreoAcceso(largo), 'ACC_CORREO_INVALIDO');
    });

    it('rechaza formato sin arroba o sin dominio', () => {
      expectErrorDominio(
        () => new CorreoAcceso('adminempresa.com'),
        'ACC_CORREO_INVALIDO',
      );
      expectErrorDominio(
        () => new CorreoAcceso('admin@empresa'),
        'ACC_CORREO_INVALIDO',
      );
    });
  });

  describe('ACC-BR-019 — ContraseniaAcceso', () => {
    it('acepta contraseñas de entre 15 y 128 caracteres conservando exactamente los caracteres', () => {
      const pass = '  MiClaveSegura123!  ';
      const c = new ContraseniaAcceso(pass);
      expect(c.valor).toBe(pass);
    });

    it('rechaza contraseña con menos de 15 caracteres con ACC_CONTRASENIA_INVALIDA', () => {
      expectErrorDominio(
        () => new ContraseniaAcceso('12345678901234'),
        'ACC_CONTRASENIA_INVALIDA',
      );
    });

    it('rechaza contraseña con más de 128 caracteres con ACC_CONTRASENIA_INVALIDA', () => {
      const muyLarga = 'A'.repeat(129);
      expectErrorDominio(
        () => new ContraseniaAcceso(muyLarga),
        'ACC_CONTRASENIA_INVALIDA',
      );
    });
  });

  describe('ACC-ENT-001 — CuentaEmpresa y ciclo de vida', () => {
    const cuentaId = '123e4567-e89b-12d3-a456-426614174001';
    const personaId = '123e4567-e89b-12d3-a456-426614174002';
    const correo = new CorreoAcceso('usuario@empresa.com');

    it('crea una cuenta de empresa activa con canales y roles válidos', () => {
      const cuenta = CuentaEmpresa.crear({
        id: cuentaId,
        empresaId,
        personaId,
        correoAcceso: correo,
        hashContrasenia: 'hash-seguro',
        accesoWeb: true,
        accesoMovil: false,
        roles: ['ADMINISTRADOR'],
        creadoPor: superAdminId,
      });

      expect(cuenta.id).toBe(cuentaId);
      expect(cuenta.estado).toBe(EstadoCuentaEmpresa.ACTIVA);
      expect(cuenta.roles).toEqual([RolEmpresa.ADMINISTRADOR]);
      expect(cuenta.accesoWeb).toBe(true);
      expect(cuenta.accesoMovil).toBe(false);
      expect(cuenta.version).toBe(1);
    });

    it('rechaza rol SUPER_ADMINISTRADOR para una Cuenta de Empresa con ACC_ROL_NO_ADMITIDO (ACC-BR-007)', () => {
      expectErrorDominio(() => {
        CuentaEmpresa.crear({
          id: cuentaId,
          empresaId,
          personaId,
          correoAcceso: correo,
          hashContrasenia: 'hash-seguro',
          accesoWeb: true,
          accesoMovil: true,
          roles: ['SUPER_ADMINISTRADOR'],
          creadoPor: superAdminId,
        });
      }, 'ACC_ROL_NO_ADMITIDO');
    });

    it('rechaza crear cuenta sin ningún canal habilitado con ACC_CANAL_NO_HABILITADO (ACC-BR-005)', () => {
      expectErrorDominio(() => {
        CuentaEmpresa.crear({
          id: cuentaId,
          empresaId,
          personaId,
          correoAcceso: correo,
          hashContrasenia: 'hash-seguro',
          accesoWeb: false,
          accesoMovil: false,
          roles: ['ADMINISTRADOR'],
          creadoPor: superAdminId,
        });
      }, 'ACC_CANAL_NO_HABILITADO');
    });

    it('ejecuta transiciones suspender y reactivar actualizando versión (ACC-BR-016)', () => {
      const cuenta = CuentaEmpresa.crear({
        id: cuentaId,
        empresaId,
        personaId,
        correoAcceso: correo,
        hashContrasenia: 'hash-seguro',
        accesoWeb: true,
        accesoMovil: true,
        roles: ['ADMINISTRADOR', 'CAPATAZ'],
        creadoPor: superAdminId,
      });

      cuenta.suspender('actor-1');
      expect(cuenta.estado).toBe(EstadoCuentaEmpresa.SUSPENDIDA);
      expect(cuenta.version).toBe(2);

      expectErrorDominio(
        () => cuenta.suspender('actor-1'),
        'ACC_TRANSICION_NO_PERMITIDA',
      );

      cuenta.reactivar('actor-1');
      expect(cuenta.estado).toBe(EstadoCuentaEmpresa.ACTIVA);
      expect(cuenta.version).toBe(3);

      expectErrorDominio(
        () => cuenta.reactivar('actor-1'),
        'ACC_TRANSICION_NO_PERMITIDA',
      );
    });

    it('modifica roles y canales validando que no quede vacía', () => {
      const cuenta = CuentaEmpresa.crear({
        id: cuentaId,
        empresaId,
        personaId,
        correoAcceso: correo,
        hashContrasenia: 'hash-seguro',
        accesoWeb: true,
        accesoMovil: false,
        roles: ['ADMINISTRADOR'],
        creadoPor: superAdminId,
      });

      cuenta.modificarHabilitacion(
        { accesoMovil: true, roles: ['CAPATAZ', 'EMPLEADO'] },
        'actor-1',
      );
      expect(cuenta.accesoMovil).toBe(true);
      expect(cuenta.roles).toEqual([RolEmpresa.CAPATAZ, RolEmpresa.EMPLEADO]);
      expect(cuenta.version).toBe(2);

      expectErrorDominio(() => {
        cuenta.modificarHabilitacion({ roles: [] }, 'actor-1');
      }, 'ACC_ELIMINACION_NO_PERMITIDA');

      expectErrorDominio(() => {
        cuenta.modificarHabilitacion(
          { accesoWeb: false, accesoMovil: false },
          'actor-1',
        );
      }, 'ACC_CANAL_NO_HABILITADO');
    });
  });

  describe('ACC-ENT-003 — SesionEmpresa', () => {
    const sesionId = '123e4567-e89b-12d3-a456-426614174003';
    const cuentaId = '123e4567-e89b-12d3-a456-426614174001';

    it('crea sesión vigente y permite revocarla', () => {
      const sesion = SesionEmpresa.crear({
        id: sesionId,
        empresaId,
        cuentaEmpresaId: cuentaId,
        canal: CanalSesion.WEB,
        tokenRenovacionHash: 'token-hash-1',
      });

      expect(sesion.estaVigente()).toBe(true);
      sesion.revocar('Cierre voluntario', 'actor-1');
      expect(sesion.estaVigente()).toBe(false);
      expect(sesion.motivoRevocacion).toBe('Cierre voluntario');
    });

    it('permite rotar el token de renovación si está vigente', () => {
      const sesion = SesionEmpresa.crear({
        id: sesionId,
        empresaId,
        cuentaEmpresaId: cuentaId,
        canal: CanalSesion.MOVIL,
        tokenRenovacionHash: 'token-hash-1',
      });

      sesion.rotarTokenRenovacion('token-hash-2');
      expect(sesion.tokenRenovacionHash).toBe('token-hash-2');

      sesion.revocar('Revocada', 'actor-1');
      expectErrorDominio(() => {
        sesion.rotarTokenRenovacion('token-hash-3');
      }, 'ACC_RENOVACION_INVALIDA');
    });
  });
});
