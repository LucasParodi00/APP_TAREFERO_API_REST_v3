---
type: requirements
module: "ACC"
status: Aprobado
owner: "Analista"
---

# Identidad y acceso — Requerimientos

Borrador derivado del brief y de las respuestas del Ingeniero. Los ítems requieren revisión y aprobación explícita; responder preguntas no aprueba automáticamente esta redacción. Las condiciones transversales ya definidas se referencian, sin redefinirlas.

## 1. Reglas de negocio

### ACC-BR-001 — Cuentas independientes por Empresa

- **Estado:** Aprobado
- **Origen:** `B-10`, `ACC-Q-001`
- **Tipo:** Invariante
- **Regla:** Las credenciales, roles, permisos y estado de una Cuenta de Empresa pertenecen exclusivamente a esa Empresa y sus cambios no modifican cuentas de otras Empresas.
- **Si se incumple:** se rechaza con `ACC_CUENTA_EMPRESA_INCOMPATIBLE`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Restablecer la cuenta de Empresa A sin cambiar la de B | Admitido si se satisfacen las demás condiciones. |
| Una persona conserva una cuenta propia en cada una de dos Empresas | Caso límite admitido. |
| Intentar trasladar permisos o modificar credenciales de otra Empresa | Se rechaza con `ACC_CUENTA_EMPRESA_INCOMPATIBLE`. |

### ACC-BR-002 — Pertenencia al contexto autorizado

- **Estado:** Aprobado
- **Origen:** `B-03`, `B-05`
- **Tipo:** Autorización de dominio
- **Regla:** Una operación de administración de cuentas solo puede afectar la Empresa del contexto autorizado del actor; el soporte de plataforma requiere el contexto de ACC-BR-011.
- **Si se incumple:** se rechaza con `ACC_EMPRESA_FUERA_DE_ALCANCE`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Crear una cuenta en la Empresa del Administrador | Admitido si se satisfacen las demás condiciones. |
| El soporte selecciona explícitamente la Empresa autorizada | Caso límite admitido. |
| Un Administrador intenta crear una cuenta en otra Empresa | Se rechaza con `ACC_EMPRESA_FUERA_DE_ALCANCE`. |

### ACC-BR-003 — Correo único dentro de la Empresa

- **Estado:** Aprobado
- **Origen:** `B-10`, `ACC-Q-018`
- **Tipo:** Invariante
- **Regla:** El correo de acceso normalizado conforme a `ACC-BR-018` no puede repetirse dentro de la misma Empresa.
- **Si se incumple:** se rechaza con `ACC_CORREO_DUPLICADO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Correo todavía no utilizado en la Empresa | Admitido si se satisfacen las demás condiciones. |
| El mismo correo existe en otra Empresa | Caso límite admitido. |
| El correo ya corresponde a otra cuenta de la misma Empresa | Se rechaza con `ACC_CORREO_DUPLICADO`. |

### ACC-BR-004 — Credenciales para habilitar acceso

- **Estado:** Aprobado
- **Origen:** `B-07`, `B-08`
- **Tipo:** Validación
- **Regla:** Habilitar una Cuenta de Empresa requiere correo de acceso y una contraseña establecida por el actor autorizado.
- **Si se incumple:** se rechaza con `ACC_CREDENCIALES_REQUERIDAS`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Correo y contraseña informados | Admitido si se satisfacen las demás condiciones. |
| Persona registrada sin acceso y sin contraseña: no solicita habilitación | Caso límite admitido. |
| Se solicita habilitación sin contraseña | Se rechaza con `ACC_CREDENCIALES_REQUERIDAS`. |

### ACC-BR-005 — Canal habilitado

- **Estado:** Aprobado
- **Origen:** `ACC-Q-010`
- **Tipo:** Validación
- **Regla:** Una Cuenta de Empresa solo puede autenticarse u operar desde un canal habilitado expresamente para ella.
- **Si se incumple:** se rechaza con `ACC_CANAL_NO_HABILITADO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Cuenta con canal móvil habilitado ingresa desde Android | Admitido si se satisfacen las demás condiciones. |
| Cuenta con ambos canales habilitados ingresa desde cualquiera de ellos | Caso límite admitido. |
| Cuenta con acceso exclusivamente web intenta ingresar desde Android | Se rechaza con `ACC_CANAL_NO_HABILITADO`. |

### ACC-BR-006 — Cupo por cuenta activa

- **Estado:** Aprobado
- **Origen:** `B-01`, `ACC-Q-004`, `ACC-Q-010`, `ACC-Q-011`
- **Tipo:** Invariante
- **Regla:** La habilitación de una Cuenta de Empresa debe respetar el cupo de accesos de su Suscripción de Empresa; una cuenta habilitada en ambos canales ocupa un solo acceso.
- **Si se incumple:** se rechaza con `ACC_LIMITE_ACCESOS_ALCANZADO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Habilitación con cupo disponible | Admitido si se satisfacen las demás condiciones. |
| Habilitar ambos canales de la misma cuenta no duplica su consumo | Caso límite admitido. |
| Habilitación de otra cuenta sin cupo disponible | Se rechaza con `ACC_LIMITE_ACCESOS_ALCANZADO`. |

### ACC-BR-007 — Roles iniciales del sistema

- **Estado:** Aprobado
- **Origen:** `B-11`, `ACC-Q-006`
- **Tipo:** Invariante
- **Regla:** Las asignaciones iniciales de rol deben utilizar el catálogo fijo del sistema y respetar la separación entre roles de Empresa y de plataforma.
- **Si se incumple:** se rechaza con `ACC_ROL_NO_ADMITIDO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Asignar un rol de Empresa del catálogo | Admitido si se satisfacen las demás condiciones. |
| Crear un SuperAdministrador mediante su operación de plataforma | Caso límite admitido. |
| Asignar el rol de plataforma a una Cuenta de Empresa | Se rechaza con `ACC_ROL_NO_ADMITIDO`. |

### ACC-BR-008 — Último SuperAdministrador activo

- **Estado:** Aprobado
- **Origen:** `B-05`, `B-12`, `ACC-Q-007`
- **Tipo:** Invariante
- **Regla:** Una operación no puede dejar la plataforma sin al menos un SuperAdministrador activo.
- **Si se incumple:** se rechaza con `ACC_ULTIMO_SUPERADMINISTRADOR`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Conservar activo un SuperAdministrador mientras se desactiva otro | Admitido si se satisfacen las demás condiciones. |
| El primer SuperAdministrador se crea mediante inicialización segura | Caso límite admitido. |
| Desactivar al único SuperAdministrador activo | Se rechaza con `ACC_ULTIMO_SUPERADMINISTRADOR`. |

### ACC-BR-009 — Directorio de Empresa sin SuperAdministradores

- **Estado:** Aprobado
- **Origen:** `B-04`, `ACC-Q-008`
- **Tipo:** Invariante
- **Regla:** Las consultas de cuentas de una Empresa no deben incluir las identidades de SuperAdministradores de plataforma.
- **Si se incumple:** se rechaza con `ACC_IDENTIDAD_PLATAFORMA_NO_VISIBLE`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Listar las cuentas propias de la Empresa | Admitido si se satisfacen las demás condiciones. |
| La Empresa conserva referencia a una intervención como Soporte de plataforma | Caso límite admitido. |
| Solicitar el perfil de un SuperAdministrador desde el directorio de Empresa | Se rechaza con `ACC_IDENTIDAD_PLATAFORMA_NO_VISIBLE`. |

### ACC-BR-010 — Restablecimiento limitado a la Empresa

- **Estado:** Aprobado
- **Origen:** `B-15`, `ACC-Q-001`, `ACC-Q-009`
- **Tipo:** Autorización de dominio
- **Regla:** Un restablecimiento administrativo de contraseña solo puede afectar una cuenta de la Empresa autorizada y no concede acceso a sus contraseñas anteriores.
- **Si se incumple:** se rechaza con `ACC_RESTABLECIMIENTO_FUERA_DE_ALCANCE`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Administrador restablece una cuenta de su Empresa | Admitido si se satisfacen las demás condiciones. |
| SuperAdministrador atiende la recuperación mediante soporte autorizado | Caso límite admitido. |
| Administrador intenta restablecer una cuenta ajena | Se rechaza con `ACC_RESTABLECIMIENTO_FUERA_DE_ALCANCE`. |

### ACC-BR-011 — Contexto explícito de soporte

- **Estado:** Aprobado
- **Origen:** `B-05`, `B-13`, `ACC-Q-005`
- **Tipo:** Autorización de dominio
- **Regla:** Una intervención de soporte requiere Empresa destino y motivo, conserva la identidad real del SuperAdministrador y no omite las reglas de integridad del negocio.
- **Si se incumple:** se rechaza con `ACC_CONTEXTO_SOPORTE_REQUERIDO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Soporte con Empresa y motivo identificados | Admitido si se satisfacen las demás condiciones. |
| Soporte ejecuta una acción sin exigir roles internos de la Empresa | Caso límite admitido. |
| Soporte intenta operar sin motivo o eludiendo integridad | Se rechaza con `ACC_CONTEXTO_SOPORTE_REQUERIDO`. |

### ACC-BR-012 — Cambio de contraseña voluntario

- **Estado:** Aprobado
- **Origen:** `B-08`, `ACC-Q-013`
- **Tipo:** Invariante
- **Regla:** Una contraseña creada o restablecida por un Administrador o SuperAdministrador no obliga al titular a cambiarla al iniciar sesión.
- **Si se incumple:** No aplica: condición de comportamiento; no genera rechazo al titular.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| El titular mantiene la contraseña asignada | Admitido si se satisfacen las demás condiciones. |
| El titular decide cambiarla desde un canal autorizado | Caso límite admitido. |
| Imponer un cambio obligatorio contradice la decisión: comportamiento no admitido | La implementación debe respetar la decisión del Ingeniero. |

### ACC-BR-013 — Titularidad del cambio propio

- **Estado:** Aprobado
- **Origen:** `B-08`, `ACC-Q-018`
- **Tipo:** Autorización de dominio
- **Regla:** El cambio propio de contraseña solo puede modificar la cuenta del titular autenticado y exige comprobar su contraseña actual.
- **Si se incumple:** se rechaza con `ACC_CAMBIO_PROPIO_NO_AUTORIZADO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Titular con su contraseña actual correcta | Se acepta. |
| Cuenta de la misma persona en otra Empresa | No se modifica desde este contexto. |
| Contraseña actual incorrecta o cuenta destino ajena | Se rechaza con `ACC_CAMBIO_PROPIO_NO_AUTORIZADO`. |

### ACC-BR-014 — Caducidad tras cambiar credenciales

- **Estado:** Aprobado
- **Origen:** `ACC-Q-001`, `ACC-Q-018`
- **Tipo:** Transición
- **Regla:** Cambiar o restablecer la contraseña invalida todas las Sesiones de la Cuenta de Empresa afectada, incluida la Sesión desde la que se hizo el cambio propio, sin invalidar cuentas de otras Empresas.
- **Si se incumple:** la operación no se confirma con efectos parciales; código `ACC_CAMBIO_CREDENCIAL_NO_COMPLETADO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Cuenta con sesiones web y móvil | Ninguna de las anteriores conserva acceso ni renovación tras confirmar. |
| La persona tiene una cuenta en otra Empresa | Sus sesiones de la otra Empresa no se modifican. |
| No se puede completar la invalidación de sesiones | No se confirma un cambio parcial. |

### ACC-BR-015 — Cuenta única por persona y Empresa

- **Estado:** Aprobado
- **Origen:** `ACC-Q-016`
- **Tipo:** Invariante
- **Regla:** Cada persona puede tener como máximo una Cuenta de Empresa en una misma Empresa, incluso si la cuenta existente está suspendida.
- **Si se incumple:** se rechaza con `ACC_CUENTA_PERSONA_DUPLICADA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Persona sin cuenta previa en la Empresa | Se permite habilitarla. |
| La persona ya tiene cuenta en otra Empresa | Se permite una cuenta propia en esta Empresa. |
| Segunda cuenta para la misma persona y Empresa | Se rechaza con `ACC_CUENTA_PERSONA_DUPLICADA`. |

### ACC-BR-016 — Ciclo de acceso de Empresa

- **Estado:** Aprobado
- **Origen:** `ACC-Q-016`
- **Tipo:** Transición
- **Regla:** Una Cuenta de Empresa habilitada se crea ACTIVA y admite las transiciones ACTIVA a SUSPENDIDA y SUSPENDIDA a ACTIVA; reactivar está sujeto a las condiciones vigentes de habilitación.
- **Si se incumple:** se rechaza con `ACC_TRANSICION_NO_PERMITIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Suspender una cuenta activa | Se admite y se conserva su historial. |
| Reactivar una cuenta suspendida con cupo y habilitación vigentes | Se admite. |
| Solicitar una transición distinta del ciclo definido | Se rechaza con `ACC_TRANSICION_NO_PERMITIDA`. |

### ACC-BR-017 — Conservación de la cuenta

- **Estado:** Aprobado
- **Origen:** `ACC-Q-016`
- **Tipo:** Invariante
- **Regla:** Una Cuenta de Empresa no se elimina físicamente; la baja de acceso se expresa por suspensión y conserva su identidad e historial.
- **Si se incumple:** se rechaza con `ACC_ELIMINACION_NO_PERMITIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Suspender una cuenta utilizada | Se conserva la cuenta. |
| Suspender una cuenta sin operaciones previas | Se conserva igualmente. |
| Solicitar borrado físico de la cuenta | Se rechaza con `ACC_ELIMINACION_NO_PERMITIDA`. |

### ACC-BR-018 — Normalización del correo de acceso

- **Estado:** Aprobado
- **Origen:** `ACC-Q-018`
- **Tipo:** Validación
- **Regla:** El correo de acceso admite hasta 254 caracteres después de eliminar espacios exteriores y se normaliza a minúsculas para identificar y comparar la Cuenta de Empresa.
- **Si se incumple:** se rechaza con `ACC_CORREO_INVALIDO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Correo ` Usuario@Empresa.com ` | Se normaliza como `usuario@empresa.com`. |
| Correo de 254 caracteres después de eliminar espacios exteriores | Se admite si satisface las demás condiciones. |
| Correo de 255 caracteres después de eliminar espacios exteriores | Se rechaza con `ACC_CORREO_INVALIDO`. |

### ACC-BR-019 — Longitud y conservación de la contraseña

- **Estado:** Aprobado
- **Origen:** `ACC-Q-018`
- **Tipo:** Validación
- **Regla:** Toda contraseña establecida o presentada contiene entre 15 y 128 caracteres y se conserva exactamente como fue ingresada para su comprobación, sin eliminar espacios ni modificar mayúsculas o minúsculas.
- **Si se incumple:** se rechaza con `ACC_CONTRASENIA_INVALIDA`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Contraseña de 15 caracteres | Se admite. |
| Contraseña de 128 caracteres, incluidos espacios significativos | Se admite y no se transforma antes de protegerla o comprobarla. |
| Contraseña de 14 o 129 caracteres | Se rechaza con `ACC_CONTRASENIA_INVALIDA`. |

### ACC-BR-020 — Motivo de soporte válido

- **Estado:** Aprobado
- **Origen:** `ACC-Q-005`, `ACC-Q-018`
- **Tipo:** Validación
- **Regla:** El motivo de soporte elimina espacios exteriores, debe conservar contenido y admite hasta 1000 caracteres.
- **Si se incumple:** se rechaza con `ACC_MOTIVO_SOPORTE_INVALIDO`.
- **Ejemplos:**

| Situación | Resultado |
|---|---|
| Motivo ` Recuperar acceso del Administrador ` | Se conserva sin los espacios exteriores. |
| Motivo de 1000 caracteres | Se admite. |
| Motivo vacío después de normalizar o de 1001 caracteres | Se rechaza con `ACC_MOTIVO_SOPORTE_INVALIDO`. |

## 2. Requerimientos funcionales

### ACC-REQ-001 — Habilitar una Cuenta de Empresa

- **Estado:** Aprobado
- **Origen:** `B-01`, `B-05`, `B-06`, `B-07`, `ACC-Q-004`, `ACC-Q-015`, `ACC-Q-016`, `ACC-Q-018`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir habilitar una Cuenta de Empresa para una persona registrada, manteniendo la administración inicial y posterior del cliente según ACC-Q-015.
- **Reglas que aplica:** `ACC-BR-001`, `ACC-BR-002`, `ACC-BR-003`, `ACC-BR-004`, `ACC-BR-006`, `ACC-BR-007`, `ACC-BR-015`, `ACC-BR-016`, `ACC-BR-018`, `ACC-BR-019`.

### ACC-REQ-002 — Iniciar sesión en una Empresa

- **Estado:** Aprobado
- **Origen:** `B-02`, `ACC-Q-001`, `ACC-Q-010`, `ACC-Q-012`, `ACC-Q-018`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir iniciar sesión en una Cuenta de Empresa identificando la Empresa mediante su alias y usando las credenciales propias de esa cuenta.
- **Reglas que aplica:** `ACC-BR-001`, `ACC-BR-005`, `ACC-BR-012`, `ACC-BR-018`, `ACC-BR-019`.

### ACC-REQ-003 — Resolver el acceso vigente de una solicitud

- **Estado:** Aprobado
- **Origen:** `B-02`, `B-03`
- **Prioridad:** Must
- **Requerimiento:** Cuando se solicita una operación autenticada, el sistema debe proporcionar el contexto de autorización vigente conforme a arquitectura.md §13.3 y §13.4.
- **Reglas que aplica:** `ACC-BR-002`, `ACC-BR-007`.

### ACC-REQ-004 — Cambiar la propia contraseña

- **Estado:** Aprobado
- **Origen:** `B-08`, `ACC-Q-013`, `ACC-Q-018`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir que el titular cambie voluntariamente la contraseña de su Cuenta de Empresa desde un canal habilitado.
- **Reglas que aplica:** `ACC-BR-001`, `ACC-BR-005`, `ACC-BR-012`, `ACC-BR-013`, `ACC-BR-014`, `ACC-BR-019`.

### ACC-REQ-005 — Restablecer una contraseña de Empresa

- **Estado:** Aprobado
- **Origen:** `B-15`, `ACC-Q-009`, `ACC-Q-018`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir restablecer administrativamente la contraseña de una Cuenta de Empresa sin ofrecer recuperación pública.
- **Reglas que aplica:** `ACC-BR-001`, `ACC-BR-002`, `ACC-BR-010`, `ACC-BR-011`, `ACC-BR-012`, `ACC-BR-014`, `ACC-BR-019`, `ACC-BR-020`.

### ACC-REQ-006 — Crear un SuperAdministrador

- **Estado:** Aprobado
- **Origen:** `B-05`, `B-12`, `ACC-Q-007`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir crear el primer SuperAdministrador mediante inicialización segura y los posteriores mediante administración de plataforma.
- **Reglas que aplica:** `ACC-BR-007`.

### ACC-REQ-007 — Operar mediante soporte de plataforma

- **Estado:** Aprobado
- **Origen:** `B-05`, `B-13`, `ACC-Q-005`, `ACC-Q-018`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir realizar una intervención de soporte sobre una Empresa mediante un contexto explícito auditable.
- **Reglas que aplica:** `ACC-BR-002`, `ACC-BR-011`, `ACC-BR-020`.

### ACC-REQ-008 — Consultar cuentas de Empresa

- **Estado:** Aprobado
- **Origen:** `B-04`, `B-05`, `ACC-Q-016`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir consultar y listar Cuentas de Empresa dentro del alcance autorizado.
- **Reglas que aplica:** `ACC-BR-002`, `ACC-BR-009`.

### ACC-REQ-009 — Renovar la sesión de Empresa

- **Estado:** Aprobado
- **Origen:** `B-02`; arquitectura.md §13.2 y convenciones.md §7.1
- **Prioridad:** Should
- **Requerimiento:** El sistema debe permitir renovar una Sesión de Empresa conforme al ciclo vigente de autenticación y renovación definido en la fundación.
- **Reglas que aplica:** `ACC-BR-001`, `ACC-BR-005`.

### ACC-REQ-010 — Administrar habilitación de acceso

- **Estado:** Aprobado
- **Origen:** `ACC-Q-016`, `ACC-Q-016`
- **Prioridad:** Must
- **Requerimiento:** El sistema debe permitir suspender y reactivar una Cuenta de Empresa y modificar sus canales y roles dentro del alcance autorizado.
- **Reglas que aplica:** `ACC-BR-002`, `ACC-BR-005`, `ACC-BR-006`, `ACC-BR-007`, `ACC-BR-016`, `ACC-BR-017`.

### ACC-REQ-011 — Consultar intervenciones de soporte

- **Estado:** Aprobado
- **Origen:** `B-04`, `ACC-Q-008`
- **Prioridad:** Should
- **Requerimiento:** El sistema debe permitir consultar en el historial de Empresa las intervenciones de soporte con la presentación aprobada en ACC-Q-008.
- **Reglas que aplica:** `ACC-BR-002`, `ACC-BR-009`.

## 3. Dependencias con otros módulos

### ACC-DEP-001 — Empresas — Identidad, alias y estado

- **Estado:** Aprobado
- **Origen:** `B-02`, `B-03`, `ACC-Q-012`, `ACC-Q-015`, `EMP-Q-013`
- **Módulo:** `EMP` (Empresas)
- **Dirección:** Este módulo consume
- **Qué:** identidad, alias inmutable y estado vigente de Empresa. `EMP` es dueño del alias obligatorio, globalmente único y no reutilizable definido por `EMP-BR-011` a `EMP-BR-013`.
- **Para qué:** `ACC-REQ-001`, `ACC-REQ-002`, `ACC-REQ-003`, `ACC-REQ-007`, `ACC-REQ-009`.

### ACC-DEP-002 — Suscripciones — Disponibilidad de acceso

- **Estado:** Aprobado
- **Origen:** `B-01`, `B-14`, `ACC-Q-011`, `ACC-Q-015`
- **Módulo:** `SUS` (Suscripciones)
- **Dirección:** Este módulo consume
- **Qué:** habilitación comercial vigente y cupo disponible; mientras SUS sea futuro se requiere el contrato provisional contemplado en arquitectura.md §13.1. No se inventan nombres de planes ni límites.
- **Para qué:** `ACC-BR-006`, `ACC-REQ-001`, `ACC-REQ-002`, `ACC-REQ-009`, `ACC-REQ-010`.

### ACC-DEP-003 — Personal — Persona o Empleado de la Empresa

- **Estado:** Aprobado
- **Origen:** `B-07`, `B-09`, `B-10`, `ACC-Q-002`, `ACC-Q-004`
- **Módulo:** `PER` (Personal)
- **Dirección:** Este módulo consume
- **Qué:** referencia a la persona registrada, pertenencia a la Empresa y comprobación de identidad; PER conserva DNI, nombre, apellido y datos personales/laborales. La unicidad del DNI indicada en B-10 se deriva a su dueño mediante esta dependencia. No se presupone que toda cuenta de Administrador represente un Empleado.
- **Para qué:** `ACC-REQ-001`, `ACC-REQ-008`.

### ACC-DEP-004 — Módulos de negocio — Contexto autorizado

- **Estado:** Aprobado
- **Origen:** `B-02`, `B-03`, `B-05`, `ACC-Q-005`
- **Módulo:** GLOBAL (consumidores de autorización)
- **Dirección:** Este módulo provee
- **Qué:** contexto de actor, Empresa, Sesión, permisos y alcance según arquitectura.md §13; identifica separadamente el soporte de plataforma. El historial funcional sigue bajo cada módulo dueño.
- **Para qué:** `ACC-REQ-003`, `ACC-REQ-007`, `ACC-REQ-011`.

## 4. Fuera de alcance

- Suscripciones personales, autoservicio e invitaciones: `B-08`, `B-14`, `ACC-Q-011`, `ACC-Q-014`, `ACC-Q-015`.
- Recuperación pública de contraseña: `B-15`, `ACC-Q-009`.
- Datos laborales, sanitarios, contactos de emergencia, especializaciones, licencias y asistencia: `B-07`, `ACC-Q-002`, `ACC-DEP-003`.
- Binario del CV y sus metadatos, cuyo dueño es ARC; su incorporación funcional queda para el final: `B-07`, `ACC-Q-002`. No se crea un campo de CV en la cuenta de acceso.
- Roles personalizados: `B-11`, `ACC-Q-006`.
- Aceptación de comandos offline después de revocación: convenciones.md §7.2; el mecanismo corresponde a SIN y no se resuelve confiando en el reloj del móvil.
- Mecanismo operativo de acceso y recuperación de plataforma: a cargo del Ingeniero mediante `.env`, conforme a `ACC-Q-017`. Los casos de soporte y creación posteriores parten de un SuperAdministrador autenticado. No se define aquí un ingreso público de plataforma.
- Administración detallada de dispositivos, cierre voluntario y revocación administrativa independiente de cambio de contraseña: no se agregan como capacidades aprobadas de esta entrega; `ACC-Q-017` no enumeró sus permisos ni comportamiento. La verificación de vigencia sigue la fundación.

