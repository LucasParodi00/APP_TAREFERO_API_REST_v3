import { PropiedadesCampoPerfil } from '../../../dominio/objetos-valor/campo-perfil';

export class SolicitudEditarBorradorPerfilDto {
  nombre?: string;
  descripcion?: string;
  campos?: PropiedadesCampoPerfil[];
}
