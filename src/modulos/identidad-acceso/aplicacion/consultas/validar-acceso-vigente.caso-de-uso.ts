import { RepositorioCuentasEmpresa } from '../puertos/salida/repositorio-cuentas-empresa';
import { RepositorioSesionesEmpresa } from '../puertos/salida/repositorio-sesiones-empresa';
import { VerificadorEmpresaPuerto } from '../puertos/salida/verificador-empresa.puerto';
import { ServicioCriptografia } from '../puertos/salida/servicio-criptografia.puerto';
import { EstadoCuentaEmpresa } from '../../dominio/enumeraciones/estado-cuenta-empresa';
import { ErrorDominioIdentidadAcceso } from '../../dominio/errores/error-dominio-identidad-acceso';

export interface ContextoAccesoVigente {
  sesionId: string;
  cuentaId: string;
  empresaId: string;
  roles: string[];
  correo: string;
}

export class ValidarAccesoVigente {
  constructor(
    private readonly repositorioCuentas: RepositorioCuentasEmpresa,
    private readonly repositorioSesiones: RepositorioSesionesEmpresa,
    private readonly verificadorEmpresa: VerificadorEmpresaPuerto,
    private readonly servicioCriptografia: ServicioCriptografia,
  ) {}

  public async ejecutar(tokenAcceso: string): Promise<ContextoAccesoVigente> {
    if (!tokenAcceso) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_SESION_NO_VIGENTE',
        'Sesión ausente, vencida o revocada.',
      );
    }

    const payload = this.servicioCriptografia.verificarTokenAcceso(tokenAcceso);
    if (!payload) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_SESION_NO_VIGENTE',
        'Token de acceso inválido o expirado.',
      );
    }

    // 1. Verificar sesión persistente vigente en base de datos (ADR-0004)
    const sesion = await this.repositorioSesiones.buscarPorId(payload.sesionId);
    if (!sesion || !sesion.estaVigente()) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_SESION_NO_VIGENTE',
        'Sesión ausente, vencida o revocada.',
      );
    }

    // 2. Verificar cuenta activa
    const cuenta = await this.repositorioCuentas.buscarPorId(payload.cuentaId);
    if (!cuenta || cuenta.estado !== EstadoCuentaEmpresa.ACTIVA) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_ACCESO_DENEGADO',
        'La cuenta se encuentra inactiva o suspendida.',
      );
    }

    // 3. Verificar empresa activa
    const refEmpresa = await this.verificadorEmpresa.obtenerPorId(
      payload.empresaId,
    );
    if (!refEmpresa || refEmpresa.estado !== 'ACTIVA') {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_ACCESO_DENEGADO',
        'La Empresa no se encuentra activa.',
      );
    }

    return {
      sesionId: sesion.id,
      cuentaId: cuenta.id,
      empresaId: cuenta.empresaId,
      roles: [...cuenta.roles],
      correo: cuenta.correoAcceso.valor,
    };
  }
}
