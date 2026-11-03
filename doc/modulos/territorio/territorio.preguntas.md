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

## TER-Q-007 — Comparación del nombre corto

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** detalle pendiente de `TER-BR-007` y `TER-ENT-001`
- **Afecta:** unicidad del nombre corto dentro de la Empresa
- **Pregunta:** ¿Cómo se comparan dos nombres cortos para determinar si están duplicados dentro de una Empresa?
- **Interpretaciones posibles:**
  - a) Ignorar mayúsculas, tildes y espacios repetidos; por ejemplo, `NORTE`, `Norte` y `Nórte` representan el mismo nombre corto.
  - b) Ignorar solo mayúsculas y espacios exteriores; las tildes distinguen valores.
  - c) Usar comparación textual exacta.
- **Recomendación del agente:** opción a), para evitar etiquetas visualmente equivalentes dentro de la misma Empresa.
- **Respuesta:** a.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03 (respuesta en el chat).

## TER-Q-008 — Propiedad del alcance de Chacras del Capataz

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** contrato pendiente de `TER-DEP-002`
- **Afecta:** `TER-BR-004`, consultas del Capataz y dependencia con `ACC`
- **Pregunta:** ¿Qué módulo decide qué Chacras puede consultar un Capataz?
- **Interpretaciones posibles:**
  - a) `ACC` administra el alcance autorizado por Cuenta de Empresa y entrega a `TER` los identificadores permitidos.
  - b) `TER` administra directamente la relación Capataz–Chacra.
  - c) `PER` administra la asignación laboral y `TER` la consume.
- **Recomendación del agente:** opción a), consistente con el contexto de autorización y alcance definido en arquitectura.md §13.
- **Respuesta:** a.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03 (respuesta en el chat).

## TER-Q-009 — Inclusión y filtro de estados en el listado

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** comportamiento no definido de `TER-REQ-003` y `TER-UC-003`
- **Afecta:** listado de Chacras
- **Pregunta:** ¿Qué estados incluye el listado de Chacras y cómo se filtran?
- **Interpretaciones posibles:**
  - a) Mostrar solo activas por defecto y permitir filtrar por estado.
  - b) Mostrar activas e inactivas por defecto y permitir filtrar por estado.
  - c) Excluir las inactivas de los listados y permitir únicamente su consulta directa.
- **Recomendación del agente:** opción a), priorizando la operación vigente sin ocultar el historial.
- **Respuesta:** Mostrar siempre activas e inactivas por defecto, con opción disponible de filtrar por estado.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03 (respuesta en el chat).

## TER-Q-010 — Operación sobre Chacras inactivas

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** comportamiento no definido después de aplicar `TER-BR-005`
- **Afecta:** consulta, modificación y reserva del nombre corto de una Chacra inactiva
- **Pregunta:** ¿Una Chacra inactiva puede consultarse o corregirse y su nombre corto queda reservado?
- **Interpretaciones posibles:**
  - a) Puede consultarse y corregir sus datos descriptivos; el nombre corto continúa reservado.
  - b) No puede modificarse y el nombre corto continúa reservado.
  - c) No puede modificarse y el nombre corto queda disponible para otra Chacra.
- **Recomendación del agente:** opción a), para permitir correcciones sin perder identidad ni reutilizar una etiqueta histórica.
- **Respuesta:** a.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03 (respuesta en el chat).

## TER-Q-011 — Propiedad e historial de las implantaciones

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-02`, `B-03`; límites de módulos de arquitectura.md §4
- **Afecta:** atributos de Lote y dependencias con `CUL`
- **Pregunta:** ¿La plantación se guarda como atributo de Lote o `CUL` administra implantaciones históricas relacionadas con el Lote?
- **Interpretaciones posibles:**
  - a) `CUL` administra las implantaciones; puede haber más de una activa solamente con sectores o superficies diferenciados. La ficha del Lote puede mostrarlas sin copiarlas.
  - b) Solo puede existir una implantación activa por Lote.
  - c) El Lote guarda un texto de plantación.
- **Recomendación del agente:** opción a), porque conserva historia productiva y evita que un cambio de cultivo reescriba el pasado.
- **Respuesta:** Aprueba la recomendación a).
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03 (aprobación integral en el chat).

## TER-Q-012 — Código estable y códigos de registros relacionados

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-02`
- **Afecta:** código de Lote y referencias de otros módulos
- **Pregunta:** ¿Qué almacena el Lote y cómo se forman códigos legibles como el ejemplo `R-L-AB-001`?
- **Interpretaciones posibles:**
  - a) El Lote almacena un código estable, por ejemplo `AB`; cada módulo dueño genera el código de su registro con tipo, código de Chacra, código de Lote y secuencia.
  - b) `TER` genera y administra también los códigos de reportes, observaciones, labores y cosechas.
- **Recomendación del agente:** opción a), usando como patrón legible `<tipo>-<codigoChacra>-<codigoLote>-<secuencia>` sin reemplazar los identificadores técnicos.
- **Respuesta:** Aprueba la recomendación a) y el patrón propuesto.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03 (aprobación integral en el chat).

## TER-Q-013 — Datos territoriales del Lote

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-02`, `B-05`, `B-07`, `B-09`
- **Afecta:** `TER-ENT-002`
- **Pregunta:** ¿Aprobás que Lote contenga nombre hasta 150 caracteres, código hasta 30, descripción hasta 500, notas hasta 2000, tipo de suelo, sistema de riego, estado, geometría vigente opcional y superficie cartográfica derivada, dejando cultivo, cantidad de plantas, marcos de plantación y superficie productiva en `CUL`?
- **Interpretaciones posibles:**
  - a) Aprobar esa distribución por módulo.
  - b) Copiar también datos productivos actuales dentro del Lote.
- **Recomendación del agente:** opción a), para que el dato territorial estable no compita con el historial productivo.
- **Respuesta:** Aprueba la recomendación a).
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03 (aprobación integral en el chat).

## TER-Q-014 — Catálogos de suelo y riego

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-02`
- **Afecta:** tipo de suelo y sistema de riego de `TER-ENT-002`
- **Pregunta:** ¿Tipo de suelo y sistema de riego usan texto libre, catálogos iniciales o catálogos configurables por Empresa? ¿Cuántos sistemas de riego vigentes tiene un Lote en esta entrega?
- **Interpretaciones posibles:**
  - a) Catálogos iniciales y notas opcionales; un sistema de riego principal vigente por Lote.
  - b) Texto libre.
  - c) Catálogos configurables por Empresa y múltiples sistemas simultáneos.
- **Recomendación del agente:** opción a) como primera entrega simple y comparable.
- **Respuesta:** Aprueba la recomendación a). La aprobación del atributo singular se interpreta como un sistema de riego principal vigente por Lote.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03 (aprobación integral en el chat).

## TER-Q-015 — Historial funcional visible desde el Lote

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-03`; trazabilidad de `01_TAREFERO_Alcance_y_modulos.md` §7
- **Afecta:** dependencias con `CUL`, `LAB`, `OBS`, `COS` y `REP`
- **Pregunta:** ¿La ficha cronológica del Lote copia actividades en `TER` o reúne referencias de los módulos dueños?
- **Interpretaciones posibles:**
  - a) Cada módulo conserva sus hechos y `REP` construye la vista cronológica por `loteId`, sin duplicarlos en `TER`.
  - b) `TER` mantiene una segunda tabla con copias de cada actividad.
- **Recomendación del agente:** opción a), para mantener una sola fuente por hecho.
- **Respuesta:** Aprueba la recomendación a).
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03 (aprobación integral en el chat).

## TER-Q-016 — Conservación de versiones geométricas

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-10`; conflicto con arquitectura.md §4 y §11
- **Afecta:** historial territorial, superficies históricas y `TER-ENT-003`
- **Pregunta:** ¿Se conserva solo la geometría vigente o versiones con geometría, superficie, vigencia, actor y motivo?
- **Interpretaciones posibles:**
  - a) Conservar versiones inmutables; una versión queda vigente y las anteriores explican el pasado.
  - b) Conservar solo la geometría vigente, lo que exige cambiar la arquitectura aprobada y guardar superficies históricas en cada operación.
- **Recomendación del agente:** opción a), compatible con la arquitectura y con informes históricos de rendimiento.
- **Respuesta:** Aprueba la recomendación a). Esta respuesta posterior reemplaza la preferencia inicial de `B-10`.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03 (aprobación integral en el chat).

## TER-Q-017 — Formato y validación geográfica

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-04`, `B-05`, `B-08`, `B-09`
- **Afecta:** geometrías, superficies y contratos futuros
- **Pregunta:** ¿Aprobás GeoJSON Polygon en SRID 4326, coordenadas `[longitud, latitud]`, validación del backend y cálculo geodésico o mediante proyección apropiada?
- **Interpretaciones posibles:**
  - a) Aprobar; Mapbox dibuja en el cliente y PostGIS vuelve a validar y calcular en el servidor.
  - b) Confiar en el resultado del cliente sin validación espacial del servidor.
- **Recomendación del agente:** opción a).
- **Respuesta:** Aprueba la recomendación a).
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03 (aprobación integral en el chat).

## TER-Q-018 — Ubicación de referencia de Chacra

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-06`; cambio sobre la primera entrega aprobada
- **Afecta:** `TER-ENT-001`, `TER-UC-001`, `TER-UC-004`
- **Pregunta:** ¿Aprobás agregar a Chacra una dirección textual opcional y un punto de referencia opcional e independiente, sin convertirlos en delimitación territorial ni exigirlos para el alta?
- **Interpretaciones posibles:**
  - a) Aprobar ambos datos opcionales e independientes.
  - b) Exigir al menos uno.
  - c) Mantener Chacra sin ubicación.
- **Recomendación del agente:** opción a).
- **Respuesta:** Aprueba la recomendación a). Por afectar ítems ya aprobados, su incorporación queda sujeta al cambio controlado exigido por reglas-documentacion.md §10.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03 (aprobación integral en el chat).

## TER-Q-019 — Ciclo de vida y operación del Lote

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-02`, `B-07`, `B-12`; propuesta IA para completar el ciclo de vida
- **Afecta:** estados, permisos y operaciones del Lote
- **Pregunta:** ¿Aprobás crear el Lote ACTIVO aunque esté SIN_DELIMITAR, permitir inactivación y reactivación, conservar su historia e impedir nuevas operaciones funcionales mientras esté INACTIVO?
- **Interpretaciones posibles:**
  - a) Aprobar; la disponibilidad geométrica es una condición derivada distinta del estado administrativo, y la inactivación exige resolver procesos activos.
  - b) Mezclar delimitación y ciclo administrativo en un único estado.
- **Recomendación del agente:** opción a). Administrador gestiona; Capataz consulta los Lotes de sus Chacras asignadas; SuperAdministrador actúa mediante soporte auditado.
- **Respuesta:** Aprueba la recomendación a).
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03 (aprobación integral en el chat).

## TER-Q-020 — Estados incluidos en el listado de Lotes

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** comportamiento no definido de `TER-REQ-008`
- **Afecta:** listado de Lotes
- **Pregunta:** ¿El listado de Lotes debe incluir por defecto activos e inactivos, con filtro opcional por estado, igual que el listado aprobado de Chacras?
- **Interpretaciones posibles:**
  - a) Incluir activos e inactivos por defecto y permitir filtrar por estado.
  - b) Incluir solo activos por defecto y permitir filtrar por estado.
  - c) Excluir los inactivos del listado y permitir solo su consulta directa.
- **Recomendación del agente:** opción a), por consistencia con `TER-Q-009` y para no ocultar el historial territorial.
- **Respuesta:** a. Incluir activos e inactivos por defecto y permitir filtrar por estado.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03 (aprobación de las recomendaciones en el chat).

## TER-Q-021 — Correcciones sobre un Lote inactivo

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** detalle no resuelto de `TER-Q-019`
- **Afecta:** modificación descriptiva y corrección geométrica de Lotes inactivos
- **Pregunta:** ¿Qué correcciones administrativas se permiten sobre un Lote INACTIVO?
- **Interpretaciones posibles:**
  - a) Corregir datos descriptivos y geometría con versión, actor y motivo; permanece INACTIVO y continúa bloqueado para operaciones productivas.
  - b) Corregir solo datos descriptivos; la geometría exige reactivarlo.
  - c) No permitir correcciones hasta reactivarlo.
- **Recomendación del agente:** opción a), para corregir el registro histórico sin habilitar operaciones funcionales.
- **Respuesta:** a. Permitir correcciones descriptivas y geométricas con versión, actor y motivo; el Lote permanece INACTIVO y bloqueado para operaciones productivas.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03 (aprobación de las recomendaciones en el chat).

## TER-Q-022 — Coordinación de estados entre Chacra y Lote

- **Estado:** Respondida
- **Bloqueante:** Sí para cambiar la primera entrega de Chacras
- **Origen:** relación entre `TER-BR-005`, `TER-BR-017` y el nuevo ciclo de Lote
- **Afecta:** registro y reactivación de Lotes; posible cambio controlado de la inactivación de Chacra
- **Pregunta:** ¿Cómo se coordinan los estados de una Chacra y sus Lotes?
- **Interpretaciones posibles:**
  - a) Solo se registra o reactiva un Lote en una Chacra ACTIVA, y una Chacra solo puede inactivarse cuando todos sus Lotes están INACTIVOS.
  - b) Solo se exige Chacra ACTIVA para registrar o reactivar Lotes; inactivar la Chacra no cambia ni exige el estado de sus Lotes.
  - c) La inactivación de la Chacra inactiva sus Lotes automáticamente.
- **Recomendación del agente:** opción a), evitando cascadas automáticas y estados territoriales contradictorios. La segunda condición requiere cambio controlado sobre la especificación aprobada de Chacras.
- **Respuesta:** a. Solo se registra o reactiva un Lote en una Chacra ACTIVA y la Chacra solo puede inactivarse cuando todos sus Lotes están INACTIVOS. No se aplican cascadas automáticas.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03 (aprobación de las recomendaciones en el chat). La restricción sobre inactivar Chacras requiere el cambio controlado indicado en reglas-documentacion.md §10.

## TER-Q-023 — Valores iniciales de suelo y riego

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** detalle no definido por `TER-Q-014`; propuesta IA
- **Afecta:** `TER-BR-020`, `TER-BR-021`
- **Pregunta:** ¿Aprobás los valores iniciales propuestos para tipo de suelo y sistema de riego principal?
- **Interpretaciones posibles:**
  - a) Suelo: `ARCILLOSO`, `ARENOSO`, `LIMOSO`, `FRANCO`, `MIXTO`, `OTRO`; riego: `SIN_RIEGO`, `GOTEO`, `ASPERSION`, `MICROASPERSION`, `GRAVEDAD`, `OTRO`. La ausencia significa no informado y `OTRO` se detalla en notas.
  - b) Mantener catálogos iniciales, pero ajustar sus valores.
  - c) Reemplazarlos por catálogos configurables por Empresa.
- **Recomendación del agente:** opción a), porque distingue “sin riego” de “no informado” y cubre una primera clasificación sin crear configuración adicional.
- **Respuesta:** a. Se aprueban los catálogos iniciales propuestos; la ausencia significa no informado y `OTRO` se complementa con notas.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03 (aprobación de las recomendaciones en el chat).

## Aclaraciones diferidas

La expresión literal “Pogri” de `B-01` quedó aclarada en `B-05` como PostGIS. Mapbox participa en el frontend y PostGIS en validación, almacenamiento y cálculo del backend. Lotes y geometrías continúan dentro de `TER`; los hechos productivos y operativos conservan sus módulos dueños según `TER-Q-011` y `TER-Q-015`.
