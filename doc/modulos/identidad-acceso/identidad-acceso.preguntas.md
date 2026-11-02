---
type: questions
module: 'ACC'
---

# Identidad y acceso — Preguntas

<!-- Registro único de preguntas del módulo. Las respuestas del Ingeniero son origen de especificación. -->

## ACC-Q-001 — Cuenta de acceso separada por Empresa

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-10`, `B-14`, `B-15`; conflicto con arquitectura §13.4
- **Afecta:** modelo completo de Cuenta de Empresa, credenciales e inicio de sesión
- **Pregunta:** ¿Aprobás que la misma Persona tenga una Cuenta de Empresa independiente en cada Empresa, con correo de acceso, contraseña, estado, canales, roles y permisos propios?
- **Interpretaciones posibles:**
  - a) Cuenta independiente por Empresa; un restablecimiento administrativo solo afecta esa Empresa. La misma persona puede tener credenciales diferentes en otras Empresas.
  - b) Una cuenta y contraseña globales, lo que impediría que un Administrador restablezca con seguridad la contraseña sin afectar otras Empresas.
- **Recomendación del agente:** opción a). Es la única compatible con correo único por Empresa, permisos que no se trasladan y restablecimiento realizado por el Administrador de esa Empresa.
- **Respuesta:** Sí, cuentas independientes por Empresa.
- **Respondida por / fecha:** Parodi Lucas / 2026-11-02 (confirmación en el chat).

La decisión se incorpora a la especificación propuesta de ACC. No requiere una identidad de credenciales globales.

## ACC-Q-002 — Propiedad de datos personales y laborales

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-07`, `B-09`
- **Afecta:** límites de `ACC`, `PER` y `ARC`
- **Pregunta:** ¿Se aprueba que `ACC` conserve solo datos necesarios para cuenta y acceso, mientras `PER` sea dueño de DNI, dirección, sangre, contactos, especializaciones, licencias y asistencia, y `ARC` del PDF del CV?
- **Interpretaciones posibles:**
  - a) Separar cuenta de acceso, Persona/Empleado y archivos.
  - b) Guardar todos los datos dentro de Usuario.
- **Recomendación del agente:** opción a), por aislamiento, privacidad y porque una Persona o Empleado puede existir sin Usuario.
- **Respuesta:** Aprobada la separación propuesta; Personas y Empleados pueden existir sin ser Usuarios.
- **Respondida por / fecha:** Ingeniero / 2026-10-30

## ACC-Q-003 — Contraseña inicial y primer ingreso

- **Estado:** Descartada
- **Bloqueante:** No
- **Origen:** `B-06`, `B-08`
- **Afecta:** reemplazada por `ACC-Q-013`
- **Pregunta:** Cuando un Administrador establece la contraseña inicial, ¿el Usuario debe cambiarla obligatoriamente en el primer ingreso o el cambio queda a su elección?
- **Interpretaciones posibles:**
  - a) Debe cambiarla en el primer ingreso antes de operar.
  - b) Puede cambiarla cuando quiera, sin obligación inicial.
- **Recomendación del agente:** opción a), porque la contraseña fue conocida por otra persona. No se envía invitación: el Administrador comunica la contraseña inicial por el medio acordado.
- **Respuesta:** La decisión se consolidó en `ACC-Q-013`, que cubre tanto la contraseña inicial como cualquier contraseña restablecida por un Administrador o SuperAdministrador.
- **Respondida por / fecha:** Agente / 2026-10-30

## ACC-Q-004 — Significado de Usuario interno sin acceso

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-06`, `B-09`
- **Afecta:** creación de Persona, Empleado y Cuenta de Empresa; consumo del Plan
- **Pregunta:** Tras aprobar que Personas y Empleados pueden existir sin Usuario, ¿qué registro representa “usuario interno sin acceso”?
- **Interpretaciones posibles:**
  - a) Es una Persona o Empleado de `PER`; no existe Cuenta de Empresa hasta que se lo habilite.
  - b) Se crea igualmente una Cuenta de Empresa deshabilitada, aunque todavía no tenga acceso.
- **Recomendación del agente:** opción a). Evita credenciales innecesarias y hace que el Plan cuente solo Cuentas de Empresa con acceso habilitado.
- **Respuesta:** a.
- **Respondida por / fecha:** Parodi Lucas 02/11/2026.

## ACC-Q-005 — Acceso de soporte del SuperAdministrador

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-05`, `B-13`
- **Afecta:** autorización de plataforma y auditoría de soporte
- **Pregunta:** ¿El SuperAdministrador opera mediante un contexto explícito de soporte indicando Empresa y motivo, conservando su identidad real y auditoría?
- **Interpretaciones posibles:**
  - a) Sí; puede omitir permisos de Empresa, pero no reglas de integridad del negocio.
  - b) Acceso implícito sin seleccionar Empresa ni dejar motivo.
- **Recomendación del agente:** opción a).
- **Respuesta:** Aprobada la propuesta de contexto de soporte auditado.
- **Respondida por / fecha:** Ingeniero / 2026-10-30

## ACC-Q-006 — Roles iniciales

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-05`, `B-11`
- **Afecta:** roles, permisos y asignaciones
- **Pregunta:** ¿Los roles iniciales son fijos, separando el rol global SuperAdministrador de Administrador, Capataz y Empleado dentro de una Empresa?
- **Interpretaciones posibles:**
  - a) Roles fijos y permisos definidos por el sistema inicialmente.
  - b) Roles personalizados desde la primera versión.
- **Recomendación del agente:** opción a); los roles personalizados quedan como ampliación futura.
- **Respuesta:** Roles fijos inicialmente.
- **Respondida por / fecha:** Ingeniero / 2026-10-30

## ACC-Q-007 — Creación y permanencia de SuperAdministradores

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-05`, `B-12`
- **Afecta:** creación, suspensión y bootstrap de SuperAdministradores
- **Pregunta:** ¿Se aprueba crear el primer SuperAdministrador mediante inicialización segura, permitir que solo un SuperAdministrador cree otro e impedir desactivar al último activo?
- **Interpretaciones posibles:**
  - a) Sí, con bootstrap seguro y regla de último SuperAdministrador.
  - b) Permitir creación o recuperación por otro rol.
- **Recomendación del agente:** opción a).
- **Respuesta:** Aprobada la creación del SuperAdministrador conforme a la propuesta.
- **Respondida por / fecha:** Ingeniero / 2026-10-30

## ACC-Q-008 — Visibilidad de acciones de soporte

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-04`, `B-05`, `ACC-Q-005`
- **Afecta:** consultas de auditoría de Empresa
- **Pregunta:** Aunque el SuperAdministrador no aparezca en directorios de la Empresa, ¿sus acciones de soporte deben aparecer en el historial tenant como “Soporte de plataforma”, conservando su identidad completa solo en auditoría de plataforma?
- **Interpretaciones posibles:**
  - a) Sí; la Empresa ve que intervino soporte, pero no accede al perfil del SuperAdministrador.
  - b) La Empresa no ve ninguna intervención; solo la plataforma conserva auditoría.
- **Recomendación del agente:** opción a), para no ocultar cambios realizados sobre datos de la Empresa.
- **Respuesta:** a.
- **Respondida por / fecha:** Parodi Lucas 02/11/2026.

## ACC-Q-009 — Recuperación y restablecimiento de contraseña

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-08`, `B-15`
- **Afecta:** autenticación y administración de credenciales
- **Pregunta:** Sin invitaciones ni recuperación pública, ¿cómo recupera acceso una persona que olvidó su contraseña?
- **Interpretaciones posibles:**
  - a) El Administrador restablece las cuentas de su Empresa; si el Administrador no puede acceder, interviene el SuperAdministrador mediante soporte auditado.
  - b) Recuperación pública mediante correo.
- **Recomendación del agente:** opción a), sin permitir leer la contraseña anterior.
- **Respuesta:** El Administrador puede restablecer la contraseña de cualquier Usuario de su Empresa. El SuperAdministrador la restablece cuando el Administrador no puede iniciar sesión. No existe recuperación pública por contraseña olvidada.
- **Respondida por / fecha:** Ingeniero / 2026-10-30

## ACC-Q-010 — Canales de acceso

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-01`, `B-06`
- **Afecta:** Cuenta de Empresa y habilitación de acceso
- **Pregunta:** ¿El acceso se habilita con permisos separados para web y aplicación móvil?
- **Interpretaciones posibles:**
  - a) La Cuenta de Empresa declara acceso web, móvil o ambos; tener credenciales no habilita automáticamente los dos canales.
  - b) Una sola habilitación permite ambos canales y los permisos funcionales determinan lo demás.
- **Recomendación del agente:** opción a), porque Administradores y Capataces tienen usos diferentes y el Plan debe contar cualquier Cuenta de Empresa con al menos un canal habilitado una sola vez.
- **Respuesta:** a.
- **Respondida por / fecha:** Parodi Lucas 02/11/2026.

## ACC-Q-011 — Suscripción de Empresa y cupos

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-01`, `B-14`
- **Afecta:** dependencia con `SUS` y habilitación de recursos
- **Pregunta:** ¿La relación comercial corresponde exclusivamente a la Empresa, que contrata un Plan con cupos de Cuentas de Empresa, Chacras y otros recursos?
- **Interpretaciones posibles:**
  - a) Sí; ninguna persona paga una suscripción ni se incorpora por autoservicio.
  - b) Cada Usuario contrata o acepta una suscripción propia.
- **Recomendación del agente:** opción a).
- **Respuesta:** La Empresa contrata el Plan SaaS y sus cupos. Los Usuarios son creados por actores autorizados; no compran ni trasladan una suscripción.
- **Respondida por / fecha:** Ingeniero / 2026-10-30

## ACC-Q-012 — Identificación de Empresa al iniciar sesión

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-10`, `B-15`, `ACC-Q-001`
- **Afecta:** autenticación web y móvil
- **Pregunta:** Si correo y contraseña son independientes por Empresa, ¿cómo indica la persona en qué Empresa quiere iniciar sesión?
- **Interpretaciones posibles:**
  - a) Código o alias único de Empresa + correo + contraseña.
  - b) CUIT de Empresa + correo + contraseña.
  - c) Correo + contraseña y resolver automáticamente solo cuando la combinación identifica una única cuenta; pedir Empresa si existe ambigüedad.
- **Recomendación del agente:** opción a), con un alias corto, estable y único que no exponga el identificador interno ni dependa de que exista CUIT.
- **Respuesta:** a.
- **Respondida por / fecha:** Parodi Lucas 02/11/2026.

## ACC-Q-013 — Contraseña posterior a creación o restablecimiento

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-08`, `B-15`
- **Afecta:** primer ingreso, restablecimiento y cambio de contraseña
- **Pregunta:** ¿La contraseña escrita por el Administrador o SuperAdministrador debe cambiarse obligatoriamente en el siguiente inicio de sesión?
- **Interpretaciones posibles:**
  - a) Sí; queda marcada como temporal hasta que el titular la cambie.
  - b) No; el cambio queda siempre a elección del titular.
- **Recomendación del agente:** opción a), porque quien restablece conoce la contraseña temporal.
- **Respuesta:** b.
- **Respondida por / fecha:** Parodi Lucas 02/11/2026.

## ACC-Q-014 — Terminología de suscripción y acceso

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-09`, `B-10`, `B-14`; conflicto con `glosario.md` y `arquitectura.md`
- **Afecta:** terminología transversal, límites de `ACC` y `SUS`, y modelo de acceso
- **Pregunta:** ¿Aprobás reservar “Suscripción de Empresa” para la relación comercial entre la Empresa y su Plan, retirar “Membresía” como relación Usuario–Empresa y llamar “Cuenta de Empresa” al acceso independiente de una persona dentro de una Empresa?
- **Interpretaciones posibles:**
  - a) Suscripción de Empresa para el contrato SaaS y Cuenta de Empresa para credenciales, roles, canales y estado de acceso.
  - b) Mantener Membresía con dos significados diferentes: relación comercial y relación de acceso.
- **Recomendación del agente:** opción a). Evita que “Membresía” represente dos conceptos distintos y refleja que ninguna persona compra ni solicita incorporarse a una Empresa.
- **Respuesta:** No existe membresia, la suscripcion es por empresa, no hay suscripcion a usuarios.
- **Respondida por / fecha:** Parodi Lucas 02/11/2026.

## ACC-Q-015 — Alta inicial del cliente y administración posterior

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-05`, `B-14`, `B-16`
- **Afecta:** alta de Empresa, Administrador inicial, asignación del Plan y administración posterior del tenant
- **Pregunta:** ¿Quién realiza el alta inicial del cliente SaaS y quién administra después sus Empleados y Usuarios internos?
- **Interpretaciones posibles:**
  - a) El SuperAdministrador crea la Empresa y su Administrador inicial al contratar el servicio; desde entonces el Administrador gestiona los Empleados y Usuarios internos de su propia Empresa dentro de los límites del Plan contratado.
  - b) Cada persona contrata el servicio o solicita individualmente incorporarse a una Empresa.
- **Recomendación del agente:** opción a), porque representa un SaaS contratado y administrado por Empresa.
- **Respuesta:** El dueño de la Empresa contrata Tarefero. El dueño de la plataforma, mediante un SuperAdministrador, crea la Empresa y genera su Usuario Administrador inicial. A partir de ese momento, el Administrador de la Empresa crea y administra sus Empleados y Usuarios internos, sujeto al Plan contratado; no requiere intervención ordinaria del dueño de la plataforma.
- **Respondida por / fecha:** Ingeniero / 2026-10-30

## ACC-Q-016 — Administración y ciclo de vida de las cuentas

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** propuesta IA para completar el ciclo de vida de B-05 y los permisos no enumerados por el Ingeniero
- **Afecta:** `ACC-REQ-008`, `ACC-REQ-010`, `ACC-REQ-011`, `ACC-UC-008`, `ACC-UC-010`, `ACC-UC-011`, `ACC-ENT-001`
- **Pregunta:** ¿Aprobás cada una de estas propuestas: Administrador consulta/lista cuentas y soporte de su Empresa; administra canales, roles, suspensión y reactivación de cuentas; estados ACTIVA/SUSPENDIDA sin borrado físico; una sola cuenta por persona y Empresa? ¿Cada cuenta lleva un solo rol de Empresa o puede reunir varios?
- **Interpretaciones posibles:**
  - a) Aprobar las cuatro propuestas y asignar un único rol por cuenta.
  - b) Aprobar las cuatro propuestas y permitir varios roles por cuenta.
  - c) Indicar cuáles propuestas se aceptan o modificar permisos y estados por separado.
- **Recomendación del agente:** revisar las cuatro propuestas explícitamente; un rol por cuenta simplifica el inicio, pero la multiplicidad es una decisión funcional aún no tomada. Las atribuciones del SuperAdministrador se ejercen mediante soporte auditado.
- **Respuesta:** b.
- **Respondida por / fecha:** Parodi Lucas 02/11/2026.

## ACC-Q-017 — Alcance pendiente de plataforma, sesiones y dispositivos

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-02`, `B-05`, `ACC-Q-007`; propuesta IA para completar operaciones de sesión y dispositivo
- **Afecta:** `ACC-REQ-006`, `ACC-UC-006`, `ACC-ENT-003`, `ACC-ENT-004`, `ACC-ENT-005`
- **Pregunta:** ¿Cómo ingresa y recupera el acceso un SuperAdministrador, especialmente el último activo? ¿Aprobás agregar cierre de sesión propia, revocación administrativa de sesiones y habilitación/revocación de dispositivos? Falta definir quién puede realizar cada acción y los datos mínimos de la identidad de plataforma y del dispositivo.
- **Interpretaciones posibles:**
  - a) Especificar ahora estos circuitos y sus permisos antes de cerrar ACC.
  - b) Mantener el alcance actual como entrega parcial y tratar esos circuitos en una especificación posterior, sin considerarlos resueltos.
- **Recomendación del agente:** opción a); primero resolver la recuperación del último SuperAdministrador y las acciones permitidas por actor. Proponer un identificador propio para la intervención de soporte, pendiente de aprobación.
- **Respuesta:** Lo voy a manejar por .env, no te preocupes por esto.
- **Respondida por / fecha:** Parodi Lucas 02/11/2026.


**Alcance de la respuesta:** el Ingeniero se hace cargo del mecanismo operativo indicado mediante `.env`. No se deduce un circuito público de recuperación ni una aprobación de los permisos de gestión de dispositivos o cierre voluntario: esas ampliaciones quedan fuera de esta entrega funcional. La respuesta no especifica credenciales ni autoriza exponerlas en documentación.

## ACC-Q-018 — Detalles de credenciales y comprobación de titularidad

- **Estado:** Respondida
- **Bloqueante:** No
- **Origen:** `B-07`, `B-08`, `B-10`, `B-15`, `ACC-Q-001`, `ACC-Q-013`
- **Afecta:** `ACC-REQ-002`, `ACC-REQ-004`, `ACC-REQ-005`, `ACC-UC-002`, `ACC-UC-004`, `ACC-UC-005`, `ACC-ENT-001`, `ACC-ENT-005`
- **Pregunta:** Para cambiar la propia contraseña, ¿se exige la actual? Al cambiarla o restablecerla, ¿qué sesiones de esa cuenta deben revocarse? ¿Qué longitudes y normalización deben tener correo y contraseña, y qué longitud máxima admite el motivo de soporte?
- **Interpretaciones posibles:**
  - a) Exigir contraseña actual para cambio propio; restablecimiento administrativo sin contraseña anterior; definir expresamente qué sesiones se conservan o revocan.
  - b) Permitir cambio propio con la Sesión vigente y sin comprobar contraseña actual; definir expresamente el tratamiento de sesiones.
- **Recomendación del agente:** opción a). Las longitudes y la comparación de correos requieren propuesta y aprobación específicas antes de cerrar los atributos; no se fijan valores por suposición. Se mantiene la decisión de `ACC-Q-013`: no se fuerza el cambio al siguiente ingreso.
- **Respuesta:** Exigir contraseña actual para cambio propio; restablecimiento administrativo sin contraseña anterior; Las sesiones del usuario caducan todas
- **Respondida por / fecha:** Parodi Lucas / 2026-11-02 (respuesta incorporada al refinar).

**Alcance de la respuesta:** quedan definidos el control de contraseña actual y la caducidad de sesiones de la cuenta afectada. La respuesta no fija longitudes ni normalización; se conservan como detalle pendiente antes de planificar los atributos, sin inventar valores.

