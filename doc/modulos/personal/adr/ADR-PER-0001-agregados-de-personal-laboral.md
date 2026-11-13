---
type: adr
id: ADR-PER-0001
title: "Agregados para ficha laboral y novedades de Personal"
status: Aceptado
scope: ["PER"]
date: 2026-11-13
supersedes: null
---

# ADR-PER-0001 — Agregados para ficha laboral y novedades de Personal

## Contexto

`PER-TASK-002` incorpora una ficha laboral con Períodos, Contactos de emergencia y Licencias, además de Restricciones operativas e Indisponibilidades que tienen vigencia, anulación, auditoría y crecimiento histórico independientes. La frontera elegida debe proteger invariantes sin cargar ni bloquear colecciones no relacionadas.

## Alternativas

### A — Empleado raíz y novedades como raíces independientes

- `Empleado` gobierna `PER-ENT-001`, `PER-ENT-002`, `PER-ENT-003` y `PER-ENT-006`.
- `RestriccionOperativa` e `Indisponibilidad` son raíces propias referenciadas por `empleadoId` y `empresaId`.
- **A favor:** ciclo laboral y datos de ficha consistentes; novedades versionables y consultables sin cargar toda la historia del Empleado.
- **En contra:** requiere tres repositorios de escritura y coordinación en Aplicación.

### B — Un agregado Empleado con todas las colecciones

- **A favor:** una sola raíz conceptual y repositorio.
- **En contra:** el historial de novedades crece sin límite práctico, aumenta conflictos de versión y obliga a cargar datos no requeridos.

## Decisión

- **Elegida:** A.
- **Motivo:** las invariantes de una novedad se resuelven dentro de ella y solo necesitan verificar identidad, estado y Empresa del Empleado mediante Aplicación; no requieren una transacción permanente con toda la ficha.
- **Decidió:** Parodi Lucas — 2026-11-13.

## Consecuencias

- El repositorio de Empleados persiste la ficha y sus entidades hijas como una unidad.
- Restricciones e Indisponibilidades tienen repositorios, versiones y consultas separados.
- Las referencias entre raíces usan identificadores y Empresa; no se exponen entidades mutables entre agregados.
- La anulación de novedades conserva `PER-BR-028` sin modificar la versión del agregado Empleado.
