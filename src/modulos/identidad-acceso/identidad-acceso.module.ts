import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type { PuertoReferenciaEmpresa } from '../empresas/aplicacion/puertos/entrada/referencia-empresa.puerto';
import { UsuarioPlataformaTypeOrmEntidad } from './infraestructura/persistencia/typeorm/entidades/usuario-plataforma.typeorm-entidad';
import { IntervencionSoporteTypeOrmEntidad } from './infraestructura/persistencia/typeorm/entidades/intervencion-soporte.typeorm-entidad';
import { RegistroIdempotenciaAccTypeOrmEntidad } from './infraestructura/persistencia/typeorm/entidades/registro-idempotencia-acc.typeorm-entidad';
import { CuentaEmpresaTypeOrmEntidad } from './infraestructura/persistencia/typeorm/entidades/cuenta-empresa.typeorm-entidad';
import { SesionEmpresaTypeOrmEntidad } from './infraestructura/persistencia/typeorm/entidades/sesion-empresa.typeorm-entidad';
import { HuellaRenovacionTypeOrmEntidad } from './infraestructura/persistencia/typeorm/entidades/huella-renovacion.typeorm-entidad';
import { RepositorioUsuariosPlataformaTypeOrm } from './infraestructura/persistencia/typeorm/repositorios/repositorio-usuarios-plataforma-typeorm';
import { RepositorioIntervencionesSoporteTypeOrm } from './infraestructura/persistencia/typeorm/repositorios/repositorio-intervenciones-soporte-typeorm';
import { GestorIdempotenciaAccTypeOrm } from './infraestructura/persistencia/typeorm/repositorios/gestor-idempotencia-acc-typeorm';
import { RepositorioCuentasEmpresaTypeOrm } from './infraestructura/persistencia/typeorm/repositorios/repositorio-cuentas-empresa-typeorm';
import { RepositorioSesionesEmpresaTypeOrm } from './infraestructura/persistencia/typeorm/repositorios/repositorio-sesiones-empresa-typeorm';
import { AdaptadorVerificadorEmpresa } from './infraestructura/adaptadores/adaptador-verificador-empresa';
import { AdaptadorCriptografiaNode } from './infraestructura/adaptadores/adaptador-criptografia-node';
import { AdaptadorElegibilidadComercialProvisional } from './infraestructura/adaptadores/adaptador-elegibilidad-comercial-provisional';
import { AdaptadorVerificadorPersonaProvisional } from './infraestructura/adaptadores/adaptador-verificador-persona-provisional';
import { RegistrarSuperAdministrador } from './aplicacion/comandos/registrar-superadministrador.caso-de-uso';
import { ResolverContextoSoporte } from './aplicacion/comandos/resolver-contexto-soporte.caso-de-uso';
import { ConsultarIntervencionesSoporte } from './aplicacion/consultas/consultar-intervenciones-soporte.caso-de-uso';
import { HabilitarCuentaEmpresa } from './aplicacion/comandos/habilitar-cuenta-empresa.caso-de-uso';
import { ConsultarCuentaEmpresa } from './aplicacion/consultas/consultar-cuenta-empresa.caso-de-uso';
import { ListarCuentasEmpresa } from './aplicacion/consultas/listar-cuentas-empresa.caso-de-uso';
import { ModificarHabilitacionCuenta } from './aplicacion/comandos/modificar-habilitacion-cuenta.caso-de-uso';
import { SuspenderCuentaEmpresa } from './aplicacion/comandos/suspender-cuenta-empresa.caso-de-uso';
import { ReactivarCuentaEmpresa } from './aplicacion/comandos/reactivar-cuenta-empresa.caso-de-uso';
import { IniciarSesionEmpresa } from './aplicacion/comandos/iniciar-sesion-empresa.caso-de-uso';
import { RenovarSesionEmpresa } from './aplicacion/comandos/renovar-sesion-empresa.caso-de-uso';
import { CambiarContraseniaPropia } from './aplicacion/comandos/cambiar-contrasenia-propia.caso-de-uso';
import { RestablecerContraseniaCuentaEmpresa } from './aplicacion/comandos/restablecer-contrasenia-cuenta-empresa.caso-de-uso';
import { ValidarAccesoVigente } from './aplicacion/consultas/validar-acceso-vigente.caso-de-uso';
import { ControladorIdentidadAcceso } from './presentacion/http/controlador-identidad-acceso';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsuarioPlataformaTypeOrmEntidad,
      IntervencionSoporteTypeOrmEntidad,
      RegistroIdempotenciaAccTypeOrmEntidad,
      CuentaEmpresaTypeOrmEntidad,
      SesionEmpresaTypeOrmEntidad,
      HuellaRenovacionTypeOrmEntidad,
    ]),
  ],
  controllers: [ControladorIdentidadAcceso],
  providers: [
    {
      provide: 'RepositorioUsuariosPlataforma',
      useFactory: (dataSource: DataSource) =>
        new RepositorioUsuariosPlataformaTypeOrm(
          dataSource.getRepository(UsuarioPlataformaTypeOrmEntidad),
        ),
      inject: [DataSource],
    },
    {
      provide: 'RepositorioIntervencionesSoporte',
      useFactory: (dataSource: DataSource) =>
        new RepositorioIntervencionesSoporteTypeOrm(
          dataSource.getRepository(IntervencionSoporteTypeOrmEntidad),
        ),
      inject: [DataSource],
    },
    {
      provide: 'GestorIdempotenciaAcc',
      useFactory: (dataSource: DataSource) =>
        new GestorIdempotenciaAccTypeOrm(
          dataSource.getRepository(RegistroIdempotenciaAccTypeOrmEntidad),
        ),
      inject: [DataSource],
    },
    {
      provide: 'RepositorioCuentasEmpresa',
      useFactory: (dataSource: DataSource) =>
        new RepositorioCuentasEmpresaTypeOrm(dataSource),
      inject: [DataSource],
    },
    {
      provide: 'RepositorioSesionesEmpresa',
      useFactory: (dataSource: DataSource) =>
        new RepositorioSesionesEmpresaTypeOrm(dataSource),
      inject: [DataSource],
    },
    {
      provide: 'ServicioCriptografia',
      useClass: AdaptadorCriptografiaNode,
    },
    {
      provide: 'VerificadorElegibilidadComercial',
      useClass: AdaptadorElegibilidadComercialProvisional,
    },
    {
      provide: 'VerificadorPersona',
      useClass: AdaptadorVerificadorPersonaProvisional,
    },
    {
      provide: 'VerificadorEmpresaPuerto',
      useFactory: (puertoReferencia: PuertoReferenciaEmpresa) =>
        new AdaptadorVerificadorEmpresa(puertoReferencia),
      inject: ['PuertoReferenciaEmpresa'],
    },
    {
      provide: RegistrarSuperAdministrador,
      useFactory: (
        repo: RepositorioUsuariosPlataformaTypeOrm,
        gestorIdemp: GestorIdempotenciaAccTypeOrm,
      ) => new RegistrarSuperAdministrador(repo, gestorIdemp),
      inject: ['RepositorioUsuariosPlataforma', 'GestorIdempotenciaAcc'],
    },
    {
      provide: ResolverContextoSoporte,
      useFactory: (
        repo: RepositorioIntervencionesSoporteTypeOrm,
        verificador: AdaptadorVerificadorEmpresa,
      ) => new ResolverContextoSoporte(repo, verificador),
      inject: ['RepositorioIntervencionesSoporte', 'VerificadorEmpresaPuerto'],
    },
    {
      provide: ConsultarIntervencionesSoporte,
      useFactory: (
        repo: RepositorioIntervencionesSoporteTypeOrm,
        verificador: AdaptadorVerificadorEmpresa,
        resolver: ResolverContextoSoporte,
      ) => new ConsultarIntervencionesSoporte(repo, verificador, resolver),
      inject: [
        'RepositorioIntervencionesSoporte',
        'VerificadorEmpresaPuerto',
        ResolverContextoSoporte,
      ],
    },
    {
      provide: HabilitarCuentaEmpresa,
      useFactory: (
        repoCuentas: RepositorioCuentasEmpresaTypeOrm,
        verificadorEmpresa: AdaptadorVerificadorEmpresa,
        verificadorPersona: AdaptadorVerificadorPersonaProvisional,
        verificadorElegibilidad: AdaptadorElegibilidadComercialProvisional,
        cripto: AdaptadorCriptografiaNode,
        repoIntervenciones: RepositorioIntervencionesSoporteTypeOrm,
        gestorIdemp: GestorIdempotenciaAccTypeOrm,
      ) =>
        new HabilitarCuentaEmpresa(
          repoCuentas,
          verificadorEmpresa,
          verificadorPersona,
          verificadorElegibilidad,
          cripto,
          repoIntervenciones,
          gestorIdemp,
        ),
      inject: [
        'RepositorioCuentasEmpresa',
        'VerificadorEmpresaPuerto',
        'VerificadorPersona',
        'VerificadorElegibilidadComercial',
        'ServicioCriptografia',
        'RepositorioIntervencionesSoporte',
        'GestorIdempotenciaAcc',
      ],
    },
    {
      provide: ConsultarCuentaEmpresa,
      useFactory: (
        repoCuentas: RepositorioCuentasEmpresaTypeOrm,
        repoIntervenciones: RepositorioIntervencionesSoporteTypeOrm,
      ) => new ConsultarCuentaEmpresa(repoCuentas, repoIntervenciones),
      inject: ['RepositorioCuentasEmpresa', 'RepositorioIntervencionesSoporte'],
    },
    {
      provide: ListarCuentasEmpresa,
      useFactory: (
        repoCuentas: RepositorioCuentasEmpresaTypeOrm,
        repoIntervenciones: RepositorioIntervencionesSoporteTypeOrm,
      ) => new ListarCuentasEmpresa(repoCuentas, repoIntervenciones),
      inject: ['RepositorioCuentasEmpresa', 'RepositorioIntervencionesSoporte'],
    },
    {
      provide: ModificarHabilitacionCuenta,
      useFactory: (
        repoCuentas: RepositorioCuentasEmpresaTypeOrm,
        repoIntervenciones: RepositorioIntervencionesSoporteTypeOrm,
        gestorIdemp: GestorIdempotenciaAccTypeOrm,
      ) =>
        new ModificarHabilitacionCuenta(
          repoCuentas,
          repoIntervenciones,
          gestorIdemp,
        ),
      inject: [
        'RepositorioCuentasEmpresa',
        'RepositorioIntervencionesSoporte',
        'GestorIdempotenciaAcc',
      ],
    },
    {
      provide: SuspenderCuentaEmpresa,
      useFactory: (
        repoCuentas: RepositorioCuentasEmpresaTypeOrm,
        repoIntervenciones: RepositorioIntervencionesSoporteTypeOrm,
        gestorIdemp: GestorIdempotenciaAccTypeOrm,
      ) =>
        new SuspenderCuentaEmpresa(
          repoCuentas,
          repoIntervenciones,
          gestorIdemp,
        ),
      inject: [
        'RepositorioCuentasEmpresa',
        'RepositorioIntervencionesSoporte',
        'GestorIdempotenciaAcc',
      ],
    },
    {
      provide: ReactivarCuentaEmpresa,
      useFactory: (
        repoCuentas: RepositorioCuentasEmpresaTypeOrm,
        verificadorElegibilidad: AdaptadorElegibilidadComercialProvisional,
        repoIntervenciones: RepositorioIntervencionesSoporteTypeOrm,
        gestorIdemp: GestorIdempotenciaAccTypeOrm,
      ) =>
        new ReactivarCuentaEmpresa(
          repoCuentas,
          verificadorElegibilidad,
          repoIntervenciones,
          gestorIdemp,
        ),
      inject: [
        'RepositorioCuentasEmpresa',
        'VerificadorElegibilidadComercial',
        'RepositorioIntervencionesSoporte',
        'GestorIdempotenciaAcc',
      ],
    },
    {
      provide: IniciarSesionEmpresa,
      useFactory: (
        repoCuentas: RepositorioCuentasEmpresaTypeOrm,
        repoSesiones: RepositorioSesionesEmpresaTypeOrm,
        verificadorEmpresa: AdaptadorVerificadorEmpresa,
        verificadorElegibilidad: AdaptadorElegibilidadComercialProvisional,
        cripto: AdaptadorCriptografiaNode,
      ) =>
        new IniciarSesionEmpresa(
          repoCuentas,
          repoSesiones,
          verificadorEmpresa,
          verificadorElegibilidad,
          cripto,
        ),
      inject: [
        'RepositorioCuentasEmpresa',
        'RepositorioSesionesEmpresa',
        'VerificadorEmpresaPuerto',
        'VerificadorElegibilidadComercial',
        'ServicioCriptografia',
      ],
    },
    {
      provide: RenovarSesionEmpresa,
      useFactory: (
        repoCuentas: RepositorioCuentasEmpresaTypeOrm,
        repoSesiones: RepositorioSesionesEmpresaTypeOrm,
        verificadorElegibilidad: AdaptadorElegibilidadComercialProvisional,
        cripto: AdaptadorCriptografiaNode,
      ) =>
        new RenovarSesionEmpresa(
          repoCuentas,
          repoSesiones,
          verificadorElegibilidad,
          cripto,
        ),
      inject: [
        'RepositorioCuentasEmpresa',
        'RepositorioSesionesEmpresa',
        'VerificadorElegibilidadComercial',
        'ServicioCriptografia',
      ],
    },
    {
      provide: CambiarContraseniaPropia,
      useFactory: (
        repoCuentas: RepositorioCuentasEmpresaTypeOrm,
        repoSesiones: RepositorioSesionesEmpresaTypeOrm,
        cripto: AdaptadorCriptografiaNode,
      ) => new CambiarContraseniaPropia(repoCuentas, repoSesiones, cripto),
      inject: [
        'RepositorioCuentasEmpresa',
        'RepositorioSesionesEmpresa',
        'ServicioCriptografia',
      ],
    },
    {
      provide: RestablecerContraseniaCuentaEmpresa,
      useFactory: (
        repoCuentas: RepositorioCuentasEmpresaTypeOrm,
        repoSesiones: RepositorioSesionesEmpresaTypeOrm,
        repoIntervenciones: RepositorioIntervencionesSoporteTypeOrm,
        cripto: AdaptadorCriptografiaNode,
      ) =>
        new RestablecerContraseniaCuentaEmpresa(
          repoCuentas,
          repoSesiones,
          repoIntervenciones,
          cripto,
        ),
      inject: [
        'RepositorioCuentasEmpresa',
        'RepositorioSesionesEmpresa',
        'RepositorioIntervencionesSoporte',
        'ServicioCriptografia',
      ],
    },
    {
      provide: ValidarAccesoVigente,
      useFactory: (
        repoCuentas: RepositorioCuentasEmpresaTypeOrm,
        repoSesiones: RepositorioSesionesEmpresaTypeOrm,
        verificadorEmpresa: AdaptadorVerificadorEmpresa,
        cripto: AdaptadorCriptografiaNode,
      ) =>
        new ValidarAccesoVigente(
          repoCuentas,
          repoSesiones,
          verificadorEmpresa,
          cripto,
        ),
      inject: [
        'RepositorioCuentasEmpresa',
        'RepositorioSesionesEmpresa',
        'VerificadorEmpresaPuerto',
        'ServicioCriptografia',
      ],
    },
  ],
  exports: [
    'RepositorioUsuariosPlataforma',
    'RepositorioCuentasEmpresa',
    'RepositorioSesionesEmpresa',
    'ServicioCriptografia',
    'VerificadorElegibilidadComercial',
    'VerificadorPersona',
    RegistrarSuperAdministrador,
    ResolverContextoSoporte,
    HabilitarCuentaEmpresa,
    ConsultarCuentaEmpresa,
    ListarCuentasEmpresa,
    IniciarSesionEmpresa,
    ValidarAccesoVigente,
  ],
})
export class IdentidadAccesoModule {}
