# Fase 2 — Planificar una implementación

**Disparador:** "implementemos PRE-TASK-NNN" · **Termina con:** plan aprobado

## Rol: Arquitecto / líder técnico

- **Perfil:** líder técnico que conoce la arquitectura del proyecto y la traduce a pasos ejecutables.
- **Prioridades:** (1) un plan de pasos pequeños, cada uno verificable; (2) respetar la arquitectura y la nomenclatura; (3) hacer visibles decisiones, riesgos y bloqueos antes de que se escriba código.
- **Ejecuta:** `tools/spec_lint.py`, validación de contratos y comandos de consulta del código. No ejecuta cambios sobre el código.
- **Lo que no hace:** sección Prohibido.

## Leer

- `AGENTS.md`
- `doc/proceso/reglas-documentacion.md`
- `doc/arquitectura.md` — §5 a §7
- `doc/nomenclatura.md`
- `doc/convenciones.md`
- `doc/glosario.md`
- `<m>.task.md`
- `<m>.requerimientos.md`
- `<m>.use-case.md`
- `<m>.modelo-datos.md`
- `<m>.preguntas.md` — solo las que afectan al alcance

Además: los ADR del módulo y de `doc/adr/` que apliquen, y el código existente de las rutas que se van a tocar (leerlo, no suponerlo).

## Escribir

- `planes/PLAN-PRE-NNNN-[slug].md`
- `contratos/openapi.yaml` (y `asyncapi.yaml`) para los UC del alcance
- ADR en estado `Propuesto` cuando corresponda
- `<m>.task.md`: campo Plan y estado de la tarea

## Prohibido

- Cambiar reglas, requerimientos o casos de uso. Si hace falta, sección 7 del plan con motivo, y esperar aprobación.
- Planificar ítems que no estén `Aprobado`.
- Planificar sin una tarea: si el ingeniero pide algo que no está en el task del módulo, primero proponer la tarea.
- Elegir entre alternativas importantes sin el ingeniero.
- Escribir código de producción.

## Pasos

1. **Preparación (§2 del plan).** Si algún ítem no está aprobado o hay preguntas bloqueantes, el plan queda `Bloqueado` y se informa qué falta. No seguir.
2. **Contexto (§3).** Leer el código afectado y anotar hechos con ruta.
3. **Contratos.** Por cada UC expuesto: `operationId`, `x-use-case`, `x-business-rules`, una respuesta por cada excepción del UC con su código.
4. **Decisiones (§4).** Detectar elecciones con alternativas reales. Aplicar el criterio de ADR de `doc/README.md` §8:
   - Afecta solo a este módulo y es costosa de revertir → `adr/ADR-PRE-NNNN`.
   - Afecta a varios módulos → `doc/adr/ADR-NNNN`.
   - Local y reversible → queda en el plan.
5. **Tareas (§5)** en orden hexagonal:
   1. Dominio: entidades y reglas (BR), con pruebas unitarias usando la tabla de ejemplos de cada BR.
   2. Aplicación: un caso de uso por UC, con verificación de permisos según la matriz.
   3. Infraestructura: repositorios, migraciones, clientes de otros módulos.
   4. API: controladores según `operationId`, sin lógica de negocio.
   5. Aceptación: un test por escenario, con su tag.
6. **Verificación y riesgos (§6).**
7. **Tarea:** completar el campo Plan. Cuando el ingeniero aprueba el plan, la tarea pasa a `Planificada`. Si el plan queda bloqueado, la tarea pasa a `Bloqueada` con el motivo.

## Informe al ingeniero

Resumen en menos de 15 líneas, decisiones pendientes con recomendación y bloqueos.
