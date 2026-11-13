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
updated: 2026-11-13
approved_by: null
---

# PLAN-ACC-0002 — Asignar Capataz a Chacras

## 1. Objetivo y alcance

- **Tarea:** `ACC-TASK-006`.
- **Implementa:** `ACC-UC-013` a `ACC-UC-017`, `ACC-BR-023` a `ACC-BR-029`, `ACC-ENT-006` y `ACC-DEP-005`.
- **Resultado observable:** `ACC` administra el alcance territorial vigente de una Cuenta de Empresa con rol Capataz; en cada solicitud autenticada que requiere alcance consulta sus propias asignaciones ACTIVA mediante `ACC-UC-017` e incorpora al `ContextoSolicitud` canónico una proyección `{ chacras: string[] }`, incluida la selección vacía, que `TER` consume mediante `TER-DEP-002`.
- **Dependencias:** `ACC-DEP-004`, `TER-DEP-002`, contrato público de `TER` para validar identidad, Empresa y estado de Chacra; `ContextoSolicitud` canónico de `src/comun/aplicacion`; `CMN-TASK-002` para persistencia ejecutable y `CMN-TASK-003` para idempotencia persistente.
- **No incluye:** modificar datos o geometrías de Chacras y Lotes; consultar directamente tablas de TER; permitir que TER consulte tablas de ACC; guardar el alcance en un JWT de larga vigencia; gestionar la ficha laboral del Empleado; crear roles nuevos; asignar Cuadrillas o Labores; reabrir `PLAN-ACC-0001`.

## 2. Preparación

- [x] Existe una tarea exclusiva de implementación: `ACC-TASK-006`.
- [x] `TER-Q-008` y `TER-DEP-002` asignan a `ACC` la propiedad del alcance de Chacras del Capataz.
- [x] `ACC-TASK-005` está `Completada`; `ACC-Q-022`, `ACC-Q-023`, `ACC-BR-023` a `ACC-BR-029`, `ACC-REQ-013` a `ACC-REQ-017`, `ACC-UC-013` a `ACC-UC-017`, `ACC-ENT-006` y `ACC-DEP-005` están `Aprobado`.
- [x] Se verificó la capacidad canónica existente de `ContextoSolicitud` en `src/comun/aplicacion` conforme a arquitectura.md §6.1.
- [x] Existen reglas, requerimientos, casos de uso, escenarios, entidad lógica y dependencia funcional de ACC para la asignación.
- [ ] El contrato HTTP de ACC y el contrato público entre ACC y TER están definidos con códigos de error completos.
- [x] `TER-TASK-002` y `PLAN-TER-0001` son dueños de implementar el contrato público de TER exigido por `ACC-DEP-005`; su forma técnica fue aprobada en D-12 del plan de TER el 2026-11-12.
- [x] `CMN-TASK-002`/`PLAN-CMN-0002` y `CMN-TASK-003`/`PLAN-CMN-0003` asignan dueño al bootstrap compartido y a la idempotencia persistente.
- [ ] `CMN-TASK-002` y `CMN-TASK-003` están implementadas y sus APIs públicas son ejecutables.
- [ ] `PLAN-CMN-0001` y `PLAN-ACC-0001` están cerrados o su verificación confirmó que sus contratos base son reutilizables por esta entrega.

**Bloqueos:**

1. `ACC-DEP-005` exige que TER provea identidad, Empresa y estado de Chacra. `TER-TASK-002` y `PLAN-TER-0001` ya son dueños del puerto público y D-12 está aprobada, pero el módulo debe implementarse antes de que ACC pueda integrarlo. ACC no puede leer tablas ajenas ni sustituirlo por un adaptador que acepte cualquier identificador.
2. Las escrituras de `ACC-UC-013` a `ACC-UC-015` dependen de `CMN-TASK-003`. El plan común ya existe, pero su API transaccional todavía no está implementada; ACC no crea una copia local.
3. `src/modulos/identidad-acceso/aplicacion/puertos/contexto-solicitud.ts` duplica el contrato canónico y omite `alcance`. La implementación de este plan debe eliminar el contrato local, migrar imports al índice público de `src/comun/aplicacion` y construir `{ chacras: chacraIdsActivos }` desde el repositorio propio de asignaciones en cada resolución de `ACC-UC-017`.
4. El OpenAPI de ACC no contiene todavía `ACC-UC-013` a `ACC-UC-016`; se completará al reanudar este plan cuando los contratos técnicos anteriores sean ejecutables, conforme al paso de preparación de Fase 2.

**Próximos pasos obligatorios:** aprobar y ejecutar `PLAN-CMN-0002` y `PLAN-CMN-0003`; cerrar o verificar conformes `PLAN-CMN-0001` y `PLAN-ACC-0001`; disponer del contrato público de Chacra de `PLAN-TER-0001`. Cumplidos esos prerrequisitos, reanudar este plan desde §3, completar OpenAPI, decisiones, tareas y riesgos, y recién entonces cambiarlo a `En revisión`.
