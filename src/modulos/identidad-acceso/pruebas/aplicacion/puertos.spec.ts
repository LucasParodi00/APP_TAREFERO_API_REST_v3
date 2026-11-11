import { RESOLVEDOR_EMPRESA, ResolvedorEmpresa, EmpresaAcceso } from '../../aplicacion/puertos/resolvedor-empresa.puerto';
import { VERIFICADOR_CUPO_ACCESO, VerificadorCupoAcceso } from '../../aplicacion/puertos/verificador-cupo-acceso.puerto';
import { VERIFICADOR_EMPLEADO, VerificadorEmpleado } from '../../aplicacion/puertos/verificador-empleado.puerto';
import { SERVICIO_HASH, ServicioHash } from '../../aplicacion/puertos/servicio-hash.puerto';
import {
    GENERADOR_TOKENS,
    GeneradorTokens,
    PayloadTokenTenant,
    PayloadTokenPlataforma,
    PayloadTokenVerificado,
} from '../../aplicacion/puertos/generador-tokens.puerto';
import { RELOJ, Reloj } from '../../aplicacion/puertos/reloj.puerto';
import {
    CONSULTA_CUENTAS_EMPRESA,
    ConsultaCuentasEmpresa,
    FiltrosListarCuentas,
    ResultadoListadoCuentas,
    CuentaEmpresaLectura,
} from '../../aplicacion/puertos/consulta-cuentas-empresa.puerto';
import {
    CONSULTA_INTERVENCIONES_SOPORTE,
    ConsultaIntervencionesSoporte,
    FiltrosListarIntervenciones,
    ResultadoListadoIntervenciones,
} from '../../aplicacion/puertos/consulta-intervenciones-soporte.puerto';
import { ContextoSolicitud } from '../../aplicacion/puertos/contexto-solicitud';
import { ContraseniaPlana } from '../../dominio/objetos-valor/contrasenia-plana.vo';

describe('T04 — Puertos de Aplicación y Modelos de Lectura (ACC)', () => {
    it('los símbolos de inyección están definidos', () => {
        expect(RESOLVEDOR_EMPRESA).toBeDefined();
        expect(VERIFICADOR_CUPO_ACCESO).toBeDefined();
        expect(VERIFICADOR_EMPLEADO).toBeDefined();
        expect(SERVICIO_HASH).toBeDefined();
        expect(GENERADOR_TOKENS).toBeDefined();
        expect(RELOJ).toBeDefined();
        expect(CONSULTA_CUENTAS_EMPRESA).toBeDefined();
        expect(CONSULTA_INTERVENCIONES_SOPORTE).toBeDefined();
    });

    it('permite implementar ResolvedorEmpresa con un doble', async () => {
        const doble: ResolvedorEmpresa = {
            buscarPorId(empresaId: string): Promise<EmpresaAcceso | null> {
                return Promise.resolve({ id: empresaId, alias: 'empresa-prueba', estado: 'ACTIVA' });
            },
            buscarPorAlias(alias: string): Promise<EmpresaAcceso | null> {
                return Promise.resolve({ id: '019a0000-0000-7000-8000-000000000001', alias, estado: 'ACTIVA' });
            },
        };

        const res = await doble.buscarPorId('019a0000-0000-7000-8000-000000000001');
        expect(res?.alias).toBe('empresa-prueba');
        expect(res?.estado).toBe('ACTIVA');
    });

    it('permite implementar VerificadorCupoAcceso y VerificadorEmpleado', async () => {
        const dobleCupo: VerificadorCupoAcceso = {
            verificarCupoDisponible(empresaId: string): Promise<boolean> {
                expect(empresaId).toBeDefined();
                return Promise.resolve(true);
            },
        };
        const dobleEmp: VerificadorEmpleado = {
            verificarEmpleadoActivo(empresaId: string, empleadoId: string): Promise<boolean> {
                expect(empresaId).toBeDefined();
                expect(empleadoId).toBeDefined();
                return Promise.resolve(true);
            },
        };

        expect(await dobleCupo.verificarCupoDisponible('emp-1')).toBe(true);
        expect(await dobleEmp.verificarEmpleadoActivo('emp-1', 'empleado-1')).toBe(true);
    });

    it('permite implementar ServicioHash y GeneradorTokens', async () => {
        const dobleHash: ServicioHash = {
            hashearContrasenia(plana: ContraseniaPlana): Promise<string> {
                return Promise.resolve(`argon2id$mock_${plana.valor.length}`);
            },
            verificarContrasenia(plana: string, hash: string): Promise<boolean> {
                return Promise.resolve(plana.length > 0 && hash.length > 0);
            },
            hashearRefresh(token: string): string {
                return `sha256_${token}`;
            },
        };

        const dobleTokens: GeneradorTokens = {
            generarTokenAccesoTenant(payload: PayloadTokenTenant): Promise<string> {
                return Promise.resolve(`jwt.tenant.${payload.sub}`);
            },
            generarTokenAccesoPlataforma(payload: PayloadTokenPlataforma): Promise<string> {
                return Promise.resolve(`jwt.plat.${payload.sub}`);
            },
            generarTokenRenovacion(): string {
                return 'refresh-token-mock-256';
            },
            verificarTokenAcceso(token: string): Promise<PayloadTokenVerificado> {
                expect(token).toBeDefined();
                return Promise.resolve({
                    sub: 'sub-1',
                    aud: 'tarefero-tenant',
                    rol: 'ADMINISTRADOR',
                    empresaId: 'emp-1',
                    sesionId: 'ses-1',
                });
            },
        };

        const hash = await dobleHash.hashearContrasenia(ContraseniaPlana.crear('ContraseniaValida123!'));
        expect(hash.startsWith('argon2id$mock_')).toBe(true);

        const token = await dobleTokens.generarTokenAccesoTenant({
            sub: 'cuenta-1',
            empresaId: 'emp-1',
            sesionId: 'ses-1',
            rol: 'ADMINISTRADOR',
            roles: ['ADMINISTRADOR'],
            canal: 'WEB',
        });
        expect(token).toBe('jwt.tenant.cuenta-1');
    });

    it('permite implementar Reloj', () => {
        const fijo = new Date('2026-11-11T12:00:00.000Z');
        const dobleReloj: Reloj = {
            ahora: () => fijo,
        };
        expect(dobleReloj.ahora()).toEqual(fijo);
    });

    it('permite estructurar ContextoSolicitud con permisos de ADR-0011', () => {
        const contexto: ContextoSolicitud = {
            actorId: 'cuenta-1',
            rol: 'ADMINISTRADOR',
            empresaId: 'emp-1',
            sesionId: 'ses-1',
            permisos: ['ACC-UC-001', 'ACC-UC-008', 'ACC-UC-010'],
        };
        expect(contexto.permisos).toContain('ACC-UC-001');
    });

    it('permite implementar ConsultaCuentasEmpresa y ConsultaIntervencionesSoporte', async () => {
        const dobleCuentas: ConsultaCuentasEmpresa = {
            consultarPorId(empresaId: string, cuentaId: string): Promise<CuentaEmpresaLectura | null> {
                expect(empresaId).toBeDefined();
                expect(cuentaId).toBeDefined();
                return Promise.resolve(null);
            },
            listarCuentas(empresaId: string, filtros: FiltrosListarCuentas): Promise<ResultadoListadoCuentas> {
                expect(empresaId).toBeDefined();
                expect(filtros).toBeDefined();
                return Promise.resolve({
                    datos: [],
                    paginacion: { limite: 25, desplazamiento: 0, total: 0 },
                });
            },
        };

        const dobleIntervenciones: ConsultaIntervencionesSoporte = {
            listarIntervenciones(
                empresaId: string,
                filtros: FiltrosListarIntervenciones,
            ): Promise<ResultadoListadoIntervenciones> {
                expect(empresaId).toBeDefined();
                expect(filtros).toBeDefined();
                return Promise.resolve({
                    datos: [],
                    paginacion: { limite: 25, desplazamiento: 0, total: 0 },
                });
            },
        };

        const resCuentas = await dobleCuentas.listarCuentas('emp-1', { limite: 10, desplazamiento: 0 });
        expect(resCuentas.datos).toEqual([]);

        const resIntervenciones = await dobleIntervenciones.listarIntervenciones('emp-1', {
            limite: 10,
            desplazamiento: 0,
        });
        expect(resIntervenciones.datos).toEqual([]);
    });
});
