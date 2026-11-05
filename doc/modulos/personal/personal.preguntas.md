---
type: questions
module: "PER"
---

# Personal — Preguntas

<!-- Registro único de preguntas del módulo. Las respuestas del ingeniero son origen de especificación, con la misma autoridad que el brief.
Una pregunta se abre cuando: falta un dato, una frase admite más de una interpretación, dos párrafos se contradicen, o el agente quiere proponer algo que el brief no dice.
Bloqueante = impide aprobar los ítems que la marcan con [[Q:...]].
No borrar preguntas respondidas: cambian de estado. -->

## PER-Q-001 — Relación obligatoria entre acceso y Empleado

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`; conflicto con `ACC-DEP-003`
- **Afecta:** límite entre `PER` y `ACC`; alta del Administrador y de Cuentas de Empresa
- **Pregunta:** ¿Toda Cuenta de Empresa debe estar vinculada obligatoriamente con un Empleado de esa misma Empresa, incluido el Administrador inicial? El SuperAdministrador queda fuera porque no pertenece a una Empresa cliente.
- **Interpretaciones posibles:**
  - a) Sí. Todo Usuario de Empresa es primero un Empleado; esta decisión reemplaza la salvedad aprobada en `ACC-DEP-003` sobre Administradores que podrían no ser Empleados.
  - b) Toda Cuenta de Empresa referencia una Persona, pero la ficha de Empleado es opcional para cualquier rol.
  - c) Administrador puede existir como Persona sin ser Empleado; Capataz y Empleado con acceso sí requieren ficha de Empleado.
- **Recomendación del agente:** opción c). Mantiene separadas identidad, relación laboral y acceso, y evita registrar artificialmente al dueño de la Empresa como Empleado cuando no lo sea.
- **Respuesta:** Opción c). Capataz y Empleado con acceso requieren ficha de Empleado; el Administrador puede existir como Persona sin ser Empleado. El SuperAdministrador permanece fuera del tenant.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-002 — Identidad por Empresa y unicidad del DNI

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`
- **Afecta:** identidad y aislamiento de Empleado
- **Pregunta:** ¿El DNI identifica de forma única al Empleado solo dentro de una Empresa cliente, permitiendo un registro independiente con el mismo DNI en otra Empresa?
- **Interpretaciones posibles:**
  - a) Sí; la unicidad es Empresa más DNI y no existe una Persona global compartida entre Empresas.
  - b) Existe una Persona global por DNI y cada Empresa crea una relación laboral distinta con ella.
- **Recomendación del agente:** opción a), porque coincide con el brief y mantiene el aislamiento multiempresa.
- **Respuesta:** Opción a). El DNI es único dentro de cada Empresa cliente; si la misma persona trabaja para otra Empresa se crea y conserva otro registro independiente.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-003 — Reingreso en la misma Empresa

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`; propuesta IA sobre ciclo de vida
- **Afecta:** historia laboral y unicidad del DNI
- **Pregunta:** Si un Empleado deja la Empresa y luego regresa, ¿se reactiva la misma ficha conservando períodos laborales o se crea otra ficha con el mismo DNI?
- **Interpretaciones posibles:**
  - a) Se reutiliza la ficha y se agregan períodos de vinculación laboral.
  - b) Se crea una ficha nueva por cada contratación.
- **Recomendación del agente:** opción a), para evitar duplicados y mantener toda la historia de la persona dentro de la Empresa.
- **Respuesta:** Opción a). Se reutiliza la misma ficha y se conservan los distintos períodos laborales.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-004 — Cómputo del límite de Empleados

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`; impacto en `SUS`
- **Afecta:** alta, reactivación y Suscripción de Empresa
- **Pregunta:** ¿Qué registros consumen el límite de Empleados de la Suscripción de Empresa?
- **Interpretaciones posibles:**
  - a) Solo Empleados con vínculo laboral activo; las fichas históricas no consumen cupo.
  - b) Todas las fichas creadas, incluso las inactivas.
  - c) Cada Plan de suscripción decide expresamente si cuenta activos o todas las fichas.
- **Recomendación del agente:** opción a). Permite conservar historia sin bloquear nuevas contrataciones; `SUS` deberá informar el límite vigente.
- **Respuesta:** Opción a). Solo los Empleados con vínculo laboral activo consumen el límite de la Suscripción de Empresa; la historia no consume cupo.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-005 — Datos opcionales de la ficha

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`; `ACC-Q-002`
- **Afecta:** ficha de Empleado y privacidad
- **Pregunta:** Además de DNI, nombre, apellido y teléfono obligatorios, ¿qué conjunto inicial de datos opcionales debe administrar PER?
- **Interpretaciones posibles:**
  - a) Fecha de nacimiento, domicilio, teléfono alternativo, contacto de emergencia, dato de sangre, especialidades, licencias, fecha de ingreso, notas y referencias a archivos de `ARC`.
  - b) Solo datos de contacto y fecha de ingreso; los demás se incorporan posteriormente.
  - c) Otro conjunto indicado por el Ingeniero.
- **Recomendación del agente:** opción a), con acceso restringido y sin guardar archivos binarios en PER.
- **Respuesta:** Opción a). Se aprueba el conjunto inicial propuesto; los archivos binarios permanecen en `ARC`.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-006 — Restricciones visibles durante la asistencia

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-03`
- **Afecta:** ficha, asistencia y privacidad
- **Pregunta:** ¿Qué significa que un Empleado tenga una restricción y cuánto detalle puede ver el Capataz?
- **Interpretaciones posibles:**
  - a) La restricción tiene tipo, vigencia, nivel de aviso o bloqueo y una indicación operativa; el Capataz ve solo lo necesario para operar, no diagnósticos ni información médica detallada.
  - b) Es una nota libre y el Capataz ve todo su contenido.
  - c) La restricción solo es visible para el Administrador y no aparece al registrar asistencia.
- **Recomendación del agente:** opción a), por seguridad operativa y minimización de datos personales.
- **Respuesta:** Se aprueban tipo, vigencia, indicación operativa y visualización mínima para el Capataz, sin diagnósticos ni información médica detallada. Aclaración posterior de `PER-Q-029`: ninguna restricción vuelve incompatible una Labor; el bloqueo corresponde a una indisponibilidad que impide marcar PRESENTE y se precisa en `PER-Q-033`.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05 (respuesta aclarada por `PER-Q-029`)

## PER-Q-007 — Ciclo de vida de Empleado

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-01`; propuesta IA
- **Afecta:** administración e historia de Empleado
- **Pregunta:** ¿Se aprueba que un Empleado use estados ACTIVO e INACTIVO, no se elimine físicamente y toda inactivación o reactivación conserve fecha y motivo?
- **Interpretaciones posibles:**
  - a) Sí.
  - b) Usar otros estados o permitir eliminación, indicándolos.
- **Recomendación del agente:** opción a), para proteger la trazabilidad de asistencia, cuadrillas y remuneraciones.
- **Respuesta:** Opción a). Estados ACTIVO e INACTIVO, sin borrado físico, conservando fecha y motivo de cada cambio.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-008 — Pertenencia simultánea a Cuadrillas

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-02`
- **Afecta:** composición de Cuadrilla y responsabilidad por asistencia
- **Pregunta:** Sin distinguir una Cuadrilla principal, ¿un Empleado puede integrar simultáneamente más de una Cuadrilla activa?
- **Interpretaciones posibles:**
  - a) Una sola; puede trasladarse entre Cuadrillas conservando el historial.
  - b) Varias; la asistencia sigue siendo única por Empleado y día y no depende de una Cuadrilla principal.
- **Recomendación del agente:** opción b), después de la aclaración `B-06`. Es útil para integrar equipos por especialidad o trabajo; la unicidad diaria de asistencia evita registros duplicados aunque varios Capataces vean al Empleado.
- **Respuesta:** Opción b), conforme a la recomendación revisada y aceptada. Un Empleado puede integrar simultáneamente varias Cuadrillas activas, sin Cuadrilla principal; la asistencia es única por Empleado y día y no se duplica por pertenecer a varios grupos.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-009 — Código automático de Cuadrilla

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-02`, `B-05`, `B-07`
- **Afecta:** identidad de Cuadrilla
- **Pregunta:** ¿Cómo se aplica el identificador de una letra y dos números?
- **Interpretaciones posibles:**
  - a) Es único dentro de la Empresa, se genera desde A01 hasta Z99, es inmutable y nunca se reutiliza.
  - b) Es único en toda la plataforma.
  - c) Puede reutilizarse después de inactivar una Cuadrilla.
- **Recomendación del agente:** opción a). Aísla Empresas y evita confundir registros históricos; ofrece 2574 códigos por Empresa.
- **Respuesta:** Opción a). El código es único únicamente dentro de la Empresa cliente; otra Empresa puede repetirlo porque pertenece a otro tenant. Se genera entre A01 y Z99, es inmutable y no se reutiliza.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-010 — Líder de Cuadrilla

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-02`, `B-08`
- **Afecta:** composición, liderazgo y acceso
- **Pregunta:** ¿Qué condiciones debe cumplir el líder opcional de una Cuadrilla?
- **Interpretaciones posibles:**
  - a) Debe ser integrante activo; puede no tener acceso, pero para consultar la Cuadrilla o confirmar asistencia debe tener Cuenta de Empresa con rol Capataz.
  - b) Siempre debe ser un Capataz con acceso.
  - c) Puede ser cualquier Empleado, incluso sin integrar la Cuadrilla.
- **Recomendación del agente:** opción a), porque separa la responsabilidad laboral de la capacidad de operar el sistema.
- **Respuesta:** Opción a). El líder es un Empleado integrante activo elegido por el Capataz y no necesita ser Usuario ni tener acceso. Ser líder no le concede permisos del sistema; si además debiera operar Tarefero necesitaría la Cuenta de Empresa y el rol correspondientes en `ACC`.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-011 — Cuadrillas visibles para el Capataz

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-02`, `B-03`
- **Afecta:** permisos de consulta y registro de asistencia
- **Pregunta:** ¿Qué Cuadrillas puede consultar y gestionar operativamente un Capataz?
- **Interpretaciones posibles:**
  - a) Solo aquellas a las que esté asignado expresamente como Capataz vigente, sea o no su líder.
  - b) Solo aquellas que lidere.
  - c) Todas las Cuadrillas de la Empresa.
- **Recomendación del agente:** opción a); la asignación operativa pertenece a PER y el rol de acceso continúa perteneciendo a ACC.
- **Respuesta:** El Capataz crea Cuadrillas y puede administrar y operar cualquier Cuadrilla que él mismo haya creado. Otros Capataces pueden crear sus propias Cuadrillas en otras Chacras o Lotes. La continuidad ante cambio de Capataz y la relación territorial se precisan en `PER-Q-022` y `PER-Q-023`.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-012 — Resultado diario de asistencia

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-03`, `B-09`
- **Afecta:** registro y consulta de asistencia
- **Pregunta:** ¿La asistencia debe registrar explícitamente el resultado de cada Empleado esperado o solo a quienes asistieron?
- **Interpretaciones posibles:**
  - a) Registrar PRESENTE, AUSENTE o AUSENCIA_JUSTIFICADA para cada integrante esperado; la falta de registro significa pendiente, no ausente.
  - b) Registrar solo PRESENTE; quien no tenga registro se considera ausente.
  - c) Usar otro catálogo indicado por el Ingeniero.
- **Recomendación del agente:** opción a), porque diferencia una ausencia real de una asistencia todavía no cargada.
- **Respuesta:** Opción a). Cada Empleado esperado tendrá un resultado explícito PRESENTE, AUSENTE o AUSENCIA_JUSTIFICADA; la falta de registro significa pendiente.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-013 — Intervalos horarios y remuneración por hora

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-03`, `B-09`
- **Afecta:** asistencia y cálculo de horas
- **Pregunta:** ¿Se admite un único ingreso y egreso por día o varios intervalos para pausas, salidas y reingresos? ¿Qué se exige cuando la remuneración es por hora?
- **Interpretaciones posibles:**
  - a) Un solo ingreso y egreso opcionales; si la remuneración es por hora ambos son obligatorios.
  - b) Varios intervalos opcionales; para remuneración por hora todos los intervalos deben quedar cerrados antes de confirmar.
  - c) Las horas siempre son opcionales, incluso cuando se paga por hora, y el importe se completa manualmente.
- **Recomendación del agente:** opción b), porque permite pausas y jornadas partidas sin perder un cálculo verificable.
- **Respuesta:** Opción b). Se admiten varios intervalos opcionales; cuando la remuneración es por hora, todos deben quedar cerrados antes de confirmar.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-014 — Notas de ingreso, egreso y asistencia

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-03`
- **Afecta:** detalle de asistencia
- **Pregunta:** ¿La nota opcional pertenece a cada marca horaria y se necesita además una observación general del día?
- **Interpretaciones posibles:**
  - a) Cada ingreso o egreso puede tener su propia nota; no existe otra nota general.
  - b) Cada ingreso o egreso puede tener su nota y la asistencia puede tener además una observación general.
  - c) Existe únicamente una nota general por Empleado y día.
- **Recomendación del agente:** opción a), porque coincide exactamente con `B-03` y conserva el contexto de cada marca sin agregar otro campo no solicitado.
- **Respuesta:** Opción a). Cada ingreso o egreso puede tener su propia nota opcional y no se agrega una nota general diferente.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-015 — Confirmación y corrección de asistencia

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-03`, `B-09`; propuesta IA aprobada
- **Afecta:** ciclo de vida de asistencia e historial
- **Pregunta:** ¿Quién puede modificar una asistencia y cómo se conserva una corrección?
- **Interpretaciones posibles:**
  - a) El Capataz asignado prepara y confirma; puede corregir antes de confirmar. Luego solo el Administrador corrige indicando motivo y se conserva la versión anterior.
  - b) El Capataz puede modificarla en cualquier momento sin aprobación adicional.
  - c) Solo el Administrador puede confirmar y corregir.
- **Recomendación del agente:** opción a), porque da agilidad en campo y protege la información ya utilizada para remuneración.
- **Respuesta:** Opción a). El Capataz asignado prepara y confirma, puede corregir antes de confirmar y, después, solo el Administrador corrige con motivo conservando la versión anterior.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-016 — Modalidades de remuneración

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-04`, `B-11`
- **Afecta:** configuración y tarifas
- **Pregunta:** ¿Qué catálogo inicial de modalidades de remuneración debe ofrecer la Empresa?
- **Interpretaciones posibles:**
  - a) MENSUAL, JORNAL, POR_HORA, POR_LABOR, POR_PRODUCCION y MIXTA.
  - b) Solo MENSUAL, POR_HORA y POR_LABOR.
  - c) Un catálogo libre definido por cada Empresa.
- **Recomendación del agente:** opción a). Jornal cubre pago por día; Producción permite kilogramo, cajón, bolsa, tonelada, hectárea u otra unidad; Mixta combina una base con componentes variables. Los valores deben ser cerrados para que los cálculos sean verificables.
- **Respuesta:** Opción a). Se aprueban MENSUAL, JORNAL, POR_HORA, POR_LABOR, POR_PRODUCCION y MIXTA, con unidades verificables para la producción.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-017 — Precedencia de configuración y tarifa

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-04`, `B-11`
- **Afecta:** modalidad, tarifa y cálculo
- **Pregunta:** ¿Cómo se combinan la configuración general de Empresa, la excepción por Empleado y los importes propios de una Labor?
- **Interpretaciones posibles:**
  - a) La Empresa define una modalidad y tarifa general; el Empleado puede tener una excepción; para POR_LABOR o POR_PRODUCCION se usa la tarifa del tipo de Labor o producción, con una excepción adicional por Empleado. Siempre gana lo más específico.
  - b) Solo existe una configuración por Empresa o por Empleado; la Labor no aporta tarifas.
  - c) Cada Labor define manualmente el importe final sin configuraciones reutilizables.
- **Recomendación del agente:** opción a), con precedencia explícita: Empleado más Labor o unidad, luego Labor o unidad de la Empresa, luego Empleado, y finalmente configuración general.
- **Respuesta:** Opción a). Gana la configuración más específica: Empleado más Labor o unidad, Labor o unidad de la Empresa, Empleado y finalmente configuración general.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-018 — Vigencia e historia de tarifas

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-04`, `B-11`; propuesta IA aprobada
- **Afecta:** tarifa y registros históricos
- **Pregunta:** ¿Las tarifas tienen fecha de vigencia y el valor aplicado queda fijado al confirmar la asistencia, Labor o producción?
- **Interpretaciones posibles:**
  - a) Sí; cambiar una tarifa solo afecta hechos posteriores y nunca recalcula automáticamente los ya confirmados.
  - b) No; al consultar o liquidar se usa siempre la tarifa vigente actual.
- **Recomendación del agente:** opción a), para que una actualización no cambie retroactivamente deudas o costos históricos.
- **Respuesta:** Opción a). Las tarifas tienen vigencia y el valor aplicado queda fijado al confirmar; los cambios no recalculan automáticamente hechos anteriores.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-019 — Límite entre remuneración y Economía

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-04`, `B-11`; `EPIC-005`, `EPIC-012`
- **Afecta:** límites de `PER`, `LAB`, `COS` y `ECO`
- **Pregunta:** ¿Hasta dónde llega PER en la liquidación del trabajo?
- **Interpretaciones posibles:**
  - a) PER administra modalidades y tarifas y calcula el importe bruto devengado; LAB y COS aportan cantidades confirmadas; ECO registra la obligación y el pago. Impuestos, descuentos legales y recibos de sueldo quedan fuera de esta etapa.
  - b) PER implementa una liquidación completa de nómina, impuestos, descuentos y recibos.
  - c) PER solo guarda la modalidad; todos los cálculos y pagos pertenecen a ECO.
- **Recomendación del agente:** opción a), porque cumple la liquidación operativa de `EPIC-005` sin convertir PER en un sistema contable o de nómina legal.
- **Respuesta:** Opción a). PER administra modalidades y tarifas y calcula el importe bruto devengado; LAB y COS aportan cantidades confirmadas; ECO registra obligación y pago. Impuestos, descuentos legales y recibos quedan fuera de esta etapa.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-020 — Consulta propia del Empleado con acceso

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-01`, `B-03`; propuesta IA
- **Afecta:** permisos de consulta
- **Pregunta:** ¿Un Empleado que tenga Cuenta de Empresa puede consultar su propia ficha, asistencia y remuneración operativa?
- **Interpretaciones posibles:**
  - a) Sí, en modo de solo lectura y sin mostrar datos administrativos internos.
  - b) No; únicamente Administrador y Capataz consultan información de PER.
  - c) Puede consultar y también solicitar correcciones que debe resolver el Administrador.
- **Recomendación del agente:** opción c), porque da transparencia sin permitir que el Empleado modifique registros confirmados directamente.
- **Respuesta:** Opción a). Un Empleado con Cuenta de Empresa puede consultar su propia ficha y asistencia en modo de solo lectura, sin datos administrativos internos.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-021 — Alcance transversal del aislamiento por tenant

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-05`; conflicto potencial con arquitectura.md §13.4
- **Afecta:** todas las entidades de `PER` y, si la interpretación es literal, la arquitectura transversal
- **Pregunta:** ¿La aclaración “toda tabla o entidad debe tener su id de tenant” se aplica a todos los datos propios de una Empresa cliente, conservando las excepciones globales ya aprobadas, o literalmente a todas las tablas de la plataforma?
- **Interpretaciones posibles:**
  - a) Toda entidad o registro tenant-scoped, incluido todo lo propio de PER, lleva `empresaId` y se filtra obligatoriamente por Empresa; permanecen como excepciones explícitas Empresa, SuperAdministrador, catálogos globales, Planes y otras identidades globales aprobadas.
  - b) Toda tabla sin excepción lleva `empresaId`, incluso Empresa, SuperAdministrador, catálogos globales y Planes de suscripción; esto reemplaza arquitectura.md §13.4 y requiere una revisión de fase 0.
- **Recomendación del agente:** opción a). Es la regla multiempresa ya aprobada, evita un `empresaId` circular en Empresa y conserva los elementos que por definición pertenecen a la plataforma completa. Ningún dato de negocio de una Empresa queda compartido.
- **Respuesta:** Opción a). Toda entidad o registro tenant-scoped, incluido todo lo propio de PER, lleva `empresaId` y se filtra por Empresa; permanecen únicamente las excepciones globales explícitas de arquitectura.md §13.4.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-022 — Continuidad de una Cuadrilla sin su Capataz creador

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `PER-Q-011`; propuesta IA sobre ciclo de vida
- **Afecta:** administración, operación e historia de Cuadrilla
- **Pregunta:** Si el Capataz creador deja de trabajar, pierde acceso o ya no debe operar la Cuadrilla, ¿cómo continúa su administración?
- **Interpretaciones posibles:**
  - a) La Cuadrilla conserva al creador como dato histórico y el Administrador designa otro Capataz responsable; desde entonces el nuevo responsable la administra y opera.
  - b) La Cuadrilla queda administrable únicamente por el Administrador y no puede transferirse a otro Capataz.
  - c) La Cuadrilla admite varios Capataces administradores simultáneos.
- **Recomendación del agente:** opción a). Evita Cuadrillas huérfanas, mantiene un único responsable operativo vigente y conserva quién la creó.
- **Respuesta:** Opción a). Se conserva el Capataz creador como dato histórico y el Administrador designa otro Capataz responsable, quien pasa a administrar y operar la Cuadrilla.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-023 — Relación territorial de la Cuadrilla

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `PER-Q-011`; mención de Chacras y Lotes
- **Afecta:** límites entre `PER`, `TER`, `ACC` y `LAB`
- **Pregunta:** Cuando se menciona que distintos Capataces crean Cuadrillas en otras Chacras o Lotes, ¿la Cuadrilla conserva una asignación territorial propia?
- **Interpretaciones posibles:**
  - a) Sí; la Cuadrilla tiene asignaciones vigentes e históricas a una o más Chacras y/o Lotes, y el Capataz solo puede asignarla dentro del alcance que `ACC` le autoriza.
  - b) La Cuadrilla pertenece a una única Chacra o Lote durante toda su existencia.
  - c) No; PER solo organiza integrantes. Cada Labor en `LAB` determina en qué Chacra o Lote trabaja la Cuadrilla.
- **Recomendación del agente:** opción a), porque permite organizar operativamente dónde está destinada la Cuadrilla sin hacer permanente esa ubicación; `TER` sigue siendo dueño de Chacras y Lotes y `LAB` registra el trabajo efectivo.
- **Respuesta:** Opción c). La Cuadrilla no conserva territorio propio; PER organiza sus integrantes y cada Labor en `LAB` determina la Chacra o el Lote donde trabaja.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-024 — Asistencia de un Empleado compartido entre Cuadrillas

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `PER-Q-008`, `PER-Q-011`, `PER-Q-013`
- **Afecta:** autorización, unicidad y confirmación de asistencia
- **Pregunta:** Si un Empleado integra Cuadrillas creadas por distintos Capataces, ¿cómo se evita que ambos confirmen asistencias diferentes para el mismo día?
- **Interpretaciones posibles:**
  - a) Existe una única asistencia por Empleado y día; el primer Capataz autorizado que la inicia queda como responsable de completarla y confirmarla, y los demás ven el estado sin duplicarla.
  - b) Varios Capataces pueden agregar intervalos a la misma asistencia; cualquiera puede confirmarla cuando todos estén cerrados.
  - c) Cada Cuadrilla conserva una asistencia separada para el mismo Empleado y día.
- **Recomendación del agente:** opción a). Mantiene una única fuente diaria, evita confirmaciones concurrentes y deja las horas dedicadas a cada trabajo bajo `LAB`.
- **Respuesta:** Opción a). Existe una única asistencia por Empleado y día; el primer Capataz autorizado que la inicia queda responsable de completarla y confirmarla, y los demás ven el estado sin duplicarla.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-025 — Administración del ciclo de vida del Empleado

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`, `PER-Q-001`, `PER-Q-007`; propuesta IA de permisos
- **Afecta:** alta, modificación, inactivación, reactivación y consulta de Empleados
- **Pregunta:** ¿Qué actores administran la ficha y el vínculo laboral del Empleado?
- **Interpretaciones posibles:**
  - a) El Administrador crea, modifica, inactiva y reactiva Empleados de su Empresa; el Capataz solo consulta los datos operativos necesarios de integrantes de sus Cuadrillas; el Empleado con acceso consulta su propia ficha según `PER-Q-020`.
  - b) El Capataz también puede crear y modificar fichas de Empleados.
  - c) Solo el SuperAdministrador crea Empleados.
- **Recomendación del agente:** opción a), consistente con `ACC-Q-015` y con la minimización de datos personales.
- **Respuesta:** Opción a). El Administrador gestiona el ciclo de vida y la ficha; el Capataz consulta solo datos operativos necesarios y el Empleado con acceso consulta su propia ficha.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-026 — Ciclo de vida y nombre de Cuadrilla

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-02`, `PER-Q-009`, `PER-Q-011`, `PER-Q-022`; propuesta IA
- **Afecta:** creación, modificación e historia de Cuadrilla
- **Pregunta:** ¿Se aprueba el ciclo convencional de Cuadrilla y la regla de sus nombres?
- **Interpretaciones posibles:**
  - a) El Capataz creador o responsable vigente puede cambiar nombre, líder e integrantes e inactivar o reactivar la Cuadrilla; el Administrador puede consultar todas, ver historia, reasignar responsable e inactivar o reactivar cualquiera. No hay borrado físico, el nombre puede repetirse y el código es el identificador legible único.
  - b) El nombre también debe ser único dentro de la Empresa y el Administrador puede crear Cuadrillas.
  - c) La Cuadrilla no tiene inactivación y solo deja de usarse.
- **Recomendación del agente:** opción a), porque el código ya resuelve la identidad y permite conservar la historia sin imponer nombres artificiales.
- **Respuesta:** Opción a). Se aprueba el ciclo propuesto, sin borrado físico; los nombres pueden repetirse y el código identifica la Cuadrilla dentro de la Empresa.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-027 — Vigencia de integrantes y líder

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-02`, `B-08`, `PER-Q-008`, `PER-Q-010`; propuesta IA
- **Afecta:** membresías e historia de Cuadrilla
- **Pregunta:** ¿Se aprueban estas reglas temporales para integrantes y líder?
- **Interpretaciones posibles:**
  - a) Cada incorporación tiene fecha de inicio y finalización opcional; no puede superponerse consigo misma dentro de la misma Cuadrilla; una reincorporación crea otro período; el líder debe ser integrante activo y, si deja la Cuadrilla, el liderazgo queda vacante hasta una nueva designación.
  - b) Las incorporaciones no llevan fechas y se conserva solo la composición actual.
  - c) El líder puede continuar aunque ya no integre la Cuadrilla.
- **Recomendación del agente:** opción a), porque concreta el historial solicitado sin impedir varias Cuadrillas simultáneas.
- **Respuesta:** Opción a). Las incorporaciones conservan vigencia e historia; el líder debe ser integrante activo y el liderazgo queda vacante cuando deja la Cuadrilla.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-028 — Empleados cuya asistencia puede registrar el Capataz

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-03`, `PER-Q-011`, `PER-Q-024`
- **Afecta:** autorización y preparación de asistencia
- **Pregunta:** ¿Sobre qué Empleados puede iniciar asistencia un Capataz?
- **Interpretaciones posibles:**
  - a) Solo sobre Empleados activos que integren actualmente alguna Cuadrilla que él creó o de la que sea responsable vigente; puede seleccionar varias Cuadrillas y los integrantes repetidos se consolidan una sola vez.
  - b) Sobre cualquier Empleado activo de la Empresa.
  - c) El Administrador debe asignar previamente cada lista diaria.
- **Recomendación del agente:** opción a), porque aplica la responsabilidad sobre Cuadrillas y evita acceso operativo a personal ajeno.
- **Respuesta:** Opción b). El Capataz puede registrar la asistencia de cualquier Empleado activo de su Empresa, porque también existen Empleados que no integran Cuadrillas o realizan Labores individuales.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-029 — Efecto de una restricción bloqueante

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-03`, `B-10`, `PER-Q-006`
- **Afecta:** restricciones, asistencia y futura asignación de Labores
- **Pregunta:** ¿Qué efecto funcional tiene el nivel BLOQUEO de una restricción vigente?
- **Interpretaciones posibles:**
  - a) El Empleado puede figurar presente, pero no puede asignarse a una Labor incompatible mientras dure el bloqueo; PER muestra la indicación operativa y `LAB` aplicará la restricción al asignar trabajo.
  - b) No puede registrarse su asistencia como PRESENTE.
  - c) AVISO y BLOQUEO son solo etiquetas informativas sin efecto automático.
- **Recomendación del agente:** opción a), porque una persona restringida puede haber asistido aunque no pueda realizar determinada actividad.
- **Respuesta:** No existirán Labores incompatibles. Las restricciones operativas no bloquean asignaciones de `LAB`; no puede marcarse asistencia PRESENTE cuando el Empleado está de vacaciones, con certificación médica u otra indisponibilidad equivalente. El catálogo y efecto exacto se precisan en `PER-Q-033`.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-030 — Reglas de los intervalos de asistencia

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-03`, `B-09`, `PER-Q-013`; propuesta IA
- **Afecta:** validación y cálculo de asistencia
- **Pregunta:** ¿Se aprueba el paquete de validaciones para intervalos?
- **Interpretaciones posibles:**
  - a) Los intervalos pertenecen a una fecha local de la Empresa, no se superponen, el ingreso precede al egreso y una jornada que cruza medianoche se divide entre fechas; AUSENTE o AUSENCIA_JUSTIFICADA no admiten intervalos; POR_HORA exige cerrar todos antes de confirmar.
  - b) Un intervalo puede cruzar medianoche y pertenece por completo al día de ingreso.
  - c) No se validan superposiciones ni cierres y el cálculo se corrige manualmente.
- **Recomendación del agente:** opción a), porque produce horas verificables y evita jornadas duplicadas.
- **Respuesta:** Opción a). Se aprueba el paquete completo de validaciones de intervalos.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-031 — Cálculo por modalidad de remuneración

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-04`, `B-11`, `PER-Q-016`, `PER-Q-019`; propuesta IA
- **Afecta:** cálculo bruto devengado
- **Pregunta:** ¿Se aprueban estas definiciones iniciales de cálculo?
- **Interpretaciones posibles:**
  - a) MENSUAL usa un importe fijo del período sin prorrateo automático por ausencias; JORNAL multiplica días PRESENTE por tarifa diaria; POR_HORA multiplica horas válidas por tarifa; POR_LABOR multiplica ejecuciones o unidades confirmadas por tarifa; POR_PRODUCCION multiplica cantidad confirmada por tarifa de unidad; MIXTA suma una base y componentes variables. Ajustes legales y descuentos quedan fuera.
  - b) MENSUAL se prorratea automáticamente por ausencias y el resto se completa manualmente.
  - c) Cada Empresa define fórmulas libres.
- **Recomendación del agente:** opción a), porque ofrece cálculos cerrados y auditables sin construir todavía una nómina legal.
- **Respuesta:** Opción a). Se aprueban las definiciones iniciales de cálculo para MENSUAL, JORNAL, POR_HORA, POR_LABOR, POR_PRODUCCION y MIXTA.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-032 — Módulo dueño de las tarifas

- **Estado:** Abierta
- **Bloqueante:** Sí
- **Origen:** `B-04`, `B-11`, `PER-Q-017`, `PER-Q-019`
- **Afecta:** límites entre `PER`, `LAB` y `COS`
- **Pregunta:** ¿Qué módulo conserva la configuración de tarifas específicas por Labor o producción?
- **Interpretaciones posibles:**
  - a) PER es dueño de todas las modalidades y tarifas de remuneración, incluso las que referencian un tipo de Labor o unidad productiva; LAB y COS aportan los hechos y cantidades confirmadas.
  - b) LAB y COS son dueños de sus tarifas; PER solo conserva la modalidad general o por Empleado.
  - c) Cada ejecución guarda una tarifa manual sin configuración reutilizable.
- **Recomendación del agente:** opción a), porque mantiene un único dueño para la remuneración y evita reglas duplicadas; las referencias externas no transfieren la propiedad de la Labor o la Cosecha a PER.
- **Respuesta:** Decisión postergada expresamente para tratarla más adelante; la pregunta permanece abierta y bloquea la propiedad definitiva de tarifas específicas por Labor o producción.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05 (postergada)

## PER-Q-033 — Catálogo de indisponibilidades para asistencia

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `PER-Q-029`; lista abierta “vacaciones, certificación médica, etc.”
- **Afecta:** disponibilidad laboral y validación de asistencia
- **Pregunta:** ¿Qué indisponibilidades impiden marcar al Empleado como PRESENTE y qué resultado generan en la asistencia?
- **Interpretaciones posibles:**
  - a) VACACIONES, LICENCIA_MEDICA, LICENCIA_ESPECIAL, SUSPENSION y OTRA_JUSTIFICADA, todas con fecha de inicio y fin; en esos días el sistema impide PRESENTE e intervalos y registra AUSENCIA_JUSTIFICADA con el motivo. Un Empleado INACTIVO no integra la lista esperada.
  - b) Solo VACACIONES y LICENCIA_MEDICA bloquean; las demás situaciones se registran manualmente.
  - c) Cada Empresa configura libremente sus tipos y efectos.
- **Recomendación del agente:** opción a), porque cierra la lista, conserva vigencia y diferencia la indisponibilidad justificada de una ausencia común.
- **Respuesta:** Opción a). Se aprueban VACACIONES, LICENCIA_MEDICA, LICENCIA_ESPECIAL, SUSPENSION y OTRA_JUSTIFICADA con vigencia; impiden PRESENTE e intervalos y generan AUSENCIA_JUSTIFICADA. Un Empleado INACTIVO no integra la lista esperada.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-034 — Datos visibles para el Capataz al registrar asistencia

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `PER-Q-006`, `PER-Q-025`, `PER-Q-028`
- **Afecta:** privacidad y consulta operativa de Empleados
- **Pregunta:** Como el Capataz puede registrar asistencia de cualquier Empleado activo de la Empresa, ¿qué datos puede ver en esa operación?
- **Interpretaciones posibles:**
  - a) Nombre, apellido, DNI, teléfono de contacto, estado de disponibilidad y mensajes operativos vigentes; no ve domicilio, dato de sangre, contactos de emergencia, remuneración ni documentación.
  - b) Toda la ficha del Empleado.
  - c) Solo nombre y apellido, sin DNI, teléfono ni avisos.
- **Recomendación del agente:** opción a), porque permite identificar y contactar al Empleado sin exponer datos personales o económicos innecesarios.
- **Respuesta:** Opción a). El Capataz ve nombre, apellido, DNI, teléfono, disponibilidad y mensajes operativos vigentes; no ve domicilio, información médica detallada, remuneración ni documentación.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-035 — Efecto de inactivar un Empleado con acceso

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`, `PER-Q-001`, `PER-Q-007`; impacto en `ACC`
- **Afecta:** ciclo de Empleado y Cuenta de Empresa
- **Pregunta:** ¿Qué ocurre con la Cuenta de Empresa cuando se inactiva un Empleado que tiene acceso como Capataz o Empleado?
- **Interpretaciones posibles:**
  - a) PER solicita a ACC suspender inmediatamente la Cuenta de Empresa y revocar sus Sesiones; reactivar al Empleado no reactiva el acceso automáticamente, que debe habilitarse expresamente.
  - b) La Cuenta de Empresa continúa activa hasta que el Administrador la suspenda por separado.
  - c) PER impide inactivar al Empleado hasta que el Administrador suspenda manualmente su acceso.
- **Recomendación del agente:** opción a), porque una persona sin vínculo laboral activo no debería conservar acceso y la reactivación separada evita habilitaciones accidentales.
- **Respuesta:** Opción a). PER solicita a ACC suspender inmediatamente la Cuenta de Empresa y revocar sus Sesiones; reactivar al Empleado no reactiva el acceso automáticamente.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-036 — Formato del DNI

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-01`; propuesta IA de validación
- **Afecta:** identidad y unicidad del Empleado
- **Pregunta:** ¿PER admite únicamente DNI argentino o debe contemplar otros documentos personales?
- **Interpretaciones posibles:**
  - a) Solo DNI argentino, conservado como dígitos sin puntos ni espacios.
  - b) Tipo y número de documento, admitiendo DNI y documentos extranjeros; la unicidad dentro de la Empresa se aplica a tipo más número.
  - c) DNI como texto libre sin validación de formato.
- **Recomendación del agente:** opción b), porque mantiene DNI como opción normal y permite contratar personas extranjeras sin usar valores ficticios.
- **Respuesta:** Opción b). Se usa tipo y número de documento, se admiten DNI y documentos extranjeros y la unicidad dentro de la Empresa se aplica a tipo más número.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-037 — Estructura de datos opcionales

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `PER-Q-005`; propuesta IA
- **Afecta:** ficha de Empleado
- **Pregunta:** ¿Se aprueba estructurar los datos opcionales en lugar de guardarlos como notas libres?
- **Interpretaciones posibles:**
  - a) Domicilio y fecha de nacimiento como datos simples; grupo y factor sanguíneo enumerados; contactos de emergencia con nombre, vínculo y teléfono; especialidades como catálogo de la Empresa; licencias con tipo, número, emisión, vencimiento y referencia opcional a `ARC`; notas siguen siendo texto libre.
  - b) Todos los datos opcionales se guardan como texto libre.
  - c) Solo domicilio y fecha de nacimiento son estructurados; el resto queda para módulos futuros.
- **Recomendación del agente:** opción a), porque permite buscar, validar vencimientos y mostrar únicamente la información necesaria.
- **Respuesta:** Opción a). Los datos opcionales se estructuran según la propuesta; los archivos permanecen en `ARC`.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-038 — Administración de indisponibilidades

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `PER-Q-025`, `PER-Q-033`, `PER-Q-034`
- **Afecta:** permisos, vigencia y evidencia de indisponibilidad
- **Pregunta:** ¿Quién registra y modifica vacaciones, licencias y suspensiones?
- **Interpretaciones posibles:**
  - a) Solo el Administrador las crea, modifica o anula; puede adjuntar evidencia mediante `ARC`. El Capataz solo ve el estado y mensaje operativo, y el Empleado con acceso consulta las propias.
  - b) El Capataz también puede crearlas y modificarlas.
  - c) El Empleado las registra directamente y quedan vigentes sin aprobación.
- **Recomendación del agente:** opción a), porque estas novedades afectan asistencia y remuneración y pueden contener documentación sensible.
- **Respuesta:** Opción a). Solo el Administrador crea, modifica o anula indisponibilidades y adjunta evidencia mediante `ARC`; el Capataz ve estado y mensaje operativo y el Empleado con acceso consulta las propias.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05

## PER-Q-039 — Paquete convencional final

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** propuesta IA para completar formatos y límites no definidos
- **Afecta:** Empleado, Cuadrilla, asistencia y datos opcionales
- **Pregunta:** ¿Se aprueba el siguiente paquete final de formatos y límites convencionales?
- **Interpretaciones posibles:**
  - a) Documento: tipos DNI, PASAPORTE, CEDULA y OTRO, con detalle obligatorio para OTRO; número normalizado en mayúsculas y sin espacios exteriores, hasta 50 caracteres. Nombre, apellido y nombre de Cuadrilla: hasta 150 caracteres no vacíos. Teléfono: hasta 30 caracteres, obligatorio pero no único. Notas y mensajes operativos: hasta 1000 caracteres. Horas de asistencia: precisión de minuto, sin segundos; no se confirma una fecha futura. Agotados los códigos A01–Z99, se rechaza crear otra Cuadrilla sin reutilizar códigos históricos.
  - b) Aprobar con otros límites o formatos, que deben indicarse.
  - c) No aprobar el paquete; definir cada elemento por separado.
- **Recomendación del agente:** opción a), porque completa validaciones verificables sin imponer unicidad al teléfono ni perder documentos extranjeros o historia de códigos.
- **Respuesta:** Opción a). Se aprueba íntegramente el paquete convencional propuesto.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-05
