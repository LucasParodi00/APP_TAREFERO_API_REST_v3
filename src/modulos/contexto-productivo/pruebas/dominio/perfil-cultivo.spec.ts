import { PerfilCultivo } from '../../dominio/entidades/perfil-cultivo';
import { AlcancePerfil } from '../../dominio/enumeraciones/alcance-perfil';
import { EstadoPerfil } from '../../dominio/enumeraciones/estado-perfil';
import { CampoPerfil } from '../../dominio/objetos-valor/campo-perfil';
import { TipoCampoPerfil } from '../../dominio/enumeraciones/tipo-campo-perfil';
import { DestinoCampoPerfil } from '../../dominio/enumeraciones/destino-campo-perfil';
import { ErrorDominioContextoProductivo } from '../../dominio/errores/error-dominio-contexto-productivo';

describe('PerfilCultivo (Dominio)', () => {
  const campoBaseObligatorio = CampoPerfil.crear({
    codigo: 'DENSIDAD',
    nombre: 'Densidad de plantas',
    destino: DestinoCampoPerfil.IMPLANTACION,
    tipo: TipoCampoPerfil.ENTERO,
    obligatorio: true,
  });

  const campoOpcional = CampoPerfil.crear({
    codigo: 'NOTAS',
    nombre: 'Notas adicionales',
    destino: DestinoCampoPerfil.LABOR,
    tipo: TipoCampoPerfil.TEXTO,
    obligatorio: false,
  });

  it('debe crear un borrador de Perfil BASE sin padre ni empresa', () => {
    const perfil = PerfilCultivo.crearBorrador({
      id: 'c3333333-3333-3333-3333-333333333333',
      cultivoId: 'a1111111-1111-1111-1111-111111111111',
      alcance: AlcancePerfil.BASE,
      nombre: 'Perfil Base Yerba',
      campos: [campoBaseObligatorio],
    });

    expect(perfil.alcance).toBe(AlcancePerfil.BASE);
    expect(perfil.estado).toBe(EstadoPerfil.BORRADOR);
    expect(perfil.version).toBe(1);
    expect(perfil.empresaId).toBeNull();
    expect(perfil.loteId).toBeNull();
    expect(perfil.perfilPadreId).toBeNull();
  });

  it('debe rechazar Perfil BASE si incluye empresaId o perfilPadreId', () => {
    expect(() =>
      PerfilCultivo.crearBorrador({
        id: 'c3333333-3333-3333-3333-333333333333',
        cultivoId: 'a1111111-1111-1111-1111-111111111111',
        alcance: AlcancePerfil.BASE,
        perfilPadreId: 'padre-123',
        nombre: 'Perfil Invalido',
        campos: [campoBaseObligatorio],
      }),
    ).toThrow(ErrorDominioContextoProductivo);
  });

  it('debe exigir perfilPadreId y empresaId en alcance EMPRESA', () => {
    expect(() =>
      PerfilCultivo.crearBorrador({
        id: 'c3333333-3333-3333-3333-333333333333',
        cultivoId: 'a1111111-1111-1111-1111-111111111111',
        alcance: AlcancePerfil.EMPRESA,
        nombre: 'Perfil Empresa Sin Padre',
        campos: [campoBaseObligatorio],
      }),
    ).toThrow(ErrorDominioContextoProductivo);
  });

  it('debe permitir editar borrador y rechazar editar perfil publicado', () => {
    const perfil = PerfilCultivo.crearBorrador({
      id: 'c3333333-3333-3333-3333-333333333333',
      cultivoId: 'a1111111-1111-1111-1111-111111111111',
      alcance: AlcancePerfil.BASE,
      nombre: 'Original',
      campos: [campoBaseObligatorio],
    });

    perfil.editarBorrador({
      nombre: 'Modificado',
      campos: [campoBaseObligatorio, campoOpcional],
    });
    expect(perfil.nombre).toBe('Modificado');
    expect(perfil.campos).toHaveLength(2);

    perfil.publicar();
    expect(perfil.estado).toBe(EstadoPerfil.PUBLICADO);

    expect(() =>
      perfil.editarBorrador({ nombre: 'Intento cambiar publicado' }),
    ).toThrow(ErrorDominioContextoProductivo);
  });

  it('debe rechazar publicar especialización si desactiva campo base obligatorio', () => {
    const perfilBase = PerfilCultivo.crearBorrador({
      id: 'base-1',
      cultivoId: 'cultivo-1',
      alcance: AlcancePerfil.BASE,
      nombre: 'Perfil Base',
      campos: [campoBaseObligatorio],
    });
    perfilBase.publicar();

    // Especialización omite el campo obligatorio
    const perfilEmpresa = PerfilCultivo.crearBorrador({
      id: 'empresa-1',
      cultivoId: 'cultivo-1',
      alcance: AlcancePerfil.EMPRESA,
      empresaId: 'emp-1',
      perfilPadreId: 'base-1',
      nombre: 'Perfil Empresa Omite Obligatorio',
      campos: [campoOpcional],
    });

    expect(() => perfilEmpresa.publicar(perfilBase)).toThrow(
      ErrorDominioContextoProductivo,
    );
  });

  it('debe inactivar perfil publicado y rechazar inactivar borrador', () => {
    const perfil = PerfilCultivo.crearBorrador({
      id: 'c3333333-3333-3333-3333-333333333333',
      cultivoId: 'a1111111-1111-1111-1111-111111111111',
      alcance: AlcancePerfil.BASE,
      nombre: 'Perfil Borrador',
      campos: [campoBaseObligatorio],
    });

    expect(() => perfil.inactivar()).toThrow(ErrorDominioContextoProductivo);

    perfil.publicar();
    perfil.inactivar();
    expect(perfil.estado).toBe(EstadoPerfil.INACTIVO);
  });
});
