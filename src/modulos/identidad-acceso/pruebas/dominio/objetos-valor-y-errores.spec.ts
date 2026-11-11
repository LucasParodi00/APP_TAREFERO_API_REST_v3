import { EstadoCuenta } from '../../dominio/enumeraciones/estado-cuenta.enum';
import { RolCodigo } from '../../dominio/enumeraciones/rol-codigo.enum';
import { CanalAcceso } from '../../dominio/enumeraciones/canal-acceso.enum';
import { EstadoSesion } from '../../dominio/enumeraciones/estado-sesion.enum';
import { CorreoAcceso } from '../../dominio/objetos-valor/correo-acceso.vo';
import { ContraseniaPlana } from '../../dominio/objetos-valor/contrasenia-plana.vo';
import { MotivoSoporte } from '../../dominio/objetos-valor/motivo-soporte.vo';
import { NombreMostrado } from '../../dominio/objetos-valor/nombre-mostrado.vo';
import {
    ErrorDominioIdentidadAcceso,
    CorreoInvalido,
    ContraseniaInvalida,
    MotivoSoporteInvalido,
    VinculoEmpleadoInvalido,
    VinculacionEmpleadoInvalida,
    CorreoDuplicado,
    TransicionNoPermitida,
    EliminacionNoPermitida,
    RolNoAdmitido,
    CanalNoPermitido,
    CredencialesInvalidas,
    CuentaSuspendida,
    EmpresaFueraDeAlcance,
    CuentaEmpleadoDuplicada,
    LimiteAccesosAlcanzado,
    UltimoSuperAdministrador,
    InicializacionNoPermitida,
    IntervencionSoporteExpirada,
} from '../../dominio/errores/errores-identidad-acceso';

describe('T02 — Enumeraciones, Objetos de Valor y Errores de Dominio (ACC)', () => {
    describe('Enumeraciones', () => {
        it('debe exponer los valores de EstadoCuenta aprobados', () => {
            expect(EstadoCuenta.ACTIVA).toBe('ACTIVA');
            expect(EstadoCuenta.SUSPENDIDA).toBe('SUSPENDIDA');
        });

        it('debe exponer los valores de RolCodigo aprobados', () => {
            expect(RolCodigo.SUPER_ADMINISTRADOR).toBe('SUPER_ADMINISTRADOR');
            expect(RolCodigo.ADMINISTRADOR).toBe('ADMINISTRADOR');
            expect(RolCodigo.CAPATAZ).toBe('CAPATAZ');
            expect(RolCodigo.EMPLEADO).toBe('EMPLEADO');
        });

        it('debe exponer los valores de CanalAcceso aprobados', () => {
            expect(CanalAcceso.WEB).toBe('WEB');
            expect(CanalAcceso.MOVIL).toBe('MOVIL');
        });

        it('debe exponer los valores de EstadoSesion aprobados', () => {
            expect(EstadoSesion.ACTIVA).toBe('ACTIVA');
            expect(EstadoSesion.REVOCADA).toBe('REVOCADA');
            expect(EstadoSesion.EXPIRADA).toBe('EXPIRADA');
        });
    });

    describe('ACC-BR-018 — CorreoAcceso', () => {
        it('normaliza a minúsculas y elimina espacios exteriores', () => {
            const correo = CorreoAcceso.crear('  Usuario@Empresa.com  ');
            expect(correo.valor).toBe('usuario@empresa.com');
        });

        it('admite un correo válido de hasta 254 caracteres', () => {
            const local = 'a'.repeat(64);
            const label1 = 'b'.repeat(50);
            const label2 = 'c'.repeat(50);
            const label3 = 'd'.repeat(50);
            const label4 = 'e'.repeat(30) + '.com';
            const emailLargo = `${local}@${label1}.${label2}.${label3}.${label4}`;
            expect(emailLargo.length).toBeLessThanOrEqual(254);
            const correo = CorreoAcceso.crear(emailLargo);
            expect(correo.valor).toBe(emailLargo.toLowerCase());
        });

        it('rechaza un correo de más de 254 caracteres con ACC_CORREO_INVALIDO', () => {
            const local = 'a'.repeat(64);
            const dominio = 'b'.repeat(186) + '.com';
            const email255 = `${local}@${dominio}`;
            expect(email255.length).toBeGreaterThan(254);
            expect(() => CorreoAcceso.crear(email255)).toThrow(CorreoInvalido);
            try {
                CorreoAcceso.crear(email255);
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(ErrorDominioIdentidadAcceso);
                expect((e as ErrorDominioIdentidadAcceso).codigo).toBe('ACC_CORREO_INVALIDO');
            }
        });

        it('rechaza correos vacíos o con formato inválido', () => {
            expect(() => CorreoAcceso.crear('')).toThrow(CorreoInvalido);
            expect(() => CorreoAcceso.crear('   ')).toThrow(CorreoInvalido);
            expect(() => CorreoAcceso.crear('sin-arroba.com')).toThrow(CorreoInvalido);
            expect(() => CorreoAcceso.crear('@sin-local.com')).toThrow(CorreoInvalido);
            expect(() => CorreoAcceso.crear('usuario@')).toThrow(CorreoInvalido);
        });

        it('compara igualdad por valor normalizado', () => {
            const c1 = CorreoAcceso.crear('Usuario@Empresa.com');
            const c2 = CorreoAcceso.crear('usuario@empresa.com');
            expect(c1.equals(c2)).toBe(true);
        });
    });

    describe('ACC-BR-019 — ContraseniaPlana', () => {
        it('admite contraseña de 15 caracteres exactamente como fue ingresada', () => {
            const pass15 = '123456789012345';
            const pass = ContraseniaPlana.crear(pass15);
            expect(pass.valor).toBe(pass15);
        });

        it('admite contraseña de 128 caracteres, conservando espacios significativos', () => {
            const pass128 = ' ' + 'a'.repeat(126) + ' ';
            expect(pass128.length).toBe(128);
            const pass = ContraseniaPlana.crear(pass128);
            expect(pass.valor).toBe(pass128);
        });

        it('rechaza contraseñas de menos de 15 caracteres con ACC_CONTRASENIA_INVALIDA', () => {
            expect(() => ContraseniaPlana.crear('12345678901234')).toThrow(ContraseniaInvalida);
            try {
                ContraseniaPlana.crear('corta');
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(ErrorDominioIdentidadAcceso);
                expect((e as ErrorDominioIdentidadAcceso).codigo).toBe('ACC_CONTRASENIA_INVALIDA');
            }
        });

        it('rechaza contraseñas de más de 128 caracteres con ACC_CONTRASENIA_INVALIDA', () => {
            const pass129 = 'a'.repeat(129);
            expect(() => ContraseniaPlana.crear(pass129)).toThrow(ContraseniaInvalida);
            try {
                ContraseniaPlana.crear(pass129);
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(ErrorDominioIdentidadAcceso);
                expect((e as ErrorDominioIdentidadAcceso).codigo).toBe('ACC_CONTRASENIA_INVALIDA');
            }
        });
    });

    describe('ACC-BR-020 — MotivoSoporte', () => {
        it('elimina espacios exteriores y conserva contenido', () => {
            const motivo = MotivoSoporte.crear('  Recuperar acceso del Administrador  ');
            expect(motivo.valor).toBe('Recuperar acceso del Administrador');
        });

        it('admite motivo de 1000 caracteres', () => {
            const texto1000 = 'x'.repeat(1000);
            const motivo = MotivoSoporte.crear(texto1000);
            expect(motivo.valor).toBe(texto1000);
        });

        it('rechaza motivo vacío tras normalizar con ACC_MOTIVO_SOPORTE_INVALIDO', () => {
            expect(() => MotivoSoporte.crear('')).toThrow(MotivoSoporteInvalido);
            expect(() => MotivoSoporte.crear('   ')).toThrow(MotivoSoporteInvalido);
            try {
                MotivoSoporte.crear('   ');
            } catch (e: unknown) {
                expect(e).toBeInstanceOf(ErrorDominioIdentidadAcceso);
                expect((e as ErrorDominioIdentidadAcceso).codigo).toBe('ACC_MOTIVO_SOPORTE_INVALIDO');
            }
        });

        it('rechaza motivo de más de 1000 caracteres con ACC_MOTIVO_SOPORTE_INVALIDO', () => {
            const texto1001 = 'x'.repeat(1001);
            expect(() => MotivoSoporte.crear(texto1001)).toThrow(MotivoSoporteInvalido);
        });
    });

    describe('NombreMostrado (opcional, máx 150 caracteres)', () => {
        it('elimina espacios exteriores', () => {
            const nombre = NombreMostrado.crear('  Juan Perez  ');
            expect(nombre?.valor).toBe('Juan Perez');
        });

        it('devuelve undefined si se pasa vacío o nulo', () => {
            expect(NombreMostrado.crear(undefined)).toBeUndefined();
            expect(NombreMostrado.crear('')).toBeUndefined();
            expect(NombreMostrado.crear('   ')).toBeUndefined();
        });

        it('rechaza nombre de más de 150 caracteres', () => {
            expect(() => NombreMostrado.crear('a'.repeat(151))).toThrow();
        });
    });

    describe('Errores de dominio tipados', () => {
        it('todos los errores tienen código estable de ACC y mensaje en español', () => {
            const errores = [
                new CorreoInvalido(),
                new ContraseniaInvalida(),
                new MotivoSoporteInvalido(),
                new VinculoEmpleadoInvalido(),
                new VinculacionEmpleadoInvalida(),
                new CorreoDuplicado('test@test.com'),
                new TransicionNoPermitida('ACTIVA', 'ELIMINADA'),
                new EliminacionNoPermitida(),
                new RolNoAdmitido(),
                new CanalNoPermitido(),
                new CredencialesInvalidas(),
                new CuentaSuspendida(),
                new EmpresaFueraDeAlcance(),
                new CuentaEmpleadoDuplicada('emp1'),
                new LimiteAccesosAlcanzado(),
                new UltimoSuperAdministrador(),
                new InicializacionNoPermitida(),
                new IntervencionSoporteExpirada(),
            ];

            for (const error of errores) {
                expect(error.codigo.startsWith('ACC_')).toBe(true);
                expect(typeof error.message).toBe('string');
                expect(error.message.length).toBeGreaterThan(0);
                expect(error).toBeInstanceOf(Error);
            }
        });
    });
});
