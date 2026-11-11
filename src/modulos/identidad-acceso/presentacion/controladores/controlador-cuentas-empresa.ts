import { randomUUID } from 'crypto';
import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Param, Patch, Post, Put, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { HabilitarCuentaEmpresa } from '../../aplicacion/comandos/habilitar-cuenta-empresa.caso-de-uso';
import { ConsultarCuentasEmpresa } from '../../aplicacion/consultas/consultar-cuentas-empresa.caso-de-uso';
import { RestablecerContrasenia } from '../../aplicacion/comandos/restablecer-contrasenia.caso-de-uso';
import { CambiarEstadoCuenta } from '../../aplicacion/comandos/cambiar-estado-cuenta.caso-de-uso';
import { ActualizarRolesCanalesCuenta } from '../../aplicacion/comandos/actualizar-roles-canales-cuenta.caso-de-uso';
import { VincularEmpleado } from '../../aplicacion/comandos/vincular-empleado.caso-de-uso';
import { SolicitudHabilitarCuentaDto } from '../dtos/solicitud-habilitar-cuenta.dto';
import { SolicitudRestablecerContraseniaDto } from '../dtos/solicitud-restablecer-contrasenia.dto';
import { SolicitudCambiarEstadoCuentaDto } from '../dtos/solicitud-cambiar-estado-cuenta.dto';
import { SolicitudActualizarRolesCanalesDto } from '../dtos/solicitud-actualizar-roles-canales.dto';
import { SolicitudVincularEmpleadoDto } from '../dtos/solicitud-vincular-empleado.dto';
import { FiltrosListadoCuentasDto } from '../dtos/filtros-listado-cuentas.dto';
import { ContextoUsuario } from '../decoradores/contexto-usuario.decorador';
import type { ContextoSolicitud } from '../../aplicacion/puertos/contexto-solicitud';
import type { CuentaEmpresaLectura, ResultadoListadoCuentas } from '../../aplicacion/puertos/consulta-cuentas-empresa.puerto';

@Controller('empresas/:empresaId/cuentas')
export class ControladorCuentasEmpresa {
    constructor(
        private readonly habilitarCuentaCasoDeUso: HabilitarCuentaEmpresa,
        private readonly consultarCuentasCasoDeUso: ConsultarCuentasEmpresa,
        private readonly restablecerContraseniaCasoDeUso: RestablecerContrasenia,
        private readonly cambiarEstadoCuentaCasoDeUso: CambiarEstadoCuenta,
        private readonly actualizarRolesCanalesCasoDeUso: ActualizarRolesCanalesCuenta,
        private readonly vincularEmpleadoCasoDeUso: VincularEmpleado,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async habilitarCuentaEmpresa(
        @Param('empresaId') empresaId: string,
        @Body() dto: SolicitudHabilitarCuentaDto,
        @ContextoUsuario() contexto: ContextoSolicitud,
        @Res({ passthrough: true }) res: Response,
    ): Promise<CuentaEmpresaLectura> {
        const id = randomUUID();
        const resultado = await this.habilitarCuentaCasoDeUso.ejecutar(
            {
                id,
                empresaId,
                empleadoId: dto.empleadoId,
                nombreMostrado: dto.nombreMostrado,
                correoAcceso: dto.correoAcceso,
                contrasenia: dto.contrasenia,
                accesoWeb: dto.accesoWeb,
                accesoMovil: dto.accesoMovil,
                roles: dto.roles,
            },
            contexto,
        );

        res.setHeader('ETag', `"${resultado.version}"`);
        return resultado;
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async consultarCuentasEmpresa(
        @Param('empresaId') empresaId: string,
        @Query() query: FiltrosListadoCuentasDto,
        @ContextoUsuario() contexto: ContextoSolicitud,
    ): Promise<ResultadoListadoCuentas> {
        return this.consultarCuentasCasoDeUso.ejecutar(
            empresaId,
            {
                limite: query.limite,
                desplazamiento: query.desplazamiento,
                estado: query.estado,
                rol: query.rol,
            },
            contexto,
        );
    }

    @Post(':cuentaId/restablecer-contrasenia')
    @HttpCode(HttpStatus.NO_CONTENT)
    async restablecerContrasenia(
        @Param('empresaId') empresaId: string,
        @Param('cuentaId') cuentaId: string,
        @Body() dto: SolicitudRestablecerContraseniaDto,
        @ContextoUsuario() contexto: ContextoSolicitud,
    ): Promise<{ mensaje: string }> {
        return this.restablecerContraseniaCasoDeUso.ejecutar(
            {
                empresaId,
                cuentaId,
                contraseniaNueva: dto.nuevaContrasenia,
            },
            contexto,
        );
    }

    @Patch(':cuentaId/estado')
    @HttpCode(HttpStatus.OK)
    async cambiarEstadoCuenta(
        @Param('empresaId') empresaId: string,
        @Param('cuentaId') cuentaId: string,
        @Body() dto: SolicitudCambiarEstadoCuentaDto,
        @Headers('if-match') ifMatch: string | undefined,
        @ContextoUsuario() contexto: ContextoSolicitud,
        @Res({ passthrough: true }) res: Response,
    ): Promise<CuentaEmpresaLectura> {
        const versionEsperada = ifMatch ? Number(ifMatch.replace(/["']/g, '')) : 1;

        const resultado = await this.cambiarEstadoCuentaCasoDeUso.ejecutar(
            {
                empresaId,
                cuentaId,
                nuevoEstado: dto.estado,
                versionEsperada,
            },
            contexto,
        );

        res.setHeader('ETag', `"${resultado.version}"`);
        return resultado;
    }

    @Put(':cuentaId/roles-canales')
    @HttpCode(HttpStatus.OK)
    async actualizarRolesCanalesCuenta(
        @Param('empresaId') empresaId: string,
        @Param('cuentaId') cuentaId: string,
        @Body() dto: SolicitudActualizarRolesCanalesDto,
        @Headers('if-match') ifMatch: string | undefined,
        @ContextoUsuario() contexto: ContextoSolicitud,
        @Res({ passthrough: true }) res: Response,
    ): Promise<CuentaEmpresaLectura> {
        const versionEsperada = ifMatch ? Number(ifMatch.replace(/["']/g, '')) : 1;

        const resultado = await this.actualizarRolesCanalesCasoDeUso.ejecutar(
            {
                empresaId,
                cuentaId,
                accesoWeb: dto.accesoWeb,
                accesoMovil: dto.accesoMovil,
                roles: dto.roles,
                versionEsperada,
            },
            contexto,
        );

        res.setHeader('ETag', `"${resultado.version}"`);
        return resultado;
    }

    @Post(':cuentaId/vincular-empleado')
    @HttpCode(HttpStatus.OK)
    async vincularEmpleado(
        @Param('empresaId') empresaId: string,
        @Param('cuentaId') cuentaId: string,
        @Body() dto: SolicitudVincularEmpleadoDto,
        @Headers('if-match') ifMatch: string | undefined,
        @ContextoUsuario() contexto: ContextoSolicitud,
        @Res({ passthrough: true }) res: Response,
    ): Promise<CuentaEmpresaLectura> {
        void ifMatch;
        const resultado = await this.vincularEmpleadoCasoDeUso.ejecutar(
            {
                empresaId,
                cuentaId,
                empleadoId: dto.empleadoId,
            },
            contexto,
        );

        res.setHeader('ETag', `"${resultado.version}"`);
        return resultado;
    }
}
