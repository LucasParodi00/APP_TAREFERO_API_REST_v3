import { Reloj } from '../../aplicacion';
import { FechaHoraUtc } from '../../dominio';

export class RelojSistema implements Reloj {
    ahora(): Date {
        return new Date();
    }

    ahoraUtc(): FechaHoraUtc {
        return FechaHoraUtc.desdeDate(this.ahora());
    }
}
