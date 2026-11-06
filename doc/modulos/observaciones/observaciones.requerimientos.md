---
type: requirements
module: "OBS"
status: Propuesto
owner: "Analista"
---

# Observaciones — Requerimientos

## 1. Reglas de negocio

### OBS-BR-001 — Un período fenológico vigente por Implantación

- **Estado:** Propuesto
- **Origen:** `B-01`, `OBS-Q-002`
- **Tipo:** Invariante
- **Regla:** Una Implantación tiene como máximo un período fenológico sin fecha de finalización; el historial se aplica a la Implantación completa y no se divide por sectores.
- **Si se incumple:** se rechaza la operación con `OBS_PERIODO_FENOLOGICO_SUPERPUESTO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Implantación sin período vigente | Puede iniciarse el primero |
| Implantación con períodos finalizados y uno vigente | Se acepta el historial |
| Implantación con dos períodos vigentes | Se rechaza con `OBS_PERIODO_FENOLOGICO_SUPERPUESTO` |

### OBS-BR-002 — Estado fenológico compatible

- **Estado:** Propuesto
- **Origen:** `B-01`, `OBS-Q-001`, `OBS-DEP-003`
- **Tipo:** Validación
- **Regla:** El estado utilizado en un período debe estar provisto por `CUL`, pertenecer a la misma Empresa cliente y ser aplicable al Cultivo de la Implantación.
- **Si se incumple:** se rechaza la operación con `OBS_ESTADO_FENOLOGICO_INVALIDO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Estado activo de Yerba mate para una Implantación de Yerba mate de la misma Empresa | Se acepta |
| Estado histórico ya asociado al período que se consulta | Se conserva |
| Estado de Citrus para una Implantación de Yerba mate | Se rechaza con `OBS_ESTADO_FENOLOGICO_INVALIDO` |

### OBS-BR-003 — Transición fenológica cronológica

- **Estado:** Propuesto
- **Origen:** `B-01`, `OBS-Q-003`
- **Tipo:** Temporal
- **Regla:** Una nueva transición debe tener una fecha posterior al inicio del período vigente; finaliza ese período e inicia el siguiente en la fecha informada. No se insertan transiciones retroactivas.
- **Si se incumple:** se rechaza la operación con `OBS_TRANSICION_FENOLOGICA_NO_CRONOLOGICA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Período iniciado el 1 de agosto y transición el 10 de agosto | Finaliza el anterior e inicia el nuevo el 10 de agosto |
| Primera transición de una Implantación sin historial | Inicia el primer período |
| Período iniciado el 10 de agosto y nueva transición el 9 de agosto | Se rechaza con `OBS_TRANSICION_FENOLOGICA_NO_CRONOLOGICA` |

### OBS-BR-004 — Evaluación respecto de lo esperado

- **Estado:** Propuesto
- **Origen:** `B-01`, `OBS-Q-004`, `OBS-Q-020`
- **Tipo:** Validación
- **Regla:** La nota y la evaluación fenológica son opcionales; cuando se informa, la evaluación usa `MUY_MALA`, `MALA`, `ESPERADA`, `BUENA` o `MUY_BUENA`.
- **Si se incumple:** se rechaza la operación con `OBS_EVALUACION_FENOLOGICA_INVALIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Evaluación `BUENA` | Se acepta |
| Evaluación omitida | Pendiente de `OBS-Q-020` |
| Valor fuera de la escala | Se rechaza con `OBS_EVALUACION_FENOLOGICA_INVALIDA` |

### OBS-BR-005 — Corrección fenológica versionada

- **Estado:** Propuesto
- **Origen:** `OBS-Q-003`
- **Tipo:** Invariante
- **Regla:** Una corrección del historial conserva la versión reemplazada, el motivo, el actor y la fecha de corrección; nunca reescribe silenciosamente un período histórico.
- **Si se incumple:** se rechaza la operación con `OBS_CORRECCION_FENOLOGICA_INVALIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Corrección con motivo que conserva la versión anterior | Se acepta |
| Consulta del historial después de corregir | Permite identificar ambas versiones |
| Sustitución que elimina la versión anterior | Se rechaza con `OBS_CORRECCION_FENOLOGICA_INVALIDA` |

### OBS-BR-006 — Tipo de Observación por Empresa

- **Estado:** Propuesto
- **Origen:** `B-02`, `OBS-Q-005`
- **Tipo:** Invariante
- **Regla:** Cada Tipo de Observación pertenece a una única Empresa cliente y solo puede utilizarse en Observaciones de esa Empresa.
- **Si se incumple:** se rechaza la operación con `OBS_TIPO_OBSERVACION_INVALIDO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Tipo configurado por la misma Empresa | Se acepta |
| Dos Empresas usan tipos propios con el mismo nombre | Se aceptan como identidades diferentes |
| Una Empresa intenta usar el tipo de otra | Se rechaza con `OBS_TIPO_OBSERVACION_INVALIDO` |

### OBS-BR-007 — Vigencia histórica de catálogos

- **Estado:** Propuesto
- **Origen:** `IA`, `OBS-Q-019`
- **Tipo:** Invariante
- **Regla:** Los elementos de catálogo ya utilizados se conservan en el historial y solo los activos pueden elegirse para nuevos registros.
- **Si se incumple:** se rechaza la operación con `OBS_CATALOGO_INACTIVO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Tipo activo usado en una nueva Observación | Se acepta |
| Tipo inactivo presente en una consulta histórica | Se muestra |
| Tipo inactivo usado en una nueva Observación | Se rechaza con `OBS_CATALOGO_INACTIVO` |

### OBS-BR-008 — Pertenencia a la Empresa cliente

- **Estado:** Propuesto
- **Origen:** arquitectura multiempresa, `OBS-DEP-001`
- **Tipo:** Invariante
- **Regla:** Una Observación, período fenológico y todas sus referencias funcionales pertenecen a la misma Empresa cliente.
- **Si se incumple:** se rechaza la operación con `OBS_EMPRESA_INCONSISTENTE`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Observación y Lote de la misma Empresa | Se acepta |
| Observación sin referencia territorial pero dentro del contexto de Empresa | Se acepta |
| Observación de una Empresa con Implantación de otra | Se rechaza con `OBS_EMPRESA_INCONSISTENTE` |

### OBS-BR-009 — Ubicación opcional y consistente

- **Estado:** Propuesto
- **Origen:** `B-02`, `OBS-Q-006`, `OBS-Q-015`
- **Tipo:** Validación
- **Regla:** Chacra, Lote, Implantación y punto geográfico son opcionales; cuando se informa más de una referencia deben ser compatibles y, si no se informa ninguna, se exige una descripción textual de la ubicación.
- **Si se incumple:** se rechaza la operación con `OBS_UBICACION_INCONSISTENTE`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Punto fuera de una Chacra para informar un caño roto | Se acepta |
| Lote perteneciente a la Chacra informada | Se acepta |
| Lote que no pertenece a la Chacra informada | Se rechaza con `OBS_UBICACION_INCONSISTENTE` |

### OBS-BR-010 — Contexto fenológico de la Observación

- **Estado:** Propuesto
- **Origen:** `B-02`, `IA`, `OBS-Q-021`
- **Tipo:** Cálculo
- **Regla:** Toda Observación registra el momento observado y, cuando referencia una Implantación, el sistema determina y conserva la referencia al período fenológico vigente en ese momento; si no existe un período, no inventa uno.
- **Si se incumple:** no aplica al cálculo; una referencia incompatible se rechaza con `OBS_CONTEXTO_FENOLOGICO_INVALIDO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Observación durante un período fenológico existente | Referencia ese período |
| Implantación sin historial fenológico | No inventa un estado |
| Estado seleccionado manualmente que no era vigente | Se rechaza con `OBS_CONTEXTO_FENOLOGICO_INVALIDO` |

### OBS-BR-011 — Urgencia de la Observación

- **Estado:** Propuesto
- **Origen:** `B-02`, `OBS-Q-007`
- **Tipo:** Validación
- **Regla:** La urgencia de una Observación es `BAJA`, `MEDIA`, `ALTA` o `CRITICA`.
- **Si se incumple:** se rechaza la operación con `OBS_URGENCIA_INVALIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Urgencia `ALTA` | Se acepta |
| Urgencia `CRITICA` | Se acepta como límite superior |
| Urgencia no incluida en la escala | Se rechaza con `OBS_URGENCIA_INVALIDA` |

### OBS-BR-012 — Observación sanitaria sobre una Implantación

- **Estado:** Propuesto
- **Origen:** `B-02`, `IA`, `OBS-Q-022`
- **Tipo:** Invariante
- **Regla:** Una Observación sanitaria describe plantas concretas y debe referenciar una Implantación; una incidencia sin Implantación se registra con un Tipo general u operativo.
- **Si se incumple:** se rechaza la operación con `OBS_IMPLANTACION_REQUERIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Manchas en hojas de una Implantación identificada | Se acepta como sanitaria |
| Caño roto fuera de una Chacra | Se acepta como general u operativa |
| Hallazgo sanitario sin Implantación | Se rechaza con `OBS_IMPLANTACION_REQUERIDA` |

### OBS-BR-013 — Evidencias privadas referenciadas

- **Estado:** Propuesto
- **Origen:** `B-02`, `OBS-Q-018`, `OBS-DEP-005`
- **Tipo:** Invariante
- **Regla:** `OBS` conserva referencias a evidencias privadas de la misma Empresa cliente y `ARC` conserva los binarios; cardinalidad, obligatoriedad y descripción permanecen pendientes. [[Q:OBS-Q-018]]
- **Si se incumple:** se rechaza la operación con `OBS_EVIDENCIA_INVALIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Imagen privada válida de la misma Empresa | Se referencia |
| Observación sin evidencia | Pendiente de `OBS-Q-018` |
| Archivo de otra Empresa | Se rechaza con `OBS_EVIDENCIA_INVALIDA` |

### OBS-BR-014 — Problema sanitario aplicable

- **Estado:** Propuesto
- **Origen:** `IA`, `OBS-Q-012`
- **Tipo:** Validación
- **Regla:** Cada Empresa cliente configura sus problemas sanitarios y los Cultivos a los que se aplican; si se selecciona uno, debe pertenecer a la Empresa y ser aplicable al Cultivo de la Implantación.
- **Si se incumple:** se rechaza la operación con `OBS_PROBLEMA_SANITARIO_INVALIDO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Problema aplicable al Cultivo observado | Se acepta |
| Hallazgo sin causa identificada | Se conserva como hallazgo sin problema seleccionado |
| Problema limitado a Citrus usado sobre Yerba mate | Se rechaza con `OBS_PROBLEMA_SANITARIO_INVALIDO` |

### OBS-BR-015 — Severidad sanitaria

- **Estado:** Propuesto
- **Origen:** `IA`, `OBS-Q-011`
- **Tipo:** Validación
- **Regla:** La severidad sanitaria usa `LEVE`, `MODERADA`, `GRAVE` o `CRITICA` y es independiente de la urgencia.
- **Si se incumple:** se rechaza la operación con `OBS_SEVERIDAD_INVALIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Severidad `MODERADA` y urgencia `ALTA` | Se aceptan como dimensiones diferentes |
| Severidad omitida | Se acepta mientras no se defina obligatoria |
| Valor ajeno a la escala | Se rechaza con `OBS_SEVERIDAD_INVALIDA` |

### OBS-BR-016 — Nivel de certeza sanitaria

- **Estado:** Propuesto
- **Origen:** `IA`, `OBS-Q-022`
- **Tipo:** Invariante
- **Regla:** Una Observación sanitaria distingue `SOLO_HALLAZGO`, `CAUSA_SOSPECHADA` y `CAUSA_CONFIRMADA`; una sospecha nunca se presenta como diagnóstico confirmado.
- **Si se incumple:** se rechaza la operación con `OBS_CERTEZA_SANITARIA_INVALIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Síntoma observado sin causa propuesta | `SOLO_HALLAZGO` |
| Posible hongo sin verificación | `CAUSA_SOSPECHADA` |
| Sospecha presentada como confirmación | Se rechaza con `OBS_CERTEZA_SANITARIA_INVALIDA` |

### OBS-BR-017 — Confirmación sanitaria autorizada

- **Estado:** Propuesto
- **Origen:** `IA`, `OBS-Q-013`
- **Tipo:** Autorización de dominio
- **Regla:** El Administrador y el Capataz pueden confirmar una causa sanitaria dentro de su alcance autorizado; la confirmación conserva quién la realizó y cuándo.
- **Si se incumple:** se rechaza la operación con `OBS_CONFIRMACION_SANITARIA_NO_AUTORIZADA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Actor autorizado confirma y queda identificado | Se acepta |
| Registro inicial conserva una causa como sospechada | Se acepta |
| Actor no autorizado confirma una causa | Se rechaza con `OBS_CONFIRMACION_SANITARIA_NO_AUTORIZADA` |

### OBS-BR-018 — Seguimiento sanitario inmutable

- **Estado:** Propuesto
- **Origen:** `IA`, `OBS-Q-014`
- **Tipo:** Invariante
- **Regla:** Cada seguimiento sanitario se agrega con su propia fecha, evaluación, evidencia y evolución sin modificar el hallazgo original.
- **Si se incumple:** se rechaza la operación con `OBS_SEGUIMIENTO_SANITARIO_INVALIDO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Nuevo seguimiento que conserva el hallazgo inicial | Se acepta |
| Seguimiento sin cambiar el diagnóstico anterior | Se agrega al historial |
| Seguimiento que sobrescribe el hallazgo inicial | Se rechaza con `OBS_SEGUIMIENTO_SANITARIO_INVALIDO` |

### OBS-BR-019 — Ciclo de vida de la Observación

- **Estado:** Propuesto
- **Origen:** `IA`, `OBS-Q-017`
- **Tipo:** Transición
- **Regla:** Una Observación puede crearse `BORRADOR` o registrarse directamente; admite `BORRADOR → REGISTRADA → EN_ATENCION → RESUELTA` y puede pasar a `ANULADA` desde un estado operable.
- **Si se incumple:** se rechaza la operación con `OBS_TRANSICION_INVALIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Observación registrada comienza a atenderse | Pasa a `EN_ATENCION` |
| Borrador se registra directamente | Se propone aceptar |
| Observación resuelta vuelve silenciosamente a borrador | Se rechaza con `OBS_TRANSICION_INVALIDA` |

### OBS-BR-020 — Órdenes originadas por una Observación

- **Estado:** Propuesto
- **Origen:** `B-02`, `OBS-Q-008`, `OBS-Q-009`
- **Tipo:** Invariante
- **Regla:** Una Observación puede originar cero o varias Órdenes de Labor; cada Orden indica como máximo una Observación de origen y permanece bajo propiedad de `LAB`.
- **Si se incumple:** se rechaza la operación con `OBS_ORIGEN_LABOR_INVALIDO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Hallazgo que origina inspección y reparación | Se vinculan dos Órdenes |
| Observación sin acción requerida | Conserva cero Órdenes |
| Una Orden intenta declarar dos Observaciones de origen | Se rechaza con `OBS_ORIGEN_LABOR_INVALIDO` |

### OBS-BR-021 — Creación explícita de la Orden

- **Estado:** Propuesto
- **Origen:** `B-02`, `OBS-Q-008`
- **Tipo:** Invariante
- **Regla:** Generar una Orden desde una Observación es una acción explícita; `LAB` recibe el origen, la prioridad equivalente a la urgencia y el contexto disponible, pero valida y conserva su propio estado y datos.
- **Si se incumple:** se rechaza la operación con `OBS_ORDEN_LABOR_INVALIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Actor solicita una Orden desde una Observación `ALTA` | `LAB` recibe prioridad `ALTA` propuesta |
| Hallazgo crítico recién registrado | No crea una Orden automáticamente |
| Datos insuficientes para el Tipo de Labor elegido | Se rechaza con `OBS_ORDEN_LABOR_INVALIDA` |

### OBS-BR-022 — Cierre confirmado después de una Labor

- **Estado:** Propuesto
- **Origen:** `OBS-Q-010`
- **Tipo:** Transición
- **Regla:** Completar una Orden puede proponer resolver la Observación, pero no cambia su estado sin confirmación explícita de un actor autorizado.
- **Si se incumple:** se rechaza la operación con `OBS_CIERRE_NO_CONFIRMADO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Orden completada y actor confirma que el problema terminó | Puede resolverse la Observación |
| Orden completada pero quedan otras acciones | La Observación permanece abierta |
| Finalización de Orden intenta cerrar automáticamente | Se rechaza con `OBS_CIERRE_NO_CONFIRMADO` |

### OBS-BR-023 — Sin efectos productivos automáticos

- **Estado:** Propuesto
- **Origen:** `IA`, `OBS-Q-022`
- **Tipo:** Invariante
- **Regla:** Registrar una Observación o una causa sanitaria no genera consumos, tratamientos, recomendaciones, cambios fenológicos ni Órdenes de Labor automáticas.
- **Si se incumple:** se rechaza la operación con `OBS_EFECTO_AUTOMATICO_NO_PERMITIDO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Observación sanitaria registrada | Solo conserva el hallazgo |
| Actor decide crear una Orden mediante `OBS-REQ-012` | Se inicia la acción explícita |
| Diagnóstico confirmado descuenta un Insumo | Se rechaza con `OBS_EFECTO_AUTOMATICO_NO_PERMITIDO` |

### OBS-BR-024 — Corrección trazable de una Observación

- **Estado:** Propuesto
- **Origen:** `EPIC-010`, `IA`, `OBS-Q-017`
- **Tipo:** Invariante
- **Regla:** Una Observación registrada se corrige o anula conservando el contenido anterior, el motivo, el actor y la fecha.
- **Si se incumple:** se rechaza la operación con `OBS_CORRECCION_INVALIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Corrección con motivo y versión anterior visible | Se acepta |
| Anulación visible en el historial | Se conserva |
| Edición que elimina el contenido registrado anterior | Se rechaza con `OBS_CORRECCION_INVALIDA` |

## 2. Requerimientos funcionales

### OBS-REQ-001 — Iniciar historial fenológico

- **Estado:** Propuesto
- **Origen:** `B-01`, `OBS-Q-001`, `OBS-Q-002`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir iniciar el historial fenológico de una Implantación con un estado compatible y una fecha.
- **Reglas que aplica:** `OBS-BR-001` a `OBS-BR-004`, `OBS-BR-008`.

### OBS-REQ-002 — Registrar transición fenológica

- **Estado:** Propuesto
- **Origen:** `B-01`, `OBS-Q-003`, `OBS-Q-004`
- **Prioridad:** Must
- **Requerimiento:** Cuando se informa un nuevo estado fenológico, el sistema debe finalizar el período vigente e iniciar el siguiente conservando nota y evaluación cuando correspondan.
- **Reglas que aplica:** `OBS-BR-001` a `OBS-BR-004`, `OBS-BR-008`.

### OBS-REQ-003 — Corregir historial fenológico

- **Estado:** Propuesto
- **Origen:** `OBS-Q-003`
- **Prioridad:** Must
- **Requerimiento:** Cuando se detecta un error histórico, el sistema debe permitir corregirlo conservando la versión reemplazada y el motivo.
- **Reglas que aplica:** `OBS-BR-001`, `OBS-BR-002`, `OBS-BR-005`, `OBS-BR-008`.

### OBS-REQ-004 — Consultar historial fenológico

- **Estado:** Propuesto
- **Origen:** `B-01`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir consultar cronológicamente los períodos fenológicos de una Implantación y sus correcciones, con referencias a las Labores del mismo contexto para análisis temporal.
- **Reglas que aplica:** `OBS-BR-001`, `OBS-BR-005`, `OBS-BR-008`.

### OBS-REQ-005 — Administrar Tipos de Observación

- **Estado:** Propuesto
- **Origen:** `B-02`, `OBS-Q-005`, `OBS-Q-019`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir configurar y mantener Tipos de Observación propios de una Empresa cliente.
- **Reglas que aplica:** `OBS-BR-006`, `OBS-BR-007`, `OBS-BR-008`.

### OBS-REQ-006 — Registrar una Observación

- **Estado:** Propuesto
- **Origen:** `B-02`, `OBS-Q-006`, `OBS-Q-007`, `OBS-Q-021`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir registrar un hallazgo con Tipo de Observación, nota, urgencia, contexto territorial opcional, punto geográfico opcional y contexto fenológico cuando corresponda.
- **Reglas que aplica:** `OBS-BR-006` a `OBS-BR-013`, `OBS-BR-019`, `OBS-BR-023`.

### OBS-REQ-007 — Registrar una Observación sanitaria

- **Estado:** Propuesto
- **Origen:** `B-02`, `OBS-Q-011` a `OBS-Q-013`, `OBS-Q-022`
- **Prioridad:** Must
- **Requerimiento:** Cuando el Tipo clasifica el hallazgo como sanitario, el sistema debe permitir registrar síntoma, problema aplicable, severidad, extensión afectada y nivel de certeza sin presentar una sospecha como diagnóstico.
- **Reglas que aplica:** `OBS-BR-008` a `OBS-BR-017`, `OBS-BR-023`.

### OBS-REQ-008 — Vincular evidencias

- **Estado:** Propuesto
- **Origen:** `B-02`, `OBS-Q-018`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir vincular evidencias privadas de `ARC` a una Observación.
- **Reglas que aplica:** `OBS-BR-008`, `OBS-BR-013`.

### OBS-REQ-009 — Registrar seguimiento sanitario

- **Estado:** Propuesto
- **Origen:** `IA`, `OBS-Q-014`
- **Prioridad:** Should
- **Requerimiento:** Cuando se evalúa nuevamente un hallazgo sanitario, el sistema debe permitir agregar un seguimiento fechado sin reemplazar la Observación original.
- **Reglas que aplica:** `OBS-BR-008`, `OBS-BR-013` a `OBS-BR-018`.

### OBS-REQ-010 — Consultar Observaciones

- **Estado:** Propuesto
- **Origen:** `EPIC-010`, `B-02`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir consultar Observaciones por Empresa cliente, período, Tipo, urgencia, estado y contexto territorial o productivo disponible.
- **Reglas que aplica:** `OBS-BR-006` a `OBS-BR-019`, `OBS-BR-024`.

### OBS-REQ-011 — Corregir o anular una Observación

- **Estado:** Propuesto
- **Origen:** `EPIC-010`, `IA`, `OBS-Q-017`
- **Prioridad:** Must
- **Requerimiento:** Cuando una Observación registrada contiene un error o deja de ser válida, el sistema debe permitir corregirla o anularla conservando su historia.
- **Reglas que aplica:** `OBS-BR-008`, `OBS-BR-019`, `OBS-BR-024`.

### OBS-REQ-012 — Generar una Orden de Labor

- **Estado:** Propuesto
- **Origen:** `B-02`, `OBS-Q-008`, `OBS-Q-009`
- **Prioridad:** Must
- **Requerimiento:** Cuando un actor decide atender una Observación, el sistema debe permitir solicitar a `LAB` una Orden de Labor con origen, prioridad y contexto disponibles.
- **Reglas que aplica:** `OBS-BR-008`, `OBS-BR-019` a `OBS-BR-023`.

### OBS-REQ-013 — Resolver una Observación

- **Estado:** Propuesto
- **Origen:** `OBS-Q-010`, `OBS-Q-017`
- **Prioridad:** Must
- **Requerimiento:** Cuando el actor confirma que el hallazgo fue atendido, el sistema debe permitir resolver la Observación sin depender del cierre automático de una Orden.
- **Reglas que aplica:** `OBS-BR-019`, `OBS-BR-022`, `OBS-BR-024`.

## 3. Dependencias con otros módulos

### OBS-DEP-001 — Empresas — Identidad y vigencia

- **Estado:** Propuesto
- **Origen:** arquitectura multiempresa
- **Módulo:** `EMP` (Empresas)
- **Dirección:** Este módulo consume
- **Qué:** identidad y vigencia de la Empresa cliente propietaria de catálogos e historial.
- **Para qué:** `OBS-BR-006`, `OBS-BR-008`, todos los requerimientos.

### OBS-DEP-002 — Identidad y acceso — Contexto autorizado

- **Estado:** Propuesto
- **Origen:** `OBS-Q-013`, `OBS-Q-016`
- **Módulo:** `ACC` (Identidad y acceso)
- **Dirección:** Este módulo consume
- **Qué:** Cuenta de Empresa, roles, permisos y alcance autorizado.
- **Para qué:** `OBS-BR-005`, `OBS-BR-017`, `OBS-BR-022`, todos los casos de uso.

### OBS-DEP-003 — Contexto productivo — Cultivo, Implantación y estado fenológico

- **Estado:** Propuesto
- **Origen:** `B-01`, `B-02`, `OBS-Q-001`; `CUL-DEP-005`
- **Módulo:** `CUL` (Contexto productivo)
- **Dirección:** Este módulo consume y provee
- **Qué:** consume Cultivo, Implantación, Perfil y catálogo de estados fenológicos por Empresa y Cultivo; provee períodos y Observaciones como hechos del contexto productivo. La incorporación del catálogo de estados requiere ampliar `CUL`.
- **Para qué:** `OBS-BR-001` a `OBS-BR-004`, `OBS-BR-010`, `OBS-BR-012`, `OBS-BR-014`, `OBS-REQ-001` a `OBS-REQ-010`.

### OBS-DEP-004 — Territorio — Chacra, Lote y geometría

- **Estado:** Propuesto
- **Origen:** `B-02`; `TER-DEP-005`
- **Módulo:** `TER` (Territorio)
- **Dirección:** Este módulo consume y provee
- **Qué:** consume identidad, pertenencia, estado y geometría de Chacras y Lotes; provee Observaciones referenciadas sin duplicarlas dentro de `TER` y aplica `TER-BR-018`.
- **Para qué:** `OBS-BR-008`, `OBS-BR-009`, `OBS-REQ-006`, `OBS-REQ-010`.

### OBS-DEP-005 — Archivos — Evidencias privadas

- **Estado:** Propuesto
- **Origen:** `B-02`, `EPIC-010`, `OBS-Q-018`
- **Módulo:** `ARC` (Archivos)
- **Dirección:** Este módulo consume
- **Qué:** referencias a imágenes y otros Archivos privados; los binarios y su ciclo de vida permanecen en `ARC`.
- **Para qué:** `OBS-BR-013`, `OBS-REQ-008`, `OBS-REQ-009`.

### OBS-DEP-006 — Labores — Atención de hallazgos

- **Estado:** Propuesto
- **Origen:** `B-02`, `OBS-Q-008` a `OBS-Q-010`
- **Módulo:** `LAB` (Labores)
- **Dirección:** Este módulo consume y provee
- **Qué:** `OBS` solicita Órdenes con Observación de origen, prioridad y contexto; `LAB` conserva las Órdenes y comunica su estado. Requiere ampliar `LAB-ENT-003` para prioridad, origen OBS y Órdenes operativas sin Campaña.
- **Para qué:** `OBS-BR-020` a `OBS-BR-022`, `OBS-REQ-004`, `OBS-REQ-012`, `OBS-REQ-013`.

### OBS-DEP-007 — Personal — Persona que realizó la observación

- **Estado:** Propuesto
- **Origen:** `IA`, `OBS-Q-016`
- **Módulo:** `PER` (Personal)
- **Dirección:** Este módulo consume
- **Qué:** referencia opcional al Empleado que realizó materialmente el relevamiento, independiente de la Cuenta que lo registró.
- **Para qué:** `OBS-REQ-006`, `OBS-REQ-007`.

## 4. Fuera de alcance

- Definir Cultivos, Implantaciones o el Perfil de cultivo; pertenecen a `CUL` — Origen: `OBS-Q-001`, `OBS-DEP-003`.
- Conservar geometrías de Chacras o Lotes; pertenecen a `TER` — Origen: `B-02`, `OBS-DEP-004`.
- Conservar binarios de evidencias; pertenecen a `ARC` — Origen: `B-02`, `OBS-DEP-005`.
- Planificar o ejecutar la Orden originada; pertenece a `LAB` — Origen: `B-02`, `OBS-DEP-006`.
- Generar tratamientos, consumos, recomendaciones o cambios fenológicos automáticos — Origen: `IA`, `OBS-BR-023`.
- Usar “Reporte” como identidad del hallazgo; los reportes y proyecciones agregadas pertenecen a `REP` — Origen: `B-02`, `OBS-Q-022`.
