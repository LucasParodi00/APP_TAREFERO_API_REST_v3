/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'No se permiten dependencias circulares',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'dominio-agnostico',
      severity: 'error',
      comment: 'El Dominio debe ser puro: no puede depender de Aplicación, Infraestructura, Presentación, NestJS ni TypeORM',
      from: {
        path: '^src/modulos/[^/]+/dominio',
      },
      to: {
        pathNot: '^src/modulos/[^/]+/dominio',
      },
    },
    {
      name: 'aislamiento-entre-modulos',
      severity: 'error',
      comment: 'Un módulo no puede acceder directamente al Dominio o Infraestructura de otro módulo. Debe usar puertos públicos de Aplicación.',
      from: {
        path: '^src/modulos/([^/]+)/',
      },
      to: {
        path: '^src/modulos/([^/]+)/',
        pathNot: [
          '^src/modulos/$1/',
          '^src/modulos/[^/]+/aplicacion/puertos',
          '^src/modulos/[^/]+/publico',
        ],
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
