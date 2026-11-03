---
type: module-readme
module: "TER"
normative: false
---

# Territorio

> Documento descriptivo. Las reglas, permisos y atributos pertenecen a los archivos normativos del módulo.

## De qué se trata

Territorio administra la estructura territorial estable de cada Empresa. La primera entrega de Chacras está aprobada; la segunda entrega propuesta incorpora Lotes, sus delimitaciones versionadas y su superficie cartográfica.

Los cultivos, implantaciones, labores, observaciones y cosechas conservan sus módulos dueños. Territorio aporta la identidad del Lote y Reportes puede reunir esos hechos en una línea temporal sin copiarlos dentro de `TER`.

## Capacidades

| Entrega | Capacidad | Referencia |
|---|---|---|
| Chacras, aprobada | Registrar, consultar, listar, modificar e inactivar | `TER-UC-001` a `TER-UC-005` |
| Lotes, aprobada | Registrar, consultar, listar y modificar datos descriptivos | `TER-UC-006` a `TER-UC-009` |
| Lotes, aprobada | Delimitar y conservar versiones geométricas | `TER-UC-010`, `TER-UC-013` |
| Lotes, aprobada | Inactivar y reactivar | `TER-UC-011`, `TER-UC-012` |

Los permisos se consultan en la matriz de `territorio.use-case.md`. Los datos lógicos están en `TER-ENT-001` a `TER-ENT-003`; las reglas y dependencias están en `territorio.requerimientos.md`.

## Relación con otros módulos

| Módulo | Relación | Referencia |
|---|---|---|
| Empresas | Contexto de la Empresa propietaria | `TER-DEP-001` |
| Identidad y acceso | Actor, permisos, asignaciones de Chacras y soporte | `TER-DEP-002` |
| Contexto productivo | Implantaciones y procesos activos del Lote | `TER-DEP-003` |
| Labores | Actividades, cuadrillas y empleados vinculados al Lote | `TER-DEP-004` |
| Observaciones | Seguimiento relacionado con el Lote | `TER-DEP-005` |
| Cosechas | Producción relacionada mediante la implantación | `TER-DEP-006` |
| Reportes | Línea temporal e identificadores legibles | `TER-DEP-007` |

## Estado

La entrega de Chacras contiene ocho reglas, cinco requerimientos, cinco casos de uso y una entidad aprobados. Fue aprobada por el Ingeniero el 03/11/2026; `TER-TASK-001` está completada y `TER-TASK-002` y `TER-TASK-003` están listas para planificación.

La entrega de Lotes contiene quince reglas, ocho requerimientos, cinco dependencias nuevas, ocho casos de uso y dos entidades aprobados. Todas sus decisiones están respondidas en `TER-Q-011` a `TER-Q-023`; no quedan preguntas abiertas. Fue aprobada por el Ingeniero el 03/11/2026: `TER-TASK-004` está completada y `TER-TASK-005`, `TER-TASK-006` y `TER-TASK-007` están listas para planificación.

La ubicación opcional de referencia de Chacra y la coordinación de estados con sus Lotes fueron aprobadas en `TER-Q-018` y `TER-Q-022`. Se incorporaron al alcance de `TER-TASK-002`, cuyo plan deberá declarar el cambio controlado sobre la primera entrega.

## Archivos

| Archivo | Contenido |
|---|---|
| `territorio.brief.md` | Texto literal del Ingeniero |
| `territorio.preguntas.md` | Preguntas, respuestas y decisiones pendientes |
| `territorio.requerimientos.md` | Reglas, capacidades, dependencias y exclusiones |
| `territorio.use-case.md` | Actores, permisos, flujos y escenarios |
| `territorio.modelo-datos.md` | Modelo lógico de Chacra, Lote y versiones geométricas |
| `territorio.task.md` | Trabajo aprobado, propuesto y bloqueos |
