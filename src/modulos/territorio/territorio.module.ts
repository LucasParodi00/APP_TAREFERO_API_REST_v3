import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ChacraTypeOrmEntidad } from './infraestructura/persistencia/typeorm/entidades/chacra.typeorm-entidad';
import { RegistroIdempotenciaTerTypeOrmEntidad } from './infraestructura/persistencia/typeorm/entidades/registro-idempotencia-ter.typeorm-entidad';
import { RepositorioChacrasTypeOrm } from './infraestructura/persistencia/typeorm/repositorios/repositorio-chacras-typeorm';
import { GestorIdempotenciaTerTypeOrm } from './infraestructura/persistencia/typeorm/repositorios/gestor-idempotencia-ter-typeorm';
import { AdaptadorVerificadorEmpresaTer } from './infraestructura/adaptadores/adaptador-verificador-empresa-ter';
import { AdaptadorVerificadorLotesChacra } from './infraestructura/adaptadores/adaptador-verificador-lotes-chacra';
import { AdaptadorRegistradorIntervencionSoporteTer } from './infraestructura/adaptadores/adaptador-registrador-intervencion-soporte-ter';
import { RegistrarChacra } from './aplicacion/comandos/registrar-chacra.caso-de-uso';
import { ModificarChacra } from './aplicacion/comandos/modificar-chacra.caso-de-uso';
import { InactivarChacra } from './aplicacion/comandos/inactivar-chacra.caso-de-uso';
import { ControladorChacras } from './presentacion/http/controlador-chacras';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChacraTypeOrmEntidad,
      RegistroIdempotenciaTerTypeOrmEntidad,
    ]),
  ],
  controllers: [ControladorChacras],
  providers: [
    {
      provide: 'RepositorioChacras',
      useFactory: (dataSource: DataSource) =>
        new RepositorioChacrasTypeOrm(dataSource),
      inject: [DataSource],
    },
    {
      provide: 'GestorIdempotenciaTer',
      useFactory: (dataSource: DataSource) =>
        new GestorIdempotenciaTerTypeOrm(dataSource),
      inject: [DataSource],
    },
    {
      provide: 'VerificadorEmpresaPuertoTer',
      useFactory: (dataSource: DataSource) =>
        new AdaptadorVerificadorEmpresaTer(dataSource),
      inject: [DataSource],
    },
    {
      provide: 'VerificadorLotesChacraPuerto',
      useFactory: (dataSource: DataSource) =>
        new AdaptadorVerificadorLotesChacra(dataSource),
      inject: [DataSource],
    },
    {
      provide: 'RegistradorIntervencionSoporteTer',
      useFactory: (dataSource: DataSource) =>
        new AdaptadorRegistradorIntervencionSoporteTer(dataSource),
      inject: [DataSource],
    },
    {
      provide: RegistrarChacra,
      useFactory: (
        repo: RepositorioChacrasTypeOrm,
        verificadorEmpresa: AdaptadorVerificadorEmpresaTer,
        gestorIdemp: GestorIdempotenciaTerTypeOrm,
        registradorSoporte: AdaptadorRegistradorIntervencionSoporteTer,
      ) =>
        new RegistrarChacra(
          repo,
          verificadorEmpresa,
          gestorIdemp,
          registradorSoporte,
        ),
      inject: [
        'RepositorioChacras',
        'VerificadorEmpresaPuertoTer',
        'GestorIdempotenciaTer',
        'RegistradorIntervencionSoporteTer',
      ],
    },
    {
      provide: ModificarChacra,
      useFactory: (
        repo: RepositorioChacrasTypeOrm,
        verificadorEmpresa: AdaptadorVerificadorEmpresaTer,
        gestorIdemp: GestorIdempotenciaTerTypeOrm,
        registradorSoporte: AdaptadorRegistradorIntervencionSoporteTer,
      ) =>
        new ModificarChacra(
          repo,
          verificadorEmpresa,
          gestorIdemp,
          registradorSoporte,
        ),
      inject: [
        'RepositorioChacras',
        'VerificadorEmpresaPuertoTer',
        'GestorIdempotenciaTer',
        'RegistradorIntervencionSoporteTer',
      ],
    },
    {
      provide: InactivarChacra,
      useFactory: (
        repo: RepositorioChacrasTypeOrm,
        verificadorEmpresa: AdaptadorVerificadorEmpresaTer,
        verificadorLotes: AdaptadorVerificadorLotesChacra,
        gestorIdemp: GestorIdempotenciaTerTypeOrm,
        registradorSoporte: AdaptadorRegistradorIntervencionSoporteTer,
      ) =>
        new InactivarChacra(
          repo,
          verificadorEmpresa,
          verificadorLotes,
          gestorIdemp,
          registradorSoporte,
        ),
      inject: [
        'RepositorioChacras',
        'VerificadorEmpresaPuertoTer',
        'VerificadorLotesChacraPuerto',
        'GestorIdempotenciaTer',
        'RegistradorIntervencionSoporteTer',
      ],
    },
  ],
  exports: [
    'RepositorioChacras',
    RegistrarChacra,
    ModificarChacra,
    InactivarChacra,
  ],
})
export class TerritorioModule {}
