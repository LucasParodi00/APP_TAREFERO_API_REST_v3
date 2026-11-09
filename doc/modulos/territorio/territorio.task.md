---
type: tasks
module: "TER"
---

# Territorio — Tareas

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

## TER-TASK-001 — Especificar la primera entrega de Territorio: Chacras

- **Épica:** `EPIC-003`
- **Tipo:** Especificación
- **Estado:** Completada
- **Prioridad:** Alta
- **Alcance:** Chacras según `B-01` y `TER-Q-001` a `TER-Q-010`; `TER-UC-001` a `TER-UC-005`. Lotes y delimitación quedan para una especificación posterior.
- **Depende de:** Ninguna
- **Plan:** No aplica
- **Bloqueo:** Ninguno. Especificación aprobada por el Ingeniero el 2026-11-03.

## TER-TASK-002 — Registrar y mantener Chacras

- **Épica:** `EPIC-003`
- **Tipo:** Implementación
- **Estado:** En curso
- **Prioridad:** Alta
- **Alcance:** `TER-UC-001`, `TER-UC-004`, `TER-UC-005`; cambios controlados aprobados en `TER-Q-018` y `TER-Q-022` sobre `TER-ENT-001` y la inactivación de Chacra.
- **Depende de:** `TER-TASK-001`; contratos acordados de `TER-DEP-001` y `TER-DEP-002`.
- **Plan:** `PLAN-TER-0001`
- **Bloqueo:** Ninguno. Plan PLAN-TER-0001 aprobado por el Ingeniero.

## TER-TASK-003 — Consultar Chacras dentro del alcance autorizado

- **Épica:** `EPIC-003`
- **Tipo:** Implementación
- **Estado:** Lista
- **Prioridad:** Alta
- **Alcance:** `TER-UC-002`, `TER-UC-003`
- **Depende de:** `TER-TASK-001`, `TER-TASK-002`; contexto y alcance de asignaciones de `TER-DEP-002`.
- **Plan:** No aplica
- **Bloqueo:** Ninguno. La planificación debe concretar el contrato de `TER-DEP-002`; una dependencia simulada solo podrá usarse con ese contrato acordado.

## TER-TASK-004 — Especificar la segunda entrega de Territorio: Lotes y geometrías

- **Épica:** `EPIC-003`
- **Tipo:** Especificación
- **Estado:** Completada
- **Prioridad:** Alta
- **Alcance:** Lotes, versiones geométricas y relaciones históricas según `B-02` a `B-12`, `TER-Q-011` a `TER-Q-023` y `TER-UC-006` a `TER-UC-013`.
- **Depende de:** `TER-TASK-001`
- **Plan:** No aplica
- **Bloqueo:** Ninguno. Especificación aprobada por el Ingeniero el 2026-11-03.

## TER-TASK-005 — Registrar y mantener Lotes

- **Épica:** `EPIC-003`
- **Tipo:** Implementación
- **Estado:** Lista
- **Prioridad:** Alta
- **Alcance:** `TER-UC-006`, `TER-UC-009`, `TER-UC-011`, `TER-UC-012`
- **Depende de:** `TER-TASK-004`; contratos acordados de `TER-DEP-001` a `TER-DEP-004`.
- **Plan:** No aplica
- **Bloqueo:** Ninguno. Los contratos de `TER-DEP-001` a `TER-DEP-004` se concretarán durante la planificación.

## TER-TASK-006 — Consultar Lotes e historial territorial

- **Épica:** `EPIC-003`
- **Tipo:** Implementación
- **Estado:** Lista
- **Prioridad:** Alta
- **Alcance:** `TER-UC-007`, `TER-UC-008`, `TER-UC-013`
- **Depende de:** `TER-TASK-004`, `TER-TASK-005`; contexto de asignaciones de `TER-DEP-002`.
- **Plan:** No aplica
- **Bloqueo:** Ninguno. El contrato de alcance de `TER-DEP-002` se concretará durante la planificación.

## TER-TASK-007 — Gestionar delimitaciones y superficies de Lotes

- **Épica:** `EPIC-003`
- **Tipo:** Implementación
- **Estado:** Lista
- **Prioridad:** Alta
- **Alcance:** `TER-UC-010`; `TER-BR-013` a `TER-BR-016`; `TER-ENT-003`.
- **Depende de:** `TER-TASK-004`, `TER-TASK-005`.
- **Plan:** No aplica
- **Bloqueo:** Ninguno. Las decisiones espaciales de implementación se concretarán durante la planificación sin cambiar las reglas aprobadas.
