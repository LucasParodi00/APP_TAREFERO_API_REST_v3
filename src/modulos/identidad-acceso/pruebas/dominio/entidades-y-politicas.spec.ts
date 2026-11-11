import { CuentaEmpresa } from '../../dominio/entidades/cuenta-empresa.entidad';
import { SesionEmpresa } from '../../dominio/entidades/sesion-empresa.entidad';
import { UsuarioPlataforma } from '../../dominio/entidades/usuario-plataforma.entidad';
import { IntervencionSoporte } from '../../dominio/entidades/intervencion-soporte.entidad';
import { RolCodigo } from '../../dominio/enumeraciones/rol-codigo.enum';
import { EstadoCuenta } from '../../dominio/enumeraciones/estado-cuenta.enum';
import { CanalAcceso } from '../../dominio/enumeraciones/canal-acceso.enum';
import { EstadoSesion } from '../../dominio/enumeraciones/estado-sesion.enum';
import { CorreoAcceso } from '../../dominio/objetos-valor/correo-acceso.vo';
import { MotivoSoporte } from '../../dominio/objetos-valor/motivo-soporte.vo';
import { NombreMostrado } from '../../dominio/objetos-valor/nombre-mostrado.vo';
import {
    RolNoAdmitido,
    TransicionNoPermitida,
    VinculoEmpleadoInvalido,
    VinculacionEmpleadoInvalida,
} from '../../dominio/errores/errores-identidad-acceso';

describe('T03 — Entidades, Agregados y Políticas de Dominio (ACC)', () => {
    const EMPRESA_ID = '019a0000-0000-7000-8000-000000000001';
    const CUENTA_ID = '019a0000-0000-7000-8000-000000000002';
    const EMPLEADO_ID = '019a0000-0000-7000-8000-000000000003';
    const SESION_ID = '019a0000-0000-7000-8000-000000000004';
    const USUARIO_PLAT_ID = '019a0000-0000-7000-8000-000000000005';
    const INTERVENCION_ID = '019a0000-0000-7000-8000-000000000006';

    describe('ACC-ENT-001 — CuentaEmpresa', () => {
        it('crea una cuenta activa con rol ADMINISTRADOR sin empleadoId (ACC-BR-021)', () => {
            const cuenta = CuentaEmpresa.crear({
                id: CUENTA_ID,
                empresaId: EMPRESA_ID,
                correoAcceso: CorreoAcceso.crear('admin@empresa.com'),
                credencialHash: 'argon2id$v=19$hash_valido',
                accesoWeb: true,
                accesoMovil: false,
                roles: [RolCodigo.ADMINISTRADOR],
                nombreMostrado: NombreMostrado.crear('Administrador Principal'),
            });

            expect(cuenta.id).toBe(CUENTA_ID);
            expect(cuenta.empresaId).toBe(EMPRESA_ID);
            expect(cuenta.empleadoId).toBeUndefined();
            expect(cuenta.estado).toBe(EstadoCuenta.ACTIVA);
            expect(cuenta.estaActiva()).toBe(true);
            expect(cuenta.version).toBe(1);
            expect(cuenta.tieneCanal(CanalAcceso.WEB)).toBe(true);
            expect(cuenta.tieneCanal(CanalAcceso.MOVIL)).toBe(false);
            expect(cuenta.tieneRol(RolCodigo.ADMINISTRADOR)).toBe(true);
        });

        it('crea una cuenta activa con rol CAPATAZ exigiendo empleadoId (ACC-BR-021)', () => {
            const cuenta = CuentaEmpresa.crear({
                id: CUENTA_ID,
                empresaId: EMPRESA_ID,
                empleadoId: EMPLEADO_ID,
                correoAcceso: CorreoAcceso.crear('capataz@empresa.com'),
                credencialHash: 'argon2id$v=19$hash_valido',
                accesoWeb: false,
                accesoMovil: true,
                roles: [RolCodigo.CAPATAZ],
            });

            expect(cuenta.empleadoId).toBe(EMPLEADO_ID);
            expect(cuenta.tieneRol(RolCodigo.CAPATAZ)).toBe(true);
            expect(cuenta.tieneCanal(CanalAcceso.MOVIL)).toBe(true);
        });

        it('rechaza crear rol CAPATAZ o EMPLEADO sin empleadoId con ACC_VINCULO_EMPLEADO_INVALIDO', () => {
            expect(() =>
                CuentaEmpresa.crear({
                    id: CUENTA_ID,
                    empresaId: EMPRESA_ID,
                    correoAcceso: CorreoAcceso.crear('capataz@empresa.com'),
                    credencialHash: 'argon2id$v=19$hash_valido',
                    accesoWeb: true,
                    accesoMovil: true,
                    roles: [RolCodigo.CAPATAZ],
                }),
            ).toThrow(VinculoEmpleadoInvalido);

            expect(() =>
                CuentaEmpresa.crear({
                    id: CUENTA_ID,
                    empresaId: EMPRESA_ID,
                    correoAcceso: CorreoAcceso.crear('empleado@empresa.com'),
                    credencialHash: 'argon2id$v=19$hash_valido',
                    accesoWeb: false,
                    accesoMovil: true,
                    roles: [RolCodigo.EMPLEADO],
                }),
            ).toThrow(VinculoEmpleadoInvalido);
        });

        it('rechaza asignar rol SUPER_ADMINISTRADOR a una CuentaEmpresa (ACC-BR-007)', () => {
            expect(() =>
                CuentaEmpresa.crear({
                    id: CUENTA_ID,
                    empresaId: EMPRESA_ID,
                    correoAcceso: CorreoAcceso.crear('super@empresa.com'),
                    credencialHash: 'argon2id$v=19$hash_valido',
                    accesoWeb: true,
                    accesoMovil: false,
                    roles: [RolCodigo.SUPER_ADMINISTRADOR],
                }),
            ).toThrow(RolNoAdmitido);
        });

        it('aplica ciclo de vida: suspender y reactivar (ACC-BR-016)', () => {
            const cuenta = CuentaEmpresa.crear({
                id: CUENTA_ID,
                empresaId: EMPRESA_ID,
                correoAcceso: CorreoAcceso.crear('admin@empresa.com'),
                credencialHash: 'argon2id$v=19$hash_valido',
                accesoWeb: true,
                accesoMovil: false,
                roles: [RolCodigo.ADMINISTRADOR],
            });

            expect(cuenta.estado).toBe(EstadoCuenta.ACTIVA);
            cuenta.suspender();
            expect(cuenta.estado).toBe(EstadoCuenta.SUSPENDIDA);
            expect(cuenta.estaActiva()).toBe(false);
            expect(cuenta.version).toBe(2);

            expect(() => cuenta.suspender()).toThrow(TransicionNoPermitida);

            cuenta.reactivar();
            expect(cuenta.estado).toBe(EstadoCuenta.ACTIVA);
            expect(cuenta.estaActiva()).toBe(true);
            expect(cuenta.version).toBe(3);

            expect(() => cuenta.reactivar()).toThrow(TransicionNoPermitida);
        });

        it('actualiza credencial e incrementa versión', () => {
            const cuenta = CuentaEmpresa.crear({
                id: CUENTA_ID,
                empresaId: EMPRESA_ID,
                correoAcceso: CorreoAcceso.crear('admin@empresa.com'),
                credencialHash: 'argon2id$v=19$hash_original',
                accesoWeb: true,
                accesoMovil: false,
                roles: [RolCodigo.ADMINISTRADOR],
            });

            cuenta.actualizarCredencial('argon2id$v=19$hash_nuevo');
            expect(cuenta.credencialHash).toBe('argon2id$v=19$hash_nuevo');
            expect(cuenta.version).toBe(2);
        });

        it('actualiza canales y roles validando reglas (ACC-BR-007, ACC-BR-021)', () => {
            const cuenta = CuentaEmpresa.crear({
                id: CUENTA_ID,
                empresaId: EMPRESA_ID,
                correoAcceso: CorreoAcceso.crear('admin@empresa.com'),
                credencialHash: 'argon2id$v=19$hash',
                accesoWeb: true,
                accesoMovil: false,
                roles: [RolCodigo.ADMINISTRADOR],
            });

            cuenta.actualizarCanalesYRoles(true, true, [RolCodigo.ADMINISTRADOR]);
            expect(cuenta.tieneCanal(CanalAcceso.MOVIL)).toBe(true);
            expect(cuenta.version).toBe(2);

            expect(() => cuenta.actualizarCanalesYRoles(true, true, [RolCodigo.SUPER_ADMINISTRADOR])).toThrow(RolNoAdmitido);
            expect(() => cuenta.actualizarCanalesYRoles(true, true, [RolCodigo.CAPATAZ])).toThrow(VinculoEmpleadoInvalido);
        });

        it('vincula empleado respetando ACC-BR-021 y ACC-BR-022', () => {
            const cuenta = CuentaEmpresa.crear({
                id: CUENTA_ID,
                empresaId: EMPRESA_ID,
                correoAcceso: CorreoAcceso.crear('admin@empresa.com'),
                credencialHash: 'argon2id$v=19$hash',
                accesoWeb: true,
                accesoMovil: false,
                roles: [RolCodigo.ADMINISTRADOR],
            });

            cuenta.vincularEmpleado(EMPLEADO_ID, EMPRESA_ID);
            expect(cuenta.empleadoId).toBe(EMPLEADO_ID);
            expect(cuenta.version).toBe(2);

            cuenta.vincularEmpleado(EMPLEADO_ID, EMPRESA_ID);
            expect(cuenta.version).toBe(2);

            const otraEmpresaId = '019a0000-0000-7000-8000-000000000099';
            expect(() => cuenta.vincularEmpleado('otro-empleado', otraEmpresaId)).toThrow(VinculacionEmpleadoInvalida);

            expect(() => cuenta.vincularEmpleado('otro-empleado', EMPRESA_ID)).toThrow(VinculacionEmpleadoInvalida);
        });
    });

    describe('ACC-ENT-003 — SesionEmpresa', () => {
        const ahora = new Date('2026-11-11T12:00:00.000Z');
        const venceEn = new Date('2026-12-11T12:00:00.000Z');

        it('crea una sesión activa vigente', () => {
            const sesion = SesionEmpresa.crear({
                id: SESION_ID,
                cuentaEmpresaId: CUENTA_ID,
                empresaId: EMPRESA_ID,
                canal: CanalAcceso.WEB,
                creadaEn: ahora,
                venceEn: venceEn,
                hashTokenRenovacion: 'hash_sha256_refresh_inicial',
                familiaId: 'familia-001',
            });

            expect(sesion.id).toBe(SESION_ID);
            expect(sesion.estado).toBe(EstadoSesion.ACTIVA);
            expect(sesion.estaVigente(ahora)).toBe(true);
            expect(sesion.estaVigente(new Date('2026-12-12T00:00:00.000Z'))).toBe(false);
        });

        it('revoca la sesión', () => {
            const sesion = SesionEmpresa.crear({
                id: SESION_ID,
                cuentaEmpresaId: CUENTA_ID,
                empresaId: EMPRESA_ID,
                canal: CanalAcceso.WEB,
                creadaEn: ahora,
                venceEn: venceEn,
                hashTokenRenovacion: 'hash',
                familiaId: 'familia-001',
            });

            const fechaRevocacion = new Date('2026-11-11T13:00:00.000Z');
            sesion.revocar(fechaRevocacion);
            expect(sesion.estado).toBe(EstadoSesion.REVOCADA);
            expect(sesion.revocadaEn).toEqual(fechaRevocacion);
            expect(sesion.estaVigente(ahora)).toBe(false);
        });

        it('rota el token de renovación', () => {
            const sesion = SesionEmpresa.crear({
                id: SESION_ID,
                cuentaEmpresaId: CUENTA_ID,
                empresaId: EMPRESA_ID,
                canal: CanalAcceso.WEB,
                creadaEn: ahora,
                venceEn: venceEn,
                hashTokenRenovacion: 'hash_v1',
                familiaId: 'familia-001',
            });

            const nuevoVenceEn = new Date('2026-12-20T12:00:00.000Z');
            sesion.rotarTokenRenovacion('hash_v2', nuevoVenceEn);
            expect(sesion.hashTokenRenovacion).toBe('hash_v2');
            expect(sesion.venceEn).toEqual(nuevoVenceEn);
            expect(sesion.contadorRotacion).toBe(1);
        });
    });

    describe('ACC-ENT-004 — UsuarioPlataforma', () => {
        it('crea un superadministrador activo', () => {
            const usuario = UsuarioPlataforma.crear({
                id: USUARIO_PLAT_ID,
                correo: CorreoAcceso.crear('super@tarefero.com'),
                credencialHash: 'argon2id$v=19$hash_super',
                creadoEn: new Date(),
            });

            expect(usuario.id).toBe(USUARIO_PLAT_ID);
            expect(usuario.rol).toBe(RolCodigo.SUPER_ADMINISTRADOR);
            expect(usuario.estaActivo()).toBe(true);
        });

        it('permite desactivar al superadministrador', () => {
            const usuario = UsuarioPlataforma.crear({
                id: USUARIO_PLAT_ID,
                correo: CorreoAcceso.crear('super@tarefero.com'),
                credencialHash: 'argon2id$v=19$hash_super',
                creadoEn: new Date(),
            });

            usuario.desactivar();
            expect(usuario.estaActivo()).toBe(false);
        });
    });

    describe('ACC-ENT-005 — IntervencionSoporte', () => {
        const ocurridaEn = new Date('2026-11-11T12:00:00.000Z');
        const venceEn = new Date('2026-11-11T12:15:00.000Z');

        it('crea una intervención vigente con motivo auditable (ACC-BR-011, ACC-BR-020)', () => {
            const intervencion = IntervencionSoporte.crear({
                id: INTERVENCION_ID,
                usuarioPlataformaId: USUARIO_PLAT_ID,
                empresaId: EMPRESA_ID,
                motivo: MotivoSoporte.crear('Asistencia técnica urgente'),
                sesionId: SESION_ID,
                solicitudId: '019a0000-0000-7000-8000-000000000007',
                ocurridaEn: ocurridaEn,
                venceEn: venceEn,
            });

            expect(intervencion.id).toBe(INTERVENCION_ID);
            expect(intervencion.aplicaAEmpresa(EMPRESA_ID)).toBe(true);
            expect(intervencion.aplicaAEmpresa('otra-empresa')).toBe(false);
            expect(intervencion.estaVigente(new Date('2026-11-11T12:10:00.000Z'))).toBe(true);
            expect(intervencion.estaVigente(new Date('2026-11-11T12:16:00.000Z'))).toBe(false);
        });
    });
});
