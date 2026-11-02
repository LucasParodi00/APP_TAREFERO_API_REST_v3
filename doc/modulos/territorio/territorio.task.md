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
- **Estado:** En curso
- **Prioridad:** Alta
- **Alcance:** Chacras según `B-01` y `TER-Q-001` a `TER-Q-006`; `TER-UC-001` a `TER-UC-005`. Lotes y delimitación quedan para una especificación posterior.
- **Depende de:** Ninguna
- **Plan:** No aplica
- **Bloqueo:** Preguntas respondidas e incorporadas; falta revisión y aprobación de la especificación redactada.

## TER-TASK-002 — Registrar y mantener Chacras

- **Épica:** `EPIC-003`
- **Tipo:** Implementación
- **Estado:** Bloqueada
- **Prioridad:** Alta
- **Alcance:** `TER-UC-001`, `TER-UC-004`, `TER-UC-005`
- **Depende de:** `TER-TASK-001`; contratos acordados de `TER-DEP-001` y `TER-DEP-002`.
- **Plan:** No aplica
- **Bloqueo:** Alcance Propuesto; aprobación de la redacción y política de comparación/normalización del nombre corto pendientes. No se crea un plan antes de aprobar su alcance.

## TER-TASK-003 — Consultar Chacras dentro del alcance autorizado

- **Épica:** `EPIC-003`
- **Tipo:** Implementación
- **Estado:** Bloqueada
- **Prioridad:** Alta
- **Alcance:** `TER-UC-002`, `TER-UC-003`
- **Depende de:** `TER-TASK-001`, `TER-TASK-002`; contexto y alcance de asignaciones de `TER-DEP-002`.
- **Plan:** No aplica
- **Bloqueo:** Alcance Propuesto; aprobación y contrato de asignaciones del Capataz pendientes. Una dependencia simulada solo podrá usarse con contrato acordado durante la planificación.
