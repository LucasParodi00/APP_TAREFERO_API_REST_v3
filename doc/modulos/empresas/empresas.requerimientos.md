---
type: requirements
module: "EMP"
status: Aprobado
owner: "Analista"
---

# Empresas — Requerimientos

## 1. Reglas de negocio

### EMP-BR-001 — Nombre de Empresa válido

- **Estado:** Aprobado
- **Origen:** `B-04`, `EMP-Q-011`
- **Tipo:** Invariante
- **Regla:** Toda Empresa debe tener un nombre de hasta 120 caracteres; se eliminan los espacios exteriores y el resultado debe contener al menos un carácter.
- **Si se incumple:** la ausencia o el resultado vacío se rechazan con `EMP_NOMBRE_OBLIGATORIO`; superar la longitud se rechaza con `EMP_NOMBRE_INVALIDO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Nombre ` Yerba Norte ` | Se acepta y se conserva como `Yerba Norte`. |
| Nombre de 120 caracteres, con al menos uno visible | Se acepta. |
| Nombre ausente, vacío o compuesto solo por espacios | Se rechaza con `EMP_NOMBRE_OBLIGATORIO`. |
| Nombre de 121 caracteres después de eliminar espacios exteriores | Se rechaza con `EMP_NOMBRE_INVALIDO`. |

### EMP-BR-002 — Punto geográfico completo

- **Estado:** Aprobado
- **Origen:** `EMP-Q-005`
- **Tipo:** Invariante
- **Regla:** La ubicación geográfica es opcional; si se informa, debe contener latitud entre -90 y 90 y longitud entre -180 y 180.
- **Si se incumple:** se rechaza la operación con `EMP_UBICACION_GEOGRAFICA_INVALIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| No se informa punto geográfico | Se acepta. |
| Latitud `-27.36` y longitud `-55.90` | Se acepta. |
| Se informa solo latitud o un valor queda fuera de rango | Se rechaza con `EMP_UBICACION_GEOGRAFICA_INVALIDA`. |

### EMP-BR-003 — CUIT opcional de once dígitos

- **Estado:** Aprobado
- **Origen:** `B-04`, `EMP-Q-004`, `EMP-Q-011`
- **Tipo:** Validación
- **Regla:** El CUIT es opcional y, cuando se informa, se registra como una cadena de once dígitos sin espacios ni separadores, sin comprobar el dígito verificador ni exigir unicidad.
- **Si se incumple:** se rechaza el formato con `EMP_CUIT_INVALIDO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| No se informa CUIT | Se acepta. |
| Once dígitos, incluso si se repiten en otra Empresa o no cumplen el verificador | Se acepta. |
| Once dígitos con guiones, espacios o una cantidad distinta de once | Se rechaza con `EMP_CUIT_INVALIDO`. |

### EMP-BR-004 — Transiciones de estado

- **Estado:** Aprobado
- **Origen:** `EMP-Q-002`
- **Tipo:** Transición
- **Regla:** Una Empresa se crea `ACTIVA`; puede pasar de `ACTIVA` a `SUSPENDIDA`, de `SUSPENDIDA` a `ACTIVA`, y de `ACTIVA` o `SUSPENDIDA` a `CERRADA`. Una Empresa `CERRADA` no cambia nuevamente de estado.
- **Si se incumple:** se rechaza la operación con `EMP_TRANSICION_ESTADO_INVALIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Reactivar una Empresa suspendida | Se acepta y queda activa. |
| Cerrar una Empresa activa | Se acepta y queda cerrada. |
| Reactivar una Empresa cerrada | Se rechaza con `EMP_TRANSICION_ESTADO_INVALIDA`. |

### EMP-BR-005 — Acceso según estado

- **Estado:** Aprobado
- **Origen:** `EMP-Q-002`
- **Tipo:** Invariante
- **Regla:** Solo una Empresa `ACTIVA` puede utilizarse como contexto de operaciones de negocio; la suspensión o cierre conserva todos sus datos e historial.
- **Si se incumple:** se rechaza la operación con `EMP_NO_HABILITADA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Una Cuenta de Empresa activa intenta operar en una Empresa activa | La condición de estado de Empresa se cumple. |
| Un SuperAdministrador consulta los metadatos de una Empresa suspendida | Se permite si posee el permiso de plataforma. |
| Un Usuario intenta una operación de negocio en una Empresa suspendida o cerrada | Se rechaza con `EMP_NO_HABILITADA`. |

### EMP-BR-006 — Configuración general inicial

- **Estado:** Aprobado
- **Origen:** `EMP-Q-007`
- **Tipo:** Invariante
- **Regla:** Toda Empresa tiene país ISO 3166-1 alfa-2, zona horaria IANA de hasta 255 caracteres y moneda ISO 4217; al crearla sin datos adicionales se asignan `AR`, `America/Argentina/Buenos_Aires` y `ARS`.
- **Si se incumple:** se rechaza la operación con `EMP_CONFIGURACION_GENERAL_INVALIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Se crea una Empresa indicando solo el nombre | Se asignan los tres valores iniciales. |
| Se cambia a otra zona horaria IANA válida | Se acepta. |
| Se intenta guardar una zona horaria o moneda inexistente | Se rechaza con `EMP_CONFIGURACION_GENERAL_INVALIDA`. |

### EMP-BR-007 — Alcance del Administrador

- **Estado:** Aprobado
- **Origen:** `EMP-Q-001`; relacionado con `B-01` y `B-06`
- **Tipo:** Autorización de dominio
- **Regla:** Un Administrador solo puede consultar o intentar modificar la Empresa de su `ContextoSolicitud`; no puede indicar otra Empresa como destino de la operación. La habilitación de la modificación según el estado se determina mediante `EMP-BR-014`.
- **Si se incumple:** se rechaza la operación con `EMP_ACCESO_DENEGADO` sin revelar datos de otra Empresa.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Un Administrador consulta su propia Empresa | Se acepta. |
| Un Administrador modifica la configuración general de su propia Empresa | Se cumple esta regla; además debe cumplirse `EMP-BR-014`. |
| Un Administrador intenta consultar o modificar otra Empresa | Se rechaza con `EMP_ACCESO_DENEGADO`. |

### EMP-BR-008 — Conservación de la Empresa

- **Estado:** Aprobado
- **Origen:** `EMP-Q-009`
- **Tipo:** Invariante
- **Regla:** Una Empresa no se elimina físicamente; el cierre irreversible conserva su identidad, relaciones e historial.
- **Si se incumple:** se rechaza la operación con `EMP_ELIMINACION_NO_PERMITIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Se cierra una Empresa sin actividad operativa | Se conserva en estado cerrada. |
| Se consulta posteriormente su historial autorizado | Continúa disponible. |
| Se solicita eliminar físicamente la Empresa | Se rechaza con `EMP_ELIMINACION_NO_PERMITIDA`. |

### EMP-BR-009 — Asignación comercial contemplada

- **Estado:** Aprobado
- **Origen:** `B-03`, `EMP-Q-008`
- **Tipo:** Invariante
- **Regla:** Toda Empresa debe tener una asignación comercial vigente o provisional administrada fuera de `EMP`.
- **Si se incumple:** se rechaza la operación con `EMP_ASIGNACION_COMERCIAL_REQUERIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Empresa con asignación provisional mientras `SUS` es futuro | Se acepta. |
| Empresa con Suscripción vigente cuando `SUS` esté implementado | Se acepta. |
| Empresa sin ninguna asignación confirmada | Se rechaza con `EMP_ASIGNACION_COMERCIAL_REQUERIDA`. |

### EMP-BR-010 — Textos descriptivos normalizados

- **Estado:** Aprobado
- **Origen:** `EMP-Q-011`
- **Tipo:** Validación
- **Regla:** Los textos opcionales eliminan espacios exteriores, conservan los interiores y, si quedan vacíos, se consideran ausentes. `responsableNombre` admite hasta 120 caracteres, `ubicacionTexto` hasta 500 y `descripcionActividad` hasta 2000.
- **Si se incumple:** se rechaza la operación con `EMP_TEXTO_INVALIDO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Se informa ` responsable ` y una ubicación de 500 caracteres | Se aceptan; el responsable se conserva como `responsable`. |
| Un texto opcional contiene solo espacios | Se considera ausente. |
| La descripción de actividad tiene 2001 caracteres | Se rechaza con `EMP_TEXTO_INVALIDO`. |

### EMP-BR-011 — Formato del alias de Empresa

- **Estado:** Aprobado
- **Origen:** `EMP-Q-013`
- **Tipo:** Invariante
- **Regla:** Toda Empresa debe tener un alias de 3 a 63 caracteres formado por letras minúsculas, dígitos o guiones, que comience y termine con letra o dígito.
- **Si se incumple:** se rechaza la operación con `EMP_ALIAS_INVALIDO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Alias `yerba-norte` | Se acepta. |
| Alias de 3 o de 63 caracteres con formato válido | Se acepta. |
| Alias `-Yerba Norte-`, de 2 caracteres o de 64 caracteres | Se rechaza con `EMP_ALIAS_INVALIDO`. |

### EMP-BR-012 — Alias único y no reutilizable

- **Estado:** Aprobado
- **Origen:** `EMP-Q-013`
- **Tipo:** Invariante
- **Regla:** El alias identifica globalmente a una única Empresa y no puede asignarse nuevamente, aunque esa Empresa esté cerrada.
- **Si se incumple:** se rechaza la operación con `EMP_ALIAS_NO_DISPONIBLE`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Alias que nunca fue asignado | Se acepta. |
| Alias perteneciente a la misma Empresa | Continúa identificándola. |
| Alias de una Empresa activa, suspendida o cerrada usado para una Empresa nueva | Se rechaza con `EMP_ALIAS_NO_DISPONIBLE`. |

### EMP-BR-013 — Alias inmutable

- **Estado:** Aprobado
- **Origen:** `EMP-Q-013`
- **Tipo:** Invariante
- **Regla:** El alias asignado al registrar una Empresa no puede modificarse durante su ciclo de vida.
- **Si se incumple:** se rechaza la operación con `EMP_ALIAS_INMUTABLE`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Se modifican datos de la Empresa sin indicar un alias diferente | Se acepta si las demás reglas se cumplen. |
| Se conserva el alias original al actualizar | Se acepta. |
| Se intenta reemplazar el alias | Se rechaza con `EMP_ALIAS_INMUTABLE`. |

### EMP-BR-014 — Modificación según estado de Empresa

- **Estado:** Aprobado
- **Origen:** `EMP-Q-012`
- **Tipo:** Autorización de dominio
- **Regla:** Los datos y la configuración general de una Empresa `ACTIVA` pueden modificarse según la matriz de permisos; si está `SUSPENDIDA`, solo puede modificarlos el SuperAdministrador; si está `CERRADA`, quedan inmutables para todos los actores.
- **Si se incumple:** se rechaza la operación con `EMP_MODIFICACION_NO_PERMITIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Un Administrador modifica su Empresa activa | Se acepta si las demás reglas se cumplen. |
| Un SuperAdministrador corrige datos de una Empresa suspendida | Se acepta. |
| Un Administrador modifica una Empresa suspendida o cualquier actor modifica una cerrada | Se rechaza con `EMP_MODIFICACION_NO_PERMITIDA`. |

## 2. Requerimientos funcionales

### EMP-REQ-001 — Registrar Empresa

- **Estado:** Aprobado
- **Origen:** `EMP-Q-001`, `EMP-Q-003`, `EMP-Q-004`, `EMP-Q-005`, `EMP-Q-006`, `EMP-Q-008`, `EMP-Q-010`, `EMP-Q-011`, `EMP-Q-013`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir registrar una Empresa con nombre y alias obligatorios y los datos opcionales aprobados.
- **Reglas que aplica:** `EMP-BR-001`, `EMP-BR-002`, `EMP-BR-003`, `EMP-BR-004`, `EMP-BR-006`, `EMP-BR-009`, `EMP-BR-010`, `EMP-BR-011`, `EMP-BR-012`, `EMP-BR-013`.

### EMP-REQ-002 — Consultar Empresa

- **Estado:** Aprobado
- **Origen:** `EMP-Q-001`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir consultar los datos y el estado de una Empresa dentro del alcance autorizado.
- **Reglas que aplica:** `EMP-BR-007`.

### EMP-REQ-003 — Listar Empresas

- **Estado:** Aprobado
- **Origen:** `EMP-Q-001`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir al actor de plataforma autorizado listar Empresas con filtros y paginación conforme a `convenciones.md` §3.
- **Reglas que aplica:** Ninguna adicional.

### EMP-REQ-004 — Modificar Empresa

- **Estado:** Aprobado
- **Origen:** `B-04`; decisiones de `EMP-Q-001`, `EMP-Q-003`, `EMP-Q-004`, `EMP-Q-005`, `EMP-Q-006`, `EMP-Q-010`, `EMP-Q-011`, `EMP-Q-012`, `EMP-Q-013`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir modificar el nombre y los datos opcionales de una Empresa dentro del alcance autorizado, sin modificar su alias.
- **Reglas que aplica:** `EMP-BR-001`, `EMP-BR-002`, `EMP-BR-003`, `EMP-BR-007`, `EMP-BR-010`, `EMP-BR-013`, `EMP-BR-014`.

### EMP-REQ-005 — Suspender Empresa

- **Estado:** Aprobado
- **Origen:** `EMP-Q-001`, `EMP-Q-002`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir suspender temporalmente una Empresa sin eliminar su historial.
- **Reglas que aplica:** `EMP-BR-004`, `EMP-BR-005`, `EMP-BR-008`.

### EMP-REQ-006 — Reactivar Empresa

- **Estado:** Aprobado
- **Origen:** `EMP-Q-001`, `EMP-Q-002`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir reactivar una Empresa suspendida.
- **Reglas que aplica:** `EMP-BR-004`, `EMP-BR-005`.

### EMP-REQ-007 — Cerrar Empresa

- **Estado:** Aprobado
- **Origen:** `EMP-Q-001`, `EMP-Q-002`, `EMP-Q-009`
- **Prioridad:** Should
- **Requerimiento:** El sistema debe permitir cerrar irreversiblemente una Empresa conservando sus datos e historial.
- **Reglas que aplica:** `EMP-BR-004`, `EMP-BR-005`, `EMP-BR-008`.

### EMP-REQ-008 — Modificar configuración general

- **Estado:** Aprobado
- **Origen:** `B-04`; alcance definido en `EMP-Q-007` y estados definidos en `EMP-Q-012`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir modificar la configuración general de una Empresa dentro del alcance autorizado.
- **Reglas que aplica:** `EMP-BR-006`, `EMP-BR-007`, `EMP-BR-014`.

## 3. Dependencias con otros módulos

### EMP-DEP-001 — Identidad y acceso — Contexto de autorización

- **Estado:** Aprobado
- **Origen:** `B-01`, `B-05`, `B-06`
- **Módulo:** `ACC` (Identidad y acceso)
- **Dirección:** Este módulo consume
- **Qué:** `ContextoSolicitud` y permisos vigentes. La representación del responsable referencia `EMP-Q-003`, `EMP-Q-010` y el atributo definido en `EMP-ENT-001`; no requiere datos de ACC.
- **Para qué:** `EMP-REQ-002`, `EMP-REQ-004`, `EMP-REQ-008`.

### EMP-DEP-002 — Suscripciones — Asignación comercial

- **Estado:** Aprobado
- **Origen:** `B-03`, `EMP-Q-008`
- **Módulo:** `SUS` (Suscripciones)
- **Dirección:** Este módulo consume
- **Qué:** confirmación de que la Empresa posee una asignación comercial vigente o provisional.
- **Para qué:** `EMP-REQ-001`.

### EMP-DEP-003 — Identidad y acceso — Identidad, alias y estado de Empresa

- **Estado:** Aprobado
- **Origen:** `B-03`, `B-05`, `B-06`, `EMP-Q-013`
- **Módulo:** `ACC` (Identidad y acceso)
- **Dirección:** Este módulo provee
- **Qué:** identidad, alias inmutable y estado vigente de la Empresa, sin exponer sus demás datos administrativos u operativos.
- **Para qué:** `EMP-BR-005`.

### EMP-DEP-004 — Economía — Configuración económica

- **Estado:** Aprobado
- **Origen:** `B-04`, `EMP-Q-007`
- **Módulo:** `ECO` (Economía)
- **Dirección:** Este módulo provee
- **Qué:** identidad de Empresa para que Economía mantenga formas de pago y demás configuración económica propia.
- **Para qué:** delimitar `EMP-REQ-008`.

### EMP-DEP-005 — Labores — Configuración de labores

- **Estado:** Aprobado
- **Origen:** `B-04`, `EMP-Q-007`
- **Módulo:** `LAB` (Labores)
- **Dirección:** Este módulo provee
- **Qué:** identidad de Empresa para que Labores mantenga reglas de registro y montos por tareas que le correspondan.
- **Para qué:** delimitar `EMP-REQ-008`.

## 4. Fuera de alcance

- Usuarios, Cuentas de Empresa, roles, permisos, Sesiones y Dispositivos pertenecen a `ACC` — Origen: `B-03`, `B-05`, `B-06`.
- Planes, Suscripciones, límites comerciales y facturación SaaS pertenecen a `SUS` — Origen: `B-03`.
- Empleados y Capataces pertenecen a `PER`; una Empresa no los modela como Usuarios — Origen: `B-02`, `B-03` y glosario aprobado.
- Chacras, Lotes y su geografía productiva pertenecen a `TER`; la ubicación de Empresa es solo una referencia administrativa — Origen: `EMP-Q-005`.
- Formas de pago y configuración económica pertenecen a `ECO`; registro y montos de labores pertenecen a `LAB` — Origen: `EMP-Q-007`.
- La Empresa no contiene una bolsa genérica de configuraciones ni código ejecutable configurable — Origen: `EMP-Q-007`.
