---
type: module-readme
module: "ACC"
normative: false
---

# Identidad y acceso

> Documento descriptivo. Las decisiones pertenecen al brief, las respuestas del Ingeniero y los archivos normativos del módulo.

## De qué se trata

Identidad y acceso organiza Cuentas de Empresa tenant-scoped, intervenciones de plataforma y el alcance territorial de las Cuentas con rol Capataz. No existe una entidad Persona global: el Administrador puede tener una Cuenta sin ficha laboral y un Empleado solo se vincula mediante `empleadoId` cuando necesita acceso. La especificación, incluida la ampliación territorial de `ACC-TASK-005`, fue aprobada por el Ingeniero; todavía no está implementada.

El vínculo opcional con Empleados se valida con Personal y se conserva en ACC. Los datos de Empresa y su alias se coordinan con Empresas conforme a `EMP-BR-011` a `EMP-BR-013`; la habilitación comercial y sus cupos dependen del contrato de Suscripciones o de su sustituto provisional.

## Qué se puede hacer

| Actor | Capacidad aprobada | Referencia |
|---|---|---|
| Administrador y SuperAdministrador en el contexto pertinente | Habilitación de cuentas | `ACC-UC-001` |
| Titular de una Cuenta de Empresa | Inicio de sesión y autorización vigente | `ACC-UC-002`, `ACC-UC-003` |
| Titular de una Cuenta de Empresa | Cambio de contraseña y renovación | `ACC-UC-004`, `ACC-UC-009` |
| Administrador y soporte autorizado | Restablecimiento de contraseña | `ACC-UC-005` |
| Plataforma | Creación de SuperAdministrador e intervención de soporte | `ACC-UC-006`, `ACC-UC-007` |
| Administración autorizada | Consulta de cuentas, gestión de acceso e historial de soporte | `ACC-UC-008`, `ACC-UC-010`, `ACC-UC-011` |
| Administrador y soporte autorizado | Vinculación posterior de una Cuenta con un Empleado | `ACC-UC-012` |
| Administrador y soporte autorizado | Asignación, inactivación y reactivación territorial | `ACC-UC-013` a `ACC-UC-015` |
| Administrador, Capataz y soporte autorizado | Consulta de asignaciones según alcance | `ACC-UC-016` |
| Capataz | Resolución del alcance territorial vigente | `ACC-UC-017` |

La fuente de permisos es la matriz aprobada de `identidad-acceso.use-case.md`.

## Reglas y datos

El catálogo de reglas está en `identidad-acceso.requerimientos.md`. Las entidades aprobadas, incluida la asignación territorial, están en `identidad-acceso.modelo-datos.md`; sus restricciones referencian las reglas y las convenciones transversales.

## Estado

- Las veintitrés preguntas registradas tienen veintidós respuestas y una pregunta descartada. `ACC-Q-022` y `ACC-Q-023` documentan las decisiones territoriales respondidas el 12/11/2026.
- La especificación aprobada contiene veintinueve reglas, diecisiete requerimientos, cinco dependencias, diecisiete casos de uso y seis entidades lógicas.
- Administración y multiplicidad de roles: `ACC-Q-016`; cambio de credenciales y sesiones: `ACC-Q-018`.
- El modelo de Cuenta de Empresa y Empleado se define en `ACC-Q-019`, `ACC-Q-020` y `ADR-0010`; `personaId` no forma parte de la especificación.
- El `.env` se limita al bootstrap o recuperación operativa de plataforma según `ACC-Q-017` y `ACC-Q-021`; la identidad de SuperAdministrador permanece persistida y auditable.
- Las longitudes y la normalización de correo, contraseña y motivo de soporte están definidas por `ACC-BR-018` a `ACC-BR-020`; el alias de Empresa se resuelve por el contrato aprobado de EMP.
- El alcance territorial aprobado se define en `ACC-BR-023` a `ACC-BR-029`, `ACC-UC-013` a `ACC-UC-017`, `ACC-ENT-006` y `ACC-DEP-005`; `ACC-TASK-006` está lista para reanudar su planificación.
- Los contratos técnicos con Personal, Suscripciones y Territorio se concretarán durante la planificación respetando las dependencias correspondientes. La especificación no se declara implementada ni se dan por ejecutadas pruebas de código.

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

