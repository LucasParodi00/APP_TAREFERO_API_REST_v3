import {
  Chacra,
  normalizarClaveNombreCorto,
} from '../../dominio/entidades/chacra';
import { EstadoChacra } from '../../dominio/enumeraciones/estado-chacra';
import { ErrorDominioTerritorio } from '../../dominio/errores/error-dominio-territorio';

describe('Territorio — Dominio: Chacra (T01)', () => {
  const chacraId = '0192e210-aaaa-7000-8000-000000000001';
  const empresaId = '550e8400-e29b-41d4-a716-446655440000';
  const actorId = 'actor-admin-1';

  function expectErrorDominio(fn: () => void, codigoEsperado: string): void {
    try {
      fn();
      throw new Error('Se esperaba ErrorDominioTerritorio');
    } catch (error) {
      expect(error).toBeInstanceOf(ErrorDominioTerritorio);
      expect((error as ErrorDominioTerritorio).codigo).toBe(codigoEsperado);
    }
  }

  describe('TER-BR-001 — Nombre obligatorio y longitud', () => {
    it('crea chacra recortando espacios exteriores del nombre', () => {
      const chacra = Chacra.registrar({
        id: chacraId,
        empresaId,
        nombre: '  Chacra La Esperanza  ',
        nombreCorto: 'Esperanza',
        creadoPor: actorId,
      });

      expect(chacra.nombre).toBe('Chacra La Esperanza');
      expect(chacra.estado).toBe(EstadoChacra.ACTIVA);
      expect(chacra.version).toBe(1);
    });

    it('rechaza nombre ausente o vacío con TER_NOMBRE_OBLIGATORIO', () => {
      expectErrorDominio(() => {
        Chacra.registrar({
          id: chacraId,
          empresaId,
          nombre: '   ',
          nombreCorto: 'Esperanza',
          creadoPor: actorId,
        });
      }, 'TER_NOMBRE_OBLIGATORIO');
    });

    it('rechaza nombre con más de 150 caracteres con TER_TEXTO_INVALIDO', () => {
      expectErrorDominio(() => {
        Chacra.registrar({
          id: chacraId,
          empresaId,
          nombre: 'A'.repeat(151),
          nombreCorto: 'Esperanza',
          creadoPor: actorId,
        });
      }, 'TER_TEXTO_INVALIDO');
    });
  });

  describe('TER-BR-002 — Nombre corto obligatorio y longitud', () => {
    it('crea chacra recortando espacios del nombre corto', () => {
      const chacra = Chacra.registrar({
        id: chacraId,
        empresaId,
        nombre: 'Chacra Norte',
        nombreCorto: '  Norte Uno  ',
        creadoPor: actorId,
      });

      expect(chacra.nombreCorto).toBe('Norte Uno');
      expect(chacra.nombreCortoClave).toBe('norte uno');
    });

    it('rechaza nombre corto ausente o vacío con TER_NOMBRE_CORTO_OBLIGATORIO', () => {
      expectErrorDominio(() => {
        Chacra.registrar({
          id: chacraId,
          empresaId,
          nombre: 'Chacra Norte',
          nombreCorto: '',
          creadoPor: actorId,
        });
      }, 'TER_NOMBRE_CORTO_OBLIGATORIO');
    });

    it('rechaza nombre corto con más de 50 caracteres con TER_TEXTO_INVALIDO', () => {
      expectErrorDominio(() => {
        Chacra.registrar({
          id: chacraId,
          empresaId,
          nombre: 'Chacra Norte',
          nombreCorto: 'B'.repeat(51),
          creadoPor: actorId,
        });
      }, 'TER_TEXTO_INVALIDO');
    });
  });

  describe('TER-BR-003 y §7 — Responsable y dirección', () => {
    it('acepta responsable opcional y lo normaliza', () => {
      const chacra = Chacra.registrar({
        id: chacraId,
        empresaId,
        nombre: 'Chacra Norte',
        nombreCorto: 'Norte',
        responsableNombre: '  Juan Perez  ',
        direccionTexto: '  Ruta 14 Km 45  ',
        creadoPor: actorId,
      });

      expect(chacra.responsableNombre).toBe('Juan Perez');
      expect(chacra.direccionTexto).toBe('Ruta 14 Km 45');
    });

    it('asigna null si responsable o dirección son sólo espacios', () => {
      const chacra = Chacra.registrar({
        id: chacraId,
        empresaId,
        nombre: 'Chacra Norte',
        nombreCorto: 'Norte',
        responsableNombre: '   ',
        direccionTexto: '   ',
        creadoPor: actorId,
      });

      expect(chacra.responsableNombre).toBeNull();
      expect(chacra.direccionTexto).toBeNull();
    });

    it('rechaza responsable mayor a 150 caracteres con TER_TEXTO_INVALIDO', () => {
      expectErrorDominio(() => {
        Chacra.registrar({
          id: chacraId,
          empresaId,
          nombre: 'Chacra Norte',
          nombreCorto: 'Norte',
          responsableNombre: 'J'.repeat(151),
          creadoPor: actorId,
        });
      }, 'TER_TEXTO_INVALIDO');
    });

    it('rechaza dirección mayor a 500 caracteres con TER_TEXTO_INVALIDO', () => {
      expectErrorDominio(() => {
        Chacra.registrar({
          id: chacraId,
          empresaId,
          nombre: 'Chacra Norte',
          nombreCorto: 'Norte',
          direccionTexto: 'D'.repeat(501),
          creadoPor: actorId,
        });
      }, 'TER_TEXTO_INVALIDO');
    });
  });

  describe('TER-BR-007 — Clave normalizada de nombre corto', () => {
    it('pliega mayúsculas, elimina acentos y compacta espacios', () => {
      const clave1 = normalizarClaveNombreCorto('  Lote   ÁRBOL  ');
      const clave2 = normalizarClaveNombreCorto('lote arbol');
      expect(clave1).toBe(clave2);
      expect(clave1).toBe('lote arbol');
    });

    it('conserva la letra ñ en la normalización', () => {
      const clave = normalizarClaveNombreCorto('  Chacra Cañaveral  ');
      expect(clave).toBe('chacra cañaveral');
    });
  });

  describe('§7 — Ubicación geográfica', () => {
    it('acepta coordenadas válidas y permite consultar latitud y longitud', () => {
      const chacra = Chacra.registrar({
        id: chacraId,
        empresaId,
        nombre: 'Chacra Norte',
        nombreCorto: 'Norte',
        ubicacionGeografica: { latitud: -26.5, longitud: -54.3 },
        creadoPor: actorId,
      });

      expect(chacra.ubicacionGeografica).toBeDefined();
      expect(chacra.ubicacionGeografica?.latitud).toBe(-26.5);
      expect(chacra.ubicacionGeografica?.longitud).toBe(-54.3);
    });

    it('rechaza coordenadas fuera de rango con TER_UBICACION_GEOGRAFICA_INVALIDA', () => {
      expectErrorDominio(() => {
        Chacra.registrar({
          id: chacraId,
          empresaId,
          nombre: 'Chacra Norte',
          nombreCorto: 'Norte',
          ubicacionGeografica: { latitud: -95, longitud: -54.3 },
          creadoPor: actorId,
        });
      }, 'TER_UBICACION_GEOGRAFICA_INVALIDA');

      expectErrorDominio(() => {
        Chacra.registrar({
          id: chacraId,
          empresaId,
          nombre: 'Chacra Norte',
          nombreCorto: 'Norte',
          ubicacionGeografica: { latitud: -26.5, longitud: 185 },
          creadoPor: actorId,
        });
      }, 'TER_UBICACION_GEOGRAFICA_INVALIDA');
    });
  });

  describe('TER-BR-006 y TER-BR-008 — Inactivación y reglas de modificación', () => {
    it('inactiva una Chacra activa e incrementa su versión', () => {
      const chacra = Chacra.registrar({
        id: chacraId,
        empresaId,
        nombre: 'Chacra Sur',
        nombreCorto: 'Sur',
        creadoPor: actorId,
      });

      expect(chacra.estado).toBe(EstadoChacra.ACTIVA);
      expect(chacra.version).toBe(1);

      chacra.inactivar(actorId);

      expect(chacra.estado).toBe(EstadoChacra.INACTIVA);
      expect(chacra.version).toBe(2);
    });

    it('rechaza inactivar una Chacra ya inactiva con TER_TRANSICION_ESTADO_INVALIDA (TER-BR-006)', () => {
      const chacra = Chacra.registrar({
        id: chacraId,
        empresaId,
        nombre: 'Chacra Sur',
        nombreCorto: 'Sur',
        creadoPor: actorId,
      });

      chacra.inactivar(actorId);

      expectErrorDominio(() => {
        chacra.inactivar(actorId);
      }, 'TER_TRANSICION_ESTADO_INVALIDA');
    });

    it('rechaza modificar datos descriptivos de una Chacra inactiva con TER_OPERACION_INACTIVA_INVALIDA (TER-BR-008)', () => {
      const chacra = Chacra.registrar({
        id: chacraId,
        empresaId,
        nombre: 'Chacra Sur',
        nombreCorto: 'Sur',
        creadoPor: actorId,
      });

      chacra.inactivar(actorId);

      expectErrorDominio(() => {
        chacra.modificar({
          nombre: 'Nuevo Nombre',
          actualizadoPor: actorId,
        });
      }, 'TER_OPERACION_INACTIVA_INVALIDA');
    });

    it('modifica datos descriptivos de una Chacra activa incrementando su versión', () => {
      const chacra = Chacra.registrar({
        id: chacraId,
        empresaId,
        nombre: 'Chacra Sur',
        nombreCorto: 'Sur',
        responsableNombre: 'Carlos',
        creadoPor: actorId,
      });

      chacra.modificar({
        nombreCorto: 'Sur Dos',
        responsableNombre: null,
        actualizadoPor: 'admin-2',
      });

      expect(chacra.nombreCorto).toBe('Sur Dos');
      expect(chacra.nombreCortoClave).toBe('sur dos');
      expect(chacra.responsableNombre).toBeNull();
      expect(chacra.version).toBe(2);
    });
  });
});
