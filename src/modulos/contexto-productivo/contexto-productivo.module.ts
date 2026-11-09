import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CultivoTypeOrmEntidad } from './infraestructura/persistencia/typeorm/entidades/cultivo.typeorm-entidad';
import { VariedadTypeOrmEntidad } from './infraestructura/persistencia/typeorm/entidades/variedad.typeorm-entidad';
import { PerfilCultivoTypeOrmEntidad } from './infraestructura/persistencia/typeorm/entidades/perfil-cultivo.typeorm-entidad';
import { CultivoHabilitadoEmpresaTypeOrmEntidad } from './infraestructura/persistencia/typeorm/entidades/cultivo-habilitado-empresa.typeorm-entidad';
import { RegistroIdempotenciaCulTypeOrmEntidad } from './infraestructura/persistencia/typeorm/entidades/registro-idempotencia-cul.typeorm-entidad';
import {
  REPOSITORIO_CULTIVOS,
  RepositorioCultivos,
} from './aplicacion/puertos/salida/repositorio-cultivos.puerto';
import {
  REPOSITORIO_VARIEDADES,
  RepositorioVariedades,
} from './aplicacion/puertos/salida/repositorio-variedades.puerto';
import {
  REPOSITORIO_PERFILES,
  RepositorioPerfiles,
} from './aplicacion/puertos/salida/repositorio-perfiles.puerto';
import { GESTOR_IDEMPOTENCIA_CUL } from './aplicacion/puertos/salida/gestor-idempotencia-cul.puerto';
import {
  PROVEEDOR_EMPRESA_CUL,
  ProveedorEmpresaCul,
} from './aplicacion/puertos/salida/proveedor-empresa-cul.puerto';
import {
  PROVEEDOR_LOTE_CUL,
  ProveedorLoteCul,
} from './aplicacion/puertos/salida/proveedor-lote-cul.puerto';
import {
  PROVEEDOR_UNIDAD_CUL,
  ProveedorUnidadCul,
} from './aplicacion/puertos/salida/proveedor-unidad-cul.puerto';
import {
  PROVEEDOR_HABILITACION_CULTIVO,
  ProveedorHabilitacionCultivo,
} from './aplicacion/puertos/salida/proveedor-habilitacion-cultivo.puerto';
import { RepositorioCultivosTypeOrm } from './infraestructura/persistencia/typeorm/repositorios/repositorio-cultivos.typeorm';
import { RepositorioVariedadesTypeOrm } from './infraestructura/persistencia/typeorm/repositorios/repositorio-variedades.typeorm';
import { RepositorioPerfilesTypeOrm } from './infraestructura/persistencia/typeorm/repositorios/repositorio-perfiles.typeorm';
import { GestorIdempotenciaCulTypeOrm } from './infraestructura/persistencia/typeorm/repositorios/gestor-idempotencia-cul.typeorm';
import { AdaptadorProveedorEmpresaCul } from './infraestructura/adaptadores/adaptador-proveedor-empresa-cul';
import { AdaptadorProveedorLoteCul } from './infraestructura/adaptadores/adaptador-proveedor-lote-cul';
import { AdaptadorProveedorUnidadCul } from './infraestructura/adaptadores/adaptador-proveedor-unidad-cul';
import { AdaptadorProveedorHabilitacionCultivo } from './infraestructura/adaptadores/adaptador-proveedor-habilitacion-cultivo';
import { RegistrarCultivoCasoDeUso } from './aplicacion/comandos/registrar-cultivo.caso-de-uso';
import { ListarCultivosCasoDeUso } from './aplicacion/consultas/listar-cultivos.caso-de-uso';
import { ConsultarCultivoCasoDeUso } from './aplicacion/consultas/consultar-cultivo.caso-de-uso';
import { InactivarCultivoCasoDeUso } from './aplicacion/comandos/inactivar-cultivo.caso-de-uso';
import { RegistrarVariedadCasoDeUso } from './aplicacion/comandos/registrar-variedad.caso-de-uso';
import { ListarVariedadesCasoDeUso } from './aplicacion/consultas/listar-variedades.caso-de-uso';
import { ConsultarVariedadCasoDeUso } from './aplicacion/consultas/consultar-variedad.caso-de-uso';
import { InactivarVariedadCasoDeUso } from './aplicacion/comandos/inactivar-variedad.caso-de-uso';
import { CrearBorradorPerfilCasoDeUso } from './aplicacion/comandos/crear-borrador-perfil.caso-de-uso';
import { ConsultarPerfilCasoDeUso } from './aplicacion/consultas/consultar-perfil.caso-de-uso';
import { EditarBorradorPerfilCasoDeUso } from './aplicacion/comandos/editar-borrador-perfil.caso-de-uso';
import { PublicarPerfilCasoDeUso } from './aplicacion/comandos/publicar-perfil.caso-de-uso';
import { InactivarPerfilCasoDeUso } from './aplicacion/comandos/inactivar-perfil.caso-de-uso';
import { ControladorCultivos } from './presentacion/http/controlador-cultivos';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CultivoTypeOrmEntidad,
      VariedadTypeOrmEntidad,
      PerfilCultivoTypeOrmEntidad,
      CultivoHabilitadoEmpresaTypeOrmEntidad,
      RegistroIdempotenciaCulTypeOrmEntidad,
    ]),
  ],
  controllers: [ControladorCultivos],
  providers: [
    // Repositorios y proveedores
    {
      provide: REPOSITORIO_CULTIVOS,
      useFactory: (ds: DataSource) => new RepositorioCultivosTypeOrm(ds),
      inject: [DataSource],
    },
    {
      provide: REPOSITORIO_VARIEDADES,
      useFactory: (ds: DataSource) => new RepositorioVariedadesTypeOrm(ds),
      inject: [DataSource],
    },
    {
      provide: REPOSITORIO_PERFILES,
      useFactory: (ds: DataSource) => new RepositorioPerfilesTypeOrm(ds),
      inject: [DataSource],
    },
    {
      provide: GESTOR_IDEMPOTENCIA_CUL,
      useFactory: (ds: DataSource) => new GestorIdempotenciaCulTypeOrm(ds),
      inject: [DataSource],
    },
    {
      provide: PROVEEDOR_EMPRESA_CUL,
      useFactory: (ds: DataSource) => new AdaptadorProveedorEmpresaCul(ds),
      inject: [DataSource],
    },
    {
      provide: PROVEEDOR_LOTE_CUL,
      useFactory: (ds: DataSource) => new AdaptadorProveedorLoteCul(ds),
      inject: [DataSource],
    },
    {
      provide: PROVEEDOR_UNIDAD_CUL,
      useFactory: (ds: DataSource) => new AdaptadorProveedorUnidadCul(ds),
      inject: [DataSource],
    },
    {
      provide: PROVEEDOR_HABILITACION_CULTIVO,
      useFactory: (ds: DataSource) =>
        new AdaptadorProveedorHabilitacionCultivo(ds),
      inject: [DataSource],
    },
    // Casos de uso con useFactory
    {
      provide: RegistrarCultivoCasoDeUso,
      useFactory: (repo: RepositorioCultivos) =>
        new RegistrarCultivoCasoDeUso(repo),
      inject: [REPOSITORIO_CULTIVOS],
    },
    {
      provide: ListarCultivosCasoDeUso,
      useFactory: (repo: RepositorioCultivos) =>
        new ListarCultivosCasoDeUso(repo),
      inject: [REPOSITORIO_CULTIVOS],
    },
    {
      provide: ConsultarCultivoCasoDeUso,
      useFactory: (repo: RepositorioCultivos) =>
        new ConsultarCultivoCasoDeUso(repo),
      inject: [REPOSITORIO_CULTIVOS],
    },
    {
      provide: InactivarCultivoCasoDeUso,
      useFactory: (repo: RepositorioCultivos) =>
        new InactivarCultivoCasoDeUso(repo),
      inject: [REPOSITORIO_CULTIVOS],
    },
    {
      provide: RegistrarVariedadCasoDeUso,
      useFactory: (repoC: RepositorioCultivos, repoV: RepositorioVariedades) =>
        new RegistrarVariedadCasoDeUso(repoC, repoV),
      inject: [REPOSITORIO_CULTIVOS, REPOSITORIO_VARIEDADES],
    },
    {
      provide: ListarVariedadesCasoDeUso,
      useFactory: (repoC: RepositorioCultivos, repoV: RepositorioVariedades) =>
        new ListarVariedadesCasoDeUso(repoC, repoV),
      inject: [REPOSITORIO_CULTIVOS, REPOSITORIO_VARIEDADES],
    },
    {
      provide: ConsultarVariedadCasoDeUso,
      useFactory: (repoC: RepositorioCultivos, repoV: RepositorioVariedades) =>
        new ConsultarVariedadCasoDeUso(repoC, repoV),
      inject: [REPOSITORIO_CULTIVOS, REPOSITORIO_VARIEDADES],
    },
    {
      provide: InactivarVariedadCasoDeUso,
      useFactory: (repoC: RepositorioCultivos, repoV: RepositorioVariedades) =>
        new InactivarVariedadCasoDeUso(repoC, repoV),
      inject: [REPOSITORIO_CULTIVOS, REPOSITORIO_VARIEDADES],
    },
    {
      provide: CrearBorradorPerfilCasoDeUso,
      useFactory: (
        repoC: RepositorioCultivos,
        repoP: RepositorioPerfiles,
        provE: ProveedorEmpresaCul,
        provL: ProveedorLoteCul,
        provU: ProveedorUnidadCul,
        provH: ProveedorHabilitacionCultivo,
      ) =>
        new CrearBorradorPerfilCasoDeUso(
          repoC,
          repoP,
          provE,
          provL,
          provU,
          provH,
        ),
      inject: [
        REPOSITORIO_CULTIVOS,
        REPOSITORIO_PERFILES,
        PROVEEDOR_EMPRESA_CUL,
        PROVEEDOR_LOTE_CUL,
        PROVEEDOR_UNIDAD_CUL,
        PROVEEDOR_HABILITACION_CULTIVO,
      ],
    },
    {
      provide: ConsultarPerfilCasoDeUso,
      useFactory: (repoP: RepositorioPerfiles) =>
        new ConsultarPerfilCasoDeUso(repoP),
      inject: [REPOSITORIO_PERFILES],
    },
    {
      provide: EditarBorradorPerfilCasoDeUso,
      useFactory: (repoP: RepositorioPerfiles, provU: ProveedorUnidadCul) =>
        new EditarBorradorPerfilCasoDeUso(repoP, provU),
      inject: [REPOSITORIO_PERFILES, PROVEEDOR_UNIDAD_CUL],
    },
    {
      provide: PublicarPerfilCasoDeUso,
      useFactory: (repoP: RepositorioPerfiles) =>
        new PublicarPerfilCasoDeUso(repoP),
      inject: [REPOSITORIO_PERFILES],
    },
    {
      provide: InactivarPerfilCasoDeUso,
      useFactory: (repoP: RepositorioPerfiles) =>
        new InactivarPerfilCasoDeUso(repoP),
      inject: [REPOSITORIO_PERFILES],
    },
  ],
  exports: [
    REPOSITORIO_CULTIVOS,
    REPOSITORIO_VARIEDADES,
    REPOSITORIO_PERFILES,
    RegistrarCultivoCasoDeUso,
    ListarCultivosCasoDeUso,
    ConsultarCultivoCasoDeUso,
    InactivarCultivoCasoDeUso,
    RegistrarVariedadCasoDeUso,
    ListarVariedadesCasoDeUso,
    ConsultarVariedadCasoDeUso,
    InactivarVariedadCasoDeUso,
    CrearBorradorPerfilCasoDeUso,
    ConsultarPerfilCasoDeUso,
    EditarBorradorPerfilCasoDeUso,
    PublicarPerfilCasoDeUso,
    InactivarPerfilCasoDeUso,
  ],
})
export class ContextoProductivoModule {}
