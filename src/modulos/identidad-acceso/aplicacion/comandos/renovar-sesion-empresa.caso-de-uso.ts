import { RepositorioCuentasEmpresa } from '../puertos/salida/repositorio-cuentas-empresa';
import { RepositorioSesionesEmpresa } from '../puertos/salida/repositorio-sesiones-empresa';
import { VerificadorElegibilidadComercial } from '../puertos/salida/verificador-elegibilidad-comercial.puerto';
import { ServicioCriptografia } from '../puertos/salida/servicio-criptografia.puerto';
import { CanalSesion } from '../../dominio/enumeraciones/canal-sesion';
import { EstadoCuentaEmpresa } from '../../dominio/enumeraciones/estado-cuenta-empresa';
import { ErrorDominioIdentidadAcceso } from '../../dominio/errores/error-dominio-identidad-acceso';
import { RespuestaSesionEmpresaDto } from './iniciar-sesion-empresa.caso-de-uso';

export interface ComandoRenovarSesionEmpresa {
  tokenRenovacion: string;
  canal?: string;
}

export class RenovarSesionEmpresa {
  constructor(
    private readonly repositorioCuentas: RepositorioCuentasEmpresa,
    private readonly repositorioSesiones: RepositorioSesionesEmpresa,
    private readonly verificadorElegibilidad: VerificadorElegibilidadComercial,
    private readonly servicioCriptografia: ServicioCriptografia,
  ) {}

  public async ejecutar(
    comando: ComandoRenovarSesionEmpresa,
  ): Promise<RespuestaSesionEmpresaDto> {
    if (!comando.tokenRenovacion) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_RENOVACION_INVALIDA',
        'El token de renovación es obligatorio.',
      );
    }

    const tokenHash = this.servicioCriptografia.hashearToken(
      comando.tokenRenovacion,
    );

    // 1. Detección de reutilización (ADR-0006)
    const fueReutilizado =
      await this.repositorioSesiones.existeHuellaRenovacion(tokenHash);
    if (fueReutilizado) {
      // Reutilización detectada: revocar la sesión
      const sesionAfectada =
        await this.repositorioSesiones.buscarPorTokenRenovacion(tokenHash);
      if (sesionAfectada) {
        sesionAfectada.revocar(
          'Reutilización de token de renovación detectada',
          'sistema',
        );
        await this.repositorioSesiones.actualizar(sesionAfectada);
      }
      throw new ErrorDominioIdentidadAcceso(
        'ACC_RENOVACION_INVALIDA',
        'El token de renovación ya fue utilizado.',
      );
    }

    // 2. Buscar la sesión por hash del token de renovación
    const sesion =
      await this.repositorioSesiones.buscarPorTokenRenovacion(tokenHash);
    if (!sesion || !sesion.estaVigente()) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_RENOVACION_INVALIDA',
        'Renovación vencida, revocada o inválida.',
      );
    }

    // Resolver y validar canal
    let canal = sesion.canal;
    if (comando.canal) {
      const canalNormalizado = comando.canal.toUpperCase();
      if (
        canalNormalizado !== (CanalSesion.WEB as string) &&
        canalNormalizado !== (CanalSesion.MOVIL as string)
      ) {
        throw new ErrorDominioIdentidadAcceso(
          'ACC_CANAL_NO_HABILITADO',
          `El canal '${comando.canal}' no es válido.`,
        );
      }
      canal = canalNormalizado as CanalSesion;
    }

    // 3. Buscar la cuenta asociada
    const cuenta = await this.repositorioCuentas.buscarPorId(
      sesion.cuentaEmpresaId,
    );
    if (!cuenta || cuenta.estado !== EstadoCuentaEmpresa.ACTIVA) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_ACCESO_NO_HABILITADO',
        'La cuenta se encuentra suspendida o no disponible.',
      );
    }

    // 4. Verificar elegibilidad comercial
    try {
      const elegibilidad =
        await this.verificadorElegibilidad.obtenerElegibilidad(
          sesion.empresaId,
        );
      if (!elegibilidad.habilitada) {
        throw new ErrorDominioIdentidadAcceso(
          'ACC_ACCESO_NO_HABILITADO',
          'La Empresa no cuenta con habilitación comercial vigente.',
        );
      }
    } catch (error) {
      if (error instanceof ErrorDominioIdentidadAcceso) throw error;
      throw new ErrorDominioIdentidadAcceso(
        'ACC_ACCESO_NO_HABILITADO',
        'No se pudo verificar la habilitación comercial.',
      );
    }

    // 5. Verificar canal habilitado en la cuenta
    if (canal === CanalSesion.WEB && !cuenta.accesoWeb) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_CANAL_NO_HABILITADO',
        'La cuenta no tiene habilitado el acceso por canal web.',
      );
    }
    if (canal === CanalSesion.MOVIL && !cuenta.accesoMovil) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_CANAL_NO_HABILITADO',
        'La cuenta no tiene habilitado el acceso por canal móvil.',
      );
    }

    // 6. Registrar el token viejo como consumido para evitar reutilizaciones
    await this.repositorioSesiones.registrarHuellaRenovacion(
      sesion.id,
      tokenHash,
    );

    // 7. Rotar token de renovación
    const nuevoTokenRenovacionRaw =
      this.servicioCriptografia.generarTokenAleatorio();
    const nuevoTokenRenovacionHash = this.servicioCriptografia.hashearToken(
      nuevoTokenRenovacionRaw,
    );

    sesion.rotarTokenRenovacion(nuevoTokenRenovacionHash);
    await this.repositorioSesiones.actualizar(sesion);

    // 8. Generar nuevo token de acceso (15 minutos)
    const tokenAcceso = this.servicioCriptografia.generarTokenAcceso({
      sesionId: sesion.id,
      cuentaId: cuenta.id,
      empresaId: sesion.empresaId,
      roles: [...cuenta.roles],
    });

    const expiraAccesoEn = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const expiraRenovacionEn = sesion.venceEn.toISOString();

    return {
      empresaId: sesion.empresaId,
      cuentaId: cuenta.id,
      sesionId: sesion.id,
      tokenAcceso,
      tokenRenovacion: nuevoTokenRenovacionRaw,
      expiraAccesoEn,
      expiraRenovacionEn,
    };
  }
}
