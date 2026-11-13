---
type: plan
id: PLAN-CMN-0003
title: "Implementar idempotencia persistente transversal"
module: "CMN"
task: CMN-TASK-003
status: En revisión
mode: estandar
created: 2026-11-13
updated: 2026-11-13
approved_by: null
---

# PLAN-CMN-0003 — Implementar idempotencia persistente transversal

## 1. Objetivo y alcance

- **Tarea:** `CMN-TASK-003`.
- **Implementa:** convenciones.md §3.4, §4, §5 y §6.1; arquitectura.md §6.1, §7, §9–§11; `ADR-0013`.
- **Resultado observable:** cualquier módulo puede ejecutar una escritura repetible mediante una API común que identifica la operación por clave, actor, Empresa y nombre estable; calcula una huella de la solicitud; confirma atómicamente el cambio funcional y su resultado; repite el resultado confirmado ante el mismo reintento; rechaza una carga diferente; y conserva el registro por al menos 180 días.
- **No incluye:** decidir qué operaciones funcionales son repetibles; errores o reglas de negocio de un módulo; almacenar JWT, secretos o cuerpos sin minimización; reemplazar `If-Match` o las restricciones de unicidad.
- **Consumidores iniciales:** escrituras declaradas por `PLAN-ACC-0002`, `PLAN-TER-0001` y `PLAN-TER-0002`; los futuros módulos reutilizan la misma API pública.

## 2. Preparación

- [x] La semántica global está aprobada en convenciones.md §3.4.
- [x] La capacidad cumple el criterio de ingreso a `src/comun` y `ADR-0013` exige una tarea y plan propios.
- [x] `CMN-TASK-003` existe y referencia este plan.
- [x] El Ingeniero aprobó el 2026-11-13 que COMÚN sea dueño de la implementación reutilizable y que los módulos solo la consuman.
- [x] `PLAN-CMN-0002` define la conexión y unidad transaccional requeridas.

**Bloqueos:** Ninguno para aprobar el plan. La ejecución de T04 en adelante requiere `CMN-TASK-002` implementada.

## 3. Contexto actual

- [H] `src/comun/presentacion/decoradores/idempotency-key.decorador.ts` valida y entrega la cabecera, pero no persiste ni coordina resultados.
- [H] El OpenAPI de TER ya publica `CMN_IDEMPOTENCIA_INVALIDA` y `CMN_IDEMPOTENCIA_CONFLICTO`; ACC requiere la misma capacidad para `ACC-UC-013` a `ACC-UC-015`.
- [H] No existe almacenamiento, huella, exclusión concurrente, repetición de respuestas ni limpieza por retención.
- [H] Implementar la capacidad dentro de ACC o TER duplicaría una convención global y violaría `ADR-0013`.

## 4. Decisiones

### D-01 — Ejecución funcional y confirmación idempotente en una transacción

| Opción | A favor | En contra |
|---|---|---|
| A: un `EjecutorIdempotente` común usa `UnidadTransaccional`; reserva/lee la clave, ejecuta el callback funcional y confirma el resultado dentro de la misma transacción | No deja un cambio funcional confirmado sin resultado idempotente ni viceversa | Requiere que los adaptadores funcionales participen de la transacción común |
| B: guardar la idempotencia antes o después en otra transacción | Implementación sencilla | Una falla intermedia permite duplicados o respuestas sin efecto funcional |

- **Decisión:** A, aprobada por el Ingeniero el 2026-11-13.
- **Detalle:** si el callback falla, la reserva y los cambios funcionales se revierten; solo se repiten resultados confirmados.

### D-02 — Identidad, huella y concurrencia

| Opción | A favor | En contra |
|---|---|---|
| A: unicidad por `empresaId` nullable, `actorId`, operación estable e `Idempotency-Key`; SHA-256 de una representación canónica de método, ruta, parámetros y cuerpo; inserción/lectura bloqueante en PostgreSQL | Distingue consumidores y detecta reutilización con otra carga | Exige canonicalización y tratamiento de carreras |
| B: unicidad solo por clave | Modelo menor | Dos actores u operaciones podrían interferirse accidentalmente |

- **Decisión:** A, aprobada por el Ingeniero el 2026-11-13.
- **Detalle:** no se almacenan credenciales ni cabeceras sensibles; una misma identidad con otra huella produce `CMN_IDEMPOTENCIA_CONFLICTO`.

### D-03 — Persistencia técnica sin entidad de negocio común

| Opción | A favor | En contra |
|---|---|---|
| A: migración técnica `migraciones/comun` y adaptador SQL/TypeORM interno; no se expone una entidad, repositorio CRUD ni tabla a módulos consumidores | Mantiene el detalle físico encapsulado y `src/comun` libre de modelos funcionales | Requiere SQL explícito para bloqueo y replay |
| B: cada módulo mantiene su tabla | Propiedad local | Duplica formato, retención y corrección de carreras |

- **Decisión:** A, aprobada por el Ingeniero el 2026-11-13.
- **Detalle:** la tabla es infraestructura técnica de la aplicación; ningún módulo funcional la consulta directamente.

### D-04 — Resultado repetible y retención

- Se conserva estado HTTP, cuerpo JSON seguro y cabeceras funcionales permitidas mediante una representación técnica versionada; se excluyen cookies, tokens y cabeceras hop-by-hop.
- La expiración se fija como mínimo a 180 días desde la confirmación. Una limpieza por lotes elimina exclusivamente registros expirados y confirmados.
- Los errores de formato, autorización o negocio no se confirman como resultado idempotente en esta primera versión; las restricciones funcionales siguen siendo la defensa final.
- **Decisión:** aprobada por el Ingeniero el 2026-11-13 al autorizar la capacidad común reutilizable.

## 5. Tareas

| ID | Tarea | Capa | Archivos previstos | Verificación |
|---|---|---|---|---|
| T01 | Definir solicitud, huella, resultado confirmado y errores técnicos sin vocabulario funcional | Dominio común | `src/comun/dominio/objetos-valor/`, `errores/`, índice público | Normalización determinista, igualdad de huellas, datos sensibles excluidos y pruebas de límites |
| T02 | Definir `EjecutorIdempotente` y contratos de replay/limpieza | Aplicación común | `src/comun/aplicacion/puertos/`, modelos técnicos e índice público | Sin NestJS/TypeORM; operación con y sin clave; retorno genérico tipado; errores estables `CMN_*` |
| T03 | Unificar el decorador existente con los códigos `CMN_IDEMPOTENCIA_INVALIDA` publicados | Presentación común | decorador, interceptor/adaptador HTTP y pruebas | Clave ausente permitida cuando el contrato la hace opcional; formato inválido rechazado; replay conserva respuesta permitida |
| T04 | Crear la migración técnica de registros idempotentes | Infraestructura | `migraciones/comun/` | Unicidad compuesta, huella, estado, respuesta, fechas, expiración e índices; `up/down` reales sobre PostgreSQL |
| T05 | Implementar reserva, bloqueo, ejecución y confirmación atómicas | Infraestructura | `src/comun/infraestructura/persistencia/`, índice público | Reintento igual, carga diferente, dos solicitudes simultáneas, rollback funcional y ausencia de commits parciales |
| T06 | Implementar limpieza segura por retención | Infraestructura | adaptador y punto de ejecución operativa | Nunca elimina registros no expirados ni en uso; lotes acotados; mínimo 180 días verificado |
| T07 | Integrar un consumidor de prueba sin conocimiento de la tabla | Integración | pruebas comunes con PostgreSQL real | Demuestra reutilización mediante API pública y transacción compartida; ningún acceso directo desde módulos |
| T08 | Ejecutar controles globales y registrar evidencia | Calidad | Secciones 8–9 | Comandos obligatorios y cobertura en verde |

## 6. Verificación y riesgos

| Control | Comando previsto |
|---|---|
| Formato | `yarn format:check` |
| Lint y tipos | `yarn lint` · `yarn typecheck` |
| Build | `yarn build` |
| Unitarias y regresión | `yarn test` |
| Cobertura | `yarn test:coverage` |
| Arquitectura | `yarn test:arquitectura` |
| Integración concurrente real | `yarn test:integracion` |

- **Riesgo — datos sensibles:** la huella se calcula sobre una representación canónica y la respuesta persistida se minimiza; nunca se guardan JWT, contraseñas o cookies.
- **Riesgo — crecimiento:** expiración, índice y limpieza por lotes; métricas de cantidad y antigüedad sin exponer claves.
- **Riesgo — carrera:** restricción única y bloqueo transaccional real; no se confía en `buscar` seguido de `insertar`.
- **Riesgo — acoplamiento:** consumidores importan solo contratos públicos de su capa; nunca la migración ni el adaptador concreto.
- **Riesgo — falsa garantía:** idempotencia no reemplaza `If-Match`, unicidad, validación de Empresa ni invariantes del agregado.

## 7. Cambios de especificación

No hay cambios funcionales. El plan implementa la convención global aprobada y normaliza los códigos técnicos ya publicados.

---

## 8. Registro de ejecución

| Tarea | Commit | Estado | Notas o desviaciones |
|---|---|---|---|
| T01 | | Pendiente | |
| T02 | | Pendiente | |
| T03 | | Pendiente | |
| T04 | | Pendiente | |
| T05 | | Pendiente | |
| T06 | | Pendiente | |
| T07 | | Pendiente | |
| T08 | | Pendiente | |

## 9. Evidencia

| Control | Resultado | Comando ejecutado | Observado |
|---|---|---|---|
| | NOT RUN | | Fase 2 no implementa ni afirma resultados de ejecución |

## 10. Cierre

- **Conformidad:** Pendiente de Fase 3 y revisión independiente en Fase 4.
- **Tarea que pasa a Completada:** `CMN-TASK-003`.
- **Revisor:** Pendiente.
