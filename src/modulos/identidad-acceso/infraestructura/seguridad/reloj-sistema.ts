import { Reloj } from '../../aplicacion/puertos/reloj.puerto';

export class RelojSistema implements Reloj {
    ahora(): Date {
        return new Date();
    }
}
