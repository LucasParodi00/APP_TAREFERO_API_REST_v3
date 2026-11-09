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
} from '@nestjs/common';
import type { Response } from 'express';
import { RegistrarEmpresa } from '../../aplicacion/comandos/registrar-empresa.caso-de-uso';
import { ConsultarEmpresa } from '../../aplicacion/consultas/consultar-empresa.caso-de-uso';
import { ListarEmpresas } from '../../aplicacion/consultas/listar-empresas.caso-de-uso';
import { ModificarEmpresa } from '../../aplicacion/comandos/modificar-empresa.caso-de-uso';
import { ModificarConfiguracionGeneral } from '../../aplicacion/comandos/modificar-configuracion-general.caso-de-uso';
import { SuspenderEmpresa } from '../../aplicacion/comandos/suspender-empresa.caso-de-uso';
import { ReactivarEmpresa } from '../../aplicacion/comandos/reactivar-empresa.caso-de-uso';
import { CerrarEmpresa } from '../../aplicacion/comandos/cerrar-empresa.caso-de-uso';
import { SolicitudRegistrarEmpresaDto } from './dto/solicitud-registrar-empresa.dto';
import { SolicitudModificarEmpresaDto } from './dto/solicitud-modificar-empresa.dto';
import { SolicitudModificarConfiguracionDto } from './dto/solicitud-modificar-configuracion.dto';
import {
  ContextoActor,
  RolActor,
} from '../../aplicacion/puertos/salida/contexto-actor';
import { EstadoEmpresa } from '../../dominio/enumeraciones/estado-empresa';
import { ErrorDominioEmpresa } from '../../dominio/errores/error-dominio-empresa';

@Controller('api/v1/empresas')
export class ControladorEmpresas {
  constructor(
    private readonly registrarEmpresaCasoDeUso: RegistrarEmpresa,
    private readonly consultarEmpresaCasoDeUso: ConsultarEmpresa,
    private readonly listarEmpresasCasoDeUso: ListarEmpresas,
    private readonly modificarEmpresaCasoDeUso: ModificarEmpresa,
    private readonly modificarConfiguracionCasoDeUso: ModificarConfiguracionGeneral,
    private readonly suspenderEmpresaCasoDeUso: SuspenderEmpresa,
    private readonly reactivarEmpresaCasoDeUso: ReactivarEmpresa,
    private readonly cerrarEmpresaCasoDeUso: CerrarEmpresa,
  ) {}

  @Post()
  public async registrarEmpresa(
    @Body() body: SolicitudRegistrarEmpresaDto,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const contexto = this.extraerContexto(actorId, actorRol);

    const resultado = await this.registrarEmpresaCasoDeUso.ejecutar(
      body,
      contexto,
    );

    // Obtener la empresa completa para retornar la respuesta esperada
    const empresaCompleta = await this.consultarEmpresaCasoDeUso.ejecutar(
      resultado.id,
      { actorId: contexto.actorId, rol: 'SuperAdministrador' },
    );

    res
      .status(HttpStatus.CREATED)
      .setHeader('Location', `/api/v1/empresas/${resultado.id}`)
      .setHeader('ETag', `"${empresaCompleta.version}"`)
      .setHeader(
        'ETag-Configuracion',
        `"${empresaCompleta.configuracion.version}"`,
      )
      .json(empresaCompleta);
  }

  @Get()
  public async listarEmpresas(
    @Query('limite') limiteStr: string | undefined,
    @Query('desplazamiento') desplazamientoStr: string | undefined,
    @Query('estado') estado: EstadoEmpresa | undefined,
    @Query('nombre') nombre: string | undefined,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
  ) {
    const contexto = this.extraerContexto(actorId, actorRol);
    const limite = limiteStr ? Number(limiteStr) : undefined;
    const desplazamiento = desplazamientoStr
      ? Number(desplazamientoStr)
      : undefined;

    return this.listarEmpresasCasoDeUso.ejecutar(
      {
        limite,
        desplazamiento,
        estado,
        nombre,
      },
      contexto,
    );
  }

  @Get(':id')
  public async consultarEmpresa(
    @Param('id') id: string,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-empresa-id') empresaId: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const contexto = this.extraerContexto(actorId, actorRol, empresaId);

    const resultado = await this.consultarEmpresaCasoDeUso.ejecutar(
      id,
      contexto,
    );

    res
      .status(HttpStatus.OK)
      .setHeader('ETag', `"${resultado.version}"`)
      .setHeader('ETag-Configuracion', `"${resultado.configuracion.version}"`)
      .json(resultado);
  }

  @Patch(':id')
  public async modificarEmpresa(
    @Param('id') id: string,
    @Body() body: SolicitudModificarEmpresaDto,
    @Headers('if-match') ifMatch: string | undefined,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-empresa-id') empresaId: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const contexto = this.extraerContexto(actorId, actorRol, empresaId);
    const versionConocida = this.extraerVersion(ifMatch);

    const resultado = await this.modificarEmpresaCasoDeUso.ejecutar(
      {
        id,
        versionConocida,
        nombre: body.nombre,
        alias: body.alias,
        cuit: body.cuit,
        responsableNombre: body.responsableNombre,
        ubicacionTexto: body.ubicacionTexto,
        ubicacionGeografica: body.ubicacionGeografica,
        descripcionActividad: body.descripcionActividad,
      },
      contexto,
    );

    const empresaCompleta = await this.consultarEmpresaCasoDeUso.ejecutar(
      resultado.id,
      { actorId: contexto.actorId, rol: 'SuperAdministrador' },
    );

    res
      .status(HttpStatus.OK)
      .setHeader('ETag', `"${empresaCompleta.version}"`)
      .setHeader(
        'ETag-Configuracion',
        `"${empresaCompleta.configuracion.version}"`,
      )
      .json(empresaCompleta);
  }

  @Post(':id/suspensiones')
  public async suspenderEmpresa(
    @Param('id') id: string,
    @Headers('if-match') ifMatch: string | undefined,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const contexto = this.extraerContexto(actorId, actorRol);
    const versionConocida = this.extraerVersion(ifMatch);

    const resultado = await this.suspenderEmpresaCasoDeUso.ejecutar(
      { id, versionConocida },
      contexto,
    );

    const empresaCompleta = await this.consultarEmpresaCasoDeUso.ejecutar(
      resultado.id,
      { actorId: contexto.actorId, rol: 'SuperAdministrador' },
    );

    res
      .status(HttpStatus.OK)
      .setHeader('ETag', `"${empresaCompleta.version}"`)
      .setHeader(
        'ETag-Configuracion',
        `"${empresaCompleta.configuracion.version}"`,
      )
      .json(empresaCompleta);
  }

  @Post(':id/reactivaciones')
  public async reactivarEmpresa(
    @Param('id') id: string,
    @Headers('if-match') ifMatch: string | undefined,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const contexto = this.extraerContexto(actorId, actorRol);
    const versionConocida = this.extraerVersion(ifMatch);

    const resultado = await this.reactivarEmpresaCasoDeUso.ejecutar(
      { id, versionConocida },
      contexto,
    );

    const empresaCompleta = await this.consultarEmpresaCasoDeUso.ejecutar(
      resultado.id,
      { actorId: contexto.actorId, rol: 'SuperAdministrador' },
    );

    res
      .status(HttpStatus.OK)
      .setHeader('ETag', `"${empresaCompleta.version}"`)
      .setHeader(
        'ETag-Configuracion',
        `"${empresaCompleta.configuracion.version}"`,
      )
      .json(empresaCompleta);
  }

  @Post(':id/cierres')
  public async cerrarEmpresa(
    @Param('id') id: string,
    @Headers('if-match') ifMatch: string | undefined,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const contexto = this.extraerContexto(actorId, actorRol);
    const versionConocida = this.extraerVersion(ifMatch);

    const resultado = await this.cerrarEmpresaCasoDeUso.ejecutar(
      { id, versionConocida },
      contexto,
    );

    const empresaCompleta = await this.consultarEmpresaCasoDeUso.ejecutar(
      resultado.id,
      { actorId: contexto.actorId, rol: 'SuperAdministrador' },
    );

    res
      .status(HttpStatus.OK)
      .setHeader('ETag', `"${empresaCompleta.version}"`)
      .setHeader(
        'ETag-Configuracion',
        `"${empresaCompleta.configuracion.version}"`,
      )
      .json(empresaCompleta);
  }

  @Patch(':id/configuracion-general')
  public async modificarConfiguracionGeneral(
    @Param('id') id: string,
    @Body() body: SolicitudModificarConfiguracionDto,
    @Headers('if-match') ifMatch: string | undefined,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-empresa-id') empresaId: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const contexto = this.extraerContexto(actorId, actorRol, empresaId);
    const versionConocida = this.extraerVersion(ifMatch);

    const resultado = await this.modificarConfiguracionCasoDeUso.ejecutar(
      {
        empresaId: id,
        versionConocida,
        paisReferencia: body.paisReferencia,
        zonaHoraria: body.zonaHoraria,
        monedaPrincipal: body.monedaPrincipal,
      },
      contexto,
    );

    res
      .status(HttpStatus.OK)
      .setHeader('ETag', `"${resultado.version}"`)
      .json(resultado);
  }

  private extraerContexto(
    actorId?: string,
    actorRol?: string,
    empresaId?: string,
  ): ContextoActor {
    const rol: RolActor =
      actorRol === 'SuperAdministrador'
        ? 'SuperAdministrador'
        : actorRol === 'Administrador'
          ? 'Administrador'
          : 'Invitado';

    return {
      actorId: actorId || 'actor-anonimo',
      rol,
      empresaId,
    };
  }

  private extraerVersion(ifMatch?: string): number {
    if (!ifMatch) {
      throw new ErrorDominioEmpresa(
        'EMP_VERSION_CONFLICTO',
        'Se requiere la cabecera If-Match con la versión conocida para modificar el recurso.',
      );
    }
    const limpio = ifMatch.replace(/["\s]/g, '');
    const num = Number(limpio);
    if (Number.isNaN(num)) {
      throw new ErrorDominioEmpresa(
        'EMP_VERSION_CONFLICTO',
        'El valor de la cabecera If-Match no es una versión numérica válida.',
      );
    }
    return num;
  }
}
