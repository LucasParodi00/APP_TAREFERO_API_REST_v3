---
type: tasks
module: "LAB"
---

# Labores — Tareas

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

## LAB-TASK-001 — Especificar el módulo Labores

- **Épica:** `EPIC-006`
- **Tipo:** Especificación
- **Estado:** Completada
- **Prioridad:** Alta
- **Alcance:** Todo el brief; `LAB-UC-001` a `LAB-UC-014`
- **Depende de:** Ninguna
- **Plan:** No aplica
- **Bloqueo:** Ninguno. Especificación aprobada por el Ingeniero el 06/11/2026.

## LAB-TASK-002 — Administrar Tipos de Labor y su configuración

- **Épica:** `EPIC-006`
- **Tipo:** Implementación
- **Estado:** Lista
- **Prioridad:** Alta
- **Alcance:** `LAB-UC-001`, `LAB-UC-002`
- **Depende de:** `LAB-TASK-001`; contratos de `LAB-DEP-001`, `LAB-DEP-004`, `LAB-DEP-005`, `LAB-DEP-008`
- **Plan:** No aplica
- **Bloqueo:** Ninguno. El impacto sobre PER está registrado en `LAB-DEP-004` y deberá resolverse antes de planificar la integración remunerativa.

## LAB-TASK-003 — Planificar y mantener Órdenes de Labor

- **Épica:** `EPIC-006`
- **Tipo:** Implementación
- **Estado:** Lista
- **Prioridad:** Alta
- **Alcance:** `LAB-UC-003`, `LAB-UC-004`
- **Depende de:** `LAB-TASK-001`, `LAB-TASK-002`; contratos de `LAB-DEP-002`, `LAB-DEP-003`, `LAB-DEP-004`, `LAB-DEP-006`, `LAB-DEP-008`
- **Plan:** No aplica
- **Bloqueo:** Ninguno.

## LAB-TASK-004 — Registrar y operar ejecuciones de Labor

- **Épica:** `EPIC-006`
- **Tipo:** Implementación
- **Estado:** Lista
- **Prioridad:** Alta
- **Alcance:** `LAB-UC-005` a `LAB-UC-008`
- **Depende de:** `LAB-TASK-001`, `LAB-TASK-002`; contratos de `LAB-DEP-002` a `LAB-DEP-006`, `LAB-DEP-008`
- **Plan:** No aplica
- **Bloqueo:** Ninguno.

## LAB-TASK-005 — Confirmar, corregir y remunerar ejecuciones

- **Épica:** `EPIC-006`
- **Tipo:** Implementación
- **Estado:** Lista
- **Prioridad:** Alta
- **Alcance:** `LAB-UC-009` a `LAB-UC-011`
- **Depende de:** `LAB-TASK-004`; contratos de `LAB-DEP-004`, `LAB-DEP-005`, `LAB-DEP-008`
- **Plan:** No aplica
- **Bloqueo:** Ninguno. El impacto sobre PER está registrado en `LAB-DEP-004` y deberá resolverse antes de planificar la integración remunerativa.

## LAB-TASK-006 — Conciliar tiempos y consultar historia

- **Épica:** `EPIC-006`
- **Tipo:** Implementación
- **Estado:** Lista
- **Prioridad:** Media
- **Alcance:** `LAB-UC-012`, `LAB-UC-013`
- **Depende de:** `LAB-TASK-004`, `LAB-TASK-005`; contratos de `LAB-DEP-002`, `LAB-DEP-004`, `LAB-DEP-008`
- **Plan:** No aplica
- **Bloqueo:** Ninguno.

## LAB-TASK-007 — Proveer hechos e integrar módulos consumidores

- **Épica:** `EPIC-006`
- **Tipo:** Implementación
- **Estado:** Lista
- **Prioridad:** Alta
- **Alcance:** `LAB-UC-014`
- **Depende de:** `LAB-TASK-004`, `LAB-TASK-005`; contratos de `LAB-DEP-004`, `LAB-DEP-005`, `LAB-DEP-007`, `LAB-DEP-008`, `LAB-DEP-009`
- **Plan:** No aplica
- **Bloqueo:** Ninguno. Los contratos de integración se concretarán durante la planificación correspondiente.
