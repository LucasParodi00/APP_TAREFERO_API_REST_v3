import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  Headers,
  Res,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import type { Response } from 'express';
import { RegistrarCultivoCasoDeUso } from '../../aplicacion/comandos/registrar-cultivo.caso-de-uso';
import { ListarCultivosCasoDeUso } from '../../aplicacion/consultas/listar-cultivos.caso-de-uso';
import { ConsultarCultivoCasoDeUso } from '../../aplicacion/consultas/consultar-cultivo.caso-de-uso';
import { InactivarCultivoCasoDeUso } from '../../aplicacion/comandos/inactivar-cultivo.caso-de-uso';
import { RegistrarVariedadCasoDeUso } from '../../aplicacion/comandos/registrar-variedad.caso-de-uso';
import { ListarVariedadesCasoDeUso } from '../../aplicacion/consultas/listar-variedades.caso-de-uso';
import { ConsultarVariedadCasoDeUso } from '../../aplicacion/consultas/consultar-variedad.caso-de-uso';
import { InactivarVariedadCasoDeUso } from '../../aplicacion/comandos/inactivar-variedad.caso-de-uso';
import { CrearBorradorPerfilCasoDeUso } from '../../aplicacion/comandos/crear-borrador-perfil.caso-de-uso';
import { ConsultarPerfilCasoDeUso } from '../../aplicacion/consultas/consultar-perfil.caso-de-uso';
import { EditarBorradorPerfilCasoDeUso } from '../../aplicacion/comandos/editar-borrador-perfil.caso-de-uso';
import { PublicarPerfilCasoDeUso } from '../../aplicacion/comandos/publicar-perfil.caso-de-uso';
import { InactivarPerfilCasoDeUso } from '../../aplicacion/comandos/inactivar-perfil.caso-de-uso';
import { SolicitudCrearCultivoDto } from './dto/solicitud-crear-cultivo.dto';
import { SolicitudCrearVariedadDto } from './dto/solicitud-crear-variedad.dto';
import { SolicitudCrearBorradorPerfilDto } from './dto/solicitud-crear-borrador-perfil.dto';
import { SolicitudEditarBorradorPerfilDto } from './dto/solicitud-editar-borrador-perfil.dto';
import { ContextoActorContextoProductivo } from '../../aplicacion/puertos/salida/contexto-actor.puerto';
import { EstadoCultivo } from '../../dominio/enumeraciones/estado-cultivo';
import { EstadoVariedad } from '../../dominio/enumeraciones/estado-variedad';
import { Cultivo } from '../../dominio/entidades/cultivo';
import { Variedad } from '../../dominio/entidades/variedad';
import { PerfilCultivo } from '../../dominio/entidades/perfil-cultivo';

@Controller('api/v1/cultivos')
export class ControladorCultivos {
  public constructor(
    private readonly registrarCultivoUC: RegistrarCultivoCasoDeUso,
    private readonly listarCultivosUC: ListarCultivosCasoDeUso,
    private readonly consultarCultivoUC: ConsultarCultivoCasoDeUso,
    private readonly inactivarCultivoUC: InactivarCultivoCasoDeUso,
    private readonly registrarVariedadUC: RegistrarVariedadCasoDeUso,
    private readonly listarVariedadesUC: ListarVariedadesCasoDeUso,
    private readonly consultarVariedadUC: ConsultarVariedadCasoDeUso,
    private readonly inactivarVariedadUC: InactivarVariedadCasoDeUso,
    private readonly crearBorradorPerfilUC: CrearBorradorPerfilCasoDeUso,
    private readonly consultarPerfilUC: ConsultarPerfilCasoDeUso,
    private readonly editarBorradorPerfilUC: EditarBorradorPerfilCasoDeUso,
    private readonly publicarPerfilUC: PublicarPerfilCasoDeUso,
    private readonly inactivarPerfilUC: InactivarPerfilCasoDeUso,
  ) {}

  private resolverActor(
    actorId?: string,
    rol?: string,
    empresaId?: string,
  ): ContextoActorContextoProductivo {
    return {
      actorId: actorId || '00000000-0000-0000-0000-000000000001',
      rol: rol || 'SuperAdministrador',
      empresaId: empresaId || null,
    };
  }

  private extraerVersionIfMatch(ifMatch?: string): number | undefined {
    if (!ifMatch) return undefined;
    const limpia = ifMatch.replace(/"/g, '').trim();
    const version = parseInt(limpia, 10);
    return isNaN(version) ? undefined : version;
  }

  // --- CULTIVOS ---

  @Get()
  public async listarCultivos(
    @Query('limite') limiteStr?: string,
    @Query('desplazamiento') desplazamientoStr?: string,
    @Query('estado') estado?: string,
  ): Promise<Record<string, unknown>> {
    const limite = limiteStr ? parseInt(limiteStr, 10) : 20;
    const desplazamiento = desplazamientoStr
      ? parseInt(desplazamientoStr, 10)
      : 0;
    const estadoCultivo =
      estado && Object.values(EstadoCultivo).includes(estado as EstadoCultivo)
        ? (estado as EstadoCultivo)
        : undefined;

    const res = await this.listarCultivosUC.ejecutar({
      limite,
      desplazamiento,
      estado: estadoCultivo,
    });

    return {
      datos: res.datos.map((c) => this.serializarCultivo(c)),
      paginacion: {
        total: res.total,
        limite,
        desplazamiento,
      },
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async registrarCultivo(
    @Body() body: SolicitudCrearCultivoDto,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-empresa-id') empresaId: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, unknown>> {
    const actor = this.resolverActor(actorId, actorRol, empresaId);
    const cultivo = await this.registrarCultivoUC.ejecutar(
      {
        codigo: body.codigo,
        nombre: body.nombre,
        descripcion: body.descripcion,
      },
      actor,
    );
    res.setHeader('ETag', `"${cultivo.version}"`);
    return this.serializarCultivo(cultivo);
  }

  @Get(':cultivoId')
  public async consultarCultivo(
    @Param('cultivoId') cultivoId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, unknown>> {
    const cultivo = await this.consultarCultivoUC.ejecutar(cultivoId);
    res.setHeader('ETag', `"${cultivo.version}"`);
    return this.serializarCultivo(cultivo);
  }

  @Post(':cultivoId/inactivaciones')
  @HttpCode(HttpStatus.OK)
  public async inactivarCultivo(
    @Param('cultivoId') cultivoId: string,
    @Headers('if-match') ifMatch: string | undefined,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-empresa-id') empresaId: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, unknown>> {
    const actor = this.resolverActor(actorId, actorRol, empresaId);
    const versionEsperada = this.extraerVersionIfMatch(ifMatch) ?? 1;
    const cultivo = await this.inactivarCultivoUC.ejecutar(
      cultivoId,
      versionEsperada,
      actor,
    );
    res.setHeader('ETag', `"${cultivo.version}"`);
    return this.serializarCultivo(cultivo);
  }

  // --- VARIEDADES ---

  @Get(':cultivoId/variedades')
  public async listarVariedades(
    @Param('cultivoId') cultivoId: string,
    @Query('limite') limiteStr?: string,
    @Query('desplazamiento') desplazamientoStr?: string,
    @Query('estado') estado?: string,
  ): Promise<Record<string, unknown>> {
    const limite = limiteStr ? parseInt(limiteStr, 10) : 20;
    const desplazamiento = desplazamientoStr
      ? parseInt(desplazamientoStr, 10)
      : 0;
    const estadoVariedad =
      estado && Object.values(EstadoVariedad).includes(estado as EstadoVariedad)
        ? (estado as EstadoVariedad)
        : undefined;

    const res = await this.listarVariedadesUC.ejecutar(cultivoId, {
      limite,
      desplazamiento,
      estado: estadoVariedad,
    });

    return {
      datos: res.datos.map((v) => this.serializarVariedad(v)),
      paginacion: {
        total: res.total,
        limite,
        desplazamiento,
      },
    };
  }

  @Post(':cultivoId/variedades')
  @HttpCode(HttpStatus.CREATED)
  public async registrarVariedad(
    @Param('cultivoId') cultivoId: string,
    @Body() body: SolicitudCrearVariedadDto,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-empresa-id') empresaId: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, unknown>> {
    const actor = this.resolverActor(actorId, actorRol, empresaId);
    const variedad = await this.registrarVariedadUC.ejecutar(
      cultivoId,
      {
        codigo: body.codigo,
        nombre: body.nombre,
        descripcion: body.descripcion,
      },
      actor,
    );
    res.setHeader('ETag', `"${variedad.version}"`);
    return this.serializarVariedad(variedad);
  }

  @Get(':cultivoId/variedades/:variedadId')
  public async consultarVariedad(
    @Param('cultivoId') cultivoId: string,
    @Param('variedadId') variedadId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, unknown>> {
    const variedad = await this.consultarVariedadUC.ejecutar(
      cultivoId,
      variedadId,
    );
    res.setHeader('ETag', `"${variedad.version}"`);
    return this.serializarVariedad(variedad);
  }

  @Post(':cultivoId/variedades/:variedadId/inactivaciones')
  @HttpCode(HttpStatus.OK)
  public async inactivarVariedad(
    @Param('cultivoId') cultivoId: string,
    @Param('variedadId') variedadId: string,
    @Headers('if-match') ifMatch: string | undefined,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-empresa-id') empresaId: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, unknown>> {
    const actor = this.resolverActor(actorId, actorRol, empresaId);
    const versionEsperada = this.extraerVersionIfMatch(ifMatch) ?? 1;
    const variedad = await this.inactivarVariedadUC.ejecutar(
      cultivoId,
      variedadId,
      versionEsperada,
      actor,
    );
    res.setHeader('ETag', `"${variedad.version}"`);
    return this.serializarVariedad(variedad);
  }

  // --- PERFILES DE CULTIVO ---

  @Post(':cultivoId/perfiles-cultivo')
  @HttpCode(HttpStatus.CREATED)
  public async crearBorradorPerfil(
    @Param('cultivoId') cultivoId: string,
    @Body() body: SolicitudCrearBorradorPerfilDto,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-empresa-id') empresaId: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, unknown>> {
    const actor = this.resolverActor(actorId, actorRol, empresaId);

    let perfil: PerfilCultivo;
    if (body.versionOrigenId) {
      perfil = await this.crearBorradorPerfilUC.ejecutar(
        cultivoId,
        { versionOrigenId: body.versionOrigenId },
        actor,
      );
    } else {
      perfil = await this.crearBorradorPerfilUC.ejecutar(
        cultivoId,
        {
          alcance: body.alcance!,
          loteId: body.loteId,
          perfilPadreId: body.perfilPadreId,
          nombre: body.nombre!,
          descripcion: body.descripcion,
          campos: body.campos || [],
        },
        actor,
      );
    }

    res.setHeader('ETag', `"${perfil.version}"`);
    return this.serializarPerfil(perfil);
  }

  @Get(':cultivoId/perfiles-cultivo/:perfilId')
  public async consultarPerfil(
    @Param('cultivoId') cultivoId: string,
    @Param('perfilId') perfilId: string,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-empresa-id') empresaId: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, unknown>> {
    const actor = this.resolverActor(actorId, actorRol, empresaId);
    const perfil = await this.consultarPerfilUC.ejecutar(
      cultivoId,
      perfilId,
      actor,
    );
    res.setHeader('ETag', `"${perfil.version}"`);
    return this.serializarPerfil(perfil);
  }

  @Put(':cultivoId/perfiles-cultivo/:perfilId')
  @HttpCode(HttpStatus.OK)
  public async modificarBorradorPerfil(
    @Param('cultivoId') cultivoId: string,
    @Param('perfilId') perfilId: string,
    @Body() body: SolicitudEditarBorradorPerfilDto,
    @Headers('if-match') ifMatch: string | undefined,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-empresa-id') empresaId: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, unknown>> {
    const actor = this.resolverActor(actorId, actorRol, empresaId);
    const versionEsperada = this.extraerVersionIfMatch(ifMatch);
    const perfil = await this.editarBorradorPerfilUC.ejecutar(
      cultivoId,
      perfilId,
      {
        nombre: body.nombre,
        descripcion: body.descripcion,
        campos: body.campos,
      },
      actor,
      versionEsperada,
    );
    res.setHeader('ETag', `"${perfil.version}"`);
    return this.serializarPerfil(perfil);
  }

  @Post(':cultivoId/perfiles-cultivo/:perfilId/publicaciones')
  @HttpCode(HttpStatus.OK)
  public async publicarPerfil(
    @Param('cultivoId') cultivoId: string,
    @Param('perfilId') perfilId: string,
    @Headers('if-match') ifMatch: string | undefined,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-empresa-id') empresaId: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, unknown>> {
    const actor = this.resolverActor(actorId, actorRol, empresaId);
    const versionEsperada = this.extraerVersionIfMatch(ifMatch);
    const perfil = await this.publicarPerfilUC.ejecutar(
      cultivoId,
      perfilId,
      actor,
      versionEsperada,
    );
    res.setHeader('ETag', `"${perfil.version}"`);
    return this.serializarPerfil(perfil);
  }

  @Post(':cultivoId/perfiles-cultivo/:perfilId/inactivaciones')
  @HttpCode(HttpStatus.OK)
  public async inactivarPerfil(
    @Param('cultivoId') cultivoId: string,
    @Param('perfilId') perfilId: string,
    @Headers('if-match') ifMatch: string | undefined,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-empresa-id') empresaId: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Record<string, unknown>> {
    const actor = this.resolverActor(actorId, actorRol, empresaId);
    const versionEsperada = this.extraerVersionIfMatch(ifMatch);
    const perfil = await this.inactivarPerfilUC.ejecutar(
      cultivoId,
      perfilId,
      actor,
      versionEsperada,
    );
    res.setHeader('ETag', `"${perfil.version}"`);
    return this.serializarPerfil(perfil);
  }

  // --- SERIALIZACIÓN ---

  private serializarCultivo(cultivo: Cultivo): Record<string, unknown> {
    return {
      id: cultivo.id,
      codigo: cultivo.codigo,
      nombre: cultivo.nombre,
      descripcion: cultivo.descripcion,
      estado: cultivo.estado,
      version: cultivo.version,
      fechaCreacion: cultivo.fechaCreacion.toISOString(),
      fechaActualizacion: cultivo.fechaActualizacion.toISOString(),
    };
  }

  private serializarVariedad(variedad: Variedad): Record<string, unknown> {
    return {
      id: variedad.id,
      cultivoId: variedad.cultivoId,
      codigo: variedad.codigo,
      nombre: variedad.nombre,
      descripcion: variedad.descripcion,
      estado: variedad.estado,
      version: variedad.version,
      fechaCreacion: variedad.fechaCreacion.toISOString(),
      fechaActualizacion: variedad.fechaActualizacion.toISOString(),
    };
  }

  private serializarPerfil(perfil: PerfilCultivo): Record<string, unknown> {
    return {
      id: perfil.id,
      cultivoId: perfil.cultivoId,
      alcance: perfil.alcance,
      empresaId: perfil.empresaId,
      loteId: perfil.loteId,
      perfilPadreId: perfil.perfilPadreId,
      nombre: perfil.nombre,
      descripcion: perfil.descripcion,
      campos: perfil.campos.map((c) => ({
        codigo: c.codigo,
        nombre: c.nombre,
        descripcion: c.descripcion,
        destino: c.destino,
        tipo: c.tipo,
        obligatorio: c.obligatorio,
        unidadId: c.unidadId,
        validaciones: c.validaciones,
      })),
      version: perfil.version,
      estado: perfil.estado,
    };
  }
}
