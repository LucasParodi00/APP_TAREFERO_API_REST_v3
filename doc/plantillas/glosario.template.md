---
type: glossary
status: Propuesto
owner: "[Ingeniero]"
---

# Glosario

<!-- Qué define este archivo: doc/proceso/reglas-documentacion.md §3.
Regla para agentes: toda palabra del brief, de una conversación o de una pregunta se traduce al término CANÓNICO antes de escribir especificación o código. Si una palabra no está en este glosario y tiene significado de negocio, se abre una pregunta; nunca se supone su significado.
El brief no se reescribe: la normalización ocurre al derivar la especificación. -->

## 1. Roles

<!-- Un encabezado por rol canónico. Los casos de uso solo pueden usar estos nombres como actores. -->

### [Administrador]

- **Sinónimos aceptados:** [admin, dueño] <!-- palabras que, dichas por el ingeniero, significan este mismo rol -->
- **Nombre en código:** `[ADMINISTRADOR]`
- **Descripción:** [Qué representa y qué responsabilidad tiene en el negocio]
- **Alcance:** Todo el sistema | Por establecimiento | [Otro]
- **No confundir con:** [Rol o término parecido y la diferencia]

### [Empleado]

- **Sinónimos aceptados:** [operario, peón]
- **Nombre en código:** `[EMPLEADO]`
- **Descripción:** [Descripción]
- **Alcance:** [Alcance]
- **No confundir con:** [Encargado: es un empleado con un lote asignado, no un rol]

## 2. Términos del dominio

<!-- Un encabezado por concepto, en orden alfabético. -->

### [Término canónico]

- **Definición:** [Qué es en el negocio, sin definir con la misma palabra]
- **Sinónimos aceptados:** [Lista / Ninguno]
- **No usar:** [Palabras ambiguas o incorrectas que deben evitarse en especificación y código]
- **Nombre en código:** `[NombreEnCodigo]`
- **Módulo dueño:** `[PRE]`
- **Ejemplo:** [Caso concreto]

## 3. Palabras que siempre requieren pregunta

<!-- Términos que en este dominio tienen varios significados posibles. Si aparecen en un brief sin aclaración, el agente abre una pregunta. -->

| Palabra | Por qué es ambigua |
|---|---|
| [capacidad] | [Puede ser cantidad de animales, carga por hectárea u otra medida] |
