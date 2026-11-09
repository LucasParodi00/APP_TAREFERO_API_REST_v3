import { randomUUID } from 'crypto';
import { RepositorioCuentasEmpresa } from '../puertos/salida/repositorio-cuentas-empresa';
import { RepositorioSesionesEmpresa } from '../puertos/salida/repositorio-sesiones-empresa';
import { RepositorioIntervencionesSoporte } from '../puertos/salida/repositorio-intervenciones-soporte';
import { ServicioCriptografia } from '../puertos/salida/servicio-criptografia.puerto';
import { ContextoActorAcc } from '../puertos/salida/contexto-actor-acc';
import { ContraseniaAcceso } from '../../dominio/objetos-valor/contrasenia-acceso';
import { MotivoSoporte } from '../../dominio/objetos-valor/motivo-soporte';
import { IntervencionSoporte } from '../../dominio/entidades/intervencion-soporte';
import { ErrorDominioIdentidadAcceso } from '../../dominio/errores/error-dominio-identidad-acceso';

export interface ComandoRestablecerContrasenia {
  empresaId: string;
  cuentaId: string;
  contraseniaNueva: string;
  motivoSoporte?: string;
}

export class RestablecerContraseniaCuentaEmpresa {
  constructor(
    private readonly repositorioCuentas: RepositorioCuentasEmpresa,
    private readonly repositorioSesiones: RepositorioSesionesEmpresa,
    private readonly repositorioIntervenciones: RepositorioIntervencionesSoporte,
    private readonly servicioCriptografia: ServicioCriptografia,
  ) {}

  public async ejecutar(
    comando: ComandoRestablecerContrasenia,
    contexto: ContextoActorAcc,
  ): Promise<void> {
    if (contexto.rol === 'SUPER_ADMINISTRADOR') {
      if (!comando.motivoSoporte) {
        throw new ErrorDominioIdentidadAcceso(
          'ACC_CONTEXTO_SOPORTE_REQUERIDO',
          'Se requiere indicar un motivo de soporte para restablecer la contraseña de la cuenta.',
        );
      }
    } else if (contexto.rol === 'ADMINISTRADOR') {
      if (!contexto.empresaId || contexto.empresaId !== comando.empresaId) {
        throw new ErrorDominioIdentidadAcceso(
          'ACC_RESTABLECIMIENTO_FUERA_DE_ALCANCE',
          'Un Administrador solo puede restablecer cuentas de su propia Empresa.',
        );
      }
    } else {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_ACCESO_DENEGADO',
        'No posee permisos para restablecer contraseñas de Empresa.',
      );
    }

    const cuenta = await this.repositorioCuentas.buscarPorId(comando.cuentaId);
    if (!cuenta || cuenta.empresaId !== comando.empresaId) {
      throw new ErrorDominioIdentidadAcceso(
        'ACC_CUENTA_NO_ENCONTRADA',
        `No se encontró la cuenta '${comando.cuentaId}' en la Empresa.`,
      );
    }

    // Validar nueva contraseña (ACC-BR-019)
    const contraseniaNuevaVO = new ContraseniaAcceso(comando.contraseniaNueva);

    const nuevoHash = await this.servicioCriptografia.hashearContrasenia(
      contraseniaNuevaVO.valor,
    );

    cuenta.cambiarHashContrasenia(nuevoHash, contexto.actorId);
    await this.repositorioCuentas.actualizar(cuenta);

    // Caducidad tras cambiar credenciales (ACC-BR-014): revocar todas las sesiones de la cuenta
    await this.repositorioSesiones.revocarTodasPorCuenta(
      cuenta.id,
      'Restablecimiento administrativo de contraseña',
      contexto.actorId,
    );

    if (contexto.rol === 'SUPER_ADMINISTRADOR' && comando.motivoSoporte) {
      const motivoVO = MotivoSoporte.crear(comando.motivoSoporte);
      const intervencion = IntervencionSoporte.crear({
        id: randomUUID(),
        usuarioPlataformaId: contexto.actorId,
        empresaId: comando.empresaId,
        motivo: motivoVO,
        sesionId: contexto.sesionId ?? 'sesion-soporte',
        solicitudId: contexto.solicitudId ?? randomUUID(),
      });
      await this.repositorioIntervenciones.guardar(intervencion);
    }
  }
}
