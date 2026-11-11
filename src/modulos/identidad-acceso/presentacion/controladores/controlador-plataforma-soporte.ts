import { randomUUID } from 'crypto';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { InicializarSuperAdministrador } from '../../aplicacion/comandos/inicializar-super-administrador.caso-de-uso';
import { RegistrarIntervencionSoporte } from '../../aplicacion/comandos/registrar-intervencion-soporte.caso-de-uso';
import { ConsultarIntervencionesSoporte } from '../../aplicacion/consultas/consultar-intervenciones-soporte.caso-de-uso';
import { SolicitudInicializarPlataformaDto } from '../dtos/solicitud-inicializar-plataforma.dto';
import { SolicitudIntervencionSoporteDto } from '../dtos/solicitud-intervencion-soporte.dto';
import { FiltrosListadoIntervencionesDto } from '../dtos/filtros-listado-intervenciones.dto';
import { ContextoUsuario } from '../decoradores/contexto-usuario.decorador';
import type { ContextoSolicitud } from '../../aplicacion/puertos/contexto-solicitud';
import type {
    IntervencionSoporteLectura,
    ResultadoListadoIntervenciones,
} from '../../aplicacion/puertos/consulta-intervenciones-soporte.puerto';

@Controller()
export class ControladorPlataformaSoporte {
    constructor(
        private readonly inicializarSuperAdminCasoDeUso: InicializarSuperAdministrador,
        private readonly registrarIntervencionCasoDeUso: RegistrarIntervencionSoporte,
        private readonly consultarIntervencionesCasoDeUso: ConsultarIntervencionesSoporte,
    ) {}

    @Post('plataforma/inicializar')
    @HttpCode(HttpStatus.CREATED)
    async inicializarSuperAdministrador(@Body() dto: SolicitudInicializarPlataformaDto): Promise<{ mensaje: string }> {
        return this.inicializarSuperAdminCasoDeUso.ejecutar({
            claveSecretaBootstrapping: dto.claveSecretaBootstrapping,
            correoSuperAdmin: dto.correoSuperAdmin,
            contraseniaSuperAdmin: dto.contraseniaSuperAdmin,
        });
    }

    @Post('plataforma/empresas/:empresaId/intervenciones')
    @HttpCode(HttpStatus.CREATED)
    async registrarIntervencionSoporte(
        @Param('empresaId') empresaId: string,
        @Body() dto: SolicitudIntervencionSoporteDto,
        @ContextoUsuario() contexto: ContextoSolicitud,
    ): Promise<IntervencionSoporteLectura> {
        const solicitudId = randomUUID();
        return this.registrarIntervencionCasoDeUso.ejecutar(
            {
                empresaId,
                motivo: dto.motivo,
                solicitudId,
            },
            contexto,
        );
    }

    @Get('empresas/:empresaId/intervenciones-soporte')
    @HttpCode(HttpStatus.OK)
    async consultarIntervencionesSoporte(
        @Param('empresaId') empresaId: string,
        @Query() query: FiltrosListadoIntervencionesDto,
        @ContextoUsuario() contexto: ContextoSolicitud,
    ): Promise<ResultadoListadoIntervenciones> {
        return this.consultarIntervencionesCasoDeUso.ejecutar(
            empresaId,
            {
                limite: query.limite,
                desplazamiento: query.desplazamiento,
            },
            contexto,
        );
    }
}
