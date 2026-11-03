---
type: tasks
module: "ACC"
---

# Identidad y acceso — Tareas

## ACC-TASK-001 — Especificar el módulo Identidad y acceso

- **Épica:** `EPIC-002`
- **Tipo:** Especificación
- **Estado:** Completada
- **Prioridad:** Alta
- **Alcance:** Todo el brief; casos `ACC-UC-001` a `ACC-UC-011`, con el alcance de plataforma y dispositivos delimitado por `ACC-Q-017`.
- **Depende de:** Ninguna
- **Plan:** No aplica
- **Bloqueo:** Ninguno. Especificación aprobada por el Ingeniero el 03/11/2026.

## ACC-TASK-002 — Administrar Cuentas de Empresa

- **Épica:** `EPIC-002`
- **Tipo:** Implementación
- **Estado:** Lista
- **Prioridad:** Alta
- **Alcance:** `ACC-UC-001`, `ACC-UC-008`, `ACC-UC-010`
- **Depende de:** `ACC-TASK-001`; contratos acordados de `ACC-DEP-001`, `ACC-DEP-002`, `ACC-DEP-003`.
- **Plan:** No aplica
- **Bloqueo:** Ninguno. Los contratos técnicos de las dependencias se concretarán durante la planificación sin alterar el alcance aprobado.

## ACC-TASK-003 — Autenticar y autorizar cuentas de Empresa

- **Épica:** `EPIC-002`
- **Tipo:** Implementación
- **Estado:** Lista
- **Prioridad:** Alta
- **Alcance:** `ACC-UC-002`, `ACC-UC-003`, `ACC-UC-004`, `ACC-UC-005`, `ACC-UC-009`
- **Depende de:** `ACC-TASK-001`, `ACC-TASK-002`; contratos de `ACC-DEP-001`, `ACC-DEP-002`.
- **Plan:** No aplica
- **Bloqueo:** Ninguno. El alias se resuelve mediante `EMP-BR-011` a `EMP-BR-013`; los detalles de credenciales y la política de sesiones están definidos por `ACC-BR-014`, `ACC-BR-018` y `ACC-BR-019`.

## ACC-TASK-004 — Administrar acceso de plataforma y soporte

- **Épica:** `EPIC-002`
- **Tipo:** Implementación
- **Estado:** Lista
- **Prioridad:** Alta
- **Alcance:** `ACC-UC-006`, `ACC-UC-007`, `ACC-UC-011`, dentro de la delimitación de `ACC-Q-017`.
- **Depende de:** `ACC-TASK-001`; contrato de Empresa en `ACC-DEP-001` y contexto de `ACC-DEP-004`.
- **Plan:** No aplica
- **Bloqueo:** Ninguno. El mecanismo operativo de plataforma permanece a cargo del Ingeniero según `ACC-Q-017`; su concreción técnica durante la planificación no debe introducir una dependencia circular.

