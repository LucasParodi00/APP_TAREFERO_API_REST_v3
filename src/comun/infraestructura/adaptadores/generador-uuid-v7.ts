import { v7 as uuidv7 } from 'uuid';
import { GeneradorIdentificadores } from '../../aplicacion';

export class GeneradorUuidV7 implements GeneradorIdentificadores {
    generar(): string {
        return uuidv7();
    }
}
