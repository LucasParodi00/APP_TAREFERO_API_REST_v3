---
type: module-readme
module: "OBS"
normative: false
---

# Observaciones

> **Documento descriptivo.** Resume la especificación para lectura humana. No es fuente para decisiones: ante cualquier diferencia mandan `requerimientos`, `use-case` y `modelo-datos`.

## De qué se trata

El módulo registra el historial fenológico de cada Implantación y los hallazgos generales, operativos o sanitarios de una Empresa cliente. El catálogo de estados fenológicos pertenece a Contexto productivo; Observaciones conserva los períodos durante los que cada estado estuvo vigente.

Una Observación puede conservar urgencia, ubicación y contexto territorial o productivo cuando estén disponibles, además de evidencias privadas. Los hallazgos sanitarios agregan información estructurada cuya definición definitiva permanece en revisión.

Cuando un hallazgo requiere trabajo, el módulo puede solicitar a Labores una o varias Órdenes sin copiar su estado ni sus datos dentro de OBS. Completar una Orden no resuelve automáticamente el hallazgo.

## Qué se puede hacer

| Quién | Qué | Detalle |
|---|---|---|
| Administrador | Configurar Tipos de Observación | `OBS-UC-001` |
| Administrador o Capataz | Iniciar y actualizar el historial fenológico | `OBS-UC-002`, `OBS-UC-003` |
| Administrador | Corregir historial fenológico | `OBS-UC-004` |
| Administrador o Capataz | Consultar la evolución de una Implantación | `OBS-UC-005` |
| Administrador o Capataz | Registrar hallazgos generales o sanitarios | `OBS-UC-006`, `OBS-UC-007` |
| Administrador o Capataz | Vincular evidencias y seguimientos | `OBS-UC-008`, `OBS-UC-009` |
| Administrador o Capataz | Consultar Observaciones | `OBS-UC-010` |
| Administrador | Corregir o anular una Observación | `OBS-UC-011` |
| Administrador o Capataz | Generar Órdenes y confirmar resolución | `OBS-UC-012`, `OBS-UC-013` |

Los permisos anteriores fueron confirmados mediante `OBS-Q-016`.

## Reglas principales

- El historial tiene como máximo un período fenológico vigente por Implantación (`OBS-BR-001`).
- Las transiciones nuevas son cronológicas y las correcciones conservan versiones (`OBS-BR-003`, `OBS-BR-005`).
- Cada Empresa cliente mantiene sus propios Tipos de Observación (`OBS-BR-006`).
- Las referencias territoriales son opcionales pero deben ser compatibles cuando se informan (`OBS-BR-009`).
- La urgencia utiliza una escala común (`OBS-BR-011`).
- Los hallazgos sanitarios distinguen observación, sospecha y confirmación (`OBS-BR-016`).
- Una Observación puede originar varias Órdenes de Labor (`OBS-BR-020`).
- Una Orden completada no resuelve automáticamente la Observación (`OBS-BR-022`).
- Registrar una Observación no genera tratamientos, consumos ni cambios automáticos (`OBS-BR-023`).

## Relación con otros módulos

- **Empresas:** identidad y vigencia de la Empresa cliente (`OBS-DEP-001`).
- **Identidad y acceso:** actores, permisos y auditoría (`OBS-DEP-002`).
- **Contexto productivo:** Cultivos, Implantaciones, Perfiles y catálogo fenológico (`OBS-DEP-003`).
- **Territorio:** Chacras, Lotes y geometría (`OBS-DEP-004`).
- **Archivos:** evidencias privadas (`OBS-DEP-005`).
- **Labores:** Órdenes originadas por hallazgos (`OBS-DEP-006`).
- **Personal:** Empleado que realizó materialmente la observación (`OBS-DEP-007`).

## Qué no hace

- No define Cultivos, Implantaciones, Chacras ni Lotes.
- No conserva los binarios de imágenes u otros Archivos.
- No planifica ni ejecuta las Órdenes de Labor.
- No genera automáticamente tratamientos, consumos o recomendaciones.
- No utiliza “Reporte” como identidad alternativa de una Observación.

## Estado

La especificación está en revisión para su aprobación integral. `OBS-Q-018`, sobre las reglas detalladas de evidencia, permanece abierta y no bloqueante. Las tareas de implementación permanecen bloqueadas hasta aprobar su alcance y completar las ampliaciones requeridas en Contexto productivo y Labores.

## Archivos

| Archivo | Contenido |
|---|---|
| `observaciones.brief.md` | Descripción original del ingeniero |
| `observaciones.preguntas.md` | Preguntas y respuestas |
| `observaciones.requerimientos.md` | Reglas, capacidades y dependencias |
| `observaciones.use-case.md` | Casos de uso y permisos |
| `observaciones.modelo-datos.md` | Entidades y relaciones |
| `observaciones.task.md` | Tareas del módulo |
| `adr/` | Decisiones del módulo |
| `planes/` | Planes e historial de implementación |
