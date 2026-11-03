---
type: module-readme
module: "ACC"
normative: false
---

# Identidad y acceso

> Documento descriptivo. Las decisiones pertenecen al brief, las respuestas del Ingeniero y los archivos normativos del módulo.

## De qué se trata

Identidad y acceso organiza el acceso de las personas a las Empresas cliente y las intervenciones de plataforma. La especificación fue aprobada por el Ingeniero; todavía no está implementada.

Las referencias a Personas y Empleados se resuelven con Personal. Los datos de Empresa y su alias se coordinan con Empresas conforme a `EMP-BR-011` a `EMP-BR-013`; la habilitación comercial y sus cupos dependen del contrato de Suscripciones o de su sustituto provisional.

## Qué se puede hacer

| Actor | Capacidad aprobada | Referencia |
|---|---|---|
| Administrador y SuperAdministrador en el contexto pertinente | Habilitación de cuentas | `ACC-UC-001` |
| Titular de una Cuenta de Empresa | Inicio de sesión y autorización vigente | `ACC-UC-002`, `ACC-UC-003` |
| Titular de una Cuenta de Empresa | Cambio de contraseña y renovación | `ACC-UC-004`, `ACC-UC-009` |
| Administrador y soporte autorizado | Restablecimiento de contraseña | `ACC-UC-005` |
| Plataforma | Creación de SuperAdministrador e intervención de soporte | `ACC-UC-006`, `ACC-UC-007` |
| Administración autorizada | Consulta de cuentas, gestión de acceso e historial de soporte | `ACC-UC-008`, `ACC-UC-010`, `ACC-UC-011` |

La fuente de permisos es la matriz aprobada de `identidad-acceso.use-case.md`.

## Reglas y datos

El catálogo de reglas está en `identidad-acceso.requerimientos.md`. Las entidades aprobadas están en `identidad-acceso.modelo-datos.md`; sus restricciones referencian las reglas y las convenciones transversales.

## Estado

- Las dieciocho preguntas registradas tienen diecisiete respuestas y una pregunta descartada. Las últimas decisiones fueron incorporadas y aprobadas el 03/11/2026.
- La especificación aprobada contiene veinte reglas, once requerimientos, cuatro dependencias, once casos de uso con escenarios y cinco entidades lógicas.
- Administración y multiplicidad de roles: `ACC-Q-016`; cambio de credenciales y sesiones: `ACC-Q-018`.
- El mecanismo operativo de acceso y recuperación de plataforma queda a cargo del Ingeniero según `ACC-Q-017`. Las capacidades no detalladas en esa respuesta se delimitan en los requerimientos; no se consideran aprobadas por omisión.
- Las longitudes y la normalización de correo, contraseña y motivo de soporte están definidas por `ACC-BR-018` a `ACC-BR-020`; el alias de Empresa se resuelve por el contrato aprobado de EMP.
- Los contratos técnicos con Personal y Suscripciones se concretarán durante la planificación respetando las dependencias aprobadas. La especificación no se declara implementada ni se dan por ejecutadas pruebas de código.

## Archivos

| Archivo | Contenido |
|---|---|
| `identidad-acceso.brief.md` | Texto original del Ingeniero |
| `identidad-acceso.preguntas.md` | Preguntas, respuestas y propuestas |
| `identidad-acceso.requerimientos.md` | Reglas, capacidades y dependencias |
| `identidad-acceso.use-case.md` | Actores, matriz de permisos, flujos y escenarios |
| `identidad-acceso.modelo-datos.md` | Entidades lógicas, relaciones y restricciones |
| `identidad-acceso.task.md` | Trabajo propuesto y bloqueos |
| `adr/` | Decisiones futuras propias del módulo |
| `planes/` | Planes de implementación posteriores a aprobación |

