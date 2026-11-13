---
type: plan
id: PLAN-CMN-0002
title: "Implementar bootstrap compartido de persistencia y PostGIS"
module: "CMN"
task: CMN-TASK-002
status: En verificación
mode: estandar
created: 2026-11-13
updated: 2026-11-13
approved_by: "Ingeniero — 2026-11-13"
---

# PLAN-CMN-0002 — Implementar bootstrap compartido de persistencia y PostGIS

## 1. Objetivo y alcance

- **Tarea:** `CMN-TASK-002`.
- **Implementa:** `ADR-0003`, `ADR-0014`, arquitectura.md §6.1, §7, §9–§10 y convenciones.md §6.1.
- **Resultado observable:** la aplicación dispone de una sola conexión TypeORM/`pg`, configurada con `synchronize: false`; ejecuta migraciones reales; verifica PostGIS al iniciar o migrar; ofrece una unidad transaccional técnica sin exponer TypeORM a Dominio o Aplicación; y permite pruebas aisladas sobre PostgreSQL/PostGIS real.
- **No incluye:** tablas, entidades, repositorios o reglas funcionales de ACC, EMP, TER u otros módulos; geometrías de Lotes; registros de idempotencia; acceso cruzado a tablas; una librería PostGIS para Node.js.
- **Consumidores iniciales:** `PLAN-TER-0001`, `PLAN-TER-0002`, `PLAN-ACC-0002` y `PLAN-CMN-0003`.

## 2. Preparación

- Fuentes leídas: `AGENTS.md`, `doc/arquitectura.md`, `doc/convenciones.md`, `doc/adr/ADR-0003-modularizacion-independiente.md`, `doc/adr/ADR-0014-coordinacion-transaccional-entre-modulos.md`, `doc/comun/comun.task.md`, `doc/comun/planes/PLAN-CMN-0001-nucleo-comun-transversal.md`.
- No hay especificación funcional modificable (`CMN` es transversal y técnico).
- Riesgo crítico mitigado: incompatibilidad entre versiones recientes de NestJS, TypeORM y TypeScript, asegurando TypeScript 5.7+ sin dependencias huérfanas ni versiones flotantes en `package.json`.

## 3. Decisiones técnicas

### D-01: Estrategia de inicialización de TypeORM

- **Alternativa A:** `TypeOrmModule.forRootAsync` con `autoLoadEntities: false` y carga explícita por módulo.
- **Alternativa B:** Conexión única mediante factoría centralizada que expone `DataSource` y `UnidadTransaccional` sin exponer metadatos a módulos funcionales.
- **Decisión:** B, aprobada por el Ingeniero el 2026-11-13.
- **Detalle:** `synchronize: false` inmutable en todos los entornos; entidades descubiertas por composición; migraciones versionadas ejecutables por CLI o al arrancar.

### D-02: Habilitación de la extensión PostGIS

- **Alternativa A:** Migración en el módulo funcional consumidor (p. ej. `territorio`).
- **Alternativa B:** Migración técnica inicial en `migraciones/comun/` con comprobación idempotente (`CREATE EXTENSION IF NOT EXISTS postgis`).
- **Decisión:** B, aprobada por el Ingeniero el 2026-11-13.
- **Detalle:** La extensión es propiedad de la infraestructura compartida. El método `down` no elimina la extensión para evitar la pérdida accidental de tipos espaciales.

### D-03: Propagación de transacciones

- **Alternativa A:** Propagación de contexto transaccional implícito mediante `AsyncLocalStorage` desacoplado tras el puerto `UnidadTransaccional`.
- **Alternativa B:** Paso explícito de `EntityManager` o `QueryRunner` como argumento en casos de uso.
- **Decisión:** A, aprobada por el Ingeniero el 2026-11-13.
- **Detalle:** una operación anidada reutiliza la transacción vigente o falla de forma explícita; no abre commits parciales invisibles.

## 4. Tareas

| ID | Tarea | Capa | Archivos previstos | Verificación |
|---|---|---|---|---|
| T01 | Auditar y fijar versiones exactas compatibles de NestJS, TypeORM, `pg`, PostgreSQL, PostGIS y soporte de pruebas | Configuración | `package.json`, `yarn.lock`, documentación de entorno | Instalación con lockfile inmutable; versiones exactas sin rangos para el stack exigido; build y conexión real |
| T02 | Definir `UnidadTransaccional` y contexto técnico opaco | Aplicación | `src/comun/aplicacion/puertos/`, índice público y pruebas | TypeScript puro; callback, retorno y rollback; ningún import de TypeORM o módulos funcionales |
| T03 | Implementar configuración TypeORM/`pg`, propagación transaccional y registro de migraciones | Infraestructura | `src/comun/infraestructura/persistencia/`, configuración de `DataSource` | `synchronize: false`; una conexión; commit, rollback, anidamiento y liberación de recursos verificados |
| T04 | Crear migración técnica idempotente de PostGIS | Infraestructura | `migraciones/comun/` | `CREATE EXTENSION IF NOT EXISTS postgis`; segunda ejecución inocua; el `down` no elimina la extensión |
| T05 | Componer el bootstrap sin importar internos funcionales desde `src/comun` | Composición | `src/app.module.ts`, módulo técnico de persistencia | Inicio real, descubrimiento de migraciones TypeScript/JavaScript y registro posterior de módulos consumidores |
| T06 | Crear infraestructura de integración aislada con PostgreSQL/PostGIS real | Calidad | configuración de pruebas, helpers técnicos y pruebas de integración | Base efímera, migraciones reales, `SELECT PostGIS_Version()`, aislamiento entre suites y cierre limpio |
| T07 | Ejecutar controles globales y registrar evidencia | Calidad | Secciones 8–9 | Todos los comandos de convenciones.md §9.2 aplicables quedan en verde |

## 5. Verificación y riesgos

| Control | Comando previsto |
|---|---|
| Formato | `yarn format:check` |
| Lint y tipos | `yarn lint` · `yarn typecheck` |
| Build | `yarn build` |
| Unitarias globales | `yarn test` |
| Cobertura | `yarn test:coverage` |
| Arquitectura | `yarn test:arquitectura` |
| Integración real | `yarn test:integracion` |
| E2E de composición | `yarn test:e2e` |

- **Riesgo — permisos de PostGIS:** el despliegue debe habilitar la extensión antes de migraciones funcionales; si el usuario de aplicación no puede hacerlo, una operación administrativa ejecuta la misma precondición.
- **Riesgo — migraciones omitidas:** el build debe descubrir archivos compilados y no depender de rutas exclusivas de TypeScript.
- **Riesgo — fuga transaccional:** pruebas concurrentes demuestran que cada solicitud conserva su propio contexto y que todo `QueryRunner` se libera.
- **Riesgo — acoplamiento común:** `src/comun` no importa entidades, repositorios ni reglas funcionales; Dependency Cruiser lo verifica.

## 6. Cambios de especificación

No hay cambios funcionales. El plan materializa decisiones técnicas globales ya aprobadas.

---

## 7. Registro de ejecución

| Tarea | Commit | Estado | Notas o desviaciones |
|---|---|---|---|
| T01 | 2cb26a4 | Completada | Versiones exactas fijadas sin rangos para NestJS, TypeORM, pg, uuid y typescript |
| T02 | deaa45d | Completada | Puerto UnidadTransaccional y símbolo de inyección en src/comun/aplicacion |
| T03 | 795d3c5 | Completada | Configuración TypeORM con synchronize: false inmutable y UnidadTransaccionalTypeOrm con AsyncLocalStorage |
| T04 | 9490153 | Completada | Migración técnica 1731450000000-HabilitarExtensionPostgis.ts idempotente y down no destructivo |
| T05 | ff29d57 | Completada | PersistenciaModule compuesto en AppModule sin acoplar módulos funcionales |
| T06 | 13b2fbb | Completada | Pruebas de integración reales contra PostgreSQL 15 y PostGIS 3.6 (commit, rollback, anidamiento) |
| T07 | 4ffd05f | Completada | Ejecución de controles globales de calidad y registro de evidencia integral |

## 8. Evidencia

| Control | Resultado | Comando ejecutado | Observado |
|---|---|---|---|
| Formato | PASS | `yarn format:check` | All matched files use Prettier code style! en 2.50s |
| Lint | PASS | `yarn lint` | 0 errors, 0 warnings en 10.45s |
| Tipos | PASS | `yarn typecheck` | tsc --noEmit finalizado exitosamente en 2.35s |
| Build | PASS | `yarn build` | nest build finalizado exitosamente en 9.86s |
| Unitarias globales | PASS | `yarn test` | 57 suites pasadas, 523 tests pasados en 15.7s |
| Cobertura común | PASS | `yarn test:coverage --collectCoverageFrom="src/comun/**/*.ts" --testPathPatterns=src/comun` | 13 suites pasadas, 112 tests de común en verde en 5.08s |
| Arquitectura | PASS | `yarn test:arquitectura` | 335 módulos, 1270 dependencias analizadas con Dependency Cruiser, 0 violaciones |
| Integración real | PASS | `yarn test:integracion` | 12 suites pasadas, 56 tests pasados en 3.17s contra PostgreSQL/PostGIS |
| E2E de composición | PASS | `yarn test:e2e` | 1 suite pasada, 1 test pasado en 2.03s levantando AppModule completo con persistencia |

## 9. Cierre

- **Conformidad:** Completada Fase 3 con todas las tareas T01 a T07 finalizadas y controles en verde. Estado del plan: `En verificación`.
- **Tarea asociada:** `CMN-TASK-002`.
- **Revisor:** Pendiente de Fase 4 en sesión independiente.
