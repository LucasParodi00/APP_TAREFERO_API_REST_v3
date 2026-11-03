---
type: use-cases
module: "TER"
status: Aprobado
owner: "Analista"
---

# Territorio — Casos de uso

## 1. Actores

| Actor | Tipo | Origen |
|---|---|---|
| Administrador | Rol | `TER-Q-003` |
| Capataz | Rol | `TER-Q-003` |
| SuperAdministrador | Rol | `TER-Q-003` |

## 2. Matriz de permisos

Las asignaciones de esta matriz concretan `TER-Q-003`, `B-12` y `TER-Q-019`. El contexto de Empresa se rige por arquitectura.md §13.4 y el soporte por `ACC-BR-011`. El alcance autorizado de Chacras del Capataz pertenece a `ACC` según `TER-Q-008` y llega por `TER-DEP-002`; `TER-BR-022` lo extiende a la consulta de todos los Lotes contenidos, sin permitirle administrar geometrías. Esta matriz no incorpora el circuito para administrar asignaciones.

| Caso de uso | Administrador | Capataz | SuperAdministrador | Condición |
|---|:---:|:---:|:---:|---|
| `TER-UC-001` | Sí | No | Cond. | Soporte: `ACC-BR-011` |
| `TER-UC-002` | Sí | Cond. | Cond. | Capataz: `TER-BR-004`; soporte: `ACC-BR-011` |
| `TER-UC-003` | Sí | Cond. | Cond. | Capataz: `TER-BR-004`; soporte: `ACC-BR-011` |
| `TER-UC-004` | Sí | No | Cond. | Soporte: `ACC-BR-011` |
| `TER-UC-005` | Sí | No | Cond. | Soporte: `ACC-BR-011` |
| `TER-UC-006` | Sí | No | Cond. | Soporte: `ACC-BR-011` |
| `TER-UC-007` | Sí | Cond. | Cond. | Capataz: `TER-BR-022`; soporte: `ACC-BR-011` |
| `TER-UC-008` | Sí | Cond. | Cond. | Capataz: `TER-BR-022`; soporte: `ACC-BR-011` |
| `TER-UC-009` | Sí | No | Cond. | Soporte: `ACC-BR-011` |
| `TER-UC-010` | Sí | No | Cond. | Soporte: `ACC-BR-011` |
| `TER-UC-011` | Sí | No | Cond. | Soporte: `ACC-BR-011` |
| `TER-UC-012` | Sí | No | Cond. | Soporte: `ACC-BR-011` |
| `TER-UC-013` | Sí | Cond. | Cond. | Capataz: `TER-BR-022`; soporte: `ACC-BR-011` |

Los roles no incluidos no reciben permisos de Chacras ni Lotes por esta especificación.

## 3. Casos de uso

### TER-UC-001 — Registrar Chacra

- **Estado:** Aprobado
- **Actor:** Administrador; SuperAdministrador mediante soporte auditado.
- **Objetivo:** Registrar Chacra dentro del alcance autorizado.
- **Requerimientos:** `TER-REQ-001`.
- **Reglas:** `TER-BR-001`, `TER-BR-002`, `TER-BR-003`, `TER-BR-005`, `TER-BR-007`.

**Precondiciones**

- El actor está autenticado, posee permiso de registro y tiene una Empresa habilitada en su contexto. Para soporte se aplica ACC-BR-011.

**Flujo principal**

1. El actor solicita registrar una Chacra indicando los datos descriptivos.
2. El sistema comprueba el permiso y el contexto de TER-DEP-001 y TER-DEP-002 según arquitectura.md §13.4.
3. El sistema valida TER-BR-001, TER-BR-002 y TER-BR-003.
4. El sistema valida TER-BR-007 dentro de la Empresa propietaria con el control concurrente de convenciones.md §3.5.
5. El sistema registra la Chacra aplicando TER-BR-005 y conserva la auditoría de la fundación.
6. El sistema informa la Chacra registrada y su versión.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso o solicita otra Empresa fuera de su contexto | 2 | Se rechaza sin revelar datos ajenos ni modificar la Chacra | `TER_ACCESO_DENEGADO` |
| Soporte sin el contexto requerido por `ACC-BR-011` | 2 | Se rechaza sin ejecutar la operación | `ACC_CONTEXTO_SOPORTE_REQUERIDO` |
| No se cumple `TER-BR-001` | 3 | Se rechaza sin confirmar cambios parciales | `TER_NOMBRE_OBLIGATORIO` |
| No se cumple `TER-BR-002` | 3 | Se rechaza sin confirmar cambios parciales | `TER_NOMBRE_CORTO_OBLIGATORIO` |
| No se cumple `TER-BR-003` | 3 | Se rechaza sin confirmar cambios parciales | `TER_EMPRESA_REQUERIDA` |
| No se cumple `TER-BR-007` | 4 | Se rechaza sin confirmar cambios parciales | `TER_NOMBRE_CORTO_DUPLICADO` |

**Postcondiciones**

- Existe una Chacra en la Empresa autorizada; no se crea ni se exige ningún Lote.

**Escenarios de aceptación**

```gherkin
@TER-UC-001 @AC-01
Escenario: Registrar una Chacra sin Lotes
  Dado un Administrador autorizado y datos descriptivos válidos
  Cuando registra una Chacra sin Lotes
  Entonces la Chacra pertenece a su Empresa, se aplica TER-BR-005 y no se exige crear Lotes

@TER-UC-001 @AC-02
Escenario: Omitir responsable opcional
  Dado un actor autorizado y los datos obligatorios válidos
  Cuando registra la Chacra sin responsable
  Entonces la Chacra queda registrada sin crear una persona ni una cuenta de acceso

@TER-UC-001 @AC-03
Escenario: Rechazar nombre ausente
  Dado un actor autorizado
  Cuando solicita registrar una Chacra sin nombre
  Entonces se rechaza con TER_NOMBRE_OBLIGATORIO y no se registra la Chacra

@TER-UC-001 @AC-04
Escenario: Rechazar nombre corto ausente
  Dado un actor autorizado
  Cuando solicita registrar una Chacra sin nombre corto
  Entonces se rechaza con TER_NOMBRE_CORTO_OBLIGATORIO y no se registra la Chacra

@TER-UC-001 @AC-05
Escenario: Rechazar ausencia de Empresa propietaria
  Dado un contexto sin Empresa propietaria validada
  Cuando se intenta registrar la Chacra
  Entonces se rechaza con TER_EMPRESA_REQUERIDA y no se registra la Chacra

@TER-UC-001 @AC-06
Escenario: Rechazar nombre corto repetido en la Empresa
  Dado otra Chacra de la misma Empresa con un nombre corto equivalente según TER-BR-007
  Cuando se solicita registrar una Chacra variando mayúsculas, tildes o espacios
  Entonces se rechaza con TER_NOMBRE_CORTO_DUPLICADO

@TER-UC-001 @AC-07
Escenario: Admitir el mismo nombre corto en otra Empresa
  Dado una Chacra de Empresa A con un nombre corto ya registrado
  Cuando un Administrador de Empresa B registra una Chacra con ese nombre corto
  Entonces el nombre corto de Empresa A no impide el registro en Empresa B

@TER-UC-001 @AC-08
Escenario: Denegar operación sin permiso
  Dado un Capataz que no posee permiso para esta operación
  Cuando solicita registrar chacra
  Entonces se rechaza con TER_ACCESO_DENEGADO y no se modifica la Chacra

@TER-UC-001 @AC-09
Escenario: Denegar acceso cruzado entre Empresas
  Dado un Administrador de Empresa A y una Chacra o destino de Empresa B
  Cuando solicita registrar chacra fuera de su contexto
  Entonces se rechaza con TER_ACCESO_DENEGADO sin revelar datos de Empresa B

@TER-UC-001 @AC-10
Escenario: Exigir contexto explícito de soporte
  Dado un SuperAdministrador sin motivo y Empresa de soporte autorizados
  Cuando solicita registrar chacra mediante soporte
  Entonces se rechaza con ACC_CONTEXTO_SOPORTE_REQUERIDO

```

### TER-UC-002 — Consultar Chacra

- **Estado:** Aprobado
- **Actor:** Administrador; Capataz; SuperAdministrador mediante soporte auditado.
- **Objetivo:** Consultar Chacra dentro del alcance autorizado.
- **Requerimientos:** `TER-REQ-002`.
- **Reglas:** `TER-BR-004`, `TER-BR-008`.

**Precondiciones**

- El actor está autenticado y posee permiso de consulta en el contexto de su Empresa o soporte.

**Flujo principal**

1. El actor solicita consultar una Chacra.
2. El sistema comprueba el permiso y el contexto según TER-DEP-001 y TER-DEP-002.
3. Si el actor es Capataz, el sistema aplica TER-BR-004.
4. El sistema obtiene la Chacra dentro del alcance autorizado.
5. El sistema informa la ficha, su estado y su versión aplicando TER-BR-008 cuando esté INACTIVA, sin modificar el registro.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso o solicita otra Empresa fuera de su contexto | 2 | Se rechaza sin revelar datos ajenos ni modificar la Chacra | `TER_ACCESO_DENEGADO` |
| Soporte sin el contexto requerido por `ACC-BR-011` | 2 | Se rechaza sin ejecutar la operación | `ACC_CONTEXTO_SOPORTE_REQUERIDO` |
| No se cumple `TER-BR-004` | 3 | Se rechaza sin confirmar cambios parciales | `TER_CHACRA_FUERA_DE_ALCANCE` |
| La Chacra no existe dentro del alcance autorizado | 4 | Se rechaza sin confirmar cambios parciales | `TER_CHACRA_NO_ENCONTRADA` |

**Postcondiciones**

- El actor obtiene únicamente la Chacra autorizada, con su estado y datos descriptivos.

**Escenarios de aceptación**

```gherkin
@TER-UC-002 @AC-01
Escenario: Consultar una Chacra propia
  Dado un Administrador autorizado de la Empresa propietaria
  Cuando solicita consultar su Chacra
  Entonces recibe la ficha y la versión de esa Chacra

@TER-UC-002 @AC-02
Escenario: Capataz consulta una Chacra asignada
  Dado un Capataz con la Chacra incluida en su alcance vigente
  Cuando solicita consultar esa Chacra
  Entonces recibe su ficha

@TER-UC-002 @AC-03
Escenario: Capataz consulta una Chacra no asignada
  Dado un Capataz sin asignación a la Chacra solicitada
  Cuando solicita consultarla
  Entonces se rechaza con TER_CHACRA_FUERA_DE_ALCANCE sin revelar su ficha

@TER-UC-002 @AC-04
Escenario: Chacra inexistente
  Dado un actor con permiso de consulta
  Cuando solicita una Chacra inexistente dentro de su alcance
  Entonces se informa TER_CHACRA_NO_ENCONTRADA

@TER-UC-002 @AC-05
Escenario: Consultar historial de una Chacra inactiva
  Dado un actor con permiso y alcance de consulta sobre una Chacra inactiva
  Cuando solicita su ficha
  Entonces recibe los datos conservados y el estado de la Chacra según TER-BR-008

@TER-UC-002 @AC-06
Escenario: Denegar operación sin permiso
  Dado un Empleado sin permiso de consulta de Chacras
  Cuando solicita consultar chacra
  Entonces se rechaza con TER_ACCESO_DENEGADO y no se modifica la Chacra

@TER-UC-002 @AC-07
Escenario: Denegar acceso cruzado entre Empresas
  Dado un Administrador de Empresa A y una Chacra o destino de Empresa B
  Cuando solicita consultar chacra fuera de su contexto
  Entonces se rechaza con TER_ACCESO_DENEGADO sin revelar datos de Empresa B

@TER-UC-002 @AC-08
Escenario: Exigir contexto explícito de soporte
  Dado un SuperAdministrador sin motivo y Empresa de soporte autorizados
  Cuando solicita consultar chacra mediante soporte
  Entonces se rechaza con ACC_CONTEXTO_SOPORTE_REQUERIDO

```

### TER-UC-003 — Listar Chacras

- **Estado:** Aprobado
- **Actor:** Administrador; Capataz; SuperAdministrador mediante soporte auditado.
- **Objetivo:** Listar Chacras dentro del alcance autorizado.
- **Requerimientos:** `TER-REQ-003`.
- **Reglas:** `TER-BR-004`.

**Precondiciones**

- El actor está autenticado y posee permiso de consulta.

**Flujo principal**

1. El actor solicita un listado de Chacras con paginación, filtro opcional de estado y orden admitidos.
2. El sistema comprueba el permiso y el contexto mediante TER-DEP-001 y TER-DEP-002.
3. El sistema restringe el conjunto por Empresa y, para Capataz, aplica TER-BR-004 como filtro del alcance.
4. El sistema incluye Chacras ACTIVAS e INACTIVAS cuando no se indica estado, o aplica el filtro solicitado, y ejecuta el listado según convenciones.md §3.2 y §3.3 sobre el conjunto autorizado.
5. El sistema informa la página y sus metadatos.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso o solicita otra Empresa fuera de su contexto | 2 | Se rechaza sin revelar datos ajenos ni modificar la Chacra | `TER_ACCESO_DENEGADO` |
| Soporte sin el contexto requerido por `ACC-BR-011` | 2 | Se rechaza sin ejecutar la operación | `ACC_CONTEXTO_SOPORTE_REQUERIDO` |
| Paginación, filtros u orden no admitidos | 4 | Se rechaza sin confirmar cambios parciales | `TER_CONSULTA_INVALIDA` |

**Postcondiciones**

- La página y su total se calculan únicamente sobre Chacras autorizadas y sobre el filtro de estado solicitado; sin filtro incluyen ACTIVAS e INACTIVAS. No se modifica estado.

**Escenarios de aceptación**

```gherkin
@TER-UC-003 @AC-01
Escenario: Listar por Empresa
  Dado un Administrador autenticado y Chacras activas e inactivas de distintas Empresas
  Cuando solicita una página de Chacras sin filtro de estado
  Entonces la página y el total incluyen las Chacras activas e inactivas únicamente de su Empresa

@TER-UC-003 @AC-02
Escenario: Filtrar por asignación del Capataz
  Dado un Capataz con asignación solo a una parte de las Chacras de su Empresa
  Cuando solicita el listado
  Entonces la página y el total consideran exclusivamente las Chacras asignadas

@TER-UC-003 @AC-03
Escenario: Capataz sin asignaciones
  Dado un Capataz sin Chacras asignadas
  Cuando solicita el listado
  Entonces recibe una página vacía y total cero

@TER-UC-003 @AC-04
Escenario: Rechazar paginación inválida
  Dado un actor autorizado
  Cuando solicita un límite superior al permitido por convenciones
  Entonces se rechaza con TER_CONSULTA_INVALIDA

@TER-UC-003 @AC-05
Escenario: Denegar operación sin permiso
  Dado un Empleado sin permiso de consulta de Chacras
  Cuando solicita listar chacras
  Entonces se rechaza con TER_ACCESO_DENEGADO y no se modifica la Chacra

@TER-UC-003 @AC-06
Escenario: Denegar acceso cruzado entre Empresas
  Dado un Administrador de Empresa A y una Chacra o destino de Empresa B
  Cuando solicita listar chacras fuera de su contexto
  Entonces se rechaza con TER_ACCESO_DENEGADO sin revelar datos de Empresa B

@TER-UC-003 @AC-07
Escenario: Exigir contexto explícito de soporte
  Dado un SuperAdministrador sin motivo y Empresa de soporte autorizados
  Cuando solicita listar chacras mediante soporte
  Entonces se rechaza con ACC_CONTEXTO_SOPORTE_REQUERIDO

@TER-UC-003 @AC-08
Escenario: Filtrar el listado por estado
  Dado un actor autorizado con Chacras activas e inactivas dentro de su alcance
  Cuando solicita el listado filtrado por estado INACTIVA
  Entonces la página y el total incluyen únicamente Chacras inactivas de su alcance

```

### TER-UC-004 — Modificar Chacra

- **Estado:** Aprobado
- **Actor:** Administrador; SuperAdministrador mediante soporte auditado.
- **Objetivo:** Modificar Chacra dentro del alcance autorizado.
- **Requerimientos:** `TER-REQ-004`.
- **Reglas:** `TER-BR-001`, `TER-BR-002`, `TER-BR-007`, `TER-BR-008`.

**Precondiciones**

- La Chacra existe dentro del alcance y el actor conoce su versión.

**Flujo principal**

1. El actor solicita modificar los datos descriptivos de una Chacra indicando la versión conocida.
2. El sistema comprueba el permiso y el contexto mediante TER-DEP-001 y TER-DEP-002.
3. El sistema valida TER-BR-001, TER-BR-002, TER-BR-007 y TER-BR-008; la comprobación de unicidad excluye la propia Chacra.
4. El sistema verifica la versión conforme a convenciones.md §3.5.
5. El sistema registra los cambios y la auditoría, incrementando la versión.
6. El sistema informa el resultado.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso o solicita otra Empresa fuera de su contexto | 2 | Se rechaza sin revelar datos ajenos ni modificar la Chacra | `TER_ACCESO_DENEGADO` |
| Soporte sin el contexto requerido por `ACC-BR-011` | 2 | Se rechaza sin ejecutar la operación | `ACC_CONTEXTO_SOPORTE_REQUERIDO` |
| No se cumple `TER-BR-001` | 3 | Se rechaza sin confirmar cambios parciales | `TER_NOMBRE_OBLIGATORIO` |
| No se cumple `TER-BR-002` | 3 | Se rechaza sin confirmar cambios parciales | `TER_NOMBRE_CORTO_OBLIGATORIO` |
| No se cumple `TER-BR-007` | 3 | Se rechaza sin confirmar cambios parciales | `TER_NOMBRE_CORTO_DUPLICADO` |
| No se cumple `TER-BR-008` | 3 | Se rechaza sin confirmar cambios parciales | `TER_OPERACION_INACTIVA_INVALIDA` |
| Versión anterior a la vigente | 4 | Se rechaza sin confirmar cambios parciales | `TER_VERSION_CONFLICTO` |
| Chacra inexistente dentro del alcance | 2 | Se rechaza sin confirmar cambios parciales | `TER_CHACRA_NO_ENCONTRADA` |

**Postcondiciones**

- Los datos descriptivos quedan actualizados sin cambiar la Empresa propietaria ni eliminar historial.

**Escenarios de aceptación**

```gherkin
@TER-UC-004 @AC-01
Escenario: Modificar datos con versión vigente
  Dado un Administrador autorizado con la versión vigente
  Cuando modifica los datos descriptivos válidos
  Entonces la Chacra conserva su identidad y Empresa y aumenta su versión

@TER-UC-004 @AC-02
Escenario: Conservar el propio nombre corto
  Dado una Chacra con nombre corto registrado y versión vigente
  Cuando se modifica otro dato manteniendo su nombre corto
  Entonces su propio nombre corto no produce TER_NOMBRE_CORTO_DUPLICADO

@TER-UC-004 @AC-03
Escenario: Rechazar nombre vacío
  Dado un actor autorizado con versión vigente
  Cuando intenta vaciar el nombre de la Chacra
  Entonces se rechaza con TER_NOMBRE_OBLIGATORIO sin modificarla

@TER-UC-004 @AC-04
Escenario: Rechazar nombre corto vacío
  Dado un actor autorizado con versión vigente
  Cuando intenta vaciar el nombre corto de la Chacra
  Entonces se rechaza con TER_NOMBRE_CORTO_OBLIGATORIO sin modificarla

@TER-UC-004 @AC-05
Escenario: Rechazar nombre corto de otra Chacra
  Dado otra Chacra de la misma Empresa con el nombre corto solicitado
  Cuando se intenta asignar ese nombre corto
  Entonces se rechaza con TER_NOMBRE_CORTO_DUPLICADO

@TER-UC-004 @AC-06
Escenario: Rechazar versión anterior
  Dado una Chacra modificada después de la versión conocida por el actor
  Cuando se intenta guardar con la versión anterior
  Entonces se rechaza con TER_VERSION_CONFLICTO sin sobrescribir el cambio vigente

@TER-UC-004 @AC-07
Escenario: Denegar operación sin permiso
  Dado un Capataz que no posee permiso para esta operación
  Cuando solicita modificar chacra
  Entonces se rechaza con TER_ACCESO_DENEGADO y no se modifica la Chacra

@TER-UC-004 @AC-08
Escenario: Denegar acceso cruzado entre Empresas
  Dado un Administrador de Empresa A y una Chacra o destino de Empresa B
  Cuando solicita modificar chacra fuera de su contexto
  Entonces se rechaza con TER_ACCESO_DENEGADO sin revelar datos de Empresa B

@TER-UC-004 @AC-09
Escenario: Exigir contexto explícito de soporte
  Dado un SuperAdministrador sin motivo y Empresa de soporte autorizados
  Cuando solicita modificar chacra mediante soporte
  Entonces se rechaza con ACC_CONTEXTO_SOPORTE_REQUERIDO

@TER-UC-004 @AC-10
Escenario: Corregir datos descriptivos de una Chacra inactiva
  Dado un Administrador autorizado y una Chacra INACTIVA con versión vigente
  Cuando corrige sus datos descriptivos válidos
  Entonces la modificación se registra, conserva el nombre corto reservado y la Chacra permanece INACTIVA

```

### TER-UC-005 — Inactivar Chacra

- **Estado:** Aprobado
- **Actor:** Administrador; SuperAdministrador mediante soporte auditado.
- **Objetivo:** Inactivar Chacra dentro del alcance autorizado.
- **Requerimientos:** `TER-REQ-005`.
- **Reglas:** `TER-BR-005`, `TER-BR-006`.

**Precondiciones**

- La Chacra existe y el actor conoce su versión vigente.

**Flujo principal**

1. El actor solicita inactivar una Chacra indicando la versión conocida.
2. El sistema comprueba el permiso y el contexto mediante TER-DEP-001 y TER-DEP-002.
3. El sistema valida TER-BR-005 y la versión según convenciones.md §3.5.
4. El sistema aplica TER-BR-006, registra el cambio de estado y conserva su auditoría e historial.
5. El sistema informa la Chacra y su nueva versión.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso o solicita otra Empresa fuera de su contexto | 2 | Se rechaza sin revelar datos ajenos ni modificar la Chacra | `TER_ACCESO_DENEGADO` |
| Soporte sin el contexto requerido por `ACC-BR-011` | 2 | Se rechaza sin ejecutar la operación | `ACC_CONTEXTO_SOPORTE_REQUERIDO` |
| No se cumple `TER-BR-005` | 3 | Se rechaza sin confirmar cambios parciales | `TER_TRANSICION_ESTADO_INVALIDA` |
| Versión anterior a la vigente | 3 | Se rechaza sin confirmar cambios parciales | `TER_VERSION_CONFLICTO` |
| Chacra inexistente dentro del alcance | 2 | Se rechaza sin confirmar cambios parciales | `TER_CHACRA_NO_ENCONTRADA` |

**Postcondiciones**

- La Chacra queda INACTIVA y continúa siendo identificable por los registros históricos.

**Escenarios de aceptación**

```gherkin
@TER-UC-005 @AC-01
Escenario: Inactivar una Chacra activa
  Dado un Administrador autorizado y una Chacra ACTIVA con versión vigente
  Cuando solicita inactivarla
  Entonces la Chacra queda INACTIVA con nueva versión e historial conservado

@TER-UC-005 @AC-02
Escenario: Inactivar sin Lotes
  Dado una Chacra ACTIVA sin Lotes
  Cuando el Administrador solicita inactivarla con versión vigente
  Entonces la inactivación conserva la Chacra y no exige un Lote

@TER-UC-005 @AC-03
Escenario: Conservar referencias históricas
  Dado una Chacra con registros que la referencian
  Cuando se confirma la inactivación
  Entonces la Chacra y sus referencias históricas se conservan sin borrado físico ni cascada

@TER-UC-005 @AC-04
Escenario: Rechazar transición de una Chacra ya inactiva
  Dado una Chacra INACTIVA y una nueva solicitud distinta de un reintento idempotente
  Cuando se intenta inactivarla nuevamente
  Entonces se rechaza con TER_TRANSICION_ESTADO_INVALIDA

@TER-UC-005 @AC-05
Escenario: Rechazar versión anterior
  Dado una Chacra cuya versión cambió después de ser consultada
  Cuando se solicita inactivarla con la versión anterior
  Entonces se rechaza con TER_VERSION_CONFLICTO

@TER-UC-005 @AC-06
Escenario: Denegar operación sin permiso
  Dado un Capataz que no posee permiso para esta operación
  Cuando solicita inactivar chacra
  Entonces se rechaza con TER_ACCESO_DENEGADO y no se modifica la Chacra

@TER-UC-005 @AC-07
Escenario: Denegar acceso cruzado entre Empresas
  Dado un Administrador de Empresa A y una Chacra o destino de Empresa B
  Cuando solicita inactivar chacra fuera de su contexto
  Entonces se rechaza con TER_ACCESO_DENEGADO sin revelar datos de Empresa B

@TER-UC-005 @AC-08
Escenario: Exigir contexto explícito de soporte
  Dado un SuperAdministrador sin motivo y Empresa de soporte autorizados
  Cuando solicita inactivar chacra mediante soporte
  Entonces se rechaza con ACC_CONTEXTO_SOPORTE_REQUERIDO

```

### TER-UC-006 — Registrar Lote

- **Estado:** Aprobado
- **Actor:** Administrador; SuperAdministrador mediante soporte auditado.
- **Objetivo:** Registrar un Lote dentro de una Chacra autorizada.
- **Requerimientos:** `TER-REQ-006`.
- **Reglas:** `TER-BR-009` a `TER-BR-017`, `TER-BR-020`, `TER-BR-021`, `TER-BR-023`.

**Precondiciones**

- El actor posee permiso de administración territorial y la Chacra pertenece a su Empresa autorizada.

**Flujo principal**

1. El actor solicita registrar un Lote, con delimitación opcional.
2. El sistema comprueba el permiso y el contexto mediante `TER-DEP-001` y `TER-DEP-002`.
3. El sistema valida `TER-BR-009` a `TER-BR-013`, `TER-BR-017`, `TER-BR-020`, `TER-BR-021` y `TER-BR-023`.
4. Si se informó delimitación, valida `TER-BR-014`, calcula `TER-BR-015` y crea la versión de `TER-BR-016`.
5. El sistema registra el Lote ACTIVO, su auditoría y su condición geométrica derivada.
6. El sistema informa el resultado.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso, Empresa ajena o soporte sin contexto | 2 | Se rechaza sin revelar datos ajenos | `TER_ACCESO_DENEGADO` o `ACC_CONTEXTO_SOPORTE_REQUERIDO` |
| No se cumple `TER-BR-009` | 3 | Se rechaza sin crear el Lote | `TER_CHACRA_LOTE_INVALIDA` |
| No se cumple `TER-BR-010` | 3 | Se rechaza sin crear el Lote | `TER_NOMBRE_LOTE_INVALIDO` |
| No se cumple `TER-BR-011` o `TER-BR-012` | 3 | Se rechaza sin crear el Lote | `TER_CODIGO_LOTE_DUPLICADO` o `TER_CODIGO_LOTE_INVALIDO` |
| No se cumple `TER-BR-013` | 3 | Se rechaza sin crear el Lote | `TER_GEOMETRIA_LOTE_INVALIDA` |
| No se cumple `TER-BR-020` o `TER-BR-021` | 3 | Se rechaza sin crear el Lote | `TER_TIPO_SUELO_INVALIDO` o `TER_SISTEMA_RIEGO_INVALIDO` |
| No se cumple `TER-BR-023` | 3 | Se rechaza sin crear el Lote | `TER_ESTADO_CHACRA_LOTES_INCOMPATIBLE` |
| No se cumple `TER-BR-014`, `TER-BR-015` o `TER-BR-016` | 4 | Se rechaza sin confirmar datos ni geometría parciales | `TER_LOTES_SUPERPUESTOS`, `TER_SUPERFICIE_LOTE_INVALIDA` o `TER_VERSION_GEOMETRICA_INVALIDA` |

**Postcondiciones**

- Existe un Lote ACTIVO, DELIMITADO o SIN_DELIMITAR, vinculado de forma permanente a su Chacra.

**Escenarios de aceptación**

```gherkin
@TER-UC-006 @AC-01
Escenario: Registrar Lote sin delimitación
  Dado un Administrador autorizado y datos territoriales válidos
  Cuando registra un Lote sin geometría
  Entonces queda ACTIVO y SIN_DELIMITAR

@TER-UC-006 @AC-02
Escenario: Registrar Lote delimitado
  Dado un polígono válido que no superpone otro Lote activo de la Empresa
  Cuando el Administrador registra el Lote
  Entonces se crea su primera versión geométrica y se calcula la superficie en hectáreas

@TER-UC-006 @AC-03
Escenario: Rechazar datos obligatorios o catálogos inválidos
  Dado un nombre vacío, un código inválido o un valor fuera de los catálogos aprobados
  Cuando se intenta registrar el Lote
  Entonces se rechaza con el código de la regla incumplida y no se crea el Lote

@TER-UC-006 @AC-04
Escenario: Rechazar código duplicado en la Chacra
  Dado otro Lote de la misma Chacra con un código equivalente
  Cuando se intenta registrar el nuevo Lote
  Entonces se rechaza con TER_CODIGO_LOTE_DUPLICADO

@TER-UC-006 @AC-05
Escenario: Rechazar geometría inválida o superpuesta
  Dado una geometría discontinua, inválida o que superpone un Lote activo de la Empresa
  Cuando se intenta registrar el Lote delimitado
  Entonces se rechaza con TER_GEOMETRIA_LOTE_INVALIDA o TER_LOTES_SUPERPUESTOS sin guardar datos parciales

@TER-UC-006 @AC-06
Escenario: Denegar registro al Capataz
  Dado un Capataz con una Chacra asignada
  Cuando intenta registrar un Lote
  Entonces se rechaza con TER_ACCESO_DENEGADO

@TER-UC-006 @AC-07
Escenario: Rechazar registro dentro de una Chacra inactiva
  Dado una Chacra INACTIVA dentro de la Empresa autorizada
  Cuando el Administrador intenta registrar un Lote
  Entonces se rechaza con TER_ESTADO_CHACRA_LOTES_INCOMPATIBLE
```

### TER-UC-007 — Consultar Lote

- **Estado:** Aprobado
- **Actor:** Administrador; Capataz; SuperAdministrador mediante soporte auditado.
- **Objetivo:** Consultar la ficha territorial de un Lote autorizado.
- **Requerimientos:** `TER-REQ-007`.
- **Reglas:** `TER-BR-018`, `TER-BR-022`.

**Flujo principal**

1. El actor solicita un Lote.
2. El sistema comprueba Empresa, permiso y, para Capataz, `TER-BR-022` mediante `TER-DEP-002`.
3. El sistema obtiene el Lote y deriva su condición geométrica y superficie vigente.
4. El sistema informa su ficha y referencias de navegación sin copiar hechos de otros módulos.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso, Empresa ajena o soporte sin contexto | 2 | Se rechaza sin revelar datos | `TER_ACCESO_DENEGADO` o `ACC_CONTEXTO_SOPORTE_REQUERIDO` |
| No se cumple `TER-BR-022` | 2 | Se rechaza sin revelar la ficha | `TER_LOTE_FUERA_DE_ALCANCE` |
| Lote inexistente dentro del alcance | 3 | Se informa ausencia dentro del contexto autorizado | `TER_LOTE_NO_ENCONTRADO` |

**Postcondiciones**

- El actor obtiene únicamente la ficha territorial autorizada; no se modifica el Lote.

**Escenarios de aceptación**

```gherkin
@TER-UC-007 @AC-01
Escenario: Consultar ficha territorial
  Dado un Administrador autorizado
  Cuando consulta un Lote delimitado
  Entonces recibe su estado, condición DELIMITADO y superficie cartográfica vigente

@TER-UC-007 @AC-02
Escenario: Consultar Lote inactivo
  Dado un Lote INACTIVO dentro del alcance autorizado
  Cuando se consulta su ficha
  Entonces se informa su identidad e historia territorial sin habilitar nuevas operaciones

@TER-UC-007 @AC-03
Escenario: Capataz consulta un Lote de Chacra asignada
  Dado un Capataz con la Chacra propietaria incluida en su alcance vigente
  Cuando consulta cualquiera de sus Lotes
  Entonces recibe la ficha territorial

@TER-UC-007 @AC-04
Escenario: Denegar Lote fuera del alcance del Capataz
  Dado un Capataz sin asignación a la Chacra propietaria
  Cuando consulta el Lote
  Entonces se rechaza con TER_LOTE_FUERA_DE_ALCANCE sin revelar la ficha
```

### TER-UC-008 — Listar Lotes

- **Estado:** Aprobado
- **Actor:** Administrador; Capataz; SuperAdministrador mediante soporte auditado.
- **Objetivo:** Listar Lotes dentro del alcance autorizado.
- **Requerimientos:** `TER-REQ-008`.
- **Reglas:** `TER-BR-018`, `TER-BR-022`.

**Flujo principal**

1. El actor solicita una página de Lotes con filtros y orden admitidos.
2. El sistema comprueba permiso, Empresa y soporte; para Capataz aplica `TER-BR-022`.
3. El sistema restringe el conjunto por alcance, incluye Lotes ACTIVOS e INACTIVOS cuando no se indica estado o aplica el filtro solicitado, y ejecuta paginación y orden según convenciones.md §3.2 y §3.3.
4. El sistema informa la página y sus metadatos.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso, Empresa ajena o soporte sin contexto | 2 | Se rechaza sin revelar datos | `TER_ACCESO_DENEGADO` o `ACC_CONTEXTO_SOPORTE_REQUERIDO` |
| Filtros, paginación u orden no admitidos | 3 | Se rechaza la consulta | `TER_CONSULTA_INVALIDA` |

**Postcondiciones**

- La página y el total se calculan únicamente sobre Lotes autorizados; sin filtro de estado incluyen ACTIVOS e INACTIVOS.

**Escenarios de aceptación**

```gherkin
@TER-UC-008 @AC-01
Escenario: Listar Lotes de una Chacra
  Dado un Administrador autorizado y Lotes activos e inactivos en una Chacra de su Empresa
  Cuando filtra el listado por esa Chacra sin indicar estado
  Entonces recibe sus Lotes activos e inactivos y los metadatos de paginación

@TER-UC-008 @AC-02
Escenario: Filtrar por estado y condición geométrica
  Dado Lotes con distintos estados y condiciones dentro del alcance
  Cuando se aplican filtros admitidos
  Entonces la página y el total consideran esos filtros

@TER-UC-008 @AC-03
Escenario: Restringir el listado del Capataz
  Dado un Capataz con dos Chacras asignadas
  Cuando lista Lotes
  Entonces recibe únicamente los Lotes contenidos en esas Chacras

@TER-UC-008 @AC-04
Escenario: Denegar consulta inválida o sin permiso
  Dado un actor sin permiso o parámetros no admitidos
  Cuando solicita listar Lotes
  Entonces se rechaza con TER_ACCESO_DENEGADO o TER_CONSULTA_INVALIDA
```

### TER-UC-009 — Modificar datos descriptivos del Lote

- **Estado:** Aprobado
- **Actor:** Administrador; SuperAdministrador mediante soporte auditado.
- **Objetivo:** Corregir los datos descriptivos de un Lote sin cambiar su identidad territorial.
- **Requerimientos:** `TER-REQ-009`.
- **Reglas:** `TER-BR-009` a `TER-BR-012`, `TER-BR-018`, `TER-BR-020`, `TER-BR-021`.

**Flujo principal**

1. El actor solicita modificar datos descriptivos con la versión conocida.
2. El sistema comprueba permiso y contexto.
3. El sistema valida las reglas declaradas y la versión según convenciones.md §3.5.
4. El sistema actualiza los datos admitidos, conserva Chacra y código e incrementa la versión.
5. El sistema informa el resultado.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso, Empresa ajena o soporte sin contexto | 2 | Se rechaza sin modificar | `TER_ACCESO_DENEGADO` o `ACC_CONTEXTO_SOPORTE_REQUERIDO` |
| Cambio de Chacra o código | 3 | Se rechaza sin modificar | `TER_CHACRA_LOTE_INVALIDA` o `TER_CODIGO_LOTE_INMUTABLE` |
| Nombre o catálogo inválido | 3 | Se rechaza sin modificar | `TER_NOMBRE_LOTE_INVALIDO`, `TER_TIPO_SUELO_INVALIDO` o `TER_SISTEMA_RIEGO_INVALIDO` |
| Versión anterior a la vigente | 3 | Se rechaza sin sobrescribir | `TER_VERSION_CONFLICTO` |

**Postcondiciones**

- El Lote conserva identidad, Chacra, código, estado y geometría; sus datos admitidos quedan actualizados. Si estaba INACTIVO, permanece INACTIVO.

**Escenarios de aceptación**

```gherkin
@TER-UC-009 @AC-01
Escenario: Modificar datos descriptivos
  Dado un Administrador autorizado con la versión vigente
  Cuando modifica nombre, descripción, notas, suelo o riego con valores válidos
  Entonces el Lote conserva Chacra y código y aumenta su versión

@TER-UC-009 @AC-02
Escenario: Rechazar cambio de identidad territorial
  Dado un Lote existente
  Cuando se intenta cambiar su Chacra o código
  Entonces se rechaza con TER_CHACRA_LOTE_INVALIDA o TER_CODIGO_LOTE_INMUTABLE

@TER-UC-009 @AC-03
Escenario: Rechazar versión anterior
  Dado un Lote modificado después de la versión conocida
  Cuando se intenta guardar esa versión anterior
  Entonces se rechaza con TER_VERSION_CONFLICTO

@TER-UC-009 @AC-04
Escenario: Denegar modificación al Capataz
  Dado un Capataz con la Chacra asignada
  Cuando intenta modificar el Lote
  Entonces se rechaza con TER_ACCESO_DENEGADO

@TER-UC-009 @AC-05
Escenario: Corregir datos de un Lote inactivo
  Dado un Lote INACTIVO y un Administrador autorizado con su versión vigente
  Cuando corrige sus datos descriptivos con valores válidos
  Entonces se registran los cambios y el Lote permanece INACTIVO
```

### TER-UC-010 — Delimitar o corregir geometría de Lote

- **Estado:** Aprobado
- **Actor:** Administrador; SuperAdministrador mediante soporte auditado.
- **Objetivo:** Establecer una nueva versión de la delimitación del Lote.
- **Requerimientos:** `TER-REQ-010`.
- **Reglas:** `TER-BR-013` a `TER-BR-016`, `TER-BR-018`.

**Flujo principal**

1. El actor solicita delimitar o corregir un Lote, informa la geometría, el motivo y la versión conocida.
2. El sistema comprueba permiso, contexto y versión.
3. El sistema valida `TER-BR-013` y `TER-BR-014` sobre las geometrías vigentes aplicables.
4. El sistema calcula la superficie mediante `TER-BR-015`.
5. El sistema cierra la versión anterior, si existe, y crea la nueva conforme a `TER-BR-016`.
6. El sistema informa la delimitación vigente y la superficie calculada.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso, Empresa ajena o soporte sin contexto | 2 | Se rechaza sin modificar | `TER_ACCESO_DENEGADO` o `ACC_CONTEXTO_SOPORTE_REQUERIDO` |
| Versión anterior a la vigente | 2 | Se rechaza sin sobrescribir | `TER_VERSION_CONFLICTO` |
| Geometría inválida | 3 | Se rechaza sin crear versión | `TER_GEOMETRIA_LOTE_INVALIDA` |
| Superposición con otro Lote activo | 3 | Se rechaza sin crear versión | `TER_LOTES_SUPERPUESTOS` |
| No puede calcularse la superficie o persistirse una única versión vigente | 4 o 5 | Se revierte toda la operación | `TER_SUPERFICIE_LOTE_INVALIDA` o `TER_VERSION_GEOMETRICA_INVALIDA` |

**Postcondiciones**

- La nueva versión queda vigente y las anteriores permanecen inmutables; la operación no cambia el estado administrativo del Lote.

**Escenarios de aceptación**

```gherkin
@TER-UC-010 @AC-01
Escenario: Delimitar por primera vez
  Dado un Lote SIN_DELIMITAR y un polígono válido sin superposición
  Cuando el Administrador confirma la delimitación con un motivo
  Entonces se crea la primera versión, el Lote queda DELIMITADO y se calcula su superficie

@TER-UC-010 @AC-02
Escenario: Corregir conservando historia
  Dado un Lote con una versión geométrica vigente
  Cuando se confirma otra geometría válida con motivo
  Entonces la anterior queda histórica e inmutable y la nueva queda vigente

@TER-UC-010 @AC-03
Escenario: Permitir contacto de límites
  Dado un polígono cuyo límite toca el de otro Lote activo sin compartir superficie
  Cuando se valida la delimitación
  Entonces se acepta sin TER_LOTES_SUPERPUESTOS

@TER-UC-010 @AC-04
Escenario: Rechazar geometría inválida o superpuesta
  Dado una geometría inválida o que comparte superficie con otro Lote activo
  Cuando se intenta crear la versión
  Entonces se rechaza con TER_GEOMETRIA_LOTE_INVALIDA o TER_LOTES_SUPERPUESTOS

@TER-UC-010 @AC-05
Escenario: Denegar administración geométrica al Capataz
  Dado un Capataz con la Chacra asignada
  Cuando intenta delimitar uno de sus Lotes
  Entonces se rechaza con TER_ACCESO_DENEGADO

@TER-UC-010 @AC-06
Escenario: Corregir geometría de un Lote inactivo
  Dado un Lote INACTIVO y una geometría válida con motivo informado
  Cuando el Administrador confirma la corrección
  Entonces se crea una nueva versión geométrica y el Lote permanece INACTIVO
```

### TER-UC-011 — Inactivar Lote

- **Estado:** Aprobado
- **Actor:** Administrador; SuperAdministrador mediante soporte auditado.
- **Objetivo:** Inactivar un Lote sin borrar su historia.
- **Requerimientos:** `TER-REQ-011`.
- **Reglas:** `TER-BR-017`, `TER-BR-018`, `TER-BR-019`.

**Flujo principal**

1. El actor solicita inactivar un Lote con la versión conocida.
2. El sistema comprueba permiso, contexto y versión.
3. El sistema consulta mediante `TER-DEP-003` y `TER-DEP-004` si existen procesos activos y valida `TER-BR-019`.
4. El sistema aplica `TER-BR-017`, conserva lo indicado por `TER-BR-018` e incrementa la versión.
5. El sistema informa el nuevo estado.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso, Empresa ajena o soporte sin contexto | 2 | Se rechaza sin modificar | `TER_ACCESO_DENEGADO` o `ACC_CONTEXTO_SOPORTE_REQUERIDO` |
| Versión anterior o transición inválida | 2 o 4 | Se rechaza sin modificar | `TER_VERSION_CONFLICTO` o `TER_TRANSICION_LOTE_INVALIDA` |
| Existen procesos activos | 3 | Se rechaza sin inactivar | `TER_LOTE_CON_PROCESOS_ACTIVOS` |

**Postcondiciones**

- El Lote queda INACTIVO, conserva geometrías e historial y bloquea nuevas operaciones funcionales.

**Escenarios de aceptación**

```gherkin
@TER-UC-011 @AC-01
Escenario: Inactivar Lote sin procesos activos
  Dado un Lote ACTIVO sin implantaciones ni operaciones pendientes
  Cuando el Administrador solicita inactivarlo con la versión vigente
  Entonces queda INACTIVO y conserva identidad, código y geometrías

@TER-UC-011 @AC-02
Escenario: Rechazar Lote con procesos activos
  Dado un Lote con una implantación activa o labor pendiente
  Cuando se solicita inactivarlo
  Entonces se rechaza con TER_LOTE_CON_PROCESOS_ACTIVOS

@TER-UC-011 @AC-03
Escenario: Rechazar transición repetida
  Dado un Lote ya INACTIVO
  Cuando se intenta inactivarlo nuevamente como una nueva operación
  Entonces se rechaza con TER_TRANSICION_LOTE_INVALIDA

@TER-UC-011 @AC-04
Escenario: Denegar inactivación al Capataz
  Dado un Capataz con acceso de consulta al Lote
  Cuando intenta inactivarlo
  Entonces se rechaza con TER_ACCESO_DENEGADO
```

### TER-UC-012 — Reactivar Lote

- **Estado:** Aprobado
- **Actor:** Administrador; SuperAdministrador mediante soporte auditado.
- **Objetivo:** Reactivar un Lote conservando su historia.
- **Requerimientos:** `TER-REQ-012`.
- **Reglas:** `TER-BR-009`, `TER-BR-014`, `TER-BR-017`, `TER-BR-023`.

**Flujo principal**

1. El actor solicita reactivar un Lote con la versión conocida.
2. El sistema comprueba permiso, contexto y versión.
3. El sistema valida la transición de `TER-BR-017`, la relación de `TER-BR-009`, la coherencia de `TER-BR-023` y, si está delimitado, `TER-BR-014`.
4. El sistema registra el estado ACTIVO sin alterar geometrías históricas e incrementa la versión.
5. El sistema informa el resultado.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso, Empresa ajena o soporte sin contexto | 2 | Se rechaza sin modificar | `TER_ACCESO_DENEGADO` o `ACC_CONTEXTO_SOPORTE_REQUERIDO` |
| Versión anterior o transición inválida | 2 o 3 | Se rechaza sin modificar | `TER_VERSION_CONFLICTO` o `TER_TRANSICION_LOTE_INVALIDA` |
| La geometría ahora superpone otro Lote activo | 3 | Se rechaza sin reactivar | `TER_LOTES_SUPERPUESTOS` |
| La Chacra está INACTIVA | 3 | Se rechaza sin reactivar | `TER_ESTADO_CHACRA_LOTES_INCOMPATIBLE` |

**Postcondiciones**

- El Lote queda ACTIVO y conserva su condición geométrica e historial.

**Escenarios de aceptación**

```gherkin
@TER-UC-012 @AC-01
Escenario: Reactivar Lote sin delimitación
  Dado un Lote INACTIVO y SIN_DELIMITAR con versión vigente
  Cuando el Administrador lo reactiva
  Entonces queda ACTIVO y SIN_DELIMITAR

@TER-UC-012 @AC-02
Escenario: Reactivar Lote delimitado sin conflicto
  Dado un Lote INACTIVO cuya geometría vigente no superpone otro Lote activo
  Cuando se confirma la reactivación
  Entonces queda ACTIVO sin crear otra versión geométrica

@TER-UC-012 @AC-03
Escenario: Rechazar superposición al reactivar
  Dado un Lote INACTIVO cuya geometría comparte superficie con otro Lote activo
  Cuando se intenta reactivarlo
  Entonces se rechaza con TER_LOTES_SUPERPUESTOS

@TER-UC-012 @AC-04
Escenario: Denegar reactivación al Capataz
  Dado un Capataz con acceso de consulta al Lote
  Cuando intenta reactivarlo
  Entonces se rechaza con TER_ACCESO_DENEGADO

@TER-UC-012 @AC-05
Escenario: Rechazar reactivación dentro de una Chacra inactiva
  Dado un Lote INACTIVO cuya Chacra está INACTIVA
  Cuando el Administrador intenta reactivarlo
  Entonces se rechaza con TER_ESTADO_CHACRA_LOTES_INCOMPATIBLE
```

### TER-UC-013 — Consultar historial geométrico

- **Estado:** Aprobado
- **Actor:** Administrador; Capataz; SuperAdministrador mediante soporte auditado.
- **Objetivo:** Consultar las versiones geométricas de un Lote autorizado.
- **Requerimientos:** `TER-REQ-013`.
- **Reglas:** `TER-BR-016`, `TER-BR-022`.

**Flujo principal**

1. El actor solicita el historial geométrico de un Lote.
2. El sistema comprueba permiso, Empresa y, para Capataz, `TER-BR-022`.
3. El sistema obtiene las versiones sin modificarlas y distingue la vigente de las históricas.
4. El sistema informa geometría, superficie, vigencia, actor y motivo de cada versión.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso, Empresa ajena o soporte sin contexto | 2 | Se rechaza sin revelar datos | `TER_ACCESO_DENEGADO` o `ACC_CONTEXTO_SOPORTE_REQUERIDO` |
| No se cumple `TER-BR-022` | 2 | Se rechaza sin revelar historial | `TER_LOTE_FUERA_DE_ALCANCE` |
| Lote inexistente dentro del alcance | 3 | Se informa ausencia | `TER_LOTE_NO_ENCONTRADO` |

**Postcondiciones**

- El historial permanece inmutable; un Lote SIN_DELIMITAR puede devolver una colección vacía.

**Escenarios de aceptación**

```gherkin
@TER-UC-013 @AC-01
Escenario: Consultar versiones geométricas
  Dado un Lote con versiones históricas y una vigente
  Cuando un Administrador consulta el historial
  Entonces recibe cada versión con su superficie y vigencia diferenciadas

@TER-UC-013 @AC-02
Escenario: Consultar Lote nunca delimitado
  Dado un Lote SIN_DELIMITAR dentro del alcance
  Cuando se consulta su historial geométrico
  Entonces se informa una colección vacía sin error

@TER-UC-013 @AC-03
Escenario: Capataz consulta historial autorizado
  Dado un Capataz con la Chacra propietaria asignada
  Cuando consulta el historial del Lote
  Entonces recibe las versiones sin poder modificarlas

@TER-UC-013 @AC-04
Escenario: Denegar historial fuera de alcance
  Dado un Capataz sin asignación a la Chacra propietaria
  Cuando consulta el historial del Lote
  Entonces se rechaza con TER_LOTE_FUERA_DE_ALCANCE
```
