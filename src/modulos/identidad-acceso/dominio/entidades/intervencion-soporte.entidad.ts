import { MotivoSoporte } from '../objetos-valor/motivo-soporte.vo';

export interface PropiedadesCrearIntervencionSoporte {
    id: string;
    usuarioPlataformaId: string;
    empresaId: string;
    motivo: MotivoSoporte;
    sesionId: string;
    solicitudId: string;
    ocurridaEn: Date;
    venceEn: Date;
}

export class IntervencionSoporte {
    private readonly _id: string;
    private readonly _usuarioPlataformaId: string;
    private readonly _empresaId: string;
    private readonly _motivo: MotivoSoporte;
    private readonly _sesionId: string;
    private readonly _solicitudId: string;
    private readonly _ocurridaEn: Date;
    private readonly _venceEn: Date;

    private constructor(props: PropiedadesCrearIntervencionSoporte) {
        this._id = props.id;
        this._usuarioPlataformaId = props.usuarioPlataformaId;
        this._empresaId = props.empresaId;
        this._motivo = props.motivo;
        this._sesionId = props.sesionId;
        this._solicitudId = props.solicitudId;
        this._ocurridaEn = props.ocurridaEn;
        this._venceEn = props.venceEn;
    }

    static crear(props: PropiedadesCrearIntervencionSoporte): IntervencionSoporte {
        return new IntervencionSoporte(props);
    }

    get id(): string {
        return this._id;
    }

    get usuarioPlataformaId(): string {
        return this._usuarioPlataformaId;
    }

    get empresaId(): string {
        return this._empresaId;
    }

    get motivo(): MotivoSoporte {
        return this._motivo;
    }

    get sesionId(): string {
        return this._sesionId;
    }

    get solicitudId(): string {
        return this._solicitudId;
    }

    get ocurridaEn(): Date {
        return this._ocurridaEn;
    }

    get venceEn(): Date {
        return this._venceEn;
    }

    aplicaAEmpresa(empresaId: string): boolean {
        return this._empresaId === empresaId;
    }

    estaVigente(ahora: Date): boolean {
        return this._venceEn > ahora;
    }
}
