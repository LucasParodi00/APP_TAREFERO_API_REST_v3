---
type: use-cases
module: "PER"
status: Aprobado
owner: "Analista"
---

# Personal — Casos de uso

## 1. Actores

| Actor | Tipo | Origen |
|---|---|---|
| Administrador | Rol | `B-01`, `B-02`, `B-04`, `PER-Q-025` |
| Capataz | Rol | `B-02`, `B-03`, `PER-Q-011`, `PER-Q-028` |
| Empleado | Rol | `PER-Q-020` |
| ACC | Sistema | `B-01`, `PER-Q-035` |
| LAB | Sistema | `B-04`, `PER-Q-019`, `PER-Q-023` |
| COS | Sistema | `PER-Q-019` |
| ECO | Sistema | `PER-Q-019` |

## 2. Permisos

| Caso de uso | Administrador | Capataz | Empleado | Sistema | Condición |
|---|:---:|:---:|:---:|:---:|---|
| `PER-UC-001` | Sí | No | No | No | Empresa del contexto |
| `PER-UC-002` | Sí | No | No | Cond. | ACC participa mediante `PER-DEP-003` |
| `PER-UC-003` | Sí | No | No | No | — |
| `PER-UC-004` | No | Sí | No | No | Capataz autenticado en la Empresa |
| `PER-UC-005` | Cond. | Cond. | No | No | Administrador supervisa; Capataz: `PER-BR-011` |
| `PER-UC-006` | Sí | No | No | No | — |
| `PER-UC-007` | Sí | Cond. | No | No | Capataz: `PER-BR-011` |
| `PER-UC-008` | No | Sí | No | No | `PER-BR-015`, `PER-BR-016` |
| `PER-UC-009` | Sí | No | No | No | Asistencia confirmada |
| `PER-UC-010` | Cond. | Sí | Sí | No | Solo información propia; Administrador solo si además tiene ficha |
| `PER-UC-011` | Sí | No | No | No | — |
| `PER-UC-012` | Sí | No | No | Cond. | LAB/COS aportan hechos; ECO consume resultado |
| `PER-UC-013` | Sí | Cond. | Cond. | Cond. | Datos mínimos según propósito y autorización |

## 3. Casos de uso

### PER-UC-001 — Administrar un Empleado

- **Estado:** Aprobado
- **Actor:** Administrador.
- **Objetivo:** Crear, consultar, modificar, inactivar o reactivar una ficha laboral conservando su historia.
- **Requerimientos:** `PER-REQ-001`, `PER-REQ-002`.
- **Reglas:** `PER-BR-001` a `PER-BR-006`.

**Precondiciones**

- El Administrador opera en una Empresa vigente.

**Flujo principal**

1. El Administrador selecciona crear, consultar o modificar un Empleado e informa los datos permitidos.
2. El sistema verifica permiso y Empresa.
3. El sistema aplica `PER-BR-001` a `PER-BR-004`.
4. Para crear o reactivar aplica `PER-BR-006`.
5. Para inactivar o reactivar aplica `PER-BR-005` y, cuando corresponda, deriva a `PER-UC-002`.
6. El sistema conserva la ficha y su período laboral.

**Flujos alternativos**

- **A1 — Reingreso** (desde el paso 5): se reutiliza la ficha INACTIVA y se abre un período nuevo.
- **A2 — Datos opcionales** (desde el paso 3): se mantienen contactos, una especialidad opcional de texto libre, licencias o referencias de ARC.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 2 | Se rechaza sin cambios | `PER_ACCESO_DENEGADO` |
| Empresa o referencia cruzada | 3 | Se rechaza | `PER_TENANT_INVALIDO` |
| Documento repetido | 3 | Se rechaza | `PER_DOCUMENTO_DUPLICADO` |
| Datos inválidos | 3 | Se rechaza | `PER_EMPLEADO_INVALIDO` |
| Sin cupo activo | 4 | Se rechaza | `PER_LIMITE_EMPLEADOS_ALCANZADO` |
| Transición inválida | 5 | Se rechaza | `PER_TRANSICION_EMPLEADO_INVALIDA` |

**Postcondiciones**

- La ficha y todos sus períodos permanecen trazables.

**Escenarios de aceptación**

```gherkin
@PER-UC-001 @AC-01
Escenario: Crear un Empleado válido
  Dado un Administrador con cupo disponible en su Empresa
  Cuando registra los datos obligatorios de un documento no utilizado
  Entonces se crea un Empleado ACTIVO de esa Empresa

@PER-UC-001 @AC-02
Escenario: Reingresar sin duplicar la ficha
  Dado un Empleado INACTIVO con períodos anteriores
  Cuando el Administrador lo reactiva
  Entonces se abre un nuevo período y se conserva la historia

@PER-UC-001 @AC-03
Escenario: Rechazar documento duplicado
  Dado otro Empleado con el mismo tipo y número en la Empresa
  Cuando el Administrador intenta crearlo
  Entonces se rechaza con PER_DOCUMENTO_DUPLICADO

@PER-UC-001 @AC-04
Escenario: Denegar administración al Capataz
  Dado un Capataz autenticado
  Cuando intenta modificar la ficha laboral de otro Empleado
  Entonces se rechaza con PER_ACCESO_DENEGADO
```

### PER-UC-002 — Habilitar o revocar acceso de un Empleado

- **Estado:** Aprobado
- **Actor:** Administrador; ACC como sistema participante.
- **Objetivo:** Vincular una ficha activa con acceso o revocarlo al finalizar el vínculo laboral.
- **Requerimientos:** `PER-REQ-003`.
- **Reglas:** `PER-BR-007`, `PER-BR-008`.

**Precondiciones**

- Existe una ficha de Empleado en la Empresa.

**Flujo principal**

1. El Administrador solicita habilitar acceso e informa correo, contraseña inicial, roles y permisos para ACC.
2. El sistema verifica `PER-BR-007`.
3. PER entrega `empleadoId`, Empresa y estado laboral a ACC mediante `PER-DEP-003`.
4. ACC crea la Cuenta de Empresa y conserva el vínculo conforme a su propia especificación.
5. PER informa el resultado sin copiar la Cuenta, credenciales, roles ni vinculación.

**Flujos alternativos**

- **A1 — Inactivación laboral**: PER solicita suspensión de Cuenta y revocación de Sesiones conforme a `PER-BR-008`.
- **A2 — Reactivación laboral**: la ficha vuelve a ACTIVO sin habilitar automáticamente el acceso.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 1 | Se rechaza | `PER_ACCESO_DENEGADO` |
| Ficha INACTIVA para habilitación | 2 | Se rechaza | `PER_ACCESO_EMPLEADO_INVALIDO` |
| ACC falla al suspender durante inactivación | A1 | Se revierte la operación completa | `PER_SUSPENSION_ACCESO_FALLIDA` |

**Postcondiciones**

- Las credenciales y autorizaciones permanecen bajo ACC.

**Escenarios de aceptación**

```gherkin
@PER-UC-002 @AC-01
Escenario: Habilitar acceso a un Empleado activo
  Dado un Empleado ACTIVO sin acceso
  Cuando el Administrador solicita habilitarlo con los datos requeridos por ACC
  Entonces ACC crea la Cuenta de Empresa vinculada mediante empleadoId
  Y PER no duplica la Cuenta ni su referencia

@PER-UC-002 @AC-02
Escenario: Suspender acceso al inactivar
  Dado un Empleado con acceso activo
  Cuando el Administrador finaliza su vínculo laboral
  Entonces ACC suspende la Cuenta y revoca las Sesiones

@PER-UC-002 @AC-03
Escenario: Denegar habilitación sobre una ficha inactiva
  Dado un Empleado INACTIVO
  Cuando se solicita habilitarlo como Capataz
  Entonces se rechaza con PER_ACCESO_EMPLEADO_INVALIDO
```

### PER-UC-003 — Administrar restricciones e indisponibilidades

- **Estado:** Aprobado
- **Actor:** Administrador.
- **Objetivo:** Mantener información operativa y períodos justificados que afectan la disponibilidad del Empleado.
- **Requerimientos:** `PER-REQ-004`.
- **Reglas:** `PER-BR-004`, `PER-BR-021`, `PER-BR-022`, `PER-BR-028`.

**Precondiciones**

- El Empleado pertenece a la Empresa del Administrador.

**Flujo principal**

1. El Administrador selecciona una restricción o indisponibilidad.
2. El sistema verifica permiso y Empresa.
3. El sistema valida `PER-BR-021` o `PER-BR-022`.
4. Si existe evidencia, registra una referencia de `PER-DEP-004`.
5. El sistema conserva la vigencia y actualiza la disponibilidad operativa.

**Flujos alternativos**

- **A1 — Anulación**: el Administrador anula conforme a `PER-BR-028`.
- **A2 — Consulta operativa**: el Capataz obtiene solo el mensaje permitido mediante `PER-UC-013`.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Capataz intenta administrar | 2 | Se rechaza | `PER_ACCESO_DENEGADO` |
| Restricción expone información no permitida | 3 | Se rechaza | `PER_RESTRICCION_INVALIDA` |
| Indisponibilidad inválida | 3 | Se rechaza | `PER_INDISPONIBILIDAD_INVALIDA` |
| Anulación sin auditoría completa | A1 | Se rechaza sin cambios | `PER_ANULACION_NOVEDAD_INVALIDA` |

**Postcondiciones**

- La disponibilidad puede validarse al registrar asistencia.

**Escenarios de aceptación**

```gherkin
@PER-UC-003 @AC-01
Escenario: Registrar vacaciones
  Dado un Empleado activo y disponible
  Cuando el Administrador registra VACACIONES con vigencia
  Entonces el período queda disponible para validar la asistencia

@PER-UC-003 @AC-02
Escenario: Anular una indisponibilidad con auditoría
  Dado una indisponibilidad vigente
  Cuando el Administrador la anula indicando un motivo
  Entonces se conservan la Cuenta de Empresa del actor, la fecha y hora y el motivo
  Y la indisponibilidad permanece en la historia

@PER-UC-003 @AC-03
Escenario: Denegar creación al Capataz
  Dado un Capataz autenticado
  Cuando intenta crear una licencia
  Entonces se rechaza con PER_ACCESO_DENEGADO
```

### PER-UC-004 — Crear una Cuadrilla

- **Estado:** Aprobado
- **Actor:** Capataz.
- **Objetivo:** Crear un grupo de trabajo dentro de su Empresa y quedar como responsable inicial.
- **Requerimientos:** `PER-REQ-005`.
- **Reglas:** `PER-BR-001`, `PER-BR-009` a `PER-BR-012`.

**Precondiciones**

- El Capataz tiene acceso activo en la Empresa.

**Flujo principal**

1. El Capataz informa el nombre de la Cuadrilla.
2. El sistema verifica Empresa y permiso.
3. El sistema genera el siguiente código conforme a `PER-BR-009`.
4. Crea la Cuadrilla ACTIVA sin territorio propio.
5. Registra al Capataz como creador y responsable vigente.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Rol sin permiso | 2 | Se rechaza | `PER_ACCESO_DENEGADO` |
| Se agotaron los códigos | 3 | Se rechaza | `PER_CODIGOS_CUADRILLA_AGOTADOS` |
| Nombre inválido | 4 | Se rechaza | `PER_TRANSICION_CUADRILLA_INVALIDA` |

**Postcondiciones**

- La Cuadrilla posee un código inmutable y responsable vigente.

**Escenarios de aceptación**

```gherkin
@PER-UC-004 @AC-01
Escenario: Crear una Cuadrilla
  Dado un Capataz con acceso activo
  Cuando informa un nombre válido
  Entonces se crea una Cuadrilla ACTIVA con código automático

@PER-UC-004 @AC-02
Escenario: Repetir nombre sin repetir código
  Dado otra Cuadrilla con el mismo nombre
  Cuando el Capataz crea una nueva
  Entonces se acepta con otro código

@PER-UC-004 @AC-03
Escenario: Denegar creación al Empleado
  Dado un Empleado con acceso sin rol Capataz
  Cuando intenta crear una Cuadrilla
  Entonces se rechaza con PER_ACCESO_DENEGADO
```

### PER-UC-005 — Administrar una Cuadrilla

- **Estado:** Aprobado
- **Actor:** Capataz responsable; Administrador para supervisión.
- **Objetivo:** Mantener nombre, estado, integrantes y líder conservando su historia.
- **Requerimientos:** `PER-REQ-005`, `PER-REQ-006`.
- **Reglas:** `PER-BR-010`, `PER-BR-011`, `PER-BR-013`, `PER-BR-014`.

**Precondiciones**

- La Cuadrilla pertenece a la Empresa del actor.

**Flujo principal**

1. El actor selecciona una Cuadrilla.
2. El sistema aplica `PER-BR-011`.
3. El actor solicita modificar nombre, estado, integrantes o líder.
4. El sistema aplica `PER-BR-010`, `PER-BR-013` y `PER-BR-014`.
5. El sistema registra el cambio con su vigencia e historia.

**Flujos alternativos**

- **A1 — Reincorporación**: se abre un período nuevo para un integrante anterior.
- **A2 — Salida del líder**: se finaliza su membresía y el liderazgo queda vacante.
- **A3 — Inactivación**: no admite nuevas operaciones hasta reactivarse.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Capataz no responsable | 2 | Se rechaza | `PER_CAPATAZ_NO_RESPONSABLE` |
| Cuadrilla INACTIVA para incorporar | 4 | Se rechaza | `PER_TRANSICION_CUADRILLA_INVALIDA` |
| Membresía o líder inválidos | 4 | Se rechaza | `PER_MEMBRESIA_SUPERPUESTA` o `PER_LIDER_INVALIDO` |

**Postcondiciones**

- La composición actual se deriva de períodos vigentes y la historia se conserva.

**Escenarios de aceptación**

```gherkin
@PER-UC-005 @AC-01
Escenario: Incorporar un Empleado a varias Cuadrillas
  Dado un Empleado ACTIVO ya integrante de otra Cuadrilla
  Cuando el Capataz responsable lo incorpora
  Entonces se crea una membresía vigente sin Cuadrilla principal

@PER-UC-005 @AC-02
Escenario: Reincorporar un integrante
  Dado un período de membresía finalizado
  Cuando el Capataz lo reincorpora
  Entonces se crea otro período y se conserva el anterior

@PER-UC-005 @AC-03
Escenario: Denegar modificación a otro Capataz
  Dado un Capataz que no es responsable
  Cuando intenta cambiar los integrantes
  Entonces se rechaza con PER_CAPATAZ_NO_RESPONSABLE
```

### PER-UC-006 — Reasignar y auditar una Cuadrilla

- **Estado:** Aprobado
- **Actor:** Administrador.
- **Objetivo:** Consultar toda la historia y transferir la responsabilidad operativa.
- **Requerimientos:** `PER-REQ-007`.
- **Reglas:** `PER-BR-001`, `PER-BR-010`, `PER-BR-011`, `PER-BR-014`.

**Precondiciones**

- La Cuadrilla pertenece a la Empresa del Administrador.

**Flujo principal**

1. El Administrador consulta la Cuadrilla, responsables, integrantes y líder históricos.
2. El sistema verifica permiso y Empresa.
3. El Administrador selecciona otro Capataz activo como responsable.
4. El sistema finaliza la responsabilidad anterior e inicia la nueva.
5. El creador original permanece sin cambios.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 2 | Se rechaza | `PER_ACCESO_DENEGADO` |
| Capataz destino ajeno o inactivo | 3 | Se rechaza | `PER_CAPATAZ_NO_RESPONSABLE` |

**Postcondiciones**

- Existe un responsable operativo vigente y la historia anterior permanece disponible.

**Escenarios de aceptación**

```gherkin
@PER-UC-006 @AC-01
Escenario: Reasignar una Cuadrilla
  Dado una Cuadrilla cuyo creador dejó de operar
  Cuando el Administrador designa otro Capataz activo
  Entonces el nuevo responsable puede administrarla y se conserva el creador

@PER-UC-006 @AC-02
Escenario: Consultar historia completa
  Dado una Cuadrilla con cambios de integrantes y responsables
  Cuando el Administrador consulta su historia
  Entonces obtiene todos los períodos

@PER-UC-006 @AC-03
Escenario: Denegar historial al Empleado
  Dado un Empleado con acceso
  Cuando intenta consultar la historia de una Cuadrilla
  Entonces se rechaza con PER_ACCESO_DENEGADO
```

### PER-UC-007 — Consultar la composición actual

- **Estado:** Aprobado
- **Actor:** Capataz responsable; Administrador.
- **Objetivo:** Conocer integrantes y líder vigentes sin exponer períodos históricos al Capataz.
- **Requerimientos:** `PER-REQ-007`.
- **Reglas:** `PER-BR-011`, `PER-BR-013`, `PER-BR-014`, `PER-BR-021`.

**Precondiciones**

- La Cuadrilla pertenece a la Empresa del actor.

**Flujo principal**

1. El actor solicita la composición actual.
2. El sistema verifica Empresa y, para Capataz, `PER-BR-011`.
3. El sistema obtiene membresías vigentes y líder actual.
4. Devuelve solo los datos permitidos para el actor.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Capataz no responsable | 2 | Se rechaza | `PER_CAPATAZ_NO_RESPONSABLE` |
| Referencia de otro tenant | 2 | Se rechaza | `PER_TENANT_INVALIDO` |

**Escenarios de aceptación**

```gherkin
@PER-UC-007 @AC-01
Escenario: Capataz consulta su Cuadrilla
  Dado un Capataz responsable vigente
  Cuando solicita la composición actual
  Entonces obtiene integrantes y líder vigentes sin períodos anteriores

@PER-UC-007 @AC-02
Escenario: Administrador consulta composición e historia
  Dado un Administrador de la Empresa
  Cuando consulta la Cuadrilla
  Entonces puede acceder a la vista actual y derivar a PER-UC-006 para la historia

@PER-UC-007 @AC-03
Escenario: Denegar otra Cuadrilla al Capataz
  Dado un Capataz no responsable
  Cuando solicita la composición
  Entonces se rechaza con PER_CAPATAZ_NO_RESPONSABLE
```

### PER-UC-008 — Registrar y confirmar asistencia

- **Estado:** Aprobado
- **Actor:** Capataz.
- **Objetivo:** Registrar el resultado diario y, cuando corresponda, los intervalos de cualquier Empleado activo de su Empresa.
- **Requerimientos:** `PER-REQ-008`.
- **Reglas:** `PER-BR-015`, `PER-BR-016`, `PER-BR-017`, `PER-BR-018`, `PER-BR-019`, `PER-BR-021`, `PER-BR-022`.

**Precondiciones**

- El Capataz y el Empleado pertenecen a la misma Empresa.

**Flujo principal**

1. El Capataz busca un Empleado activo usando los datos operativos permitidos.
2. El sistema aplica `PER-BR-015` y muestra disponibilidad y mensajes vigentes.
3. El Capataz inicia la Asistencia; el sistema aplica `PER-BR-016`.
4. El Capataz indica resultado e intervalos opcionales con sus notas.
5. El sistema aplica `PER-BR-017` a `PER-BR-019` y `PER-BR-022`.
6. El Capataz confirma la Asistencia.

**Flujos alternativos**

- **A1 — Solo presencia**: para una modalidad distinta de POR_HORA se confirma PRESENTE sin intervalos.
- **A2 — Indisponibilidad**: se registra AUSENCIA_JUSTIFICADA sin exponer evidencia.
- **A3 — Ya iniciada**: otro Capataz ve el estado y al responsable, sin duplicarla.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Otro tenant o ficha INACTIVA | 2 | Se rechaza | `PER_ASISTENCIA_FUERA_DE_ALCANCE` |
| Asistencia diaria existente | 3 | No se duplica | `PER_ASISTENCIA_DUPLICADA` |
| Resultado incompatible con indisponibilidad | 5 | Se rechaza | `PER_RESULTADO_ASISTENCIA_INVALIDO` |
| Intervalo inválido | 5 | Se rechaza | `PER_INTERVALO_ASISTENCIA_INVALIDO` |
| POR_HORA sin intervalos cerrados | 5 | Se rechaza | `PER_HORAS_REQUERIDAS` |

**Postcondiciones**

- Existe una única Asistencia confirmada por Empleado y fecha.

**Escenarios de aceptación**

```gherkin
@PER-UC-008 @AC-01
Escenario: Confirmar presencia sin horarios
  Dado un Empleado disponible con modalidad MENSUAL
  Cuando el Capataz confirma PRESENTE sin intervalos
  Entonces se conserva la asistencia del día

@PER-UC-008 @AC-02
Escenario: Confirmar varios intervalos por hora
  Dado un Empleado con modalidad POR_HORA
  Cuando el Capataz registra intervalos cerrados y no superpuestos
  Entonces se confirma la asistencia y se conservan sus minutos

@PER-UC-008 @AC-03
Escenario: Rechazar presente durante vacaciones
  Dado un Empleado con VACACIONES vigentes
  Cuando el Capataz intenta marcar PRESENTE
  Entonces se rechaza con PER_RESULTADO_ASISTENCIA_INVALIDO

@PER-UC-008 @AC-04
Escenario: Evitar duplicado entre Capataces
  Dado una asistencia iniciada por otro Capataz
  Cuando un segundo Capataz intenta crearla para la misma fecha
  Entonces se rechaza con PER_ASISTENCIA_DUPLICADA
```

### PER-UC-009 — Corregir una asistencia confirmada

- **Estado:** Aprobado
- **Actor:** Administrador.
- **Objetivo:** Corregir un registro confirmado sin perder el valor anterior.
- **Requerimientos:** `PER-REQ-009`.
- **Reglas:** `PER-BR-017` a `PER-BR-020`, `PER-BR-022`.

**Precondiciones**

- La Asistencia está confirmada y pertenece a la Empresa.

**Flujo principal**

1. El Administrador consulta la Asistencia y sus versiones.
2. Informa resultado corregido, intervalos y motivo obligatorio.
3. El sistema aplica las reglas de asistencia vigentes.
4. Conserva la versión anterior y registra la nueva.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Capataz intenta corregir confirmada | 1 | Se rechaza | `PER_ASISTENCIA_CONFIRMADA` |
| Falta motivo | 2 | Se rechaza | `PER_ASISTENCIA_CONFIRMADA` |
| Corrección inválida | 3 | Se rechaza | Código de la regla incumplida |

**Escenarios de aceptación**

```gherkin
@PER-UC-009 @AC-01
Escenario: Corregir con motivo
  Dado una Asistencia confirmada
  Cuando el Administrador corrige el egreso e informa motivo
  Entonces se crea una versión nueva y se conserva la anterior

@PER-UC-009 @AC-02
Escenario: Rechazar corrección sin motivo
  Dado una Asistencia confirmada
  Cuando el Administrador intenta corregirla sin motivo
  Entonces se rechaza con PER_ASISTENCIA_CONFIRMADA

@PER-UC-009 @AC-03
Escenario: Denegar corrección al Capataz
  Dado el Capataz que confirmó la Asistencia
  Cuando intenta modificarla después de confirmar
  Entonces se rechaza con PER_ASISTENCIA_CONFIRMADA
```

### PER-UC-010 — Consultar información laboral propia

- **Estado:** Aprobado
- **Actor:** Empleado o Capataz con Cuenta de Empresa; Administrador solo cuando tenga ficha propia.
- **Objetivo:** Consultar su ficha, asistencias e indisponibilidades en modo de solo lectura.
- **Requerimientos:** `PER-REQ-010`.
- **Reglas:** `PER-BR-001`, `PER-BR-007`, `PER-BR-017`, `PER-BR-021`, `PER-BR-022`.

**Precondiciones**

- La Cuenta de Empresa está vinculada con una ficha PER.

**Flujo principal**

1. El actor solicita su información.
2. El sistema resuelve la ficha vinculada mediante `PER-DEP-003`.
3. Obtiene datos propios, asistencia e indisponibilidades.
4. Excluye datos administrativos internos y evidencia privada no autorizada.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Cuenta sin ficha laboral | 2 | Se rechaza | `PER_ACCESO_EMPLEADO_INVALIDO` |
| Solicita ficha ajena | 3 | Se rechaza | `PER_ACCESO_DENEGADO` |

**Escenarios de aceptación**

```gherkin
@PER-UC-010 @AC-01
Escenario: Empleado consulta su asistencia
  Dado un Empleado con Cuenta de Empresa vinculada
  Cuando solicita sus asistencias
  Entonces obtiene únicamente sus registros

@PER-UC-010 @AC-02
Escenario: Ocultar datos administrativos
  Dado un Empleado que consulta su ficha
  Cuando se prepara la respuesta
  Entonces no se exponen datos internos ni evidencia privada no autorizada

@PER-UC-010 @AC-03
Escenario: Denegar consulta ajena
  Dado un Empleado con acceso
  Cuando solicita la ficha de otro Empleado
  Entonces se rechaza con PER_ACCESO_DENEGADO
```

### PER-UC-011 — Configurar remuneración

- **Estado:** Aprobado
- **Actor:** Administrador.
- **Objetivo:** Definir modalidad y valores generales o específicos por Empleado con vigencia.
- **Requerimientos:** `PER-REQ-011`, `PER-REQ-013`.
- **Reglas:** `PER-BR-023` a `PER-BR-025`, `PER-BR-027`.

**Precondiciones**

- La Empresa está vigente.

**Flujo principal**

1. El Administrador selecciona alcance general o un Empleado.
2. Informa modalidad, vigencia y valores aplicables.
3. El sistema aplica `PER-BR-023` a `PER-BR-025`.
4. Si la tarifa depende de Labor o producción, aplica `PER-BR-027`.
5. Conserva la versión de configuración.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin permiso | 1 | Se rechaza | `PER_ACCESO_DENEGADO` |
| Modalidad inválida | 3 | Se rechaza | `PER_MODALIDAD_REMUNERACION_INVALIDA` |
| Vigencia o valor inválidos | 3 | Se rechaza | `PER_CONFIGURACION_REMUNERACION_INVALIDA` |

**Escenarios de aceptación**

```gherkin
@PER-UC-011 @AC-01
Escenario: Configurar modalidad general
  Dado una Empresa sin configuración vigente
  Cuando el Administrador establece JORNAL con vigencia
  Entonces se conserva la configuración general

@PER-UC-011 @AC-02
Escenario: Configurar excepción por Empleado
  Dado una configuración general MENSUAL
  Cuando el Administrador asigna POR_HORA a un Empleado
  Entonces la excepción tiene precedencia para ese Empleado

@PER-UC-011 @AC-03
Escenario: Configurar una tarifa por tipo de Labor
  Dado un tipo de Labor definido por LAB
  Cuando el Administrador configura en PER su tarifa por hora
  Entonces PER conserva la tarifa y la referencia al tipo de Labor
```

### PER-UC-012 — Calcular remuneración bruta

- **Estado:** Aprobado
- **Actor:** Administrador; LAB o COS como proveedores; ECO como consumidor.
- **Objetivo:** Obtener y conservar el bruto devengado a partir de hechos y cantidades individuales confirmados.
- **Requerimientos:** `PER-REQ-012`, `PER-REQ-013`.
- **Reglas:** `PER-BR-024` a `PER-BR-027`.

**Precondiciones**

- Existen una modalidad aplicable, valores vigentes y hechos confirmados.

**Flujo principal**

1. El actor solicita calcular un período para un Empleado.
2. PER resuelve la configuración mediante `PER-BR-024`.
3. Obtiene asistencia, Labores o producción confirmadas según la modalidad.
4. Fija valores aplicados conforme a `PER-BR-025`.
5. Calcula la composición mediante `PER-BR-026`.
6. Conserva el devengo y lo ofrece a ECO mediante `PER-DEP-007`.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Sin configuración | 2 | Se rechaza | `PER_CONFIGURACION_REMUNERACION_INEXISTENTE` |
| Hecho no confirmado o cantidad ausente | 3 | Se rechaza | `PER_CALCULO_REMUNERACION_INVALIDO` |
| Intento de cambiar historia | 4 | Se rechaza | `PER_TARIFA_HISTORICA_INMUTABLE` |

**Escenarios de aceptación**

```gherkin
@PER-UC-012 @AC-01
Escenario: Calcular horas confirmadas
  Dado un Empleado POR_HORA con intervalos y tarifa confirmados
  Cuando se calcula el período
  Entonces el bruto conserva horas, tarifa y resultado

@PER-UC-012 @AC-02
Escenario: No prorratear automáticamente un mensual
  Dado un Empleado MENSUAL con ausencias registradas
  Cuando se calcula el importe base
  Entonces se usa el importe fijo sin descuento automático

@PER-UC-012 @AC-03
Escenario: Calcular remuneración por producción
  Dado una tarifa POR_PRODUCCION vigente en PER y una cantidad confirmada por COS
  Cuando se calcula el período
  Entonces el bruto conserva la cantidad, la tarifa y el resultado
```

### PER-UC-013 — Resolver contexto de Personal

- **Estado:** Aprobado
- **Actor:** Administrador, Capataz o Empleado; ACC, LAB, COS o ECO como sistemas autorizados.
- **Objetivo:** Entregar únicamente los datos de Personal necesarios para una operación autorizada.
- **Requerimientos:** `PER-REQ-014`.
- **Reglas:** `PER-BR-001`, `PER-BR-007`, `PER-BR-011`, `PER-BR-015`, `PER-BR-021` a `PER-BR-027`.

**Precondiciones**

- El consumidor presenta contexto autorizado y propósito conocido.

**Flujo principal**

1. El consumidor solicita identidad laboral, estado, disponibilidad, Cuadrilla o contexto de remuneración.
2. El sistema verifica Empresa, permiso y propósito.
3. Aplica las reglas de minimización y dominio correspondientes.
4. Devuelve referencias y datos mínimos sin credenciales, binarios ni datos ajenos.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| Tenant o propósito inválidos | 2 | Se rechaza | `PER_TENANT_INVALIDO` |
| Actor sin alcance | 3 | Se rechaza | `PER_ACCESO_DENEGADO` |

**Escenarios de aceptación**

```gherkin
@PER-UC-013 @AC-01
Escenario: ACC valida una ficha activa
  Dado una solicitud autorizada de ACC
  Cuando consulta la referencia laboral de un Capataz
  Entonces PER informa identidad, Empresa y estado sin copiar credenciales

@PER-UC-013 @AC-02
Escenario: Capataz obtiene datos mínimos sin evidencia privada
  Dado un Empleado activo con una indisponibilidad que posee evidencia privada
  Cuando un Capataz de la Empresa consulta su contexto para registrar asistencia
  Entonces obtiene solo los datos aprobados por PER-Q-034
  Y no obtiene diagnósticos ni evidencia privada

@PER-UC-013 @AC-03
Escenario: Rechazar consulta entre tenants
  Dado un identificador válido de otra Empresa
  Cuando un consumidor intenta resolverlo
  Entonces se rechaza con PER_TENANT_INVALIDO
```
