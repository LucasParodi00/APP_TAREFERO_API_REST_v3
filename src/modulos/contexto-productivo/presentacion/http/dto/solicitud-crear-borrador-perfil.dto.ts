import { AlcancePerfil } from '../../../dominio/enumeraciones/alcance-perfil';
import { PropiedadesCampoPerfil } from '../../../dominio/objetos-valor/campo-perfil';

export class SolicitudCrearBorradorPerfilDto {
  alcance?: AlcancePerfil;
  loteId?: string;
  perfilPadreId?: string;
  nombre?: string;
  descripcion?: string;
  campos?: PropiedadesCampoPerfil[];
  versionOrigenId?: string;
}
