import { Cultivo } from '../../dominio/entidades/cultivo';
import { EstadoCultivo } from '../../dominio/enumeraciones/estado-cultivo';
import { ErrorDominioContextoProductivo } from '../../dominio/errores/error-dominio-contexto-productivo';

describe('Cultivo (Dominio)', () => {
  it('debe crear un Cultivo con código en mayúsculas y estado ACTIVO', () => {
    const cultivo = Cultivo.crear({
      id: 'a1111111-1111-1111-1111-111111111111',
      codigo: '  yerba-mate  ',
      nombre: '  Yerba Mate  ',
      descripcion: 'Cultivo tradicional',
    });

    expect(cultivo.id).toBe('a1111111-1111-1111-1111-111111111111');
    expect(cultivo.codigo).toBe('YERBA-MATE');
    expect(cultivo.nombre).toBe('Yerba Mate');
    expect(cultivo.descripcion).toBe('Cultivo tradicional');
    expect(cultivo.estado).toBe(EstadoCultivo.ACTIVO);
    expect(cultivo.version).toBe(1);
  });

  it('debe rechazar código o nombre vacíos', () => {
    expect(() =>
      Cultivo.crear({
        id: 'a1111111-1111-1111-1111-111111111111',
        codigo: '   ',
        nombre: 'Yerba',
      }),
    ).toThrow(ErrorDominioContextoProductivo);

    expect(() =>
      Cultivo.crear({
        id: 'a1111111-1111-1111-1111-111111111111',
        codigo: 'YM',
        nombre: '   ',
      }),
    ).toThrow(ErrorDominioContextoProductivo);
  });

  it('debe inactivar un cultivo activo', () => {
    const cultivo = Cultivo.crear({
      id: 'a1111111-1111-1111-1111-111111111111',
      codigo: 'TE',
      nombre: 'Té',
    });

    cultivo.inactivar();
    expect(cultivo.estado).toBe(EstadoCultivo.INACTIVO);
    expect(cultivo.version).toBe(2);
  });
});
