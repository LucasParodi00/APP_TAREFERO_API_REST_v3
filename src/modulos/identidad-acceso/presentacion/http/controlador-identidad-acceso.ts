import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Headers,
  Res,
  HttpStatus,
  HttpException,
  Inject,
} from '@nestjs/common';
import type { Response } from 'express';
import { RegistrarSuperAdministrador } from '../../aplicacion/comandos/registrar-superadministrador.caso-de-uso';
import { ConsultarIntervencionesSoporte } from '../../aplicacion/consultas/consultar-intervenciones-soporte.caso-de-uso';
import { HabilitarCuentaEmpresa } from '../../aplicacion/comandos/habilitar-cuenta-empresa.caso-de-uso';
import { ConsultarCuentaEmpresa } from '../../aplicacion/consultas/consultar-cuenta-empresa.caso-de-uso';
import { ListarCuentasEmpresa } from '../../aplicacion/consultas/listar-cuentas-empresa.caso-de-uso';
import { ModificarHabilitacionCuenta } from '../../aplicacion/comandos/modificar-habilitacion-cuenta.caso-de-uso';
import { SuspenderCuentaEmpresa } from '../../aplicacion/comandos/suspender-cuenta-empresa.caso-de-uso';
import { ReactivarCuentaEmpresa } from '../../aplicacion/comandos/reactivar-cuenta-empresa.caso-de-uso';
import { IniciarSesionEmpresa } from '../../aplicacion/comandos/iniciar-sesion-empresa.caso-de-uso';
import { RenovarSesionEmpresa } from '../../aplicacion/comandos/renovar-sesion-empresa.caso-de-uso';
import { CambiarContraseniaPropia } from '../../aplicacion/comandos/cambiar-contrasenia-propia.caso-de-uso';
import { RestablecerContraseniaCuentaEmpresa } from '../../aplicacion/comandos/restablecer-contrasenia-cuenta-empresa.caso-de-uso';
import { SolicitudCrearSuperAdministradorDto } from './dto/solicitud-crear-superadministrador.dto';
import { ConsultaIntervencionesSoporteDto } from './dto/consulta-intervenciones-soporte.dto';
import { SolicitudHabilitarCuentaDto } from './dto/solicitud-habilitar-cuenta.dto';
import { SolicitudModificarHabilitacionDto } from './dto/solicitud-modificar-habilitacion.dto';
import { SolicitudInicioSesionEmpresaDto } from './dto/solicitud-inicio-sesion-empresa.dto';
import { SolicitudRenovacionSesionEmpresaDto } from './dto/solicitud-renovacion-sesion-empresa.dto';
import { SolicitudCambioContraseniaDto } from './dto/solicitud-cambio-contrasenia.dto';
import { SolicitudRestablecimientoContraseniaDto } from './dto/solicitud-restablecimiento-contrasenia.dto';
import {
  ContextoActorAcc,
  RolActorAcc,
} from '../../aplicacion/puertos/salida/contexto-actor-acc';
import type { RepositorioUsuariosPlataforma } from '../../aplicacion/puertos/salida/repositorio-usuarios-plataforma';
import type { ServicioCriptografia } from '../../aplicacion/puertos/salida/servicio-criptografia.puerto';

@Controller('api/v1')
export class ControladorIdentidadAcceso {
  constructor(
    private readonly registrarSuperAdminCasoDeUso: RegistrarSuperAdministrador,
    private readonly consultarIntervencionesCasoDeUso: ConsultarIntervencionesSoporte,
    @Inject('RepositorioUsuariosPlataforma')
    private readonly repositorioUsuarios: RepositorioUsuariosPlataforma,
    private readonly habilitarCuentaCasoDeUso: HabilitarCuentaEmpresa,
    private readonly consultarCuentaCasoDeUso: ConsultarCuentaEmpresa,
    private readonly listarCuentasCasoDeUso: ListarCuentasEmpresa,
    private readonly modificarHabilitacionCasoDeUso: ModificarHabilitacionCuenta,
    private readonly suspenderCuentaCasoDeUso: SuspenderCuentaEmpresa,
    private readonly reactivarCuentaCasoDeUso: ReactivarCuentaEmpresa,
    private readonly iniciarSesionCasoDeUso: IniciarSesionEmpresa,
    private readonly renovarSesionCasoDeUso: RenovarSesionEmpresa,
    private readonly cambiarContraseniaPropiaCasoDeUso: CambiarContraseniaPropia,
    private readonly restablecerContraseniaCasoDeUso: RestablecerContraseniaCuentaEmpresa,
    @Inject('ServicioCriptografia')
    private readonly servicioCriptografia: ServicioCriptografia,
  ) {}

  @Post('superadministradores')
  public async crearSuperAdministrador(
    @Body() body: SolicitudCrearSuperAdministradorDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const totalUsuarios = await this.repositorioUsuarios.contarTotal();

    let contexto: ContextoActorAcc;
    if (
      totalUsuarios === 0 &&
      (!actorRol || actorRol === 'PROCESO_INICIALIZACION')
    ) {
      contexto = {
        actorId: actorId ?? 'proceso-inicializacion',
        rol: 'PROCESO_INICIALIZACION',
      };
    } else {
      if (!actorId && !actorRol && !authHeader) {
        throw new HttpException(
          'Autenticación ausente o inválida',
          HttpStatus.UNAUTHORIZED,
        );
      }
      contexto = this.extraerContexto(
        actorId,
        actorRol,
        undefined,
        undefined,
        authHeader,
      );
    }

    const resultado = await this.registrarSuperAdminCasoDeUso.ejecutar(
      {
        rol: body?.rol,
        idempotencyKey,
      },
      contexto,
    );

    res.status(HttpStatus.CREATED).json(resultado);
  }

  @Get('empresas/:id/intervenciones-soporte')
  public async listarIntervencionesSoporte(
    @Param('id') empresaId: string,
    @Query() query: ConsultaIntervencionesSoporteDto,
    @Headers('motivo-soporte') motivoSoporteHeader: string | undefined,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-empresa-id') empresaIdHeader: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    if (!this.esUuidValido(empresaId)) {
      throw new HttpException(
        'El identificador de la empresa debe ser un UUID válido',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!actorId && !actorRol && !authHeader) {
      throw new HttpException(
        'Autenticación ausente o inválida',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const contexto = this.extraerContexto(
      actorId,
      actorRol,
      empresaIdHeader,
      undefined,
      authHeader,
    );
    const motivoSoporte = this.decodificarMotivoSoporte(motivoSoporteHeader);

    let limite: number | undefined = undefined;
    let desplazamiento: number | undefined = undefined;

    if (query.limite !== undefined) {
      limite = Number(query.limite);
      if (isNaN(limite) || limite < 1) {
        throw new HttpException(
          'El parámetro limite debe ser un número entero mayor a 0',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (query.desplazamiento !== undefined) {
      desplazamiento = Number(query.desplazamiento);
      if (isNaN(desplazamiento) || desplazamiento < 0) {
        throw new HttpException(
          'El parámetro desplazamiento debe ser un número entero mayor o igual a 0',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const resultado = await this.consultarIntervencionesCasoDeUso.ejecutar(
      {
        empresaId,
        motivoSoporte,
        limite,
        desplazamiento,
        orden: query.orden,
      },
      contexto,
    );

    res.status(HttpStatus.OK).json(resultado);
  }

  // --- PLAN-ACC-0002: Cuentas de Empresa ---

  @Post('empresas/:id/cuentas-empresa')
  public async habilitarCuentaEmpresa(
    @Param('id') empresaId: string,
    @Body() body: SolicitudHabilitarCuentaDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Headers('motivo-soporte') motivoSoporteHeader: string | undefined,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-empresa-id') empresaIdHeader: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    if (!this.esUuidValido(empresaId)) {
      throw new HttpException(
        'El identificador de la empresa debe ser un UUID válido',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!actorId && !actorRol && !authHeader) {
      throw new HttpException(
        'Autenticación ausente o inválida',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const contexto = this.extraerContexto(
      actorId,
      actorRol,
      empresaIdHeader,
      undefined,
      authHeader,
    );
    const motivoSoporte = this.decodificarMotivoSoporte(motivoSoporteHeader);

    const resultado = await this.habilitarCuentaCasoDeUso.ejecutar(
      {
        empresaId,
        personaId: body.personaId,
        correoAcceso: body.correoAcceso,
        contrasenia: body.contrasenia,
        accesoWeb: body.accesoWeb,
        accesoMovil: body.accesoMovil,
        roles: body.roles,
        idempotencyKey,
        motivoSoporte,
      },
      contexto,
    );

    res
      .status(HttpStatus.CREATED)
      .setHeader('ETag', `"acc-${resultado.version}"`)
      .setHeader('Cache-Control', 'no-store')
      .json(resultado);
  }

  @Get('empresas/:id/cuentas-empresa')
  public async listarCuentasEmpresa(
    @Param('id') empresaId: string,
    @Query('limite') limiteQuery: string | undefined,
    @Query('desplazamiento') desplazamientoQuery: string | undefined,
    @Headers('motivo-soporte') motivoSoporteHeader: string | undefined,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-empresa-id') empresaIdHeader: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    if (!this.esUuidValido(empresaId)) {
      throw new HttpException(
        'El identificador de la empresa debe ser un UUID válido',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!actorId && !actorRol && !authHeader) {
      throw new HttpException(
        'Autenticación ausente o inválida',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const contexto = this.extraerContexto(
      actorId,
      actorRol,
      empresaIdHeader,
      undefined,
      authHeader,
    );
    const motivoSoporte = this.decodificarMotivoSoporte(motivoSoporteHeader);

    const limite = limiteQuery !== undefined ? Number(limiteQuery) : undefined;
    const desplazamiento =
      desplazamientoQuery !== undefined
        ? Number(desplazamientoQuery)
        : undefined;

    const resultado = await this.listarCuentasCasoDeUso.ejecutar(
      {
        empresaId,
        limite,
        desplazamiento,
        motivoSoporte,
      },
      contexto,
    );

    res
      .status(HttpStatus.OK)
      .setHeader('Cache-Control', 'no-store')
      .json(resultado);
  }

  @Get('empresas/:id/cuentas-empresa/:cuentaId')
  public async consultarCuentaEmpresa(
    @Param('id') empresaId: string,
    @Param('cuentaId') cuentaId: string,
    @Headers('motivo-soporte') motivoSoporteHeader: string | undefined,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-empresa-id') empresaIdHeader: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    if (!this.esUuidValido(empresaId) || !this.esUuidValido(cuentaId)) {
      throw new HttpException(
        'Los identificadores deben ser UUIDs válidos',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!actorId && !actorRol && !authHeader) {
      throw new HttpException(
        'Autenticación ausente o inválida',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const contexto = this.extraerContexto(
      actorId,
      actorRol,
      empresaIdHeader,
      undefined,
      authHeader,
    );
    const motivoSoporte = this.decodificarMotivoSoporte(motivoSoporteHeader);

    const resultado = await this.consultarCuentaCasoDeUso.ejecutar(
      {
        empresaId,
        cuentaId,
        motivoSoporte,
      },
      contexto,
    );

    res
      .status(HttpStatus.OK)
      .setHeader('ETag', `"acc-${resultado.version}"`)
      .setHeader('Cache-Control', 'no-store')
      .json(resultado);
  }

  @Patch('empresas/:id/cuentas-empresa/:cuentaId')
  public async modificarHabilitacionCuenta(
    @Param('id') empresaId: string,
    @Param('cuentaId') cuentaId: string,
    @Body() body: SolicitudModificarHabilitacionDto,
    @Headers('if-match') ifMatch: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Headers('motivo-soporte') motivoSoporteHeader: string | undefined,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-empresa-id') empresaIdHeader: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    if (!this.esUuidValido(empresaId) || !this.esUuidValido(cuentaId)) {
      throw new HttpException(
        'Los identificadores deben ser UUIDs válidos',
        HttpStatus.BAD_REQUEST,
      );
    }

    const versionConocida = this.extraerVersion(ifMatch);
    const contexto = this.extraerContexto(
      actorId,
      actorRol,
      empresaIdHeader,
      undefined,
      authHeader,
    );
    const motivoSoporte = this.decodificarMotivoSoporte(motivoSoporteHeader);

    const resultado = await this.modificarHabilitacionCasoDeUso.ejecutar(
      {
        empresaId,
        cuentaId,
        versionConocida,
        roles: body.roles,
        accesoWeb: body.accesoWeb,
        accesoMovil: body.accesoMovil,
        idempotencyKey,
        motivoSoporte,
      },
      contexto,
    );

    res
      .status(HttpStatus.OK)
      .setHeader('ETag', `"acc-${resultado.version}"`)
      .setHeader('Cache-Control', 'no-store')
      .json(resultado);
  }

  @Post('empresas/:id/cuentas-empresa/:cuentaId/suspensiones')
  public async suspenderCuentaEmpresa(
    @Param('id') empresaId: string,
    @Param('cuentaId') cuentaId: string,
    @Headers('if-match') ifMatch: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Headers('motivo-soporte') motivoSoporteHeader: string | undefined,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-empresa-id') empresaIdHeader: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    if (!this.esUuidValido(empresaId) || !this.esUuidValido(cuentaId)) {
      throw new HttpException(
        'Los identificadores deben ser UUIDs válidos',
        HttpStatus.BAD_REQUEST,
      );
    }

    const versionConocida = this.extraerVersion(ifMatch);
    const contexto = this.extraerContexto(
      actorId,
      actorRol,
      empresaIdHeader,
      undefined,
      authHeader,
    );
    const motivoSoporte = this.decodificarMotivoSoporte(motivoSoporteHeader);

    const resultado = await this.suspenderCuentaCasoDeUso.ejecutar(
      {
        empresaId,
        cuentaId,
        versionConocida,
        idempotencyKey,
        motivoSoporte,
      },
      contexto,
    );

    res
      .status(HttpStatus.OK)
      .setHeader('ETag', `"acc-${resultado.version}"`)
      .setHeader('Cache-Control', 'no-store')
      .json(resultado);
  }

  @Post('empresas/:id/cuentas-empresa/:cuentaId/reactivaciones')
  public async reactivarCuentaEmpresa(
    @Param('id') empresaId: string,
    @Param('cuentaId') cuentaId: string,
    @Headers('if-match') ifMatch: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Headers('motivo-soporte') motivoSoporteHeader: string | undefined,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-empresa-id') empresaIdHeader: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    if (!this.esUuidValido(empresaId) || !this.esUuidValido(cuentaId)) {
      throw new HttpException(
        'Los identificadores deben ser UUIDs válidos',
        HttpStatus.BAD_REQUEST,
      );
    }

    const versionConocida = this.extraerVersion(ifMatch);
    const contexto = this.extraerContexto(
      actorId,
      actorRol,
      empresaIdHeader,
      undefined,
      authHeader,
    );
    const motivoSoporte = this.decodificarMotivoSoporte(motivoSoporteHeader);

    const resultado = await this.reactivarCuentaCasoDeUso.ejecutar(
      {
        empresaId,
        cuentaId,
        versionConocida,
        idempotencyKey,
        motivoSoporte,
      },
      contexto,
    );

    res
      .status(HttpStatus.OK)
      .setHeader('ETag', `"acc-${resultado.version}"`)
      .setHeader('Cache-Control', 'no-store')
      .json(resultado);
  }

  // --- PLAN-ACC-0003: Sesiones y Autorización ---

  @Post('sesiones-empresa')
  public async iniciarSesionEmpresa(
    @Body() body: SolicitudInicioSesionEmpresaDto,
    @Res() res: Response,
  ): Promise<void> {
    const resultado = await this.iniciarSesionCasoDeUso.ejecutar({
      aliasEmpresa: body.aliasEmpresa,
      correoAcceso: body.correoAcceso,
      contrasenia: body.contrasenia,
      canal: body.canal,
    });

    res
      .status(HttpStatus.OK)
      .setHeader('Cache-Control', 'no-store')
      .json(resultado);
  }

  @Post('sesiones-empresa/renovaciones')
  public async renovarSesionEmpresa(
    @Body() body: SolicitudRenovacionSesionEmpresaDto,
    @Res() res: Response,
  ): Promise<void> {
    const resultado = await this.renovarSesionCasoDeUso.ejecutar({
      tokenRenovacion: body.tokenRenovacion,
      canal: body.canal,
    });

    res
      .status(HttpStatus.OK)
      .setHeader('Cache-Control', 'no-store')
      .json(resultado);
  }

  @Post('empresas/:id/cuentas-empresa/:cuentaId/cambios-contrasenia')
  public async cambiarContraseniaPropia(
    @Param('id') empresaId: string,
    @Param('cuentaId') cuentaId: string,
    @Body() body: SolicitudCambioContraseniaDto,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-cuenta-id') cuentaIdHeader: string | undefined,
    @Headers('x-empresa-id') empresaIdHeader: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const contexto = this.extraerContexto(
      actorId,
      actorRol,
      empresaIdHeader,
      cuentaIdHeader,
      authHeader,
    );

    await this.cambiarContraseniaPropiaCasoDeUso.ejecutar(
      {
        empresaId,
        cuentaId,
        contraseniaActual: body.contraseniaActual,
        contraseniaNueva: body.contraseniaNueva,
      },
      contexto,
    );

    res
      .status(HttpStatus.NO_CONTENT)
      .setHeader('Cache-Control', 'no-store')
      .send();
  }

  @Post('empresas/:id/cuentas-empresa/:cuentaId/restablecimientos-contrasenia')
  public async restablecerContraseniaCuentaEmpresa(
    @Param('id') empresaId: string,
    @Param('cuentaId') cuentaId: string,
    @Body() body: SolicitudRestablecimientoContraseniaDto,
    @Headers('motivo-soporte') motivoSoporteHeader: string | undefined,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-empresa-id') empresaIdHeader: string | undefined,
    @Headers('authorization') authHeader: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const contexto = this.extraerContexto(
      actorId,
      actorRol,
      empresaIdHeader,
      undefined,
      authHeader,
    );
    const motivoSoporte = this.decodificarMotivoSoporte(motivoSoporteHeader);

    await this.restablecerContraseniaCasoDeUso.ejecutar(
      {
        empresaId,
        cuentaId,
        contraseniaNueva: body.contraseniaNueva,
        motivoSoporte,
      },
      contexto,
    );

    res
      .status(HttpStatus.NO_CONTENT)
      .setHeader('Cache-Control', 'no-store')
      .send();
  }

  private extraerContexto(
    actorId?: string,
    actorRol?: string,
    empresaId?: string,
    cuentaId?: string,
    authHeader?: string,
  ): ContextoActorAcc {
    // Si viene Bearer token en authHeader, resolver del token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = this.servicioCriptografia.verificarTokenAcceso(token);
      if (!payload) {
        throw new HttpException(
          'Token de acceso inválido o expirado',
          HttpStatus.UNAUTHORIZED,
        );
      }
      return {
        actorId: payload.cuentaId,
        cuentaId: payload.cuentaId,
        rol: (payload.roles[0] as RolActorAcc) ?? 'EMPLEADO',
        empresaId: payload.empresaId,
        sesionId: payload.sesionId,
      };
    }

    let rolNormalizado: RolActorAcc = 'EMPLEADO';

    if (
      actorRol?.toUpperCase() === 'SUPER_ADMINISTRADOR' ||
      actorRol === 'SuperAdministrador'
    ) {
      rolNormalizado = 'SUPER_ADMINISTRADOR';
    } else if (
      actorRol?.toUpperCase() === 'ADMINISTRADOR' ||
      actorRol === 'Administrador'
    ) {
      rolNormalizado = 'ADMINISTRADOR';
    } else if (
      actorRol?.toUpperCase() === 'CAPATAZ' ||
      actorRol === 'Capataz'
    ) {
      rolNormalizado = 'CAPATAZ';
    } else if (actorRol === 'PROCESO_INICIALIZACION') {
      rolNormalizado = 'PROCESO_INICIALIZACION';
    }

    return {
      actorId: actorId ?? 'anonimo',
      cuentaId: cuentaId ?? actorId,
      rol: rolNormalizado,
      empresaId,
    };
  }

  private extraerVersion(ifMatch?: string): number {
    if (!ifMatch) {
      throw new HttpException(
        'Cabecera If-Match requerida',
        HttpStatus.BAD_REQUEST,
      );
    }
    const limpio = ifMatch.replace(/"/g, '').replace(/^acc-/, '').trim();
    const version = Number(limpio);
    if (isNaN(version) || version < 1) {
      throw new HttpException(
        'La versión en If-Match debe ser un número entero mayor a 0',
        HttpStatus.BAD_REQUEST,
      );
    }
    return version;
  }

  private decodificarMotivoSoporte(motivoHeader?: string): string | undefined {
    if (!motivoHeader) return undefined;
    try {
      return decodeURIComponent(motivoHeader);
    } catch {
      return motivoHeader;
    }
  }

  private esUuidValido(id: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }
}
