---
type: tasks
module: "EMP"
---

# Empresas — Tareas

## EMP-TASK-001 — Especificar el módulo Empresas

- **Épica:** `EPIC-001`
- **Tipo:** Especificación
- **Estado:** Completada
- **Prioridad:** Alta
- **Alcance:** Todo el brief
- **Depende de:** Ninguna
- **Plan:** No aplica
- **Bloqueo:** Ninguno. Especificación aprobada por el Ingeniero el 2026-11-03.

## EMP-TASK-002 — Gestionar datos y configuración de Empresas

- **Épica:** `EPIC-001`
- **Tipo:** Implementación
- **Estado:** En curso
- **Prioridad:** Alta
- **Alcance:** `EMP-UC-001`, `EMP-UC-002`, `EMP-UC-003`, `EMP-UC-004`, `EMP-UC-008`
- **Depende de:** `EMP-TASK-001`
- **Plan:** `planes/PLAN-EMP-0001-modulo-empresas.md`
- **Bloqueo:** Ninguno. Los contratos de `EMP-DEP-001` a `EMP-DEP-003` quedaron concretados en `contratos/openapi.yaml`. Plan aprobado el 2026-11-10.

## EMP-TASK-003 — Gestionar el ciclo de vida de Empresas

- **Épica:** `EPIC-001`
- **Tipo:** Implementación
- **Estado:** Planificada
- **Prioridad:** Alta
- **Alcance:** `EMP-UC-005`, `EMP-UC-006`, `EMP-UC-007`
- **Depende de:** `EMP-TASK-002`
- **Plan:** `planes/PLAN-EMP-0001-modulo-empresas.md`
- **Bloqueo:** Ninguno. Las transiciones de ciclo de vida quedaron concretadas en `contratos/openapi.yaml` y el plan maestro. Plan aprobado el 2026-11-10.

## EMP-TASK-004 — Reorganizar la estructura interna del módulo Empresas

- **Épica:** `EPIC-001`
- **Tipo:** Implementación
- **Estado:** Completada
- **Prioridad:** Alta
- **Alcance:** `ADR-0009`, `EMP-UC-001`, `EMP-UC-002`, `EMP-UC-003`, `EMP-UC-004`, `EMP-UC-005`, `EMP-UC-006`, `EMP-UC-007`, `EMP-UC-008`
- **Depende de:** `EMP-TASK-002`, `EMP-TASK-003`
- **Plan:** `planes/PLAN-EMP-0002-reorganizar-estructura-interna.md`
- **Bloqueo:** Ninguno. Debe conservar el comportamiento aprobado del módulo mientras adopta la estructura modular simplificada, los repositorios de agregados en Dominio y los puertos de consulta en Aplicación definidos por `ADR-0009`.
