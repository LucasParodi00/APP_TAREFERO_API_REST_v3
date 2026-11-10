import { NombreEmpresaObligatorio, NombreEmpresaInvalido } from '../errores';

export class NombreEmpresa {
  private readonly _valor: string;

  constructor(valor: string) {
    if (!valor || typeof valor !== 'string') {
      throw new NombreEmpresaObligatorio();
    }
    const normalizado = valor.trim();
    if (normalizado.length === 0) {
      throw new NombreEmpresaObligatorio();
    }
    if (normalizado.length > 120) {
      throw new NombreEmpresaInvalido();
    }
    this._valor = normalizado;
  }

  get valor(): string {
    return this._valor;
  }

  equals(otro: NombreEmpresa): boolean {
    return this._valor === otro._valor;
  }
}
