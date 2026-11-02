---
type: requirements
module: "TER"
status: Propuesto
owner: "Analista"
---

# Territorio — Requerimientos

## Alcance de esta entrega

Esta especificación cubre únicamente Chacras dentro de TER, según `B-01` y `TER-Q-001`. Las decisiones respondidas son el origen de la redacción; los ítems permanecen Propuesto hasta su revisión y aprobación. Los controles transversales de Empresa y soporte se referencian, sin redefinirlos.

## 1. Reglas de negocio

### TER-BR-001 — Nombre obligatorio

- **Estado:** Propuesto
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

- **Estado:** Propuesto
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

- **Estado:** Propuesto
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

- **Estado:** Propuesto
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

- **Estado:** Propuesto
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

- **Estado:** Propuesto
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

- **Estado:** Propuesto
- **Origen:** `TER-Q-005`
- **Tipo:** Invariante
- **Regla:** El nombre corto de una Chacra no puede repetirse en otra Chacra de la misma Empresa.
- **Si se incumple:** se rechaza con `TER_NOMBRE_CORTO_DUPLICADO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Nombre corto no utilizado en la Empresa | Se acepta. |
| El mismo nombre corto existe en otra Empresa | Se acepta. |
| El nombre corto pertenece a otra Chacra de la misma Empresa | Se rechaza con TER_NOMBRE_CORTO_DUPLICADO. |

## 2. Requerimientos funcionales

### TER-REQ-001 — Registrar Chacra

- **Estado:** Propuesto
- **Origen:** `B-01`, `TER-Q-002`, `TER-Q-003`, `TER-Q-004`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir registrar una Chacra asociada a la Empresa del contexto autorizado sin exigir la creación de Lotes.
- **Reglas que aplica:** `TER-BR-001`, `TER-BR-002`, `TER-BR-003`, `TER-BR-005`, `TER-BR-007`.

### TER-REQ-002 — Consultar Chacra

- **Estado:** Propuesto
- **Origen:** `TER-Q-003`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir consultar una Chacra dentro del alcance autorizado.
- **Reglas que aplica:** `TER-BR-004`.

### TER-REQ-003 — Listar Chacras

- **Estado:** Propuesto
- **Origen:** `TER-Q-003`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir listar Chacras dentro del alcance autorizado, aplicando la paginación y el orden de convenciones.md §3.2 y §3.3.
- **Reglas que aplica:** `TER-BR-004`.

### TER-REQ-004 — Modificar Chacra

- **Estado:** Propuesto
- **Origen:** `TER-Q-003`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir modificar los datos descriptivos de una Chacra dentro del alcance autorizado, con control de versión según convenciones.md §3.5.
- **Reglas que aplica:** `TER-BR-001`, `TER-BR-002`, `TER-BR-007`.

### TER-REQ-005 — Inactivar Chacra

- **Estado:** Propuesto
- **Origen:** `TER-Q-003`, `TER-Q-006`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir inactivar una Chacra conservando los registros que la referencian.
- **Reglas que aplica:** `TER-BR-005`, `TER-BR-006`.

## 3. Dependencias con otros módulos

### TER-DEP-001 — Empresas — Contexto de Empresa propietaria

- **Estado:** Propuesto
- **Origen:** `B-01`, `TER-Q-003`; arquitectura.md §13.4
- **Módulo:** `EMP` (Empresas)
- **Dirección:** Este módulo consume
- **Qué:** identidad y habilitación de la Empresa obtenida del contexto autorizado. No copia sus datos administrativos ni permite cambiar la pertenencia mediante los datos descriptivos de una Chacra.
- **Para qué:** `TER-BR-003`, `TER-REQ-001` a `TER-REQ-005`.

### TER-DEP-002 — Identidad y acceso — Actor, permisos y asignaciones

- **Estado:** Propuesto
- **Origen:** `TER-Q-003`; arquitectura.md §13
- **Módulo:** `ACC` (Identidad y acceso)
- **Dirección:** Este módulo consume
- **Qué:** contexto vigente, permisos y alcance de Chacras asignadas al Capataz; identificación explícita del soporte conforme a `ACC-BR-011`. Esta especificación no inventa un circuito para administrar esas asignaciones ni sus contratos técnicos; deben acordarse antes de planificar la consulta del Capataz.
- **Para qué:** `TER-BR-004`, `TER-REQ-001` a `TER-REQ-005`.

## 4. Fuera de alcance

- Lotes, delimitación, geometrías y superficies: se especificarán después dentro de TER; origen `B-01`, `TER-Q-001`, `TER-Q-004`.
- Cultivos, implantaciones y cosechas conservan los dueños registrados en arquitectura.md; no se agregan como atributos de Chacra por anticipado — origen `B-01` y arquitectura.
- Reactivación de Chacras: definición posterior según `TER-Q-006`.
- Ubicación detallada, domicilio o punto geográfico de Chacra: no se definieron sus campos en el brief actual; no se incorporan automáticamente desde propuestas generales.
- El responsable es un dato descriptivo; no se genera una Cuenta de Empresa, permiso o asignación por informarlo — origen `B-01`.
- No se habilita borrado físico como operación alternativa a la inactivación: referencia `TER-BR-006`.
