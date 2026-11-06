---
type: questions
module: "LAB"
---

# Labores — Preguntas

<!-- Registro único de preguntas del módulo. Las respuestas del ingeniero son origen de especificación, con la misma autoridad que el brief.
Una pregunta se abre cuando: falta un dato, una frase admite más de una interpretación, dos párrafos se contradicen, o el agente quiere proponer algo que el brief no dice.
Bloqueante = impide aprobar los ítems que la marcan con [[Q:...]].
No borrar preguntas respondidas: cambian de estado. -->

## LAB-Q-001 — Tarea y Labor

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`, `B-02`
- **Afecta:** terminología de todo el módulo
- **Pregunta:** ¿La palabra “tarea” del brief se refiere al catálogo de trabajos posibles y “Labor” al trabajo concreto planificado o realizado?
- **Interpretaciones posibles:**
  - a) Sí. Se usa Tipo de Labor para “cortar pasto” o “reparar alambrado”, y Labor para cada trabajo concreto.
  - b) Tarea y Labor son entidades distintas con otro significado.
- **Recomendación del agente:** opción a), para usar el término canónico Labor y no confundirlo con una tarea técnica del proyecto.
- **Respuesta:** Opción a), conforme al planteo aprobado en `B-05`.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-06

## LAB-Q-002 — Vigencia del catálogo entre Campañas

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`, `B-04`
- **Afecta:** Tipo de Labor y relación con Campaña
- **Pregunta:** ¿Los Tipos de Labor definidos por una Empresa permanecen disponibles para Campañas posteriores, mientras solo las Órdenes y ejecuciones comienzan desde cero?
- **Interpretaciones posibles:**
  - a) Sí. El catálogo pertenece a la Empresa y se reutiliza; cada hecho de trabajo pertenece a una Campaña.
  - b) Cada Campaña crea su propio catálogo independiente de Tipos de Labor.
- **Recomendación del agente:** opción a), porque “cortar pasto” o “reparar alambrado” son configuraciones reutilizables y `CUL-BR-016` reinicia hechos, no catálogos maestros.
- **Respuesta:** Opción a). El catálogo pertenece a la Empresa y se reutiliza entre Campañas; cada Orden y ejecución pertenece a una Campaña concreta.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-06

## LAB-Q-003 — Campaña obligatoria

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-04`; `CUL-BR-015`, `CUL-BR-016`, `CUL-BR-018`
- **Afecta:** todas las Órdenes y ejecuciones de Labor
- **Pregunta:** ¿Toda Orden y ejecución debe seleccionar explícitamente una Campaña válida, incluso para mantenimiento general sin Implantación o Ciclo?
- **Interpretaciones posibles:**
  - a) Sí. La Campaña es obligatoria; Ciclo e Implantación dependen del contexto de la Labor.
  - b) Las Labores generales pueden existir fuera de una Campaña.
- **Recomendación del agente:** opción a), conforme a `B-04` y para obtener costos e historia completos por Campaña.
- **Respuesta:** Opción a). Todo hecho de Labor lleva `campaniaId`; una Campaña nueva comienza sin hechos propios y las anteriores conservan su historia.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-06

## LAB-Q-004 — Planificación opcional

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-01`, `B-05`
- **Afecta:** creación de Orden y registro directo
- **Pregunta:** ¿Se permite registrar una ejecución no planificada además de crear Órdenes para fechas futuras?
- **Interpretaciones posibles:**
  - a) Sí. La Orden es opcional y una ejecución imprevista puede registrarse directamente.
  - b) Toda ejecución requiere una Orden previa.
- **Recomendación del agente:** opción a), porque el trabajo de campo incluye necesidades imprevistas.
- **Respuesta:** Opción a), incluida en el planteo aprobado en `B-05`.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-06

## LAB-Q-005 — Relación entre Orden y ejecución

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`; `doc/arquitectura.md` §4
- **Afecta:** ciclo de vida y entidades principales
- **Pregunta:** Cuando una Labor se planifica, ¿una Orden puede originar una o varias ejecuciones reales?
- **Interpretaciones posibles:**
  - a) Una única entidad Labor cambia de PLANIFICADA a EN_CURSO y luego a FINALIZADA.
  - b) Una Orden conserva la planificación y puede originar una o varias ejecuciones reales, por ejemplo en días o sectores diferentes.
  - c) Orden y ejecución están separadas, pero cada Orden admite exactamente una ejecución.
- **Recomendación del agente:** opción b), porque la arquitectura ya distingue Orden y Registro de labor, permite comparar plan con realidad y cubre trabajos realizados en varias jornadas.
- **Respuesta:** Opción b). Una Orden conserva la planificación y puede originar una o varias ejecuciones reales.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-06

## LAB-Q-006 — Estados operativos y confirmación

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`, `B-05`
- **Afecta:** ciclo de vida de Orden y ejecución
- **Pregunta:** ¿Se aprueba distinguir planificación, operación y revisión administrativa mediante BORRADOR, PLANIFICADA, EN_CURSO, PAUSADA, FINALIZADA, CONFIRMADA y CANCELADA, aplicados a la entidad que corresponda según `LAB-Q-005`?
- **Interpretaciones posibles:**
  - a) Sí. FINALIZADA indica que el trabajo terminó y CONFIRMADA que el Administrador aceptó sus datos y efectos.
  - b) FINALIZADA confirma todo automáticamente y no existe revisión administrativa.
- **Recomendación del agente:** opción a), para revisar participantes, consumos y remuneración antes de fijarlos.
- **Respuesta:** Opción a), incluida en el planteo aprobado en `B-05`.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-06

## LAB-Q-007 — Administración y operación

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`, `B-02`, `B-05`
- **Afecta:** permisos del módulo
- **Pregunta:** ¿El Administrador mantiene Tipos de Labor, planifica y confirma; mientras el Capataz inicia, pausa, reanuda, finaliza y carga la ejecución?
- **Interpretaciones posibles:**
  - a) Sí, y ambos pueden consultar según su alcance.
  - b) Solo el Administrador opera todo el ciclo.
- **Recomendación del agente:** opción a), consistente con la operación diaria descripta.
- **Respuesta:** Aclarada posteriormente por `LAB-Q-021` y `LAB-Q-022`: el Administrador mantiene Tipos de Labor y confirma; tanto el Administrador como el Capataz pueden crear una Labor planificada o directa; el Capataz controla todo el ciclo cotidiano hasta dejarla FINALIZADA.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-06

## LAB-Q-008 — Cuadrilla prevista y participantes reales

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`, `B-05`; `PER-BR-013`, `PER-BR-014`
- **Afecta:** asignación e historia de participación
- **Pregunta:** Si se asigna una Cuadrilla, ¿la ejecución debe conservar igualmente a cada Empleado que participó realmente?
- **Interpretaciones posibles:**
  - a) Sí. La Cuadrilla es una referencia prevista u operativa y la participación histórica siempre es individual.
  - b) Se conserva solo la Cuadrilla y se reconstruyen integrantes desde su composición actual.
- **Recomendación del agente:** opción a), para que cambios posteriores de la Cuadrilla no alteren la historia.
- **Respuesta:** Opción a), conforme al planteo aprobado.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-06

## LAB-Q-009 — Dueño de tarifas y devengos

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`, `B-03`, `B-05`; `PER-Q-032`
- **Afecta:** límite entre LAB y PER
- **Pregunta:** ¿LAB conserva hechos, cantidades y participación, mientras PER conserva reglas monetarias, propone importes y confirma el devengo?
- **Interpretaciones posibles:**
  - a) Sí. La pantalla puede ser unificada, pero la propiedad de la remuneración permanece en PER.
  - b) LAB conserva también tarifas e importes finales de pago.
- **Recomendación del agente:** opción a), para separar el trabajo ocurrido de la política de remuneración.
- **Respuesta:** Opción a), conforme al planteo aprobado en `B-05`.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-06

## LAB-Q-010 — Distribución de una Labor remunerable

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-03`, `B-05`
- **Afecta:** participación individual y propuesta de remuneración
- **Pregunta:** ¿Se aprueba que una Labor con monto total proponga partes iguales, permita al Administrador cambiar porcentajes con motivo y considere también la participación de Empleados mensuales sin generarles un adicional automático?
- **Interpretaciones posibles:**
  - a) Sí. Los porcentajes representan contribución al trabajo; PER decide qué participantes generan pago variable.
  - b) El total se divide solo entre quienes cobran por Labor.
- **Recomendación del agente:** opción a), porque reproduce el ejemplo de Juan mensual y Pedro por Labor.
- **Respuesta:** Opción a), incluida en el planteo aprobado en `B-05`.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-06

## LAB-Q-011 — Ajuste del monto predeterminado

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-01`, `B-03`, `B-05`
- **Afecta:** integración con PER
- **Pregunta:** ¿El Administrador puede modificar para una Labor concreta el monto sugerido por el Tipo de Labor, dejando motivo y conservando el valor original?
- **Interpretaciones posibles:**
  - a) Sí.
  - b) No; siempre se usa el monto predeterminado.
- **Recomendación del agente:** opción a), para atender condiciones reales sin perder trazabilidad.
- **Respuesta:** Opción a), incluida en el planteo aprobado.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-06

## LAB-Q-012 — Asistencia e imputación a Labores

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-03`, `B-05`; `PER-BR-016` a `PER-BR-020`
- **Afecta:** tiempos individuales y validación
- **Pregunta:** ¿La asistencia y la imputación a Labores permanecen separadas, se muestran diferencias sin rechazarlas automáticamente y se impiden intervalos de Labor simultáneos para un mismo Empleado?
- **Interpretaciones posibles:**
  - a) Sí.
  - b) Toda hora de asistencia debe imputarse obligatoriamente y las diferencias bloquean.
- **Recomendación del agente:** opción a), porque puede haber pausas, traslados o carga pendiente.
- **Respuesta:** Opción a), incluida en el planteo aprobado.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-06

## LAB-Q-013 — Confirmación de consumos

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-02`; integración con `INV`
- **Afecta:** confirmación de ejecución y salidas de Existencia
- **Pregunta:** Si una Labor declara varios Insumos y uno no puede confirmarse por falta de Existencia, ¿qué sucede con el resto y con la Labor?
- **Interpretaciones posibles:**
  - a) Cada consumo se confirma o rechaza por línea; la Labor puede confirmarse mostrando efectos pendientes o rechazados.
  - b) La confirmación es atómica: si falla un consumo, no se confirma ningún consumo ni la Labor.
  - c) La Labor se confirma, pero ningún consumo afecta Existencia hasta una revisión posterior conjunta.
- **Recomendación del agente:** opción a), porque conserva el hecho real, evita afirmar consumos inexistentes y funciona mejor con carga móvil o diferida.
- **Respuesta:** Opción a). Cada consumo se confirma o rechaza por línea; la Labor puede confirmarse mostrando claramente efectos pendientes o rechazados.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-06

## LAB-Q-014 — Pausa o cancelación con ejecución parcial

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`, `B-05`
- **Afecta:** historia, consumos y remuneración parcial
- **Pregunta:** ¿Una Labor cancelada después de comenzar conserva participantes, tiempos, cantidades y recursos ya utilizados, y puede originar remuneración parcial?
- **Interpretaciones posibles:**
  - a) Sí; se exige motivo y no se revierten automáticamente hechos reales.
  - b) Cancelar elimina toda la ejecución.
- **Recomendación del agente:** opción a), por trazabilidad.
- **Respuesta:** Opción a), incluida en el planteo aprobado.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-06

## LAB-Q-015 — Notas, imágenes e informes

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-02`, `B-05`
- **Afecta:** evidencia de Orden y ejecución
- **Pregunta:** ¿LAB conserva notas y referencias a imágenes o informes privados cuyo contenido binario pertenece a ARC?
- **Interpretaciones posibles:**
  - a) Sí.
  - b) LAB almacena también los binarios.
- **Recomendación del agente:** opción a), consistente con la arquitectura de Archivos.
- **Respuesta:** Opción a), conforme al brief y al planteo aprobado.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-06

## LAB-Q-016 — Trabajo que cruza Campañas

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-04`; `CUL-BR-016`, `CUL-BR-018`
- **Afecta:** cierre de Campaña y continuidad de Órdenes o ejecuciones
- **Pregunta:** Si una Orden o ejecución comienza en una Campaña y continúa cuando debe imputarse trabajo a otra, ¿cómo se conserva la separación?
- **Interpretaciones posibles:**
  - a) El trabajo se divide: se cierra o cancela la parte de la Campaña anterior y se crea otra Orden o ejecución para la nueva.
  - b) Todo permanece en la Campaña donde comenzó, aunque parte del trabajo ocurra después.
  - c) Se permite cambiar `campaniaId` mientras no esté CONFIRMADA.
- **Recomendación del agente:** opción a), porque impide trasladar hechos y costos entre Campañas y respeta `CUL-BR-016`.
- **Respuesta:** Opción a). El trabajo se divide entre Campañas; se cierra o cancela la parte anterior y se crea otra Orden o ejecución para la nueva.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-06

## LAB-Q-017 — Identidad y ciclo del Tipo de Labor

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-01`; propuesta IA
- **Afecta:** catálogo de Tipos de Labor
- **Pregunta:** ¿Se aprueba que cada Tipo de Labor tenga código y nombre obligatorios, únicos dentro de la Empresa, descripción opcional y estados ACTIVO e INACTIVO sin borrado físico?
- **Interpretaciones posibles:**
  - a) Sí; el código es inmutable y los Tipos usados conservan historia.
  - b) Usar otra identidad o permitir eliminación, indicándola.
- **Recomendación del agente:** opción a), para referenciar tarifas e historia sin depender de nombres editables.
- **Respuesta:** Opción a). Código y nombre obligatorios y únicos dentro de la Empresa, código inmutable, estados ACTIVO e INACTIVO y sin borrado físico.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-06

## LAB-Q-018 — Contexto exigido por Tipo de Labor

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`, `B-04`, `B-05`; `TER-DEP-004`, `CUL-DEP-004`
- **Afecta:** ubicación y contexto productivo
- **Pregunta:** ¿Cada Tipo de Labor determina si requiere Chacra, Lote, Implantación, Ciclo o instalación, manteniendo siempre Campaña obligatoria?
- **Interpretaciones posibles:**
  - a) Sí. Una reparación general no inventa una Implantación; una intervención productiva exige el contexto compatible.
  - b) Toda Labor exige siempre Lote, Implantación y Ciclo.
- **Recomendación del agente:** opción a), para cubrir mantenimiento y trabajos productivos.
- **Respuesta:** Opción a), incluida en el planteo aprobado.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-06

## LAB-Q-019 — Cosechar como Labor y Cosecha como producción

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`, `B-03`, `B-05`
- **Afecta:** límite entre LAB y COS
- **Pregunta:** ¿“Cosechar” puede ser un Tipo de Labor que registra trabajo y participantes, mientras COS registra producción, pesajes y cantidades obtenidas sin duplicarlas en LAB?
- **Interpretaciones posibles:**
  - a) Sí; ambos hechos se vinculan cuando corresponda.
  - b) LAB registra también la producción completa.
- **Recomendación del agente:** opción a), para separar trabajo de producto obtenido.
- **Respuesta:** Opción a), incluida en el planteo aprobado.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-06

## LAB-Q-020 — Reportes por Campaña

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-04`, `B-05`; `CUL-BR-019`
- **Afecta:** límite entre LAB y REP
- **Pregunta:** ¿LAB conserva los hechos con `campaniaId` y REP calcula vistas e indicadores por Campaña sin copiar ni reiniciar registros?
- **Interpretaciones posibles:**
  - a) Sí.
  - b) LAB almacena reportes y acumulados reiniciables.
- **Recomendación del agente:** opción a), consistente con el módulo de Reportes.
- **Respuesta:** Opción a), conforme a `B-04` y al planteo aprobado.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-06

## LAB-Q-021 — Creación de Labores por Administrador y Capataz

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** aclaración del Ingeniero posterior a `LAB-Q-007`
- **Afecta:** permisos para crear Órdenes y ejecuciones
- **Pregunta:** ¿Quién puede crear una Labor planificada o directa?
- **Interpretaciones posibles:**
  - a) Tanto el Administrador como el Capataz pueden crearla; el Capataz necesita hacerlo porque conoce la necesidad en el campo.
  - b) Solo el Administrador crea y el Capataz opera registros existentes.
- **Recomendación del agente:** opción a), manteniendo la administración del catálogo de Tipos de Labor y la confirmación final bajo el Administrador.
- **Respuesta:** Opción a). El Capataz debe poder crear Labores porque está en el campo y conoce qué debe hacerse; el Administrador también debe poder crearlas.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-06

## LAB-Q-022 — Ciclo cotidiano a cargo del Capataz

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** aclaración del Ingeniero posterior a `LAB-Q-021`
- **Afecta:** permisos sobre Órdenes, ejecuciones e historia operativa
- **Pregunta:** ¿Hasta qué estado puede gestionar el Capataz una Labor?
- **Interpretaciones posibles:**
  - a) Puede crearla, modificarla y recorrer todas sus fases operativas hasta dejarla FINALIZADA; el Administrador realiza el control final y la pasa a CONFIRMADA.
  - b) El Capataz solo carga datos y cada cambio de estado requiere al Administrador.
- **Recomendación del agente:** opción a), porque el Capataz gestiona el día a día de campo y la confirmación administrativa mantiene el control final.
- **Respuesta:** Opción a). El Capataz puede hacer todo lo referido al ciclo cotidiano de la Labor, crear, modificar y avanzar hasta completar el trabajo. El Administrador da el control final de conformidad.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-06
