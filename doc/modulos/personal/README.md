---
type: module-readme
module: "PER"
normative: false
---

# Personal

> **Documento descriptivo.** Resume la especificación para lectura humana. No es fuente para decisiones: ante cualquier diferencia mandan `requerimientos`, `use-case` y `modelo-datos`. Se regenera cuando la especificación cambia.

## De qué se trata

Personal gestiona la ficha laboral de cada Empleado dentro de una Empresa, sus períodos de actividad, datos opcionales, restricciones operativas e indisponibilidades. Un Empleado puede no tener acceso al sistema; cuando lo necesita, PER se integra con Identidad y acceso sin asumir la propiedad de sus credenciales.

El módulo también administra Cuadrillas con integrantes, responsables y líderes vigentes, conserva su historia y permite al Capataz registrar la asistencia diaria de cualquier Empleado activo de su Empresa. La remuneración se configura por modalidad y PER calcula el bruto devengado, mientras Economía conserva la obligación y el pago.

Todos los registros están aislados por Empresa mediante `empresaId`. Los códigos y demás unicidades son propios de cada tenant (`PER-BR-001`).

## Qué se puede hacer

| Quién | Qué | Detalle |
|---|---|---|
| Administrador | Administrar Empleados y su información laboral | `PER-UC-001` |
| Administrador | Habilitar o revocar el acceso de un Empleado | `PER-UC-002` |
| Administrador | Administrar restricciones e indisponibilidades | `PER-UC-003` |
| Capataz | Crear y operar sus Cuadrillas | `PER-UC-004`, `PER-UC-005` |
| Administrador | Reasignar responsables y consultar la historia de una Cuadrilla | `PER-UC-006` |
| Capataz | Consultar la composición actual de sus Cuadrillas | `PER-UC-007` |
| Capataz | Registrar y confirmar asistencia | `PER-UC-008` |
| Administrador | Corregir una asistencia confirmada con auditoría | `PER-UC-009` |
| Empleado con acceso | Consultar su información laboral propia | `PER-UC-010` |
| Administrador | Configurar modalidades de remuneración | `PER-UC-011` |
| Sistema | Calcular el bruto devengado | `PER-UC-012` |
| Sistemas consumidores | Resolver contexto operativo de Personal | `PER-UC-013` |

## Reglas principales

- Cada Empleado pertenece a una Empresa y su documento es único solo dentro de ella (`PER-BR-001`, `PER-BR-002`).
- La ficha laboral y el acceso al sistema son conceptos separados; inactivar al Empleado suspende su acceso, pero reactivarlo no lo habilita automáticamente (`PER-BR-007`, `PER-BR-008`).
- Los Empleados y las Cuadrillas conservan su historia y no se eliminan físicamente (`PER-BR-005`, `PER-BR-010`).
- Una persona puede integrar varias Cuadrillas vigentes y cada alta, baja o liderazgo mantiene su período (`PER-BR-013`, `PER-BR-014`).
- Solo existe una Asistencia por Empleado y fecha, con resultado explícito e intervalos opcionales válidos (`PER-BR-016`, `PER-BR-017`, `PER-BR-018`).
- Una indisponibilidad vigente impide registrar presencia y genera una ausencia justificada (`PER-BR-022`).
- La remuneración admite modalidades mensual, jornal, por hora, por Labor, por producción y mixta, con vigencia y valor histórico (`PER-BR-023`, `PER-BR-025`, `PER-BR-026`).

## Relación con otros módulos

- **Empresas:** identidad, pertenencia y vigencia de la Empresa (`PER-DEP-001`).
- **Suscripciones:** cupo de Empleados activos permitido (`PER-DEP-002`).
- **Identidad y acceso:** Cuenta de Empresa, credenciales, permisos y suspensión de acceso (`PER-DEP-003`).
- **Archivos:** evidencias privadas y documentación adjunta (`PER-DEP-004`).
- **Labores:** trabajo, ubicación y cantidades confirmadas (`PER-DEP-005`).
- **Cosechas:** cantidades productivas confirmadas (`PER-DEP-006`).
- **Economía:** recepción del bruto devengado para gestionar obligación y pago (`PER-DEP-007`).

## Qué no hace

- No administra contraseñas, Sesiones ni permisos de acceso.
- No define planes de suscripción ni cobra suscripciones.
- No conserva el contenido binario de evidencias.
- No administra la ejecución de Labores ni Cosechas.
- No liquida impuestos, aportes, recibos legales ni pagos.
- No prorratea automáticamente la modalidad mensual por ausencias.

## Estado

La especificación fue aprobada por el Ingeniero el 06/11/2026. Contiene 27 reglas de negocio, 14 requerimientos, 7 dependencias, 13 casos de uso y 18 entidades. No hay casos de uso implementados.

No quedan preguntas abiertas. `PER-Q-032` confirmó que PER es dueño de las tarifas de remuneración; `PER-Q-040` confirmó que LAB o COS atribuyen cantidades individuales a cada Empleado para que PER calcule su remuneración sin repartos implícitos.

## Archivos

| Archivo | Contenido |
|---|---|
| `personal.brief.md` | Descripción original del ingeniero |
| `personal.preguntas.md` | Preguntas y respuestas |
| `personal.requerimientos.md` | Reglas, requerimientos y dependencias |
| `personal.use-case.md` | Casos de uso y permisos |
| `personal.modelo-datos.md` | Entidades y relaciones |
| `personal.task.md` | Tareas del módulo |
| `adr/` | Decisiones del módulo |
| `planes/` | Planes e historial de implementación |
