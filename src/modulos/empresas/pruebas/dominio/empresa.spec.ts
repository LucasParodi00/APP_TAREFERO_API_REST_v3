import { Empresa } from '../../dominio/entidades/empresa';
import { EstadoEmpresa } from '../../dominio/enumeraciones/estado-empresa';
import { ConfiguracionGeneralEmpresa } from '../../dominio/entidades/configuracion-general-empresa';
import { ErrorDominioEmpresa } from '../../dominio/errores/error-dominio-empresa';

describe('Dominio: Empresa y Configuración General (T01)', () => {
  const configuracionPorDefecto = ConfiguracionGeneralEmpresa.crearInicial({
    id: '0192e210-aaaa-7000-8000-000000000001',
    empresaId: '0192e210-bbbb-7000-8000-000000000002',
    creadoPor: 'actor-plataforma',
    creadoEn: new Date('2026-11-09T12:00:00Z'),
  });

  function expectErrorDominio(fn: () => void, codigoEsperado: string): void {
    try {
      fn();
      throw new Error('Se esperaba ErrorDominioEmpresa');
    } catch (error) {
      expect(error).toBeInstanceOf(ErrorDominioEmpresa);
      expect((error as ErrorDominioEmpresa).codigo).toBe(codigoEsperado);
    }
  }

  describe('EMP-BR-001 — Nombre obligatorio y longitud', () => {
    it('acepta y recorta espacios exteriores de un nombre válido', () => {
      const empresa = Empresa.registrar({
        id: '0192e210-bbbb-7000-8000-000000000002',
        nombre: '  Yerba Norte  ',
        alias: 'yerba-norte',
        creadoPor: 'actor-plataforma',
        configuracion: configuracionPorDefecto,
      });

      expect(empresa.nombre).toBe('Yerba Norte');
      expect(empresa.estado).toBe(EstadoEmpresa.ACTIVA);
      expect(empresa.version).toBe(1);
    });

    it('acepta un nombre de 120 caracteres con al menos uno visible', () => {
      const nombre120 = 'A'.repeat(120);
      const empresa = Empresa.registrar({
        id: '0192e210-bbbb-7000-8000-000000000002',
        nombre: nombre120,
        alias: 'yerba-norte',
        creadoPor: 'actor-plataforma',
        configuracion: configuracionPorDefecto,
      });

      expect(empresa.nombre).toBe(nombre120);
    });

    it('rechaza nombre ausente, vacío o solo espacios con EMP_NOMBRE_OBLIGATORIO', () => {
      expectErrorDominio(() => {
        Empresa.registrar({
          id: '0192e210-bbbb-7000-8000-000000000002',
          nombre: '   ',
          alias: 'yerba-norte',
          creadoPor: 'actor-plataforma',
          configuracion: configuracionPorDefecto,
        });
      }, 'EMP_NOMBRE_OBLIGATORIO');
    });

    it('rechaza nombre de 121 caracteres con EMP_NOMBRE_INVALIDO', () => {
      expectErrorDominio(() => {
        Empresa.registrar({
          id: '0192e210-bbbb-7000-8000-000000000002',
          nombre: 'A'.repeat(121),
          alias: 'yerba-norte',
          creadoPor: 'actor-plataforma',
          configuracion: configuracionPorDefecto,
        });
      }, 'EMP_NOMBRE_INVALIDO');
    });
  });

  describe('EMP-BR-002 — Punto geográfico completo', () => {
    it('acepta punto geográfico dentro de los rangos válidos', () => {
      const empresa = Empresa.registrar({
        id: '0192e210-bbbb-7000-8000-000000000002',
        nombre: 'Yerba Norte',
        alias: 'yerba-norte',
        ubicacionGeografica: { latitud: -27.36, longitud: -55.9 },
        creadoPor: 'actor-plataforma',
        configuracion: configuracionPorDefecto,
      });

      expect(empresa.ubicacionGeografica).toEqual({
        latitud: -27.36,
        longitud: -55.9,
      });
    });

    it('rechaza latitud fuera de rango [-90, 90] con EMP_UBICACION_GEOGRAFICA_INVALIDA', () => {
      expectErrorDominio(() => {
        Empresa.registrar({
          id: '0192e210-bbbb-7000-8000-000000000002',
          nombre: 'Yerba Norte',
          alias: 'yerba-norte',
          ubicacionGeografica: { latitud: 90.1, longitud: -55.9 },
          creadoPor: 'actor-plataforma',
          configuracion: configuracionPorDefecto,
        });
      }, 'EMP_UBICACION_GEOGRAFICA_INVALIDA');
    });

    it('rechaza longitud fuera de rango [-180, 180] con EMP_UBICACION_GEOGRAFICA_INVALIDA', () => {
      expectErrorDominio(() => {
        Empresa.registrar({
          id: '0192e210-bbbb-7000-8000-000000000002',
          nombre: 'Yerba Norte',
          alias: 'yerba-norte',
          ubicacionGeografica: { latitud: -27.36, longitud: 180.1 },
          creadoPor: 'actor-plataforma',
          configuracion: configuracionPorDefecto,
        });
      }, 'EMP_UBICACION_GEOGRAFICA_INVALIDA');
    });
  });

  describe('EMP-BR-003 — CUIT opcional de once dígitos', () => {
    it('acepta CUIT válido de once dígitos numéricos', () => {
      const empresa = Empresa.registrar({
        id: '0192e210-bbbb-7000-8000-000000000002',
        nombre: 'Yerba Norte',
        alias: 'yerba-norte',
        cuit: '20301234567',
        creadoPor: 'actor-plataforma',
        configuracion: configuracionPorDefecto,
      });

      expect(empresa.cuit).toBe('20301234567');
    });

    it('rechaza CUIT con formato no numérico o longitud distinta de 11 con EMP_CUIT_INVALIDO', () => {
      expectErrorDominio(() => {
        Empresa.registrar({
          id: '0192e210-bbbb-7000-8000-000000000002',
          nombre: 'Yerba Norte',
          alias: 'yerba-norte',
          cuit: '20-30123456-7',
          creadoPor: 'actor-plataforma',
          configuracion: configuracionPorDefecto,
        });
      }, 'EMP_CUIT_INVALIDO');

      expectErrorDominio(() => {
        Empresa.registrar({
          id: '0192e210-bbbb-7000-8000-000000000002',
          nombre: 'Yerba Norte',
          alias: 'yerba-norte',
          cuit: '12345',
          creadoPor: 'actor-plataforma',
          configuracion: configuracionPorDefecto,
        });
      }, 'EMP_CUIT_INVALIDO');
    });
  });

  describe('EMP-BR-004 — Transiciones de estado', () => {
    it('permite suspender una empresa ACTIVA y luego reactivarla', () => {
      const empresa = Empresa.registrar({
        id: '0192e210-bbbb-7000-8000-000000000002',
        nombre: 'Yerba Norte',
        alias: 'yerba-norte',
        creadoPor: 'actor-plataforma',
        configuracion: configuracionPorDefecto,
      });

      expect(empresa.estado).toBe(EstadoEmpresa.ACTIVA);

      empresa.suspender('actor-superadmin', new Date('2026-11-09T13:00:00Z'));
      expect(empresa.estado).toBe(EstadoEmpresa.SUSPENDIDA);

      empresa.reactivar('actor-superadmin', new Date('2026-11-09T14:00:00Z'));
      expect(empresa.estado).toBe(EstadoEmpresa.ACTIVA);
    });

    it('permite cerrar una empresa activa o suspendida', () => {
      const empresa = Empresa.registrar({
        id: '0192e210-bbbb-7000-8000-000000000002',
        nombre: 'Yerba Norte',
        alias: 'yerba-norte',
        creadoPor: 'actor-plataforma',
        configuracion: configuracionPorDefecto,
      });

      empresa.cerrar('actor-superadmin', new Date('2026-11-09T15:00:00Z'));
      expect(empresa.estado).toBe(EstadoEmpresa.CERRADA);
    });

    it('rechaza cualquier cambio posterior de estado cuando está CERRADA con EMP_TRANSICION_ESTADO_INVALIDA', () => {
      const empresa = Empresa.registrar({
        id: '0192e210-bbbb-7000-8000-000000000002',
        nombre: 'Yerba Norte',
        alias: 'yerba-norte',
        creadoPor: 'actor-plataforma',
        configuracion: configuracionPorDefecto,
      });

      empresa.cerrar('actor-superadmin', new Date('2026-11-09T15:00:00Z'));

      expectErrorDominio(() => {
        empresa.reactivar('actor-superadmin', new Date('2026-11-09T16:00:00Z'));
      }, 'EMP_TRANSICION_ESTADO_INVALIDA');
    });
  });

  describe('EMP-BR-006 — Configuración general inicial e invariantes', () => {
    it('crea la configuración inicial con los valores por defecto oficiales (AR, America/Argentina/Buenos_Aires, ARS)', () => {
      const config = ConfiguracionGeneralEmpresa.crearInicial({
        id: '0192e210-aaaa-7000-8000-000000000001',
        empresaId: '0192e210-bbbb-7000-8000-000000000002',
        creadoPor: 'actor-plataforma',
      });

      expect(config.paisReferencia).toBe('AR');
      expect(config.zonaHoraria).toBe('America/Argentina/Buenos_Aires');
      expect(config.monedaPrincipal).toBe('ARS');
      expect(config.version).toBe(1);
    });

    it('rechaza configuración con país, moneda o zona horaria inválida con EMP_CONFIGURACION_GENERAL_INVALIDA', () => {
      expectErrorDominio(() => {
        ConfiguracionGeneralEmpresa.crear({
          id: '0192e210-aaaa-7000-8000-000000000001',
          empresaId: '0192e210-bbbb-7000-8000-000000000002',
          paisReferencia: 'ARGENTINA',
          zonaHoraria: 'America/Argentina/Buenos_Aires',
          monedaPrincipal: 'ARS',
          creadoPor: 'actor-plataforma',
        });
      }, 'EMP_CONFIGURACION_GENERAL_INVALIDA');

      expectErrorDominio(() => {
        ConfiguracionGeneralEmpresa.crear({
          id: '0192e210-aaaa-7000-8000-000000000001',
          empresaId: '0192e210-bbbb-7000-8000-000000000002',
          paisReferencia: 'AR',
          zonaHoraria: 'America/Argentina/Buenos_Aires',
          monedaPrincipal: 'PESOS',
          creadoPor: 'actor-plataforma',
        });
      }, 'EMP_CONFIGURACION_GENERAL_INVALIDA');
    });
  });

  describe('EMP-BR-010 — Textos descriptivos normalizados', () => {
    it('normaliza espacios exteriores y descarta cadenas vacías', () => {
      const empresa = Empresa.registrar({
        id: '0192e210-bbbb-7000-8000-000000000002',
        nombre: 'Yerba Norte',
        alias: 'yerba-norte',
        responsableNombre: '  Juan Perez  ',
        ubicacionTexto: '   ',
        descripcionActividad: '  Actividad agrícola principal  ',
        creadoPor: 'actor-plataforma',
        configuracion: configuracionPorDefecto,
      });

      expect(empresa.responsableNombre).toBe('Juan Perez');
      expect(empresa.ubicacionTexto).toBeUndefined();
      expect(empresa.descripcionActividad).toBe('Actividad agrícola principal');
    });

    it('rechaza textos que superan sus longitudes máximas con EMP_TEXTO_INVALIDO', () => {
      expectErrorDominio(() => {
        Empresa.registrar({
          id: '0192e210-bbbb-7000-8000-000000000002',
          nombre: 'Yerba Norte',
          alias: 'yerba-norte',
          responsableNombre: 'A'.repeat(121),
          creadoPor: 'actor-plataforma',
          configuracion: configuracionPorDefecto,
        });
      }, 'EMP_TEXTO_INVALIDO');

      expectErrorDominio(() => {
        Empresa.registrar({
          id: '0192e210-bbbb-7000-8000-000000000002',
          nombre: 'Yerba Norte',
          alias: 'yerba-norte',
          descripcionActividad: 'A'.repeat(2001),
          creadoPor: 'actor-plataforma',
          configuracion: configuracionPorDefecto,
        });
      }, 'EMP_TEXTO_INVALIDO');
    });
  });

  describe('EMP-BR-011, EMP-BR-013 — Formato e inmutabilidad del alias', () => {
    it('acepta alias válidos de 3 a 63 caracteres con minúsculas, números y guiones', () => {
      const empresa = Empresa.registrar({
        id: '0192e210-bbbb-7000-8000-000000000002',
        nombre: 'Yerba Norte',
        alias: 'yerba-norte-01',
        creadoPor: 'actor-plataforma',
        configuracion: configuracionPorDefecto,
      });

      expect(empresa.alias).toBe('yerba-norte-01');
    });

    it('rechaza alias con mayúsculas, guiones en los extremos o longitud < 3 o > 63 con EMP_ALIAS_INVALIDO', () => {
      const invalidos = [
        'ab',
        'A'.repeat(64).toLowerCase(),
        '-yerba',
        'yerba-',
        'Yerba-norte',
        'yerba_norte',
        'yerba norte',
      ];

      for (const aliasInvalido of invalidos) {
        expectErrorDominio(() => {
          Empresa.registrar({
            id: '0192e210-bbbb-7000-8000-000000000002',
            nombre: 'Yerba Norte',
            alias: aliasInvalido,
            creadoPor: 'actor-plataforma',
            configuracion: configuracionPorDefecto,
          });
        }, 'EMP_ALIAS_INVALIDO');
      }
    });

    it('rechaza modificar el alias con EMP_ALIAS_INMUTABLE', () => {
      const empresa = Empresa.registrar({
        id: '0192e210-bbbb-7000-8000-000000000002',
        nombre: 'Yerba Norte',
        alias: 'yerba-norte',
        creadoPor: 'actor-plataforma',
        configuracion: configuracionPorDefecto,
      });

      expectErrorDominio(() => {
        empresa.modificarDatos(
          {
            alias: 'otro-alias',
          },
          'actor-superadmin',
          true,
        );
      }, 'EMP_ALIAS_INMUTABLE');
    });
  });

  describe('EMP-BR-014 — Modificación según estado de Empresa', () => {
    it('permite modificar empresa ACTIVA al actor autorizado', () => {
      const empresa = Empresa.registrar({
        id: '0192e210-bbbb-7000-8000-000000000002',
        nombre: 'Yerba Norte',
        alias: 'yerba-norte',
        creadoPor: 'actor-plataforma',
        configuracion: configuracionPorDefecto,
      });

      empresa.modificarDatos(
        {
          nombre: 'Yerba Norte SRL',
        },
        'actor-admin',
        false,
      );

      expect(empresa.nombre).toBe('Yerba Norte SRL');
      expect(empresa.version).toBe(2);
    });

    it('solo permite al SuperAdministrador modificar empresa SUSPENDIDA', () => {
      const empresa = Empresa.registrar({
        id: '0192e210-bbbb-7000-8000-000000000002',
        nombre: 'Yerba Norte',
        alias: 'yerba-norte',
        creadoPor: 'actor-plataforma',
        configuracion: configuracionPorDefecto,
      });

      empresa.suspender('actor-superadmin');

      expectErrorDominio(() => {
        empresa.modificarDatos(
          {
            nombre: 'Nuevo Nombre',
          },
          'actor-admin',
          false,
        );
      }, 'EMP_MODIFICACION_NO_PERMITIDA');

      empresa.modificarDatos(
        {
          nombre: 'Nombre Corregido',
        },
        'actor-superadmin',
        true,
      );
      expect(empresa.nombre).toBe('Nombre Corregido');
    });

    it('rechaza cualquier modificación de una empresa CERRADA con EMP_MODIFICACION_NO_PERMITIDA', () => {
      const empresa = Empresa.registrar({
        id: '0192e210-bbbb-7000-8000-000000000002',
        nombre: 'Yerba Norte',
        alias: 'yerba-norte',
        creadoPor: 'actor-plataforma',
        configuracion: configuracionPorDefecto,
      });

      empresa.cerrar('actor-superadmin');

      expectErrorDominio(() => {
        empresa.modificarDatos(
          {
            nombre: 'Intento en Cerrada',
          },
          'actor-superadmin',
          true,
        );
      }, 'EMP_MODIFICACION_NO_PERMITIDA');
    });
  });
});
