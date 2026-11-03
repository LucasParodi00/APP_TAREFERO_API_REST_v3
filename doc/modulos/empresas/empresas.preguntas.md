---
type: questions
module: "EMP"
---

# Empresas — Preguntas

<!-- Registro único de preguntas del módulo. Las respuestas del Ingeniero son origen de especificación. -->

## EMP-Q-001 — Actores de administración de Empresas

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-01`, `B-02`
- **Afecta:** `EMP-REQ-001` a `EMP-REQ-008`, `EMP-UC-001` a `EMP-UC-008`
- **Pregunta:** ¿Quién crea Empresas y quién puede consultar, modificar o cambiar su estado?
- **Interpretaciones posibles:**
  - a) El SuperAdministrador crea, lista, suspende, reactiva y cierra; el Administrador consulta y modifica únicamente su propia Empresa.
  - b) Una persona puede registrar su propia Empresa y convertirse en Administrador sin intervención del SuperAdministrador.
  - c) Solo el SuperAdministrador administra todos los datos de Empresa.
- **Recomendación del agente:** opción a). Separa la administración de la plataforma de la administración cotidiana de cada Empresa y no concede al SuperAdministrador acceso implícito a los datos operativos internos.
- **Respuesta:** a.
- **Respondida por / fecha:** Parodi Lucas 02/11/2026.

## EMP-Q-002 — Ciclo de vida de la Empresa

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** propuesta `IA` para completar el ciclo de vida
- **Afecta:** `EMP-BR-004`, `EMP-BR-005`, `EMP-REQ-005` a `EMP-REQ-007`, `EMP-UC-005` a `EMP-UC-007`, `EMP-ENT-001`
- **Pregunta:** ¿Aprobás los estados `ACTIVA`, `SUSPENDIDA` y `CERRADA`? ¿Una Empresa nueva comienza activa?
- **Interpretaciones posibles:**
  - a) Comienza `ACTIVA`; puede suspenderse, reactivarse y finalmente cerrarse. El cierre es irreversible.
  - b) Comienza `PENDIENTE` y necesita una activación posterior.
  - c) Solo existen activa e inactiva.
- **Recomendación del agente:** opción a). La suspensión resuelve bloqueos temporales y el cierre conserva un final histórico inequívoco.
- **Respuesta:** a.
- **Respondida por / fecha:** Parodi Lucas 02/11/2026.

## EMP-Q-003 — Responsable de la Empresa

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-04`
- **Afecta:** `EMP-REQ-001`, `EMP-REQ-004`, `EMP-ENT-001`
- **Pregunta:** ¿Qué representa el responsable opcional de la Empresa?
- **Interpretaciones posibles:**
  - a) Un texto libre con el nombre de una persona de contacto.
  - b) Una Membresía existente del módulo `ACC`.
  - c) Ambos: referencia opcional a Membresía y texto de contacto para el alta inicial.
- **Recomendación del agente:** opción c), permitiendo registrar primero la Empresa y vincular después una Membresía sin perder el contacto informado inicialmente.
- **Respuesta:** El responsable de la empresa representa como el duenio o encargado de toda la emrpresa.
- **Respondida por / fecha:** Parodi Lucas 02/11/2026.

## EMP-Q-004 — Alcance y unicidad del CUIT

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-04`
- **Afecta:** `EMP-BR-003`, `EMP-REQ-001`, `EMP-REQ-004`, `EMP-ENT-001`
- **Pregunta:** Si se informa CUIT, ¿debe validarse como CUIT argentino y ser único entre las Empresas no cerradas?
- **Interpretaciones posibles:**
  - a) Sí: once dígitos, dígito verificador válido y unicidad entre Empresas no cerradas.
  - b) Solo formato de once dígitos, sin validar dígito verificador ni unicidad.
  - c) Identificador fiscal libre para permitir otros países.
- **Recomendación del agente:** opción a) para la primera versión; el campo sigue siendo opcional.
- **Respuesta:** Solo un campo de entrada de 11 digitos sin validar nada.
- **Respondida por / fecha:** Parodi Lucas 02/11/2026.

## EMP-Q-005 — Ubicación de referencia

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-04`
- **Afecta:** `EMP-BR-002`, `EMP-REQ-001`, `EMP-REQ-004`, `EMP-ENT-001`
- **Pregunta:** ¿La ubicación textual y el punto de mapa son independientes y representan una referencia administrativa de la Empresa, no las Chacras?
- **Interpretaciones posibles:**
  - a) Sí; cualquiera puede omitirse, pero latitud y longitud se informan juntas y dentro de sus rangos válidos.
  - b) El texto es obligatorio cuando se marca un punto.
  - c) La Empresa puede tener múltiples ubicaciones.
- **Recomendación del agente:** opción a). Es suficiente para el alcance actual y mantiene separada la geografía productiva del módulo `TER`.
- **Respuesta:** a.
- **Respondida por / fecha:** Parodi Lucas 02/11/2026.

## EMP-Q-006 — Descripción de actividad

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** lista abierta “etc.” de `B-04`
- **Afecta:** `EMP-REQ-001`, `EMP-REQ-004`, `EMP-ENT-001`
- **Pregunta:** ¿Alcanza inicialmente un único texto opcional para describir a qué se dedica la Empresa?
- **Interpretaciones posibles:**
  - a) Un texto opcional de descripción de actividad.
  - b) Un catálogo con una o varias actividades seleccionables.
  - c) Varios campos todavía no enumerados.
- **Recomendación del agente:** opción a); agregar campos o catálogos solo cuando exista un uso concreto.
- **Respuesta:** a.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-02 (respuesta confirmada en el chat).

## EMP-Q-007 — Configuración general y configuraciones funcionales

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-04`
- **Afecta:** `EMP-BR-006`, `EMP-REQ-008`, `EMP-UC-008`, `EMP-ENT-002`, `EMP-DEP-003`
- **Pregunta:** ¿Aprobás que `EMP` sea dueño solamente de país, zona horaria y moneda principal, mientras forma de pago, registro de labores y montos por tareas pertenezcan a sus módulos funcionales?
- **Interpretaciones posibles:**
  - a) Sí; `EMP` evita un contenedor genérico y cada módulo protege su configuración. Al crear una Empresa se asignan `AR`, `America/Argentina/Buenos_Aires` y `ARS`, editables después.
  - b) `EMP` guarda todas las configuraciones en una estructura genérica.
  - c) Todas las configuraciones quedan fuera de `EMP`, incluso país, zona horaria y moneda.
- **Recomendación del agente:** opción a). Mantiene una sola fuente para cada regla y permite que solo el nombre sea solicitado obligatoriamente al crear.
- **Respuesta:** a.
- **Respondida por / fecha:** Parodi Lucas 02/11/2026.

## EMP-Q-008 — Suscripción mientras `SUS` sea futuro

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-03`
- **Afecta:** `EMP-REQ-001`, `EMP-DEP-002`, `EMP-UC-001`
- **Pregunta:** Hasta implementar `SUS`, ¿cómo se satisface la asociación obligatoria entre Empresa y Plan de suscripción?
- **Interpretaciones posibles:**
  - a) La Empresa puede crearse con una asignación provisional gestionada por la plataforma; `SUS` la reemplazará después.
  - b) No se permite crear Empresas hasta implementar `SUS`.
  - c) `EMP` implementa temporalmente los tres Planes de suscripción.
- **Recomendación del agente:** opción a), mediante un contrato externo a `EMP`, sin incorporar reglas comerciales dentro de este módulo.
- **Respuesta:** a.
- **Respondida por / fecha:** Parodi Lucas 02/11/2026.

## EMP-Q-009 — Unicidad del nombre y eliminación

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** propuesta `IA` para completar validaciones habituales
- **Afecta:** `EMP-BR-001`, `EMP-REQ-001`, `EMP-REQ-004`, `EMP-ENT-001`
- **Pregunta:** ¿Aprobás permitir nombres repetidos y no eliminar físicamente Empresas, utilizando el cierre irreversible para conservar historia?
- **Interpretaciones posibles:**
  - a) Nombres repetidos permitidos; CUIT distingue cuando existe; no hay eliminación física.
  - b) Nombre único global; no hay eliminación física.
  - c) Nombre repetido y eliminación física si todavía no existen datos relacionados.
- **Recomendación del agente:** opción a), porque el nombre no identifica legalmente de manera inequívoca y la Empresa es la raíz del aislamiento de datos.
- **Respuesta:** a.
- **Respondida por / fecha:** Parodi Lucas 02/11/2026.

## EMP-Q-010 — Representación del responsable

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** aclaración de `EMP-Q-003`; la respuesta definió su función pero no cómo se registra
- **Afecta:** `EMP-ENT-001`, `EMP-REQ-001`, `EMP-REQ-004`
- **Pregunta:** El responsable representa al dueño o encargado de toda la Empresa. ¿Se registra solo su nombre escrito, se vincula a una persona registrada o se permiten nombre y referencia opcional?
- **Interpretaciones posibles:**
  - a) Nombre escrito, sin relación con una Cuenta de Empresa.
  - b) Referencia a una persona registrada, sin exigirle acceso al sistema.
  - c) Nombre y referencia opcional a una persona registrada.
- **Recomendación del agente:** no deducir una Cuenta de Empresa a partir de la función del responsable; el Ingeniero elige la representación necesaria. La pregunta fue presentada en el chat al refinar el módulo.
- **Respuesta:** Solo nombre escrito.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-02 (respuesta en el chat).

## EMP-Q-011 — Límites y normalización de textos

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** `B-04`; exigencia de `convenciones.md` §2 para todo atributo de tipo Texto
- **Afecta:** `EMP-BR-001`, `EMP-BR-003`, `EMP-REQ-001`, `EMP-REQ-004`, `EMP-ENT-001`, `EMP-ENT-002`
- **Pregunta:** ¿Qué longitudes máximas y normalización deben aplicarse a los textos de Empresa?
- **Interpretaciones posibles:**
  - a) `nombre` 120, `responsableNombre` 120, `ubicacionTexto` 500 y `descripcionActividad` 2000 caracteres; se eliminan espacios exteriores, se conservan los interiores y un texto opcional vacío queda ausente. El CUIT admite exactamente once dígitos sin separadores. La zona horaria admite hasta 255 caracteres y debe coincidir con un nombre IANA.
  - b) Usar los mismos criterios de normalización, pero indicar otros máximos concretos.
  - c) No limitar los textos descriptivos; esta opción contradice la exigencia global vigente para atributos Texto.
- **Recomendación del agente:** opción a). Los límites cubren nombres y descripciones habituales sin convertir campos descriptivos en contenido ilimitado; la normalización no altera el significado escrito.
- **Respuesta:** a.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03 (respuesta registrada en el archivo).

## EMP-Q-012 — Modificaciones según el estado de Empresa

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** propuesta `IA` para completar el ciclo de vida definido por `EMP-Q-002`
- **Afecta:** `EMP-BR-004`, `EMP-BR-005`, `EMP-BR-007`, `EMP-REQ-004`, `EMP-REQ-008`, `EMP-UC-004`, `EMP-UC-008`
- **Pregunta:** ¿Se pueden modificar los datos y la configuración general de una Empresa suspendida o cerrada?
- **Interpretaciones posibles:**
  - a) `ACTIVA`: SuperAdministrador y su Administrador pueden modificarla; `SUSPENDIDA`: solo el SuperAdministrador puede corregir datos o configuración; `CERRADA`: queda inmutable y solo puede consultarse.
  - b) El SuperAdministrador puede modificar también una Empresa cerrada; el Administrador solo modifica una Empresa activa.
  - c) Los actores autorizados pueden modificar datos y configuración sin importar el estado.
- **Recomendación del agente:** opción a). Permite corregir una suspensión para rehabilitarla y hace coherente el cierre irreversible con una historia estable.
- **Respuesta:** a.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03 (respuesta registrada en el archivo).

## EMP-Q-013 — Alias para resolver la Empresa al acceder

- **Estado:** Respondida
- **Bloqueante:** Sí
- **Origen:** propuesta `IA` ante el contrato pendiente declarado por `ACC-DEP-001`
- **Afecta:** `EMP-DEP-001`, `EMP-DEP-003`, `EMP-ENT-001`; también afecta `ACC-DEP-001`
- **Pregunta:** Identidad y acceso requiere resolver inequívocamente una Empresa mediante un alias. ¿Quién debe definirlo y con qué estabilidad?
- **Interpretaciones posibles:**
  - a) `EMP` es dueño de un alias obligatorio, globalmente único y no reutilizable; lo indica el SuperAdministrador al registrar la Empresa, usa de 3 a 63 caracteres en minúscula, dígitos o guiones, comienza y termina con letra o dígito y queda inmutable después del alta.
  - b) Igual que a), pero el SuperAdministrador puede cambiarlo mientras la Empresa no esté cerrada; el alias anterior deja de resolver el acceso.
  - c) El alias queda diferido y `ACC` permanece bloqueado hasta definir su dueño.
- **Recomendación del agente:** opción a). El alias identifica de forma estable a la Empresa para el acceso; no reutilizarlo evita que una referencia histórica o credencial termine resolviendo otra Empresa.
- **Respuesta:** a.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-03 (respuesta registrada en el archivo).
