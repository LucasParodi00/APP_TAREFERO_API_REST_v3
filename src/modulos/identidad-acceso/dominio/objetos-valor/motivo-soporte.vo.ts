import { MotivoSoporteInvalido } from '../errores/errores-identidad-acceso';

export class MotivoSoporte {
    private readonly _valor: string;

    private constructor(valor: string) {
        this._valor = valor;
    }

    static crear(valor: string): MotivoSoporte {
        if (!valor) {
            throw new MotivoSoporteInvalido('El motivo de soporte no puede estar vacío.');
        }

        const recortado = valor.trim();
        if (recortado.length === 0 || recortado.length > 1000) {
            throw new MotivoSoporteInvalido('El motivo de soporte debe tener entre 1 y 1000 caracteres.');
        }

        return new MotivoSoporte(recortado);
    }

    get valor(): string {
        return this._valor;
    }

    toString(): string {
        return this._valor;
    }
}
