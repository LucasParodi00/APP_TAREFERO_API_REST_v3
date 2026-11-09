import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  Headers,
  Res,
  HttpStatus,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { RegistrarChacra } from '../../aplicacion/comandos/registrar-chacra.caso-de-uso';
import { ModificarChacra } from '../../aplicacion/comandos/modificar-chacra.caso-de-uso';
import { InactivarChacra } from '../../aplicacion/comandos/inactivar-chacra.caso-de-uso';
import { SolicitudRegistrarChacraDto } from './dto/solicitud-registrar-chacra.dto';
import { SolicitudModificarChacraDto } from './dto/solicitud-modificar-chacra.dto';
import { ContextoActorTer } from '../../aplicacion/puertos/salida/contexto-actor-ter';
import { randomUUID } from 'crypto';

@Controller('api/v1/empresas/:empresaId/chacras')
export class ControladorChacras {
  constructor(
    private readonly registrarChacraCasoDeUso: RegistrarChacra,
    private readonly modificarChacraCasoDeUso: ModificarChacra,
    private readonly inactivarChacraCasoDeUso: InactivarChacra,
  ) {}

  @Post()
  public async registrarChacra(
    @Param('empresaId', new ParseUUIDPipe()) empresaId: string,
    @Body() body: SolicitudRegistrarChacraDto,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-empresa-id') empresaContextoId: string | undefined,
    @Headers('x-request-id') requestId: string | undefined,
    @Headers('motivo-soporte') motivoSoporteHeader: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const contexto = this.extraerContexto(
      actorId,
      actorRol,
      empresaContextoId,
      requestId,
      motivoSoporteHeader,
    );

    const resultado = await this.registrarChacraCasoDeUso.ejecutar(
      empresaId,
      {
        ...body,
        idempotencyKey,
      },
      contexto,
    );

    res
      .status(HttpStatus.CREATED)
      .setHeader('ETag', `"chacra-${resultado.version}"`)
      .json(resultado);
  }

  @Patch(':id')
  public async modificarChacra(
    @Param('empresaId', new ParseUUIDPipe()) empresaId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: SolicitudModificarChacraDto,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-empresa-id') empresaContextoId: string | undefined,
    @Headers('x-request-id') requestId: string | undefined,
    @Headers('motivo-soporte') motivoSoporteHeader: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Headers('if-match') ifMatch: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const contexto = this.extraerContexto(
      actorId,
      actorRol,
      empresaContextoId,
      requestId,
      motivoSoporteHeader,
    );

    const versionEsperada = this.extraerVersionIfMatch(ifMatch);

    const resultado = await this.modificarChacraCasoDeUso.ejecutar(
      empresaId,
      id,
      {
        ...body,
        versionEsperada,
        idempotencyKey,
      },
      contexto,
    );

    res
      .status(HttpStatus.OK)
      .setHeader('ETag', `"chacra-${resultado.version}"`)
      .json(resultado);
  }

  @Post(':id/inactivaciones')
  public async inactivarChacra(
    @Param('empresaId', new ParseUUIDPipe()) empresaId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Headers('x-actor-id') actorId: string | undefined,
    @Headers('x-actor-rol') actorRol: string | undefined,
    @Headers('x-empresa-id') empresaContextoId: string | undefined,
    @Headers('x-request-id') requestId: string | undefined,
    @Headers('motivo-soporte') motivoSoporteHeader: string | undefined,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Headers('if-match') ifMatch: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const contexto = this.extraerContexto(
      actorId,
      actorRol,
      empresaContextoId,
      requestId,
      motivoSoporteHeader,
    );

    const versionEsperada = this.extraerVersionIfMatch(ifMatch);

    const resultado = await this.inactivarChacraCasoDeUso.ejecutar(
      empresaId,
      id,
      {
        versionEsperada,
        idempotencyKey,
      },
      contexto,
    );

    res
      .status(HttpStatus.OK)
      .setHeader('ETag', `"chacra-${resultado.version}"`)
      .json(resultado);
  }

  private extraerContexto(
    actorId?: string,
    actorRol?: string,
    empresaContextoId?: string,
    requestId?: string,
    motivoSoporteHeader?: string,
  ): ContextoActorTer {
    const motivoSoporte = motivoSoporteHeader
      ? decodeURIComponent(motivoSoporteHeader)
      : undefined;

    return {
      actorId: actorId ?? 'anonimo',
      rol: actorRol ?? 'INVITADO',
      empresaId: empresaContextoId,
      solicitudId: requestId ?? randomUUID(),
      motivoSoporte,
    };
  }

  private extraerVersionIfMatch(ifMatch?: string): number | undefined {
    if (!ifMatch) {
      return undefined;
    }
    const match = ifMatch.match(/^"chacra-([1-9][0-9]*)"$/);
    if (match) {
      return parseInt(match[1], 10);
    }
    const rawNum = parseInt(ifMatch.replace(/"/g, ''), 10);
    if (!Number.isNaN(rawNum)) {
      return rawNum;
    }
    throw new BadRequestException('Formato de If-Match inválido.');
  }
}
