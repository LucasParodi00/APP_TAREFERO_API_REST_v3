---
type: requirements
module: "TER"
status: Aprobado
owner: "Analista"
---

# Territorio — Requerimientos

## Alcance de las entregas

La primera entrega de Chacras, derivada de `B-01` y `TER-Q-001` a `TER-Q-010`, y la segunda entrega de Lotes, derivada de `B-02` a `B-12` y `TER-Q-011` a `TER-Q-023`, están Aprobadas. Los hechos productivos y operativos pertenecen a sus módulos dueños y solo referencian la identidad territorial.

## 1. Reglas de negocio

### TER-BR-001 — Nombre obligatorio

- **Estado:** Aprobado
- **Origen:** `TER-Q-002`
- **Tipo:** Invariante
- **Regla:** Una Chacra debe tener un nombre informado con al menos un carácter distinto de espacio.
- **Si se incumple:** se rechaza con `TER_NOMBRE_OBLIGATORIO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Nombre de Chacra informado | Se acepta. |
| Un solo carácter visible | Se acepta. |
| Nombre ausente, vacío o solo espacios | Se rechaza con TER_NOMBRE_OBLIGATORIO. |

### TER-BR-002 — Nombre corto obligatorio

- **Estado:** Aprobado
- **Origen:** `TER-Q-002`
- **Tipo:** Invariante
- **Regla:** Una Chacra debe tener un nombre corto informado con al menos un carácter distinto de espacio.
- **Si se incumple:** se rechaza con `TER_NOMBRE_CORTO_OBLIGATORIO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Nombre corto informado | Se acepta. |
| Un solo carácter visible | Se acepta. |
| Nombre corto ausente, vacío o solo espacios | Se rechaza con TER_NOMBRE_CORTO_OBLIGATORIO. |

### TER-BR-003 — Empresa propietaria de Chacra

- **Estado:** Aprobado
- **Origen:** `B-01`
- **Tipo:** Invariante
- **Regla:** Cada Chacra pertenece a una única Empresa cliente.
- **Si se incumple:** se rechaza con `TER_EMPRESA_REQUERIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Chacra con una Empresa propietaria | Se acepta. |
| Una Empresa conserva varias Chacras en regiones distintas | Se acepta. |
| Chacra sin Empresa propietaria | Se rechaza con TER_EMPRESA_REQUERIDA. |

### TER-BR-004 — Consulta de Chacras asignadas al Capataz

- **Estado:** Aprobado
- **Origen:** `TER-Q-003`
- **Tipo:** Autorización de dominio
- **Regla:** El Capataz solo puede consultar Chacras incluidas en su alcance de asignación vigente.
- **Si se incumple:** se rechaza con `TER_CHACRA_FUERA_DE_ALCANCE`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Capataz consulta una Chacra asignada | Se permite. |
| Capataz no tiene Chacras asignadas | Su listado no contiene Chacras. |
| Capataz consulta una Chacra no asignada | Se rechaza con TER_CHACRA_FUERA_DE_ALCANCE. |

### TER-BR-005 — Ciclo inicial de Chacra

- **Estado:** Aprobado
- **Origen:** `TER-Q-006`
- **Tipo:** Transición
- **Regla:** La Chacra se crea ACTIVA y en esta entrega solo admite pasar de ACTIVA a INACTIVA.
- **Si se incumple:** se rechaza con `TER_TRANSICION_ESTADO_INVALIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Crear una Chacra | Queda ACTIVA. |
| Inactivar una Chacra ACTIVA | Queda INACTIVA. |
| Solicitar una transición diferente | Se rechaza con TER_TRANSICION_ESTADO_INVALIDA. |

### TER-BR-006 — Conservación de Chacra

- **Estado:** Aprobado
- **Origen:** `TER-Q-006`
- **Tipo:** Invariante
- **Regla:** Una Chacra no se elimina físicamente y su inactivación conserva su identidad e historial.
- **Si se incumple:** se rechaza con `TER_ELIMINACION_NO_PERMITIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Inactivar una Chacra utilizada | Se conserva su historial. |
| Inactivar una Chacra todavía sin Lotes | Se conserva su identidad. |
| Solicitar borrado físico | Se rechaza con TER_ELIMINACION_NO_PERMITIDA. |

### TER-BR-007 — Nombre corto único por Empresa

- **Estado:** Aprobado
- **Origen:** `TER-Q-005`, `TER-Q-007`, `TER-Q-010`
- **Tipo:** Invariante
- **Regla:** El nombre corto de una Chacra no puede repetirse en otra Chacra activa o inactiva de la misma Empresa. Para comparar se ignoran mayúsculas, tildes y diferencias producidas por espacios exteriores o espacios consecutivos.
- **Si se incumple:** se rechaza con `TER_NOMBRE_CORTO_DUPLICADO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Nombre corto no utilizado en la Empresa | Se acepta. |
| El mismo nombre corto existe en otra Empresa | Se acepta. |
| Otra Chacra de la Empresa se llama `Norte` y se solicita `NÓRTE` | Se rechaza con TER_NOMBRE_CORTO_DUPLICADO. |
| El nombre corto pertenece a una Chacra inactiva de la misma Empresa | Se rechaza con TER_NOMBRE_CORTO_DUPLICADO. |

### TER-BR-008 — Corrección descriptiva de Chacra inactiva

- **Estado:** Aprobado
- **Origen:** `TER-Q-010`
- **Tipo:** Invariante
- **Regla:** Una Chacra inactiva puede consultarse y modificar sus datos descriptivos sin cambiar su estado; conserva su identidad, historial y nombre corto reservado por `TER-BR-007`.
- **Si se incumple:** se rechaza con `TER_OPERACION_INACTIVA_INVALIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Consultar una Chacra inactiva dentro del alcance autorizado | Se informa su ficha y estado. |
| Corregir el responsable de una Chacra inactiva con versión vigente | Se acepta y permanece INACTIVA. |
| Intentar usar la modificación descriptiva para cambiar el estado | Se rechaza con TER_OPERACION_INACTIVA_INVALIDA. |

### TER-BR-009 — Chacra propietaria del Lote

- **Estado:** Aprobado
- **Origen:** `B-02`, `B-11`, `TER-Q-013`
- **Tipo:** Invariante
- **Regla:** Cada Lote pertenece a una única Chacra de su misma Empresa y esa pertenencia no puede cambiar después de registrarlo.
- **Si se incumple:** se rechaza con `TER_CHACRA_LOTE_INVALIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Registrar Lote en una Chacra activa de la Empresa autorizada | Se acepta. |
| Intentar registrar el Lote en una Chacra de otra Empresa | Se rechaza con TER_CHACRA_LOTE_INVALIDA. |
| Intentar mover un Lote existente a otra Chacra | Se rechaza con TER_CHACRA_LOTE_INVALIDA. |

### TER-BR-010 — Nombre obligatorio del Lote

- **Estado:** Aprobado
- **Origen:** `B-02`, `TER-Q-013`
- **Tipo:** Invariante
- **Regla:** Un Lote debe tener un nombre informado con al menos un carácter distinto de espacio y una longitud máxima de 150 caracteres.
- **Si se incumple:** se rechaza con `TER_NOMBRE_LOTE_INVALIDO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Nombre informado con hasta 150 caracteres | Se acepta. |
| Nombre vacío o compuesto solo por espacios | Se rechaza con TER_NOMBRE_LOTE_INVALIDO. |
| Nombre con más de 150 caracteres | Se rechaza con TER_NOMBRE_LOTE_INVALIDO. |

### TER-BR-011 — Código de Lote único por Chacra

- **Estado:** Aprobado
- **Origen:** `B-02`, `B-11`, `TER-Q-012`, `TER-Q-013`
- **Tipo:** Invariante
- **Regla:** El código del Lote es obligatorio, admite hasta 30 caracteres y no puede repetirse entre Lotes activos o inactivos de la misma Chacra. Para comparar se ignoran mayúsculas, tildes y diferencias producidas por espacios exteriores o consecutivos.
- **Si se incumple:** se rechaza con `TER_CODIGO_LOTE_DUPLICADO` o `TER_CODIGO_LOTE_INVALIDO`, según corresponda.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Código `AB` no utilizado en la Chacra | Se acepta. |
| Otra Chacra de la Empresa ya utiliza `AB` | Se acepta. |
| La misma Chacra utiliza `ÁB` y se solicita `ab` | Se rechaza con TER_CODIGO_LOTE_DUPLICADO. |
| Código vacío o con más de 30 caracteres | Se rechaza con TER_CODIGO_LOTE_INVALIDO. |

### TER-BR-012 — Estabilidad del código de Lote

- **Estado:** Aprobado
- **Origen:** `TER-Q-012`
- **Tipo:** Invariante
- **Regla:** El código de un Lote no cambia después de registrarlo y puede formar parte de códigos legibles generados por otros módulos sin reemplazar su identificador técnico.
- **Si se incumple:** se rechaza con `TER_CODIGO_LOTE_INMUTABLE`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Cambiar el nombre conservando el código | Se acepta. |
| Un módulo genera `R-NORTE-AB-001` usando códigos territoriales vigentes | Se acepta como identificador legible del registro externo. |
| Intentar cambiar `AB` por `AC` en el Lote existente | Se rechaza con TER_CODIGO_LOTE_INMUTABLE. |

### TER-BR-013 — Delimitación geográfica opcional y válida

- **Estado:** Aprobado
- **Origen:** `B-04`, `B-05`, `B-07`, `TER-Q-017`
- **Tipo:** Invariante
- **Regla:** Un Lote puede existir sin delimitación; cuando se delimita, la geometría debe ser un GeoJSON Polygon continuo, válido y no vacío, en SRID 4326 con coordenadas `[longitud, latitud]`. Puede contener huecos, pero las áreas separadas se registran como Lotes diferentes.
- **Si se incumple:** se rechaza con `TER_GEOMETRIA_LOTE_INVALIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Registrar Lote sin geometría | Se acepta como SIN_DELIMITAR. |
| Polígono válido con un hueco interior | Se acepta. |
| Geometría vacía, autointersectada, degenerada o con áreas separadas | Se rechaza con TER_GEOMETRIA_LOTE_INVALIDA. |

### TER-BR-014 — Lotes activos sin superposición

- **Estado:** Aprobado
- **Origen:** `B-04`, `B-08`, `TER-Q-017`
- **Tipo:** Invariante
- **Regla:** Las geometrías vigentes de dos Lotes activos de una misma Empresa no pueden superponer superficie; sus límites pueden tocarse y las versiones históricas no participan de esta validación.
- **Si se incumple:** se rechaza con `TER_LOTES_SUPERPUESTOS`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Dos polígonos activos comparten únicamente un límite | Se acepta. |
| Dos polígonos activos de la Empresa comparten superficie | Se rechaza con TER_LOTES_SUPERPUESTOS. |
| Una versión histórica se superpone con la geometría vigente de otro Lote | No produce conflicto por sí sola. |

### TER-BR-015 — Superficie cartográfica oficial

- **Estado:** Aprobado
- **Origen:** `B-05`, `B-09`, `TER-Q-013`, `TER-Q-017`
- **Tipo:** Cálculo
- **Regla:** La superficie cartográfica oficial del Lote se calcula en hectáreas desde su geometría vigente mediante geodesia o una proyección apropiada; sin geometría permanece sin calcular y no se reemplaza por un valor manual.
- **Si se incumple:** se rechaza con `TER_SUPERFICIE_LOTE_INVALIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Lote delimitado con cálculo espacial válido | Conserva la superficie calculada en hectáreas. |
| Lote SIN_DELIMITAR | La superficie cartográfica queda sin valor. |
| Intentar informar manualmente la superficie oficial | Se rechaza con TER_SUPERFICIE_LOTE_INVALIDA. |

### TER-BR-016 — Versiones geométricas inmutables

- **Estado:** Aprobado
- **Origen:** `TER-Q-016`
- **Tipo:** Invariante
- **Regla:** La delimitación inicial y cada cambio posterior crean una versión geométrica inmutable con geometría, superficie calculada, vigencia, actor y motivo; solo una versión puede permanecer vigente por Lote.
- **Si se incumple:** se rechaza con `TER_VERSION_GEOMETRICA_INVALIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Delimitar por primera vez un Lote | Se crea la primera versión vigente. |
| Corregir una delimitación con motivo informado | La versión anterior se cierra y se crea otra vigente. |
| Sobrescribir o eliminar una versión histórica | Se rechaza con TER_VERSION_GEOMETRICA_INVALIDA. |

### TER-BR-017 — Ciclo administrativo del Lote

- **Estado:** Aprobado
- **Origen:** `B-02`, `TER-Q-019`
- **Tipo:** Transición
- **Regla:** El Lote se crea ACTIVO y admite transiciones de ACTIVO a INACTIVO y de INACTIVO a ACTIVO. La condición SIN_DELIMITAR o DELIMITADO deriva de la existencia de una versión geométrica vigente y no reemplaza el estado administrativo.
- **Si se incumple:** se rechaza con `TER_TRANSICION_LOTE_INVALIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Crear Lote sin geometría | Queda ACTIVO y SIN_DELIMITAR. |
| Inactivar un Lote ACTIVO que cumple sus precondiciones | Queda INACTIVO. |
| Reactivar un Lote INACTIVO dentro de una Chacra ACTIVA | Queda ACTIVO y conserva su condición geométrica. |

### TER-BR-018 — Restricción operativa del Lote inactivo

- **Estado:** Aprobado
- **Origen:** `TER-Q-019`, `TER-Q-021`
- **Tipo:** Autorización de dominio
- **Regla:** Un Lote INACTIVO conserva identidad, geometrías e historial; puede consultarse y corregir sus datos descriptivos o geometría sin cambiar de estado, pero no admite nuevas implantaciones, labores, observaciones ni cosechas mientras permanezca inactivo.
- **Si se incumple:** se rechaza con `TER_LOTE_INACTIVO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Consultar el historial de un Lote INACTIVO | Se permite. |
| Corregir datos descriptivos o geometría con los controles correspondientes | Se permite y el Lote permanece INACTIVO. |
| Registrar una nueva labor sobre un Lote INACTIVO | Se rechaza con TER_LOTE_INACTIVO. |
| Reactivar y luego registrar una operación válida | Se permite si cumple las demás reglas. |

### TER-BR-019 — Procesos activos antes de inactivar

- **Estado:** Aprobado
- **Origen:** `TER-Q-019`
- **Tipo:** Validación
- **Regla:** Un Lote no puede inactivarse mientras conserve implantaciones activas u operaciones funcionales pendientes que requieran ese Lote; los módulos dueños deben informar que fueron finalizadas o canceladas.
- **Si se incumple:** se rechaza con `TER_LOTE_CON_PROCESOS_ACTIVOS`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Lote sin implantaciones activas ni operaciones pendientes | Puede inactivarse. |
| Lote con una implantación activa | Se rechaza con TER_LOTE_CON_PROCESOS_ACTIVOS. |
| Lote con una orden pendiente que exige ese contexto | Se rechaza con TER_LOTE_CON_PROCESOS_ACTIVOS. |

### TER-BR-020 — Catálogo inicial de tipo de suelo

- **Estado:** Aprobado
- **Origen:** `B-02`, `TER-Q-014`, `TER-Q-023`
- **Tipo:** Validación
- **Regla:** El tipo de suelo opcional utiliza uno de los valores `ARCILLOSO`, `ARENOSO`, `LIMOSO`, `FRANCO`, `MIXTO` u `OTRO`; la ausencia significa no informado y puede complementarse con notas sin convertir mediciones o análisis históricos en atributos del Lote.
- **Si se incumple:** se rechaza con `TER_TIPO_SUELO_INVALIDO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Tipo `FRANCO` | Se acepta. |
| Tipo `OTRO` con nota descriptiva | Se acepta. |
| Valor fuera del catálogo | Se rechaza con TER_TIPO_SUELO_INVALIDO. |

### TER-BR-021 — Sistema de riego principal

- **Estado:** Aprobado
- **Origen:** `B-02`, `TER-Q-014`, `TER-Q-023`
- **Tipo:** Validación
- **Regla:** El sistema de riego principal opcional utiliza uno de los valores `SIN_RIEGO`, `GOTEO`, `ASPERSION`, `MICROASPERSION`, `GRAVEDAD` u `OTRO`; la ausencia significa no informado, esta entrega registra uno vigente por Lote y admite notas complementarias.
- **Si se incumple:** se rechaza con `TER_SISTEMA_RIEGO_INVALIDO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Sistema `GOTEO` | Se acepta. |
| Sistema `OTRO` con detalle en notas | Se acepta. |
| Más de un sistema principal o valor fuera del catálogo | Se rechaza con TER_SISTEMA_RIEGO_INVALIDO. |

### TER-BR-022 — Consulta de Lotes asignados al Capataz

- **Estado:** Aprobado
- **Origen:** `B-12`, `TER-Q-008`, `TER-Q-019`
- **Tipo:** Autorización de dominio
- **Regla:** El Capataz puede consultar un Lote y su historial geométrico únicamente cuando la Chacra propietaria está incluida en el alcance vigente que administra `ACC`; esa asignación alcanza a todos los Lotes de la Chacra y no le permite administrar sus geometrías.
- **Si se incumple:** se rechaza con `TER_LOTE_FUERA_DE_ALCANCE`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Capataz consulta un Lote de una Chacra asignada | Se acepta. |
| Se agrega un Lote a una Chacra ya asignada al Capataz | El Lote queda comprendido en su consulta sin una asignación adicional en TER. |
| Capataz consulta un Lote de una Chacra no asignada o intenta delimitarlo | Se rechaza con TER_LOTE_FUERA_DE_ALCANCE o TER_ACCESO_DENEGADO, según la operación. |

### TER-BR-023 — Coherencia de estado entre Chacra y Lote

- **Estado:** Aprobado
- **Origen:** `TER-Q-022`
- **Tipo:** Invariante
- **Regla:** Una Chacra INACTIVA no puede contener Lotes ACTIVOS. Por ello, solo se registra o reactiva un Lote dentro de una Chacra ACTIVA y, sin aplicar cascadas automáticas, todos los Lotes deben estar INACTIVOS antes de inactivar su Chacra.
- **Si se incumple:** se rechaza con `TER_ESTADO_CHACRA_LOTES_INCOMPATIBLE`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Registrar o reactivar un Lote dentro de una Chacra ACTIVA | Se acepta si cumple las demás reglas. |
| Registrar o reactivar un Lote dentro de una Chacra INACTIVA | Se rechaza con TER_ESTADO_CHACRA_LOTES_INCOMPATIBLE. |
| Inactivar una Chacra con al menos un Lote ACTIVO | Se rechaza sin cambiar el estado de la Chacra ni de sus Lotes. |
| Inactivar una Chacra cuyos Lotes están todos INACTIVOS | Se acepta sin producir una transición en cascada. |

## 2. Requerimientos funcionales

### TER-REQ-001 — Registrar Chacra

- **Estado:** Aprobado
- **Origen:** `B-01`, `TER-Q-002`, `TER-Q-003`, `TER-Q-004`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir registrar una Chacra asociada a la Empresa del contexto autorizado sin exigir la creación de Lotes.
- **Reglas que aplica:** `TER-BR-001`, `TER-BR-002`, `TER-BR-003`, `TER-BR-005`, `TER-BR-007`.

### TER-REQ-002 — Consultar Chacra

- **Estado:** Aprobado
- **Origen:** `TER-Q-003`, `TER-Q-010`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir consultar una Chacra dentro del alcance autorizado.
- **Reglas que aplica:** `TER-BR-004`, `TER-BR-008`.

### TER-REQ-003 — Listar Chacras

- **Estado:** Aprobado
- **Origen:** `TER-Q-003`, `TER-Q-009`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir listar Chacras activas e inactivas dentro del alcance autorizado y filtrar opcionalmente por estado, aplicando la paginación y el orden de convenciones.md §3.2 y §3.3.
- **Reglas que aplica:** `TER-BR-004`.

### TER-REQ-004 — Modificar Chacra

- **Estado:** Aprobado
- **Origen:** `TER-Q-003`, `TER-Q-010`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir modificar los datos descriptivos de una Chacra dentro del alcance autorizado, con control de versión según convenciones.md §3.5.
- **Reglas que aplica:** `TER-BR-001`, `TER-BR-002`, `TER-BR-007`, `TER-BR-008`.

### TER-REQ-005 — Inactivar Chacra

- **Estado:** Aprobado
- **Origen:** `TER-Q-003`, `TER-Q-006`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir inactivar una Chacra conservando los registros que la referencian.
- **Reglas que aplica:** `TER-BR-005`, `TER-BR-006`.

### TER-REQ-006 — Registrar Lote

- **Estado:** Aprobado
- **Origen:** `B-02`, `B-07`, `B-11`, `TER-Q-013`, `TER-Q-019`, `TER-Q-022`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir registrar un Lote ACTIVO, con o sin geometría, dentro de una Chacra de la Empresa autorizada.
- **Reglas que aplica:** `TER-BR-009` a `TER-BR-017`, `TER-BR-020`, `TER-BR-021`, `TER-BR-023`.

### TER-REQ-007 — Consultar Lote

- **Estado:** Aprobado
- **Origen:** `B-03`, `B-12`, `TER-Q-015`, `TER-Q-019`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir consultar la ficha territorial de un Lote dentro del alcance autorizado, incluida su Chacra, estado, condición geométrica, superficie vigente y referencias necesarias para navegar su historial funcional.
- **Reglas que aplica:** `TER-BR-018`, `TER-BR-022`.

### TER-REQ-008 — Listar Lotes

- **Estado:** Aprobado
- **Origen:** `B-02`, `B-12`, `TER-Q-019`, `TER-Q-020`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir listar Lotes activos e inactivos dentro del alcance autorizado, incluir ambos estados cuando no se informa filtro y permitir filtrar opcionalmente por estado, con paginación y orden conforme a convenciones.md §3.2 y §3.3.
- **Reglas que aplica:** `TER-BR-018`, `TER-BR-022`.

### TER-REQ-009 — Modificar datos descriptivos del Lote

- **Estado:** Aprobado
- **Origen:** `B-02`, `TER-Q-013`, `TER-Q-014`, `TER-Q-021`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir modificar nombre, descripción, notas, tipo de suelo y sistema de riego de un Lote ACTIVO o INACTIVO, conservando código, Chacra y estado, con control de versión según convenciones.md §3.5.
- **Reglas que aplica:** `TER-BR-009` a `TER-BR-012`, `TER-BR-018`, `TER-BR-020`, `TER-BR-021`.

### TER-REQ-010 — Delimitar o corregir geometría de Lote

- **Estado:** Aprobado
- **Origen:** `B-04`, `B-05`, `B-07` a `B-10`, `TER-Q-016`, `TER-Q-017`, `TER-Q-021`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir establecer o corregir la delimitación de un Lote ACTIVO o INACTIVO autorizado, calcular su superficie oficial y conservar cada versión geométrica; una corrección no cambia su estado administrativo.
- **Reglas que aplica:** `TER-BR-013` a `TER-BR-016`, `TER-BR-018`.

### TER-REQ-011 — Inactivar Lote

- **Estado:** Aprobado
- **Origen:** `TER-Q-019`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir inactivar un Lote sin procesos activos, conservando su identidad, código, geometrías e historial.
- **Reglas que aplica:** `TER-BR-017`, `TER-BR-018`, `TER-BR-019`.

### TER-REQ-012 — Reactivar Lote

- **Estado:** Aprobado
- **Origen:** `TER-Q-019`, `TER-Q-022`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir reactivar un Lote INACTIVO cuando su Chacra esté ACTIVA, sin alterar su geometría ni su historial.
- **Reglas que aplica:** `TER-BR-009`, `TER-BR-014`, `TER-BR-017`, `TER-BR-023`.

### TER-REQ-013 — Consultar historial geométrico

- **Estado:** Aprobado
- **Origen:** `TER-Q-016`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir consultar las versiones geométricas de un Lote dentro del alcance autorizado, distinguiendo la vigente de las históricas.
- **Reglas que aplica:** `TER-BR-016`, `TER-BR-022`.

## 3. Dependencias con otros módulos

### TER-DEP-001 — Empresas — Contexto de Empresa propietaria

- **Estado:** Aprobado
- **Origen:** `B-01`, `TER-Q-003`; arquitectura.md §13.4
- **Módulo:** `EMP` (Empresas)
- **Dirección:** Este módulo consume
- **Qué:** identidad y habilitación de la Empresa obtenida del contexto autorizado. No copia sus datos administrativos ni permite cambiar la pertenencia mediante los datos descriptivos de una Chacra.
- **Para qué:** `TER-BR-003`, `TER-REQ-001` a `TER-REQ-005`.

### TER-DEP-002 — Identidad y acceso — Actor, permisos y asignaciones

- **Estado:** Aprobado
- **Origen:** `TER-Q-003`, `TER-Q-008`; arquitectura.md §13
- **Módulo:** `ACC` (Identidad y acceso)
- **Dirección:** Este módulo consume
- **Qué:** contexto vigente, permisos y alcance autorizado de Chacras administrado por `ACC` para la Cuenta de Empresa del Capataz; identificación explícita del soporte conforme a `ACC-BR-011`. El contrato debe entregar a `TER` los identificadores permitidos. Esta especificación no inventa el circuito de `ACC` para administrar ese alcance ni sus contratos técnicos; deben acordarse antes de planificar la consulta del Capataz.
- **Para qué:** `TER-BR-004`, `TER-REQ-001` a `TER-REQ-005`.

### TER-DEP-003 — Contexto productivo — Implantaciones del Lote

- **Estado:** Aprobado
- **Origen:** `B-02`, `B-03`, `TER-Q-011`, `TER-Q-019`
- **Módulo:** `CUL` (Contexto productivo)
- **Dirección:** Este módulo provee identidad y estado; consume validación de procesos activos al inactivar
- **Qué:** `TER` provee Lote, Chacra, Empresa y vigencia territorial; `CUL` conserva cultivos e implantaciones históricas y debe validar `TER-BR-018`. Para `TER-BR-019`, informa si existen implantaciones activas que impidan inactivar.
- **Para qué:** `TER-REQ-007`, `TER-REQ-011`, `TER-REQ-012`.

### TER-DEP-004 — Labores — Actividades realizadas en el Lote

- **Estado:** Aprobado
- **Origen:** `B-03`, `TER-Q-015`, `TER-Q-019`
- **Módulo:** `LAB` (Labores)
- **Dirección:** Este módulo provee identidad y estado; consume validación de procesos activos al inactivar
- **Qué:** `LAB` registra órdenes, ejecuciones, cuadrillas, empleados, recursos y superficie trabajada referenciando `loteId`; no copia esos hechos en `TER`. Debe validar `TER-BR-018` e informar operaciones pendientes para `TER-BR-019`.
- **Para qué:** historial funcional y `TER-REQ-011`.

### TER-DEP-005 — Observaciones — Seguimiento del Lote

- **Estado:** Aprobado
- **Origen:** `B-02`, `B-03`, `TER-Q-012`, `TER-Q-015`
- **Módulo:** `OBS` (Observaciones)
- **Dirección:** Este módulo provee identidad y estado
- **Qué:** `OBS` registra observaciones generales o productivas referenciando el Lote o su implantación y valida `TER-BR-018`; no duplica el hecho dentro de `TER`.
- **Para qué:** historial funcional visible desde el Lote.

### TER-DEP-006 — Cosechas — Producción originada en el Lote

- **Estado:** Aprobado
- **Origen:** `B-02`, `B-03`, `TER-Q-012`, `TER-Q-015`
- **Módulo:** `COS` (Cosechas)
- **Dirección:** Este módulo provee identidad y estado
- **Qué:** `COS` conserva cosechas, cantidades y entregas a través de la implantación relacionada con el Lote y valida `TER-BR-018`; `TER` no copia producción.
- **Para qué:** historial funcional visible desde el Lote.

### TER-DEP-007 — Reportes — Línea temporal y códigos legibles

- **Estado:** Aprobado
- **Origen:** `B-02`, `B-03`, `TER-Q-012`, `TER-Q-015`
- **Módulo:** `REP` (Reportes)
- **Dirección:** Este módulo provee
- **Qué:** `TER` provee códigos estables y contexto territorial. `REP` reúne referencias de `CUL`, `LAB`, `OBS` y `COS` por `loteId` para presentar la línea temporal y generar identificadores legibles propios sin modificar los hechos fuente.
- **Para qué:** navegación histórica e informes por Chacra y Lote.

## 4. Fuera de alcance

- La ubicación de referencia de Chacra aprobada en `TER-Q-018` requiere un cambio controlado sobre la primera entrega; no se modifica silenciosamente dentro de esta redacción de Lotes.
- La aplicación de `TER-BR-023` a `TER-REQ-005` y `TER-UC-005` requiere un cambio controlado sobre la primera entrega de Chacras; hasta ese cambio, esta entrega solo la aplica al registro y reactivación de Lotes.
- Cultivos, implantaciones y cosechas conservan los dueños registrados en arquitectura.md; no se agregan como atributos de Chacra por anticipado — origen `B-01` y arquitectura.
- Reactivación de Chacras: definición posterior según `TER-Q-006`.
- El responsable es un dato descriptivo; no se genera una Cuenta de Empresa, permiso o asignación por informarlo — origen `B-01`.
- No se habilita borrado físico como operación alternativa a la inactivación: referencia `TER-BR-006`.
- Cultivos, implantaciones, labores, observaciones y cosechas no se almacenan como atributos ni como copias históricas dentro de Lote; referencias `TER-Q-011`, `TER-Q-015`, `TER-DEP-003` a `TER-DEP-007`.
- Superficie productiva, superficie trabajada y superficie de sectores no reemplazan la superficie cartográfica oficial de `TER-BR-015`; pertenecen al módulo que define su significado.
