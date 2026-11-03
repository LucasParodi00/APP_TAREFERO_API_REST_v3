---
type: module-readme
module: "CUL"
normative: false
---

# Contexto productivo

> Documento descriptivo. Las decisiones pertenecen al brief, las respuestas del Ingeniero y los archivos normativos del módulo.

## De qué se trata

Contexto productivo identifica qué se cultiva en cada Lote mediante Implantaciones históricas y organiza el trabajo por Campañas y Ciclos productivos. Una Campaña pertenece a una Empresa cliente, puede abarcar Chacras completas y Lotes específicos y puede reunir varios Cultivos sin mezclar sus Ciclos.

Los Perfiles de cultivo definen campos tipados y versionados con precedencia Lote, Empresa cliente y base global. Los módulos de Labores, Observaciones y Cosechas conservan sus propios hechos; Reportes los proyecta por el contexto resuelto por CUL.

## Qué se puede hacer

| Actor | Capacidad aprobada | Referencia |
|---|---|---|
| SuperAdministrador | Administrar catálogo global y Perfiles base | `CUL-UC-001`, `CUL-UC-002` |
| Administrador | Configurar Perfiles, Implantaciones, Campañas y Ciclos | `CUL-UC-002` a `CUL-UC-009` |
| Administrador y Capataz | Consultar contexto autorizado | `CUL-UC-010` |
| Módulos operativos | Resolver referencias y restricciones productivas | `CUL-UC-011` |

## Reglas principales

- La historia se conserva por Implantación, Campaña y versión de Perfil.
- Una Campaña nueva comienza sin hechos propios y no borra resultados anteriores.
- Las Campañas pueden ser multicultivo y simultáneas con Ciclos diferentes.
- El alcance activo solo se amplía de forma explícita y auditada.
- La Campaña conserva fechas de inicio, finalización tentativa y finalización real para comparar lo estimado con lo ocurrido durante el período integral.
- Las Cosechas conservan además sus propias fechas independientes en `COS`.

## Relación con otros módulos

- Empresas aporta identidad y vigencia.
- Territorio aporta Chacras, Lotes, estado y superficie.
- Labores, Observaciones y Cosechas guardan los hechos.
- Reportes reconstruye indicadores.
- Inventario aporta el catálogo de unidades.

## Estado

Las veintidós preguntas fueron respondidas y la especificación completa fue aprobada por el Ingeniero el 03/11/2026. No se declara implementada ni se dan por ejecutadas pruebas de código.

## Archivos

| Archivo | Contenido |
|---|---|
| `contexto-productivo.brief.md` | Texto original del Ingeniero |
| `contexto-productivo.preguntas.md` | Preguntas, respuestas y propuestas |
| `contexto-productivo.requerimientos.md` | Reglas, capacidades y dependencias |
| `contexto-productivo.use-case.md` | Permisos, flujos y escenarios |
| `contexto-productivo.modelo-datos.md` | Entidades, relaciones y estados |
| `contexto-productivo.task.md` | Trabajo propuesto y bloqueos |
