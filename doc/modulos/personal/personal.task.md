---
type: tasks
module: "PER"
---

# Personal — Tareas

<!-- Inventario de trabajo del módulo. Cada tarea pertenece a una épica de doc/task.md.
Tipos:
- Especificación: llevar el módulo (o parte) de brief a especificación aprobada. No necesita plan: su procedimiento es proceso/01.
- Implementación: construir casos de uso aprobados. Necesita un plan.
- Corrección: arreglar un comportamiento que no cumple la especificación. Necesita un plan (modo rápido).
- Técnica: trabajo sin cambio funcional (migración, actualización de librería). Necesita un plan.
Estados:
  Pendiente → Lista (especificación del alcance aprobada) → Planificada (plan aprobado) → En curso → Completada
  Bloqueada (indicar por qué) · Cancelada (indicar por qué)
Completada exige: tarea de especificación con sus ítems Aprobado; o plan Cerrado para los demás tipos. -->

## PER-TASK-001 — Especificar el módulo Personal

- **Épica:** `EPIC-005`
- **Tipo:** Especificación
- **Estado:** Completada
- **Prioridad:** Alta
- **Alcance:** Todo el brief; `PER-UC-001` a `PER-UC-013`
- **Depende de:** Ninguna
- **Plan:** No aplica
- **Bloqueo:** Ninguno. Especificación aprobada por el Ingeniero el 06/11/2026 y ajustes de Fase 1 aprobados el 13/11/2026.

## PER-TASK-002 — Administrar Empleados, información laboral y acceso

- **Épica:** `EPIC-005`
- **Tipo:** Implementación
- **Estado:** En curso
- **Prioridad:** Alta
- **Alcance:** `PER-UC-001` a `PER-UC-003`
- **Depende de:** `PER-TASK-001`; contratos de `PER-DEP-001` a `PER-DEP-004`
- **Plan:** `PLAN-PER-0001`
- **Bloqueo:** Ninguno. `PLAN-PER-0001` aprobado por el Ingeniero el 13/11/2026; la ejecución respeta sus prerrequisitos técnicos.

## PER-TASK-003 — Integrar el acceso de Empleados

- **Épica:** `EPIC-005`
- **Tipo:** Implementación
- **Estado:** Cancelada
- **Prioridad:** Alta
- **Alcance:** Sin alcance vigente; `PER-UC-002` fue absorbido por `PER-TASK-002`.
- **Depende de:** No aplica
- **Plan:** No aplica
- **Bloqueo:** No aplica. Tarea cancelada por consolidación de su alcance en `PER-TASK-002` el 13/11/2026.

## PER-TASK-004 — Administrar Cuadrillas

- **Épica:** `EPIC-005`
- **Tipo:** Implementación
- **Estado:** Lista
- **Prioridad:** Alta
- **Alcance:** `PER-UC-004` a `PER-UC-007`
- **Depende de:** `PER-TASK-002`
- **Plan:** No aplica
- **Bloqueo:** Ninguno.

## PER-TASK-005 — Registrar y corregir asistencia

- **Épica:** `EPIC-005`
- **Tipo:** Implementación
- **Estado:** Lista
- **Prioridad:** Alta
- **Alcance:** `PER-UC-008`, `PER-UC-009`
- **Depende de:** `PER-TASK-002`
- **Plan:** No aplica
- **Bloqueo:** Ninguno.

## PER-TASK-006 — Consultar información laboral propia

- **Épica:** `EPIC-005`
- **Tipo:** Implementación
- **Estado:** Lista
- **Prioridad:** Media
- **Alcance:** `PER-UC-010`
- **Depende de:** `PER-TASK-002`, `PER-TASK-005`
- **Plan:** No aplica
- **Bloqueo:** Ninguno.

## PER-TASK-007 — Configurar y calcular remuneraciones

- **Épica:** `EPIC-005`
- **Tipo:** Implementación
- **Estado:** Lista
- **Prioridad:** Alta
- **Alcance:** `PER-UC-011`, `PER-UC-012`
- **Depende de:** `PER-TASK-002`, `PER-TASK-005`; contratos de `PER-DEP-005`, `PER-DEP-006`, `PER-DEP-007`
- **Plan:** No aplica
- **Bloqueo:** Ninguno. Los contratos con Labores, Cosechas y Economía se concretarán durante la planificación.

## PER-TASK-008 — Proveer contexto de Personal

- **Épica:** `EPIC-005`
- **Tipo:** Implementación
- **Estado:** Lista
- **Prioridad:** Alta
- **Alcance:** `PER-UC-013`
- **Depende de:** `PER-TASK-002`, `PER-TASK-004` a `PER-TASK-007`; contratos de `PER-DEP-003`, `PER-DEP-005`, `PER-DEP-006`, `PER-DEP-007`
- **Plan:** No aplica
- **Bloqueo:** Ninguno. Los contratos de integración se concretarán durante la planificación.
