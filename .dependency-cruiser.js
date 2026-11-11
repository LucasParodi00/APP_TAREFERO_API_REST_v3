/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'dominio-no-depende-de-otras-capas',
      comment: 'Dominio solo puede depender de sí mismo y librería estándar',
      severity: 'error',
      from: { path: '^src/modulos/[^/]+/dominio' },
      to: {
        path: [
          '^src/modulos/[^/]+/aplicacion',
          '^src/modulos/[^/]+/infraestructura',
          '^src/modulos/[^/]+/presentacion',
        ],
      },
    },
    {
      name: 'dominio-no-depende-de-frameworks',
      comment: 'Dominio no puede depender de NestJS ni TypeORM',
      severity: 'error',
      from: { path: '^src/modulos/[^/]+/dominio' },
      to: {
        path: ['^@nestjs', '^typeorm'],
      },
    },
    {
      name: 'aplicacion-no-depende-de-infraestructura-ni-presentacion',
      comment: 'Aplicación no puede depender de Infraestructura ni Presentación',
      severity: 'error',
      from: { path: '^src/modulos/[^/]+/aplicacion' },
      to: {
        path: [
          '^src/modulos/[^/]+/infraestructura',
          '^src/modulos/[^/]+/presentacion',
        ],
      },
    },
    {
      name: 'aplicacion-no-depende-de-typeorm',
      comment: 'Aplicación no puede depender de TypeORM',
      severity: 'error',
      from: { path: '^src/modulos/[^/]+/aplicacion' },
      to: {
        path: ['^typeorm'],
      },
    },
    {
      name: 'infraestructura-no-depende-de-presentacion',
      comment: 'Infraestructura no puede depender de Presentación',
      severity: 'error',
      from: { path: '^src/modulos/[^/]+/infraestructura' },
      to: {
        path: ['^src/modulos/[^/]+/presentacion'],
      },
    },
    {
      name: 'presentacion-no-depende-de-persistencia',
      comment: 'Presentación no puede depender directamente de persistencia concreta ni TypeORM',
      severity: 'error',
      from: { path: '^src/modulos/[^/]+/presentacion' },
      to: {
        path: ['^src/modulos/[^/]+/infraestructura/persistencia', '^typeorm'],
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
  },
};
