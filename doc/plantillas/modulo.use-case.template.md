---
type: use-cases
module: "PRE"
status: Propuesto
owner: "[Analista]"
---

# [Módulo] — Casos de uso

<!-- Responde: ¿quién puede hacer qué y cómo se desarrolla cada interacción?
Qué define este archivo y qué tiene prohibido: doc/proceso/reglas-documentacion.md §3. Lo que ya está definido en otro archivo se referencia por ID (§5).
Un caso de uso = un objetivo de un actor ("registrar un lote"), no una pantalla ni una operación técnica. -->

## 1. Actores

<!-- Tipo Rol: debe ser un rol canónico de doc/glosario.md §1 (spec_lint lo verifica). Si el brief dice "admin" o "dueño", aquí va el nombre canónico. Tipo Sistema: otro módulo o sistema externo. -->

| Actor | Tipo | Origen |
|---|---|---|
| [Rol canónico] | Rol | `B-NN` |

## 2. Permisos

<!-- Única fuente de permisos del módulo. Sí / No / Cond. — "Cond." exige una regla de tipo Autorización de dominio. -->

| Caso de uso | [Rol A] | [Rol B] | Condición |
|---|:---:|:---:|---|
| `PRE-UC-001` | Sí | No | — |

## 3. Casos de uso

### PRE-UC-001 — [Verbo + objeto]

- **Estado:** Propuesto
- **Actor:** [Rol]
- **Objetivo:** [Qué quiere lograr el actor]
- **Requerimientos:** `PRE-REQ-NNN`
- **Reglas:** `PRE-BR-NNN`

**Precondiciones**

- [Condición observable antes de empezar]

**Flujo principal**

1. El [actor] [solicita algo] indicando [datos de negocio].
2. El sistema verifica que el actor tenga permiso.
3. El sistema valida `PRE-BR-NNN`.
4. El sistema [registra / modifica / calcula].
5. El sistema informa [resultado].

**Flujos alternativos**

- **A1 — [Condición]** (desde el paso N): [qué pasa] y continúa en el paso M.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---|---|---|
| El actor no tiene permiso | 2 | Se rechaza sin cambios | `PRE_ACCESO_DENEGADO` |
| No se cumple `PRE-BR-NNN` | 3 | Se rechaza sin cambios | `PRE_[CODIGO]` |

**Postcondiciones**

- [Estado garantizado al terminar con éxito]

**Escenarios de aceptación**

```gherkin
@PRE-UC-001 @AC-01
Escenario: [Éxito]
  Dado [contexto]
  Cuando [acción]
  Entonces [resultado observable]

@PRE-UC-001 @AC-02
Escenario: [Regla PRE-BR-NNN incumplida]
  Dado [contexto inválido]
  Cuando [acción]
  Entonces se rechaza con PRE_[CODIGO]
  Y no se modifica ningún dato

@PRE-UC-001 @AC-03
Escenario: Rol sin permiso
  Dado un usuario con rol [Rol B]
  Cuando [acción]
  Entonces se rechaza con PRE_ACCESO_DENEGADO
```

<!-- Mínimo por UC: un escenario de éxito, uno por cada regla que puede fallar y uno de permiso denegado. Cada escenario será una prueba automatizada con el mismo tag. -->
