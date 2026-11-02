---
type: questions
module: "TER"
---

# Territorio — Preguntas

## TER-Q-001 — Brief y alcance inicial de Territorio

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** pedido del Ingeniero de continuar con el siguiente módulo; `B-01`
- **Afecta:** `TER-TASK-001`
- **Pregunta:** ¿Qué datos necesita una Chacra y un Lote, quién puede administrarlos y qué reglas son obligatorias? Puede partir de los antecedentes generales e indicar qué adopta y qué cambia. El texto recibido se conservará en territorio.brief.md.
- **Interpretaciones posibles:**
  - a) El Ingeniero entrega un brief propio usando los documentos generales como antecedentes.
  - b) El agente presenta primero propuestas IA concretas para revisión, sin atribuirlas al Ingeniero.
- **Recomendación del agente:** opción a), con una descripción breve de la operación real; los antecedentes ya permiten orientar las preguntas posteriores.
- **Respuesta:** Brief recibido y conservado literalmente en B-01. El Ingeniero pidió definir primero Chacras; Lotes y su delimitación quedan fuera de esta entrega.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-02 (respuesta en el chat).

## TER-Q-002 — Datos obligatorios de Chacra

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-01`
- **Afecta:** datos mínimos de la Chacra
- **Pregunta:** ¿Cuáles serán obligatorios entre nombre, nombre corto y responsable? La Empresa se asigna desde el contexto autorizado.
- **Interpretaciones posibles:**
  - a) Solo nombre.
  - b) Nombre y nombre corto; responsable opcional.
  - c) Los tres datos.
- **Recomendación del agente:** confirmar la obligatoriedad sin deducirla de la enumeración de campos.
- **Respuesta:** Nombre y nombre corto; responsable opcional.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-02 (respuesta en el chat).

## TER-Q-003 — Permisos y operaciones iniciales de Chacras

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** propuesta IA para concretar actores y operaciones de `B-01`
- **Afecta:** permisos, casos de uso y ciclo de administración
- **Pregunta:** ¿Aprobás que el Administrador cree, consulte, modifique e inactive Chacras de su Empresa; el Capataz solo consulte las asignadas; y el SuperAdministrador intervenga mediante soporte auditado?
- **Interpretaciones posibles:**
  - a) Aprobar ese funcionamiento.
  - b) Dar al Capataz también creación y modificación.
  - c) Definir otros permisos u operaciones.
- **Recomendación del agente:** opción a) para la primera entrega.
- **Respuesta:** Sí, aprobar ese funcionamiento.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-02 (respuesta en el chat).

## TER-Q-004 — Alta de Chacra sin Lotes

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-01`; precisión del alcance de esta entrega
- **Afecta:** alta de Chacra y relación futura con Lotes
- **Pregunta:** Como Lotes queda para después, ¿se permite crear una Chacra sin lotes y agregarlos más adelante?
- **Interpretaciones posibles:**
  - a) Sí, puede comenzar sin lotes.
  - b) Exigir al menos uno desde el alta.
- **Recomendación del agente:** opción a), compatible con la entrega incremental solicitada.
- **Respuesta:** Sí, puede comenzar sin lotes.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-02 (respuesta en el chat).

## TER-Q-005 — Unicidad del nombre corto

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-01`; significado no definido del nombre corto
- **Afecta:** validación del nombre corto de la Chacra
- **Pregunta:** ¿El nombre corto es una etiqueta que puede repetirse o debe ser único dentro de la Empresa?
- **Interpretaciones posibles:**
  - a) Puede repetirse.
  - b) Debe ser único dentro de la Empresa.
- **Recomendación del agente:** confirmar su uso; no confundir una etiqueta con un código identificador.
- **Respuesta:** Debe ser único dentro de la Empresa.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-02 (respuesta en el chat).

## TER-Q-006 — Estados, conservación y longitudes

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** propuesta IA para completar estados y límites de los datos de `B-01`
- **Afecta:** estado inicial, inactivación, conservación y longitudes de texto
- **Pregunta:** ¿Aprobás crear en estado ACTIVA, permitir pasar a INACTIVA conservando el historial, sin borrado físico; nombre hasta 150 caracteres, nombre corto hasta 50 y responsable hasta 150? La reactivación quedaría para definir después.
- **Interpretaciones posibles:**
  - a) Aprobar la propuesta completa.
  - b) Ajustar estados o longitudes.
- **Recomendación del agente:** opción a) como propuesta inicial simple, sujeta a confirmación; no son límites ya acordados.
- **Respuesta:** Sí, aprobar la propuesta.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-02 (respuesta en el chat).

## Aclaraciones diferidas

La expresión literal “Pogri” de B-01 se conserva sin interpretarla. Se aclarará al especificar Lotes o su delimitación; no bloquea esta entrega de Chacras. No se agrega un módulo funcional nuevo ni se cambia el registro de arquitectura: Chacras constituye el alcance inicial de TER.
