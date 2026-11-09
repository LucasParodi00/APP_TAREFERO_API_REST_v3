import { randomUUID } from 'crypto';
import { RepositorioCuentasEmpresa } from '../puertos/salida/repositorio-cuentas-empresa';
import { RepositorioSesionesEmpresa } from '../puertos/salida/repositorio-sesiones-empresa';
import { VerificadorEmpresaPuerto } from '../puertos/salida/verificador-empresa.puerto';
import { VerificadorElegibilidadComercial } from '../puertos/salida/verificador-elegibilidad-comercial.puerto';
import { ServicioCriptografia } from '../puertos/salida/servicio-criptografia.puerto';
import { SesionEmpresa } from '../../dominio/entidades/sesion-empresa';
import { CorreoAcceso } from '../../dominio/objetos-valor/correo-acceso';
import { ContraseniaAcceso } from '../../dominio/objetos-valor/contrasenia-acceso';
import { CanalSesion } from '../../dominio/enumeraciones/canal-sesion';
import { EstadoCuentaEmpresa } from '../../dominio/enumeraciones/estado-cuenta-empresa';
import { ErrorDominioIdentidadAcceso } from '../../dominio/errores/error-dominio-identidad-acceso';

export interface ComandoIniciarSesionEmpresa {
  aliasEmpresa: string;
  correoAcceso: string;
  contrasenia: string;
  canal: string;
}

export interface RespuestaSesionEmpresaDto {
  empresaId: string;
  cuentaId: string;
  sesionId: string;
  tokenAcceso: string;
  tokenRenovacion: string;
  expiraAccesoEn: string;
  expiraRenovacionEn: string;
}

export class IniciarSesionEmpresa {
  constructor(
    private readonly repositorioCuentas: RepositorioCuentasEmpresa,
    private readonly repositorioSesiones: RepositorioSesionesEmpresa,
    private readonly verificadorEmpresa: VerificadorEmpresaPuerto,
    private readonly verificadorElegibilidad: VerificadorElegibilidadComercial,
    private readonly servicioCriptografia: ServicioCriptografia,
  ) {}

  public async ejecutar(
    comando: ComandoIniciarSesionEmpresa,
  ): Promise<RespuestaSesionEmpresaDto> {
    const correoVO = new CorreoAcceso(comando.correoAcceso);
    const contraseniaVO = new ContraseniaAcceso(comando.contrasenia);

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
    const canal = canalNormalizado as CanalSesion;

    // 1. Obtener Empresa por alias (ACC-DEP-001)
    const refEmpresa = await this.verificadorEmpresa.obtenerPorAlias(
      comando.aliasEmpresa,
    );
    if (!refEmpresa) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_AUTENTICACION_INVALIDA',
        'Identificación o credenciales inválidas.',
      );
    }

    if (refEmpresa.estado !== 'ACTIVA') {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_ACCESO_DENEGADO',
        'La Empresa no se encuentra activa para iniciar sesión.',
      );
    }

    // 2. Verificar elegibilidad comercial (ACC-DEP-002, ADR-0012)
    try {
      const elegibilidad =
        await this.verificadorElegibilidad.obtenerElegibilidad(refEmpresa.id);
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

    // 3. Buscar Cuenta de Empresa
    const cuenta = await this.repositorioCuentas.buscarPorCorreo(
      refEmpresa.id,
      correoVO.valor,
    );
    if (!cuenta) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_AUTENTICACION_INVALIDA',
        'Identificación o credenciales inválidas.',
      );
    }

    // 4. Verificar contraseña
    const contraseniaValida =
      await this.servicioCriptografia.verificarContrasenia(
        contraseniaVO.valor,
        cuenta.hashContrasenia,
      );
    if (!contraseniaValida) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_AUTENTICACION_INVALIDA',
        'Identificación o credenciales inválidas.',
      );
    }

    // 5. Verificar estado de la cuenta (ACC-BR-016)
    if (cuenta.estado !== EstadoCuentaEmpresa.ACTIVA) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_ACCESO_NO_HABILITADO',
        'La cuenta se encuentra suspendida.',
      );
    }

    // 6. Verificar canal habilitado en la cuenta (ACC-BR-005)
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

    // 7. Emitir Sesión persistente y tokens (ADR-0006)
    const sesionId = randomUUID();
    const tokenRenovacionRaw =
      this.servicioCriptografia.generarTokenAleatorio();
    const tokenRenovacionHash =
      this.servicioCriptografia.hashearToken(tokenRenovacionRaw);

    const sesion = SesionEmpresa.crear({
      id: sesionId,
      empresaId: refEmpresa.id,
      cuentaEmpresaId: cuenta.id,
      canal,
      tokenRenovacionHash,
    });

    await this.repositorioSesiones.guardar(sesion);

    const tokenAcceso = this.servicioCriptografia.generarTokenAcceso({
      sesionId: sesion.id,
      cuentaId: cuenta.id,
      empresaId: refEmpresa.id,
      roles: [...cuenta.roles],
    });

    // 15 minutos para acceso (ADR-0006)
    const expiraAccesoEn = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const expiraRenovacionEn = sesion.venceEn.toISOString();

    return {
      empresaId: refEmpresa.id,
      cuentaId: cuenta.id,
      sesionId: sesion.id,
      tokenAcceso,
      tokenRenovacion: tokenRenovacionRaw,
      expiraAccesoEn,
      expiraRenovacionEn,
    };
  }
}
