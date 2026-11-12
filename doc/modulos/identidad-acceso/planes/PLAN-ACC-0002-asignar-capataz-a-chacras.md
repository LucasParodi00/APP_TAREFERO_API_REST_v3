---
type: plan
id: PLAN-ACC-0002
title: 'Asignar Capataz a Chacras'
module: 'ACC'
task:
    - ACC-TASK-006
status: Bloqueado
mode: estandar
created: 2026-11-12
updated: 2026-11-12
approved_by: null
---

# PLAN-ACC-0002 — Asignar Capataz a Chacras

## 1. Objetivo y alcance

- **Tarea:** `ACC-TASK-006`.
- **Implementa:** `ACC-UC-013` a `ACC-UC-017`, `ACC-BR-023` a `ACC-BR-029`, `ACC-ENT-006` y `ACC-DEP-005`.
- **Resultado observable:** `ACC` administra el alcance territorial vigente de una Cuenta de Empresa con rol Capataz y lo incorpora al `ContextoSolicitud` consumido por `TER` mediante `TER-DEP-002`.
- **Dependencias:** `ACC-DEP-004`, `TER-DEP-002`, contrato público de `TER` para validar identidad, Empresa y estado de Chacra, y `ContextoSolicitud` canónico de `src/comun/aplicacion`.
- **No incluye:** modificar datos o geometrías de Chacras y Lotes; gestionar la ficha laboral del Empleado; crear roles nuevos; asignar Cuadrillas o Labores; reabrir `PLAN-ACC-0001`.

## 2. Preparación

- [x] Existe una tarea exclusiva de implementación: `ACC-TASK-006`.
- [x] `TER-Q-008` y `TER-DEP-002` asignan a `ACC` la propiedad del alcance de Chacras del Capataz.
- [x] `ACC-TASK-005` está `Completada`; `ACC-Q-022`, `ACC-Q-023`, `ACC-BR-023` a `ACC-BR-029`, `ACC-REQ-013` a `ACC-REQ-017`, `ACC-UC-013` a `ACC-UC-017`, `ACC-ENT-006` y `ACC-DEP-005` están `Aprobado`.
- [x] Se verificó la capacidad canónica existente de `ContextoSolicitud` en `src/comun/aplicacion` conforme a arquitectura.md §6.1.
- [x] Existen reglas, requerimientos, casos de uso, escenarios, entidad lógica y dependencia funcional de ACC para la asignación.
- [ ] El contrato HTTP de ACC y el contrato público entre ACC y TER están definidos con códigos de error completos.
- [x] `TER-TASK-002` y `PLAN-TER-0001` son dueños de implementar el contrato público de TER exigido por `ACC-DEP-005`; su forma técnica fue aprobada en D-12 del plan de TER el 2026-11-12.
- [ ] Existe una capacidad transversal aprobada y ejecutable de idempotencia persistente conforme a convenciones.md §3.4 y `ADR-0013`.
- [ ] `PLAN-CMN-0001` y `PLAN-ACC-0001` están cerrados o su verificación confirmó que sus contratos base son reutilizables por esta entrega.

**Bloqueos:**

1. `ACC-DEP-005` exige que TER provea identidad, Empresa y estado de Chacra. `TER-TASK-002` y `PLAN-TER-0001` ya son dueños del puerto público y D-12 está aprobada, pero el módulo debe implementarse antes de que ACC pueda integrarlo. ACC no puede leer tablas ajenas ni sustituirlo por un adaptador que acepte cualquier identificador.
2. Las escrituras de `ACC-UC-013` a `ACC-UC-015` deben cumplir la idempotencia de convenciones.md §3.4. `src/comun` solo contiene el decorador de `Idempotency-Key`; no existe almacenamiento ni coordinación transaccional. `ADR-0013` impide crear una copia local en ACC y exige una tarea técnica común con plan aprobado.
3. `src/modulos/identidad-acceso/aplicacion/puertos/contexto-solicitud.ts` duplica el contrato canónico de `src/comun/aplicacion/puertos/contexto-solicitud.ts` y omite `alcance`. La corrección debe reutilizar la API pública común, pero la base `PLAN-CMN-0001` todavía está `En verificación` y `PLAN-ACC-0001` también continúa en verificación.
4. El OpenAPI de ACC no contiene todavía `ACC-UC-013` a `ACC-UC-016`; no se completa mientras los dos contratos técnicos anteriores carezcan de dueño ejecutable, porque la preparación de Fase 2 ordena detener el plan en este punto.

**Próximos pasos obligatorios:** ejecutar oportunamente `TER-TASK-002`/`PLAN-TER-0001`; crear y aprobar una tarea técnica común para idempotencia persistente; cerrar o verificar conformes `PLAN-CMN-0001` y `PLAN-ACC-0001`. Cumplidos esos prerrequisitos, reanudar este plan desde §3, completar OpenAPI, decisiones, tareas y riesgos, y recién entonces cambiarlo a `En revisión`.
