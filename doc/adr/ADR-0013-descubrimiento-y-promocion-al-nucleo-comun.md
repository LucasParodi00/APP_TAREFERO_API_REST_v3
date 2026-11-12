---
type: adr
id: ADR-0013
title: "Descubrimiento y promoción controlada al núcleo común"
status: Aceptado
scope: ["GLOBAL"]
date: 2026-11-12
supersedes: null
---

# ADR-0013 — Descubrimiento y promoción controlada al núcleo común

## Contexto

`ADR-0012` estableció `src/comun/` como núcleo técnico transversal. Esa decisión evita duplicar paginación, errores, contexto de solicitud y otros contratos técnicos, pero no define por sí sola cuándo una capacidad nueva debe ingresar al núcleo.

Sin una política explícita aparecen dos riesgos opuestos: que cada módulo vuelva a implementar capacidades canónicas por no saber dónde buscarlas, o que `src/comun/` acumule utilidades creadas por una reutilización futura solamente hipotética. Los módulos futuros necesitan un punto único de consulta y un flujo trazable para reutilizar, crear o promover componentes.

## Alternativas

### A — Colocar en `src/comun/` toda función potencialmente reutilizable

- **Cómo funciona:** una posibilidad futura de segundo consumidor basta para ubicar la función en el núcleo.
- **A favor:** reduce la probabilidad de duplicar una utilidad que finalmente se reutilice.
- **En contra:** generaliza antes de conocer los casos reales, aumenta el API común y facilita un cajón de sastre sin dueño claro.

### B — Implementar siempre en el primer módulo y extraer solo después de duplicar

- **Cómo funciona:** ninguna capacidad se crea inicialmente en el núcleo salvo que ya existan dos implementaciones.
- **A favor:** evita abstracciones especulativas.
- **En contra:** permite duplicar estándares globales ya conocidos y obliga a refactorizaciones evitables para UUID, fechas, Dinero, paginación o errores.

### C — Descubrimiento obligatorio y promoción basada en evidencia aprobada

- **Cómo funciona:** antes de crear se consulta `src/comun/`; una capacidad ingresa si es técnica, independiente del negocio y tiene más de un consumidor, implementa una convención global o responde a una necesidad futura explícitamente aprobada y trazable.
- **A favor:** evita duplicación y abstracción especulativa; hace visible la dependencia antes de implementar; conserva un núcleo pequeño y estable.
- **En contra:** agrega una comprobación durante la planificación y puede requerir una tarea técnica previa al módulo consumidor.

## Decisión

- **Elegida:** C — descubrimiento obligatorio y promoción basada en evidencia aprobada.
- **Por qué:** permite que los módulos nuevos encuentren y reutilicen las capacidades canónicas sin convertir el núcleo en una colección de utilidades hipotéticas. La tarea y el plan `CMN` proporcionan trazabilidad cuando una capacidad transversal todavía no existe.
- **Decidió:** Ingeniero — 2026-11-12.

## Consecuencias

- **Qué cambia:**
  - `arquitectura.md` §6.1 es la única fuente del catálogo de ubicaciones, criterio de ingreso y flujo de promoción a `src/comun/`.
  - `AGENTS.md` obliga a revisar `src/comun/` antes de crear componentes técnicos y remite a esa sección.
  - `convenciones.md` conserva la propiedad del comportamiento y formato de los tipos y mecanismos transversales; no redefine su ubicación.
  - Una capacidad transversal inexistente requiere tarea `CMN` y plan aprobado. El módulo consumidor declara la dependencia en lugar de crear una copia provisional.
  - Una capacidad local se promueve y sus consumidores se migran mediante tareas separadas; no se mueve silenciosamente dentro de otra entrega.
- **Riesgos:**
  - Agregar fricción para utilidades pequeñas: se mitiga con el catálogo corto de `arquitectura.md` §6.1 y los índices públicos por capa.
  - Declarar transversal una regla de negocio: se mitiga exigiendo independencia de vocabulario, datos y permisos funcionales.
  - Mantener duplicación durante una migración gradual: se acepta temporalmente y se controla con tareas y planes explícitos.
- **Revisar si:** `src/comun/` crece hasta requerir versionado independiente, aparecen varios despliegues o el catálogo deja de permitir encontrar una capacidad con una sola lectura.
