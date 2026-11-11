import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { IniciarSesion } from '../../aplicacion/comandos/iniciar-sesion.caso-de-uso';
import type { RespuestaLoginAplicacion } from '../../aplicacion/comandos/iniciar-sesion.caso-de-uso';
import { ConsultarAutorizacionVigente } from '../../aplicacion/consultas/consultar-autorizacion-vigente.caso-de-uso';
import type { RespuestaAutorizacionVigente } from '../../aplicacion/consultas/consultar-autorizacion-vigente.caso-de-uso';
import { RenovarSesion } from '../../aplicacion/comandos/renovar-sesion.caso-de-uso';
import { CambiarContrasenia } from '../../aplicacion/comandos/cambiar-contrasenia.caso-de-uso';
import { SolicitudLoginDto } from '../dtos/solicitud-login.dto';
import { SolicitudRenovarSesionDto } from '../dtos/solicitud-renovar-sesion.dto';
import { SolicitudCambiarContraseniaDto } from '../dtos/solicitud-cambiar-contrasenia.dto';
import { ContextoUsuario } from '../decoradores/contexto-usuario.decorador';
import type { ContextoSolicitud } from '../../aplicacion/puertos/contexto-solicitud';

@Controller('auth')
export class ControladorAutenticacion {
    constructor(
        private readonly iniciarSesionCasoDeUso: IniciarSesion,
        private readonly consultarAutorizacionVigenteCasoDeUso: ConsultarAutorizacionVigente,
        private readonly renovarSesionCasoDeUso: RenovarSesion,
        private readonly cambiarContraseniaCasoDeUso: CambiarContrasenia,
    ) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async iniciarSesion(@Body() dto: SolicitudLoginDto): Promise<RespuestaLoginAplicacion> {
        return this.iniciarSesionCasoDeUso.ejecutar({
            aliasEmpresa: dto.aliasEmpresa,
            correoAcceso: dto.correoAcceso,
            contrasenia: dto.contrasenia,
            canal: dto.canal,
            dispositivoId: dto.dispositivoId,
        });
    }

    @Get('yo')
    @HttpCode(HttpStatus.OK)
    async consultarAutorizacionVigente(@ContextoUsuario() contexto: ContextoSolicitud): Promise<RespuestaAutorizacionVigente> {
        return this.consultarAutorizacionVigenteCasoDeUso.ejecutar(contexto);
    }

    @Post('renovar')
    @HttpCode(HttpStatus.OK)
    async renovarSesion(@Body() dto: SolicitudRenovarSesionDto): Promise<RespuestaLoginAplicacion> {
        return this.renovarSesionCasoDeUso.ejecutar({
            tokenRenovacion: dto.tokenRenovacion,
        });
    }

    @Post('cambiar-contrasenia')
    @HttpCode(HttpStatus.NO_CONTENT)
    async cambiarContrasenia(
        @Body() dto: SolicitudCambiarContraseniaDto,
        @ContextoUsuario() contexto: ContextoSolicitud,
    ): Promise<void> {
        await this.cambiarContraseniaCasoDeUso.ejecutar(
            {
                contraseniaActual: dto.contraseniaActual,
                contraseniaNueva: dto.nuevaContrasenia,
            },
            contexto,
        );
    }
}
