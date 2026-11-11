import * as jose from 'jose';
import * as crypto from 'node:crypto';
import {
    GeneradorTokens,
    PayloadTokenPlataforma,
    PayloadTokenTenant,
    PayloadTokenVerificado,
} from '../../aplicacion/puertos/generador-tokens.puerto';

export interface ConfiguracionGeneradorTokens {
    issuer?: string;
    kid?: string;
    algoritmo?: string;
    clavePrivada: jose.KeyLike | Uint8Array;
    clavePublica: jose.KeyLike | Uint8Array;
    jwkPublica?: jose.JWK;
}

export class GeneradorTokensJose implements GeneradorTokens {
    private readonly issuer: string;
    private readonly kid: string;
    private readonly algoritmo: string;
    private readonly clavePrivada: jose.KeyLike | Uint8Array;
    private readonly clavePublica: jose.KeyLike | Uint8Array;
    private readonly jwkPublica?: jose.JWK;

    constructor(config: ConfiguracionGeneradorTokens) {
        this.issuer = config.issuer ?? 'tarefero-api';
        this.kid = config.kid ?? 'tarefero-key-1';
        this.algoritmo = config.algoritmo ?? 'EdDSA';
        this.clavePrivada = config.clavePrivada;
        this.clavePublica = config.clavePublica;
        this.jwkPublica = config.jwkPublica;
    }

    static async crearConParGenerado(algoritmo = 'EdDSA', kid = 'tarefero-key-1'): Promise<GeneradorTokensJose> {
        const { privateKey, publicKey } = await jose.generateKeyPair(algoritmo, { extractable: true });
        const jwkPublica = await jose.exportJWK(publicKey);
        jwkPublica.kid = kid;
        jwkPublica.alg = algoritmo;
        jwkPublica.use = 'sig';

        return new GeneradorTokensJose({
            issuer: 'tarefero-api',
            kid,
            algoritmo,
            clavePrivada: privateKey,
            clavePublica: publicKey,
            jwkPublica,
        });
    }

    async generarTokenAccesoTenant(payload: PayloadTokenTenant): Promise<string> {
        return new jose.SignJWT({
            sub: payload.sub,
            sid: payload.sesionId,
            empresaId: payload.empresaId,
            rol: payload.rol,
            roles: payload.roles,
            canal: payload.canal,
        })
            .setProtectedHeader({ alg: this.algoritmo, kid: this.kid })
            .setIssuedAt()
            .setIssuer(this.issuer)
            .setAudience('tarefero:tenant')
            .setJti(crypto.randomUUID())
            .setExpirationTime('15m')
            .sign(this.clavePrivada);
    }

    async generarTokenAccesoPlataforma(payload: PayloadTokenPlataforma): Promise<string> {
        return new jose.SignJWT({
            sub: payload.sub,
            sid: payload.sesionId,
            rol: payload.rol,
        })
            .setProtectedHeader({ alg: this.algoritmo, kid: this.kid })
            .setIssuedAt()
            .setIssuer(this.issuer)
            .setAudience('tarefero:plataforma')
            .setJti(crypto.randomUUID())
            .setExpirationTime('15m')
            .sign(this.clavePrivada);
    }

    generarTokenRenovacion(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    async verificarTokenAcceso(token: string): Promise<PayloadTokenVerificado> {
        const resultado = await jose.jwtVerify(token, this.clavePublica, {
            issuer: this.issuer,
        });

        const claims = resultado.payload;
        const aud = Array.isArray(claims.aud) ? (claims.aud[0] ?? '') : (claims.aud ?? '');

        return {
            sub: (claims.sub as string) ?? '',
            aud,
            rol: (claims.rol as string) ?? '',
            empresaId: claims.empresaId ? (claims.empresaId as string) : undefined,
            sesionId: claims.sid ? (claims.sid as string) : undefined,
        };
    }

    obtenerJwks(): { keys: jose.JWK[] } {
        return {
            keys: this.jwkPublica ? [this.jwkPublica] : [],
        };
    }
}
