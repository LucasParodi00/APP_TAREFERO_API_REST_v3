import { PerfilCultivo } from '../../../dominio/entidades/perfil-cultivo';
import { AlcancePerfil } from '../../../dominio/enumeraciones/alcance-perfil';

export const REPOSITORIO_PERFILES = Symbol('REPOSITORIO_PERFILES');

export interface RepositorioPerfiles {
  guardar(perfil: PerfilCultivo): Promise<void>;
  buscarPorId(id: string): Promise<PerfilCultivo | null>;
  obtenerSiguienteNumeroVersion(
    cultivoId: string,
    alcance: AlcancePerfil,
    empresaId: string | null,
    loteId: string | null,
  ): Promise<number>;
  buscarPorLineaYVersion(
    cultivoId: string,
    alcance: AlcancePerfil,
    empresaId: string | null,
    loteId: string | null,
    version: number,
  ): Promise<PerfilCultivo | null>;
}
