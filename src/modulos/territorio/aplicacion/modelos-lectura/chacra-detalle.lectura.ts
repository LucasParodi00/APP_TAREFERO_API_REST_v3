import { EstadoChacra } from '../../dominio/enumeraciones';

export interface ChacraDetalleLectura {
    id: string;
    empresaId: string;
    nombre: string;
    nombreCorto: string;
    responsableNombre: string | null;
    direccion: string | null;
    puntoGeograficoReferencia: { latitud: number; longitud: number } | null;
    estado: EstadoChacra;
    creadoEn: string;
    creadoPor: string;
    actualizadoEn: string;
    actualizadoPor: string;
    version: number;
}
