---
type: plan
id: PLAN-CMN-0002
title: "Implementar bootstrap compartido de persistencia y PostGIS"
module: "CMN"
task: CMN-TASK-002
status: En ejecución
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

- [x] PostgreSQL/PostGIS, TypeORM y `pg` están aceptados por `ADR-0003`.
- [x] La capacidad es técnica, independiente del negocio y requerida por varios módulos conforme a arquitectura.md §6.1.
- [x] `CMN-TASK-002` existe y referencia este plan.
- [x] El Ingeniero aprobó el 2026-11-13 que la conexión, PostGIS y la coordinación técnica sean comunes, mientras cada módulo conserva sus datos y migraciones funcionales.
- [x] No se requieren reglas, casos de uso ni contratos HTTP funcionales.

**Bloqueos:** Ninguno para aprobar el plan. Antes de implementar se verifican y fijan exactamente las versiones compatibles ya exigidas por convenciones.md §1; una incompatibilidad real bloquea Fase 3 y vuelve a Fase 2.

## 3. Contexto actual

- [H] `src/app.module.ts` no importa módulos funcionales ni configura TypeORM.
- [H] Existen migraciones bajo `migraciones/empresas/`, `migraciones/identidad-acceso/` y `migraciones/territorio/`, pero no existe un `DataSource` ejecutable que las registre.
- [H] `pg` y TypeORM están declarados en `package.json`; PostGIS es una extensión de PostgreSQL y no una dependencia de Node.js.
- [H] Las pruebas llamadas de integración actuales usan dobles y no ejecutan migraciones contra PostgreSQL/PostGIS real.
- [H] `ADR-0014` permite una unidad transaccional técnica compartida siempre que no exponga repositorios ni internos de un módulo a otro.

## 4. Decisiones

### D-01 — Una conexión global y registro modular de persistencia

| Opción | A favor | En contra |
|---|---|---|
| A: una conexión TypeORM/`pg` global; cada módulo registra sus entidades mediante composición y conserva sus migraciones | Evita pools duplicados y mantiene propiedad modular | Requiere un bootstrap y registro de migraciones coherentes |
| B: una conexión por módulo | Aislamiento aparente | Multiplica pools, configuración y coordinación transaccional dentro del mismo monolito |

- **Decisión:** A, aprobada por el Ingeniero el 2026-11-13.
- **Detalle:** el bootstrap no importa Dominio ni repositorios funcionales; la composición registra los adaptadores de cada módulo.

### D-02 — PostGIS como extensión compartida de PostgreSQL

| Opción | A favor | En contra |
|---|---|---|
| A: una migración técnica idempotente ejecuta `CREATE EXTENSION IF NOT EXISTS postgis`; las migraciones funcionales solo crean sus columnas e índices espaciales | Separa capacidad del servidor y datos funcionales | Requiere permisos de extensión en el entorno |
| B: cada módulo crea y elimina la extensión | Autonomía local aparente | Produce duplicación y un `down` podría romper otros módulos |

- **Decisión:** A, aprobada por el Ingeniero el 2026-11-13.
- **Rollback:** la migración común no elimina PostGIS automáticamente; retirar una extensión compartida requiere una operación administrativa explícita y verificación de dependencias.

### D-03 — Unidad transaccional opaca para Aplicación

| Opción | A favor | En contra |
|---|---|---|
| A: `UnidadTransaccional` común ejecuta un callback y la Infraestructura resuelve internamente el `EntityManager` vigente, sin entregarlo al caso de uso | Mantiene TypeORM fuera de Aplicación y permite atomicidad reutilizable | Requiere propagar el contexto transaccional de forma segura |
| B: pasar `EntityManager` a casos de uso | Implementación directa | Acopla Aplicación a TypeORM y viola arquitectura.md §7 |

- **Decisión:** A, aprobada por el Ingeniero el 2026-11-13.
- **Detalle:** una operación anidada reutiliza la transacción vigente o falla de forma explícita; no abre commits parciales invisibles.

## 5. Tareas

| ID | Tarea | Capa | Archivos previstos | Verificación |
|---|---|---|---|---|
| T01 | Auditar y fijar versiones exactas compatibles de NestJS, TypeORM, `pg`, PostgreSQL, PostGIS y soporte de pruebas | Configuración | `package.json`, `yarn.lock`, documentación de entorno | Instalación con lockfile inmutable; versiones exactas sin rangos para el stack exigido; build y conexión real |
| T02 | Definir `UnidadTransaccional` y contexto técnico opaco | Aplicación | `src/comun/aplicacion/puertos/`, índice público y pruebas | TypeScript puro; callback, retorno y rollback; ningún import de TypeORM o módulos funcionales |
| T03 | Implementar configuración TypeORM/`pg`, propagación transaccional y registro de migraciones | Infraestructura | `src/comun/infraestructura/persistencia/`, configuración de `DataSource` | `synchronize: false`; una conexión; commit, rollback, anidamiento y liberación de recursos verificados |
| T04 | Crear migración técnica idempotente de PostGIS | Infraestructura | `migraciones/comun/` | `CREATE EXTENSION IF NOT EXISTS postgis`; segunda ejecución inocua; el `down` no elimina la extensión |
| T05 | Componer el bootstrap sin importar internos funcionales desde `src/comun` | Composición | `src/app.module.ts`, módulo técnico de persistencia | Inicio real, descubrimiento de migraciones TypeScript/JavaScript y registro posterior de módulos consumidores |
| T06 | Crear infraestructura de integración aislada con PostgreSQL/PostGIS real | Calidad | configuración de pruebas, helpers técnicos y pruebas de integración | Base efímera, migraciones reales, `SELECT PostGIS_Version()`, aislamiento entre suites y cierre limpio |
| T07 | Ejecutar controles globales y registrar evidencia | Calidad | Secciones 8–9 | Todos los comandos de convenciones.md §9.2 aplicables quedan en verde |

## 6. Verificación y riesgos

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

## 7. Cambios de especificación

No hay cambios funcionales. El plan materializa decisiones técnicas globales ya aprobadas.

---

## 8. Registro de ejecución

| Tarea | Commit | Estado | Notas o desviaciones |
|---|---|---|---|
| T01 | 2cb26a4 | Completada | Versiones exactas fijadas sin rangos para NestJS, TypeORM, pg, uuid y typescript |
| T02 | | Completada | Puerto UnidadTransaccional y símbolo de inyección en src/comun/aplicacion |
| T03 | | Pendiente | |
| T04 | | Pendiente | |
| T05 | | Pendiente | |
| T06 | | Pendiente | |
| T07 | | Pendiente | |

## 9. Evidencia

| Control | Resultado | Comando ejecutado | Observado |
|---|---|---|---|
| | NOT RUN | | Fase 2 no implementa ni afirma resultados de ejecución |

## 10. Cierre

- **Conformidad:** Pendiente de Fase 3 y revisión independiente en Fase 4.
- **Tarea que pasa a Completada:** `CMN-TASK-002`.
- **Revisor:** Pendiente.
