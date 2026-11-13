---
type: tasks
module: 'ACC'
---

# Identidad y acceso — Tareas

## ACC-TASK-001 — Especificar el módulo Identidad y acceso

- **Épica:** `EPIC-002`
- **Tipo:** Especificación
- **Estado:** Completada
- **Prioridad:** Alta
- **Alcance:** Todo el brief; casos `ACC-UC-001` a `ACC-UC-012`, con el alcance de plataforma y dispositivos delimitado por `ACC-Q-017` y `ACC-Q-021`.
- **Depende de:** Ninguna
- **Plan:** No aplica
- **Bloqueo:** Ninguno. Especificación aprobada por el Ingeniero el 03/11/2026.

## ACC-TASK-002 — Administrar Cuentas de Empresa

- **Épica:** `EPIC-002`
- **Tipo:** Implementación
- **Estado:** En verificación
- **Prioridad:** Alta
- **Alcance:** `ACC-UC-001`, `ACC-UC-008`, `ACC-UC-010`, `ACC-UC-012`
- **Depende de:** `ACC-TASK-001`; contratos acordados de `ACC-DEP-001`, `ACC-DEP-002`, `ACC-DEP-003`.
- **Plan:** `planes/PLAN-ACC-0001-modulo-identidad-acceso.md`
- **Bloqueo:** Ninguno. Plan `PLAN-ACC-0001` aprobado por el Ingeniero el 11/11/2026.

## ACC-TASK-003 — Autenticar y autorizar cuentas de Empresa

- **Épica:** `EPIC-002`
- **Tipo:** Implementación
- **Estado:** En verificación
- **Prioridad:** Alta
- **Alcance:** `ACC-UC-002`, `ACC-UC-003`, `ACC-UC-004`, `ACC-UC-005`, `ACC-UC-009`
- **Depende de:** `ACC-TASK-001`, `ACC-TASK-002`; contratos de `ACC-DEP-001`, `ACC-DEP-002`.
- **Plan:** `planes/PLAN-ACC-0001-modulo-identidad-acceso.md`
- **Bloqueo:** Ninguno. Plan `PLAN-ACC-0001` aprobado por el Ingeniero el 11/11/2026.

## ACC-TASK-004 — Administrar acceso de plataforma y soporte

- **Épica:** `EPIC-002`
- **Tipo:** Implementación
- **Estado:** En verificación
- **Prioridad:** Alta
- **Alcance:** `ACC-UC-006`, `ACC-UC-007`, `ACC-UC-011`, dentro de la delimitación de `ACC-Q-017`.
- **Depende de:** `ACC-TASK-001`; contrato de Empresa en `ACC-DEP-001` y contexto de `ACC-DEP-004`.
- **Plan:** `planes/PLAN-ACC-0001-modulo-identidad-acceso.md`
- **Bloqueo:** Ninguno. Plan `PLAN-ACC-0001` aprobado por el Ingeniero el 11/11/2026.

## ACC-TASK-005 — Especificar el alcance territorial del Capataz

- **Épica:** `EPIC-002`
- **Tipo:** Especificación
- **Estado:** Completada
- **Prioridad:** Alta
- **Alcance:** `ACC-Q-022`, `ACC-Q-023`; `ACC-BR-023` a `ACC-BR-029`; `ACC-REQ-013` a `ACC-REQ-017`; `ACC-UC-013` a `ACC-UC-017`; `ACC-ENT-006`; `ACC-DEP-005`.
- **Depende de:** `ACC-TASK-001`; especificación aprobada de Chacras en `TER-TASK-001`.
- **Plan:** No aplica
- **Bloqueo:** Ninguno. Especificación aprobada por el Ingeniero el 12/11/2026.

## ACC-TASK-006 — Administrar asignaciones de Capataz a Chacras

- **Épica:** `EPIC-002`
- **Tipo:** Implementación
- **Estado:** Bloqueada
- **Prioridad:** Alta
- **Alcance:** `ACC-UC-013` a `ACC-UC-017`; `ACC-BR-023` a `ACC-BR-029`; `ACC-ENT-006`; `ACC-DEP-005`.
- **Depende de:** `ACC-TASK-005`; contrato público de validación de Chacras de `TER`; `ACC-DEP-004`; `TER-DEP-002`; `CMN-TASK-002`; `CMN-TASK-003`.
- **Plan:** `planes/PLAN-ACC-0002-asignar-capataz-a-chacras.md`
- **Bloqueo:** `PLAN-ACC-0002` continúa `Bloqueado`: falta disponer del puerto público de Chacra de `PLAN-TER-0001`, ejecutar `CMN-TASK-002` y `CMN-TASK-003`, y cerrar o verificar conformes `PLAN-CMN-0001` y `PLAN-ACC-0001`. ACC es dueño de consultar sus asignaciones ACTIVA por solicitud y proyectarlas al `ContextoSolicitud`; ningún consumidor accede directamente a sus tablas.
