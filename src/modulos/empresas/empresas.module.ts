import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EmpresaTypeOrmEntidad } from './infraestructura/persistencia/typeorm/entidades/empresa.typeorm-entidad';
import { ConfiguracionGeneralTypeOrmEntidad } from './infraestructura/persistencia/typeorm/entidades/configuracion-general.typeorm-entidad';
import { RepositorioEmpresasTypeOrm } from './infraestructura/persistencia/typeorm/repositorios/repositorio-empresas-typeorm';
import { VerificadorAsignacionComercialProvisional } from './infraestructura/adaptadores/verificador-asignacion-comercial-provisional';
import { RegistrarEmpresa } from './aplicacion/comandos/registrar-empresa.caso-de-uso';
import { ConsultarEmpresa } from './aplicacion/consultas/consultar-empresa.caso-de-uso';
import { ListarEmpresas } from './aplicacion/consultas/listar-empresas.caso-de-uso';
import { ModificarEmpresa } from './aplicacion/comandos/modificar-empresa.caso-de-uso';
import { ModificarConfiguracionGeneral } from './aplicacion/comandos/modificar-configuracion-general.caso-de-uso';
import { SuspenderEmpresa } from './aplicacion/comandos/suspender-empresa.caso-de-uso';
import { ReactivarEmpresa } from './aplicacion/comandos/reactivar-empresa.caso-de-uso';
import { CerrarEmpresa } from './aplicacion/comandos/cerrar-empresa.caso-de-uso';
import { ServicioReferenciaEmpresa } from './aplicacion/servicios/servicio-referencia-empresa';
import { ControladorEmpresas } from './presentacion/http/controlador-empresas';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmpresaTypeOrmEntidad,
      ConfiguracionGeneralTypeOrmEntidad,
    ]),
  ],
  controllers: [ControladorEmpresas],
  providers: [
    {
      provide: 'RepositorioEmpresas',
      useFactory: (dataSource: DataSource) =>
        new RepositorioEmpresasTypeOrm(dataSource),
      inject: [DataSource],
    },
    {
      provide: 'VerificadorAsignacionComercial',
      useClass: VerificadorAsignacionComercialProvisional,
    },
    {
      provide: RegistrarEmpresa,
      useFactory: (
        repo: RepositorioEmpresasTypeOrm,
        verificador: VerificadorAsignacionComercialProvisional,
      ) => new RegistrarEmpresa(repo, verificador),
      inject: ['RepositorioEmpresas', 'VerificadorAsignacionComercial'],
    },
    {
      provide: ConsultarEmpresa,
      useFactory: (repo: RepositorioEmpresasTypeOrm) =>
        new ConsultarEmpresa(repo),
      inject: ['RepositorioEmpresas'],
    },
    {
      provide: ListarEmpresas,
      useFactory: (repo: RepositorioEmpresasTypeOrm) =>
        new ListarEmpresas(repo),
      inject: ['RepositorioEmpresas'],
    },
    {
      provide: ModificarEmpresa,
      useFactory: (repo: RepositorioEmpresasTypeOrm) =>
        new ModificarEmpresa(repo),
      inject: ['RepositorioEmpresas'],
    },
    {
      provide: ModificarConfiguracionGeneral,
      useFactory: (repo: RepositorioEmpresasTypeOrm) =>
        new ModificarConfiguracionGeneral(repo),
      inject: ['RepositorioEmpresas'],
    },
    {
      provide: SuspenderEmpresa,
      useFactory: (repo: RepositorioEmpresasTypeOrm) =>
        new SuspenderEmpresa(repo),
      inject: ['RepositorioEmpresas'],
    },
    {
      provide: ReactivarEmpresa,
      useFactory: (repo: RepositorioEmpresasTypeOrm) =>
        new ReactivarEmpresa(repo),
      inject: ['RepositorioEmpresas'],
    },
    {
      provide: CerrarEmpresa,
      useFactory: (repo: RepositorioEmpresasTypeOrm) => new CerrarEmpresa(repo),
      inject: ['RepositorioEmpresas'],
    },
    {
      provide: 'PuertoReferenciaEmpresa',
      useFactory: (repo: RepositorioEmpresasTypeOrm) =>
        new ServicioReferenciaEmpresa(repo),
      inject: ['RepositorioEmpresas'],
    },
    {
      provide: ServicioReferenciaEmpresa,
      useFactory: (repo: RepositorioEmpresasTypeOrm) =>
        new ServicioReferenciaEmpresa(repo),
      inject: ['RepositorioEmpresas'],
    },
  ],
  exports: [ServicioReferenciaEmpresa, 'PuertoReferenciaEmpresa'],
})
export class EmpresasModule {}
