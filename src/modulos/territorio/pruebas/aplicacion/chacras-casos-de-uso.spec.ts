import { RegistrarChacra } from '../../aplicacion/comandos/registrar-chacra.caso-de-uso';
import { ModificarChacra } from '../../aplicacion/comandos/modificar-chacra.caso-de-uso';
import { InactivarChacra } from '../../aplicacion/comandos/inactivar-chacra.caso-de-uso';
import { RepositorioChacras } from '../../aplicacion/puertos/salida/repositorio-chacras';
import { VerificadorEmpresaPuertoTer } from '../../aplicacion/puertos/salida/verificador-empresa.puerto';
import { VerificadorLotesChacraPuerto } from '../../aplicacion/puertos/salida/verificador-lotes-chacra.puerto';
import {
  GestorIdempotenciaTer,
  RegistroIdempotenciaTer,
} from '../../aplicacion/puertos/salida/gestor-idempotencia-ter';
import {
  DatosIntervencionSoporteTer,
  RegistradorIntervencionSoporteTer,
} from '../../aplicacion/puertos/salida/registrador-intervencion-soporte.puerto';
import { ContextoActorTer } from '../../aplicacion/puertos/salida/contexto-actor-ter';
import { Chacra } from '../../dominio/entidades/chacra';
import { EstadoChacra } from '../../dominio/enumeraciones/estado-chacra';

class RepositorioChacrasMemoria implements RepositorioChacras {
  public chacras = new Map<string, Chacra>();

  guardar(chacra: Chacra): Promise<void> {
    this.chacras.set(`${chacra.empresaId}:${chacra.id}`, chacra);
    return Promise.resolve();
  }

  buscarPorId(empresaId: string, id: string): Promise<Chacra | null> {
    return Promise.resolve(this.chacras.get(`${empresaId}:${id}`) ?? null);
  }

  buscarPorIdConBloqueo(empresaId: string, id: string): Promise<Chacra | null> {
    return this.buscarPorId(empresaId, id);
  }

  existeNombreCorto(
    empresaId: string,
    nombreCortoClave: string,
    excluirId?: string,
  ): Promise<boolean> {
    for (const c of this.chacras.values()) {
      if (
        c.empresaId === empresaId &&
        c.nombreCortoClave === nombreCortoClave &&
        c.id !== excluirId
      ) {
        return Promise.resolve(true);
      }
    }
    return Promise.resolve(false);
  }
}

class VerificadorEmpresaFalso implements VerificadorEmpresaPuertoTer {
  public empresasValidas = new Set<string>();

  existeEmpresa(empresaId: string): Promise<boolean> {
    return Promise.resolve(this.empresasValidas.has(empresaId));
  }
}

class VerificadorLotesFalso implements VerificadorLotesChacraPuerto {
  public chacrasConLotesActivos = new Set<string>();

  tieneLotesActivos(empresaId: string, chacraId: string): Promise<boolean> {
    return Promise.resolve(this.chacrasConLotesActivos.has(chacraId));
  }
}

class GestorIdempotenciaMemoria implements GestorIdempotenciaTer {
  public registros = new Map<string, RegistroIdempotenciaTer>();

  obtener(clave: string): Promise<RegistroIdempotenciaTer | null> {
    return Promise.resolve(this.registros.get(clave) ?? null);
  }

  guardar(registro: RegistroIdempotenciaTer): Promise<void> {
    this.registros.set(registro.clave, registro);
    return Promise.resolve();
  }
}

class RegistradorSoporteEspia implements RegistradorIntervencionSoporteTer {
  public intervenciones: DatosIntervencionSoporteTer[] = [];

  registrar(datos: DatosIntervencionSoporteTer): Promise<void> {
    this.intervenciones.push(datos);
    return Promise.resolve();
  }
}

describe('Territorio — Aplicación: Casos de uso de Chacras (T02 y T03)', () => {
  const empresaAId = '550e8400-e29b-41d4-a716-446655440000';
  const empresaBId = '660e8400-e29b-41d4-a716-446655440001';
  const superAdminId = 'c7e0c457-3f9b-4bf4-bb85-055f69e6b360';
  const solicitudId = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';

  let repoChacras: RepositorioChacrasMemoria;
  let verificadorEmpresa: VerificadorEmpresaFalso;
  let verificadorLotes: VerificadorLotesFalso;
  let gestorIdempotencia: GestorIdempotenciaMemoria;
  let registradorSoporte: RegistradorSoporteEspia;

  let registrarChacra: RegistrarChacra;
  let modificarChacra: ModificarChacra;
  let inactivarChacra: InactivarChacra;

  const contextoAdminA: ContextoActorTer = {
    actorId: 'admin-a',
    rol: 'ADMINISTRADOR',
    empresaId: empresaAId,
    solicitudId,
  };

  const contextoSuperAdminConMotivo: ContextoActorTer = {
    actorId: superAdminId,
    rol: 'SUPER_ADMINISTRADOR',
    solicitudId,
    sesionId: 'sesion-plat-1',
    motivoSoporte: 'Configuración inicial de chacras',
  };

  beforeEach(() => {
    repoChacras = new RepositorioChacrasMemoria();
    verificadorEmpresa = new VerificadorEmpresaFalso();
    verificadorLotes = new VerificadorLotesFalso();
    gestorIdempotencia = new GestorIdempotenciaMemoria();
    registradorSoporte = new RegistradorSoporteEspia();

    verificadorEmpresa.empresasValidas.add(empresaAId);
    verificadorEmpresa.empresasValidas.add(empresaBId);

    registrarChacra = new RegistrarChacra(
      repoChacras,
      verificadorEmpresa,
      gestorIdempotencia,
      registradorSoporte,
    );

    modificarChacra = new ModificarChacra(
      repoChacras,
      verificadorEmpresa,
      gestorIdempotencia,
      registradorSoporte,
    );

    inactivarChacra = new InactivarChacra(
      repoChacras,
      verificadorEmpresa,
      verificadorLotes,
      gestorIdempotencia,
      registradorSoporte,
    );
  });

  describe('TER-UC-001 — Registrar Chacra', () => {
    it('@TER-UC-001 @AC-01: Administrador registra Chacra en su Empresa exitosamente', async () => {
      const res = await registrarChacra.ejecutar(
        empresaAId,
        {
          nombre: 'Chacra Santa Inés',
          nombreCorto: 'Santa Inés',
          responsableNombre: 'Mario Benítez',
          direccionTexto: 'Ruta 12 km 1400',
          ubicacionGeografica: { latitud: -26.0, longitud: -54.0 },
        },
        contextoAdminA,
      );

      expect(res.id).toBeDefined();
      expect(res.empresaId).toBe(empresaAId);
      expect(res.nombre).toBe('Chacra Santa Inés');
      expect(res.nombreCorto).toBe('Santa Inés');
      expect(res.estado).toBe(EstadoChacra.ACTIVA);
      expect(res.version).toBe(1);
    });

    it('@TER-UC-001 @AC-02: Rechaza solicitud sin permiso con TER_ACCESO_DENEGADO', async () => {
      const contextoPeon: ContextoActorTer = {
        actorId: 'peon-1',
        rol: 'EMPLEADO',
        empresaId: empresaAId,
        solicitudId,
      };

      await expect(
        registrarChacra.ejecutar(
          empresaAId,
          { nombre: 'Chacra Test', nombreCorto: 'Test' },
          contextoPeon,
        ),
      ).rejects.toMatchObject({ codigo: 'TER_ACCESO_DENEGADO' });
    });

    it('@TER-UC-001 @AC-03: Administrador de Empresa A intentando operar en Empresa B es rechazado', async () => {
      await expect(
        registrarChacra.ejecutar(
          empresaBId,
          { nombre: 'Chacra B', nombreCorto: 'B' },
          contextoAdminA,
        ),
      ).rejects.toMatchObject({ codigo: 'ACC_EMPRESA_FUERA_DE_ALCANCE' });
    });

    it('SuperAdministrador registra chacra con motivo y se registra auditoría', async () => {
      const res = await registrarChacra.ejecutar(
        empresaAId,
        { nombre: 'Chacra Plat', nombreCorto: 'Plat' },
        contextoSuperAdminConMotivo,
      );

      expect(res.id).toBeDefined();
      expect(registradorSoporte.intervenciones).toHaveLength(1);
      expect(registradorSoporte.intervenciones[0].motivo).toBe(
        'Configuración inicial de chacras',
      );
    });

    it('SuperAdministrador sin motivo es rechazado con ACC_CONTEXTO_SOPORTE_REQUERIDO', async () => {
      const contextoSinMotivo: ContextoActorTer = {
        actorId: superAdminId,
        rol: 'SUPER_ADMINISTRADOR',
        solicitudId,
      };

      await expect(
        registrarChacra.ejecutar(
          empresaAId,
          { nombre: 'Chacra Plat', nombreCorto: 'Plat' },
          contextoSinMotivo,
        ),
      ).rejects.toMatchObject({ codigo: 'ACC_CONTEXTO_SOPORTE_REQUERIDO' });
    });

    it('Rechaza nombre corto duplicado en la misma Empresa con TER_NOMBRE_CORTO_DUPLICADO', async () => {
      await registrarChacra.ejecutar(
        empresaAId,
        { nombre: 'Chacra Uno', nombreCorto: 'Campo Sur' },
        contextoAdminA,
      );

      await expect(
        registrarChacra.ejecutar(
          empresaAId,
          { nombre: 'Chacra Dos', nombreCorto: 'campo sur' },
          contextoAdminA,
        ),
      ).rejects.toMatchObject({ codigo: 'TER_NOMBRE_CORTO_DUPLICADO' });
    });

    it('Permite el mismo nombre corto en Empresas distintas', async () => {
      const contextoAdminB: ContextoActorTer = {
        actorId: 'admin-b',
        rol: 'ADMINISTRADOR',
        empresaId: empresaBId,
        solicitudId,
      };

      await registrarChacra.ejecutar(
        empresaAId,
        { nombre: 'Chacra A', nombreCorto: 'El Ombu' },
        contextoAdminA,
      );

      const resB = await registrarChacra.ejecutar(
        empresaBId,
        { nombre: 'Chacra B', nombreCorto: 'El Ombu' },
        contextoAdminB,
      );

      expect(resB.id).toBeDefined();
    });

    it('Idempotencia: reintento con misma clave devuelve el mismo resultado o genera conflicto', async () => {
      const key = 'idem-chacra-1';
      const res1 = await registrarChacra.ejecutar(
        empresaAId,
        { nombre: 'Chacra Idem', nombreCorto: 'Idem', idempotencyKey: key },
        contextoAdminA,
      );

      const res2 = await registrarChacra.ejecutar(
        empresaAId,
        { nombre: 'Chacra Idem', nombreCorto: 'Idem', idempotencyKey: key },
        contextoAdminA,
      );

      expect(res1.id).toBe(res2.id);

      // Reintento con distinta carga
      await expect(
        registrarChacra.ejecutar(
          empresaAId,
          { nombre: 'Chacra Otra', nombreCorto: 'Otra', idempotencyKey: key },
          contextoAdminA,
        ),
      ).rejects.toMatchObject({ codigo: 'TER_IDEMPOTENCIA_CONFLICTO' });
    });
  });

  describe('TER-UC-004 — Modificar Chacra', () => {
    let chacraCreadaId: string;

    beforeEach(async () => {
      const creada = await registrarChacra.ejecutar(
        empresaAId,
        {
          nombre: 'Chacra Base',
          nombreCorto: 'Base',
          responsableNombre: 'Juan',
        },
        contextoAdminA,
      );
      chacraCreadaId = creada.id;
    });

    it('@TER-UC-004 @AC-01: Modifica datos descriptivos incrementando versión', async () => {
      const mod = await modificarChacra.ejecutar(
        empresaAId,
        chacraCreadaId,
        {
          nombre: 'Chacra Base Modificada',
          versionEsperada: 1,
        },
        contextoAdminA,
      );

      expect(mod.nombre).toBe('Chacra Base Modificada');
      expect(mod.nombreCorto).toBe('Base'); // Conservado
      expect(mod.responsableNombre).toBe('Juan'); // Conservado
      expect(mod.version).toBe(2);
    });

    it('@TER-UC-004 @AC-04: Conflicto de versión cuando If-Match no coincide', async () => {
      await expect(
        modificarChacra.ejecutar(
          empresaAId,
          chacraCreadaId,
          { nombre: 'Cambio', versionEsperada: 99 },
          contextoAdminA,
        ),
      ).rejects.toMatchObject({ codigo: 'TER_VERSION_CONFLICTO' });
    });

    it('Rechaza chacra inexistente con TER_CHACRA_NO_ENCONTRADA', async () => {
      await expect(
        modificarChacra.ejecutar(
          empresaAId,
          '0192e210-ffff-7000-8000-000000000000',
          { nombre: 'Cambio' },
          contextoAdminA,
        ),
      ).rejects.toMatchObject({ codigo: 'TER_CHACRA_NO_ENCONTRADA' });
    });

    it('Rechaza modificar datos descriptivos sobre chacra inactiva con TER_OPERACION_INACTIVA_INVALIDA', async () => {
      await inactivarChacra.ejecutar(
        empresaAId,
        chacraCreadaId,
        { versionEsperada: 1 },
        contextoAdminA,
      );

      await expect(
        modificarChacra.ejecutar(
          empresaAId,
          chacraCreadaId,
          { nombre: 'Cambio Invalido' },
          contextoAdminA,
        ),
      ).rejects.toMatchObject({ codigo: 'TER_OPERACION_INACTIVA_INVALIDA' });
    });
  });

  describe('TER-UC-005 — Inactivar Chacra', () => {
    let chacraCreadaId: string;

    beforeEach(async () => {
      const creada = await registrarChacra.ejecutar(
        empresaAId,
        { nombre: 'Chacra Para Inactivar', nombreCorto: 'Inac' },
        contextoAdminA,
      );
      chacraCreadaId = creada.id;
    });

    it('@TER-UC-005 @AC-01: Inactiva Chacra sin Lotes activos con éxito', async () => {
      const res = await inactivarChacra.ejecutar(
        empresaAId,
        chacraCreadaId,
        { versionEsperada: 1 },
        contextoAdminA,
      );

      expect(res.estado).toBe(EstadoChacra.INACTIVA);
      expect(res.version).toBe(2);
    });

    it('Rechaza inactivación si contiene Lotes activos con TER_ESTADO_CHACRA_LOTES_INCOMPATIBLE (TER-BR-023)', async () => {
      verificadorLotes.chacrasConLotesActivos.add(chacraCreadaId);

      await expect(
        inactivarChacra.ejecutar(
          empresaAId,
          chacraCreadaId,
          { versionEsperada: 1 },
          contextoAdminA,
        ),
      ).rejects.toMatchObject({
        codigo: 'TER_ESTADO_CHACRA_LOTES_INCOMPATIBLE',
      });
    });

    it('Rechaza inactivar una Chacra ya inactiva con TER_TRANSICION_ESTADO_INVALIDA', async () => {
      await inactivarChacra.ejecutar(
        empresaAId,
        chacraCreadaId,
        { versionEsperada: 1 },
        contextoAdminA,
      );

      await expect(
        inactivarChacra.ejecutar(
          empresaAId,
          chacraCreadaId,
          { versionEsperada: 2 },
          contextoAdminA,
        ),
      ).rejects.toMatchObject({ codigo: 'TER_TRANSICION_ESTADO_INVALIDA' });
    });
  });
});
