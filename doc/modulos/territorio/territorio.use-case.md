---
type: use-cases
module: "TER"
status: Propuesto
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

Las asignaciones de esta matriz concretan `TER-Q-003`. El contexto de Empresa se rige por arquitectura.md §13.4 y el soporte por `ACC-BR-011`. La matriz no incorpora un circuito para asignar Chacras a un Capataz; ese dato llega por `TER-DEP-002`.

| Caso de uso | Administrador | Capataz | SuperAdministrador | Condición |
|---|:---:|:---:|:---:|---|
| `TER-UC-001` | Sí | No | Cond. | Soporte: `ACC-BR-011` |
| `TER-UC-002` | Sí | Cond. | Cond. | Capataz: `TER-BR-004`; soporte: `ACC-BR-011` |
| `TER-UC-003` | Sí | Cond. | Cond. | Capataz: `TER-BR-004`; soporte: `ACC-BR-011` |
| `TER-UC-004` | Sí | No | Cond. | Soporte: `ACC-BR-011` |
| `TER-UC-005` | Sí | No | Cond. | Soporte: `ACC-BR-011` |

Los roles no incluidos no reciben permisos de Chacras por esta especificación.

## 3. Casos de uso

### TER-UC-001 — Registrar Chacra

- **Estado:** Propuesto
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
  Dado otra Chacra de la misma Empresa con el mismo nombre corto
  Cuando se solicita registrar una Chacra usando ese nombre corto
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

- **Estado:** Propuesto
- **Actor:** Administrador; Capataz; SuperAdministrador mediante soporte auditado.
- **Objetivo:** Consultar Chacra dentro del alcance autorizado.
- **Requerimientos:** `TER-REQ-002`.
- **Reglas:** `TER-BR-004`.

**Precondiciones**

- El actor está autenticado y posee permiso de consulta en el contexto de su Empresa o soporte.

**Flujo principal**

1. El actor solicita consultar una Chacra.
2. El sistema comprueba el permiso y el contexto según TER-DEP-001 y TER-DEP-002.
3. Si el actor es Capataz, el sistema aplica TER-BR-004.
4. El sistema obtiene la Chacra dentro del alcance autorizado.
5. El sistema informa la ficha y su versión sin modificar el registro.

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
  Entonces recibe los datos conservados y el estado de la Chacra

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

- **Estado:** Propuesto
- **Actor:** Administrador; Capataz; SuperAdministrador mediante soporte auditado.
- **Objetivo:** Listar Chacras dentro del alcance autorizado.
- **Requerimientos:** `TER-REQ-003`.
- **Reglas:** `TER-BR-004`.

**Precondiciones**

- El actor está autenticado y posee permiso de consulta.

**Flujo principal**

1. El actor solicita un listado de Chacras con paginación, filtros y orden admitidos.
2. El sistema comprueba el permiso y el contexto mediante TER-DEP-001 y TER-DEP-002.
3. El sistema restringe el conjunto por Empresa y, para Capataz, aplica TER-BR-004 como filtro del alcance.
4. El sistema ejecuta el listado según convenciones.md §3.2 y §3.3 sobre el conjunto autorizado.
5. El sistema informa la página y sus metadatos.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso o solicita otra Empresa fuera de su contexto | 2 | Se rechaza sin revelar datos ajenos ni modificar la Chacra | `TER_ACCESO_DENEGADO` |
| Soporte sin el contexto requerido por `ACC-BR-011` | 2 | Se rechaza sin ejecutar la operación | `ACC_CONTEXTO_SOPORTE_REQUERIDO` |
| Paginación, filtros u orden no admitidos | 4 | Se rechaza sin confirmar cambios parciales | `TER_CONSULTA_INVALIDA` |

**Postcondiciones**

- La página y su total se calculan únicamente sobre Chacras autorizadas; no se modifica estado.

**Escenarios de aceptación**

```gherkin
@TER-UC-003 @AC-01
Escenario: Listar por Empresa
  Dado un Administrador autenticado y Chacras de distintas Empresas
  Cuando solicita una página de Chacras
  Entonces la página y el total incluyen únicamente Chacras de su Empresa

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

```

### TER-UC-004 — Modificar Chacra

- **Estado:** Propuesto
- **Actor:** Administrador; SuperAdministrador mediante soporte auditado.
- **Objetivo:** Modificar Chacra dentro del alcance autorizado.
- **Requerimientos:** `TER-REQ-004`.
- **Reglas:** `TER-BR-001`, `TER-BR-002`, `TER-BR-007`.

**Precondiciones**

- La Chacra existe dentro del alcance y el actor conoce su versión.

**Flujo principal**

1. El actor solicita modificar los datos descriptivos de una Chacra indicando la versión conocida.
2. El sistema comprueba el permiso y el contexto mediante TER-DEP-001 y TER-DEP-002.
3. El sistema valida TER-BR-001, TER-BR-002 y TER-BR-007; la comprobación de unicidad excluye la propia Chacra.
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

```

### TER-UC-005 — Inactivar Chacra

- **Estado:** Propuesto
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
