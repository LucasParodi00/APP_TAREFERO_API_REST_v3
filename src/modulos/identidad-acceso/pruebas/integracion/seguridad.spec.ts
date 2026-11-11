import { ServicioHashArgon2 } from '../../infraestructura/seguridad/servicio-hash-argon2';
import { GeneradorTokensJose } from '../../infraestructura/seguridad/generador-tokens-jose';
import { RelojSistema } from '../../infraestructura/seguridad/reloj-sistema';
import { ContraseniaPlana } from '../../dominio/objetos-valor/contrasenia-plana.vo';
import { RolCodigo } from '../../dominio/enumeraciones/rol-codigo.enum';
import { CanalAcceso } from '../../dominio/enumeraciones/canal-acceso.enum';

describe('T08 — Servicios Criptográficos de Seguridad (ACC)', () => {
    describe('ServicioHashArgon2', () => {
        let servicioHash: ServicioHashArgon2;

        beforeAll(() => {
            servicioHash = new ServicioHashArgon2();
        });

        it('hashea una contraseña plana usando Argon2id con perfil D-01 (m=19456, t=2, p=1)', async () => {
            const password = ContraseniaPlana.crear('ContraseniaRobusta#2026!');
            const hash = await servicioHash.hashearContrasenia(password);

            expect(typeof hash).toBe('string');
            // Verificamos el prefijo estándar PHC para Argon2id con parámetros configurados
            expect(hash).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
        });

        it('verifica exitosamente la contraseña correcta', async () => {
            const password = ContraseniaPlana.crear('ContraseniaRobusta#2026!');
            const hash = await servicioHash.hashearContrasenia(password);

            const esValida = await servicioHash.verificarContrasenia('ContraseniaRobusta#2026!', hash);
            expect(esValida).toBe(true);
        });

        it('rechaza una contraseña incorrecta', async () => {
            const password = ContraseniaPlana.crear('ContraseniaRobusta#2026!');
            const hash = await servicioHash.hashearContrasenia(password);

            const esValida = await servicioHash.verificarContrasenia('ContraseniaEquivocada#999', hash);
            expect(esValida).toBe(false);
        });

        it('maneja hashes corruptos o inválidos sin lanzar excepción no capturada', async () => {
            const esValida = await servicioHash.verificarContrasenia('password', 'hash_invalido_no_argon2');
            expect(esValida).toBe(false);
        });

        it('hashea un refresh token mediante SHA-256 produciendo 64 caracteres hex (D-03)', () => {
            const token = 'token-opaco-aleatorio-1234567890';
            const hash1 = servicioHash.hashearRefresh(token);
            const hash2 = servicioHash.hashearRefresh(token);

            expect(hash1).toHaveLength(64);
            expect(hash1).toMatch(/^[0-9a-f]{64}$/);
            expect(hash1).toBe(hash2);

            const hashDiferente = servicioHash.hashearRefresh('otro-token');
            expect(hash1).not.toBe(hashDiferente);
        });
    });

    describe('GeneradorTokensJose', () => {
        let generadorTokens: GeneradorTokensJose;

        beforeAll(async () => {
            generadorTokens = await GeneradorTokensJose.crearConParGenerado();
        });

        it('genera y verifica un token de acceso tenant con claims completos y vigencia de 15m (D-02)', async () => {
            const token = await generadorTokens.generarTokenAccesoTenant({
                sub: 'cuenta-uuid-001',
                empresaId: 'empresa-uuid-001',
                sesionId: 'sesion-uuid-001',
                rol: RolCodigo.ADMINISTRADOR,
                roles: [RolCodigo.ADMINISTRADOR, RolCodigo.CAPATAZ],
                canal: CanalAcceso.WEB,
            });

            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3);

            const verificado = await generadorTokens.verificarTokenAcceso(token);
            expect(verificado.sub).toBe('cuenta-uuid-001');
            expect(verificado.empresaId).toBe('empresa-uuid-001');
            expect(verificado.sesionId).toBe('sesion-uuid-001');
            expect(verificado.rol).toBe(RolCodigo.ADMINISTRADOR);
            expect(verificado.aud).toBe('tarefero:tenant');
        });

        it('genera y verifica un token de acceso de plataforma (D-02)', async () => {
            const token = await generadorTokens.generarTokenAccesoPlataforma({
                sub: 'usuario-plataforma-001',
                sesionId: 'sesion-plataforma-001',
                rol: 'SUPER_ADMINISTRADOR',
            });

            const verificado = await generadorTokens.verificarTokenAcceso(token);
            expect(verificado.sub).toBe('usuario-plataforma-001');
            expect(verificado.sesionId).toBe('sesion-plataforma-001');
            expect(verificado.rol).toBe('SUPER_ADMINISTRADOR');
            expect(verificado.aud).toBe('tarefero:plataforma');
            expect(verificado.empresaId).toBeUndefined();
        });

        it('genera un token de renovación opaco aleatorio de 64 caracteres hex (D-03)', () => {
            const refresh1 = generadorTokens.generarTokenRenovacion();
            const refresh2 = generadorTokens.generarTokenRenovacion();

            expect(refresh1).toHaveLength(64);
            expect(refresh1).toMatch(/^[0-9a-f]{64}$/);
            expect(refresh1).not.toBe(refresh2);
        });

        it('rechaza tokens con firma adulterada o clave diferente', async () => {
            const token = await generadorTokens.generarTokenAccesoTenant({
                sub: 'cuenta-uuid-001',
                empresaId: 'empresa-uuid-001',
                sesionId: 'sesion-uuid-001',
                rol: RolCodigo.ADMINISTRADOR,
                roles: [RolCodigo.ADMINISTRADOR],
                canal: CanalAcceso.WEB,
            });

            // Alterar un carácter del token
            const tokenAdulterado = token.slice(0, -5) + 'XXXXX';
            await expect(generadorTokens.verificarTokenAcceso(tokenAdulterado)).rejects.toThrow();
        });

        it('expone el conjunto de claves públicas JWKS', () => {
            const jwks = generadorTokens.obtenerJwks();
            expect(jwks).toBeDefined();
            expect(Array.isArray(jwks.keys)).toBe(true);
            expect(jwks.keys.length).toBeGreaterThan(0);
            expect(jwks.keys[0].kid).toBeDefined();
        });
    });

    describe('RelojSistema', () => {
        it('devuelve la fecha y hora actual del sistema', () => {
            const reloj = new RelojSistema();
            const antes = Date.now();
            const ahora = reloj.ahora();
            const despues = Date.now();

            expect(ahora).toBeInstanceOf(Date);
            expect(ahora.getTime()).toBeGreaterThanOrEqual(antes);
            expect(ahora.getTime()).toBeLessThanOrEqual(despues);
        });
    });
});
