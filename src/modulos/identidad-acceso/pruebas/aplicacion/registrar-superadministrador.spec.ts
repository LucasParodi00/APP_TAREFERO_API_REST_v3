import { RegistrarSuperAdministrador } from '../../aplicacion/comandos/registrar-superadministrador.caso-de-uso';
import { RepositorioUsuariosPlataforma } from '../../aplicacion/puertos/salida/repositorio-usuarios-plataforma';
import {
  GestorIdempotenciaAcc,
  RegistroIdempotencia,
} from '../../aplicacion/puertos/salida/gestor-idempotencia-acc';
import { ContextoActorAcc } from '../../aplicacion/puertos/salida/contexto-actor-acc';
import { UsuarioPlataforma } from '../../dominio/entidades/usuario-plataforma';

class RepositorioUsuariosPlataformaEnMemoria implements RepositorioUsuariosPlataforma {
  public usuarios: UsuarioPlataforma[] = [];

  contarTotal(): Promise<number> {
    return Promise.resolve(this.usuarios.length);
  }

  contarActivos(): Promise<number> {
    return Promise.resolve(this.usuarios.filter((u) => u.activo).length);
  }

  buscarPorId(id: string): Promise<UsuarioPlataforma | null> {
    return Promise.resolve(this.usuarios.find((u) => u.id === id) ?? null);
  }

  guardar(usuario: UsuarioPlataforma): Promise<void> {
    const idx = this.usuarios.findIndex((u) => u.id === usuario.id);
    if (idx >= 0) {
      this.usuarios[idx] = usuario;
    } else {
      this.usuarios.push(usuario);
    }
    return Promise.resolve();
  }
}

class GestorIdempotenciaEnMemoria implements GestorIdempotenciaAcc {
  public registros = new Map<string, RegistroIdempotencia>();

  obtener(clave: string): Promise<RegistroIdempotencia | null> {
    return Promise.resolve(this.registros.get(clave) ?? null);
  }

  guardar(registro: RegistroIdempotencia): Promise<void> {
    this.registros.set(registro.clave, registro);
    return Promise.resolve();
  }
}

describe('ACC-UC-006 — Registrar SuperAdministrador (T02)', () => {
  let repoUsuarios: RepositorioUsuariosPlataformaEnMemoria;
  let gestorIdempotencia: GestorIdempotenciaEnMemoria;
  let casoDeUso: RegistrarSuperAdministrador;

  beforeEach(() => {
    repoUsuarios = new RepositorioUsuariosPlataformaEnMemoria();
    gestorIdempotencia = new GestorIdempotenciaEnMemoria();
    casoDeUso = new RegistrarSuperAdministrador(
      repoUsuarios,
      gestorIdempotencia,
    );
  });

  describe('Inicialización (@ACC-UC-006 @AC-05)', () => {
    it('debe permitir inicializar el primer SuperAdministrador cuando no hay usuarios', async () => {
      const contexto: ContextoActorAcc = {
        actorId: 'proceso-init',
        rol: 'PROCESO_INICIALIZACION',
        solicitudId: 'sol-1',
      };

      const resultado = await casoDeUso.ejecutar(
        { rol: 'SUPER_ADMINISTRADOR' },
        contexto,
      );

      expect(resultado.id).toBeDefined();
      expect(resultado.rol).toBe('SUPER_ADMINISTRADOR');
      expect(resultado.activo).toBe(true);
      expect(await repoUsuarios.contarTotal()).toBe(1);
    });

    it('debe rechazar la inicialización si la plataforma ya tiene usuarios con ACC_INICIALIZACION_NO_PERMITIDA', async () => {
      await repoUsuarios.guardar(
        UsuarioPlataforma.crear({
          id: 'existente-1',
          rol: 'SUPER_ADMINISTRADOR',
          activo: true,
        }),
      );

      const contexto: ContextoActorAcc = {
        actorId: 'proceso-init',
        rol: 'PROCESO_INICIALIZACION',
        solicitudId: 'sol-2',
      };

      await expect(
        casoDeUso.ejecutar({ rol: 'SUPER_ADMINISTRADOR' }, contexto),
      ).rejects.toMatchObject({
        codigo: 'ACC_INICIALIZACION_NO_PERMITIDA',
      });
    });
  });

  describe('Altas posteriores por SuperAdministrador (@ACC-UC-006 @AC-01)', () => {
    beforeEach(async () => {
      await repoUsuarios.guardar(
        UsuarioPlataforma.crear({
          id: 'admin-raiz',
          rol: 'SUPER_ADMINISTRADOR',
          activo: true,
        }),
      );
    });

    it('debe permitir crear un nuevo SuperAdministrador a un actor autorizado', async () => {
      const contexto: ContextoActorAcc = {
        actorId: 'admin-raiz',
        rol: 'SUPER_ADMINISTRADOR',
        solicitudId: 'sol-3',
      };

      const resultado = await casoDeUso.ejecutar(
        { rol: 'SUPER_ADMINISTRADOR' },
        contexto,
      );

      expect(resultado.id).toBeDefined();
      expect(resultado.rol).toBe('SUPER_ADMINISTRADOR');
      expect(resultado.activo).toBe(true);
      expect(await repoUsuarios.contarTotal()).toBe(2);
    });

    it('debe rechazar la solicitud si el actor no es SuperAdministrador con ACC_ACCESO_DENEGADO (@ACC-UC-006 @AC-02)', async () => {
      const contextoEmpresa: ContextoActorAcc = {
        actorId: 'usuario-empresa',
        rol: 'ADMINISTRADOR',
        empresaId: 'empresa-1',
        solicitudId: 'sol-4',
      };

      await expect(
        casoDeUso.ejecutar({ rol: 'SUPER_ADMINISTRADOR' }, contextoEmpresa),
      ).rejects.toMatchObject({
        codigo: 'ACC_ACCESO_DENEGADO',
      });
    });

    it('debe rechazar rol incompatible con ACC_ROL_NO_ADMITIDO (@ACC-UC-006 @AC-03)', async () => {
      const contexto: ContextoActorAcc = {
        actorId: 'admin-raiz',
        rol: 'SUPER_ADMINISTRADOR',
        solicitudId: 'sol-5',
      };

      await expect(
        casoDeUso.ejecutar({ rol: 'EMPLEADO' }, contexto),
      ).rejects.toMatchObject({
        codigo: 'ACC_ROL_NO_ADMITIDO',
      });
    });
  });

  describe('Idempotencia de alta', () => {
    const contexto: ContextoActorAcc = {
      actorId: 'admin-raiz',
      rol: 'SUPER_ADMINISTRADOR',
      solicitudId: 'sol-6',
    };

    beforeEach(async () => {
      await repoUsuarios.guardar(
        UsuarioPlataforma.crear({
          id: 'admin-raiz',
          rol: 'SUPER_ADMINISTRADOR',
          activo: true,
        }),
      );
    });

    it('debe devolver el mismo resultado si se reintenta con la misma clave e igual payload', async () => {
      const res1 = await casoDeUso.ejecutar(
        { rol: 'SUPER_ADMINISTRADOR', idempotencyKey: 'clave-1' },
        contexto,
      );

      const res2 = await casoDeUso.ejecutar(
        { rol: 'SUPER_ADMINISTRADOR', idempotencyKey: 'clave-1' },
        contexto,
      );

      expect(res1.id).toBe(res2.id);
      expect(await repoUsuarios.contarTotal()).toBe(2);
    });

    it('debe rechazar si se reintenta con la misma clave y payload diferente con ACC_IDEMPOTENCIA_CONFLICTO', async () => {
      await casoDeUso.ejecutar(
        { rol: 'SUPER_ADMINISTRADOR', idempotencyKey: 'clave-2' },
        contexto,
      );

      await expect(
        casoDeUso.ejecutar(
          {
            id: '11111111-1111-1111-1111-111111111111',
            rol: 'SUPER_ADMINISTRADOR',
            idempotencyKey: 'clave-2',
          },
          contexto,
        ),
      ).rejects.toMatchObject({
        codigo: 'ACC_IDEMPOTENCIA_CONFLICTO',
      });
    });
  });
});
