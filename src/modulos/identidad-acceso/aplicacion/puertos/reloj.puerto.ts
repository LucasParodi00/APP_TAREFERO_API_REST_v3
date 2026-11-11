export const RELOJ = Symbol('RELOJ');

export interface Reloj {
    ahora(): Date;
}
