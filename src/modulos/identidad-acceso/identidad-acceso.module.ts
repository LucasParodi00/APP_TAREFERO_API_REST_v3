import { Module } from '@nestjs/common';
import { ControladorAutenticacion } from './presentacion/controladores/controlador-autenticacion';
import { ControladorCuentasEmpresa } from './presentacion/controladores/controlador-cuentas-empresa';
import { ControladorPlataformaSoporte } from './presentacion/controladores/controlador-plataforma-soporte';
import { AutenticacionGuard } from './presentacion/guardias/autenticacion.guard';

// Puertos y adaptadores de seguridad
import { GENERADOR_TOKENS } from './aplicacion/puertos/generador-tokens.puerto';
import type { GeneradorTokens } from './aplicacion/puertos/generador-tokens.puerto';
import { GeneradorTokensJose } from './infraestructura/seguridad/generador-tokens-jose';
import { SERVICIO_HASH } from './aplicacion/puertos/servicio-hash.puerto';
import type { ServicioHash } from './aplicacion/puertos/servicio-hash.puerto';
import { ServicioHashArgon2 } from './infraestructura/seguridad/servicio-hash-argon2';
import { RELOJ } from './aplicacion/puertos/reloj.puerto';
import type { Reloj } from './aplicacion/puertos/reloj.puerto';
import { RelojSistema } from './infraestructura/seguridad/reloj-sistema';

// Puertos y adaptadores de integración
import { RESOLVEDOR_EMPRESA } from './aplicacion/puertos/resolvedor-empresa.puerto';
import type { ResolvedorEmpresa } from './aplicacion/puertos/resolvedor-empresa.puerto';
import { ResolvedorEmpresaDesdeModuloEmpresas } from './infraestructura/adaptadores/resolvedor-empresa-desde-modulo-empresas';
import { RESOLVEDOR_EMPRESA_PUBLICO } from '../empresas/aplicacion/puertos/resolvedor-empresa-publico.puerto';
import type { ResolvedorEmpresaPublico } from '../empresas/aplicacion/puertos/resolvedor-empresa-publico.puerto';
import { VERIFICADOR_EMPLEADO } from './aplicacion/puertos/verificador-empleado.puerto';
import type { VerificadorEmpleado } from './aplicacion/puertos/verificador-empleado.puerto';
import { VerificadorEmpleadoProvisional } from './infraestructura/adaptadores/verificador-empleado-provisional';
import { VERIFICADOR_CUPO_ACCESO } from './aplicacion/puertos/verificador-cupo-acceso.puerto';
import type { VerificadorCupoAcceso } from './aplicacion/puertos/verificador-cupo-acceso.puerto';
import { VerificadorCupoAccesoProvisional } from './infraestructura/adaptadores/verificador-cupo-acceso-provisional';

// Repositorios y consultas
import { REPOSITORIO_CUENTAS_EMPRESA } from './dominio/repositorios/repositorio-cuentas-empresa';
import type { RepositorioCuentasEmpresa } from './dominio/repositorios/repositorio-cuentas-empresa';
import { REPOSITORIO_SESIONES } from './dominio/repositorios/repositorio-sesiones';
import type { RepositorioSesiones } from './dominio/repositorios/repositorio-sesiones';
import { REPOSITORIO_USUARIOS_PLATAFORMA } from './dominio/repositorios/repositorio-usuarios-plataforma';
import type { RepositorioUsuariosPlataforma } from './dominio/repositorios/repositorio-usuarios-plataforma';
import { REPOSITORIO_INTERVENCIONES_SOPORTE } from './dominio/repositorios/repositorio-intervenciones-soporte';
import type { RepositorioIntervencionesSoporte } from './dominio/repositorios/repositorio-intervenciones-soporte';
import { CONSULTA_CUENTAS_EMPRESA } from './aplicacion/puertos/consulta-cuentas-empresa.puerto';
import type { ConsultaCuentasEmpresa } from './aplicacion/puertos/consulta-cuentas-empresa.puerto';
import { CONSULTA_INTERVENCIONES_SOPORTE } from './aplicacion/puertos/consulta-intervenciones-soporte.puerto';
import type { ConsultaIntervencionesSoporte } from './aplicacion/puertos/consulta-intervenciones-soporte.puerto';

// Comandos
import { HabilitarCuentaEmpresa } from './aplicacion/comandos/habilitar-cuenta-empresa.caso-de-uso';
import { CambiarEstadoCuenta } from './aplicacion/comandos/cambiar-estado-cuenta.caso-de-uso';
import { ActualizarRolesCanalesCuenta } from './aplicacion/comandos/actualizar-roles-canales-cuenta.caso-de-uso';
import { VincularEmpleado } from './aplicacion/comandos/vincular-empleado.caso-de-uso';
import { IniciarSesion } from './aplicacion/comandos/iniciar-sesion.caso-de-uso';
import { RenovarSesion } from './aplicacion/comandos/renovar-sesion.caso-de-uso';
import { CambiarContrasenia } from './aplicacion/comandos/cambiar-contrasenia.caso-de-uso';
import { RestablecerContrasenia } from './aplicacion/comandos/restablecer-contrasenia.caso-de-uso';
import { InicializarSuperAdministrador } from './aplicacion/comandos/inicializar-super-administrador.caso-de-uso';
import { RegistrarIntervencionSoporte } from './aplicacion/comandos/registrar-intervencion-soporte.caso-de-uso';

// Consultas
import { ConsultarCuentasEmpresa } from './aplicacion/consultas/consultar-cuentas-empresa.caso-de-uso';
import { ConsultarAutorizacionVigente } from './aplicacion/consultas/consultar-autorizacion-vigente.caso-de-uso';
import { ConsultarIntervencionesSoporte } from './aplicacion/consultas/consultar-intervenciones-soporte.caso-de-uso';

@Module({
    controllers: [ControladorAutenticacion, ControladorCuentasEmpresa, ControladorPlataformaSoporte],
    providers: [
        // Adaptadores de infraestructura técnica
        {
            provide: SERVICIO_HASH,
            useClass: ServicioHashArgon2,
        },
        {
            provide: GENERADOR_TOKENS,
            useFactory: async (): Promise<GeneradorTokens> => {
                return await GeneradorTokensJose.crearConParGenerado();
            },
        },
        {
            provide: RELOJ,
            useClass: RelojSistema,
        },
        {
            provide: VERIFICADOR_EMPLEADO,
            useClass: VerificadorEmpleadoProvisional,
        },
        {
            provide: VERIFICADOR_CUPO_ACCESO,
            useClass: VerificadorCupoAccesoProvisional,
        },
        {
            provide: RESOLVEDOR_EMPRESA,
            useFactory: (resolvedorPublico: ResolvedorEmpresaPublico): ResolvedorEmpresa =>
                new ResolvedorEmpresaDesdeModuloEmpresas(resolvedorPublico),
            inject: [RESOLVEDOR_EMPRESA_PUBLICO],
        },

        // Casos de uso — Cuentas empresa
        {
            provide: HabilitarCuentaEmpresa,
            useFactory: (
                repoCuentas: RepositorioCuentasEmpresa,
                resolvedorEmpresa: ResolvedorEmpresa,
                verificadorCupo: VerificadorCupoAcceso,
                verificadorEmpleado: VerificadorEmpleado,
                servicioHash: ServicioHash,
            ): HabilitarCuentaEmpresa =>
                new HabilitarCuentaEmpresa(repoCuentas, resolvedorEmpresa, verificadorCupo, verificadorEmpleado, servicioHash),
            inject: [
                REPOSITORIO_CUENTAS_EMPRESA,
                RESOLVEDOR_EMPRESA,
                VERIFICADOR_CUPO_ACCESO,
                VERIFICADOR_EMPLEADO,
                SERVICIO_HASH,
            ],
        },
        {
            provide: ConsultarCuentasEmpresa,
            useFactory: (consulta: ConsultaCuentasEmpresa): ConsultarCuentasEmpresa => new ConsultarCuentasEmpresa(consulta),
            inject: [CONSULTA_CUENTAS_EMPRESA],
        },
        {
            provide: CambiarEstadoCuenta,
            useFactory: (
                repoCuentas: RepositorioCuentasEmpresa,
                repoSesiones: RepositorioSesiones,
                verificadorCupo: VerificadorCupoAcceso,
                reloj: Reloj,
            ): CambiarEstadoCuenta => new CambiarEstadoCuenta(repoCuentas, repoSesiones, verificadorCupo, reloj),
            inject: [REPOSITORIO_CUENTAS_EMPRESA, REPOSITORIO_SESIONES, VERIFICADOR_CUPO_ACCESO, RELOJ],
        },
        {
            provide: ActualizarRolesCanalesCuenta,
            useFactory: (repoCuentas: RepositorioCuentasEmpresa): ActualizarRolesCanalesCuenta =>
                new ActualizarRolesCanalesCuenta(repoCuentas),
            inject: [REPOSITORIO_CUENTAS_EMPRESA],
        },
        {
            provide: VincularEmpleado,
            useFactory: (repoCuentas: RepositorioCuentasEmpresa, verificadorEmpleado: VerificadorEmpleado): VincularEmpleado =>
                new VincularEmpleado(repoCuentas, verificadorEmpleado),
            inject: [REPOSITORIO_CUENTAS_EMPRESA, VERIFICADOR_EMPLEADO],
        },

        // Casos de uso — Autenticación y Autorización
        {
            provide: IniciarSesion,
            useFactory: (
                repoCuentas: RepositorioCuentasEmpresa,
                repoSesiones: RepositorioSesiones,
                resolvedorEmpresa: ResolvedorEmpresa,
                servicioHash: ServicioHash,
                generadorTokens: GeneradorTokens,
                reloj: Reloj,
            ): IniciarSesion =>
                new IniciarSesion(repoCuentas, repoSesiones, resolvedorEmpresa, servicioHash, generadorTokens, reloj),
            inject: [
                REPOSITORIO_CUENTAS_EMPRESA,
                REPOSITORIO_SESIONES,
                RESOLVEDOR_EMPRESA,
                SERVICIO_HASH,
                GENERADOR_TOKENS,
                RELOJ,
            ],
        },
        {
            provide: ConsultarAutorizacionVigente,
            useFactory: (
                repoCuentas: RepositorioCuentasEmpresa,
                repoSesiones: RepositorioSesiones,
                resolvedorEmpresa: ResolvedorEmpresa,
                reloj: Reloj,
            ): ConsultarAutorizacionVigente =>
                new ConsultarAutorizacionVigente(repoCuentas, repoSesiones, resolvedorEmpresa, reloj),
            inject: [REPOSITORIO_CUENTAS_EMPRESA, REPOSITORIO_SESIONES, RESOLVEDOR_EMPRESA, RELOJ],
        },
        {
            provide: RenovarSesion,
            useFactory: (
                repoSesiones: RepositorioSesiones,
                repoCuentas: RepositorioCuentasEmpresa,
                resolvedorEmpresa: ResolvedorEmpresa,
                servicioHash: ServicioHash,
                generadorTokens: GeneradorTokens,
                reloj: Reloj,
            ): RenovarSesion =>
                new RenovarSesion(repoSesiones, repoCuentas, resolvedorEmpresa, servicioHash, generadorTokens, reloj),
            inject: [
                REPOSITORIO_SESIONES,
                REPOSITORIO_CUENTAS_EMPRESA,
                RESOLVEDOR_EMPRESA,
                SERVICIO_HASH,
                GENERADOR_TOKENS,
                RELOJ,
            ],
        },
        {
            provide: CambiarContrasenia,
            useFactory: (
                repoCuentas: RepositorioCuentasEmpresa,
                repoSesiones: RepositorioSesiones,
                servicioHash: ServicioHash,
                reloj: Reloj,
            ): CambiarContrasenia => new CambiarContrasenia(repoCuentas, repoSesiones, servicioHash, reloj),
            inject: [REPOSITORIO_CUENTAS_EMPRESA, REPOSITORIO_SESIONES, SERVICIO_HASH, RELOJ],
        },
        {
            provide: RestablecerContrasenia,
            useFactory: (
                repoCuentas: RepositorioCuentasEmpresa,
                repoSesiones: RepositorioSesiones,
                servicioHash: ServicioHash,
                reloj: Reloj,
            ): RestablecerContrasenia => new RestablecerContrasenia(repoCuentas, repoSesiones, servicioHash, reloj),
            inject: [REPOSITORIO_CUENTAS_EMPRESA, REPOSITORIO_SESIONES, SERVICIO_HASH, RELOJ],
        },

        // Casos de uso — Plataforma y soporte
        {
            provide: InicializarSuperAdministrador,
            useFactory: (
                repoUsuarios: RepositorioUsuariosPlataforma,
                servicioHash: ServicioHash,
                reloj: Reloj,
            ): InicializarSuperAdministrador =>
                new InicializarSuperAdministrador(
                    repoUsuarios,
                    servicioHash,
                    reloj,
                    process.env.BOOTSTRAP_SECRET ?? 'superadmin-secret-bootstrap',
                ),
            inject: [REPOSITORIO_USUARIOS_PLATAFORMA, SERVICIO_HASH, RELOJ],
        },
        {
            provide: RegistrarIntervencionSoporte,
            useFactory: (
                repoIntervenciones: RepositorioIntervencionesSoporte,
                resolvedorEmpresa: ResolvedorEmpresa,
                reloj: Reloj,
            ): RegistrarIntervencionSoporte => new RegistrarIntervencionSoporte(repoIntervenciones, resolvedorEmpresa, reloj),
            inject: [REPOSITORIO_INTERVENCIONES_SOPORTE, RESOLVEDOR_EMPRESA, RELOJ],
        },
        {
            provide: ConsultarIntervencionesSoporte,
            useFactory: (consulta: ConsultaIntervencionesSoporte): ConsultarIntervencionesSoporte =>
                new ConsultarIntervencionesSoporte(consulta),
            inject: [CONSULTA_INTERVENCIONES_SOPORTE],
        },

        // Guardias
        AutenticacionGuard,
    ],
    exports: [
        AutenticacionGuard,
        GENERADOR_TOKENS,
        RESOLVEDOR_EMPRESA,
        SERVICIO_HASH,
        RELOJ,
        HabilitarCuentaEmpresa,
        ConsultarCuentasEmpresa,
        CambiarEstadoCuenta,
        ActualizarRolesCanalesCuenta,
        VincularEmpleado,
        IniciarSesion,
        ConsultarAutorizacionVigente,
        RenovarSesion,
        CambiarContrasenia,
        RestablecerContrasenia,
        InicializarSuperAdministrador,
        RegistrarIntervencionSoporte,
        ConsultarIntervencionesSoporte,
    ],
})
export class IdentidadAccesoModule {}
