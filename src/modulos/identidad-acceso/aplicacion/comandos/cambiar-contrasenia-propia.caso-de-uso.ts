import { RepositorioCuentasEmpresa } from '../puertos/salida/repositorio-cuentas-empresa';
import { RepositorioSesionesEmpresa } from '../puertos/salida/repositorio-sesiones-empresa';
import { ServicioCriptografia } from '../puertos/salida/servicio-criptografia.puerto';
import { ContextoActorAcc } from '../puertos/salida/contexto-actor-acc';
import { ContraseniaAcceso } from '../../dominio/objetos-valor/contrasenia-acceso';
import { ErrorDominioIdentidadAcceso } from '../../dominio/errores/error-dominio-identidad-acceso';

export interface ComandoCambioContraseniaPropia {
  empresaId: string;
  cuentaId: string;
  contraseniaActual: string;
  contraseniaNueva: string;
}

export class CambiarContraseniaPropia {
  constructor(
    private readonly repositorioCuentas: RepositorioCuentasEmpresa,
    private readonly repositorioSesiones: RepositorioSesionesEmpresa,
    private readonly servicioCriptografia: ServicioCriptografia,
  ) {}

  public async ejecutar(
    comando: ComandoCambioContraseniaPropia,
    contexto: ContextoActorAcc,
  ): Promise<void> {
    // 1. Titularidad del cambio propio (ACC-BR-013)
    if (
      !contexto.cuentaId ||
      contexto.cuentaId !== comando.cuentaId ||
      contexto.empresaId !== comando.empresaId
    ) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_CAMBIO_PROPIO_NO_AUTORIZADO',
        'Solo el titular autenticado puede realizar el cambio propio de su contraseña.',
      );
    }

    const cuenta = await this.repositorioCuentas.buscarPorId(comando.cuentaId);
    if (!cuenta || cuenta.empresaId !== comando.empresaId) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_CAMBIO_PROPIO_NO_AUTORIZADO',
        'Cuenta de Empresa no encontrada.',
      );
    }

    // 2. Verificar contraseña actual
    const esValida = await this.servicioCriptografia.verificarContrasenia(
      comando.contraseniaActual,
      cuenta.hashContrasenia,
    );
    if (!esValida) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_CAMBIO_PROPIO_NO_AUTORIZADO',
        'La contraseña actual ingresada es incorrecta.',
      );
    }

    // 3. Validar longitud de la nueva contraseña (ACC-BR-019)
    const contraseniaNuevaVO = new ContraseniaAcceso(comando.contraseniaNueva);

    // 4. Actualizar hash y versión de cuenta
    const nuevoHash = await this.servicioCriptografia.hashearContrasenia(
      contraseniaNuevaVO.valor,
    );
    cuenta.cambiarHashContrasenia(nuevoHash, contexto.actorId);
    await this.repositorioCuentas.actualizar(cuenta);

    // 5. Caducidad tras cambiar credenciales (ACC-BR-014): revocar todas las sesiones
    await this.repositorioSesiones.revocarTodasPorCuenta(
      cuenta.id,
      'Cambio propio de contraseña',
      contexto.actorId,
    );
  }
}
