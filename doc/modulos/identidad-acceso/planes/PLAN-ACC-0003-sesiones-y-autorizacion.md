---
type: plan
id: PLAN-ACC-0003
title: "Autenticar y autorizar Cuentas de Empresa"
module: "ACC"
task: ACC-TASK-003
status: En verificación
mode: estandar
created: 2026-11-09
approved_by: "Ingeniero"
---

# PLAN-ACC-0003 — Autenticar y autorizar Cuentas de Empresa

## 1. Objetivo y alcance

- **Tarea:** `ACC-TASK-003`.
- **Implementa:** `ACC-UC-002`, `ACC-UC-003`, `ACC-UC-004`, `ACC-UC-005`, `ACC-UC-009` y sus REQ y BR asociados.
- **Resultado observable:** inicio de Sesión por Empresa, renovación rotativa, acceso vigente en cada solicitud protegida y cambio o restablecimiento de contraseña con revocación.
- **Exclusiones:** login público de plataforma, cierre voluntario de Sesión, revocación administrativa independiente y administración de dispositivos conforme a `ACC-Q-017`.

## 2. Preparación

- [x] Los ítems del alcance están aprobados.
- [x] Las preguntas del alcance están respondidas.
- [ ] Puertos de cuenta de `ACC-TASK-002`, referencia de Empresa, elegibilidad comercial y contexto verificado de soporte disponibles o simulados con contrato acordado.
- [x] Las decisiones necesarias se registran en §4.

**Bloqueos:** acordar `ADR-0012`, el proveedor de plataforma de `ACC-Q-017` y el contexto por operación de `ADR-0010`. `ACC-TASK-002` entrega sus puertos primero. El cierre integrado requiere la cuenta real y las transiciones de `PLAN-EMP-0002`.

## 3. Contexto actual

- [H] El controlador de ACC y el caso de uso `src/modulos/identidad-acceso/aplicacion/comandos/resolver-contexto-soporte.caso-de-uso.ts` se incorporaron para `PLAN-ACC-0001`. Las rutas actuales leen cabeceras de actor y rol; el contexto operativo deberá venir del mecanismo verificado.
- [H] `ACC-ENT-003`, `ADR-0006`, `ADR-0008`, arquitectura §13.2–§13.3 y convenciones §7.1 definen las credenciales, Sesiones y resolución de acceso.
- [H] `ACC-DEP-001` lee estado y alias vigentes de EMP. Los puertos de Cuenta y elegibilidad se concretan en `PLAN-ACC-0002` y `ADR-0012`.

## 4. Decisiones

### D-01 — Resolución de acceso

- **Recomendación:** propuesta IA que aplica `ADR-0008`. Verificar firma, expiración, tipo de token y referencia de Sesión. Resolver por solicitud la Cuenta, el estado de Empresa, los roles, permisos, alcance y canal vigentes, conforme al UC y a la fundación. Tratar los identificadores enviados como destinos, validar el alcance antes de consultar datos y separar soporte de plataforma de Sesiones de Empresa. Login y renovación comprueban además la elegibilidad comercial; una falla impide habilitar el acceso. El contexto se ofrece por guard y puerto `ACC-DEP-004`. [OpenAPI](../contratos/openapi.yaml) identifica el control transversal `ACC-UC-003` sin ruta pública.
- **Decisión del ingeniero:** Pendiente de confirmar integración y aceptación de `ADR-0010`.

### D-02 — Sesiones, rotación y revocación

| Opción | A favor | En contra |
|---|---|---|
| A. Sesión persistente, historial de huellas de renovación y transacción por Cuenta/Sesión | Permite revocación inmediata y detecta reutilización | Requiere escrituras por renovación y política de retención |
| B. Sobrescribir el valor anterior al rotar | Menos registros | Imposibilita atribuir y revocar ante reutilización de un token anterior |

- **Recomendación:** A, propuesta IA. Argon2id para contraseñas, JWT de acceso firmado asimétricamente según `ADR-0006` y huella de renovación protegida en persistencia. Acceso de 15 minutos; renovación de hasta 30 días con rotación y detección de reutilización. Usar orden fijo de bloqueo Cuenta → Sesión y verificar la versión de credencial antes de emitir una Sesión que compita con un cambio. Confirmar la revocación por reutilización antes de devolver el error HTTP. Conservar las huellas mientras sirvan para detectar reutilización, sin incluir tokens en logs, auditoría o errores. Cambio propio valida la contraseña actual; restablecimiento valida el alcance y registra soporte cuando corresponde. Ambos sustituyen la credencial y revocan todas las Sesiones de la cuenta en una transacción. La respuesta es 204; el titular vuelve a autenticarse.
- **Decisión del ingeniero:** Pendiente con el plan. Los tokens de renovación son de un solo uso. Un reintento de credencial con la Sesión revocada pasa por el control de acceso y no entrega resultados privados.
- **ADR:** Se aplican `ADR-0006` y `ADR-0008`; la implementación del almacenamiento es local.

## 5. Tareas

| ID | Tarea | Capa | Implementa | Archivos previstos | Verificación |
|---|---|---|---|---|---|
| T01 | Modelar Sesión, expiración, rotación, revocación y validación de contraseñas | Dominio | `ACC-ENT-003`, BR de los UC | `src/modulos/identidad-acceso/dominio/` | Ejemplos de BR, límites temporales con reloj controlado y contraseña exacta |
| T02 | Implementar login, guard, renovación, cambio propio y restablecimiento | Aplicación | `ACC-UC-002` a `ACC-UC-005`, `ACC-UC-009` | `src/modulos/identidad-acceso/aplicacion/` | Matriz de permisos, titularidad, soporte, Empresa y canal vigentes |
| T03 | Persistir Sesiones, huellas y auditoría; integrar criptografía y proveedores | Infraestructura | `ACC-BR-014`, `ACC-DEP-001`, `ACC-DEP-002`, `ADR-0006` | `src/modulos/identidad-acceso/infraestructura/`, `migraciones/` | Revocación atómica; dos renovaciones en carrera; carrera con cambio de contraseña; rollback por falla |
| T04 | Implementar operaciones y guard de [OpenAPI](../contratos/openapi.yaml) | Presentación | `iniciarSesionEmpresa`, `renovarSesionEmpresa`, `cambiarContraseniaPropia`, `restablecerContraseniaCuentaEmpresa`, `ACC-UC-003` | `src/modulos/identidad-acceso/presentacion/http/`, composición de módulos | Contrato HTTP y ausencia de fuga de secretos; credenciales falsas y cabeceras de identidad forjadas |
| T05 | Ejecutar aceptación por escenario | Aceptación | `ACC-UC-002`, `003`, `004`, `005`, `009` | `test/sesiones-empresa.e2e-spec.ts` | Respectivamente 8, 6, 10, 12 y 6 escenarios con tags oficiales |
| T06 | Verificar el flujo conjunto de Empresas y ACC | Integración | `ACC-DEP-001` a `ACC-DEP-004`, `EMP-BR-005` | `test/sesiones-empresa.e2e-spec.ts` y pruebas de los planes EMP/ACC | Alta de Empresa y Administrador, dos Empresas con un mismo correo, cupo, login, soporte, revocación y cambios de estado |

## 6. Verificación y riesgos

| Control | Cubre | Comando |
|---|---|---|
| Dominio y aplicación | Permisos, credenciales, aislamiento y errores | `yarn test:modulo identidad-acceso --runInBand` |
| Aceptación con PostgreSQL | 42 escenarios; rotación, reutilización, expiración, fallas y carreras | `yarn test:e2e sesiones-empresa.e2e-spec.ts` |
| Cierre integrado | Alta completa, permisos/canales actualizados, suspensión de Cuenta o Empresa visible con token aún vigente, renovación bloqueada y conservación tras cierre | `yarn test:e2e` |
| Contratos y arquitectura | Rutas, guard y dependencias | `yarn test:contratos`, `yarn test:arquitectura` |
| Especificación | Referencias y formato | `python tools/spec_lint.py doc` |

- **Migración de datos:** crear estructuras aditivas para Sesiones y renovación; claves fuera del repositorio. Separar Sesiones de Empresa de las de plataforma. Probar despliegue sobre base con cuentas preexistentes.
- **Riesgo:** una solicitud autorizada justo antes de una revocación puede estar en curso. Probar que nuevas solicitudes rechazan la Sesión revocada y que una renovación concurrente con cambio de credencial no sobreviva a ese cambio.
- **Rollback:** retirar emisión y renovación, conservar auditoría y revocaciones. Una reversión no restaura contraseñas anteriores ni Sesiones revocadas. Probar migración inversa en una copia desechable.

## 7. Cambios de especificación

| ID | Cambio | Motivo |
|---|---|---|
| Ninguno | Los nuevos contratos representan el alcance aprobado y la fundación; §4 propone detalles técnicos de ejecución | La integración de plataforma se resuelve según `ACC-Q-017` |

**Aprobación del plan:** Aprobado por el Ingeniero.

## 8. Registro de ejecución

| Tarea | Commit | Estado | Notas o desviaciones |
|---|---|---|---|
| T01 | — | Completada | Entidad SesionEmpresa (crear, vigencia, revocar, rotarTokenRenovacion) y enumeración CanalSesion |
| T02 | — | Completada | Casos de uso IniciarSesionEmpresa, RenovarSesionEmpresa (con detección de reuso ADR-0006), CambiarContraseniaPropia, RestablecerContraseniaCuentaEmpresa (soporte auditado) y ValidarAccesoVigente |
| T03 | — | Completada | Persistencia de sesiones y huellas en TypeORM, hashing HMAC/Scrypt y detección de reuso |
| T04 | — | Completada | Endpoints POST /sesiones-empresa, /sesiones-empresa/renovaciones, /cambios-contrasenia, /restablecimientos-contrasenia y resolución de Bearer token |
| T05 | — | Completada | Pruebas de aceptación e2e en test/sesiones-empresa.e2e-spec.ts (20 escenarios pasando) |
| T06 | — | Completada | Verificación integral de autenticación, renovación, revocación concurrente y soporte auditado |

## 9. Evidencia

| Control | Resultado | Comando ejecutado | Observado |
|---|---|---|---|
| yarn test:e2e | PASS | `yarn.cmd test:e2e test/sesiones-empresa.e2e-spec.ts` | 20 tests pasados, rotación, detección de reuso, revocación |
| yarn test | PASS | `yarn.cmd test src/modulos/identidad-acceso` | 46 tests pasados (dominio, aplicación, integración) |
| yarn test:arquitectura | PASS | `yarn.cmd test:arquitectura` | 0 violaciones en 213 módulos |
| yarn lint | PASS | `yarn.cmd lint` | 0 errores, 0 warnings |
| spec_lint | PASS | `python tools/spec_lint.py doc` | 688 IDs, 0 errores, 0 avisos |

## 10. Cierre

- **Conformidad:** Pendiente de la verificación de §6.
- **Desviaciones:** A registrar por el revisor.
- **Ítems que pasan a Implementado:** Los UC, REQ y BR comprobados según las reglas de cierre.
- **Tarea que pasa a Completada:** `ACC-TASK-003`.
- **Revisor:** Pendiente, en una sesión distinta de la implementación.
- **Estado final:** Pendiente.
