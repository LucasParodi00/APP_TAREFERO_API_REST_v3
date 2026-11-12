import { FechaHoraUtc } from '../../dominio';

export const RELOJ = Symbol('RELOJ');

export interface Reloj {
    ahora(): Date;
    ahoraUtc?(): FechaHoraUtc;
}
