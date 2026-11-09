import { Variedad } from '../../dominio/entidades/variedad';
import { EstadoVariedad } from '../../dominio/enumeraciones/estado-variedad';
import { ErrorDominioContextoProductivo } from '../../dominio/errores/error-dominio-contexto-productivo';

describe('Variedad (Dominio)', () => {
  it('debe crear una Variedad asociada a un Cultivo con estado ACTIVA', () => {
    const variedad = Variedad.crear({
      id: 'b2222222-2222-2222-2222-222222222222',
      cultivoId: 'a1111111-1111-1111-1111-111111111111',
      codigo: '  criolla  ',
      nombre: '  Criolla  ',
      descripcion: 'Variedad nativa',
    });

    expect(variedad.id).toBe('b2222222-2222-2222-2222-222222222222');
    expect(variedad.cultivoId).toBe('a1111111-1111-1111-1111-111111111111');
    expect(variedad.codigo).toBe('CRIOLLA');
    expect(variedad.nombre).toBe('Criolla');
    expect(variedad.descripcion).toBe('Variedad nativa');
    expect(variedad.estado).toBe(EstadoVariedad.ACTIVA);
    expect(variedad.version).toBe(1);
  });

  it('debe rechazar variedad con campos inválidos', () => {
    expect(() =>
      Variedad.crear({
        id: 'b2222222-2222-2222-2222-222222222222',
        cultivoId: 'a1111111-1111-1111-1111-111111111111',
        codigo: '',
        nombre: 'Criolla',
      }),
    ).toThrow(ErrorDominioContextoProductivo);
  });

  it('debe inactivar una variedad activa', () => {
    const variedad = Variedad.crear({
      id: 'b2222222-2222-2222-2222-222222222222',
      cultivoId: 'a1111111-1111-1111-1111-111111111111',
      codigo: 'CLONAL',
      nombre: 'Clonal',
    });

    variedad.inactivar();
    expect(variedad.estado).toBe(EstadoVariedad.INACTIVA);
    expect(variedad.version).toBe(2);
  });
});
