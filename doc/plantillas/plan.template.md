---
type: plan
id: PLAN-PRE-NNNN
title: "[Qué se implementa]"
module: "PRE"
task: PRE-TASK-NNN
status: Borrador
mode: estandar        # rapido | estandar | mayor
created: YYYY-MM-DD
approved_by: null
---

# PLAN-PRE-NNNN — [Qué se implementa]

<!-- Un plan es el expediente completo de una entrega: antes de aprobarse dice qué y cómo; después registra qué pasó.
Secciones 1–7: las escribe el planificador. 8: el implementador. 9–10: el revisor.
No copia reglas ni escenarios: referencia IDs y tags.
Modo rapido (corrección sin cambio de especificación): completar 1, 3, 5, 6 y 8–10. -->

## 1. Objetivo y alcance

- **Tarea:** `PRE-TASK-NNN`
- **Implementa:** `PRE-UC-NNN`, `PRE-UC-NNN`
- **Resultado observable:** [Qué podrá hacerse al terminar]
- **No incluye:** [Exclusiones]

## 2. Preparación

<!-- Si alguna casilla no se cumple, el plan queda Bloqueado y se informa al ingeniero. -->

- [ ] Todos los ítems del alcance están `Aprobado`.
- [ ] Ninguna pregunta bloqueante abierta los afecta.
- [ ] Las dependencias con otros módulos (`PRE-DEP-NNN`) están disponibles o se simulan con un contrato acordado.
- [ ] Las decisiones necesarias tienen ADR `Aceptado` o están en §4.

**Bloqueos:** [Ninguno / lista con IDs]

## 3. Contexto actual

<!-- Hechos con fuente. [H] hecho, [S] supuesto a confirmar. -->

- [H] [Qué existe hoy] — `ruta`
- [S] [Supuesto]

## 4. Decisiones

<!-- Solo alternativas reales. Si la decisión cumple los criterios de doc/README.md §8, crear ADR y referenciarlo aquí. -->

### D-01 — [Decisión]

| Opción | A favor | En contra |
|---|---|---|
| A | | |
| B | | |

- **Recomendación:** [Opción y por qué]
- **Decisión del ingeniero:** [Pendiente / Opción]
- **ADR:** [ADR-PRE-NNNN / ADR-NNNN / No: decisión local]

## 5. Tareas

<!-- Orden hexagonal: dominio → aplicación → infraestructura → API → aceptación. Una tarea = una capa o un UC, cabe en una sesión, termina en una verificación. [P] = paralelizable. -->

| ID | Tarea | Capa | Implementa | Archivos previstos | Verificación |
|---|---|---|---|---|---|
| T01 | [Resultado] | Dominio | `PRE-BR-NNN` | `src/modulos/[m]/dominio/…` | Pruebas unitarias de la regla |
| T02 | [Resultado] | Aplicación | `PRE-UC-NNN` | `src/modulos/[m]/aplicacion/…` | Pruebas del caso de uso con permisos |

## 6. Verificación y riesgos

| Control | Cubre | Comando |
|---|---|---|
| Unitarias | `PRE-BR-…` | `[comando]` |
| Aceptación | `@PRE-UC-NNN` | `[comando]` |
| Contrato | `[operationId]` | `[comando]` |
| Arquitectura y calidad | Convenciones | `[comandos]` |

- **Migración de datos:** [Detalle / No aplica: motivo]
- **Rollback:** [Detalle / Revertir commit]

## 7. Cambios de especificación

<!-- Solo si el plan necesita cambiar algo ya Aprobado o Implementado. Requiere aprobación del ingeniero. -->

| ID | Cambio | Motivo |
|---|---|---|
| Ninguno | | |

**Aprobación del plan:** [Pendiente / Aprobado por … el YYYY-MM-DD]

---

## 8. Registro de ejecución

| Tarea | Commit | Estado | Notas o desviaciones |
|---|---|---|---|
| T01 | | | |

## 9. Evidencia

| Control | Resultado | Comando ejecutado | Observado |
|---|---|---|---|
| | PASS / FAIL / NOT RUN | | |

## 10. Cierre

- **Conformidad:** [Cada UC y BR del alcance verificado / excepciones]
- **Desviaciones:** [Ninguna / lista y aprobación]
- **Ítems que pasan a Implementado:** [IDs]
- **Tarea que pasa a Completada:** `PRE-TASK-NNN`
- **Revisor:** [Sesión/agente distinto del implementador]
- **Estado final:** Cerrado / Bloqueado / Cancelado
