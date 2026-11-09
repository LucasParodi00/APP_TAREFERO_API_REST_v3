import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmpresasModule } from './modulos/empresas/empresas.module';
import { IdentidadAccesoModule } from './modulos/identidad-acceso/identidad-acceso.module';
import { TerritorioModule } from './modulos/territorio/territorio.module';
import { ContextoProductivoModule } from './modulos/contexto-productivo/contexto-productivo.module';
import { FiltroExcepcionesHttp } from './comun/filtros/filtro-excepciones-http';
import { EmpresaTypeOrmEntidad } from './modulos/empresas/infraestructura/persistencia/typeorm/entidades/empresa.typeorm-entidad';
import { ConfiguracionGeneralTypeOrmEntidad } from './modulos/empresas/infraestructura/persistencia/typeorm/entidades/configuracion-general.typeorm-entidad';
import { UsuarioPlataformaTypeOrmEntidad } from './modulos/identidad-acceso/infraestructura/persistencia/typeorm/entidades/usuario-plataforma.typeorm-entidad';
import { IntervencionSoporteTypeOrmEntidad } from './modulos/identidad-acceso/infraestructura/persistencia/typeorm/entidades/intervencion-soporte.typeorm-entidad';
import { RegistroIdempotenciaAccTypeOrmEntidad } from './modulos/identidad-acceso/infraestructura/persistencia/typeorm/entidades/registro-idempotencia-acc.typeorm-entidad';
import { ChacraTypeOrmEntidad } from './modulos/territorio/infraestructura/persistencia/typeorm/entidades/chacra.typeorm-entidad';
import { RegistroIdempotenciaTerTypeOrmEntidad } from './modulos/territorio/infraestructura/persistencia/typeorm/entidades/registro-idempotencia-ter.typeorm-entidad';
import { CultivoTypeOrmEntidad } from './modulos/contexto-productivo/infraestructura/persistencia/typeorm/entidades/cultivo.typeorm-entidad';
import { VariedadTypeOrmEntidad } from './modulos/contexto-productivo/infraestructura/persistencia/typeorm/entidades/variedad.typeorm-entidad';
import { PerfilCultivoTypeOrmEntidad } from './modulos/contexto-productivo/infraestructura/persistencia/typeorm/entidades/perfil-cultivo.typeorm-entidad';
import { CultivoHabilitadoEmpresaTypeOrmEntidad } from './modulos/contexto-productivo/infraestructura/persistencia/typeorm/entidades/cultivo-habilitado-empresa.typeorm-entidad';
import { RegistroIdempotenciaCulTypeOrmEntidad } from './modulos/contexto-productivo/infraestructura/persistencia/typeorm/entidades/registro-idempotencia-cul.typeorm-entidad';
import { CuentaEmpresaTypeOrmEntidad } from './modulos/identidad-acceso/infraestructura/persistencia/typeorm/entidades/cuenta-empresa.typeorm-entidad';
import { SesionEmpresaTypeOrmEntidad } from './modulos/identidad-acceso/infraestructura/persistencia/typeorm/entidades/sesion-empresa.typeorm-entidad';
import { HuellaRenovacionTypeOrmEntidad } from './modulos/identidad-acceso/infraestructura/persistencia/typeorm/entidades/huella-renovacion.typeorm-entidad';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'root',
      database: process.env.DB_NAME ?? 'TAREFERO_APP',
      entities: [
        EmpresaTypeOrmEntidad,
        ConfiguracionGeneralTypeOrmEntidad,
        UsuarioPlataformaTypeOrmEntidad,
        IntervencionSoporteTypeOrmEntidad,
        RegistroIdempotenciaAccTypeOrmEntidad,
        ChacraTypeOrmEntidad,
        RegistroIdempotenciaTerTypeOrmEntidad,
        CultivoTypeOrmEntidad,
        VariedadTypeOrmEntidad,
        PerfilCultivoTypeOrmEntidad,
        CultivoHabilitadoEmpresaTypeOrmEntidad,
        RegistroIdempotenciaCulTypeOrmEntidad,
        CuentaEmpresaTypeOrmEntidad,
        SesionEmpresaTypeOrmEntidad,
        HuellaRenovacionTypeOrmEntidad,
      ],
      synchronize: false,
    }),
    EmpresasModule,
    IdentidadAccesoModule,
    TerritorioModule,
    ContextoProductivoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: FiltroExcepcionesHttp,
    },
  ],
})
export class AppModule {}
