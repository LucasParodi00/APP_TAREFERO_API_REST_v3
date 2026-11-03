---
type: use-cases
module: "EMP"
status: Aprobado
owner: "Analista"
---

# Empresas — Casos de uso

## 1. Actores

| Actor | Tipo | Origen |
|---|---|---|
| SuperAdministrador | Rol | `EMP-Q-001` |
| Administrador | Rol | `B-01`, `B-02`, `EMP-Q-001` |

## 2. Permisos

| Caso de uso | SuperAdministrador | Administrador | Condición |
|---|:---:|:---:|---|
| `EMP-UC-001` Registrar Empresa | Sí | No | `EMP-Q-001` |
| `EMP-UC-002` Consultar Empresa | Sí | Cond. | `EMP-BR-007` |
| `EMP-UC-003` Listar Empresas | Sí | No | `EMP-Q-001` |
| `EMP-UC-004` Modificar Empresa | Cond. | Cond. | `EMP-BR-007`, `EMP-BR-014` |
| `EMP-UC-005` Suspender Empresa | Sí | No | `EMP-Q-001` |
| `EMP-UC-006` Reactivar Empresa | Sí | No | `EMP-Q-001` |
| `EMP-UC-007` Cerrar Empresa | Sí | No | `EMP-Q-001` |
| `EMP-UC-008` Modificar configuración general | Cond. | Cond. | `EMP-BR-007`, `EMP-BR-014` |

## 3. Casos de uso

### EMP-UC-001 — Registrar Empresa

- **Estado:** Aprobado
- **Actor:** SuperAdministrador `EMP-Q-001`
- **Objetivo:** incorporar una nueva Empresa cliente a la plataforma.
- **Requerimientos:** `EMP-REQ-001`.
- **Reglas:** `EMP-BR-001`, `EMP-BR-002`, `EMP-BR-003`, `EMP-BR-004`, `EMP-BR-006`, `EMP-BR-009`, `EMP-BR-010`, `EMP-BR-011`, `EMP-BR-012`, `EMP-BR-013`.

**Precondiciones**

- El actor está autenticado y posee permiso de plataforma para registrar Empresas.

**Flujo principal**

1. El SuperAdministrador solicita registrar una Empresa indicando su nombre, un alias y, opcionalmente, los datos aprobados.
2. El sistema verifica el permiso del actor.
3. El sistema valida `EMP-BR-001`, `EMP-BR-002`, `EMP-BR-003`, `EMP-BR-010`, `EMP-BR-011` y `EMP-BR-012`.
4. El sistema obtiene la asignación prevista en `EMP-BR-009` mediante `EMP-DEP-002`.
5. El sistema establece la configuración de `EMP-BR-006`.
6. El sistema registra la Empresa aplicando `EMP-BR-004` y conserva el alias conforme a `EMP-BR-013`.
7. El sistema informa la identidad, estado y versión de la Empresa creada.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso | 2 | Se rechaza sin cambios | `EMP_ACCESO_DENEGADO` |
| No se cumple una regla de datos descriptivos | 3 | Se rechaza sin cambios | Código de `EMP-BR-001`, `EMP-BR-002`, `EMP-BR-003` o `EMP-BR-010` |
| No se cumple `EMP-BR-011` | 3 | Se rechaza sin cambios | `EMP_ALIAS_INVALIDO` |
| No se cumple `EMP-BR-012` | 3 | Se rechaza sin cambios | `EMP_ALIAS_NO_DISPONIBLE` |
| No se cumple `EMP-BR-009` | 4 | Se rechaza sin crear la Empresa | `EMP_ASIGNACION_COMERCIAL_REQUERIDA` |
| No se cumple `EMP-BR-006` | 5 | Se rechaza sin cambios | `EMP_CONFIGURACION_GENERAL_INVALIDA` |

**Postcondiciones**

- Existe una Empresa con alias inmutable, configuración general y asignación comercial contemplada.

**Escenarios de aceptación**

```gherkin
@EMP-UC-001 @AC-01
Escenario: Registrar una Empresa indicando solo los datos obligatorios
  Dado un SuperAdministrador autorizado
  Y una asignación comercial provisional disponible
  Cuando solicita registrar la Empresa con un nombre y alias válidos
  Entonces la Empresa queda registrada con la configuración general inicial

@EMP-UC-001 @AC-02
Escenario: Rechazar una Empresa sin nombre
  Dado un SuperAdministrador autorizado
  Cuando solicita registrar la Empresa sin un nombre válido
  Entonces se rechaza con EMP_NOMBRE_OBLIGATORIO
  Y no se registra la Empresa

@EMP-UC-001 @AC-03
Escenario: Rechazar una ubicación geográfica incompleta
  Dado un SuperAdministrador autorizado
  Cuando solicita registrar una Empresa con un punto incompleto
  Entonces se rechaza con EMP_UBICACION_GEOGRAFICA_INVALIDA

@EMP-UC-001 @AC-04
Escenario: Registrar un CUIT repetido sin validar su dígito verificador
  Dado otra Empresa con el mismo CUIT de once dígitos
  Y los demás datos y permisos requeridos válidos
  Cuando el SuperAdministrador solicita registrar la nueva Empresa
  Entonces la Empresa se registra conforme a EMP-BR-003

@EMP-UC-001 @AC-05
Escenario: Rol sin permiso para registrar Empresas
  Dado un Administrador autenticado
  Cuando solicita registrar una Empresa
  Entonces se rechaza con EMP_ACCESO_DENEGADO

@EMP-UC-001 @AC-06
Escenario: Rechazar un texto descriptivo demasiado largo
  Dado un SuperAdministrador autorizado
  Cuando solicita registrar una Empresa con una descripción de actividad de 2001 caracteres
  Entonces se rechaza con EMP_TEXTO_INVALIDO

@EMP-UC-001 @AC-07
Escenario: Rechazar un alias con formato inválido
  Dado un SuperAdministrador autorizado
  Cuando solicita registrar una Empresa con el alias "Yerba Norte"
  Entonces se rechaza con EMP_ALIAS_INVALIDO

@EMP-UC-001 @AC-08
Escenario: Rechazar la reutilización de un alias
  Dado una Empresa cerrada cuyo alias es "yerba-norte"
  Cuando el SuperAdministrador solicita registrar otra Empresa con ese alias
  Entonces se rechaza con EMP_ALIAS_NO_DISPONIBLE

@EMP-UC-001 @AC-09
Escenario: Rechazar un alta sin asignación comercial
  Dado un SuperAdministrador autorizado
  Y que no existe una asignación comercial vigente ni provisional
  Cuando solicita registrar una Empresa con datos válidos
  Entonces se rechaza con EMP_ASIGNACION_COMERCIAL_REQUERIDA

@EMP-UC-001 @AC-10
Escenario: Rechazar una configuración general inicial inválida
  Dado un SuperAdministrador autorizado
  Y una asignación comercial disponible
  Cuando la configuración general inicial no cumple EMP-BR-006
  Entonces se rechaza con EMP_CONFIGURACION_GENERAL_INVALIDA

@EMP-UC-001 @AC-11
Escenario: Rechazar un CUIT con formato inválido
  Dado un SuperAdministrador autorizado
  Cuando solicita registrar una Empresa con un CUIT que contiene guiones
  Entonces se rechaza con EMP_CUIT_INVALIDO
```

### EMP-UC-002 — Consultar Empresa

- **Estado:** Aprobado
- **Actor:** SuperAdministrador o Administrador `EMP-Q-001`
- **Objetivo:** conocer los datos, configuración general y estado de una Empresa autorizada.
- **Requerimientos:** `EMP-REQ-002`.
- **Reglas:** `EMP-BR-007`.

**Precondiciones**

- El actor está autenticado.

**Flujo principal**

1. El actor solicita consultar una Empresa.
2. El sistema verifica el permiso y, para un Administrador, `EMP-BR-007`.
3. El sistema obtiene la Empresa.
4. El sistema informa sus datos, configuración general, estado y versión.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| No se cumple `EMP-BR-007` o falta permiso | 2 | Se rechaza sin revelar datos | `EMP_ACCESO_DENEGADO` |
| La Empresa no existe dentro del alcance | 3 | Se informa que no fue encontrada | `EMP_EMPRESA_NO_ENCONTRADA` |

**Postcondiciones**

- No se modifica ningún dato.

**Escenarios de aceptación**

```gherkin
@EMP-UC-002 @AC-01
Escenario: Un Administrador consulta su Empresa
  Dado un Administrador con contexto de Empresa válido
  Cuando consulta su Empresa
  Entonces recibe sus datos, configuración general, estado y versión

@EMP-UC-002 @AC-02
Escenario: Un Administrador intenta consultar otra Empresa
  Dado un Administrador de una Empresa diferente
  Cuando solicita la consulta
  Entonces se rechaza con EMP_ACCESO_DENEGADO

@EMP-UC-002 @AC-03
Escenario: Consultar una Empresa inexistente
  Dado un SuperAdministrador autorizado
  Cuando consulta una Empresa inexistente
  Entonces se rechaza con EMP_EMPRESA_NO_ENCONTRADA
```

### EMP-UC-003 — Listar Empresas

- **Estado:** Aprobado
- **Actor:** SuperAdministrador `EMP-Q-001`
- **Objetivo:** localizar y revisar las Empresas registradas en la plataforma.
- **Requerimientos:** `EMP-REQ-003`.
- **Reglas:** Ninguna adicional.

**Precondiciones**

- El actor posee permiso de plataforma para listar Empresas.

**Flujo principal**

1. El SuperAdministrador solicita el listado indicando filtros, orden y paginación admitidos.
2. El sistema verifica su permiso.
3. El sistema consulta aplicando `convenciones.md` §3.2 y §3.3.
4. El sistema informa la página de Empresas y sus metadatos.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso | 2 | Se rechaza | `EMP_ACCESO_DENEGADO` |
| La paginación, filtro u orden es inválido | 3 | Se rechaza | `EMP_CONSULTA_INVALIDA` |

**Postcondiciones**

- No se modifica ningún dato.

**Escenarios de aceptación**

```gherkin
@EMP-UC-003 @AC-01
Escenario: Listar Empresas por estado
  Dado un SuperAdministrador autorizado
  Cuando solicita una página filtrada por estado
  Entonces recibe únicamente la página solicitada y sus metadatos

@EMP-UC-003 @AC-02
Escenario: Solicitar una página inválida
  Dado un SuperAdministrador autorizado
  Cuando indica un límite superior al permitido
  Entonces se rechaza con EMP_CONSULTA_INVALIDA

@EMP-UC-003 @AC-03
Escenario: Rol sin permiso para listar Empresas
  Dado un Administrador autenticado
  Cuando solicita el listado global
  Entonces se rechaza con EMP_ACCESO_DENEGADO
```

### EMP-UC-004 — Modificar Empresa

- **Estado:** Aprobado
- **Actor:** SuperAdministrador o Administrador `EMP-Q-001`
- **Objetivo:** mantener actualizados los datos descriptivos y de contacto de una Empresa.
- **Requerimientos:** `EMP-REQ-004`.
- **Reglas:** `EMP-BR-001`, `EMP-BR-002`, `EMP-BR-003`, `EMP-BR-007`, `EMP-BR-010`, `EMP-BR-013`, `EMP-BR-014`.

**Precondiciones**

- El actor está autenticado e indica la versión que conoce de la Empresa.

**Flujo principal**

1. El actor solicita modificar los datos de una Empresa indicando la versión conocida.
2. El sistema verifica el permiso y, para un Administrador, `EMP-BR-007`.
3. El sistema obtiene la Empresa, verifica `EMP-BR-014` y que el alias no cambie según `EMP-BR-013`.
4. El sistema valida `EMP-BR-001`, `EMP-BR-002`, `EMP-BR-003` y `EMP-BR-010`.
5. El sistema verifica la versión según `convenciones.md` §3.5.
6. El sistema registra los cambios y una nueva versión.
7. El sistema informa la Empresa actualizada.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| No se cumple `EMP-BR-007` o falta permiso | 2 | Se rechaza sin cambios | `EMP_ACCESO_DENEGADO` |
| La Empresa no existe dentro del alcance | 3 | Se rechaza sin cambios | `EMP_EMPRESA_NO_ENCONTRADA` |
| No se cumple `EMP-BR-014` | 3 | Se rechaza sin cambios | `EMP_MODIFICACION_NO_PERMITIDA` |
| Se intenta modificar el alias | 3 | Se rechaza sin cambios | `EMP_ALIAS_INMUTABLE` |
| No se cumple una regla de datos | 4 | Se rechaza sin cambios | Código de la regla incumplida |
| La versión no es vigente | 5 | Se rechaza sin cambios | `EMP_VERSION_CONFLICTO` |

**Postcondiciones**

- La Empresa conserva los nuevos datos y aumenta su versión.

**Escenarios de aceptación**

```gherkin
@EMP-UC-004 @AC-01
Escenario: Un Administrador modifica los datos de su Empresa
  Dado un Administrador con la versión vigente de su Empresa
  Cuando modifica datos válidos
  Entonces la Empresa conserva los cambios con una nueva versión

@EMP-UC-004 @AC-02
Escenario: Rechazar un cambio con versión anterior
  Dado que la Empresa fue modificada por otro actor
  Cuando se intenta guardar usando la versión anterior
  Entonces se rechaza con EMP_VERSION_CONFLICTO

@EMP-UC-004 @AC-03
Escenario: Rechazar un punto geográfico inválido
  Dado un actor autorizado
  Cuando modifica la Empresa con una coordenada fuera de rango
  Entonces se rechaza con EMP_UBICACION_GEOGRAFICA_INVALIDA

@EMP-UC-004 @AC-04
Escenario: Un Administrador intenta modificar otra Empresa
  Dado un Administrador de una Empresa diferente
  Cuando solicita modificarla
  Entonces se rechaza con EMP_ACCESO_DENEGADO

@EMP-UC-004 @AC-05
Escenario: Un SuperAdministrador corrige una Empresa suspendida
  Dado un SuperAdministrador autorizado y una Empresa suspendida
  Cuando modifica datos válidos con la versión vigente
  Entonces la Empresa conserva los cambios con una nueva versión

@EMP-UC-004 @AC-06
Escenario: Rechazar la modificación de una Empresa cerrada
  Dado un SuperAdministrador autorizado y una Empresa cerrada
  Cuando intenta modificar sus datos
  Entonces se rechaza con EMP_MODIFICACION_NO_PERMITIDA

@EMP-UC-004 @AC-07
Escenario: Rechazar el cambio del alias
  Dado un SuperAdministrador autorizado y una Empresa activa
  Cuando intenta reemplazar su alias
  Entonces se rechaza con EMP_ALIAS_INMUTABLE

@EMP-UC-004 @AC-08
Escenario: Rechazar un nombre demasiado largo
  Dado un actor autorizado y una Empresa activa
  Cuando indica un nombre de 121 caracteres
  Entonces se rechaza con EMP_NOMBRE_INVALIDO

@EMP-UC-004 @AC-09
Escenario: Rechazar un CUIT con separadores
  Dado un actor autorizado y una Empresa activa
  Cuando indica un CUIT con guiones
  Entonces se rechaza con EMP_CUIT_INVALIDO

@EMP-UC-004 @AC-10
Escenario: Rechazar un texto descriptivo demasiado largo
  Dado un actor autorizado y una Empresa activa
  Cuando indica una ubicación textual de 501 caracteres
  Entonces se rechaza con EMP_TEXTO_INVALIDO
```

### EMP-UC-005 — Suspender Empresa

- **Estado:** Aprobado
- **Actor:** SuperAdministrador `EMP-Q-001`
- **Objetivo:** impedir temporalmente operaciones de negocio sin perder información.
- **Requerimientos:** `EMP-REQ-005`.
- **Reglas:** `EMP-BR-004`, `EMP-BR-005`, `EMP-BR-008`.

**Precondiciones**

- El actor está autenticado e indica la versión que conoce de la Empresa.

**Flujo principal**

1. El SuperAdministrador solicita suspender una Empresa indicando la versión vigente.
2. El sistema verifica su permiso.
3. El sistema obtiene la Empresa y verifica su versión.
4. El sistema aplica `EMP-BR-004`.
5. El sistema conserva los datos según `EMP-BR-005` y `EMP-BR-008`.
6. El sistema informa la Empresa suspendida y su nueva versión.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso | 2 | Se rechaza sin cambios | `EMP_ACCESO_DENEGADO` |
| La versión no es vigente | 3 | Se rechaza sin cambios | `EMP_VERSION_CONFLICTO` |
| La Empresa no existe | 3 | Se rechaza sin cambios | `EMP_EMPRESA_NO_ENCONTRADA` |
| No se cumple `EMP-BR-004` | 4 | Se rechaza sin cambios | `EMP_TRANSICION_ESTADO_INVALIDA` |

**Postcondiciones**

- La Empresa queda suspendida y deja de habilitar operaciones de negocio.

**Escenarios de aceptación**

```gherkin
@EMP-UC-005 @AC-01
Escenario: Suspender una Empresa activa
  Dado un SuperAdministrador autorizado y una Empresa activa
  Cuando solicita suspenderla con su versión vigente
  Entonces la Empresa queda suspendida sin perder historial

@EMP-UC-005 @AC-02
Escenario: Suspender desde un estado no permitido
  Dado una Empresa cerrada
  Cuando se solicita suspenderla
  Entonces se rechaza con EMP_TRANSICION_ESTADO_INVALIDA

@EMP-UC-005 @AC-03
Escenario: Rol sin permiso para suspender
  Dado un Administrador autenticado
  Cuando solicita suspender su Empresa
  Entonces se rechaza con EMP_ACCESO_DENEGADO
```

### EMP-UC-006 — Reactivar Empresa

- **Estado:** Aprobado
- **Actor:** SuperAdministrador `EMP-Q-001`
- **Objetivo:** volver a habilitar las operaciones de una Empresa suspendida.
- **Requerimientos:** `EMP-REQ-006`.
- **Reglas:** `EMP-BR-004`, `EMP-BR-005`.

**Precondiciones**

- El actor está autenticado e indica la versión que conoce de la Empresa.

**Flujo principal**

1. El SuperAdministrador solicita reactivar la Empresa indicando la versión conocida.
2. El sistema verifica su permiso.
3. El sistema obtiene la Empresa y verifica su versión.
4. El sistema aplica `EMP-BR-004`.
5. El sistema registra la nueva versión e informa la Empresa activa.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso | 2 | Se rechaza sin cambios | `EMP_ACCESO_DENEGADO` |
| La versión no es vigente | 3 | Se rechaza sin cambios | `EMP_VERSION_CONFLICTO` |
| La Empresa no existe | 3 | Se rechaza sin cambios | `EMP_EMPRESA_NO_ENCONTRADA` |
| No se cumple `EMP-BR-004` | 4 | Se rechaza sin cambios | `EMP_TRANSICION_ESTADO_INVALIDA` |

**Postcondiciones**

- La Empresa queda activa.

**Escenarios de aceptación**

```gherkin
@EMP-UC-006 @AC-01
Escenario: Reactivar una Empresa suspendida
  Dado un SuperAdministrador autorizado y una Empresa suspendida
  Cuando solicita reactivarla con su versión vigente
  Entonces la Empresa queda activa

@EMP-UC-006 @AC-02
Escenario: Reactivar una Empresa cerrada
  Dado una Empresa cerrada
  Cuando se solicita reactivarla
  Entonces se rechaza con EMP_TRANSICION_ESTADO_INVALIDA

@EMP-UC-006 @AC-03
Escenario: Rol sin permiso para reactivar
  Dado un Administrador autenticado
  Cuando solicita reactivar una Empresa
  Entonces se rechaza con EMP_ACCESO_DENEGADO
```

### EMP-UC-007 — Cerrar Empresa

- **Estado:** Aprobado
- **Actor:** SuperAdministrador `EMP-Q-001`
- **Objetivo:** finalizar irreversiblemente la permanencia de una Empresa conservando su historia.
- **Requerimientos:** `EMP-REQ-007`.
- **Reglas:** `EMP-BR-004`, `EMP-BR-005`, `EMP-BR-008`.

**Precondiciones**

- El actor está autenticado e indica la versión que conoce de la Empresa.

**Flujo principal**

1. El SuperAdministrador solicita cerrar una Empresa indicando la versión conocida.
2. El sistema verifica su permiso.
3. El sistema obtiene la Empresa y verifica su versión.
4. El sistema aplica `EMP-BR-004`.
5. El sistema conserva la Empresa según `EMP-BR-005` y `EMP-BR-008`.
6. El sistema informa el cierre y la nueva versión.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso | 2 | Se rechaza sin cambios | `EMP_ACCESO_DENEGADO` |
| La versión no es vigente | 3 | Se rechaza sin cambios | `EMP_VERSION_CONFLICTO` |
| La Empresa no existe | 3 | Se rechaza sin cambios | `EMP_EMPRESA_NO_ENCONTRADA` |
| No se cumple `EMP-BR-004` | 4 | Se rechaza sin cambios | `EMP_TRANSICION_ESTADO_INVALIDA` |

**Postcondiciones**

- La Empresa queda cerrada y no puede reactivarse.

**Escenarios de aceptación**

```gherkin
@EMP-UC-007 @AC-01
Escenario: Cerrar una Empresa activa
  Dado un SuperAdministrador autorizado y una Empresa activa
  Cuando solicita cerrarla con su versión vigente
  Entonces la Empresa queda cerrada y conserva su historia

@EMP-UC-007 @AC-02
Escenario: Intentar cambiar una Empresa ya cerrada
  Dado una Empresa cerrada
  Cuando se solicita cerrarla nuevamente
  Entonces se rechaza con EMP_TRANSICION_ESTADO_INVALIDA

@EMP-UC-007 @AC-03
Escenario: Rol sin permiso para cerrar
  Dado un Administrador autenticado
  Cuando solicita cerrar su Empresa
  Entonces se rechaza con EMP_ACCESO_DENEGADO
```

### EMP-UC-008 — Modificar configuración general

- **Estado:** Aprobado
- **Actor:** SuperAdministrador o Administrador `EMP-Q-001`
- **Objetivo:** ajustar país, zona horaria y moneda principal de una Empresa.
- **Requerimientos:** `EMP-REQ-008`.
- **Reglas:** `EMP-BR-006`, `EMP-BR-007`, `EMP-BR-014`.

**Precondiciones**

- El actor está autenticado e indica la versión que conoce de la configuración.

**Flujo principal**

1. El actor solicita modificar la configuración general.
2. El sistema verifica el permiso y, para un Administrador, `EMP-BR-007`.
3. El sistema obtiene la Empresa y verifica `EMP-BR-014`.
4. El sistema valida `EMP-BR-006`.
5. El sistema verifica la versión según `convenciones.md` §3.5.
6. El sistema registra la configuración y su nueva versión.
7. El sistema informa la configuración actualizada.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| No se cumple `EMP-BR-007` o falta permiso | 2 | Se rechaza sin cambios | `EMP_ACCESO_DENEGADO` |
| La Empresa no existe dentro del alcance | 3 | Se rechaza sin cambios | `EMP_EMPRESA_NO_ENCONTRADA` |
| No se cumple `EMP-BR-014` | 3 | Se rechaza sin cambios | `EMP_MODIFICACION_NO_PERMITIDA` |
| No se cumple `EMP-BR-006` | 4 | Se rechaza sin cambios | `EMP_CONFIGURACION_GENERAL_INVALIDA` |
| La versión no es vigente | 5 | Se rechaza sin cambios | `EMP_VERSION_CONFLICTO` |

**Postcondiciones**

- La Empresa conserva la nueva configuración general con una versión mayor.

**Escenarios de aceptación**

```gherkin
@EMP-UC-008 @AC-01
Escenario: Un Administrador modifica la zona horaria de su Empresa
  Dado un Administrador con la versión vigente de su configuración
  Cuando indica una zona horaria IANA válida
  Entonces la configuración conserva la nueva zona horaria

@EMP-UC-008 @AC-02
Escenario: Rechazar una moneda inválida
  Dado un actor autorizado
  Cuando indica una moneda que no pertenece a ISO 4217
  Entonces se rechaza con EMP_CONFIGURACION_GENERAL_INVALIDA

@EMP-UC-008 @AC-03
Escenario: Un Administrador intenta modificar otra Empresa
  Dado un Administrador de una Empresa diferente
  Cuando solicita modificar su configuración
  Entonces se rechaza con EMP_ACCESO_DENEGADO

@EMP-UC-008 @AC-04
Escenario: Un SuperAdministrador modifica la configuración de una Empresa suspendida
  Dado un SuperAdministrador autorizado y una Empresa suspendida
  Cuando indica una configuración válida con su versión vigente
  Entonces la configuración conserva los cambios con una nueva versión

@EMP-UC-008 @AC-05
Escenario: Rechazar la modificación de una Empresa cerrada
  Dado un SuperAdministrador autorizado y una Empresa cerrada
  Cuando intenta modificar su configuración general
  Entonces se rechaza con EMP_MODIFICACION_NO_PERMITIDA
```
