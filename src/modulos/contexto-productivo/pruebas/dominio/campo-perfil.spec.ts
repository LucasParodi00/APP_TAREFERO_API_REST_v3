import { CampoPerfil } from '../../dominio/objetos-valor/campo-perfil';
import { TipoCampoPerfil } from '../../dominio/enumeraciones/tipo-campo-perfil';
import { DestinoCampoPerfil } from '../../dominio/enumeraciones/destino-campo-perfil';
import { ErrorDominioContextoProductivo } from '../../dominio/errores/error-dominio-contexto-productivo';

describe('CampoPerfil (Dominio)', () => {
  it('debe crear un campo de tipo TEXTO válido', () => {
    const campo = CampoPerfil.crear({
      codigo: 'obs_inicial',
      nombre: 'Observación inicial',
      destino: DestinoCampoPerfil.OBSERVACION,
      tipo: TipoCampoPerfil.TEXTO,
      obligatorio: false,
      validaciones: {
        longitudMinima: 10,
        longitudMaxima: 500,
      },
    });

    expect(campo.codigo).toBe('OBS_INICIAL');
    expect(campo.nombre).toBe('Observación inicial');
    expect(campo.tipo).toBe(TipoCampoPerfil.TEXTO);
    expect(campo.obligatorio).toBe(false);
  });

  it('debe exigir unidadId cuando el tipo es DECIMAL', () => {
    expect(() =>
      CampoPerfil.crear({
        codigo: 'PESO',
        nombre: 'Peso promedio',
        destino: DestinoCampoPerfil.COSECHA,
        tipo: TipoCampoPerfil.DECIMAL,
        obligatorio: true,
      }),
    ).toThrow(ErrorDominioContextoProductivo);
  });

  it('debe validar rangos consistentes en ENTERO o DECIMAL', () => {
    expect(() =>
      CampoPerfil.crear({
        codigo: 'EDAD',
        nombre: 'Edad planta',
        destino: DestinoCampoPerfil.IMPLANTACION,
        tipo: TipoCampoPerfil.ENTERO,
        obligatorio: true,
        validaciones: {
          minimo: 100,
          maximo: 10,
        },
      }),
    ).toThrow(ErrorDominioContextoProductivo);
  });

  it('debe exigir opciones no vacías en SELECCION', () => {
    expect(() =>
      CampoPerfil.crear({
        codigo: 'TIPO_SUELO',
        nombre: 'Tipo de suelo',
        destino: DestinoCampoPerfil.IMPLANTACION,
        tipo: TipoCampoPerfil.SELECCION,
        obligatorio: true,
        validaciones: {
          valoresPermitidos: [],
        },
      }),
    ).toThrow(ErrorDominioContextoProductivo);
  });
});
