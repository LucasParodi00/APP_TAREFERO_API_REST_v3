import { CuitInvalido } from '../errores';

const FORMATO_CUIT = /^\d{11}$/;

export class Cuit {
  private readonly _valor: string | null;

  constructor(valor?: string | null) {
    if (valor === undefined || valor === null || valor.trim() === '') {
      this._valor = null;
      return;
    }

    if (!FORMATO_CUIT.test(valor)) {
      throw new CuitInvalido();
    }

    this._valor = valor;
  }

  get valor(): string | null {
    return this._valor;
  }

  equals(otro: Cuit): boolean {
    return this._valor === otro._valor;
  }
}
