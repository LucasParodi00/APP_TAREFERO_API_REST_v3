---
type: use-cases
module: "ACC"
status: Aprobado
owner: "Analista"
---

# Identidad y acceso — Casos de uso

## 1. Actores

| Actor | Tipo | Origen |
|---|---|---|
| SuperAdministrador | Rol | `B-04`, `B-05`, `B-12`, `ACC-Q-007` |
| Administrador | Rol | `B-05`, `B-08`, `B-15`, `B-16` |
| Capataz | Rol | `B-01`, `ACC-Q-006` |
| Empleado | Rol | `B-01`, `ACC-Q-006`; solo cuando disponga de Cuenta de Empresa |
| Proceso de inicialización | Sistema | `ACC-Q-007` |
| PER | Sistema | `ACC-Q-019`; participa al habilitar o vincular acceso de un Empleado |
| TER | Sistema | `ACC-Q-022`, `ACC-Q-023`; valida la identidad, Empresa y estado de la Chacra mediante `ACC-DEP-005` |

## 2. Permisos

La matriz describe el alcance aprobado de ACC. No concede permisos en los demás módulos. Los permisos generales se comprueban además de las condiciones indicadas. Las decisiones de consulta, ciclo de vida y cambio de contraseña provienen de `ACC-Q-016` y `ACC-Q-018`.

| Caso de uso | SuperAdministrador | Administrador | Capataz | Empleado | Condición |
|---|:---:|:---:|:---:|:---:|---|
| `ACC-UC-001` | Cond. | Cond. | No | No | `ACC-BR-002`, `ACC-BR-011` para soporte; alta inicial según `ACC-Q-015` |
| `ACC-UC-002` | No | Cond. | Cond. | Cond. | Credenciales propias; autenticación de plataforma fuera de este caso |
| `ACC-UC-003` | No | Cond. | Cond. | Cond. | `ACC-BR-002`; soporte usa `ACC-UC-007` |
| `ACC-UC-004` | No | Cond. | Cond. | Cond. | `ACC-BR-013` |
| `ACC-UC-005` | Cond. | Cond. | No | No | `ACC-BR-010`, `ACC-BR-011` para soporte |
| `ACC-UC-006` | Sí | No | No | No | Excepción de inicialización: `ACC-Q-007` |
| `ACC-UC-007` | Cond. | No | No | No | `ACC-BR-011` |
| `ACC-UC-008` | Cond. | Cond. | No | No | `ACC-BR-002`, `ACC-BR-011` para soporte; `ACC-Q-016` |
| `ACC-UC-009` | No | Cond. | Cond. | Cond. | Sesión propia, según fundación |
| `ACC-UC-010` | Cond. | Cond. | No | No | `ACC-BR-002`, `ACC-BR-011` para soporte; `ACC-Q-016` |
| `ACC-UC-011` | Cond. | Cond. | No | No | `ACC-BR-002`, `ACC-BR-011` para soporte; `ACC-Q-016` |
| `ACC-UC-012` | Cond. | Cond. | No | No | `ACC-BR-002`, `ACC-BR-015`, `ACC-BR-021`, `ACC-BR-022`; PER provee la referencia laboral |
| `ACC-UC-013` | Cond. | Cond. | No | No | `ACC-BR-002`, `ACC-BR-023` a `ACC-BR-026`; soporte requiere `ACC-BR-011` |
| `ACC-UC-014` | Cond. | Cond. | No | No | `ACC-BR-002`, `ACC-BR-026`, `ACC-BR-027`; soporte requiere `ACC-BR-011` |
| `ACC-UC-015` | Cond. | Cond. | No | No | `ACC-BR-002`, `ACC-BR-023` a `ACC-BR-027`; soporte requiere `ACC-BR-011` |
| `ACC-UC-016` | Cond. | Cond. | Cond. | No | Administrador: todas las de su Empresa; Capataz: solo propias ACTIVA; soporte: `ACC-BR-011`; aplica `ACC-BR-029` |
| `ACC-UC-017` | No | No | Cond. | No | Cuenta ACTIVA con rol Capataz; `ACC-BR-028` |

PER no obtiene permisos de administración propios: participa en `ACC-UC-001` y `ACC-UC-012` como sistema, después de una solicitud autorizada del Administrador o del flujo explícito de plataforma.

TER tampoco obtiene permisos de administración: participa en `ACC-UC-013` y `ACC-UC-015` únicamente para validar la referencia territorial mediante `ACC-DEP-005`.

## 3. Casos de uso

### ACC-UC-001 — Habilitar una Cuenta de Empresa

- **Estado:** Aprobado
- **Actor:** Administrador o SuperAdministrador.
- **Objetivo:** Habilitar una Cuenta de Empresa.
- **Requerimientos:** `ACC-REQ-001`.
- **Reglas:** `ACC-BR-001`, `ACC-BR-002`, `ACC-BR-003`, `ACC-BR-004`, `ACC-BR-006`, `ACC-BR-007`, `ACC-BR-015`, `ACC-BR-016`, `ACC-BR-018`, `ACC-BR-019`, `ACC-BR-021`.

**Precondiciones**

- La Empresa está registrada y el actor dispone de un contexto autorizado. Si se informa `empleadoId`, PER confirma que el Empleado está ACTIVO y pertenece a esa Empresa. El Administrador inicial no requiere Empleado, conforme a `ACC-Q-019`.

**Flujo principal**

1. El actor solicita crear una Cuenta de Empresa indicando correo, contraseña, canales y roles; cuando el acceso corresponde a un Empleado, PER aporta su `empleadoId` validado.
2. El sistema comprueba el permiso y ACC-BR-002.
3. El sistema valida ACC-BR-001, ACC-BR-003, ACC-BR-004, ACC-BR-007, ACC-BR-015, ACC-BR-018, ACC-BR-019 y ACC-BR-021; solo consulta ACC-DEP-003 cuando existe vínculo laboral.
4. El sistema valida ACC-BR-006 mediante ACC-DEP-002.
5. El sistema registra la Cuenta de Empresa aplicando ACC-BR-016 y el control concurrente de convenciones.md §3.5.
6. El sistema informa el resultado sin devolver la contraseña ni su representación protegida.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_ACCESO_DENEGADO` |
| No se cumple `ACC-BR-001` | 3 | Se rechaza sin ejecutar el cambio solicitado | `ACC_CUENTA_EMPRESA_INCOMPATIBLE` |
| No se cumple `ACC-BR-002` | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_EMPRESA_FUERA_DE_ALCANCE` |
| No se cumple `ACC-BR-003` | 3 | Se rechaza sin ejecutar el cambio solicitado | `ACC_CORREO_DUPLICADO` |
| No se cumple `ACC-BR-004` | 3 | Se rechaza sin ejecutar el cambio solicitado | `ACC_CREDENCIALES_REQUERIDAS` |
| No se cumple `ACC-BR-018` | 3 | Se rechaza sin ejecutar el cambio solicitado | `ACC_CORREO_INVALIDO` |
| No se cumple `ACC-BR-019` | 3 | Se rechaza sin ejecutar el cambio solicitado | `ACC_CONTRASENIA_INVALIDA` |
| No se cumple `ACC-BR-006` | 4 | Se rechaza sin ejecutar el cambio solicitado | `ACC_LIMITE_ACCESOS_ALCANZADO` |
| No se cumple `ACC-BR-007` | 3 | Se rechaza sin ejecutar el cambio solicitado | `ACC_ROL_NO_ADMITIDO` |
| Empleado inexistente, INACTIVO o ajeno a la Empresa cuando el rol exige vínculo | 3 | Se rechaza; los fallos relevantes se auditan | `ACC_EMPLEADO_NO_DISPONIBLE` |
| Dependencia comercial no disponible | 4 | Se rechaza; los fallos relevantes se auditan | `ACC_VALIDACION_COMERCIAL_NO_DISPONIBLE` |
| No se cumple `ACC-BR-015` | 3 | Se rechaza sin confirmar efectos parciales | `ACC_CUENTA_EMPLEADO_DUPLICADA` |
| No se cumple `ACC-BR-016` | 3 | Se rechaza sin confirmar efectos parciales | `ACC_TRANSICION_NO_PERMITIDA` |
| No se cumple `ACC-BR-021` | 3 | Se rechaza sin confirmar efectos parciales | `ACC_VINCULO_EMPLEADO_INVALIDO` |

**Postcondiciones**

- La cuenta queda habilitada con los canales y roles solicitados; el resultado queda auditado.

**Escenarios de aceptación**

```gherkin
@ACC-UC-001 @AC-01
Escenario: Habilitar una Cuenta de Empresa dentro del alcance permitido
  Dado el actor autorizado y las precondiciones de este caso satisfechas
  Cuando solicita habilitar una cuenta de empresa
  Entonces la Cuenta de Empresa queda habilitada con correo, canales y roles propios, sin revelar su contraseña

@ACC-UC-001 @AC-02
Escenario: Rechazar una solicitud sin permiso
  Dado un actor sin autorización para esta operación
  Cuando solicita habilitar una cuenta de empresa
  Entonces se rechaza con ACC_ACCESO_DENEGADO
  Y no se ejecuta el cambio solicitado

@ACC-UC-001 @AC-03
Escenario: Verificar cuentas independientes por empresa
  Dado que el Empleado destino pertenece a una Empresa distinta de la cuenta solicitada
  Cuando solicita habilitar una cuenta de empresa
  Entonces se rechaza con ACC_CUENTA_EMPRESA_INCOMPATIBLE

@ACC-UC-001 @AC-04
Escenario: Verificar pertenencia al contexto autorizado
  Dado que un Administrador autenticado en Empresa A solicita una cuenta para Empresa B
  Cuando solicita habilitar una cuenta de empresa
  Entonces se rechaza con ACC_EMPRESA_FUERA_DE_ALCANCE

@ACC-UC-001 @AC-05
Escenario: Verificar correo único dentro de la empresa
  Dado el correo ya corresponde a otra cuenta de la misma Empresa
  Cuando solicita habilitar una cuenta de empresa
  Entonces se rechaza con ACC_CORREO_DUPLICADO

@ACC-UC-001 @AC-06
Escenario: Verificar credenciales para habilitar acceso
  Dado se solicita habilitación sin contraseña
  Cuando solicita habilitar una cuenta de empresa
  Entonces se rechaza con ACC_CREDENCIALES_REQUERIDAS

@ACC-UC-001 @AC-07
Escenario: Verificar cupo por cuenta activa
  Dado habilitación de otra cuenta sin cupo disponible
  Cuando solicita habilitar una cuenta de empresa
  Entonces se rechaza con ACC_LIMITE_ACCESOS_ALCANZADO

@ACC-UC-001 @AC-08
Escenario: Verificar roles iniciales del sistema
  Dado asignar el rol de plataforma a una Cuenta de Empresa
  Cuando solicita habilitar una cuenta de empresa
  Entonces se rechaza con ACC_ROL_NO_ADMITIDO

@ACC-UC-001 @AC-09
Escenario: Empleado inexistente o ajeno a la Empresa
  Dado un acceso con vínculo laboral cuyo Empleado no existe o pertenece a otra Empresa
  Cuando solicita habilitar una cuenta de empresa
  Entonces se rechaza con ACC_EMPLEADO_NO_DISPONIBLE

@ACC-UC-001 @AC-10
Escenario: Dependencia comercial no disponible
  Dado dependencia comercial no disponible
  Cuando solicita habilitar una cuenta de empresa
  Entonces se rechaza con ACC_VALIDACION_COMERCIAL_NO_DISPONIBLE

@ACC-UC-001 @AC-11
Escenario: Aplicar ACC-BR-015
  Dado que el Empleado ya está vinculado con una cuenta en la misma Empresa, incluso suspendida
  Cuando se solicita la operación de este caso
  Entonces se rechaza con ACC_CUENTA_EMPLEADO_DUPLICADA
  Y no se confirma un cambio parcial

@ACC-UC-001 @AC-12
Escenario: Aplicar ACC-BR-016
  Dado que la habilitación solicita un estado inicial ajeno al ciclo definido
  Cuando se solicita la operación de este caso
  Entonces se rechaza con ACC_TRANSICION_NO_PERMITIDA
  Y no se confirma un cambio parcial

@ACC-UC-001 @AC-13
Escenario: Rechazar un correo de acceso demasiado extenso
  Dado que la habilitación informa un correo de acceso de 255 caracteres luego de eliminar espacios exteriores
  Cuando solicita habilitar una cuenta de empresa
  Entonces se rechaza con ACC_CORREO_INVALIDO

@ACC-UC-001 @AC-14
Escenario: Rechazar una contraseña demasiado corta
  Dado que la habilitación informa una contraseña de 14 caracteres
  Cuando solicita habilitar una cuenta de empresa
  Entonces se rechaza con ACC_CONTRASENIA_INVALIDA

@ACC-UC-001 @AC-15
Escenario: Crear el Administrador inicial sin Empleado
  Dado una Empresa registrada sin Cuenta de Administrador inicial
  Cuando el SuperAdministrador crea una Cuenta con rol Administrador sin empleadoId
  Entonces se crea la Cuenta de Empresa activa sin inventar una Persona ni una ficha laboral

@ACC-UC-001 @AC-16
Escenario: Exigir Empleado para un rol laboral
  Dado una solicitud de Cuenta con rol Capataz o Empleado sin empleadoId activo de la misma Empresa
  Cuando solicita habilitar una cuenta de empresa
  Entonces se rechaza con ACC_VINCULO_EMPLEADO_INVALIDO
```

### ACC-UC-002 — Iniciar sesión en una Empresa

- **Estado:** Aprobado
- **Actor:** Administrador, Capataz o Empleado con Cuenta de Empresa.
- **Objetivo:** Iniciar sesión en una Empresa.
- **Requerimientos:** `ACC-REQ-002`.
- **Reglas:** `ACC-BR-001`, `ACC-BR-005`, `ACC-BR-012`, `ACC-BR-018`, `ACC-BR-019`.

**Precondiciones**

- Existe una Cuenta de Empresa; el titular conoce el alias de la Empresa y sus credenciales.

**Flujo principal**

1. El titular solicita iniciar sesión en un canal indicando alias de Empresa y sus credenciales.
2. El sistema resuelve la Empresa mediante ACC-DEP-001, normaliza el correo según ACC-BR-018 y verifica la contraseña sin transformarla según ACC-BR-019.
3. El sistema aplica ACC-BR-001 y ACC-BR-005 y comprueba la habilitación actual según arquitectura.md §13.2.
4. El sistema crea la Sesión conforme a la fundación y registra el resultado de autenticación.
5. El sistema informa el acceso aplicando ACC-BR-012.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_ACCESO_DENEGADO` |
| No se cumple `ACC-BR-001` | 3 | Se rechaza sin ejecutar el cambio solicitado | `ACC_CUENTA_EMPRESA_INCOMPATIBLE` |
| No se cumple `ACC-BR-005` | 3 | Se rechaza sin ejecutar el cambio solicitado | `ACC_CANAL_NO_HABILITADO` |
| Credenciales o identificación de Empresa no válidas | 2 | Se rechaza; los fallos relevantes se auditan | `ACC_AUTENTICACION_INVALIDA` |
| No se cumple `ACC-BR-018` | 2 | Se rechaza sin iniciar Sesión | `ACC_CORREO_INVALIDO` |
| No se cumple `ACC-BR-019` | 2 | Se rechaza sin iniciar Sesión | `ACC_CONTRASENIA_INVALIDA` |
| Empresa, cuenta o suscripción no habilitada | 3 | Se rechaza; los fallos relevantes se auditan | `ACC_ACCESO_NO_HABILITADO` |

**Postcondiciones**

- Existe una Sesión de Empresa vinculada a la cuenta y al canal autorizado.

**Escenarios de aceptación**

```gherkin
@ACC-UC-002 @AC-01
Escenario: Iniciar sesión en una Empresa dentro del alcance permitido
  Dado el actor autorizado y las precondiciones de este caso satisfechas
  Cuando solicita iniciar sesión en una empresa
  Entonces se inicia una Sesión de esa Cuenta de Empresa en el canal habilitado sin imponer cambio de contraseña

@ACC-UC-002 @AC-02
Escenario: Rechazar una solicitud sin permiso
  Dado un actor sin autorización para esta operación
  Cuando solicita iniciar sesión en una empresa
  Entonces se rechaza con ACC_ACCESO_DENEGADO
  Y no se ejecuta el cambio solicitado

@ACC-UC-002 @AC-03
Escenario: Verificar cuentas independientes por empresa
  Dado que la contraseña presentada solo corresponde a la cuenta de Empresa A y se solicita ingresar a Empresa B
  Cuando solicita iniciar sesión en una empresa
  Entonces se rechaza con ACC_CUENTA_EMPRESA_INCOMPATIBLE

@ACC-UC-002 @AC-04
Escenario: Verificar canal habilitado
  Dado cuenta con acceso exclusivamente web intenta ingresar desde Android
  Cuando solicita iniciar sesión en una empresa
  Entonces se rechaza con ACC_CANAL_NO_HABILITADO

@ACC-UC-002 @AC-05
Escenario: Conservar cambio de contraseña voluntario
  Dado un titular con contraseña asignada administrativamente
  Cuando solicita iniciar sesión en una empresa
  Entonces no se exige cambiar la contraseña como condición adicional

@ACC-UC-002 @AC-06
Escenario: Credenciales o identificación de Empresa no válidas
  Dado credenciales o identificación de Empresa no válidas
  Cuando solicita iniciar sesión en una empresa
  Entonces se rechaza con ACC_AUTENTICACION_INVALIDA

@ACC-UC-002 @AC-07
Escenario: Empresa, cuenta o suscripción no habilitada
  Dado empresa, cuenta o suscripción no habilitada
  Cuando solicita iniciar sesión en una empresa
  Entonces se rechaza con ACC_ACCESO_NO_HABILITADO

@ACC-UC-002 @AC-08
Escenario: Normalizar el correo sin transformar la contraseña
  Dado una cuenta cuyo correo normalizado es titular@ejemplo.com y cuya contraseña contiene mayúsculas y espacios significativos
  Cuando solicita iniciar sesión con espacios exteriores y mayúsculas en el correo y con la contraseña exacta
  Entonces se inicia una Sesión de esa Cuenta de Empresa
```

### ACC-UC-003 — Resolver el acceso vigente de una solicitud

- **Estado:** Aprobado
- **Actor:** Administrador, Capataz o Empleado con Cuenta de Empresa.
- **Objetivo:** Resolver el acceso vigente de una solicitud.
- **Requerimientos:** `ACC-REQ-003`.
- **Reglas:** `ACC-BR-002`, `ACC-BR-007`.

**Precondiciones**

- El actor presenta una Sesión para realizar una operación.

**Flujo principal**

1. El actor solicita una operación autenticada.
2. El sistema aplica las comprobaciones vigentes de arquitectura.md §13.3 y valida ACC-BR-002 y ACC-BR-007.
3. El sistema entrega el contexto autorizado al caso de uso de negocio mediante ACC-DEP-004.
4. El caso de uso consumidor aplica la autorización del recurso y registra el resultado según la fundación.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_ACCESO_DENEGADO` |
| No se cumple `ACC-BR-002` | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_EMPRESA_FUERA_DE_ALCANCE` |
| No se cumple `ACC-BR-007` | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_ROL_NO_ADMITIDO` |
| Sesión ausente, vencida o revocada | 2 | Se rechaza; los fallos relevantes se auditan | `ACC_SESION_NO_VIGENTE` |
| Permiso o alcance insuficiente | 2 | Se rechaza; los fallos relevantes se auditan | `ACC_ACCESO_DENEGADO` |

**Postcondiciones**

- La operación recibe un contexto vigente; este caso no concede por sí mismo permisos sobre recursos del módulo consumidor.

**Escenarios de aceptación**

```gherkin
@ACC-UC-003 @AC-01
Escenario: Resolver el acceso vigente de una solicitud dentro del alcance permitido
  Dado el actor autorizado y las precondiciones de este caso satisfechas
  Cuando solicita resolver el acceso vigente de una solicitud
  Entonces el caso de uso recibe Empresa, Cuenta de Empresa, Sesión, permisos y alcance vigentes

@ACC-UC-003 @AC-02
Escenario: Rechazar una solicitud sin permiso
  Dado un actor sin autorización para esta operación
  Cuando solicita resolver el acceso vigente de una solicitud
  Entonces se rechaza con ACC_ACCESO_DENEGADO
  Y no se ejecuta el cambio solicitado

@ACC-UC-003 @AC-03
Escenario: Verificar pertenencia al contexto autorizado
  Dado que un contexto de Empresa A se intenta aplicar a un recurso de Empresa B
  Cuando solicita resolver el acceso vigente de una solicitud
  Entonces se rechaza con ACC_EMPRESA_FUERA_DE_ALCANCE

@ACC-UC-003 @AC-04
Escenario: Verificar roles iniciales del sistema
  Dado asignar el rol de plataforma a una Cuenta de Empresa
  Cuando solicita resolver el acceso vigente de una solicitud
  Entonces se rechaza con ACC_ROL_NO_ADMITIDO

@ACC-UC-003 @AC-05
Escenario: Sesión ausente, vencida o revocada
  Dado sesión ausente, vencida o revocada
  Cuando solicita resolver el acceso vigente de una solicitud
  Entonces se rechaza con ACC_SESION_NO_VIGENTE

@ACC-UC-003 @AC-06
Escenario: Permiso o alcance insuficiente
  Dado permiso o alcance insuficiente
  Cuando solicita resolver el acceso vigente de una solicitud
  Entonces se rechaza con ACC_ACCESO_DENEGADO
```

### ACC-UC-004 — Cambiar la propia contraseña

- **Estado:** Aprobado
- **Actor:** Administrador, Capataz o Empleado con Cuenta de Empresa.
- **Objetivo:** Cambiar la propia contraseña.
- **Requerimientos:** `ACC-REQ-004`.
- **Reglas:** `ACC-BR-001`, `ACC-BR-005`, `ACC-BR-012`, `ACC-BR-013`, `ACC-BR-014`, `ACC-BR-019`.

**Precondiciones**

- El titular tiene una Sesión autorizada y conoce la contraseña actual de la cuenta.

**Flujo principal**

1. El titular solicita cambiar la contraseña de su propia cuenta, informando la contraseña actual y la nueva.
2. El sistema comprueba el permiso de titular, ACC-BR-001, ACC-BR-005, ACC-BR-013 y ACC-BR-019.
3. El sistema sustituye la credencial conforme a convenciones.md §7.1 y aplica ACC-BR-014 en la misma operación de cambio.
4. El sistema informa el resultado y conserva ACC-BR-012.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_ACCESO_DENEGADO` |
| No se cumple `ACC-BR-001` | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_CUENTA_EMPRESA_INCOMPATIBLE` |
| No se cumple `ACC-BR-005` | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_CANAL_NO_HABILITADO` |
| Solicitud dirigida a una cuenta diferente de la propia | 2 | Se rechaza; los fallos relevantes se auditan | `ACC_ACCESO_DENEGADO` |
| No se cumple `ACC-BR-013` | 2 | Se rechaza sin confirmar efectos parciales | `ACC_CAMBIO_PROPIO_NO_AUTORIZADO` |
| No se cumple `ACC-BR-019` | 2 | Se rechaza sin confirmar efectos parciales | `ACC_CONTRASENIA_INVALIDA` |
| No se cumple `ACC-BR-014` | 3 | Se rechaza sin confirmar efectos parciales | `ACC_CAMBIO_CREDENCIAL_NO_COMPLETADO` |

**Postcondiciones**

- La Cuenta de Empresa tiene la nueva credencial y se cumple ACC-BR-014. El titular debe iniciar una nueva Sesión; la respuesta del cambio no implica una Sesión de reemplazo.

**Escenarios de aceptación**

```gherkin
@ACC-UC-004 @AC-01
Escenario: Cambiar la propia contraseña dentro del alcance permitido
  Dado el actor autorizado y las precondiciones de este caso satisfechas
  Cuando solicita cambiar la propia contraseña
  Entonces solo la cuenta del titular queda con la nueva contraseña y las demás Empresas conservan sus credenciales

@ACC-UC-004 @AC-02
Escenario: Rechazar una solicitud sin permiso
  Dado un actor sin autorización para esta operación
  Cuando solicita cambiar la propia contraseña
  Entonces se rechaza con ACC_ACCESO_DENEGADO
  Y no se ejecuta el cambio solicitado

@ACC-UC-004 @AC-03
Escenario: Verificar cuentas independientes por empresa
  Dado que la solicitud de cambio propio intenta modificar la cuenta de otra Empresa
  Cuando solicita cambiar la propia contraseña
  Entonces se rechaza con ACC_CUENTA_EMPRESA_INCOMPATIBLE

@ACC-UC-004 @AC-04
Escenario: Verificar canal habilitado
  Dado cuenta con acceso exclusivamente web intenta ingresar desde Android
  Cuando solicita cambiar la propia contraseña
  Entonces se rechaza con ACC_CANAL_NO_HABILITADO

@ACC-UC-004 @AC-05
Escenario: Conservar cambio de contraseña voluntario
  Dado un titular con contraseña asignada administrativamente
  Cuando solicita cambiar la propia contraseña
  Entonces no se exige cambiar la contraseña como condición adicional

@ACC-UC-004 @AC-06
Escenario: Solicitud dirigida a una cuenta diferente de la propia
  Dado solicitud dirigida a una cuenta diferente de la propia
  Cuando solicita cambiar la propia contraseña
  Entonces se rechaza con ACC_ACCESO_DENEGADO

@ACC-UC-004 @AC-07
Escenario: Aplicar ACC-BR-013
  Dado que el titular informa una contraseña actual incorrecta
  Cuando se solicita la operación de este caso
  Entonces se rechaza con ACC_CAMBIO_PROPIO_NO_AUTORIZADO
  Y no se confirma un cambio parcial

@ACC-UC-004 @AC-08
Escenario: Aplicar ACC-BR-014
  Dado que el sistema no puede completar la invalidación de las sesiones de la cuenta
  Cuando se solicita la operación de este caso
  Entonces se rechaza con ACC_CAMBIO_CREDENCIAL_NO_COMPLETADO
  Y no se confirma un cambio parcial

@ACC-UC-004 @AC-09
Escenario: Caducar todas las sesiones de la cuenta afectada
  Dado que la cuenta destino tiene sesiones web y móvil y otra cuenta de la persona existe en otra Empresa
  Cuando se confirma el cambio de contraseña de este caso
  Entonces ninguna sesión previa de la cuenta destino permite operar ni renovar
  Y las sesiones de la otra Empresa permanecen intactas

@ACC-UC-004 @AC-10
Escenario: Rechazar una contraseña nueva demasiado corta
  Dado que el titular informa una contraseña nueva de 14 caracteres
  Cuando solicita cambiar la propia contraseña
  Entonces se rechaza con ACC_CONTRASENIA_INVALIDA
```

### ACC-UC-005 — Restablecer una contraseña de Empresa

- **Estado:** Aprobado
- **Actor:** Administrador o SuperAdministrador.
- **Objetivo:** Restablecer una contraseña de Empresa.
- **Requerimientos:** `ACC-REQ-005`.
- **Reglas:** `ACC-BR-001`, `ACC-BR-002`, `ACC-BR-010`, `ACC-BR-011`, `ACC-BR-012`, `ACC-BR-014`, `ACC-BR-019`, `ACC-BR-020`.

**Precondiciones**

- El actor está autenticado. La intervención de plataforma dispone de contexto de soporte. La política de sesiones posterior aplica ACC-BR-014; no se exige conocer la contraseña anterior de la cuenta destino.

**Flujo principal**

1. El actor solicita restablecer una cuenta e informa una nueva contraseña.
2. El sistema comprueba el permiso, ACC-BR-002, ACC-BR-010, ACC-BR-019 y, para plataforma, ACC-BR-011 y ACC-BR-020.
3. El sistema aplica ACC-BR-001, reemplaza la credencial protegida según convenciones.md §7.1 y aplica ACC-BR-014.
4. El sistema registra la intervención sin conservar contraseñas en auditoría.
5. El sistema informa el resultado y aplica ACC-BR-012.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_ACCESO_DENEGADO` |
| No se cumple `ACC-BR-001` | 3 | Se rechaza sin ejecutar el cambio solicitado | `ACC_CUENTA_EMPRESA_INCOMPATIBLE` |
| No se cumple `ACC-BR-002` | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_EMPRESA_FUERA_DE_ALCANCE` |
| No se cumple `ACC-BR-010` | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_RESTABLECIMIENTO_FUERA_DE_ALCANCE` |
| No se cumple `ACC-BR-011` | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_CONTEXTO_SOPORTE_REQUERIDO` |
| No se cumple `ACC-BR-019` | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_CONTRASENIA_INVALIDA` |
| No se cumple `ACC-BR-020` | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_MOTIVO_SOPORTE_INVALIDO` |
| Cuenta inexistente dentro del alcance | 2 | Se rechaza; los fallos relevantes se auditan | `ACC_CUENTA_NO_ENCONTRADA` |
| No se cumple `ACC-BR-014` | 3 | Se rechaza sin confirmar efectos parciales | `ACC_CAMBIO_CREDENCIAL_NO_COMPLETADO` |

**Postcondiciones**

- La contraseña queda restablecida únicamente en la cuenta destino y se cumple ACC-BR-014; la Sesión del actor administrador permanece intacta salvo que sea también la cuenta destino.

**Escenarios de aceptación**

```gherkin
@ACC-UC-005 @AC-01
Escenario: Restablecer una contraseña de Empresa dentro del alcance permitido
  Dado el actor autorizado y las precondiciones de este caso satisfechas
  Cuando solicita restablecer una contraseña de empresa
  Entonces solo la cuenta destino queda con la contraseña asignada sin exigir cambio al próximo ingreso

@ACC-UC-005 @AC-02
Escenario: Rechazar una solicitud sin permiso
  Dado un actor sin autorización para esta operación
  Cuando solicita restablecer una contraseña de empresa
  Entonces se rechaza con ACC_ACCESO_DENEGADO
  Y no se ejecuta el cambio solicitado

@ACC-UC-005 @AC-03
Escenario: Verificar cuentas independientes por empresa
  Dado que el restablecimiento intenta cambiar credenciales de una cuenta externa al contexto autorizado
  Cuando solicita restablecer una contraseña de empresa
  Entonces se rechaza con ACC_CUENTA_EMPRESA_INCOMPATIBLE

@ACC-UC-005 @AC-04
Escenario: Verificar pertenencia al contexto autorizado
  Dado que un Administrador solicita restablecer una cuenta de otra Empresa
  Cuando solicita restablecer una contraseña de empresa
  Entonces se rechaza con ACC_EMPRESA_FUERA_DE_ALCANCE

@ACC-UC-005 @AC-05
Escenario: Verificar restablecimiento limitado a la empresa
  Dado administrador intenta restablecer una cuenta ajena
  Cuando solicita restablecer una contraseña de empresa
  Entonces se rechaza con ACC_RESTABLECIMIENTO_FUERA_DE_ALCANCE

@ACC-UC-005 @AC-06
Escenario: Verificar contexto explícito de soporte
  Dado que un SuperAdministrador intenta restablecer una cuenta sin Empresa destino o motivo de soporte
  Cuando solicita restablecer una contraseña de empresa
  Entonces se rechaza con ACC_CONTEXTO_SOPORTE_REQUERIDO

@ACC-UC-005 @AC-07
Escenario: Conservar cambio de contraseña voluntario
  Dado un titular con contraseña asignada administrativamente
  Cuando solicita restablecer una contraseña de empresa
  Entonces no se exige cambiar la contraseña como condición adicional

@ACC-UC-005 @AC-08
Escenario: Cuenta inexistente dentro del alcance
  Dado cuenta inexistente dentro del alcance
  Cuando solicita restablecer una contraseña de empresa
  Entonces se rechaza con ACC_CUENTA_NO_ENCONTRADA

@ACC-UC-005 @AC-09
Escenario: Aplicar ACC-BR-014
  Dado que el sistema no puede completar la invalidación de las sesiones de la cuenta destino
  Cuando se solicita la operación de este caso
  Entonces se rechaza con ACC_CAMBIO_CREDENCIAL_NO_COMPLETADO
  Y no se confirma un cambio parcial

@ACC-UC-005 @AC-10
Escenario: Caducar todas las sesiones de la cuenta afectada
  Dado que la cuenta destino tiene sesiones web y móvil y otra cuenta de la persona existe en otra Empresa
  Cuando se confirma el cambio de contraseña de este caso
  Entonces ninguna sesión previa de la cuenta destino permite operar ni renovar
  Y las sesiones de la otra Empresa permanecen intactas

@ACC-UC-005 @AC-11
Escenario: Rechazar una contraseña nueva demasiado extensa
  Dado que el actor informa una contraseña nueva de 129 caracteres
  Cuando solicita restablecer una contraseña de empresa
  Entonces se rechaza con ACC_CONTRASENIA_INVALIDA

@ACC-UC-005 @AC-12
Escenario: Rechazar un motivo de soporte vacío
  Dado que un SuperAdministrador informa un motivo compuesto solo por espacios
  Cuando solicita restablecer una contraseña de empresa
  Entonces se rechaza con ACC_MOTIVO_SOPORTE_INVALIDO
```

### ACC-UC-006 — Crear un SuperAdministrador

- **Estado:** Aprobado
- **Actor:** SuperAdministrador; proceso de inicialización para el primero.
- **Objetivo:** Crear un SuperAdministrador.
- **Requerimientos:** `ACC-REQ-006`.
- **Reglas:** `ACC-BR-007`.

**Precondiciones**

- La plataforma está en inicialización sin SuperAdministradores o el actor es un SuperAdministrador autenticado. `.env` autoriza únicamente el bootstrap o recuperación operativa definidos por `ACC-Q-017` y `ACC-Q-021`; no sustituye la identidad persistente ni define un ingreso público.

**Flujo principal**

1. El actor de plataforma solicita crear otro SuperAdministrador; durante la inicialización actúa el proceso autorizado.
2. El sistema comprueba la autorización o las condiciones de inicialización de `ACC-Q-007` y `ACC-Q-021`.
3. El sistema aplica ACC-BR-007.
4. El sistema registra la identidad persistente de plataforma y la acción auditada.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_ACCESO_DENEGADO` |
| No se cumple `ACC-BR-007` | 3 | Se rechaza sin ejecutar el cambio solicitado | `ACC_ROL_NO_ADMITIDO` |
| La inicialización intenta ejecutarse de nuevo sobre una plataforma ya inicializada | 2 | Se rechaza; los fallos relevantes se auditan | `ACC_INICIALIZACION_NO_PERMITIDA` |

**Postcondiciones**

- Existe un SuperAdministrador activo; este caso no crea una Cuenta de Empresa.

**Escenarios de aceptación**

```gherkin
@ACC-UC-006 @AC-01
Escenario: Crear un SuperAdministrador dentro del alcance permitido
  Dado el actor autorizado y las precondiciones de este caso satisfechas
  Cuando solicita crear un superadministrador
  Entonces se registra un SuperAdministrador activo fuera del directorio de Empresa

@ACC-UC-006 @AC-02
Escenario: Rechazar una solicitud sin permiso
  Dado un actor sin autorización para esta operación
  Cuando solicita crear un superadministrador
  Entonces se rechaza con ACC_ACCESO_DENEGADO
  Y no se ejecuta el cambio solicitado

@ACC-UC-006 @AC-03
Escenario: Verificar roles iniciales del sistema
  Dado que se intenta crear una Cuenta de Empresa mediante la operación reservada a una identidad de plataforma
  Cuando solicita crear un superadministrador
  Entonces se rechaza con ACC_ROL_NO_ADMITIDO

@ACC-UC-006 @AC-04
Escenario: Verificar último superadministrador activo
  Dado desactivar al único SuperAdministrador activo
  Cuando solicita crear un superadministrador
  Entonces se rechaza con ACC_ULTIMO_SUPERADMINISTRADOR

@ACC-UC-006 @AC-05
Escenario: La inicialización intenta ejecutarse de nuevo sobre una plataforma ya inicializada
  Dado la inicialización intenta ejecutarse de nuevo sobre una plataforma ya inicializada
  Cuando solicita crear un superadministrador
  Entonces se rechaza con ACC_INICIALIZACION_NO_PERMITIDA
```

### ACC-UC-007 — Operar mediante soporte de plataforma

- **Estado:** Aprobado
- **Actor:** SuperAdministrador.
- **Objetivo:** Operar mediante soporte de plataforma.
- **Requerimientos:** `ACC-REQ-007`.
- **Reglas:** `ACC-BR-002`, `ACC-BR-011`, `ACC-BR-020`.

**Precondiciones**

- El actor está autenticado en plataforma.

**Flujo principal**

1. El SuperAdministrador solicita intervenir en una Empresa e informa el motivo.
2. El sistema comprueba el permiso de plataforma y aplica ACC-BR-011, ACC-BR-020 y ACC-BR-002.
3. El sistema construye el contexto explícito de soporte ligado a la Sesión de plataforma, la Empresa seleccionada y su vigencia conforme a arquitectura.md §13.4.
4. El SuperAdministrador solicita la acción de negocio y el módulo dueño conserva sus validaciones.
5. El sistema vincula la intervención con el actor real, Empresa, Sesión y solicitud.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_ACCESO_DENEGADO` |
| No se cumple `ACC-BR-002` | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_EMPRESA_FUERA_DE_ALCANCE` |
| No se cumple `ACC-BR-011` | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_CONTEXTO_SOPORTE_REQUERIDO` |
| No se cumple `ACC-BR-020` | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_MOTIVO_SOPORTE_INVALIDO` |
| Contexto vencido o utilizado para otra Empresa | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_CONTEXTO_SOPORTE_REQUERIDO` |
| Empresa destino inexistente | 2 | Se rechaza; los fallos relevantes se auditan | `ACC_EMPRESA_NO_ENCONTRADA` |
| Regla del módulo de negocio incumplida | 4 | Se rechaza; los fallos relevantes se auditan | Código del módulo dueño |

**Postcondiciones**

- La acción queda vinculada a una intervención de soporte identificada; no se suplanta a un Administrador.

**Escenarios de aceptación**

```gherkin
@ACC-UC-007 @AC-01
Escenario: Operar mediante soporte de plataforma dentro del alcance permitido
  Dado el actor autorizado y las precondiciones de este caso satisfechas
  Cuando solicita operar mediante soporte de plataforma
  Entonces la acción conserva Empresa, motivo e identidad real del SuperAdministrador en la auditoría

@ACC-UC-007 @AC-02
Escenario: Rechazar una solicitud sin permiso
  Dado un actor sin autorización para esta operación
  Cuando solicita operar mediante soporte de plataforma
  Entonces se rechaza con ACC_ACCESO_DENEGADO
  Y no se ejecuta el cambio solicitado

@ACC-UC-007 @AC-03
Escenario: Verificar pertenencia al contexto autorizado
  Dado que el contexto de soporte corresponde a Empresa A y la acción se dirige a Empresa B
  Cuando solicita operar mediante soporte de plataforma
  Entonces se rechaza con ACC_EMPRESA_FUERA_DE_ALCANCE

@ACC-UC-007 @AC-04
Escenario: Verificar contexto explícito de soporte
  Dado que el SuperAdministrador no indicó Empresa destino o motivo de soporte
  Cuando solicita operar mediante soporte de plataforma
  Entonces se rechaza con ACC_CONTEXTO_SOPORTE_REQUERIDO

@ACC-UC-007 @AC-05
Escenario: Empresa destino inexistente
  Dado empresa destino inexistente
  Cuando solicita operar mediante soporte de plataforma
  Entonces se rechaza con ACC_EMPRESA_NO_ENCONTRADA

@ACC-UC-007 @AC-06
Escenario: Regla del módulo de negocio incumplida
  Dado regla del módulo de negocio incumplida
  Cuando solicita operar mediante soporte de plataforma
  Entonces se rechaza con Código del módulo dueño

@ACC-UC-007 @AC-07
Escenario: Rechazar un motivo de soporte demasiado extenso
  Dado que el SuperAdministrador informa un motivo de soporte de 1001 caracteres luego de eliminar espacios exteriores
  Cuando solicita operar mediante soporte de plataforma
  Entonces se rechaza con ACC_MOTIVO_SOPORTE_INVALIDO
```

### ACC-UC-008 — Consultar cuentas de Empresa

- **Estado:** Aprobado
- **Actor:** Administrador o SuperAdministrador.
- **Objetivo:** Consultar cuentas de Empresa.
- **Requerimientos:** `ACC-REQ-008`.
- **Reglas:** `ACC-BR-002`, `ACC-BR-009`.

**Precondiciones**

- El actor está autenticado; consulta autorizada por ACC-Q-016.

**Flujo principal**

1. El actor solicita consultar una cuenta o listar las de la Empresa autorizada.
2. El sistema comprueba el permiso y ACC-BR-002.
3. El sistema aplica ACC-BR-009 e informa la referencia `empleadoId` únicamente cuando la Cuenta esté vinculada, sin copiar datos personales de PER.
4. El sistema informa datos de acceso sin credenciales; para listados aplica convenciones.md §3.2 y §3.3.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_ACCESO_DENEGADO` |
| No se cumple `ACC-BR-002` | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_EMPRESA_FUERA_DE_ALCANCE` |
| No se cumple `ACC-BR-009` | 3 | Se rechaza sin ejecutar el cambio solicitado | `ACC_IDENTIDAD_PLATAFORMA_NO_VISIBLE` |
| Cuenta inexistente dentro del alcance | 3 | Se rechaza; los fallos relevantes se auditan | `ACC_CUENTA_NO_ENCONTRADA` |

**Postcondiciones**

- No se modifica estado y se entrega únicamente la información autorizada.

**Escenarios de aceptación**

```gherkin
@ACC-UC-008 @AC-01
Escenario: Consultar cuentas de Empresa dentro del alcance permitido
  Dado el actor autorizado y las precondiciones de este caso satisfechas
  Cuando solicita consultar cuentas de empresa
  Entonces se entregan únicamente cuentas de la Empresa autorizada sin credenciales ni perfiles de plataforma

@ACC-UC-008 @AC-02
Escenario: Rechazar una solicitud sin permiso
  Dado un actor sin autorización para esta operación
  Cuando solicita consultar cuentas de empresa
  Entonces se rechaza con ACC_ACCESO_DENEGADO
  Y no se ejecuta el cambio solicitado

@ACC-UC-008 @AC-03
Escenario: Verificar pertenencia al contexto autorizado
  Dado que un Administrador de Empresa A solicita consultar cuentas de Empresa B
  Cuando solicita consultar cuentas de empresa
  Entonces se rechaza con ACC_EMPRESA_FUERA_DE_ALCANCE

@ACC-UC-008 @AC-04
Escenario: Verificar directorio de empresa sin superadministradores
  Dado que un Administrador solicita el perfil de un SuperAdministrador desde el directorio de Empresa
  Cuando solicita consultar cuentas de empresa
  Entonces se rechaza con ACC_IDENTIDAD_PLATAFORMA_NO_VISIBLE

@ACC-UC-008 @AC-05
Escenario: Cuenta inexistente dentro del alcance
  Dado cuenta inexistente dentro del alcance
  Cuando solicita consultar cuentas de empresa
  Entonces se rechaza con ACC_CUENTA_NO_ENCONTRADA
```

### ACC-UC-009 — Renovar la sesión de Empresa

- **Estado:** Aprobado
- **Actor:** Administrador, Capataz o Empleado con Cuenta de Empresa.
- **Objetivo:** Renovar la sesión de Empresa.
- **Requerimientos:** `ACC-REQ-009`.
- **Reglas:** `ACC-BR-001`, `ACC-BR-005`.

**Precondiciones**

- El titular dispone de una credencial de renovación del ciclo de autenticación vigente.

**Flujo principal**

1. El titular solicita renovar su Sesión.
2. El sistema valida la renovación conforme a convenciones.md §7.1 y arquitectura.md §13.2.
3. El sistema comprueba ACC-BR-001 y ACC-BR-005 y la habilitación comercial vigente mediante ACC-DEP-002.
4. El sistema renueva conforme al ciclo definido en la fundación y registra el resultado.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_ACCESO_DENEGADO` |
| No se cumple `ACC-BR-001` | 3 | Se rechaza sin ejecutar el cambio solicitado | `ACC_CUENTA_EMPRESA_INCOMPATIBLE` |
| No se cumple `ACC-BR-005` | 3 | Se rechaza sin ejecutar el cambio solicitado | `ACC_CANAL_NO_HABILITADO` |
| Renovación vencida, revocada o reutilizada | 2 | Se rechaza; los fallos relevantes se auditan | `ACC_RENOVACION_INVALIDA` |
| Cuenta o Empresa ya no habilitada | 3 | Se rechaza; los fallos relevantes se auditan | `ACC_ACCESO_NO_HABILITADO` |

**Postcondiciones**

- El resultado de renovación conserva el contexto de la misma Cuenta de Empresa.

**Escenarios de aceptación**

```gherkin
@ACC-UC-009 @AC-01
Escenario: Renovar la sesión de Empresa dentro del alcance permitido
  Dado el actor autorizado y las precondiciones de este caso satisfechas
  Cuando solicita renovar la sesión de empresa
  Entonces se aplica la renovación del ciclo vigente para la misma Cuenta de Empresa

@ACC-UC-009 @AC-02
Escenario: Rechazar una solicitud sin permiso
  Dado un actor sin autorización para esta operación
  Cuando solicita renovar la sesión de empresa
  Entonces se rechaza con ACC_ACCESO_DENEGADO
  Y no se ejecuta el cambio solicitado

@ACC-UC-009 @AC-03
Escenario: Verificar cuentas independientes por empresa
  Dado que la credencial de renovación pertenece a una Cuenta de Empresa diferente de la solicitada
  Cuando solicita renovar la sesión de empresa
  Entonces se rechaza con ACC_CUENTA_EMPRESA_INCOMPATIBLE

@ACC-UC-009 @AC-04
Escenario: Verificar canal habilitado
  Dado cuenta con acceso exclusivamente web intenta ingresar desde Android
  Cuando solicita renovar la sesión de empresa
  Entonces se rechaza con ACC_CANAL_NO_HABILITADO

@ACC-UC-009 @AC-05
Escenario: Renovación vencida, revocada o reutilizada
  Dado renovación vencida, revocada o reutilizada
  Cuando solicita renovar la sesión de empresa
  Entonces se rechaza con ACC_RENOVACION_INVALIDA

@ACC-UC-009 @AC-06
Escenario: Cuenta o Empresa ya no habilitada
  Dado cuenta o Empresa ya no habilitada
  Cuando solicita renovar la sesión de empresa
  Entonces se rechaza con ACC_ACCESO_NO_HABILITADO
```

### ACC-UC-010 — Administrar habilitación de acceso

- **Estado:** Aprobado
- **Actor:** Administrador o SuperAdministrador.
- **Objetivo:** Administrar habilitación de acceso.
- **Requerimientos:** `ACC-REQ-010`.
- **Reglas:** `ACC-BR-002`, `ACC-BR-005`, `ACC-BR-006`, `ACC-BR-007`, `ACC-BR-016`, `ACC-BR-017`, `ACC-BR-021`.

**Precondiciones**

- La cuenta existe y se conoce su versión; los estados y atribuciones proceden de ACC-Q-016.

**Flujo principal**

1. El actor solicita suspender, reactivar o cambiar canales o roles de una cuenta.
2. El sistema comprueba el permiso y ACC-BR-002, ACC-BR-007 y ACC-BR-021.
3. Si la operación habilita acceso, el sistema valida ACC-BR-005 y ACC-BR-006.
4. El sistema aplica ACC-BR-016 y ACC-BR-017 y aplica el control concurrente de convenciones.md §3.5.
5. El sistema conserva el cambio y su historial; la efectividad de revocación sigue la fundación.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_ACCESO_DENEGADO` |
| No se cumple `ACC-BR-002` | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_EMPRESA_FUERA_DE_ALCANCE` |
| No se cumple `ACC-BR-005` | 3 | Se rechaza sin ejecutar el cambio solicitado | `ACC_CANAL_NO_HABILITADO` |
| No se cumple `ACC-BR-006` | 3 | Se rechaza sin ejecutar el cambio solicitado | `ACC_LIMITE_ACCESOS_ALCANZADO` |
| No se cumple `ACC-BR-007` | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_ROL_NO_ADMITIDO` |
| No se cumple `ACC-BR-021` | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_VINCULO_EMPLEADO_INVALIDO` |
| Versión anterior de la cuenta | 4 | Se rechaza; los fallos relevantes se auditan | `ACC_VERSION_CONFLICTO` |
| Transición no permitida | 4 | Se rechaza; los fallos relevantes se auditan | `ACC_TRANSICION_NO_PERMITIDA` |
| No se cumple `ACC-BR-017` | 4 | Se rechaza sin confirmar efectos parciales | `ACC_ELIMINACION_NO_PERMITIDA` |

**Postcondiciones**

- La cuenta refleja la modificación autorizada y conserva su historial conforme a ACC-BR-016 y ACC-BR-017.

**Escenarios de aceptación**

```gherkin
@ACC-UC-010 @AC-01
Escenario: Administrar habilitación de acceso dentro del alcance permitido
  Dado el actor autorizado y las precondiciones de este caso satisfechas
  Cuando solicita administrar habilitación de acceso
  Entonces se conserva la modificación autorizada con nueva versión e historial según la transición acordada

@ACC-UC-010 @AC-02
Escenario: Rechazar una solicitud sin permiso
  Dado un actor sin autorización para esta operación
  Cuando solicita administrar habilitación de acceso
  Entonces se rechaza con ACC_ACCESO_DENEGADO
  Y no se ejecuta el cambio solicitado

@ACC-UC-010 @AC-03
Escenario: Verificar pertenencia al contexto autorizado
  Dado que un Administrador intenta modificar la habilitación de una cuenta de otra Empresa
  Cuando solicita administrar habilitación de acceso
  Entonces se rechaza con ACC_EMPRESA_FUERA_DE_ALCANCE

@ACC-UC-010 @AC-04
Escenario: Verificar canal habilitado
  Dado cuenta con acceso exclusivamente web intenta ingresar desde Android
  Cuando solicita administrar habilitación de acceso
  Entonces se rechaza con ACC_CANAL_NO_HABILITADO

@ACC-UC-010 @AC-05
Escenario: Verificar cupo por cuenta activa
  Dado habilitación de otra cuenta sin cupo disponible
  Cuando solicita administrar habilitación de acceso
  Entonces se rechaza con ACC_LIMITE_ACCESOS_ALCANZADO

@ACC-UC-010 @AC-06
Escenario: Verificar roles iniciales del sistema
  Dado asignar el rol de plataforma a una Cuenta de Empresa
  Cuando solicita administrar habilitación de acceso
  Entonces se rechaza con ACC_ROL_NO_ADMITIDO

@ACC-UC-010 @AC-07
Escenario: Versión anterior de la cuenta
  Dado versión anterior de la cuenta
  Cuando solicita administrar habilitación de acceso
  Entonces se rechaza con ACC_VERSION_CONFLICTO

@ACC-UC-010 @AC-08
Escenario: Transición no permitida
  Dado transición no permitida
  Cuando solicita administrar habilitación de acceso
  Entonces se rechaza con ACC_TRANSICION_NO_PERMITIDA

@ACC-UC-010 @AC-09
Escenario: Aplicar ACC-BR-017
  Dado que se solicita eliminar físicamente una cuenta en lugar de suspenderla
  Cuando se solicita la operación de este caso
  Entonces se rechaza con ACC_ELIMINACION_NO_PERMITIDA
  Y no se confirma un cambio parcial
```

### ACC-UC-011 — Consultar intervenciones de soporte

- **Estado:** Aprobado
- **Actor:** Administrador o SuperAdministrador.
- **Objetivo:** Consultar intervenciones de soporte.
- **Requerimientos:** `ACC-REQ-011`.
- **Reglas:** `ACC-BR-002`, `ACC-BR-009`.

**Precondiciones**

- El actor posee acceso al historial de intervenciones. Su permiso de consulta procede de ACC-Q-016.

**Flujo principal**

1. El actor solicita consultar las intervenciones de soporte de la Empresa autorizada.
2. El sistema comprueba el permiso y ACC-BR-002.
3. El sistema aplica ACC-BR-009 y presenta la intervención según ACC-Q-008.
4. El sistema informa el historial autorizado mediante ACC-DEP-004 y paginación de convenciones.md §3.2.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_ACCESO_DENEGADO` |
| No se cumple `ACC-BR-002` | 2 | Se rechaza sin ejecutar el cambio solicitado | `ACC_EMPRESA_FUERA_DE_ALCANCE` |
| No se cumple `ACC-BR-009` | 3 | Se rechaza sin ejecutar el cambio solicitado | `ACC_IDENTIDAD_PLATAFORMA_NO_VISIBLE` |

**Postcondiciones**

- El historial consultado no modifica hechos ni expone perfiles de plataforma al Administrador.

**Escenarios de aceptación**

```gherkin
@ACC-UC-011 @AC-01
Escenario: Consultar intervenciones de soporte dentro del alcance permitido
  Dado el actor autorizado y las precondiciones de este caso satisfechas
  Cuando solicita consultar intervenciones de soporte
  Entonces el Administrador ve la intervención como Soporte de plataforma sin recibir el perfil del SuperAdministrador

@ACC-UC-011 @AC-02
Escenario: Rechazar una solicitud sin permiso
  Dado un actor sin autorización para esta operación
  Cuando solicita consultar intervenciones de soporte
  Entonces se rechaza con ACC_ACCESO_DENEGADO
  Y no se ejecuta el cambio solicitado

@ACC-UC-011 @AC-03
Escenario: Verificar pertenencia al contexto autorizado
  Dado que un Administrador de Empresa A solicita el historial privado de Empresa B
  Cuando solicita consultar intervenciones de soporte
  Entonces se rechaza con ACC_EMPRESA_FUERA_DE_ALCANCE

@ACC-UC-011 @AC-04
Escenario: Verificar directorio de empresa sin superadministradores
  Dado que un Administrador intenta obtener el perfil de plataforma a través del historial de soporte
  Cuando solicita consultar intervenciones de soporte
  Entonces se rechaza con ACC_IDENTIDAD_PLATAFORMA_NO_VISIBLE
```

### ACC-UC-012 — Vincular una Cuenta con un Empleado

- **Estado:** Aprobado
- **Actor:** Administrador o SuperAdministrador; PER como sistema participante.
- **Objetivo:** Vincular una Cuenta de Empresa existente con una ficha laboral activa sin duplicar el acceso.
- **Requerimientos:** `ACC-REQ-012`.
- **Reglas:** `ACC-BR-002`, `ACC-BR-015`, `ACC-BR-021`, `ACC-BR-022`.

**Precondiciones**

- La Cuenta existe sin `empleadoId`; PER confirma un Empleado ACTIVO de la misma Empresa.

**Flujo principal**

1. El actor solicita vincular la Cuenta existente con un Empleado validado por PER.
2. El sistema comprueba el permiso y ACC-BR-002.
3. El sistema valida ACC-BR-015, ACC-BR-021 y ACC-BR-022 mediante ACC-DEP-003.
4. El sistema conserva `empleadoId` en la Cuenta existente y registra la vinculación auditada.
5. El sistema informa el resultado sin modificar credenciales, Empresa, roles ni historial.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso | 2 | Se rechaza sin cambios | `ACC_ACCESO_DENEGADO` |
| No se cumple `ACC-BR-002` | 2 | Se rechaza sin cambios | `ACC_EMPRESA_FUERA_DE_ALCANCE` |
| No se cumple `ACC-BR-015` | 3 | Se rechaza sin cambios | `ACC_CUENTA_EMPLEADO_DUPLICADA` |
| No se cumple `ACC-BR-021` | 3 | Se rechaza sin cambios | `ACC_VINCULO_EMPLEADO_INVALIDO` |
| No se cumple `ACC-BR-022` | 3 | Se rechaza sin cambios | `ACC_VINCULACION_EMPLEADO_INVALIDA` |

**Postcondiciones**

- La Cuenta conserva su identidad e historial y queda vinculada con un único Empleado de su Empresa; PER no duplica el vínculo.

**Escenarios de aceptación**

```gherkin
@ACC-UC-012 @AC-01
Escenario: Vincular el Administrador existente con una ficha laboral
  Dado una Cuenta de Administrador sin empleadoId y un Empleado ACTIVO de la misma Empresa
  Cuando el actor autorizado solicita vincularlos
  Entonces la Cuenta existente conserva credenciales e historial y registra empleadoId

@ACC-UC-012 @AC-02
Escenario: Rechazar un Empleado de otra Empresa
  Dado una Cuenta y un Empleado de Empresas diferentes
  Cuando el actor solicita vincularlos
  Entonces se rechaza con ACC_VINCULO_EMPLEADO_INVALIDO

@ACC-UC-012 @AC-03
Escenario: Impedir una segunda Cuenta para el mismo Empleado
  Dado un Empleado ya vinculado con una Cuenta de su Empresa
  Cuando se intenta vincularlo con otra Cuenta
  Entonces se rechaza con ACC_CUENTA_EMPLEADO_DUPLICADA
```

### ACC-UC-013 — Asignar una Chacra a un Capataz

- **Estado:** Aprobado
- **Actor:** Administrador o SuperAdministrador.
- **Objetivo:** Crear una asignación territorial entre una Cuenta de Empresa con rol Capataz y una Chacra.
- **Requerimientos:** `ACC-REQ-013`.
- **Reglas:** `ACC-BR-002`, `ACC-BR-023`, `ACC-BR-024`, `ACC-BR-025`, `ACC-BR-026`.

**Precondiciones**

- El actor dispone de un contexto autorizado; la Cuenta y la Chacra existen.

**Flujo principal**

1. El actor solicita asignar una Chacra a una Cuenta de Empresa con rol Capataz.
2. El sistema comprueba el permiso y `ACC-BR-002`; para plataforma aplica además `ACC-BR-011`.
3. El sistema valida `ACC-BR-023` sobre la Cuenta.
4. El sistema obtiene identidad, Empresa y estado de la Chacra mediante `ACC-DEP-005` y valida `ACC-BR-024`.
5. El sistema valida `ACC-BR-025` y crea la asignación ACTIVA conforme a `ACC-BR-026`.
6. El sistema registra la acción auditada e informa el resultado.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso | 2 | Se rechaza sin crear la asignación | `ACC_ACCESO_DENEGADO` |
| No se cumple `ACC-BR-002` | 2 | Se rechaza sin revelar ni modificar datos ajenos | `ACC_EMPRESA_FUERA_DE_ALCANCE` |
| No se cumple `ACC-BR-023` | 3 | Se rechaza sin crear la asignación | `ACC_CUENTA_CAPATAZ_NO_DISPONIBLE` |
| No se cumple `ACC-BR-024` | 4 | Se rechaza sin crear la asignación | `ACC_CHACRA_NO_DISPONIBLE` |
| No se cumple `ACC-BR-025` | 5 | Se conserva la asignación existente | `ACC_ASIGNACION_TERRITORIAL_EXISTENTE` |
| No se cumple `ACC-BR-026` | 5 | Se rechaza la transición implícita | `ACC_TRANSICION_ASIGNACION_TERRITORIAL_INVALIDA` |
| TER no puede validar la Chacra | 4 | Se rechaza sin confirmar efectos parciales | `ACC_VALIDACION_TERRITORIAL_NO_DISPONIBLE` |

**Postcondiciones**

- Existe una única asignación ACTIVA para el par Cuenta–Chacra y su cambio queda auditado.

**Escenarios de aceptación**

```gherkin
@ACC-UC-013 @AC-01
Escenario: Asignar una Chacra activa a un Capataz activo
  Dado una Cuenta ACTIVA con rol Capataz y una Chacra ACTIVA de la misma Empresa sin asignación previa
  Cuando el Administrador solicita asignarlas
  Entonces se crea una asignación territorial ACTIVA

@ACC-UC-013 @AC-02
Escenario: Denegar la asignación a un actor sin permiso
  Dado un actor sin autorización para administrar asignaciones territoriales
  Cuando solicita asignar una Chacra
  Entonces se rechaza con ACC_ACCESO_DENEGADO

@ACC-UC-013 @AC-03
Escenario: Rechazar una Cuenta no disponible como Capataz
  Dado una Cuenta SUSPENDIDA o sin rol Capataz
  Cuando el Administrador intenta asignarle una Chacra
  Entonces se rechaza con ACC_CUENTA_CAPATAZ_NO_DISPONIBLE

@ACC-UC-013 @AC-04
Escenario: Rechazar una Chacra no disponible
  Dado una Chacra INACTIVA o perteneciente a otra Empresa
  Cuando el Administrador intenta asignarla al Capataz
  Entonces se rechaza con ACC_CHACRA_NO_DISPONIBLE

@ACC-UC-013 @AC-05
Escenario: Impedir otra asignación para el mismo par
  Dado una asignación existente entre la Cuenta y la Chacra
  Cuando el Administrador intenta crear otra
  Entonces se rechaza con ACC_ASIGNACION_TERRITORIAL_EXISTENTE

@ACC-UC-013 @AC-06
Escenario: Impedir la reactivación implícita
  Dado una asignación INACTIVA entre la Cuenta y la Chacra
  Cuando el Administrador intenta crearla nuevamente
  Entonces se rechaza con ACC_TRANSICION_ASIGNACION_TERRITORIAL_INVALIDA

@ACC-UC-013 @AC-07
Escenario: Rechazar cuando Territorio no puede validar la Chacra
  Dado que TER no puede validar identidad, Empresa y estado de la Chacra
  Cuando el Administrador solicita la asignación
  Entonces se rechaza con ACC_VALIDACION_TERRITORIAL_NO_DISPONIBLE
```

### ACC-UC-014 — Inactivar una asignación territorial

- **Estado:** Aprobado
- **Actor:** Administrador o SuperAdministrador.
- **Objetivo:** Inactivar una asignación territorial sin eliminarla.
- **Requerimientos:** `ACC-REQ-014`.
- **Reglas:** `ACC-BR-002`, `ACC-BR-026`, `ACC-BR-027`.

**Precondiciones**

- La asignación existe y el actor dispone de un contexto autorizado.

**Flujo principal**

1. El actor solicita inactivar una asignación territorial existente.
2. El sistema comprueba el permiso y `ACC-BR-002`; para plataforma aplica además `ACC-BR-011`.
3. El sistema valida la transición mediante `ACC-BR-026`.
4. El sistema cambia el estado a INACTIVA y conserva el registro conforme a `ACC-BR-027`.
5. El sistema registra la acción auditada e informa el resultado.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso | 2 | Se rechaza sin modificar la asignación | `ACC_ACCESO_DENEGADO` |
| No se cumple `ACC-BR-002` | 2 | Se rechaza sin revelar ni modificar datos ajenos | `ACC_EMPRESA_FUERA_DE_ALCANCE` |
| La asignación no existe dentro del alcance | 3 | Se rechaza sin cambios | `ACC_ASIGNACION_TERRITORIAL_NO_ENCONTRADA` |
| No se cumple `ACC-BR-026` | 3 | Se rechaza sin cambios | `ACC_TRANSICION_ASIGNACION_TERRITORIAL_INVALIDA` |
| Se solicita eliminar físicamente la asignación | 4 | Se conserva el registro | `ACC_ELIMINACION_ASIGNACION_TERRITORIAL_NO_PERMITIDA` |

**Postcondiciones**

- La asignación queda INACTIVA, deja de integrar el alcance vigente y conserva su identidad e historia.

**Escenarios de aceptación**

```gherkin
@ACC-UC-014 @AC-01
Escenario: Inactivar una asignación territorial activa
  Dado una asignación territorial ACTIVA de la Empresa autorizada
  Cuando el Administrador solicita inactivarla
  Entonces queda INACTIVA y se conserva su registro

@ACC-UC-014 @AC-02
Escenario: Denegar la inactivación a un actor sin permiso
  Dado un actor sin autorización para administrar asignaciones territoriales
  Cuando solicita inactivar una asignación
  Entonces se rechaza con ACC_ACCESO_DENEGADO

@ACC-UC-014 @AC-03
Escenario: Rechazar una transición de estado inválida
  Dado una asignación territorial ya INACTIVA
  Cuando el Administrador solicita inactivarla
  Entonces se rechaza con ACC_TRANSICION_ASIGNACION_TERRITORIAL_INVALIDA

@ACC-UC-014 @AC-04
Escenario: Impedir el borrado físico de una asignación
  Dado una asignación territorial existente
  Cuando se solicita eliminarla físicamente
  Entonces se rechaza con ACC_ELIMINACION_ASIGNACION_TERRITORIAL_NO_PERMITIDA
```

### ACC-UC-015 — Reactivar una asignación territorial

- **Estado:** Aprobado
- **Actor:** Administrador o SuperAdministrador.
- **Objetivo:** Reactivar explícitamente una asignación territorial existente.
- **Requerimientos:** `ACC-REQ-015`.
- **Reglas:** `ACC-BR-002`, `ACC-BR-023`, `ACC-BR-024`, `ACC-BR-025`, `ACC-BR-026`, `ACC-BR-027`.

**Precondiciones**

- La asignación existe en estado INACTIVA y el actor dispone de un contexto autorizado.

**Flujo principal**

1. El actor solicita reactivar la asignación territorial existente.
2. El sistema comprueba el permiso y `ACC-BR-002`; para plataforma aplica además `ACC-BR-011`.
3. El sistema valida `ACC-BR-023` sobre la Cuenta.
4. El sistema valida la Chacra mediante `ACC-DEP-005` y aplica `ACC-BR-024`.
5. El sistema reutiliza la asignación única de `ACC-BR-025`, aplica la transición de `ACC-BR-026` y conserva el registro según `ACC-BR-027`.
6. El sistema registra la acción auditada e informa el resultado.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso | 2 | Se rechaza sin modificar la asignación | `ACC_ACCESO_DENEGADO` |
| No se cumple `ACC-BR-002` | 2 | Se rechaza sin revelar ni modificar datos ajenos | `ACC_EMPRESA_FUERA_DE_ALCANCE` |
| No se cumple `ACC-BR-023` | 3 | Se rechaza sin modificar la asignación | `ACC_CUENTA_CAPATAZ_NO_DISPONIBLE` |
| No se cumple `ACC-BR-024` | 4 | Se rechaza sin modificar la asignación | `ACC_CHACRA_NO_DISPONIBLE` |
| No existe la asignación única de `ACC-BR-025` | 5 | Se rechaza; no se crea otra asignación | `ACC_ASIGNACION_TERRITORIAL_NO_ENCONTRADA` |
| No se cumple `ACC-BR-026` | 5 | Se rechaza sin cambios | `ACC_TRANSICION_ASIGNACION_TERRITORIAL_INVALIDA` |
| TER no puede validar la Chacra | 4 | Se rechaza sin confirmar efectos parciales | `ACC_VALIDACION_TERRITORIAL_NO_DISPONIBLE` |

**Postcondiciones**

- La asignación existente queda ACTIVA sin cambiar su identidad ni perder su historia.

**Escenarios de aceptación**

```gherkin
@ACC-UC-015 @AC-01
Escenario: Reactivar explícitamente una asignación territorial
  Dado una asignación INACTIVA cuya Cuenta conserva estado ACTIVA y rol Capataz y cuya Chacra está ACTIVA
  Cuando el Administrador solicita reactivarla
  Entonces la asignación existente queda ACTIVA sin crear otra

@ACC-UC-015 @AC-02
Escenario: Denegar la reactivación a un actor sin permiso
  Dado un actor sin autorización para administrar asignaciones territoriales
  Cuando solicita reactivar una asignación
  Entonces se rechaza con ACC_ACCESO_DENEGADO

@ACC-UC-015 @AC-03
Escenario: Rechazar la reactivación para una Cuenta no disponible
  Dado que la Cuenta está SUSPENDIDA o ya no tiene rol Capataz
  Cuando el Administrador solicita reactivar su asignación
  Entonces se rechaza con ACC_CUENTA_CAPATAZ_NO_DISPONIBLE

@ACC-UC-015 @AC-04
Escenario: Rechazar la reactivación para una Chacra no disponible
  Dado que la Chacra está INACTIVA o pertenece a otra Empresa
  Cuando el Administrador solicita reactivar la asignación
  Entonces se rechaza con ACC_CHACRA_NO_DISPONIBLE

@ACC-UC-015 @AC-05
Escenario: Exigir una asignación existente
  Dado que no existe una asignación para el par Cuenta y Chacra
  Cuando el Administrador solicita reactivarla
  Entonces se rechaza con ACC_ASIGNACION_TERRITORIAL_NO_ENCONTRADA

@ACC-UC-015 @AC-06
Escenario: Rechazar la reactivación de una asignación ya activa
  Dado una asignación territorial ACTIVA
  Cuando el Administrador solicita reactivarla
  Entonces se rechaza con ACC_TRANSICION_ASIGNACION_TERRITORIAL_INVALIDA
```

### ACC-UC-016 — Consultar asignaciones territoriales

- **Estado:** Aprobado
- **Actor:** Administrador, Capataz o SuperAdministrador.
- **Objetivo:** Consultar asignaciones territoriales dentro del alcance autorizado.
- **Requerimientos:** `ACC-REQ-016`.
- **Reglas:** `ACC-BR-002`, `ACC-BR-029`.

**Precondiciones**

- El actor está autenticado; para plataforma existe un contexto de soporte vigente.

**Flujo principal**

1. El actor solicita consultar una asignación o listar asignaciones territoriales.
2. El sistema comprueba el permiso y `ACC-BR-002`; para plataforma aplica además `ACC-BR-011`.
3. El sistema restringe el conjunto conforme a `ACC-BR-029`.
4. El sistema informa las asignaciones autorizadas; los listados aplican las convenciones de paginación, filtros y orden.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| El actor no tiene permiso | 2 | Se rechaza sin revelar asignaciones | `ACC_ACCESO_DENEGADO` |
| No se cumple `ACC-BR-002` | 2 | Se rechaza sin revelar datos ajenos | `ACC_EMPRESA_FUERA_DE_ALCANCE` |
| No se cumple `ACC-BR-029` | 3 | Se rechaza sin revelar la asignación | `ACC_ASIGNACION_TERRITORIAL_FUERA_DE_ALCANCE` |
| La asignación no existe dentro del alcance | 3 | Se informa ausencia dentro del contexto autorizado | `ACC_ASIGNACION_TERRITORIAL_NO_ENCONTRADA` |

**Postcondiciones**

- La consulta no modifica asignaciones ni amplía el alcance del actor.

**Escenarios de aceptación**

```gherkin
@ACC-UC-016 @AC-01
Escenario: Administrador consulta todas las asignaciones de su Empresa
  Dado un Administrador con asignaciones ACTIVA e INACTIVA en su Empresa
  Cuando solicita el listado de asignaciones territoriales
  Entonces recibe las asignaciones de su Empresa en ambos estados

@ACC-UC-016 @AC-02
Escenario: Capataz consulta sus asignaciones vigentes
  Dado un Capataz con asignaciones propias ACTIVA e INACTIVA
  Cuando solicita sus asignaciones territoriales
  Entonces recibe únicamente sus asignaciones ACTIVA

@ACC-UC-016 @AC-03
Escenario: Denegar la consulta a un actor sin permiso
  Dado un actor sin autorización para consultar asignaciones territoriales
  Cuando solicita una asignación
  Entonces se rechaza con ACC_ACCESO_DENEGADO

@ACC-UC-016 @AC-04
Escenario: Impedir que un Capataz consulte asignaciones ajenas
  Dado una asignación de otro Capataz de la misma Empresa
  Cuando el Capataz solicita consultarla
  Entonces se rechaza con ACC_ASIGNACION_TERRITORIAL_FUERA_DE_ALCANCE

@ACC-UC-016 @AC-05
Escenario: Impedir una consulta de otra Empresa
  Dado una asignación perteneciente a otra Empresa
  Cuando el actor solicita consultarla
  Entonces se rechaza con ACC_EMPRESA_FUERA_DE_ALCANCE
```

### ACC-UC-017 — Resolver el alcance territorial vigente del Capataz

- **Estado:** Aprobado
- **Actor:** Capataz.
- **Objetivo:** Resolver la selección vigente de Chacras que integra su contexto autorizado.
- **Requerimientos:** `ACC-REQ-017`.
- **Reglas:** `ACC-BR-001`, `ACC-BR-002`, `ACC-BR-007`, `ACC-BR-028`.

**Precondiciones**

- El actor presenta una Sesión de una Cuenta de Empresa ACTIVA que conserva el rol Capataz.

**Flujo principal**

1. El Capataz solicita una operación autenticada que consume alcance territorial.
2. El sistema resuelve la Cuenta, Empresa, Sesión y rol vigentes conforme a `ACC-UC-003`.
3. El sistema obtiene las asignaciones de la Cuenta y aplica `ACC-BR-028`.
4. El sistema incorpora al contexto autorizado una selección con los identificadores de Chacra resultantes, incluida la selección vacía.
5. El módulo consumidor aplica sus propias reglas sobre el recurso solicitado.

**Excepciones**

| Condición | Paso | Resultado | Código |
|---|---:|---|---|
| La Cuenta no está ACTIVA, no conserva el rol Capataz o la Sesión no está vigente | 2 | Se rechaza sin entregar alcance | `ACC_ACCESO_DENEGADO` |
| No se cumple `ACC-BR-001` o `ACC-BR-002` | 2 | Se rechaza sin entregar referencias ajenas | `ACC_CUENTA_EMPRESA_INCOMPATIBLE` o `ACC_EMPRESA_FUERA_DE_ALCANCE` |
| No se cumple `ACC-BR-007` | 2 | Se rechaza sin entregar alcance | `ACC_ROL_NO_ADMITIDO` |
| No se cumple `ACC-BR-028` | 3 | Se rechaza sin construir un contexto parcial | `ACC_ALCANCE_TERRITORIAL_INVALIDO` |

**Postcondiciones**

- El contexto contiene exactamente la selección vigente de Chacras del Capataz; este caso no concede permisos del módulo consumidor.

**Escenarios de aceptación**

```gherkin
@ACC-UC-017 @AC-01
Escenario: Resolver las Chacras asignadas al Capataz
  Dado un Capataz ACTIVO con dos asignaciones ACTIVA
  Cuando se resuelve su alcance territorial
  Entonces el contexto contiene exactamente los dos identificadores de Chacra

@ACC-UC-017 @AC-02
Escenario: Resolver una selección vacía
  Dado un Capataz ACTIVO sin asignaciones ACTIVA
  Cuando se resuelve su alcance territorial
  Entonces el contexto contiene una selección vacía

@ACC-UC-017 @AC-03
Escenario: Excluir una asignación inactiva
  Dado un Capataz con una asignación ACTIVA y otra INACTIVA
  Cuando se resuelve su alcance territorial
  Entonces el contexto contiene únicamente la Chacra de la asignación ACTIVA

@ACC-UC-017 @AC-04
Escenario: Mantener una Chacra posteriormente inactiva en el alcance
  Dado una asignación ACTIVA cuya Chacra quedó INACTIVA después de asignarse
  Cuando se resuelve el alcance territorial del Capataz
  Entonces el contexto conserva el identificador de esa Chacra para las consultas históricas autorizadas

@ACC-UC-017 @AC-05
Escenario: Denegar alcance a una Cuenta no habilitada como Capataz
  Dado una Cuenta SUSPENDIDA o sin rol Capataz
  Cuando intenta resolver alcance territorial
  Entonces se rechaza con ACC_ACCESO_DENEGADO

@ACC-UC-017 @AC-06
Escenario: Rechazar un alcance territorial inconsistente
  Dado que el conjunto calculado incluye una asignación INACTIVA o perteneciente a otra Cuenta
  Cuando el sistema intenta construir el contexto
  Entonces se rechaza con ACC_ALCANCE_TERRITORIAL_INVALIDO
```
