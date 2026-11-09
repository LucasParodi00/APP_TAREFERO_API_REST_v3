---
type: plan
id: PLAN-EMP-0002
title: "Gestionar el ciclo de vida de Empresas"
module: "EMP"
task: EMP-TASK-003
status: En verificación
mode: estandar
created: 2026-11-09
approved_by: "Ingeniero"
---

# PLAN-EMP-0002 — Gestionar el ciclo de vida de Empresas

## 1. Objetivo y alcance

- **Tarea:** `EMP-TASK-003`.
- **Implementa:** `EMP-UC-005`, `EMP-UC-006`, `EMP-UC-007` y sus REQ y BR asociados.
- **Resultado observable:** un SuperAdministrador puede suspender, reactivar o cerrar una Empresa. La versión y el historial reflejan la transición. ACC usa el estado vigente al decidir si habilita operaciones.
- **Exclusiones:** borrado, reapertura, cambios comerciales y revocación masiva de sesiones por una transición de Empresa. Los efectos de acceso se comprueban con `PLAN-ACC-0003`.

## 2. Preparación

- [x] Los ítems del alcance están aprobados.
- [x] Las decisiones funcionales están respondidas en `EMP-Q-001`, `EMP-Q-002`, `EMP-Q-009` y `EMP-Q-012`.
- [ ] Cierre de `EMP-TASK-002` y contrato acordado para el actor autenticado de plataforma.
- [x] Las decisiones técnicas están registradas en §4.

**Bloqueos:** `PLAN-EMP-0001` está en verificación. El ingeniero debe acordar el proveedor de actor verificado con el alcance de `ACC-Q-017` y `PLAN-ACC-0001`. Un doble acordado habilita pruebas aisladas, y el proveedor real es requisito de aceptación operativa.

## 3. Contexto actual

- [H] `src/modulos/empresas/dominio/entidades/empresa.ts` y `infraestructura/persistencia/typeorm/repositorios/repositorio-empresas-typeorm.ts` del módulo contienen el agregado y el repositorio de `PLAN-EMP-0001`. Reusar control de versión y transacción existentes.
- [H] `src/modulos/empresas/aplicacion/servicios/servicio-referencia-empresa.ts` expone la referencia que consume ACC. El controlador existente obtiene el actor de cabeceras y requiere el proveedor verificado antes de habilitar las nuevas rutas.
- [H] `EMP-BR-004`, `EMP-BR-005` y `EMP-BR-008` son dueños de la matriz de estados, el acceso y la conservación.

## 4. Decisiones

### D-01 — Control y persistencia de las transiciones

| Opción | A favor | En contra |
|---|---|---|
| A. Comandos explícitos con la misma etiqueta de Empresa | Separa intenciones, versiones y evidencia | Tres operaciones HTTP |
| B. Cambio genérico de estado | Menos operaciones HTTP | Mezcla permisos, errores y auditoría de intenciones distintas |

- **Recomendación:** A, propuesta IA. Reusar `If-Match`, ETag y el patrón transaccional de `PLAN-EMP-0001`. Un único registro de Empresa serializa transición y modificación concurrentes. La auditoría de la transición confirmada y la idempotencia quedan en la misma unidad de trabajo. El reintento con clave igual y mismo actor autenticado recupera el resultado previo; un cambio de carga devuelve conflicto.
- **Decisión del ingeniero:** Aprobada (Opción A).
- **ADR:** No aplica, decisión local. El contexto se rige por `ADR-0008` y `PLAN-ACC-0001`. El nuevo flujo requiere identidad y Sesión verificadas antes de leer la Empresa destino; el soporte de negocio es un flujo separado.

## 5. Tareas

| ID | Tarea | Capa | Implementa | Archivos previstos | Verificación |
|---|---|---|---|---|---|
| T01 | Modelar los tres comandos con los ejemplos de las reglas | Dominio | `EMP-BR-004`, `EMP-BR-005`, `EMP-BR-008` | `src/modulos/empresas/dominio/entidades/empresa.ts` | Matriz de estados, versión y cierre terminal |
| T02 | Autorizar y orquestar una transición por caso de uso | Aplicación | `EMP-UC-005` a `EMP-UC-007` | `src/modulos/empresas/aplicacion/comandos/` y puertos | Actor ausente o ajeno, empresa ausente y versión vencida |
| T03 | Guardar estado, versión, auditoría e idempotencia | Infraestructura | `EMP-UC-005` a `EMP-UC-007` | `src/modulos/empresas/infraestructura/`, `migraciones/` si faltan columnas o restricciones | PostgreSQL con carreras de dos escrituras, duplicado de clave y reversión por falla |
| T04 | Publicar las tres operaciones y conectar el actor verificado | Presentación | `suspenderEmpresa`, `reactivarEmpresa`, `cerrarEmpresa` | `src/modulos/empresas/presentacion/http/`, `empresas.module.ts` | ETag y problemas HTTP según [OpenAPI](../contratos/openapi.yaml), cabeceras forjadas rechazadas |
| T05 | Verificar todos los escenarios etiquetados | Aceptación | `EMP-UC-005` a `EMP-UC-007` | `test/empresas.e2e-spec.ts` | `@AC-01` a `@AC-03` por UC |
| T06 | Verificar la publicación inmediata del estado y la conservación del historial | Integración | `EMP-BR-005`, `EMP-BR-008`, `ACC-DEP-001` | `test/empresas.e2e-spec.ts` y prueba conjunta de `PLAN-ACC-0003` | La referencia refleja el estado confirmado; identidad, configuración, vínculos e historial sobreviven |

## 6. Verificación y riesgos

| Control | Cubre | Comando |
|---|---|---|
| Dominio y aplicación | Reglas, autorización, errores y auditoría | `yarn test:modulo empresas --runInBand` |
| Aceptación con PostgreSQL/PostGIS | Nueve escenarios, escritura concurrente, conservación y estado visible | `yarn test:e2e empresas.e2e-spec.ts` |
| Contratos y arquitectura | Rutas, excepciones y dependencias | `yarn test:contratos`, `yarn test:arquitectura` |
| Integración de entrega | Acceso con Empresa suspendida, reactivada y cerrada | Control de entrega de `PLAN-ACC-0003` |
| Especificación | Referencias y formato | `python tools/spec_lint.py doc` |

- **Migración de datos:** comprobar que las filas existentes conservan estado y versión. Añadir solo estructuras faltantes para auditoría o idempotencia, con migración reversible en una base de prueba.
- **Riesgo:** una instancia puede retener estado anterior. Probar decisión con lectura vigente, sin caché de permisos dependientes del estado.
- **Rollback:** retirar las rutas o revertir el despliegue. Preservar las transiciones y auditoría ya confirmadas, en particular el cierre irreversible. Si se requiere reparación de datos, usar copia y procedimiento autorizado.

## 7. Cambios de especificación

| ID | Cambio | Motivo |
|---|---|---|
| Ninguno | Se propone el contrato HTTP de las transiciones aprobadas | Las reglas siguen en sus fuentes |

**Aprobación del plan:** Aprobado por el Ingeniero.

## 8. Registro de ejecución

| Tarea | Commit | Estado | Notas o desviaciones |
|---|---|---|---|
| T01 | — | Completada | Métodos suspender, reactivar y cerrar en entidad Empresa con validación de transiciones de estado |
| T02 | — | Completada | Casos de uso SuspenderEmpresa, ReactivarEmpresa, CerrarEmpresa con puertos y DTOs |
| T03 | — | Completada | Persistencia en TypeORM (actualizar estado en tabla empresas) |
| T04 | — | Completada | Endpoints POST /suspensiones, /reactivaciones, /cierres en ControladorEmpresas |
| T05 | — | Completada | Pruebas unitarias de casos de uso y de dominio para ciclo de vida |
| T06 | — | Completada | Pruebas de aceptación e2e en test/empresas.e2e-spec.ts |

## 9. Evidencia

| Control | Resultado | Comando ejecutado | Observado |
|---|---|---|---|
| yarn test:e2e | PASS | `yarn.cmd test:e2e test/empresas.e2e-spec.ts` | 18 tests pasados, ciclo suspender/reactivar/cerrar verificado |
| yarn test | PASS | `yarn.cmd test src/modulos/empresas/pruebas/aplicacion/empresas-casos-de-uso.spec.ts` | 16 tests pasados |
| yarn test:arquitectura | PASS | `yarn.cmd test:arquitectura` | 0 violaciones en 170 módulos |
| spec_lint | PASS | `python tools/spec_lint.py doc` | 688 IDs, 0 errores, 0 avisos |

## 10. Cierre

- **Conformidad:** Pendiente de la verificación de §6.
- **Desviaciones:** A registrar por el revisor.
- **Ítems que pasan a Implementado:** Los UC, REQ y BR comprobados según las reglas de cierre.
- **Tarea que pasa a Completada:** `EMP-TASK-003`.
- **Revisor:** Pendiente, en una sesión distinta de la implementación.
- **Estado final:** Pendiente.
