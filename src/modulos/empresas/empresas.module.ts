import { Module } from '@nestjs/common';
import { ControladorEmpresas } from './presentacion/http/controladores/controlador-empresas';
import { RegistrarEmpresa } from './aplicacion/comandos/registrar-empresa.caso-de-uso';
import { ConsultarEmpresa } from './aplicacion/consultas/consultar-empresa.caso-de-uso';
import { ListarEmpresas } from './aplicacion/consultas/listar-empresas.caso-de-uso';
import { ModificarEmpresa } from './aplicacion/comandos/modificar-empresa.caso-de-uso';
import { ModificarConfiguracionGeneral } from './aplicacion/comandos/modificar-configuracion-general.caso-de-uso';
import { SuspenderEmpresa } from './aplicacion/comandos/suspender-empresa.caso-de-uso';
import { ReactivarEmpresa } from './aplicacion/comandos/reactivar-empresa.caso-de-uso';
import { CerrarEmpresa } from './aplicacion/comandos/cerrar-empresa.caso-de-uso';
import { REPOSITORIO_EMPRESAS, RepositorioEmpresas } from './dominio/repositorios/repositorio-empresas';
import { CONSULTA_EMPRESAS, ConsultaEmpresas } from './aplicacion/puertos/consulta-empresas.puerto';
import {
    VERIFICADOR_ASIGNACION_COMERCIAL,
    VerificadorAsignacionComercial,
} from './aplicacion/puertos/verificador-asignacion-comercial.puerto';
import { AdaptadorAsignacionComercialProvisional } from './infraestructura/adaptadores/asignacion-comercial-provisional.adaptador';

@Module({
    controllers: [ControladorEmpresas],
    providers: [
        {
            provide: VERIFICADOR_ASIGNACION_COMERCIAL,
            useClass: AdaptadorAsignacionComercialProvisional,
        },
        {
            provide: RegistrarEmpresa,
            useFactory: (repo: RepositorioEmpresas, verificador: VerificadorAsignacionComercial) =>
                new RegistrarEmpresa(repo, verificador),
            inject: [REPOSITORIO_EMPRESAS, VERIFICADOR_ASIGNACION_COMERCIAL],
        },
        {
            provide: ConsultarEmpresa,
            useFactory: (consulta: ConsultaEmpresas) => new ConsultarEmpresa(consulta),
            inject: [CONSULTA_EMPRESAS],
        },
        {
            provide: ListarEmpresas,
            useFactory: (consulta: ConsultaEmpresas) => new ListarEmpresas(consulta),
            inject: [CONSULTA_EMPRESAS],
        },
        {
            provide: ModificarEmpresa,
            useFactory: (repo: RepositorioEmpresas) => new ModificarEmpresa(repo),
            inject: [REPOSITORIO_EMPRESAS],
        },
        {
            provide: ModificarConfiguracionGeneral,
            useFactory: (repo: RepositorioEmpresas) => new ModificarConfiguracionGeneral(repo),
            inject: [REPOSITORIO_EMPRESAS],
        },
        {
            provide: SuspenderEmpresa,
            useFactory: (repo: RepositorioEmpresas) => new SuspenderEmpresa(repo),
            inject: [REPOSITORIO_EMPRESAS],
        },
        {
            provide: ReactivarEmpresa,
            useFactory: (repo: RepositorioEmpresas) => new ReactivarEmpresa(repo),
            inject: [REPOSITORIO_EMPRESAS],
        },
        {
            provide: CerrarEmpresa,
            useFactory: (repo: RepositorioEmpresas) => new CerrarEmpresa(repo),
            inject: [REPOSITORIO_EMPRESAS],
        },
    ],
    exports: [
        RegistrarEmpresa,
        ConsultarEmpresa,
        ListarEmpresas,
        ModificarEmpresa,
        ModificarConfiguracionGeneral,
        SuspenderEmpresa,
        ReactivarEmpresa,
        CerrarEmpresa,
    ],
})
export class EmpresasModule {}
