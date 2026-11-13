import { Controller, Get, Post, Patch, Param, Query, Body, Res, HttpCode, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import type { ContextoSolicitud, ResultadoPaginado } from '../../../../comun/aplicacion';
import { ContextoUsuario, VersionIfMatch, IdempotencyKey } from '../../../../comun/presentacion';
import { RegistrarChacraCasoDeUso } from '../../aplicacion/comandos/registrar-chacra.caso-de-uso';
import type { ResultadoRegistrarChacra } from '../../aplicacion/comandos/registrar-chacra.caso-de-uso';
import { ModificarChacraCasoDeUso } from '../../aplicacion/comandos/modificar-chacra.caso-de-uso';
import type { ResultadoModificarChacra } from '../../aplicacion/comandos/modificar-chacra.caso-de-uso';
import { InactivarChacraCasoDeUso } from '../../aplicacion/comandos/inactivar-chacra.caso-de-uso';
import type { ResultadoInactivarChacra } from '../../aplicacion/comandos/inactivar-chacra.caso-de-uso';
import { ConsultarChacraCasoDeUso } from '../../aplicacion/consultas/consultar-chacra.caso-de-uso';
import { ListarChacrasCasoDeUso } from '../../aplicacion/consultas/listar-chacras.caso-de-uso';
import type { ChacraDetalleLectura, ChacraResumenLectura } from '../../aplicacion/modelos-lectura';
import { RegistrarChacraDto, ModificarChacraDto, ListarChacrasDto } from '../dtos';

@Controller('chacras')
export class ControladorChacras {
    constructor(
        private readonly registrarChacraCasoDeUso: RegistrarChacraCasoDeUso,
        private readonly consultarChacraCasoDeUso: ConsultarChacraCasoDeUso,
        private readonly listarChacrasCasoDeUso: ListarChacrasCasoDeUso,
        private readonly modificarChacraCasoDeUso: ModificarChacraCasoDeUso,
        private readonly inactivarChacraCasoDeUso: InactivarChacraCasoDeUso,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async registrar(
        @Body() dto: RegistrarChacraDto,
        @ContextoUsuario() contexto: ContextoSolicitud,
        @Res({ passthrough: true }) res: Response,
        @IdempotencyKey() _idempotencyKey?: string,
    ): Promise<ResultadoRegistrarChacra> {
        void _idempotencyKey;
        const resultado = await this.registrarChacraCasoDeUso.ejecutar(dto, contexto);
        res.setHeader('ETag', `W/"${resultado.version}"`);
        return resultado;
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async consultar(
        @Param('id') id: string,
        @ContextoUsuario() contexto: ContextoSolicitud,
        @Res({ passthrough: true }) res: Response,
    ): Promise<ChacraDetalleLectura> {
        const resultado = await this.consultarChacraCasoDeUso.ejecutar(id, contexto);
        res.setHeader('ETag', `W/"${resultado.version}"`);
        return resultado;
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async listar(
        @Query() query: ListarChacrasDto,
        @ContextoUsuario() contexto: ContextoSolicitud,
    ): Promise<ResultadoPaginado<ChacraResumenLectura>> {
        return this.listarChacrasCasoDeUso.ejecutar(
            {
                limite: query.limite !== undefined ? Number(query.limite) : undefined,
                desplazamiento: query.desplazamiento !== undefined ? Number(query.desplazamiento) : undefined,
                estado: query.estado,
                orden: query.orden,
            },
            contexto,
        );
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async modificar(
        @Param('id') id: string,
        @Body() dto: ModificarChacraDto,
        @VersionIfMatch() versionEsperada: number,
        @ContextoUsuario() contexto: ContextoSolicitud,
        @Res({ passthrough: true }) res: Response,
    ): Promise<ResultadoModificarChacra> {
        const resultado = await this.modificarChacraCasoDeUso.ejecutar(
            {
                chacraId: id,
                versionEsperada,
                ...dto,
            },
            contexto,
        );
        res.setHeader('ETag', `W/"${resultado.version}"`);
        return resultado;
    }

    @Post(':id/inactivar')
    @HttpCode(HttpStatus.OK)
    async inactivar(
        @Param('id') id: string,
        @VersionIfMatch() versionEsperada: number,
        @ContextoUsuario() contexto: ContextoSolicitud,
        @Res({ passthrough: true }) res: Response,
        @IdempotencyKey() _idempotencyKey?: string,
    ): Promise<ResultadoInactivarChacra> {
        void _idempotencyKey;
        const resultado = await this.inactivarChacraCasoDeUso.ejecutar(
            {
                chacraId: id,
                versionEsperada,
            },
            contexto,
        );
        res.setHeader('ETag', `W/"${resultado.version}"`);
        return resultado;
    }
}
