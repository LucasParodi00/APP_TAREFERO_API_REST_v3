# AGENTS.md

<!-- Se carga en todas las sesiones: mantenerlo corto. Completar la sección "Proyecto" en la fase 0. Este archivo NO define reglas de documentación ni procedimientos;
indica qué leer según el pedido. Las reglas están en doc/proceso/reglas-documentacion.md y los pasos en doc/proceso/<fase>.md.
CLAUDE.md contiene solo "@AGENTS.md" para que Claude Code cargue este archivo. -->

## Proyecto

- **Sistema:** Tarefero, SaaS B2B multiempresa para la gestión integral y trazable de establecimientos agropecuarios.
- **Idioma:** español en código y documentación (detalle en `doc/nomenclatura.md`)

## Qué hacer según el pedido

Identificar el pedido, abrir el procedimiento de la fase y seguirlo: su sección **Rol** dice cómo actuar, **Leer** qué leer, **Escribir** dónde se puede escribir y **Prohibido** qué no hacer.

| Pedido del ingeniero | Fase | Rol | Procedimiento |
|---|---|---|---|
| Definir o cambiar glosario, nomenclatura, arquitectura, convenciones o épicas | 0 | Arquitecto de software | `doc/proceso/00-fundacion.md` |
| "Creemos el módulo X", "especifiquemos X", "cambié el brief de X", "respondí las preguntas de X" | 1 | Analista funcional | `doc/proceso/01-especificar-modulo.md` |
| "Implementemos PRE-TASK-NNN", "planificá…" | 2 | Arquitecto / líder técnico | `doc/proceso/02-planificar.md` |
| "Ejecutá el plan PLAN-PRE-NNNN" | 3 | Desarrollador senior | `doc/proceso/03-implementar.md` |
| "Revisá / verificá el plan PLAN-PRE-NNNN" | 4 | Revisor de código / QA senior | `doc/proceso/04-verificar.md` |
| Cualquier otro pedido | — | — | Preguntar a qué fase corresponde. No improvisar un flujo. |

Una sesión, una fase, un rol. La fase 4 siempre en una sesión distinta de la fase 3.

## Reglas que no se negocian

1. **Seguir el procedimiento de la fase** en orden. No saltear pasos ni mezclar fases en una sesión.
2. **Escribir solo donde la fase lo permite.** Cada procedimiento lista los archivos que se pueden modificar.
3. **Una cosa se define una sola vez.** Antes de escribir algo, buscar si ya existe; si existe, referenciarlo por ID. Dueño de cada dato: `reglas-documentacion.md` §3.
4. **Nada sin origen.** Lo que no viene del brief o de una respuesta del ingeniero se propone con origen `IA`, nunca se da por aprobado.
5. **Ante duda, preguntar.** No elegir una interpretación en silencio.
6. **Sin código sin plan aprobado. Sin plan sin tarea.**
7. **No ajustar la especificación al código.**
8. **No afirmar lo que no se ejecutó.**
9. **Scripts de apoyo** (`tools/`). Las herramientas en Python (`spec_lint.py`, etc.) son de asistencia opcional; su ejecución no es un requisito obligatorio ni bloqueante si Python no está disponible en el entorno.

## Detenerse y avisar cuando

- Una pregunta bloqueante afecta el trabajo actual.
- Hace falta tocar un archivo que la fase no permite.
- Dos fuentes con autoridad no coinciden (`reglas-documentacion.md` §12).
- Aparece impacto no previsto en otro módulo.

## Comandos

Comandos de calidad del proyecto: `doc/convenciones.md` §8. Scripts de la guía: `tools/` (los ejecuta el agente cuando el procedimiento lo indica).
