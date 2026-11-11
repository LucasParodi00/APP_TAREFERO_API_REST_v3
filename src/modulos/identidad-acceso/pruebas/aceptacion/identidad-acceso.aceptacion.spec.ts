import { HabilitarCuentaEmpresa } from '../../aplicacion/comandos/habilitar-cuenta-empresa.caso-de-uso';
import { IniciarSesion } from '../../aplicacion/comandos/iniciar-sesion.caso-de-uso';
import { ConsultarAutorizacionVigente } from '../../aplicacion/consultas/consultar-autorizacion-vigente.caso-de-uso';
import { CambiarContrasenia } from '../../aplicacion/comandos/cambiar-contrasenia.caso-de-uso';
import { RestablecerContrasenia } from '../../aplicacion/comandos/restablecer-contrasenia.caso-de-uso';
import { InicializarSuperAdministrador } from '../../aplicacion/comandos/inicializar-super-administrador.caso-de-uso';
import { RegistrarIntervencionSoporte } from '../../aplicacion/comandos/registrar-intervencion-soporte.caso-de-uso';
import { ConsultarCuentasEmpresa } from '../../aplicacion/consultas/consultar-cuentas-empresa.caso-de-uso';
import { RenovarSesion } from '../../aplicacion/comandos/renovar-sesion.caso-de-uso';
import { CambiarEstadoCuenta } from '../../aplicacion/comandos/cambiar-estado-cuenta.caso-de-uso';
import { ConsultarIntervencionesSoporte } from '../../aplicacion/consultas/consultar-intervenciones-soporte.caso-de-uso';
import { ActualizarRolesCanalesCuenta } from '../../aplicacion/comandos/actualizar-roles-canales-cuenta.caso-de-uso';
import { VincularEmpleado } from '../../aplicacion/comandos/vincular-empleado.caso-de-uso';

import { RepositorioCuentasEmpresa } from '../../dominio/repositorios/repositorio-cuentas-empresa';
import { RepositorioSesiones } from '../../dominio/repositorios/repositorio-sesiones';
import { RepositorioUsuariosPlataforma } from '../../dominio/repositorios/repositorio-usuarios-plataforma';
import { RepositorioIntervencionesSoporte } from '../../dominio/repositorios/repositorio-intervenciones-soporte';
import {
    ConsultaCuentasEmpresa,
    FiltrosListarCuentas,
    ResultadoListadoCuentas,
    CuentaEmpresaLectura,
} from '../../aplicacion/puertos/consulta-cuentas-empresa.puerto';
import {
    ConsultaIntervencionesSoporte,
    FiltrosListarIntervenciones,
    ResultadoListadoIntervenciones,
    IntervencionSoporteLectura,
} from '../../aplicacion/puertos/consulta-intervenciones-soporte.puerto';
import { ResolvedorEmpresa, EmpresaAcceso } from '../../aplicacion/puertos/resolvedor-empresa.puerto';
import { VerificadorCupoAcceso } from '../../aplicacion/puertos/verificador-cupo-acceso.puerto';
import { VerificadorEmpleado } from '../../aplicacion/puertos/verificador-empleado.puerto';
import { Reloj } from '../../aplicacion/puertos/reloj.puerto';
import { ContextoSolicitud } from '../../aplicacion/puertos/contexto-solicitud';

import { CuentaEmpresa } from '../../dominio/entidades/cuenta-empresa.entidad';
import { SesionEmpresa } from '../../dominio/entidades/sesion-empresa.entidad';
import { UsuarioPlataforma } from '../../dominio/entidades/usuario-plataforma.entidad';
import { IntervencionSoporte } from '../../dominio/entidades/intervencion-soporte.entidad';
import { RolCodigo } from '../../dominio/enumeraciones/rol-codigo.enum';
import { CanalAcceso } from '../../dominio/enumeraciones/canal-acceso.enum';
import { EstadoCuenta } from '../../dominio/enumeraciones/estado-cuenta.enum';
import { CorreoAcceso } from '../../dominio/objetos-valor/correo-acceso.vo';

import { ServicioHashArgon2 } from '../../infraestructura/seguridad/servicio-hash-argon2';
import { GeneradorTokensJose } from '../../infraestructura/seguridad/generador-tokens-jose';

import {
    CorreoDuplicado,
    LimiteAccesosAlcanzado,
    VinculoEmpleadoInvalido,
    CanalNoPermitido,
    CuentaSuspendida,
    CredencialesInvalidas,
    MotivoSoporteInvalido,
    InicializacionNoPermitida,
} from '../../dominio/errores/errores-identidad-acceso';
import { EmpleadoNoDisponible, AccesoDenegado } from '../../aplicacion/errores/errores-aplicacion';

// ==========================================
// TEST DOUBLES (IN-MEMORY REPOSITORIES)
// ==========================================

class RelojSimulado implements Reloj {
    private tiempoActual: Date = new Date('2026-11-11T12:00:00Z');

    ahora(): Date {
        return new Date(this.tiempoActual.getTime());
    }

    avanzarHoras(horas: number): void {
        this.tiempoActual = new Date(this.tiempoActual.getTime() + horas * 3600 * 1000);
    }
}

class RepositorioCuentasMemoria implements RepositorioCuentasEmpresa {
    public cuentas = new Map<string, CuentaEmpresa>();

    guardar(cuenta: CuentaEmpresa): Promise<void> {
        this.cuentas.set(cuenta.id, cuenta);
        return Promise.resolve();
    }

    buscarPorId(id: string, empresaId: string): Promise<CuentaEmpresa | null> {
        const cuenta = this.cuentas.get(id);
        if (!cuenta || cuenta.empresaId !== empresaId) return Promise.resolve(null);
        return Promise.resolve(cuenta);
    }

    buscarPorCorreo(correo: CorreoAcceso, empresaId: string): Promise<CuentaEmpresa | null> {
        for (const c of this.cuentas.values()) {
            if (c.empresaId === empresaId && c.correoAcceso.valor === correo.valor) {
                return Promise.resolve(c);
            }
        }
        return Promise.resolve(null);
    }

    buscarPorEmpleadoId(empleadoId: string, empresaId: string): Promise<CuentaEmpresa | null> {
        for (const c of this.cuentas.values()) {
            if (c.empresaId === empresaId && c.empleadoId === empleadoId) {
                return Promise.resolve(c);
            }
        }
        return Promise.resolve(null);
    }

    contarActivasPorEmpresa(empresaId: string): Promise<number> {
        let count = 0;
        for (const c of this.cuentas.values()) {
            if (c.empresaId === empresaId && c.estado === EstadoCuenta.ACTIVA) count++;
        }
        return Promise.resolve(count);
    }
}

class RepositorioSesionesMemoria implements RepositorioSesiones {
    public sesiones = new Map<string, SesionEmpresa>();

    guardar(sesion: SesionEmpresa): Promise<void> {
        this.sesiones.set(sesion.id, sesion);
        return Promise.resolve();
    }

    buscarPorId(id: string): Promise<SesionEmpresa | null> {
        return Promise.resolve(this.sesiones.get(id) ?? null);
    }

    buscarPorHashTokenRenovacion(hash: string): Promise<SesionEmpresa | null> {
        for (const s of this.sesiones.values()) {
            if (s.hashTokenRenovacion === hash) return Promise.resolve(s);
        }
        return Promise.resolve(null);
    }

    revocarTodasDeCuenta(cuentaEmpresaId: string, ahora: Date): Promise<void> {
        for (const s of this.sesiones.values()) {
            if (s.cuentaEmpresaId === cuentaEmpresaId && !s.revocadaEn) {
                s.revocar(ahora);
            }
        }
        return Promise.resolve();
    }

    buscarPorFamiliaId(familiaId: string): Promise<SesionEmpresa[]> {
        const res: SesionEmpresa[] = [];
        for (const s of this.sesiones.values()) {
            if (s.familiaId === familiaId) res.push(s);
        }
        return Promise.resolve(res);
    }

    revocarFamilia(familiaId: string, fechaRevocacion: Date): Promise<void> {
        for (const s of this.sesiones.values()) {
            if (s.familiaId === familiaId && !s.revocadaEn) {
                s.revocar(fechaRevocacion);
            }
        }
        return Promise.resolve();
    }
}

class RepositorioUsuariosPlataformaMemoria implements RepositorioUsuariosPlataforma {
    public usuarios = new Map<string, UsuarioPlataforma>();

    guardar(usuario: UsuarioPlataforma): Promise<void> {
        this.usuarios.set(usuario.id, usuario);
        return Promise.resolve();
    }

    buscarPorId(id: string): Promise<UsuarioPlataforma | null> {
        return Promise.resolve(this.usuarios.get(id) ?? null);
    }

    buscarPorCorreo(correo: CorreoAcceso): Promise<UsuarioPlataforma | null> {
        for (const u of this.usuarios.values()) {
            if (u.correo.valor === correo.valor) return Promise.resolve(u);
        }
        return Promise.resolve(null);
    }

    contarActivos(): Promise<number> {
        let count = 0;
        for (const u of this.usuarios.values()) {
            if (u.activo) count++;
        }
        return Promise.resolve(count);
    }
}

class RepositorioIntervencionesSoporteMemoria implements RepositorioIntervencionesSoporte {
    public intervenciones = new Map<string, IntervencionSoporte>();

    guardar(intervencion: IntervencionSoporte): Promise<void> {
        this.intervenciones.set(intervencion.id, intervencion);
        return Promise.resolve();
    }

    buscarPorId(id: string): Promise<IntervencionSoporte | null> {
        return Promise.resolve(this.intervenciones.get(id) ?? null);
    }
}

class ConsultaCuentasMemoria implements ConsultaCuentasEmpresa {
    constructor(private readonly repo: RepositorioCuentasMemoria) {}

    consultarPorId(empresaId: string, cuentaId: string): Promise<CuentaEmpresaLectura | null> {
        const cuenta = this.repo.cuentas.get(cuentaId);
        if (!cuenta || cuenta.empresaId !== empresaId) return Promise.resolve(null);
        return Promise.resolve({
            id: cuenta.id,
            empresaId: cuenta.empresaId,
            empleadoId: cuenta.empleadoId,
            nombreMostrado: cuenta.nombreMostrado?.valor,
            correoAcceso: cuenta.correoAcceso.valor,
            accesoWeb: cuenta.accesoWeb,
            accesoMovil: cuenta.accesoMovil,
            roles: cuenta.roles,
            estado: cuenta.estado,
            version: cuenta.version,
        });
    }

    listarCuentas(empresaId: string, filtros: FiltrosListarCuentas): Promise<ResultadoListadoCuentas> {
        const datos: CuentaEmpresaLectura[] = [];
        for (const c of this.repo.cuentas.values()) {
            if (c.empresaId !== empresaId) continue;
            if (filtros.estado && c.estado !== (filtros.estado as unknown as EstadoCuenta)) continue;
            if (filtros.rol && !c.roles.includes(filtros.rol as RolCodigo)) continue;
            datos.push({
                id: c.id,
                empresaId: c.empresaId,
                empleadoId: c.empleadoId,
                nombreMostrado: c.nombreMostrado?.valor,
                correoAcceso: c.correoAcceso.valor,
                accesoWeb: c.accesoWeb,
                accesoMovil: c.accesoMovil,
                roles: c.roles,
                estado: c.estado,
                version: c.version,
            });
        }
        return Promise.resolve({
            datos,
            paginacion: {
                limite: filtros.limite,
                desplazamiento: filtros.desplazamiento,
                total: datos.length,
            },
        });
    }
}

class ConsultaIntervencionesMemoria implements ConsultaIntervencionesSoporte {
    constructor(private readonly repo: RepositorioIntervencionesSoporteMemoria) {}

    listarIntervenciones(empresaId: string, filtros: FiltrosListarIntervenciones): Promise<ResultadoListadoIntervenciones> {
        const datos: IntervencionSoporteLectura[] = [];
        for (const i of this.repo.intervenciones.values()) {
            if (i.empresaId === empresaId) {
                datos.push({
                    id: i.id,
                    usuarioPlataformaId: i.usuarioPlataformaId,
                    empresaId: i.empresaId,
                    motivo: i.motivo.valor,
                    ocurridaEn: i.ocurridaEn,
                    venceEn: i.venceEn,
                });
            }
        }
        return Promise.resolve({
            datos,
            paginacion: {
                limite: filtros.limite,
                desplazamiento: filtros.desplazamiento,
                total: datos.length,
            },
        });
    }
}

class ResolvedorEmpresaMemoria implements ResolvedorEmpresa {
    public empresas = new Map<string, EmpresaAcceso>();

    buscarPorId(id: string): Promise<EmpresaAcceso | null> {
        return Promise.resolve(this.empresas.get(id) ?? null);
    }

    buscarPorAlias(alias: string): Promise<EmpresaAcceso | null> {
        for (const e of this.empresas.values()) {
            if (e.alias === alias) return Promise.resolve(e);
        }
        return Promise.resolve(null);
    }
}

class VerificadorCupoMemoria implements VerificadorCupoAcceso {
    public cupoDisponible = true;

    verificarCupoDisponible(): Promise<boolean> {
        return Promise.resolve(this.cupoDisponible);
    }
}

class VerificadorEmpleadoMemoria implements VerificadorEmpleado {
    public empleadosValidos = new Set<string>();

    verificarEmpleadoActivo(empresaId: string, empleadoId: string): Promise<boolean> {
        return Promise.resolve(this.empleadosValidos.has(`${empresaId}:${empleadoId}`));
    }
}

// ==========================================
// TEST SUITE: PRUEBAS DE ACEPTACIÓN GHERKIN
// ==========================================

describe('T16 — Pruebas de Aceptación e Integración de Casos de Uso (ACC-UC-001..ACC-UC-012)', () => {
    let repoCuentas: RepositorioCuentasMemoria;
    let repoSesiones: RepositorioSesionesMemoria;
    let repoUsuarios: RepositorioUsuariosPlataformaMemoria;
    let repoIntervenciones: RepositorioIntervencionesSoporteMemoria;
    let consultaCuentas: ConsultaCuentasMemoria;
    let consultaIntervenciones: ConsultaIntervencionesMemoria;
    let resolvedorEmpresa: ResolvedorEmpresaMemoria;
    let verificadorCupo: VerificadorCupoMemoria;
    let verificadorEmpleado: VerificadorEmpleadoMemoria;
    let reloj: RelojSimulado;
    let servicioHash: ServicioHashArgon2;
    let generadorTokens: GeneradorTokensJose;

    // Use cases
    let uc001HabilitarCuenta: HabilitarCuentaEmpresa;
    let uc002IniciarSesion: IniciarSesion;
    let uc003ConsultarAutorizacion: ConsultarAutorizacionVigente;
    let uc004CambiarContrasenia: CambiarContrasenia;
    let uc005RestablecerContrasenia: RestablecerContrasenia;
    let uc006InicializarSuperAdmin: InicializarSuperAdministrador;
    let uc007RegistrarIntervencion: RegistrarIntervencionSoporte;
    let uc008ConsultarCuentas: ConsultarCuentasEmpresa;
    let uc009RenovarSesion: RenovarSesion;
    let uc010CambiarEstado: CambiarEstadoCuenta;
    let uc011ConsultarIntervenciones: ConsultarIntervencionesSoporte;
    let uc012ActualizarRolesCanales: ActualizarRolesCanalesCuenta;
    let uc012VincularEmpleado: VincularEmpleado;

    const EMPRESA_ID = 'empresa-yerba-mate-1';
    const EMPRESA_ALIAS = 'yerbamatemisiones';
    const CLAVE_BOOTSTRAP = 'secret-bootstrap-12345';

    const contextoAdmin: ContextoSolicitud = {
        actorId: 'admin-1',
        empresaId: EMPRESA_ID,
        rol: RolCodigo.ADMINISTRADOR,
        permisos: [
            'ACC-UC-001',
            'ACC-UC-002',
            'ACC-UC-003',
            'ACC-UC-004',
            'ACC-UC-005',
            'ACC-UC-008',
            'ACC-UC-009',
            'ACC-UC-010',
            'ACC-UC-011',
            'ACC-UC-012',
        ],
    };

    const contextoSuperAdmin: ContextoSolicitud = {
        actorId: 'super-1',
        rol: 'SUPER_ADMINISTRADOR',
        sesionId: 'sesion-super-1',
        permisos: [
            'ACC-UC-001',
            'ACC-UC-005',
            'ACC-UC-006',
            'ACC-UC-007',
            'ACC-UC-008',
            'ACC-UC-010',
            'ACC-UC-011',
            'ACC-UC-012',
        ],
    };

    beforeAll(async () => {
        generadorTokens = await GeneradorTokensJose.crearConParGenerado();
        servicioHash = new ServicioHashArgon2();
    });

    beforeEach(() => {
        reloj = new RelojSimulado();
        repoCuentas = new RepositorioCuentasMemoria();
        repoSesiones = new RepositorioSesionesMemoria();
        repoUsuarios = new RepositorioUsuariosPlataformaMemoria();
        repoIntervenciones = new RepositorioIntervencionesSoporteMemoria();
        consultaCuentas = new ConsultaCuentasMemoria(repoCuentas);
        consultaIntervenciones = new ConsultaIntervencionesMemoria(repoIntervenciones);
        resolvedorEmpresa = new ResolvedorEmpresaMemoria();
        verificadorCupo = new VerificadorCupoMemoria();
        verificadorEmpleado = new VerificadorEmpleadoMemoria();

        // Registrar empresa activa en memoria
        resolvedorEmpresa.empresas.set(EMPRESA_ID, {
            id: EMPRESA_ID,
            alias: EMPRESA_ALIAS,
            estado: 'ACTIVA',
        });

        // Instanciar casos de uso
        uc001HabilitarCuenta = new HabilitarCuentaEmpresa(
            repoCuentas,
            resolvedorEmpresa,
            verificadorCupo,
            verificadorEmpleado,
            servicioHash,
        );
        uc002IniciarSesion = new IniciarSesion(
            repoCuentas,
            repoSesiones,
            resolvedorEmpresa,
            servicioHash,
            generadorTokens,
            reloj,
        );
        uc003ConsultarAutorizacion = new ConsultarAutorizacionVigente(repoCuentas, repoSesiones, resolvedorEmpresa, reloj);
        uc004CambiarContrasenia = new CambiarContrasenia(repoCuentas, repoSesiones, servicioHash, reloj);
        uc005RestablecerContrasenia = new RestablecerContrasenia(repoCuentas, repoSesiones, servicioHash, reloj);
        uc006InicializarSuperAdmin = new InicializarSuperAdministrador(repoUsuarios, servicioHash, reloj, CLAVE_BOOTSTRAP);
        uc007RegistrarIntervencion = new RegistrarIntervencionSoporte(repoIntervenciones, resolvedorEmpresa, reloj);
        uc008ConsultarCuentas = new ConsultarCuentasEmpresa(consultaCuentas);
        uc009RenovarSesion = new RenovarSesion(
            repoSesiones,
            repoCuentas,
            resolvedorEmpresa,
            servicioHash,
            generadorTokens,
            reloj,
        );
        uc010CambiarEstado = new CambiarEstadoCuenta(repoCuentas, repoSesiones, verificadorCupo, reloj);
        uc011ConsultarIntervenciones = new ConsultarIntervencionesSoporte(consultaIntervenciones);
        uc012ActualizarRolesCanales = new ActualizarRolesCanalesCuenta(repoCuentas);
        uc012VincularEmpleado = new VincularEmpleado(repoCuentas, verificadorEmpleado);
    });

    describe('ACC-UC-001: Habilitar Cuenta de Empresa', () => {
        it('Escenario 1 (Exitoso): Administrador habilita cuenta para un capataz con empleado válido', async () => {
            verificadorEmpleado.empleadosValidos.add(`${EMPRESA_ID}:emp-001`);

            const cuentaLectura = await uc001HabilitarCuenta.ejecutar(
                {
                    id: 'cuenta-capataz-1',
                    empresaId: EMPRESA_ID,
                    correoAcceso: 'capataz@yerbatera.com',
                    contrasenia: 'SecretPass12345!',
                    accesoWeb: true,
                    accesoMovil: true,
                    roles: [RolCodigo.CAPATAZ],
                    empleadoId: 'emp-001',
                    nombreMostrado: 'Ramón Capataz',
                },
                contextoAdmin,
            );

            expect(cuentaLectura.id).toBe('cuenta-capataz-1');
            expect(cuentaLectura.estado).toBe(EstadoCuenta.ACTIVA);
            expect(cuentaLectura.roles).toContain(RolCodigo.CAPATAZ);
            expect(cuentaLectura.empleadoId).toBe('emp-001');

            const enRepo = await repoCuentas.buscarPorId('cuenta-capataz-1', EMPRESA_ID);
            expect(enRepo).not.toBeNull();
            expect(enRepo?.credencialHash).toContain('$argon2id$');
        });

        it('Alternativo 1: Falla si el cupo de cuentas activas de la suscripción está agotado', async () => {
            verificadorCupo.cupoDisponible = false;

            await expect(
                uc001HabilitarCuenta.ejecutar(
                    {
                        id: 'cuenta-sin-cupo',
                        empresaId: EMPRESA_ID,
                        correoAcceso: 'sincupo@yerbatera.com',
                        contrasenia: 'SecretPass12345!',
                        accesoWeb: true,
                        accesoMovil: false,
                        roles: [RolCodigo.ADMINISTRADOR],
                    },
                    contextoAdmin,
                ),
            ).rejects.toThrow(LimiteAccesosAlcanzado);
        });

        it('Alternativo 2: Falla si se asigna rol CAPATAZ con un empleadoId inválido o inexistente', async () => {
            await expect(
                uc001HabilitarCuenta.ejecutar(
                    {
                        id: 'cuenta-invalida',
                        empresaId: EMPRESA_ID,
                        correoAcceso: 'invalido@yerbatera.com',
                        contrasenia: 'SecretPass12345!',
                        accesoWeb: true,
                        accesoMovil: true,
                        roles: [RolCodigo.CAPATAZ],
                        empleadoId: 'emp-fantasma',
                    },
                    contextoAdmin,
                ),
            ).rejects.toThrow(EmpleadoNoDisponible);
        });

        it('Alternativo 3: Falla si el correo de acceso ya existe en la misma empresa', async () => {
            await uc001HabilitarCuenta.ejecutar(
                {
                    id: 'cuenta-orig',
                    empresaId: EMPRESA_ID,
                    correoAcceso: 'duplicado@yerbatera.com',
                    contrasenia: 'SecretPass12345!',
                    accesoWeb: true,
                    accesoMovil: false,
                    roles: [RolCodigo.ADMINISTRADOR],
                },
                contextoAdmin,
            );

            await expect(
                uc001HabilitarCuenta.ejecutar(
                    {
                        id: 'cuenta-duplicada',
                        empresaId: EMPRESA_ID,
                        correoAcceso: 'duplicado@yerbatera.com',
                        contrasenia: 'SecretPass12345!',
                        accesoWeb: true,
                        accesoMovil: false,
                        roles: [RolCodigo.ADMINISTRADOR],
                    },
                    contextoAdmin,
                ),
            ).rejects.toThrow(CorreoDuplicado);
        });
    });

    describe('ACC-UC-002: Iniciar Sesión en Empresa', () => {
        beforeEach(async () => {
            await uc001HabilitarCuenta.ejecutar(
                {
                    id: 'cuenta-login-1',
                    empresaId: EMPRESA_ID,
                    correoAcceso: 'operador@yerbatera.com',
                    contrasenia: 'CorrectPassword123!',
                    accesoWeb: true,
                    accesoMovil: false,
                    roles: [RolCodigo.ADMINISTRADOR],
                },
                contextoAdmin,
            );
        });

        it('Escenario 1 (Exitoso): Autentica credenciales y emite tokens de acceso y renovación con sesión activa', async () => {
            const respuesta = await uc002IniciarSesion.ejecutar({
                aliasEmpresa: EMPRESA_ALIAS,
                correoAcceso: 'operador@yerbatera.com',
                contrasenia: 'CorrectPassword123!',
                canal: CanalAcceso.WEB,
            });

            expect(respuesta.tokenAcceso).toBeDefined();
            expect(respuesta.tokenRenovacion).toBeDefined();
            expect(respuesta.tipoToken).toBe('Bearer');

            const tokenVerificado = await generadorTokens.verificarTokenAcceso(respuesta.tokenAcceso);
            expect(tokenVerificado.sub).toBe('cuenta-login-1');
            expect(tokenVerificado.empresaId).toBe(EMPRESA_ID);
        });

        it('Alternativo 1: Falla si la contraseña es incorrecta (CredencialesInvalidas)', async () => {
            await expect(
                uc002IniciarSesion.ejecutar({
                    aliasEmpresa: EMPRESA_ALIAS,
                    correoAcceso: 'operador@yerbatera.com',
                    contrasenia: 'WrongPassword999!',
                    canal: CanalAcceso.WEB,
                }),
            ).rejects.toThrow(CredencialesInvalidas);
        });

        it('Alternativo 2: Falla si la empresa está inactiva', async () => {
            resolvedorEmpresa.empresas.set('empresa-suspendida', {
                id: 'empresa-suspendida',
                alias: 'suspendida',
                estado: 'SUSPENDIDA',
            });

            await expect(
                uc002IniciarSesion.ejecutar({
                    aliasEmpresa: 'suspendida',
                    correoAcceso: 'operador@yerbatera.com',
                    contrasenia: 'CorrectPassword123!',
                    canal: CanalAcceso.WEB,
                }),
            ).rejects.toThrow(CredencialesInvalidas);
        });

        it('Alternativo 3: Falla si se intenta acceder por un canal no autorizado para la cuenta', async () => {
            await expect(
                uc002IniciarSesion.ejecutar({
                    aliasEmpresa: EMPRESA_ALIAS,
                    correoAcceso: 'operador@yerbatera.com',
                    contrasenia: 'CorrectPassword123!',
                    canal: CanalAcceso.MOVIL, // Cuenta solo tiene accesoWeb: true
                }),
            ).rejects.toThrow(CanalNoPermitido);
        });
    });

    describe('ACC-UC-003: Consultar Autorización Vigente', () => {
        it('devuelve el perfil de la cuenta, roles y permisos efectivos derivados', async () => {
            await uc001HabilitarCuenta.ejecutar(
                {
                    id: 'cuenta-autorizada',
                    empresaId: EMPRESA_ID,
                    correoAcceso: 'aut@yerbatera.com',
                    contrasenia: 'Pass12345678901!',
                    accesoWeb: true,
                    accesoMovil: false,
                    roles: [RolCodigo.ADMINISTRADOR],
                },
                contextoAdmin,
            );

            const login = await uc002IniciarSesion.ejecutar({
                aliasEmpresa: EMPRESA_ALIAS,
                correoAcceso: 'aut@yerbatera.com',
                contrasenia: 'Pass12345678901!',
                canal: CanalAcceso.WEB,
            });

            const tokenDecodificado = await generadorTokens.verificarTokenAcceso(login.tokenAcceso);

            const respuesta = await uc003ConsultarAutorizacion.ejecutar({
                actorId: tokenDecodificado.sub,
                empresaId: tokenDecodificado.empresaId,
                sesionId: tokenDecodificado.sesionId,
                rol: tokenDecodificado.rol,
                permisos: ['ACC-UC-001', 'ACC-UC-010'],
            });

            expect(respuesta.actorId).toBe('cuenta-autorizada');
            expect(respuesta.empresaId).toBe(EMPRESA_ID);
            expect(respuesta.roles).toContain(RolCodigo.ADMINISTRADOR);
            expect(respuesta.canal).toBe(CanalAcceso.WEB);
        });
    });

    describe('ACC-UC-004: Cambiar Contraseña Propia', () => {
        it('actualiza la contraseña y revoca otras sesiones activas de la cuenta', async () => {
            await uc001HabilitarCuenta.ejecutar(
                {
                    id: 'cuenta-cambio',
                    empresaId: EMPRESA_ID,
                    correoAcceso: 'cambio@yerbatera.com',
                    contrasenia: 'OldPassword12345!',
                    accesoWeb: true,
                    accesoMovil: false,
                    roles: [RolCodigo.ADMINISTRADOR],
                },
                contextoAdmin,
            );

            const login1 = await uc002IniciarSesion.ejecutar({
                aliasEmpresa: EMPRESA_ALIAS,
                correoAcceso: 'cambio@yerbatera.com',
                contrasenia: 'OldPassword12345!',
                canal: CanalAcceso.WEB,
            });
            const login2 = await uc002IniciarSesion.ejecutar({
                aliasEmpresa: EMPRESA_ALIAS,
                correoAcceso: 'cambio@yerbatera.com',
                contrasenia: 'OldPassword12345!',
                canal: CanalAcceso.WEB,
            });

            const verificado1 = await generadorTokens.verificarTokenAcceso(login1.tokenAcceso);
            const verificado2 = await generadorTokens.verificarTokenAcceso(login2.tokenAcceso);

            // Cambia contraseña desde la sesión 2
            await uc004CambiarContrasenia.ejecutar(
                {
                    contraseniaActual: 'OldPassword12345!',
                    contraseniaNueva: 'NewBrandNewPass12345!',
                },
                {
                    actorId: 'cuenta-cambio',
                    empresaId: EMPRESA_ID,
                    sesionId: verificado2.sesionId,
                    rol: RolCodigo.ADMINISTRADOR,
                    permisos: ['ACC-UC-004'],
                },
            );

            // Las sesiones anteriores quedan revocadas por cambio de credencial
            const sesion1 = await repoSesiones.buscarPorId(verificado1.sesionId!);
            expect(sesion1?.revocadaEn).not.toBeNull();

            // La sesión 2 también queda invalidada forzando reingreso
            const sesion2 = await repoSesiones.buscarPorId(verificado2.sesionId!);
            expect(sesion2?.revocadaEn).not.toBeNull();
        });
    });

    describe('ACC-UC-005: Restablecer Contraseña por Administrador', () => {
        it('restablece credencial y revoca todas las sesiones activas de la cuenta', async () => {
            await uc001HabilitarCuenta.ejecutar(
                {
                    id: 'cuenta-a-restablecer',
                    empresaId: EMPRESA_ID,
                    correoAcceso: 'olvidadizo@yerbatera.com',
                    contrasenia: 'OldForgotten12345!',
                    accesoWeb: true,
                    accesoMovil: false,
                    roles: [RolCodigo.ADMINISTRADOR],
                },
                contextoAdmin,
            );

            const login = await uc002IniciarSesion.ejecutar({
                aliasEmpresa: EMPRESA_ALIAS,
                correoAcceso: 'olvidadizo@yerbatera.com',
                contrasenia: 'OldForgotten12345!',
                canal: CanalAcceso.WEB,
            });
            const verificado = await generadorTokens.verificarTokenAcceso(login.tokenAcceso);

            await uc005RestablecerContrasenia.ejecutar(
                {
                    cuentaId: 'cuenta-a-restablecer',
                    empresaId: EMPRESA_ID,
                    contraseniaNueva: 'ResetPassword99999!',
                },
                contextoAdmin,
            );

            const sesion = await repoSesiones.buscarPorId(verificado.sesionId!);
            expect(sesion?.revocadaEn).not.toBeNull();

            // Puede loguearse con la nueva contraseña
            const nuevoLogin = await uc002IniciarSesion.ejecutar({
                aliasEmpresa: EMPRESA_ALIAS,
                correoAcceso: 'olvidadizo@yerbatera.com',
                contrasenia: 'ResetPassword99999!',
                canal: CanalAcceso.WEB,
            });
            expect(nuevoLogin.tokenAcceso).toBeDefined();
        });
    });

    describe('ACC-UC-006: Inicializar SuperAdministrador (Bootstrap)', () => {
        it('crea el primer SuperAdministrador si la clave secreta coincide y no existe otro activo', async () => {
            const respuesta = await uc006InicializarSuperAdmin.ejecutar({
                correoSuperAdmin: 'superadmin@tarefero.internal',
                contraseniaSuperAdmin: 'SuperAdminMasterPass123!',
                claveSecretaBootstrapping: CLAVE_BOOTSTRAP,
            });

            expect(respuesta.mensaje).toBe('Plataforma inicializada exitosamente.');
            expect(await repoUsuarios.contarActivos()).toBe(1);
        });

        it('falla si ya existe un SuperAdministrador activo (InicializacionNoPermitida)', async () => {
            await uc006InicializarSuperAdmin.ejecutar({
                correoSuperAdmin: 'superadmin@tarefero.internal',
                contraseniaSuperAdmin: 'SuperAdminMasterPass123!',
                claveSecretaBootstrapping: CLAVE_BOOTSTRAP,
            });

            await expect(
                uc006InicializarSuperAdmin.ejecutar({
                    correoSuperAdmin: 'otro-super@tarefero.internal',
                    contraseniaSuperAdmin: 'SuperAdminMasterPass456!',
                    claveSecretaBootstrapping: CLAVE_BOOTSTRAP,
                }),
            ).rejects.toThrow(InicializacionNoPermitida);
        });

        it('falla si la clave secreta de bootstrap es incorrecta', async () => {
            await expect(
                uc006InicializarSuperAdmin.ejecutar({
                    correoSuperAdmin: 'superadmin@tarefero.internal',
                    contraseniaSuperAdmin: 'SuperAdminMasterPass123!',
                    claveSecretaBootstrapping: 'clave-incorrecta',
                }),
            ).rejects.toThrow(AccesoDenegado);
        });
    });

    describe('ACC-UC-007 y ACC-UC-011: Intervención de Soporte y Consulta', () => {
        it('registra una intervención técnica trazable y permite consultarla', async () => {
            const intervencion = await uc007RegistrarIntervencion.ejecutar(
                {
                    empresaId: EMPRESA_ID,
                    motivo: 'Asistencia técnica autorizada por ticket de soporte #45091.',
                    solicitudId: 'solicitud-123',
                },
                contextoSuperAdmin,
            );

            expect(intervencion.id).toBeDefined();
            expect(intervencion.empresaId).toBe(EMPRESA_ID);
            expect(intervencion.motivo).toContain('Asistencia técnica');

            // Consultar por UC-011
            const listado = await uc011ConsultarIntervenciones.ejecutar(
                EMPRESA_ID,
                { limite: 10, desplazamiento: 0 },
                contextoSuperAdmin,
            );
            expect(listado.paginacion.total).toBe(1);
            expect(listado.datos[0].id).toBe(intervencion.id);
        });

        it('falla si el motivo de soporte está vacío (MotivoSoporteInvalido)', async () => {
            await expect(
                uc007RegistrarIntervencion.ejecutar(
                    {
                        empresaId: EMPRESA_ID,
                        motivo: '',
                        solicitudId: 'solicitud-123',
                    },
                    contextoSuperAdmin,
                ),
            ).rejects.toThrow(MotivoSoporteInvalido);
        });
    });

    describe('ACC-UC-008: Consultar Cuentas de Empresa', () => {
        it('permite filtrar y listar cuentas de la empresa autorizada', async () => {
            await uc001HabilitarCuenta.ejecutar(
                {
                    id: 'cuenta-list-1',
                    empresaId: EMPRESA_ID,
                    correoAcceso: 'admin1@yerbatera.com',
                    contrasenia: 'Pass12345678901!',
                    accesoWeb: true,
                    accesoMovil: false,
                    roles: [RolCodigo.ADMINISTRADOR],
                },
                contextoAdmin,
            );

            const resultado = await uc008ConsultarCuentas.ejecutar(
                EMPRESA_ID,
                { limite: 10, desplazamiento: 0, rol: RolCodigo.ADMINISTRADOR },
                contextoAdmin,
            );

            expect(resultado.paginacion.total).toBe(1);
            expect(resultado.datos[0].correoAcceso).toBe('admin1@yerbatera.com');
        });
    });

    describe('ACC-UC-009: Renovar Sesión con Rotación y Detección de Reuso', () => {
        it('rota el token de renovación correctamente en una sesión válida', async () => {
            await uc001HabilitarCuenta.ejecutar(
                {
                    id: 'cuenta-renovacion',
                    empresaId: EMPRESA_ID,
                    correoAcceso: 'rotacion@yerbatera.com',
                    contrasenia: 'PassRotacion12345!',
                    accesoWeb: true,
                    accesoMovil: false,
                    roles: [RolCodigo.ADMINISTRADOR],
                },
                contextoAdmin,
            );

            const login = await uc002IniciarSesion.ejecutar({
                aliasEmpresa: EMPRESA_ALIAS,
                correoAcceso: 'rotacion@yerbatera.com',
                contrasenia: 'PassRotacion12345!',
                canal: CanalAcceso.WEB,
            });

            // Renueva usando el refresh token inicial
            const renovacion = await uc009RenovarSesion.ejecutar({
                tokenRenovacion: login.tokenRenovacion,
            });

            expect(renovacion.tokenAcceso).toBeDefined();
            expect(renovacion.tokenRenovacion).not.toBe(login.tokenRenovacion);
        });

        it('detecta reuso de un token de renovación expirado o consumido y revoca la familia completa', async () => {
            await uc001HabilitarCuenta.ejecutar(
                {
                    id: 'cuenta-reuso',
                    empresaId: EMPRESA_ID,
                    correoAcceso: 'reuso@yerbatera.com',
                    contrasenia: 'PassRotacion12345!',
                    accesoWeb: true,
                    accesoMovil: false,
                    roles: [RolCodigo.ADMINISTRADOR],
                },
                contextoAdmin,
            );

            const login = await uc002IniciarSesion.ejecutar({
                aliasEmpresa: EMPRESA_ALIAS,
                correoAcceso: 'reuso@yerbatera.com',
                contrasenia: 'PassRotacion12345!',
                canal: CanalAcceso.WEB,
            });

            // Avanzamos el reloj más allá de la vigencia de la sesión (31 días)
            reloj.avanzarHoras(31 * 24);

            // Al intentar renovar con sesión expirada, se revoca toda la familia
            await expect(
                uc009RenovarSesion.ejecutar({
                    tokenRenovacion: login.tokenRenovacion,
                }),
            ).rejects.toThrow(CredencialesInvalidas);

            // La sesión ahora está marcada como revocada
            const sesion = await repoSesiones.buscarPorId(login.sesionId);
            expect(sesion?.revocadaEn).not.toBeNull();
        });
    });

    describe('ACC-UC-010: Cambiar Estado de Cuenta', () => {
        it('suspender una cuenta revoca inmediatamente todas sus sesiones activas (ACC-BR-009)', async () => {
            await uc001HabilitarCuenta.ejecutar(
                {
                    id: 'cuenta-suspender',
                    empresaId: EMPRESA_ID,
                    correoAcceso: 'suspender@yerbatera.com',
                    contrasenia: 'Pass12345678901!',
                    accesoWeb: true,
                    accesoMovil: false,
                    roles: [RolCodigo.ADMINISTRADOR],
                },
                contextoAdmin,
            );

            const login = await uc002IniciarSesion.ejecutar({
                aliasEmpresa: EMPRESA_ALIAS,
                correoAcceso: 'suspender@yerbatera.com',
                contrasenia: 'Pass12345678901!',
                canal: CanalAcceso.WEB,
            });
            const verificado = await generadorTokens.verificarTokenAcceso(login.tokenAcceso);

            // Suspende cuenta
            await uc010CambiarEstado.ejecutar(
                {
                    cuentaId: 'cuenta-suspender',
                    empresaId: EMPRESA_ID,
                    nuevoEstado: EstadoCuenta.SUSPENDIDA,
                    versionEsperada: 1,
                },
                contextoAdmin,
            );

            const sesion = await repoSesiones.buscarPorId(verificado.sesionId!);
            expect(sesion?.revocadaEn).not.toBeNull();

            // Intento de login posterior es rechazado
            await expect(
                uc002IniciarSesion.ejecutar({
                    aliasEmpresa: EMPRESA_ALIAS,
                    correoAcceso: 'suspender@yerbatera.com',
                    contrasenia: 'Pass12345678901!',
                    canal: CanalAcceso.WEB,
                }),
            ).rejects.toThrow(CuentaSuspendida);
        });
    });

    describe('ACC-UC-012: Actualizar Roles, Canales y Vinculación de Empleado', () => {
        it('permite cambiar canales y roles respetando la invariante de empleadoId para CAPATAZ', async () => {
            verificadorEmpleado.empleadosValidos.add(`${EMPRESA_ID}:emp-002`);

            await uc001HabilitarCuenta.ejecutar(
                {
                    id: 'cuenta-uc12',
                    empresaId: EMPRESA_ID,
                    correoAcceso: 'operario@yerbatera.com',
                    contrasenia: 'Pass12345678901!',
                    accesoWeb: true,
                    accesoMovil: false,
                    roles: [RolCodigo.ADMINISTRADOR],
                },
                contextoAdmin,
            );

            // Primero vinculamos empleado
            await uc012VincularEmpleado.ejecutar(
                {
                    cuentaId: 'cuenta-uc12',
                    empresaId: EMPRESA_ID,
                    empleadoId: 'emp-002',
                },
                contextoAdmin,
            );

            // Ahora podemos asignarle rol CAPATAZ y canal MOVIL
            const actualizada = await uc012ActualizarRolesCanales.ejecutar(
                {
                    cuentaId: 'cuenta-uc12',
                    empresaId: EMPRESA_ID,
                    accesoWeb: false,
                    accesoMovil: true,
                    roles: [RolCodigo.CAPATAZ],
                    versionEsperada: 2,
                },
                contextoAdmin,
            );

            expect(actualizada.roles).toContain(RolCodigo.CAPATAZ);
            expect(actualizada.accesoMovil).toBe(true);
            expect(actualizada.accesoWeb).toBe(false);
        });

        it('rechaza asignar rol CAPATAZ si la cuenta no tiene un empleadoId asociado (ACC-BR-015/021)', async () => {
            await uc001HabilitarCuenta.ejecutar(
                {
                    id: 'cuenta-sin-emp',
                    empresaId: EMPRESA_ID,
                    correoAcceso: 'sinemp@yerbatera.com',
                    contrasenia: 'Pass12345678901!',
                    accesoWeb: true,
                    accesoMovil: false,
                    roles: [RolCodigo.ADMINISTRADOR],
                },
                contextoAdmin,
            );

            await expect(
                uc012ActualizarRolesCanales.ejecutar(
                    {
                        cuentaId: 'cuenta-sin-emp',
                        empresaId: EMPRESA_ID,
                        accesoWeb: true,
                        accesoMovil: false,
                        roles: [RolCodigo.CAPATAZ],
                        versionEsperada: 1,
                    },
                    contextoAdmin,
                ),
            ).rejects.toThrow(VinculoEmpleadoInvalido);
        });
    });
});
