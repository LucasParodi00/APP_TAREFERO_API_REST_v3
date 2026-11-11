import * as argon2 from 'argon2';
import * as crypto from 'node:crypto';
import { ServicioHash } from '../../aplicacion/puertos/servicio-hash.puerto';
import { ContraseniaPlana } from '../../dominio/objetos-valor/contrasenia-plana.vo';

export class ServicioHashArgon2 implements ServicioHash {
    private readonly opcionesArgon2 = {
        type: argon2.argon2id as 2,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1,
    };

    async hashearContrasenia(plana: ContraseniaPlana): Promise<string> {
        return argon2.hash(plana.valor, this.opcionesArgon2);
    }

    async verificarContrasenia(plana: string, hash: string): Promise<boolean> {
        try {
            return await argon2.verify(hash, plana);
        } catch {
            return false;
        }
    }

    hashearRefresh(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
}
