---
type: module-readme
module: "EMP"
normative: false
---

# Empresas

> **Documento descriptivo.** Resume la especificación para lectura humana. Ante diferencias mandan los archivos normativos del módulo.

## De qué se trata

El módulo Empresas administra la identidad, los datos descriptivos, el estado y la configuración general de cada Empresa cliente. La Empresa es la referencia que utilizan los demás módulos para aislar la información, pero sus Usuarios, Empleados, Chacras, Suscripciones y operaciones permanecen bajo sus respectivos módulos dueños.

El alcance aprobado incluye registro, consulta, listado, modificación, suspensión, reactivación y cierre. La representación del responsable está resuelta en `EMP-Q-010`, y los límites de textos, las modificaciones según estado y el alias estable de Empresa quedaron resueltos en `EMP-Q-011` a `EMP-Q-013`.

## Qué se puede hacer

| Quién | Qué | Detalle |
|---|---|---|
| SuperAdministrador | Registrar Empresas con alias estable y listarlas | `EMP-UC-001`, `EMP-UC-003` |
| SuperAdministrador | Consultar y modificar Empresas | `EMP-UC-002`, `EMP-UC-004`, `EMP-UC-008` |
| SuperAdministrador | Administrar el ciclo de vida | `EMP-UC-005`, `EMP-UC-006`, `EMP-UC-007` |
| Administrador | Consultar y modificar su propia Empresa | `EMP-UC-002`, `EMP-UC-004`, `EMP-UC-008` |

Los permisos derivan de `EMP-Q-001` y las restricciones de modificación por estado de `EMP-Q-012`.

## Reglas principales

- La Empresa necesita un nombre (`EMP-BR-001`).
- La ubicación geográfica opcional debe ser coherente (`EMP-BR-002`).
- El CUIT opcional sigue el formato acordado (`EMP-BR-003`).
- El ciclo de vida conserva la historia (`EMP-BR-004`, `EMP-BR-005`, `EMP-BR-008`).
- La configuración general evita mezclar configuraciones funcionales (`EMP-BR-006`).
- El Administrador queda limitado a su contexto de Empresa (`EMP-BR-007`).
- La asociación comercial se contempla sin implementar Suscripciones dentro de este módulo (`EMP-BR-009`).
- Los textos descriptivos siguen los límites y la normalización aprobados (`EMP-BR-010`).
- El alias de Empresa es válido, único, no reutilizable e inmutable (`EMP-BR-011` a `EMP-BR-013`).
- Las modificaciones dependen del estado de la Empresa (`EMP-BR-014`).

## Relación con otros módulos

- **Identidad y acceso:** aporta contexto y permisos; consume identidad, alias y estado de Empresa (`EMP-DEP-001`, `EMP-DEP-003`).
- **Suscripciones:** será dueño de la asignación comercial (`EMP-DEP-002`).
- **Economía:** mantiene configuración económica propia (`EMP-DEP-004`).
- **Labores:** mantiene configuración de labores propia (`EMP-DEP-005`).

## Qué no hace

- No administra Usuarios, Cuentas de Empresa, roles, permisos ni Sesiones.
- No administra Empleados ni Capataces.
- No administra Chacras, Lotes o geometría productiva.
- No implementa Planes de suscripción ni facturación SaaS.
- No guarda toda configuración del sistema en una estructura genérica.

## Estado

La especificación aprobada contiene ocho casos de uso y las trece preguntas respondidas. Las decisiones sobre CUIT, permisos, ubicación, configuración, estados, responsable, límites de textos y alias están incorporadas. No quedan preguntas abiertas; la tarea de especificación está completada y las dos tareas de implementación están `Lista`.

## Archivos

| Archivo | Contenido |
|---|---|
| `empresas.brief.md` | Descripción original del Ingeniero. |
| `empresas.preguntas.md` | Preguntas y respuestas del Ingeniero. |
| `empresas.requerimientos.md` | Reglas, requerimientos, dependencias y exclusiones. |
| `empresas.use-case.md` | Actores, permisos, flujos y escenarios. |
| `empresas.modelo-datos.md` | Entidades, atributos, estados e índices necesarios. |
| `empresas.task.md` | Tareas del módulo. |
| `adr/` | Decisiones específicas futuras. |
| `planes/` | Planes creados únicamente en fase 2. |
