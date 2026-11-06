---
type: questions
module: "OBS"
---

# Observaciones — Preguntas

## OBS-Q-001 — Dueño del catálogo y del historial fenológico

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`; impacto sobre `CUL`
- **Afecta:** `OBS-DEP-003`, `OBS-ENT-001`
- **Pregunta:** ¿El catálogo de estados fenológicos pertenece a `CUL` y el historial temporal pertenece a `OBS`?
- **Interpretaciones posibles:**
  - a) `CUL` define los estados por Empresa cliente y Cultivo; `OBS` conserva los períodos de cada Implantación.
  - b) `OBS` define tanto el catálogo como el historial.
- **Recomendación del agente:** Opción a, porque el catálogo depende del Cultivo y el historial es un hecho observado.
- **Respuesta:** Confirmo la opción a.
- **Respondida por / fecha:** Ingeniero / 2026-11-06

## OBS-Q-002 — Alcance del historial fenológico

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`
- **Afecta:** `OBS-BR-001`, `OBS-ENT-001`
- **Pregunta:** ¿El historial fenológico se registra por Implantación completa o también por sectores diferenciados?
- **Interpretaciones posibles:**
  - a) Un único historial por Implantación completa.
  - b) Historiales simultáneos por sectores de una Implantación.
- **Recomendación del agente:** Opción b para reflejar heterogeneidad, salvo que la primera entrega priorice simplicidad.
- **Respuesta:** Será por Implantación completa.
- **Respondida por / fecha:** Ingeniero / 2026-11-06

## OBS-Q-003 — Cambios fenológicos retroactivos

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`
- **Afecta:** `OBS-BR-003`, `OBS-BR-005`, `OBS-UC-003`
- **Pregunta:** ¿Se admiten nuevas transiciones con fecha anterior al período vigente?
- **Interpretaciones posibles:**
  - a) No; un error histórico se resuelve mediante corrección versionada.
  - b) Sí; se recalculan todos los períodos posteriores.
- **Recomendación del agente:** Opción a para evitar reescrituras temporales implícitas.
- **Respuesta:** Apruebo la opción a.
- **Respondida por / fecha:** Ingeniero / 2026-11-06

## OBS-Q-004 — Evaluación fenológica

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`
- **Afecta:** `OBS-BR-004`, `OBS-ENT-001`
- **Pregunta:** ¿Aprobás la escala `MUY_MALA`, `MALA`, `ESPERADA`, `BUENA`, `MUY_BUENA` como evaluación respecto de lo esperado?
- **Interpretaciones posibles:**
  - a) Aprobar la escala propuesta.
  - b) Definir otra escala o hacerla configurable.
- **Recomendación del agente:** Opción a como escala estable y comparable.
- **Respuesta:** Apruebo la opción a.
- **Respondida por / fecha:** Ingeniero / 2026-11-06

## OBS-Q-005 — Tipos de Observación configurables

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-02`
- **Afecta:** `OBS-BR-006`, `OBS-REQ-005`, `OBS-ENT-002`
- **Pregunta:** ¿Cada Empresa cliente puede configurar sus propios Tipos de Observación?
- **Interpretaciones posibles:**
  - a) Sí, con identidad y vigencia propias de la Empresa.
  - b) No, existe un catálogo global fijo.
- **Recomendación del agente:** Opción a por la diversidad de hallazgos productivos y operativos.
- **Respuesta:** Sí, cada Empresa cliente puede configurarlos.
- **Respondida por / fecha:** Ingeniero / 2026-11-06

## OBS-Q-006 — Punto geográfico obligatorio

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-02`
- **Afecta:** `OBS-BR-009`, `OBS-ENT-003`
- **Pregunta:** ¿El punto geográfico es obligatorio cuando no se informa Chacra, Lote ni Implantación?
- **Interpretaciones posibles:**
  - a) Sí, siempre debe existir alguna ubicación estructurada.
  - b) No, el punto geográfico también es opcional.
- **Recomendación del agente:** Opción a para que el hallazgo pueda localizarse.
- **Respuesta:** No es obligatorio; opción b.
- **Respondida por / fecha:** Ingeniero / 2026-11-06

## OBS-Q-007 — Escala de urgencia

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-02`
- **Afecta:** `OBS-BR-011`, `OBS-ENT-003`
- **Pregunta:** ¿Aprobás `BAJA`, `MEDIA`, `ALTA`, `CRITICA` como niveles de urgencia?
- **Interpretaciones posibles:**
  - a) Aprobar la escala propuesta.
  - b) Configurar la escala por Empresa cliente.
- **Recomendación del agente:** Opción a para mantener prioridad comparable con Labores.
- **Respuesta:** Apruebo la opción a.
- **Respondida por / fecha:** Ingeniero / 2026-11-06

## OBS-Q-008 — Ampliación de Labores

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-02`; `LAB-ENT-003`
- **Afecta:** `OBS-DEP-006`, `OBS-BR-021`, `OBS-UC-010`
- **Pregunta:** ¿Aprobás ampliar `LAB` para que una Orden de Labor tenga prioridad, pueda indicar una Observación de origen y pueda ser operativa sin Campaña cuando no pertenece a un contexto productivo?
- **Interpretaciones posibles:**
  - a) Sí, ampliar la especificación de `LAB`.
  - b) Mantener `LAB` sin cambios y limitar la generación de Órdenes desde `OBS`.
- **Recomendación del agente:** Opción a para cubrir hallazgos como un caño roto fuera de una Chacra.
- **Respuesta:** Apruebo la opción a.
- **Respondida por / fecha:** Ingeniero / 2026-11-06

## OBS-Q-009 — Cantidad de Órdenes originadas

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-02`
- **Afecta:** `OBS-BR-020`, `OBS-DEP-006`, `OBS-UC-010`
- **Pregunta:** ¿Una Observación puede originar varias Órdenes de Labor?
- **Interpretaciones posibles:**
  - a) Sí, cero o varias Órdenes.
  - b) Como máximo una Orden.
- **Recomendación del agente:** Opción a porque un hallazgo puede requerir inspección, reparación y control posterior.
- **Respuesta:** Sí; opción a.
- **Respondida por / fecha:** Ingeniero / 2026-11-06

## OBS-Q-010 — Cierre después de una Labor

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-02`
- **Afecta:** `OBS-BR-022`, `OBS-UC-012`
- **Pregunta:** ¿Completar una Orden de Labor solo propone cerrar la Observación y requiere confirmación?
- **Interpretaciones posibles:**
  - a) Sí, la finalización no cierra automáticamente el hallazgo.
  - b) Sí, la primera Orden completada lo cierra automáticamente.
- **Recomendación del agente:** Opción a porque puede haber varias Órdenes o persistir el problema.
- **Respuesta:** Sí; opción a.
- **Respondida por / fecha:** Ingeniero / 2026-11-06

## OBS-Q-011 — Severidad sanitaria

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-02`; propuesta IA aceptada conceptualmente, escala pendiente
- **Afecta:** `OBS-BR-015`, `OBS-ENT-004`, `OBS-UC-007`
- **Pregunta:** ¿Aprobás `LEVE`, `MODERADA`, `GRAVE`, `CRITICA` como escala de severidad sanitaria, independiente de la urgencia?
- **Interpretaciones posibles:**
  - a) Aprobar la escala propuesta.
  - b) Definir otra escala o configurarla por Empresa cliente.
- **Recomendación del agente:** Opción a; describe impacto observado sin confundirlo con el tiempo disponible para actuar.
- **Respuesta:** Apruebo `LEVE`, `MODERADA`, `GRAVE`, `CRITICA`.
- **Respondida por / fecha:** Ingeniero / 2026-11-06

## OBS-Q-012 — Catálogo de problemas sanitarios

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-02`; propuesta IA
- **Afecta:** `OBS-BR-014`, `OBS-ENT-005`, `OBS-UC-001`
- **Pregunta:** ¿Cada Empresa cliente puede configurar problemas sanitarios y limitar cada uno a uno o varios Cultivos?
- **Interpretaciones posibles:**
  - a) Catálogo configurable por Empresa y aplicabilidad por Cultivo.
  - b) Texto libre sin catálogo.
  - c) Catálogo global fijo.
- **Recomendación del agente:** Opción a para comparar hallazgos sin asumir que todos los Cultivos comparten problemas.
- **Respuesta:** Sí; catálogo configurable por Empresa cliente y aplicable por Cultivo.
- **Respondida por / fecha:** Ingeniero / 2026-11-06

## OBS-Q-013 — Confirmación de una causa sanitaria

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-02`; término ambiguo del glosario: responsable
- **Afecta:** `OBS-BR-017`, `OBS-UC-007`, matriz de permisos
- **Pregunta:** ¿Quién puede cambiar una causa de sospechada a confirmada?
- **Interpretaciones posibles:**
  - a) Administrador o Capataz con permiso específico.
  - b) Nuevo rol canónico Responsable técnico.
  - c) Cualquier actor que pueda registrar Observaciones sanitarias.
- **Recomendación del agente:** No definir un nuevo rol sin aclarar sus responsabilidades; inicialmente opción a con permiso específico.
- **Respuesta:** Administrador y Capataz deben poder confirmar una causa sanitaria dentro de su alcance autorizado.
- **Respondida por / fecha:** Ingeniero / 2026-11-06

## OBS-Q-014 — Seguimientos sanitarios

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-02`; propuesta IA
- **Afecta:** `OBS-BR-018`, `OBS-REQ-009`, `OBS-ENT-006`, `OBS-UC-011`
- **Pregunta:** ¿Una Observación sanitaria conserva seguimientos fechados vinculados sin modificar el hallazgo original?
- **Interpretaciones posibles:**
  - a) Sí, cada seguimiento conserva evaluación, evidencia y evolución.
  - b) No, se modifica la Observación original con historial técnico de auditoría.
- **Recomendación del agente:** Opción a para trazar la evolución observada.
- **Respuesta:** Sí; cada seguimiento conserva fecha, evaluación, evidencia y evolución sin modificar el hallazgo original.
- **Respondida por / fecha:** Ingeniero / 2026-11-06

## OBS-Q-015 — Ubicación sin referencias estructuradas

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-02`, `OBS-Q-006`
- **Afecta:** `OBS-BR-009`, `OBS-ENT-003`, `OBS-UC-006`
- **Pregunta:** Cuando no se informa Chacra, Lote, Implantación ni punto geográfico, ¿debe exigirse al menos una descripción textual de la ubicación?
- **Interpretaciones posibles:**
  - a) Sí, para que el hallazgo sea localizable.
  - b) No, una Observación puede carecer completamente de ubicación.
- **Recomendación del agente:** Opción a.
- **Respuesta:** Sí; se exige una descripción textual cuando no se informa ninguna referencia estructurada ni punto geográfico.
- **Respondida por / fecha:** Ingeniero / 2026-11-06

## OBS-Q-016 — Actores y permisos

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`, `B-02`; roles del glosario
- **Afecta:** actores, matriz de permisos y todos los `OBS-UC`
- **Pregunta:** ¿Aprobás que el Administrador configure catálogos, corrija y anule; y que Administrador y Capataz registren, consulten, creen Órdenes y propongan o confirmen cierres dentro de su alcance autorizado?
- **Interpretaciones posibles:**
  - a) Aprobar la distribución propuesta.
  - b) Definir otra distribución por acción.
- **Recomendación del agente:** Opción a; el Capataz opera en campo y el Administrador gobierna catálogos e historia.
- **Respuesta:** Apruebo la distribución propuesta.
- **Respondida por / fecha:** Ingeniero / 2026-11-06

## OBS-Q-017 — Ciclo de vida de una Observación

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-02`; `OBS-Q-010`; propuesta IA
- **Afecta:** `OBS-BR-019`, `OBS-ENT-003`, `OBS-UC-009`, `OBS-UC-012`
- **Pregunta:** ¿Aprobás `BORRADOR`, `REGISTRADA`, `EN_ATENCION`, `RESUELTA`, `ANULADA`, permitiendo registrar directamente sin revisión?
- **Interpretaciones posibles:**
  - a) Aprobar el ciclo propuesto.
  - b) Eliminar BORRADOR.
  - c) Definir otro ciclo.
- **Recomendación del agente:** Opción a para permitir captura incompleta y seguimiento sin aprobación obligatoria.
- **Respuesta:** Apruebo `BORRADOR`, `REGISTRADA`, `EN_ATENCION`, `RESUELTA`, `ANULADA`, permitiendo registrar directamente sin revisión.
- **Respondida por / fecha:** Ingeniero / 2026-11-06

## OBS-Q-018 — Reglas de evidencia

- **Estado:** Abierta
- **Bloqueante:** No
- **Origen:** `B-02`; `EPIC-010`; propuesta IA
- **Afecta:** `OBS-BR-013`, `OBS-DEP-005`, `OBS-ENT-007`
- **Pregunta:** ¿Las evidencias son siempre opcionales, admiten varias imágenes o Archivos y permiten una descripción individual?
- **Interpretaciones posibles:**
  - a) Sí, cero o varias evidencias con descripción opcional.
  - b) Exigir evidencia para determinados Tipos o severidades.
- **Recomendación del agente:** Opción a inicialmente; un Tipo configurable podría exigirla después.
- **Respuesta:** Se deja pendiente para una definición posterior.
- **Respondida por / fecha:** —

## OBS-Q-019 — Vigencia de los catálogos

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`, `B-02`; propuesta IA
- **Afecta:** `OBS-BR-007`, `OBS-DEP-003`, `OBS-ENT-002`, `OBS-ENT-005`
- **Pregunta:** ¿Los estados fenológicos, Tipos de Observación y problemas sanitarios usados históricamente se inactivan sin borrarse y solo los activos pueden usarse en nuevos registros?
- **Interpretaciones posibles:**
  - a) Sí, conservar identidad e historia.
  - b) Permitir eliminación si el catálogo ya fue utilizado.
- **Recomendación del agente:** Opción a.
- **Respuesta:** Sí; los elementos utilizados se inactivan sin borrarse y solo los activos se usan en registros nuevos.
- **Respondida por / fecha:** Ingeniero / 2026-11-06

## OBS-Q-020 — Obligatoriedad de la evaluación fenológica

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`, `OBS-Q-004`
- **Afecta:** `OBS-BR-004`, `OBS-ENT-001`, `OBS-UC-003`
- **Pregunta:** Al cambiar de estado fenológico, ¿la evaluación respecto de lo esperado es opcional igual que la nota, o es obligatoria?
- **Interpretaciones posibles:**
  - a) Nota y evaluación opcionales.
  - b) Nota opcional y evaluación obligatoria.
- **Recomendación del agente:** Opción a para no impedir una transición objetiva por falta de valoración.
- **Respuesta:** Nota y evaluación son opcionales.
- **Respondida por / fecha:** Ingeniero / 2026-11-06

## OBS-Q-021 — Fecha observada y estado fenológico asociado

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-02`; propuesta IA
- **Afecta:** `OBS-BR-010`, `OBS-ENT-003`, `OBS-UC-006`, `OBS-UC-007`
- **Pregunta:** ¿Toda Observación registra el momento observado y, cuando referencia una Implantación, conserva automáticamente el estado fenológico vigente en ese momento?
- **Interpretaciones posibles:**
  - a) Sí, momento obligatorio y referencia fenológica automática cuando exista.
  - b) La fecha o el estado fenológico se eligen manualmente.
- **Recomendación del agente:** Opción a para conservar el contexto histórico sin duplicar selección.
- **Respuesta:** Sí; toda Observación registra el momento observado y conserva automáticamente el período fenológico vigente cuando referencia una Implantación.
- **Respondida por / fecha:** Ingeniero / 2026-11-06

## OBS-Q-022 — Definiciones del glosario

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`, `B-02`
- **Afecta:** toda la especificación
- **Pregunta:** ¿Aprobás incorporar al glosario las definiciones propuestas de Estado fenológico, Historial fenológico, Observación y Observación sanitaria?
- **Interpretaciones posibles:**
  - a) Aprobar: Estado fenológico es una etapa configurable por Empresa y Cultivo; Historial fenológico son sus períodos por Implantación; Observación es un hallazgo puntual; Observación sanitaria es un signo, daño o condición anormal de las plantas cuya causa puede ser desconocida, sospechada o confirmada.
  - b) Corregir una o más definiciones antes de incorporarlas.
- **Recomendación del agente:** Opción a, manteniendo Observación separada de Reporte, Labor y diagnóstico.
- **Respuesta:** Aprobadas las cuatro definiciones propuestas.
- **Respondida por / fecha:** Ingeniero / 2026-11-06
