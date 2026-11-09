export interface PayloadTokenAcceso {
  sesionId: string;
  cuentaId: string;
  empresaId: string;
  roles: string[];
}

export interface ServicioCriptografia {
  hashearContrasenia(contrasenia: string): Promise<string>;
  verificarContrasenia(contrasenia: string, hash: string): Promise<boolean>;
  generarTokenAleatorio(): string;
  hashearToken(token: string): string;
  generarTokenAcceso(payload: PayloadTokenAcceso): string;
  verificarTokenAcceso(token: string): PayloadTokenAcceso | null;
}
