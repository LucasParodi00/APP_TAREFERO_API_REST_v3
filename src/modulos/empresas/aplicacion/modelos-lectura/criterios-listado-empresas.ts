import { EmpresaLectura } from './empresa-lectura';

export interface CriteriosListadoEmpresas {
    pagina: number;
    limite: number;
    estado?: string;
    nombre?: string;
}

export interface ResultadoListadoEmpresas {
    elementos: EmpresaLectura[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
}
