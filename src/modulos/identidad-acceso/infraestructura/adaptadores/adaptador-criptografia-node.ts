import {
  randomBytes,
  scrypt,
  createHash,
  createHmac,
  timingSafeEqual,
} from 'crypto';
import { promisify } from 'util';
import {
  ServicioCriptografia,
  PayloadTokenAcceso,
} from '../../aplicacion/puertos/salida/servicio-criptografia.puerto';

const scryptAsync = promisify(scrypt);

export class AdaptadorCriptografiaNode implements ServicioCriptografia {
  private readonly jwtSecret: string;

  constructor(jwtSecret?: string) {
    this.jwtSecret =
      jwtSecret ??
      process.env.JWT_SECRET ??
      'tarefero-super-secret-key-for-access-tokens-123456';
  }

  public async hashearContrasenia(contrasenia: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scryptAsync(contrasenia, salt, 64)) as Buffer;
    return `scrypt:${salt}:${derivedKey.toString('hex')}`;
  }

  public async verificarContrasenia(
    contrasenia: string,
    hash: string,
  ): Promise<boolean> {
    const partes = hash.split(':');
    if (partes.length !== 3 || partes[0] !== 'scrypt') {
      return false;
    }
    const salt = partes[1];
    const keyOriginal = Buffer.from(partes[2], 'hex');
    const keyDerivada = (await scryptAsync(contrasenia, salt, 64)) as Buffer;

    if (keyOriginal.length !== keyDerivada.length) {
      return false;
    }
    return timingSafeEqual(keyOriginal, keyDerivada);
  }

  public generarTokenAleatorio(): string {
    return randomBytes(32).toString('hex');
  }

  public hashearToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  public generarTokenAcceso(payload: PayloadTokenAcceso): string {
    const header = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
    ).toString('base64url');
    const payloadConExp = {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutos
      iat: Math.floor(Date.now() / 1000),
    };
    const body = Buffer.from(JSON.stringify(payloadConExp)).toString(
      'base64url',
    );
    const firma = createHmac('sha256', this.jwtSecret)
      .update(`${header}.${body}`)
      .digest('base64url');

    return `${header}.${body}.${firma}`;
  }

  public verificarTokenAcceso(token: string): PayloadTokenAcceso | null {
    if (!token || typeof token !== 'string') return null;
    const partes = token.split('.');
    if (partes.length !== 3) return null;

    const [header, body, firma] = partes;
    const firmaEsperada = createHmac('sha256', this.jwtSecret)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (firma !== firmaEsperada) return null;

    try {
      interface PayloadJwtRaw {
        sesionId: string;
        cuentaId: string;
        empresaId: string;
        roles: string[];
        exp?: number;
      }
      const decoded = JSON.parse(
        Buffer.from(body, 'base64url').toString('utf8'),
      ) as PayloadJwtRaw;
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }
      return {
        sesionId: decoded.sesionId,
        cuentaId: decoded.cuentaId,
        empresaId: decoded.empresaId,
        roles: decoded.roles,
      };
    } catch {
      return null;
    }
  }
}
