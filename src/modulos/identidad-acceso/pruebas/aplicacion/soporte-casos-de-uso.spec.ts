import { ResolverContextoSoporte } from '../../aplicacion/comandos/resolver-contexto-soporte.caso-de-uso';
import { ConsultarIntervencionesSoporte } from '../../aplicacion/consultas/consultar-intervenciones-soporte.caso-de-uso';
import {
  RepositorioIntervencionesSoporte,
  OpcionesPaginacionIntervenciones,
} from '../../aplicacion/puertos/salida/repositorio-intervenciones-soporte';
import { VerificadorEmpresaPuerto } from '../../aplicacion/puertos/salida/verificador-empresa.puerto';
import { ContextoActorAcc } from '../../aplicacion/puertos/salida/contexto-actor-acc';
import { IntervencionSoporte } from '../../dominio/entidades/intervencion-soporte';
import { MotivoSoporte } from '../../dominio/objetos-valor/motivo-soporte';

class RepositorioIntervencionesMemoria implements RepositorioIntervencionesSoporte {
  public intervenciones: IntervencionSoporte[] = [];

  guardar(intervencion: IntervencionSoporte): Promise<void> {
    this.intervenciones.push(intervencion);
    return Promise.resolve();
  }

  listarPorEmpresa(
    empresaId: string,
    opciones: OpcionesPaginacionIntervenciones,
  ): Promise<{ datos: IntervencionSoporte[]; total: number }> {
    const filtradas = this.intervenciones.filter(
      (i) => i.empresaId === empresaId,
    );

    // Orden
    filtradas.sort((a, b) => {
      const diff = a.ocurridaEn.getTime() - b.ocurridaEn.getTime();
      if (diff !== 0) {
        return opciones.orden === 'ocurridaEn:asc' ? diff : -diff;
      }
      return a.id.localeCompare(b.id);
    });

    const total = filtradas.length;
    const datos = filtradas.slice(
      opciones.desplazamiento,
      opciones.desplazamiento + opciones.limite,
    );

    return Promise.resolve({ datos, total });
  }
}

class VerificadorEmpresaFalso implements VerificadorEmpresaPuerto {
  public empresasExistentes = new Set<string>();

  existeEmpresa(empresaId: string): Promise<boolean> {
    return Promise.resolve(this.empresasExistentes.has(empresaId));
  }

  obtenerPorId(
    empresaId: string,
  ): Promise<{ id: string; alias: string; estado: string } | null> {
    if (!this.empresasExistentes.has(empresaId)) return Promise.resolve(null);
    return Promise.resolve({
      id: empresaId,
      alias: 'empresa-test',
      estado: 'ACTIVA',
    });
  }

  obtenerPorAlias(
    alias: string,
  ): Promise<{ id: string; alias: string; estado: string } | null> {
    return Promise.resolve({
      id: 'empresa-alias-id',
      alias,
      estado: 'ACTIVA',
    });
  }
}

describe('Identidad y Acceso — Soporte y Consultas (T03)', () => {
  const empresaValidaId = '550e8400-e29b-41d4-a716-446655440000';
  const superAdminId = 'c7e0c457-3f9b-4bf4-bb85-055f69e6b360';
  const solicitudId = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';
  const sesionId = 'sesion-plataforma-1';

  let repoIntervenciones: RepositorioIntervencionesMemoria;
  let verificadorEmpresa: VerificadorEmpresaFalso;
  let resolverContextoSoporte: ResolverContextoSoporte;
  let consultarIntervenciones: ConsultarIntervencionesSoporte;

  beforeEach(() => {
    repoIntervenciones = new RepositorioIntervencionesMemoria();
    verificadorEmpresa = new VerificadorEmpresaFalso();
    verificadorEmpresa.empresasExistentes.add(empresaValidaId);

    resolverContextoSoporte = new ResolverContextoSoporte(
      repoIntervenciones,
      verificadorEmpresa,
    );

    consultarIntervenciones = new ConsultarIntervencionesSoporte(
      repoIntervenciones,
      verificadorEmpresa,
      resolverContextoSoporte,
    );
  });

  describe('ACC-UC-007 — Resolver contexto de soporte', () => {
    const contextoSuperAdmin: ContextoActorAcc = {
      actorId: superAdminId,
      rol: 'SUPER_ADMINISTRADOR',
      sesionId,
      solicitudId,
    };

    it('@ACC-UC-007 @AC-01: debe resolver el contexto de soporte con los datos requeridos', async () => {
      const contexto = await resolverContextoSoporte.ejecutar(
        {
          empresaId: empresaValidaId,
          motivo: 'Asistencia técnica solicitada',
        },
        contextoSuperAdmin,
      );

      expect(contexto.intervencionId).toBeDefined();
      expect(contexto.empresaId).toBe(empresaValidaId);
      expect(contexto.motivo).toBe('Asistencia técnica solicitada');
      expect(contexto.actorId).toBe(superAdminId);
      expect(contexto.sesionId).toBe(sesionId);
      expect(contexto.solicitudId).toBe(solicitudId);
      expect(repoIntervenciones.intervenciones).toHaveLength(1);
    });

    it('@ACC-UC-007 @AC-02: debe rechazar un actor sin rol SUPER_ADMINISTRADOR con ACC_ACCESO_DENEGADO', async () => {
      const contextoNoSuperAdmin: ContextoActorAcc = {
        actorId: 'otro-usuario',
        rol: 'ADMINISTRADOR',
        empresaId: empresaValidaId,
        solicitudId,
      };

      await expect(
        resolverContextoSoporte.ejecutar(
          { empresaId: empresaValidaId, motivo: 'Soporte' },
          contextoNoSuperAdmin,
        ),
      ).rejects.toMatchObject({
        codigo: 'ACC_ACCESO_DENEGADO',
      });
    });

    it('@ACC-UC-007 @AC-04: debe rechazar solicitud sin empresaId o motivo con ACC_CONTEXTO_SOPORTE_REQUERIDO', async () => {
      await expect(
        resolverContextoSoporte.ejecutar(
          { empresaId: '', motivo: 'Soporte' },
          contextoSuperAdmin,
        ),
      ).rejects.toMatchObject({
        codigo: 'ACC_CONTEXTO_SOPORTE_REQUERIDO',
      });
    });

    it('@ACC-UC-007 @AC-05: debe rechazar empresa destino inexistente con ACC_EMPRESA_NO_ENCONTRADA', async () => {
      await expect(
        resolverContextoSoporte.ejecutar(
          {
            empresaId: '999e8400-e29b-41d4-a716-446655449999',
            motivo: 'Soporte',
          },
          contextoSuperAdmin,
        ),
      ).rejects.toMatchObject({
        codigo: 'ACC_EMPRESA_NO_ENCONTRADA',
      });
    });

    it('@ACC-UC-007 @AC-07: debe rechazar un motivo mayor a 1000 caracteres con ACC_MOTIVO_SOPORTE_INVALIDO', async () => {
      const motivo1001 = 'x'.repeat(1001);
      await expect(
        resolverContextoSoporte.ejecutar(
          { empresaId: empresaValidaId, motivo: motivo1001 },
          contextoSuperAdmin,
        ),
      ).rejects.toMatchObject({
        codigo: 'ACC_MOTIVO_SOPORTE_INVALIDO',
      });
    });
  });

  describe('ACC-UC-011 — Consultar intervenciones de soporte', () => {
    beforeEach(async () => {
      // Pre-cargar 2 intervenciones
      await repoIntervenciones.guardar(
        IntervencionSoporte.crear({
          id: 'int-1',
          usuarioPlataformaId: superAdminId,
          empresaId: empresaValidaId,
          motivo: MotivoSoporte.crear('Atención incidente A'),
          sesionId: 'ses-1',
          solicitudId: 'sol-1',
          ocurridaEn: new Date('2026-11-08T10:00:00Z'),
        }),
      );
      await repoIntervenciones.guardar(
        IntervencionSoporte.crear({
          id: 'int-2',
          usuarioPlataformaId: superAdminId,
          empresaId: empresaValidaId,
          motivo: MotivoSoporte.crear('Atención incidente B'),
          sesionId: 'ses-2',
          solicitudId: 'sol-2',
          ocurridaEn: new Date('2026-11-09T10:00:00Z'),
        }),
      );
    });

    it('@ACC-UC-011 @AC-01: Administrador consulta y recibe proyección como Soporte de plataforma sin datos sensibles', async () => {
      const contextoAdmin: ContextoActorAcc = {
        actorId: 'admin-empresa-1',
        rol: 'ADMINISTRADOR',
        empresaId: empresaValidaId,
        solicitudId,
      };

      const respuesta = await consultarIntervenciones.ejecutar(
        { empresaId: empresaValidaId },
        contextoAdmin,
      );

      expect(respuesta.datos).toHaveLength(2);
      expect(respuesta.paginacion.total).toBe(2);
      // Validar proyección segura (ACC-BR-009)
      const primera = respuesta.datos[0] as unknown as Record<string, unknown>;
      expect(primera.id).toBe('int-2'); // orden desc por defecto
      expect(primera.actor).toBe('Soporte de plataforma');
      expect(primera.usuarioPlataformaId).toBeUndefined();
      expect(primera.motivo).toBeUndefined();
      expect(primera.sesionId).toBeUndefined();
    });

    it('@ACC-UC-011 @AC-02: debe rechazar consulta sin rol permitido con ACC_ACCESO_DENEGADO', async () => {
      const contextoInvalido: ContextoActorAcc = {
        actorId: 'peon-1',
        rol: 'EMPLEADO',
        empresaId: empresaValidaId,
        solicitudId,
      };

      await expect(
        consultarIntervenciones.ejecutar(
          { empresaId: empresaValidaId },
          contextoInvalido,
        ),
      ).rejects.toMatchObject({
        codigo: 'ACC_ACCESO_DENEGADO',
      });
    });

    it('@ACC-UC-011 @AC-03: Administrador intentando consultar otra empresa es rechazado con ACC_EMPRESA_FUERA_DE_ALCANCE', async () => {
      const contextoAdmin: ContextoActorAcc = {
        actorId: 'admin-empresa-1',
        rol: 'ADMINISTRADOR',
        empresaId: empresaValidaId,
        solicitudId,
      };

      await expect(
        consultarIntervenciones.ejecutar(
          { empresaId: '660e8400-e29b-41d4-a716-446655440000' },
          contextoAdmin,
        ),
      ).rejects.toMatchObject({
        codigo: 'ACC_EMPRESA_FUERA_DE_ALCANCE',
      });
    });

    it('SuperAdministrador consulta requiriendo Motivo-Soporte y genera intervención auditable', async () => {
      const contextoSuperAdmin: ContextoActorAcc = {
        actorId: superAdminId,
        rol: 'SUPER_ADMINISTRADOR',
        sesionId,
        solicitudId,
      };

      // Sin motivo debe fallar
      await expect(
        consultarIntervenciones.ejecutar(
          { empresaId: empresaValidaId },
          contextoSuperAdmin,
        ),
      ).rejects.toMatchObject({
        codigo: 'ACC_CONTEXTO_SOPORTE_REQUERIDO',
      });

      // Con motivo debe registrar la nueva intervención de soporte y devolver la lista
      const respuesta = await consultarIntervenciones.ejecutar(
        {
          empresaId: empresaValidaId,
          motivoSoporte: 'Auditoría interna de intervenciones',
        },
        contextoSuperAdmin,
      );

      expect(respuesta.datos).toHaveLength(3);
      expect(respuesta.paginacion.total).toBe(3);
    });
  });
});
