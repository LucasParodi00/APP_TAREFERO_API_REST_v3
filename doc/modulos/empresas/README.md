---
type: module-readme
module: "EMP"
normative: false
---

# Empresas

> **Documento descriptivo.** Resume la especificación para lectura humana. Ante diferencias mandan los archivos normativos del módulo.

## De qué se trata

El módulo Empresas administra la identidad, los datos descriptivos, el estado y la configuración general de cada Empresa cliente. La Empresa es la referencia que utilizan los demás módulos para aislar la información, pero sus Usuarios, Empleados, Chacras, Suscripciones y operaciones permanecen bajo sus respectivos módulos dueños.

La propuesta incluye registro, consulta, listado, modificación, suspensión, reactivación y cierre. La representación del responsable está resuelta en `EMP-Q-010`; falta revisar y aprobar los ítems refinados.

## Qué se puede hacer

| Quién | Qué | Detalle |
|---|---|---|
| SuperAdministrador | Registrar y listar Empresas | `EMP-UC-001`, `EMP-UC-003` |
| SuperAdministrador | Consultar y modificar Empresas | `EMP-UC-002`, `EMP-UC-004`, `EMP-UC-008` |
| SuperAdministrador | Administrar el ciclo de vida | `EMP-UC-005`, `EMP-UC-006`, `EMP-UC-007` |
| Administrador | Consultar y modificar su propia Empresa | `EMP-UC-002`, `EMP-UC-004`, `EMP-UC-008` |

Los permisos derivan de la respuesta a `EMP-Q-001`; su redacción refinada permanece Propuesta hasta revisión y aprobación.

## Reglas principales

- La Empresa necesita un nombre (`EMP-BR-001`).
- La ubicación geográfica opcional debe ser coherente (`EMP-BR-002`).
- El CUIT opcional sigue el formato acordado (`EMP-BR-003`).
- El ciclo de vida propuesto conserva la historia (`EMP-BR-004`, `EMP-BR-005`, `EMP-BR-008`).
- La configuración general propuesta evita mezclar configuraciones funcionales (`EMP-BR-006`).
- El Administrador queda limitado a su contexto de Empresa (`EMP-BR-007`).
- La asociación comercial se contempla sin implementar Suscripciones dentro de este módulo (`EMP-BR-009`).

## Relación con otros módulos

- **Identidad y acceso:** aporta contexto y permisos; consume identidad y estado de Empresa (`EMP-DEP-001`, `EMP-DEP-003`).
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

La especificación contiene ocho casos de uso propuestos y las diez preguntas respondidas. Las decisiones sobre CUIT, permisos, ubicación, configuración y estados se incorporaron. El responsable quedó definido en `EMP-Q-010` e incorporado al modelo. Los detalles de longitud de textos y la aprobación de la redacción refinada siguen pendientes antes de planificar.

## Archivos

| Archivo | Contenido |
|---|---|
| `empresas.brief.md` | Descripción original del Ingeniero. |
| `empresas.preguntas.md` | Preguntas y propuestas pendientes. |
| `empresas.requerimientos.md` | Reglas, requerimientos, dependencias y exclusiones. |
| `empresas.use-case.md` | Actores, permisos, flujos y escenarios. |
| `empresas.modelo-datos.md` | Entidades, atributos, estados e índices necesarios. |
| `empresas.task.md` | Tareas del módulo. |
| `adr/` | Decisiones específicas futuras. |
| `planes/` | Planes creados únicamente en fase 2. |
