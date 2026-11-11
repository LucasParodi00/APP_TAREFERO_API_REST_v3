import { ContraseniaPlana } from '../../dominio/objetos-valor/contrasenia-plana.vo';

export const SERVICIO_HASH = Symbol('SERVICIO_HASH');

export interface ServicioHash {
    hashearContrasenia(plana: ContraseniaPlana): Promise<string>;
    verificarContrasenia(plana: string, hash: string): Promise<boolean>;
    hashearRefresh(token: string): string;
}
