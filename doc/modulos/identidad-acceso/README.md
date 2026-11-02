---
type: module-readme
module: "ACC"
normative: false
---

# Identidad y acceso

> Documento descriptivo. Las decisiones pertenecen al brief, las respuestas del Ingeniero y los archivos normativos del módulo.

## De qué se trata

Identidad y acceso organiza el acceso de las personas a las Empresas cliente y las intervenciones de plataforma. La especificación propuesta deriva de las respuestas registradas; todavía no está aprobada ni implementada.

Las referencias a Personas y Empleados se resuelven con Personal. Los datos de Empresa y sus alias se coordinan con Empresas; la habilitación comercial y sus cupos dependen del contrato de Suscripciones o de su sustituto provisional.

## Qué se puede hacer

| Actor | Capacidad propuesta | Referencia |
|---|---|---|
| Administrador y SuperAdministrador en el contexto pertinente | Habilitación de cuentas | `ACC-UC-001` |
| Titular de una Cuenta de Empresa | Inicio de sesión y autorización vigente | `ACC-UC-002`, `ACC-UC-003` |
| Titular de una Cuenta de Empresa | Cambio de contraseña y renovación | `ACC-UC-004`, `ACC-UC-009` |
| Administrador y soporte autorizado | Restablecimiento de contraseña | `ACC-UC-005` |
| Plataforma | Creación de SuperAdministrador e intervención de soporte | `ACC-UC-006`, `ACC-UC-007` |
| Administración autorizada | Consulta de cuentas, gestión de acceso e historial de soporte | `ACC-UC-008`, `ACC-UC-010`, `ACC-UC-011` |

La fuente de permisos es la matriz de `identidad-acceso.use-case.md`. Las filas con preguntas pendientes no habilitan su implementación.

## Reglas y datos

El catálogo de reglas está en `identidad-acceso.requerimientos.md`. Las entidades propuestas están en `identidad-acceso.modelo-datos.md`; sus restricciones referencian las reglas y las convenciones transversales.

## Estado y pendientes

- Las dieciocho preguntas registradas tienen diecisiete respuestas y una pregunta descartada. Las decisiones recientes fueron incorporadas el 02/11/2026.
- El borrador contiene diecisiete reglas, once requerimientos, cuatro dependencias, once casos de uso con escenarios y cinco entidades lógicas.
- Administración y multiplicidad de roles: `ACC-Q-016`; cambio de credenciales y sesiones: `ACC-Q-018`.
- El mecanismo operativo de acceso y recuperación de plataforma queda a cargo del Ingeniero según `ACC-Q-017`. Las capacidades no detalladas en esa respuesta se delimitan en los requerimientos; no se consideran aprobadas por omisión.
- Las longitudes y normalización de credenciales y los contratos de alias, persona y habilitación comercial siguen pendientes de detalle antes de planificar.
- La redacción refinada permanece Propuesta, pendiente de revisión y aprobación; no se declara implementada ni se dan por ejecutadas pruebas de código.

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

