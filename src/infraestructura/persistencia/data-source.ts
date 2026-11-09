import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { EmpresaTypeOrmEntidad } from '../../modulos/empresas/infraestructura/persistencia/typeorm/entidades/empresa.typeorm-entidad';
import { ConfiguracionGeneralTypeOrmEntidad } from '../../modulos/empresas/infraestructura/persistencia/typeorm/entidades/configuracion-general.typeorm-entidad';
import { UsuarioPlataformaTypeOrmEntidad } from '../../modulos/identidad-acceso/infraestructura/persistencia/typeorm/entidades/usuario-plataforma.typeorm-entidad';
import { IntervencionSoporteTypeOrmEntidad } from '../../modulos/identidad-acceso/infraestructura/persistencia/typeorm/entidades/intervencion-soporte.typeorm-entidad';
import { RegistroIdempotenciaAccTypeOrmEntidad } from '../../modulos/identidad-acceso/infraestructura/persistencia/typeorm/entidades/registro-idempotencia-acc.typeorm-entidad';
import { ChacraTypeOrmEntidad } from '../../modulos/territorio/infraestructura/persistencia/typeorm/entidades/chacra.typeorm-entidad';
import { RegistroIdempotenciaTerTypeOrmEntidad } from '../../modulos/territorio/infraestructura/persistencia/typeorm/entidades/registro-idempotencia-ter.typeorm-entidad';
import { CultivoTypeOrmEntidad } from '../../modulos/contexto-productivo/infraestructura/persistencia/typeorm/entidades/cultivo.typeorm-entidad';
import { VariedadTypeOrmEntidad } from '../../modulos/contexto-productivo/infraestructura/persistencia/typeorm/entidades/variedad.typeorm-entidad';
import { PerfilCultivoTypeOrmEntidad } from '../../modulos/contexto-productivo/infraestructura/persistencia/typeorm/entidades/perfil-cultivo.typeorm-entidad';
import { CultivoHabilitadoEmpresaTypeOrmEntidad } from '../../modulos/contexto-productivo/infraestructura/persistencia/typeorm/entidades/cultivo-habilitado-empresa.typeorm-entidad';
import { RegistroIdempotenciaCulTypeOrmEntidad } from '../../modulos/contexto-productivo/infraestructura/persistencia/typeorm/entidades/registro-idempotencia-cul.typeorm-entidad';
import { CuentaEmpresaTypeOrmEntidad } from '../../modulos/identidad-acceso/infraestructura/persistencia/typeorm/entidades/cuenta-empresa.typeorm-entidad';
import { SesionEmpresaTypeOrmEntidad } from '../../modulos/identidad-acceso/infraestructura/persistencia/typeorm/entidades/sesion-empresa.typeorm-entidad';
import { HuellaRenovacionTypeOrmEntidad } from '../../modulos/identidad-acceso/infraestructura/persistencia/typeorm/entidades/huella-renovacion.typeorm-entidad';
import { CrearTablasEmpresas1731170000000 } from '../../../migraciones/empresas/1731170000000-crear-tablas-empresas';
import { CrearTablasIdentidadAcceso1731175000000 } from '../../../migraciones/identidad-acceso/1731175000000-crear-tablas-identidad-acceso';
import { CrearTablasCuentasYSesionesEmpresa1731190000000 } from '../../../migraciones/identidad-acceso/1731190000000-crear-tablas-cuentas-y-sesiones-empresa';
import { CrearTablasTerritorio1731180000000 } from '../../../migraciones/territorio/1731180000000-crear-tablas-territorio';
import { CrearTablasContextoProductivo1731185000000 } from '../../../migraciones/contexto-productivo/1731185000000-crear-tablas-contexto-productivo';

dotenv.config();

export const AppDataSource = new DataSource({
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
  migrations: [
    CrearTablasEmpresas1731170000000,
    CrearTablasIdentidadAcceso1731175000000,
    CrearTablasCuentasYSesionesEmpresa1731190000000,
    CrearTablasTerritorio1731180000000,
    CrearTablasContextoProductivo1731185000000,
  ],
  synchronize: false,
});
