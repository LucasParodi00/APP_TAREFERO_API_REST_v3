---
type: module-readme
module: "PRE"
normative: false
---

# [Nombre del módulo]

> **Documento descriptivo.** Resume la especificación para lectura humana. No es fuente para decisiones: ante cualquier diferencia mandan `requerimientos`, `use-case` y `modelo-datos`. Se regenera cuando la especificación cambia.

<!-- Lo genera el agente AL FINAL de la fase de especificación, a partir de los archivos normativos.
Prohibido: definir IDs, enunciar reglas nuevas, agregar información que no esté en los otros archivos.
Permitido: resumir en prosa, enlazar, mencionar IDs como referencia. Longitud orientativa: 50 a 150 líneas. -->

## De qué se trata

[Dos o tres párrafos: qué gestiona el módulo y para quién.]

## Qué se puede hacer

| Quién | Qué | Detalle |
|---|---|---|
| [Rol] | [Acción en lenguaje natural] | `PRE-UC-NNN` |

## Reglas principales

- [Resumen en una línea] (`PRE-BR-NNN`)

## Relación con otros módulos

- **[Módulo]:** [Qué se usa y para qué] (`PRE-DEP-NNN`)

## Qué no hace

- [Exclusión]

## Estado

[Resumen: cuántos casos de uso implementados, preguntas abiertas importantes.]

## Archivos

| Archivo | Contenido |
|---|---|
| `[modulo].brief.md` | Descripción original del ingeniero |
| `[modulo].preguntas.md` | Preguntas y respuestas |
| `[modulo].requerimientos.md` | Reglas y requerimientos |
| `[modulo].use-case.md` | Casos de uso y permisos |
| `[modulo].modelo-datos.md` | Entidades y relaciones |
| `[modulo].task.md` | Tareas del módulo |
| `contratos/` | API |
| `adr/` | Decisiones del módulo |
| `planes/` | Planes e historial de implementación |
