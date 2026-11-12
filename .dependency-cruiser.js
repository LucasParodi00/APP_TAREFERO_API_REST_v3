/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // --- Reglas para src/modulos ---
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
      from: { path: '^src/(modulos/[^/]+|comun)/dominio' },
      to: {
        path: ['^@nestjs', '^typeorm', '^uuid'],
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
      from: { path: '^src/(modulos/[^/]+|comun)/aplicacion' },
      to: {
        path: ['^typeorm', '^@nestjs', '^uuid'],
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

    // --- Reglas estrictas para src/comun (ADR-0012, arquitectura §6.1 y §17) ---
    {
      name: 'comun-no-depende-de-modulos',
      comment: 'src/comun nunca puede importar módulos funcionales (src/modulos)',
      severity: 'error',
      from: { path: '^src/comun' },
      to: {
        path: ['^src/modulos'],
      },
    },
    {
      name: 'comun-dominio-no-depende-de-otras-capas',
      comment: 'src/comun/dominio solo puede depender de sí mismo y librería estándar',
      severity: 'error',
      from: { path: '^src/comun/dominio' },
      to: {
        path: [
          '^src/comun/aplicacion',
          '^src/comun/infraestructura',
          '^src/comun/presentacion',
        ],
      },
    },
    {
      name: 'comun-aplicacion-no-depende-de-infra-ni-presentacion',
      comment: 'src/comun/aplicacion no puede depender de Infraestructura ni Presentación',
      severity: 'error',
      from: { path: '^src/comun/aplicacion' },
      to: {
        path: [
          '^src/comun/infraestructura',
          '^src/comun/presentacion',
        ],
      },
    },
    {
      name: 'comun-infraestructura-no-depende-de-presentacion',
      comment: 'src/comun/infraestructura no puede depender de Presentación',
      severity: 'error',
      from: { path: '^src/comun/infraestructura' },
      to: {
        path: ['^src/comun/presentacion'],
      },
    },

    // --- Reglas de importación desde módulos hacia src/comun ---
    {
      name: 'modulo-dominio-solo-usa-comun-dominio',
      comment: 'Dominio de un módulo solo puede importar de src/comun/dominio',
      severity: 'error',
      from: { path: '^src/modulos/[^/]+/dominio' },
      to: {
        path: [
          '^src/comun/aplicacion',
          '^src/comun/infraestructura',
          '^src/comun/presentacion',
        ],
      },
    },
    {
      name: 'modulo-aplicacion-no-usa-comun-infra-ni-presentacion',
      comment: 'Aplicación de un módulo no puede importar de src/comun/infraestructura ni src/comun/presentacion',
      severity: 'error',
      from: { path: '^src/modulos/[^/]+/aplicacion' },
      to: {
        path: [
          '^src/comun/infraestructura',
          '^src/comun/presentacion',
        ],
      },
    },
    {
      name: 'modulo-infraestructura-no-usa-comun-presentacion',
      comment: 'Infraestructura de un módulo no puede importar de src/comun/presentacion',
      severity: 'error',
      from: { path: '^src/modulos/[^/]+/infraestructura' },
      to: {
        path: ['^src/comun/presentacion'],
      },
    },
    {
      name: 'modulo-presentacion-no-usa-comun-infraestructura',
      comment: 'Presentación de un módulo no puede importar de src/comun/infraestructura',
      severity: 'error',
      from: { path: '^src/modulos/[^/]+/presentacion' },
      to: {
        path: ['^src/comun/infraestructura'],
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
