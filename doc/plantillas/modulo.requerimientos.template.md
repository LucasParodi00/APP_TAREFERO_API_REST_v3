---
type: requirements
module: "PRE"
status: Propuesto
owner: "[Analista]"
---

# [Módulo] — Requerimientos

<!-- Responde: ¿qué debe hacer el sistema y bajo qué reglas?
Qué define este archivo y qué tiene prohibido: doc/proceso/reglas-documentacion.md §3. Lo que ya está definido en otro archivo se referencia por ID (§5).
Orden de redacción: primero BR, después REQ (que referencian BR), después NFR y DEP.
Todo ítem tiene Origen: B-NN, PRE-Q-NNN o IA. Un ítem con origen IA requiere aprobación explícita del ingeniero. -->

## 1. Reglas de negocio

<!-- Una regla = una condición que siempre debe cumplirse o una forma de calcular algo. Atómica: si tiene "y" uniendo dos condiciones independientes, son dos reglas.
Tipos: Invariante (siempre verdadero sobre los datos), Validación (condición para aceptar una operación), Cálculo, Transición (cambio de estado permitido), Autorización de dominio (quién puede según los datos, p. ej. "solo el encargado del lote"), Temporal. -->

### PRE-BR-001 — [Título corto]

- **Estado:** Propuesto
- **Origen:** `B-NN`
- **Tipo:** Invariante | Validación | Cálculo | Transición | Autorización de dominio | Temporal
- **Regla:** [Enunciado preciso y verificable]
- **Si se incumple:** se rechaza la operación con `PRE_[CODIGO]` | No aplica (cálculo)
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| [Caso válido] | Se acepta |
| [Caso límite] | [Resultado] |
| [Caso inválido] | Se rechaza con `PRE_[CODIGO]` |

## 2. Requerimientos funcionales

<!-- Un requerimiento = una capacidad que el sistema debe ofrecer. Formato EARS:
  El sistema debe … | Cuando …, el sistema debe … | Si …, entonces el sistema debe … | Mientras …, el sistema debe …
Sin pasos ni pantallas: eso es el caso de uso. Sin criterios de aceptación: están en los escenarios del caso de uso. -->

### PRE-REQ-001 — [Título corto]

- **Estado:** Propuesto
- **Origen:** `B-NN`
- **Prioridad:** Must | Should | Could
- **Requerimiento:** [Enunciado EARS]
- **Reglas que aplica:** `PRE-BR-NNN`

## 3. Requerimientos no funcionales

<!-- Solo si son más estrictos que los de convenciones.md. Siempre con umbral medible. Si no hay, eliminar la sección. -->

### PRE-NFR-001 — [Título]

- **Estado:** Propuesto
- **Origen:** `B-NN`
- **Categoría:** Rendimiento | Seguridad | Auditoría | Disponibilidad | Privacidad
- **Requerimiento:** [Medible]
- **Verificación:** [Cómo se comprueba]

## 4. Dependencias con otros módulos

<!-- Qué necesita este módulo de otros y qué ofrece. El detalle técnico va en contratos y, si la decisión es importante, en un ADR transversal. -->

### PRE-DEP-001 — [Módulo] — [Qué se necesita]

- **Estado:** Propuesto
- **Origen:** `B-NN`
- **Módulo:** `OTR` ([Nombre])
- **Dirección:** Este módulo consume | Este módulo provee
- **Qué:** [Dato o comportamiento]
- **Para qué:** `PRE-BR-NNN` / `PRE-REQ-NNN`

## 5. Fuera de alcance

- [Comportamiento excluido] — Origen: `B-NN` / `PRE-Q-NNN`
