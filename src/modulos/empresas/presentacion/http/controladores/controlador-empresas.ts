import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Param,
  Query,
  Body,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { randomUUID } from 'crypto';
import { RegistrarEmpresa } from '../../../aplicacion/comandos/registrar-empresa.caso-de-uso';
import { ConsultarEmpresa } from '../../../aplicacion/consultas/consultar-empresa.caso-de-uso';
import { ListarEmpresas } from '../../../aplicacion/consultas/listar-empresas.caso-de-uso';
import { ModificarEmpresa } from '../../../aplicacion/comandos/modificar-empresa.caso-de-uso';
import { ModificarConfiguracionGeneral } from '../../../aplicacion/comandos/modificar-configuracion-general.caso-de-uso';
import { SuspenderEmpresa } from '../../../aplicacion/comandos/suspender-empresa.caso-de-uso';
import { ReactivarEmpresa } from '../../../aplicacion/comandos/reactivar-empresa.caso-de-uso';
import { CerrarEmpresa } from '../../../aplicacion/comandos/cerrar-empresa.caso-de-uso';
import type { ContextoSolicitud } from '../../../aplicacion/puertos/comunes/contexto-solicitud';
import { ContextoUsuario } from '../decoradores/contexto-usuario.decorador';
import { VersionIfMatch } from '../decoradores/version-if-match.decorador';
import {
  SolicitudRegistrarEmpresaDto,
  SolicitudModificarEmpresaDto,
  SolicitudModificarConfiguracionGeneralDto,
  ConsultaListarEmpresasDto,
} from '../solicitudes';
import {
  EmpresaLectura,
  ResultadoListadoEmpresas,
} from '../../../aplicacion/modelos-lectura';

@Controller('empresas')
export class ControladorEmpresas {
  constructor(
    private readonly registrarEmpresa: RegistrarEmpresa,
    private readonly consultarEmpresa: ConsultarEmpresa,
    private readonly listarEmpresas: ListarEmpresas,
    private readonly modificarEmpresa: ModificarEmpresa,
    private readonly modificarConfiguracionGeneral: ModificarConfiguracionGeneral,
    private readonly suspenderEmpresa: SuspenderEmpresa,
    private readonly reactivarEmpresa: ReactivarEmpresa,
    private readonly cerrarEmpresa: CerrarEmpresa,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async registrar(
    @Body() dto: SolicitudRegistrarEmpresaDto,
    @ContextoUsuario() contexto: ContextoSolicitud,
    @Res({ passthrough: true }) res: Response,
  ): Promise<EmpresaLectura> {
    const id = randomUUID();
    const resultado = await this.registrarEmpresa.ejecutar(
      {
        id,
        nombre: dto.nombre,
        alias: dto.alias,
        cuit: dto.cuit,
        responsableNombre: dto.responsableNombre,
        ubicacionTexto: dto.ubicacionTexto,
        ubicacionGeografica: dto.ubicacionGeografica,
        descripcionActividad: dto.descripcionActividad,
        configuracionGeneralId: dto.configuracionGeneralId,
      },
      contexto,
    );

    res.setHeader('ETag', `"${resultado.version}"`);
    return resultado;
  }

  @Get()
  async listar(
    @Query() query: ConsultaListarEmpresasDto,
    @ContextoUsuario() contexto: ContextoSolicitud,
  ): Promise<ResultadoListadoEmpresas> {
    const pagina =
      query.desplazamiento !== undefined && query.limite
        ? Math.floor(query.desplazamiento / query.limite) + 1
        : 1;

    return this.listarEmpresas.ejecutar(
      {
        pagina,
        limite: query.limite ?? 25,
        estado: query.estado,
        nombre: query.nombre,
      },
      contexto,
    );
  }

  @Get(':idOAlias')
  async consultar(
    @Param('idOAlias') idOAlias: string,
    @ContextoUsuario() contexto: ContextoSolicitud,
    @Res({ passthrough: true }) res: Response,
  ): Promise<EmpresaLectura> {
    const resultado = await this.consultarEmpresa.ejecutar(
      { idOAlias },
      contexto,
    );
    res.setHeader('ETag', `"${resultado.version}"`);
    return resultado;
  }

  @Patch(':id')
  async modificar(
    @Param('id') id: string,
    @VersionIfMatch() versionEsperada: number,
    @Body() dto: SolicitudModificarEmpresaDto,
    @ContextoUsuario() contexto: ContextoSolicitud,
    @Res({ passthrough: true }) res: Response,
  ): Promise<EmpresaLectura> {
    const resultado = await this.modificarEmpresa.ejecutar(
      {
        id,
        versionEsperada,
        nombre: dto.nombre,
        cuit: dto.cuit,
        responsableNombre: dto.responsableNombre,
        ubicacionTexto: dto.ubicacionTexto,
        ubicacionGeografica: dto.ubicacionGeografica,
        descripcionActividad: dto.descripcionActividad,
      },
      contexto,
    );

    res.setHeader('ETag', `"${resultado.version}"`);
    return resultado;
  }

  @Post(':id/suspender')
  @HttpCode(HttpStatus.OK)
  async suspender(
    @Param('id') id: string,
    @VersionIfMatch() versionEsperada: number,
    @ContextoUsuario() contexto: ContextoSolicitud,
    @Res({ passthrough: true }) res: Response,
  ): Promise<EmpresaLectura> {
    const resultado = await this.suspenderEmpresa.ejecutar(
      { id, versionEsperada },
      contexto,
    );
    res.setHeader('ETag', `"${resultado.version}"`);
    return resultado;
  }

  @Post(':id/reactivar')
  @HttpCode(HttpStatus.OK)
  async reactivar(
    @Param('id') id: string,
    @VersionIfMatch() versionEsperada: number,
    @ContextoUsuario() contexto: ContextoSolicitud,
    @Res({ passthrough: true }) res: Response,
  ): Promise<EmpresaLectura> {
    const resultado = await this.reactivarEmpresa.ejecutar(
      { id, versionEsperada },
      contexto,
    );
    res.setHeader('ETag', `"${resultado.version}"`);
    return resultado;
  }

  @Post(':id/cerrar')
  @HttpCode(HttpStatus.OK)
  async cerrar(
    @Param('id') id: string,
    @VersionIfMatch() versionEsperada: number,
    @ContextoUsuario() contexto: ContextoSolicitud,
    @Res({ passthrough: true }) res: Response,
  ): Promise<EmpresaLectura> {
    const resultado = await this.cerrarEmpresa.ejecutar(
      { id, versionEsperada },
      contexto,
    );
    res.setHeader('ETag', `"${resultado.version}"`);
    return resultado;
  }

  @Put(':id/configuracion-general')
  async modificarConfiguracion(
    @Param('id') id: string,
    @VersionIfMatch() versionEsperada: number,
    @Body() dto: SolicitudModificarConfiguracionGeneralDto,
    @ContextoUsuario() contexto: ContextoSolicitud,
    @Res({ passthrough: true }) res: Response,
  ): Promise<EmpresaLectura> {
    const resultado = await this.modificarConfiguracionGeneral.ejecutar(
      {
        empresaId: id,
        versionEsperada,
        paisReferencia: dto.paisReferencia,
        zonaHoraria: dto.zonaHoraria,
        monedaPrincipal: dto.monedaPrincipal,
      },
      contexto,
    );

    res.setHeader('ETag', `"${resultado.version}"`);
    return resultado;
  }
}
