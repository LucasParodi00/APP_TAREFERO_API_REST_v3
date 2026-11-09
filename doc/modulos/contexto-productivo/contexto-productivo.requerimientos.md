---
type: requirements
module: "CUL"
status: Aprobado
owner: "Analista"
---

# Contexto productivo — Requerimientos

## 1. Reglas de negocio

### CUL-BR-001 — Catálogo canónico de Cultivos

- **Estado:** Aprobado
- **Origen:** `CUL-Q-015`, `CUL-Q-022`
- **Tipo:** Invariante
- **Regla:** Cada Cultivo pertenece al catálogo global, tiene código estable único y nombre normalizado único; se inactiva sin borrar su historia.
- **Si se incumple:** se rechaza con `CUL_CULTIVO_DUPLICADO`.

| Situación | Resultado |
|---|---|
| Código y nombre no utilizados | Se acepta |
| Mismo nombre con diferencias de mayúsculas o espacios | Se rechaza con `CUL_CULTIVO_DUPLICADO` |
| Cultivo histórico inactivado | Se conserva y no se ofrece para nuevas configuraciones |

### CUL-BR-002 — Variedad perteneciente a un Cultivo

- **Estado:** Aprobado
- **Origen:** `CUL-Q-001`, `CUL-Q-015`, `CUL-Q-022`
- **Tipo:** Invariante
- **Regla:** Una Variedad pertenece a un único Cultivo y su código y nombre normalizados son únicos dentro de ese Cultivo; se inactiva sin borrar su historia.
- **Si se incumple:** se rechaza con `CUL_VARIEDAD_INVALIDA`.

| Situación | Resultado |
|---|---|
| Misma denominación en Cultivos distintos | Se acepta |
| Duplicado dentro del mismo Cultivo | Se rechaza con `CUL_VARIEDAD_INVALIDA` |
| Variedad de otro Cultivo en una Implantación | Se rechaza con `CUL_VARIEDAD_INVALIDA` |

### CUL-BR-003 — Cultivo habilitado para la Empresa

- **Estado:** Aprobado
- **Origen:** `CUL-Q-009`, `CUL-Q-015`
- **Tipo:** Validación
- **Regla:** Una Empresa cliente solo puede usar en nuevas Implantaciones y Perfiles los Cultivos globales que su Administrador haya habilitado.
- **Si se incumple:** se rechaza con `CUL_CULTIVO_NO_HABILITADO`.

| Situación | Resultado |
|---|---|
| Cultivo activo y habilitado | Se acepta |
| Cultivo global no habilitado para la Empresa | Se rechaza |
| Cultivo inactivo con historia | Se consulta, pero no se usa en registros nuevos |

### CUL-BR-004 — Precedencia de Perfil

- **Estado:** Aprobado
- **Origen:** `B-08`, `CUL-Q-006`
- **Tipo:** Invariante
- **Regla:** La configuración aplicable se resuelve con precedencia Lote → Empresa cliente → Perfil base, sin permitir que una especialización desactive campos base obligatorios.
- **Si se incumple:** se rechaza con `CUL_PERFIL_INCOMPATIBLE`.

| Situación | Resultado |
|---|---|
| Lote especializa un límite permitido | Se aplica la especialización |
| Empresa no especializa un campo | Se usa el Perfil base |
| Especialización desactiva un campo base obligatorio | Se rechaza |

### CUL-BR-005 — Campos tipados y verificables

- **Estado:** Aprobado
- **Origen:** `B-05` a `B-08`, `CUL-Q-019`
- **Tipo:** Validación
- **Regla:** Cada campo de Perfil declara código estable, nombre, descripción, destino funcional, tipo, obligatoriedad y validaciones; admite Texto, Entero, Decimal con unidad, Booleano, Fecha o Selección de catálogo y nunca código ejecutable ni fórmulas libres.
- **Si se incumple:** se rechaza con `CUL_CAMPO_PERFIL_INVALIDO`.

| Situación | Resultado |
|---|---|
| Decimal con unidad y rango | Se acepta |
| Selección con valores permitidos | Se acepta |
| Campo con fórmula libre ejecutable | Se rechaza |

### CUL-BR-006 — Versiones de Perfil inmutables

- **Estado:** Aprobado
- **Origen:** `CUL-Q-007`, `CUL-Q-022`
- **Tipo:** Invariante
- **Regla:** Una versión PUBLICADA de Perfil no se modifica; un cambio crea una versión nueva y las versiones usadas se conservan aunque pasen a INACTIVAS.
- **Si se incumple:** se rechaza con `CUL_VERSION_PERFIL_INMUTABLE`.

| Situación | Resultado |
|---|---|
| Editar Perfil en BORRADOR | Se acepta |
| Publicar una nueva versión | Se acepta |
| Modificar una versión PUBLICADA | Se rechaza |

### CUL-BR-007 — Perfil obligatorio y bloqueado por Ciclo

- **Estado:** Aprobado
- **Origen:** `CUL-Q-013`
- **Tipo:** Invariante
- **Regla:** Cada Ciclo productivo elige una versión PUBLICADA de Perfil compatible; puede cambiarla mientras la Campaña está en BORRADOR y queda inmutable al activarla.
- **Si se incumple:** se rechaza con `CUL_PERFIL_CICLO_INVALIDO`.

| Situación | Resultado |
|---|---|
| Cambiar Perfil antes de activar | Se acepta |
| Activar sin Perfil | Se rechaza |
| Cambiar Perfil con Campaña ACTIVA | Se rechaza |

### CUL-BR-008 — Datos mínimos de Implantación

- **Estado:** Aprobado
- **Origen:** `B-01`, `CUL-Q-016`, `TER-BR-018`
- **Tipo:** Validación
- **Regla:** Una Implantación requiere Lote ACTIVO, Cultivo habilitado, fecha de inicio y superficie o sector diferenciable; la Variedad es opcional y, si existe, debe pertenecer al Cultivo.
- **Si se incumple:** se rechaza con `CUL_IMPLANTACION_INVALIDA`.

| Situación | Resultado |
|---|---|
| Lote activo y datos completos | Se acepta |
| Lote inactivo | Se rechaza con `TER_LOTE_INACTIVO` |
| Falta superficie o sector | Se rechaza con `CUL_IMPLANTACION_INVALIDA` |

### CUL-BR-009 — Superficies activas sin superposición

- **Estado:** Aprobado
- **Origen:** `CUL-Q-016`, `TER-Q-011`
- **Tipo:** Invariante
- **Regla:** Las Implantaciones activas de un Lote no superponen la misma superficie y la suma de sus superficies no supera la superficie vigente informada por Territorio.
- **Si se incumple:** se rechaza con `CUL_SUPERFICIE_IMPLANTADA_INVALIDA`.

| Situación | Resultado |
|---|---|
| Sectores diferenciados dentro del total | Se acepta |
| Superposición de un sector activo | Se rechaza |
| Suma superior a la superficie del Lote | Se rechaza |

### CUL-BR-010 — Historia de Implantación

- **Estado:** Aprobado
- **Origen:** `CUL-Q-001`, `CUL-Q-016`, `CUL-Q-022`
- **Tipo:** Transición
- **Regla:** Una Implantación pasa de ACTIVA a FINALIZADA con fecha final no anterior a su inicio; no se reactiva ni se borra, y un cambio de Cultivo se representa mediante otra Implantación.
- **Si se incumple:** se rechaza con `CUL_TRANSICION_IMPLANTACION_INVALIDA`.

| Situación | Resultado |
|---|---|
| Finalizar con fecha posterior al inicio | Se acepta |
| Cambiar el Cultivo de una Implantación activa | Se rechaza |
| Reactivar una Implantación finalizada | Se rechaza |

### CUL-BR-011 — Alcance territorial de la Campaña

- **Estado:** Aprobado
- **Origen:** `CUL-Q-002`
- **Tipo:** Invariante
- **Regla:** Una Campaña pertenece a una Empresa cliente y su alcance es la unión de Chacras completas y Lotes específicos de esa misma Empresa.
- **Si se incumple:** se rechaza con `CUL_ALCANCE_CAMPANIA_INVALIDO`.

| Situación | Resultado |
|---|---|
| Chacra A completa y dos Lotes de Chacra B | Se acepta |
| Lote de otra Empresa | Se rechaza |
| Alcance vacío | Se rechaza |

### CUL-BR-012 — Lotes fijados al activar

- **Estado:** Aprobado
- **Origen:** `CUL-Q-014`
- **Tipo:** Temporal
- **Regla:** Al activar una Campaña se conserva la lista de Lotes existentes incluidos; un Lote creado después no ingresa automáticamente y requiere incorporación explícita y auditada.
- **Si se incumple:** se rechaza con `CUL_LOTE_NO_INCLUIDO`.

| Situación | Resultado |
|---|---|
| Lote presente al activar una Chacra completa | Queda incluido |
| Lote creado posteriormente | No entra automáticamente |
| Administrador lo incorpora explícitamente | Se acepta y audita |

### CUL-BR-013 — Alcance activo solo ampliable

- **Estado:** Aprobado
- **Origen:** `CUL-Q-018`
- **Tipo:** Transición
- **Regla:** El alcance se edita libremente en BORRADOR; en ACTIVA solo admite agregar Lotes explícitamente y no permite retirar Chacras ni Lotes.
- **Si se incumple:** se rechaza con `CUL_ALCANCE_ACTIVO_INMUTABLE`.

| Situación | Resultado |
|---|---|
| Retirar Lote en BORRADOR | Se acepta |
| Agregar Lote a Campaña ACTIVA | Se acepta y audita |
| Retirar Lote de Campaña ACTIVA | Se rechaza |

### CUL-BR-014 — Ciclo de vida de Campaña

- **Estado:** Aprobado
- **Origen:** `CUL-Q-005`, `CUL-Q-017`, `CUL-Q-020`
- **Tipo:** Transición
- **Regla:** Una Campaña pasa de BORRADOR a ACTIVA y de ACTIVA a CERRADA; puede reabrirse de CERRADA a ACTIVA mediante una intervención auditada del Administrador.
- **Si se incumple:** se rechaza con `CUL_TRANSICION_CAMPANIA_INVALIDA`.

| Situación | Resultado |
|---|---|
| Activar BORRADOR válido | Se acepta |
| Cerrar ACTIVA válida | Se acepta |
| Activar directamente una CERRADA sin reapertura | Se rechaza |

### CUL-BR-015 — Campañas simultáneas y multicultivo

- **Estado:** Aprobado
- **Origen:** `CUL-Q-005`, `CUL-Q-011`
- **Tipo:** Invariante
- **Regla:** Una Empresa puede tener Campañas ACTIVAS superpuestas cuando sus Ciclos productivos sean distintos; una Campaña puede reunir varios Cultivos y cada Ciclo conserva su Implantación, Cultivo y Perfil.
- **Si se incumple:** se rechaza con `CUL_CICLO_CAMPANIA_DUPLICADO`.

| Situación | Resultado |
|---|---|
| Dos Campañas con Ciclos distintos | Se acepta |
| Una Campaña con Yerba mate y Naranja en Ciclos separados | Se acepta |
| Mismo Ciclo incorporado dos veces | Se rechaza |

### CUL-BR-016 — Historia independiente por Campaña

- **Estado:** Aprobado
- **Origen:** `B-04`, `CUL-Q-003`
- **Tipo:** Invariante
- **Regla:** Una Campaña nueva comienza sin hechos propios; nunca reinicia, elimina ni reasigna los hechos de Campañas anteriores, que permanecen consultables.
- **Si se incumple:** se rechaza con `CUL_HISTORIA_CAMPANIA_INALTERABLE`.

| Situación | Resultado |
|---|---|
| Consultar Campaña nueva | Sus indicadores comienzan en cero |
| Consultar Campaña anterior | Conserva sus resultados |
| Reasignar hechos históricos a la nueva | Se rechaza |

### CUL-BR-017 — Cierre con Ciclos finalizados

- **Estado:** Aprobado
- **Origen:** `CUL-Q-020`, `CUL-Q-021`
- **Tipo:** Validación
- **Regla:** Una Campaña solo se cierra cuando todos sus Ciclos productivos están FINALIZADOS y entonces registra su fecha real de finalización, que puede diferir de la tentativa y no puede ser anterior al inicio.
- **Si se incumple:** se rechaza con `CUL_CAMPANIA_CON_CICLOS_ACTIVOS`.

| Situación | Resultado |
|---|---|
| Todos los Ciclos finalizados y fecha real posterior al inicio | Se cierra y conserva la diferencia respecto de la tentativa |
| Existe un Ciclo ACTIVO | Se rechaza |
| Fecha final anterior al inicio | Se rechaza |

### CUL-BR-018 — Efectos de cierre y reapertura

- **Estado:** Aprobado
- **Origen:** `CUL-Q-005`, `CUL-Q-020`
- **Tipo:** Invariante
- **Regla:** Una Campaña CERRADA no admite nuevos hechos operativos; reabrirla no reactiva automáticamente sus Ciclos finalizados.
- **Si se incumple:** se rechaza con `CUL_CAMPANIA_CERRADA`.

| Situación | Resultado |
|---|---|
| Consultar Campaña CERRADA | Se permite |
| Registrar un hecho nuevo | Se rechaza |
| Reabrir Campaña | Sus Ciclos continúan FINALIZADOS |

### CUL-BR-019 — Datos propios y dependencias

- **Estado:** Aprobado
- **Origen:** `B-11`, `CUL-Q-004`, `CUL-Q-008`, `CUL-Q-021`
- **Tipo:** Invariante
- **Regla:** CUL conserva catálogos, Perfiles, Implantaciones, Campañas y Ciclos durante todo el período integral; LAB, OBS, COS y los módulos posteriores conservan sus hechos, COS define además sus propias fechas de Cosecha y REP reconstruye indicadores sin copias en CUL.
- **Si se incumple:** se rechaza con `CUL_DATO_FUERA_DE_MODULO`.

| Situación | Resultado |
|---|---|
| Labor referencia un Ciclo | Se acepta |
| CUL copia un Pesaje de Cosecha | Se rechaza |
| REP calcula por Campaña | Se acepta |

### CUL-BR-020 — Datos válidos de Campaña

- **Estado:** Aprobado
- **Origen:** `B-10`, `B-11`, `CUL-Q-017`, `CUL-Q-021`
- **Tipo:** Validación
- **Regla:** El nombre de Campaña elimina espacios exteriores, contiene de 1 a 150 caracteres y no requiere unicidad; la descripción admite hasta 1000; las fechas de inicio y finalización tentativa son obligatorias y quedan fijadas al activar; la fecha real se declara al cerrar para conservar la diferencia entre lo estimado y lo ocurrido.
- **Si se incumple:** se rechaza con `CUL_CAMPANIA_INVALIDA`.

| Situación | Resultado |
|---|---|
| Nombre repetido y fechas válidas | Se acepta |
| Nombre vacío o mayor a 150 | Se rechaza |
| Fecha tentativa anterior al inicio | Se rechaza |

### CUL-BR-021 — Ciclo productivo y Perfil

- **Estado:** Aprobado
- **Origen:** `CUL-Q-013`, `CUL-Q-020`, `CUL-Q-022`
- **Tipo:** Transición
- **Regla:** Un Ciclo pertenece a una Campaña y una Implantación; pasa de BORRADOR a ACTIVO al activar o incorporar su alcance y de ACTIVO a FINALIZADO de forma explícita, conservando su versión de Perfil.
- **Si se incumple:** se rechaza con `CUL_TRANSICION_CICLO_INVALIDA`.

| Situación | Resultado |
|---|---|
| Activar con Implantación y Perfil compatibles | Se acepta |
| Finalizar un Ciclo ACTIVO | Se acepta |
| Reactivar automáticamente al reabrir Campaña | Se rechaza |

### CUL-BR-022 — Conservación de catálogos y Perfiles

- **Estado:** Aprobado
- **Origen:** `CUL-Q-022`
- **Tipo:** Invariante
- **Regla:** Cultivos, Variedades y versiones de Perfil con referencias históricas no se borran; su inactivación solo impide usos nuevos.
- **Si se incumple:** se rechaza con `CUL_REGISTRO_HISTORICO_EN_USO`.

| Situación | Resultado |
|---|---|
| Inactivar elemento sin perder historia | Se acepta |
| Consultar una Campaña que lo usó | Se permite |
| Borrarlo con referencias | Se rechaza |

### CUL-BR-023 — Habilitación única por Empresa y Cultivo

- **Estado:** Propuesto
- **Origen:** `CUL-Q-015`, `CUL-Q-023`, `CUL-Q-024`; IA para identidad y tratamiento de repeticiones.
- **Tipo:** Invariante
- **Regla:** Cada par Empresa cliente y Cultivo global tiene como máximo una habilitación. Repetir el mismo estado conserva la habilitación existente.
- **Si se incumple:** un segundo vínculo para el mismo par se rechaza con `CUL_HABILITACION_DUPLICADA`.

| Situación | Resultado |
|---|---|
| Dos Empresas habilitan el mismo Cultivo | Cada una conserva su propio vínculo |
| La Empresa vuelve a solicitar el estado que ya tiene | Se conserva el vínculo sin duplicarlo |
| Una escritura intenta insertar otro vínculo para el mismo par | Se rechaza |

### CUL-BR-024 — Vigencia de la habilitación

- **Estado:** Propuesto
- **Origen:** `CUL-Q-015`, `CUL-Q-024`; IA para precisar la validación del catálogo al habilitar.
- **Tipo:** Transición
- **Regla:** La habilitación se puede retirar y restablecer en el mismo vínculo. Para habilitar o rehabilitar, el Cultivo global debe estar activo. Retirar la habilitación aplica `CUL-BR-003` a usos nuevos y conserva los estados y referencias de los registros existentes.
- **Si se incumple:** habilitar un Cultivo inexistente o inactivo se rechaza con `CUL_HABILITACION_INVALIDA`. Los nuevos usos sin habilitación siguen `CUL-BR-003`.

| Situación | Resultado |
|---|---|
| Rehabilitar un Cultivo global activo | Se restablece el vínculo previo |
| Deshabilitar con Implantaciones y Ciclos activos | Se retira la habilitación y se conserva lo existente |
| Habilitar un Cultivo global inactivo | Se rechaza |

### CUL-BR-025 — Disponibilidad de Variedades

- **Estado:** Propuesto
- **Origen:** `CUL-Q-023`, `CUL-BR-002`, `CUL-BR-022`.
- **Tipo:** Validación
- **Regla:** Para una nueva Implantación de un Cultivo habilitado quedan disponibles todas sus Variedades activas. La disponibilidad deriva del Cultivo y del catálogo global.
- **Si se incumple:** se aplican las validaciones de pertenencia de `CUL-BR-002` y de nuevos usos de `CUL-BR-022`.

| Situación | Resultado |
|---|---|
| El Cultivo habilitado tiene dos Variedades activas | Ambas están disponibles |
| El Cultivo habilitado no tiene Variedades activas | No se ofrecen Variedades y se conserva la selección opcional de `CUL-BR-008` |
| Se intenta usar una Variedad inactiva o de otro Cultivo | Se rechaza según la regla incumplida |

## 2. Requerimientos funcionales

### CUL-REQ-001 — Administrar catálogo productivo
- **Estado:** Aprobado
- **Origen:** `CUL-Q-015`, `CUL-Q-022`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir al SuperAdministrador crear, consultar e inactivar Cultivos y Variedades globales.
- **Reglas que aplica:** `CUL-BR-001`, `CUL-BR-002`, `CUL-BR-022`.

### CUL-REQ-002 — Configurar Perfiles de cultivo
- **Estado:** Aprobado
- **Origen:** `B-05` a `B-08`, `CUL-Q-006`, `CUL-Q-007`, `CUL-Q-019`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir mantener, versionar, publicar e inactivar Perfiles base y especializaciones por Empresa cliente y Lote.
- **Reglas que aplica:** `CUL-BR-003` a `CUL-BR-006`, `CUL-BR-022`.

### CUL-REQ-003 — Registrar una Implantación
- **Estado:** Aprobado
- **Origen:** `B-01`, `CUL-Q-016`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir registrar una Implantación en un Lote autorizado.
- **Reglas que aplica:** `CUL-BR-003`, `CUL-BR-008`, `CUL-BR-009`.

### CUL-REQ-004 — Finalizar una Implantación
- **Estado:** Aprobado
- **Origen:** `CUL-Q-001`, `CUL-Q-016`, `CUL-Q-022`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir finalizar una Implantación conservando su historia.
- **Reglas que aplica:** `CUL-BR-010`, `CUL-BR-022`.

### CUL-REQ-005 — Preparar una Campaña
- **Estado:** Aprobado
- **Origen:** `B-02`, `CUL-Q-002`, `CUL-Q-017`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir crear y modificar una Campaña en BORRADOR con sus datos, alcance y Ciclos productivos.
- **Reglas que aplica:** `CUL-BR-007`, `CUL-BR-011`, `CUL-BR-013`, `CUL-BR-015`, `CUL-BR-020`, `CUL-BR-021`.

### CUL-REQ-006 — Activar una Campaña
- **Estado:** Aprobado
- **Origen:** `CUL-Q-005`, `CUL-Q-013`, `CUL-Q-014`
- **Prioridad:** Must
- **Requerimiento:** Cuando el Administrador activa una Campaña válida, el sistema debe fijar su alcance inicial, bloquear los Perfiles y activar sus Ciclos.
- **Reglas que aplica:** `CUL-BR-007`, `CUL-BR-012`, `CUL-BR-014`, `CUL-BR-021`.

### CUL-REQ-007 — Ampliar una Campaña activa
- **Estado:** Aprobado
- **Origen:** `CUL-Q-014`, `CUL-Q-018`
- **Prioridad:** Must
- **Requerimiento:** Mientras una Campaña esté ACTIVA, el sistema debe permitir agregar Lotes explícitamente y auditar la ampliación.
- **Reglas que aplica:** `CUL-BR-012`, `CUL-BR-013`.

### CUL-REQ-008 — Finalizar un Ciclo productivo
- **Estado:** Aprobado
- **Origen:** `CUL-Q-020`, `CUL-Q-022`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir finalizar explícitamente un Ciclo productivo activo.
- **Reglas que aplica:** `CUL-BR-021`.

### CUL-REQ-009 — Cerrar y reabrir una Campaña
- **Estado:** Aprobado
- **Origen:** `CUL-Q-005`, `CUL-Q-020`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir cerrar una Campaña válida y reabrirla excepcionalmente con auditoría.
- **Reglas que aplica:** `CUL-BR-014`, `CUL-BR-017`, `CUL-BR-018`, `CUL-BR-021`.

### CUL-REQ-010 — Consultar contexto e historia productiva
- **Estado:** Aprobado
- **Origen:** `B-03`, `B-04`, `CUL-Q-003`, `CUL-Q-010`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir consultar Campañas, Ciclos, Implantaciones y sus contextos vigentes e históricos sin mezclar resultados.
- **Reglas que aplica:** `CUL-BR-015`, `CUL-BR-016`, `CUL-BR-018`, `CUL-BR-022`.

### CUL-REQ-011 — Resolver contexto para módulos operativos
- **Estado:** Aprobado
- **Origen:** `B-03`, `CUL-Q-004`, `CUL-Q-008`, `CUL-Q-021`
- **Prioridad:** Must
- **Requerimiento:** Cuando un módulo dueño registra o consulta un hecho, el sistema debe resolver la Campaña, el Ciclo, la Implantación y el Perfil aplicables sin copiar ese hecho en CUL.
- **Reglas que aplica:** `CUL-BR-016`, `CUL-BR-018`, `CUL-BR-019`.

### CUL-REQ-012 — Validar disponibilidad territorial
- **Estado:** Aprobado
- **Origen:** `TER-BR-018`, `TER-BR-019`, `TER-DEP-003`
- **Prioridad:** Must
- **Requerimiento:** Cuando se registra actividad productiva, el sistema debe validar la vigencia territorial y debe informar a Territorio si existen Implantaciones activas.
- **Reglas que aplica:** `CUL-BR-008`, `CUL-BR-009`, `CUL-BR-010`.

### CUL-REQ-013 — Mantener la habilitación de Cultivos por Empresa

- **Estado:** Propuesto
- **Origen:** `CUL-Q-015`, `CUL-Q-023`, `CUL-Q-024`; IA para la consulta del estado.
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir consultar la disponibilidad de los Cultivos del catálogo para una Empresa cliente, habilitarlos, deshabilitarlos y volver a habilitarlos dentro del alcance autorizado.
- **Reglas que aplica:** `CUL-BR-003`, `CUL-BR-023` a `CUL-BR-025`.

## 3. Dependencias con otros módulos

### CUL-DEP-001 — Empresas — Identidad y vigencia
- **Estado:** Aprobado
- **Origen:** `CUL-Q-002`, `CUL-Q-015`
- **Módulo:** `EMP`
- **Dirección:** Este módulo consume
- **Qué:** Identidad y estado de la Empresa cliente.
- **Para qué:** `CUL-BR-003`, `CUL-BR-011`.

### CUL-DEP-002 — Territorio — Chacras, Lotes y superficies
- **Estado:** Aprobado
- **Origen:** `B-01`, `CUL-Q-002`, `CUL-Q-014`, `CUL-Q-016`; `TER-DEP-003`
- **Módulo:** `TER`
- **Dirección:** Este módulo consume identidad, pertenencia, estado y superficie; provee existencia de Implantaciones activas
- **Qué:** Chacras y Lotes de la Empresa, superficie vigente y restricción operativa.
- **Para qué:** `CUL-BR-008` a `CUL-BR-013`.

### CUL-DEP-003 — Identidad y acceso — Contexto autorizado
- **Estado:** Aprobado
- **Origen:** `CUL-Q-010`
- **Módulo:** `ACC`
- **Dirección:** Este módulo consume
- **Qué:** Actor, Empresa cliente y permisos vigentes.
- **Para qué:** todos los casos de uso.

### CUL-DEP-004 — Labores — Hechos de trabajo
- **Estado:** Aprobado
- **Origen:** `B-03`, `B-04`, `CUL-Q-004`
- **Módulo:** `LAB`
- **Dirección:** Este módulo provee contexto; consume referencias
- **Qué:** LAB conserva las Labores y referencia Campaña, Ciclo e Implantación.
- **Para qué:** `CUL-BR-016`, `CUL-BR-019`, `CUL-REQ-011`.

### CUL-DEP-005 — Observaciones — Hechos productivos
- **Estado:** Aprobado
- **Origen:** `CUL-Q-004`, `CUL-Q-008`
- **Módulo:** `OBS`
- **Dirección:** Este módulo provee contexto; consume referencias
- **Qué:** OBS conserva sus observaciones y aplica el Perfil correspondiente.
- **Para qué:** `CUL-BR-019`, `CUL-REQ-011`.

### CUL-DEP-006 — Cosechas — Producción y fechas
- **Estado:** Aprobado
- **Origen:** `B-06`, `B-07`, `B-09`, `B-11`, `CUL-Q-008`, `CUL-Q-021`
- **Módulo:** `COS`
- **Dirección:** Este módulo provee contexto; consume referencias
- **Qué:** COS conserva Cosechas, Pesajes, calidades, descartes y sus propias fechas de inicio, finalización tentativa y finalización real, independientes de las fechas de Campaña.
- **Para qué:** `CUL-BR-019`, `CUL-REQ-011`.

### CUL-DEP-007 — Reportes — Indicadores por contexto
- **Estado:** Aprobado
- **Origen:** `B-03`, `B-04`, `CUL-Q-003`, `CUL-Q-004`
- **Módulo:** `REP`
- **Dirección:** Este módulo provee contexto; consume consultas
- **Qué:** REP reconstruye indicadores por Campaña, Ciclo, Implantación y Cultivo sin persistir copias en CUL.
- **Para qué:** `CUL-BR-016`, `CUL-BR-019`.

### CUL-DEP-008 — Inventario — Unidades
- **Estado:** Aprobado
- **Origen:** `CUL-Q-019`; arquitectura.md §4
- **Módulo:** `INV`
- **Dirección:** Este módulo consume
- **Qué:** Catálogo canónico de unidades usado por campos Decimales.
- **Para qué:** `CUL-BR-005`.

## 4. Fuera de alcance

- Labores, Observaciones, Cosechas, Pesajes, calidades, descartes e indicadores pertenecen a sus módulos dueños — `CUL-Q-004`, `CUL-Q-008`, `CUL-Q-021`.
- Los campos concretos de cada Cultivo se definirán Perfil por Perfil; no se fija Yerba mate ni Naranja como obligatorio — `CUL-Q-009`, `CUL-Q-012`.
- Rutas API, persistencia física y formularios quedan para fases posteriores.
