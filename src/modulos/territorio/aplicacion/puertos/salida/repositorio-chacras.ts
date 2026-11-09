import { Chacra } from '../../../dominio/entidades/chacra';

export interface RepositorioChacras {
  guardar(chacra: Chacra): Promise<void>;
  buscarPorId(empresaId: string, id: string): Promise<Chacra | null>;
  buscarPorIdConBloqueo(empresaId: string, id: string): Promise<Chacra | null>;
  existeNombreCorto(
    empresaId: string,
    nombreCortoClave: string,
    excluirId?: string,
  ): Promise<boolean>;
}
