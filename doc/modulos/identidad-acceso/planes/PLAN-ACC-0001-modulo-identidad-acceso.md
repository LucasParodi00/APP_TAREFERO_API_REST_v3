---
type: plan
id: PLAN-ACC-0001
title: "Módulo Identidad y acceso completo"
module: "ACC"
task:
  - ACC-TASK-002
  - ACC-TASK-003
  - ACC-TASK-004
status: Aprobado
mode: estandar
created: 2026-11-10
approved_by: "Ingeniero"
---

# PLAN-ACC-0001 — Módulo Identidad y acceso completo

<!-- Un plan es el expediente completo de una entrega: antes de aprobarse dice qué y cómo; después registra qué pasó.
Secciones 1–7: las escribe el planificador. 8: el implementador. 9–10: el revisor.
No copia reglas ni escenarios: referencia IDs y tags. -->

## 1. Objetivo y alcance

- **Tarea:** `ACC-TASK-002`, `ACC-TASK-003`, `ACC-TASK-004`
- **Implementa:** `ACC-UC-001`, `ACC-UC-002`, `ACC-UC-003`, `ACC-UC-004`, `ACC-UC-005`, `ACC-UC-006`, `ACC-UC-007`, `ACC-UC-008`, `ACC-UC-009`, `ACC-UC-010`, `ACC-UC-011`
- **Resultado observable:** la plataforma permite habilitar Cuentas de Empresa con credenciales seguras (Argon2id) y roles dentro de una Empresa; los usuarios pueden iniciar sesión identificando la empresa mediante su alias y credenciales, obteniendo tokens JWT (15 min) y de renovación rotativo (30 días) respaldados por una Sesión persistente; se permite renovar sesión con detección de reutilización, cambiar y restablecer contraseñas, administrar estados de cuenta (`ACTIVA`/`SUSPENDIDA`), e inicializar y auditar intervenciones de soporte técnico por el SuperAdministrador.
- **No incluye:** creación o ciclo de vida de la Empresa cliente (módulo `EMP`); límites y facturación SaaS (módulo `SUS`); datos laborales, DNI o contratos de empleados (módulo `PER`); gestión detallada de hardware de dispositivos móviles.

## 2. Preparación

<!-- Si alguna casilla no se cumple, el plan queda Bloqueado y se informa al ingeniero. -->

- [x] Todos los ítems del alcance están `Aprobado`.
- [x] Ninguna pregunta bloqueante abierta los afecta (`ACC-Q-001` a `ACC-Q-018` resueltas).
- [x] Las dependencias externas (`ACC-DEP-001` a `ACC-DEP-004`) están acordadas mediante contratos y puertos desacoplados.
- [x] Las decisiones técnicas necesarias están documentadas en §4.

**Bloqueos:** Ninguno.

## 3. Contexto actual

<!-- Hechos con fuente. [H] hecho, [S] supuesto a confirmar. -->

- [H] El proyecto cuenta con la dependencia `argon2: ^0.45.2` instalada en `package.json`.
- [H] El módulo `EMP` dispone de especificación, plan aprobado y contrato OpenAPI para proveer alias y estado de empresa (`ACC-DEP-001`).
- [H] El contrato OpenAPI 3.1 de Identidad y Acceso fue creado y validado sin errores por Spectral — `doc/modulos/identidad-acceso/contratos/openapi.yaml`.
- [H] Los roles canónicos están definidos en `doc/glosario.md` y `ContextoSolicitud` en `doc/arquitectura.md` §13.3.
- [S] La base de datos PostgreSQL estará disponible para la persistencia de cuentas, sesiones e intervenciones.

## 4. Decisiones

### D-01 — Criptografía, Tokens y Detección de Reutilización

| Opción | A favor | En contra |
|---|---|---|
| A: Hashing Argon2id, Access Token JWT (15 min) y Refresh Token rotativo con familia de revocación en BD | Cumple estrictamente `ADR-0006`, protege contra robo de tokens y limita la exposición. | Requiere persistir y rotar el estado de renovación en cada refresh. |
| B: JWT de larga duración sin rotación | Menor complejidad de persistencia. | Viola `ADR-0006` y `convenciones.md` §7.1; riesgo de seguridad. |

- **Recomendación:** Opción A.
- **Decisión del ingeniero:** Aprobada (Opción A).
- **ADR:** `ADR-0006`.

### D-02 — Dependencia provisional `ACC-DEP-002` (Suscripciones)

| Opción | A favor | En contra |
|---|---|---|
| A: Puerto `VerificadorCuposAcceso` con adaptador configurable provisional | Permite verificar `ACC-BR-006` y `ACC-UC-001` sin esperar a que `SUS` esté implementado. | Requerirá conectar el módulo real cuando `SUS` se desarrolle. |
| B: Bloquear el módulo hasta desarrollar `SUS` | Ninguno. | Bloquea el desarrollo central de la plataforma. |

- **Recomendación:** Opción A.
- **Decisión del ingeniero:** Aprobada (Opción A).
- **ADR:** No: decisión local de planificación.

### D-03 — Dependencia provisional `ACC-DEP-003` (Personal)

| Opción | A favor | En contra |
|---|---|---|
| A: Puerto `VerificadorPersonaEmpresa` con adaptador provisional | Permite vincular `personaId` a la Empresa (`ACC-BR-015`) sin depender del esquema de `PER`. | Reemplazar por cliente de `PER` en el futuro. |
| B: Bloquear hasta que `PER` esté implementado | Ninguno. | Bloquea la autenticación inicial. |

- **Recomendación:** Opción A.
- **Decisión del ingeniero:** Aprobada (Opción A).
- **ADR:** No: decisión local de planificación.

### D-04 — Consumo de `EMP` (`ACC-DEP-001`)

| Opción | A favor | En contra |
|---|---|---|
| A: Puerto `ProveedorEmpresa` consumiendo los contratos públicos de `EMP` | Desacoplamiento total; respeta la regla de monolito modular sin tocar tablas ajenas. | Requiere definir la interfaz de puerto en Aplicación. |
| B: Leer directamente las tablas de `empresas` desde `ACC` | Menos código de adaptador. | Viola la arquitectura hexagonal y la regla de un solo dueño de datos. |

- **Recomendación:** Opción A.
- **Decisión del ingeniero:** Aprobada (Opción A).
- **ADR:** `ADR-0002`.

## 5. Tareas

<!-- Orden hexagonal: dominio → aplicación → infraestructura → API → aceptación. -->

| ID | Tarea | Capa | Implementa | Archivos previstos | Verificación |
|---|---|---|---|---|---|
| T01 | Implementar objetos de valor (`CorreoAcceso`, `Contrasenia`, `MotivoSoporte`), enumeraciones (`EstadoCuenta`, `CanalAcceso`, `RolCodigo`) y errores tipados | Dominio | `ACC-BR-003`, `ACC-BR-018`, `ACC-BR-019`, `ACC-BR-020` | `src/modulos/identidad-acceso/dominio/objetos-valor/`, `src/modulos/identidad-acceso/dominio/enumeraciones/`, `src/modulos/identidad-acceso/dominio/errores/` | Pruebas unitarias de límites, normalización y formato de contraseñas y correos |
| T02 | Implementar entidades `CuentaEmpresa`, `SesionEmpresa`, `UsuarioPlataforma`, `IntervencionSoporte` con sus invariantes y transiciones | Dominio | `ACC-ENT-001` a `ACC-ENT-005`, `ACC-BR-001`, `ACC-BR-005`, `ACC-BR-007`, `ACC-BR-008`, `ACC-BR-011`, `ACC-BR-016` | `src/modulos/identidad-acceso/dominio/entidades/` | Pruebas unitarias de transiciones de estado de cuenta y sesión |
| T03 | Definir puertos de salida (`RepositorioCuentasEmpresa`, `RepositorioSesiones`, `RepositorioIntervencionesSoporte`, `GeneradorTokensJwt`, `ServicioHashingContrasenias`, `VerificadorCuposAcceso`, `VerificadorPersonaEmpresa`, `ProveedorEmpresa`) | Aplicación | `ACC-DEP-001` a `ACC-DEP-004` | `src/modulos/identidad-acceso/aplicacion/puertos/salida/` | Compilación TypeScript estricta |
| T04 | Implementar casos de uso de autenticación y sesiones (`IniciarSesion`, `ConsultarAutorizacionVigente`, `RenovarSesion`, `CambiarContrasenia`) | Aplicación | `ACC-UC-002`, `ACC-UC-003`, `ACC-UC-004`, `ACC-UC-009`, `ACC-BR-012`, `ACC-BR-013`, `ACC-BR-014` | `src/modulos/identidad-acceso/aplicacion/comandos/`, `src/modulos/identidad-acceso/aplicacion/consultas/` | Pruebas unitarias con dobles de sesión, rotación de tokens y revocación |
| T05 | Implementar casos de uso de gestión de cuentas (`HabilitarCuentaEmpresa`, `ConsultarCuentasEmpresa`, `RestablecerContrasenia`, `CambiarEstadoCuenta`, `ActualizarRolesCanalesCuenta`) | Aplicación | `ACC-UC-001`, `ACC-UC-005`, `ACC-UC-008`, `ACC-UC-010`, `ACC-BR-002`, `ACC-BR-004`, `ACC-BR-006`, `ACC-BR-010`, `ACC-BR-015` | `src/modulos/identidad-acceso/aplicacion/comandos/`, `src/modulos/identidad-acceso/aplicacion/consultas/` | Pruebas unitarias de autorización tenant y verificación de cupos comerciales |
| T06 | Implementar casos de uso de plataforma y soporte (`InicializarSuperAdministrador`, `RegistrarIntervencionSoporte`, `ConsultarIntervencionesSoporte`) | Aplicación | `ACC-UC-006`, `ACC-UC-007`, `ACC-UC-011`, `ACC-BR-008`, `ACC-BR-009`, `ACC-BR-011` | `src/modulos/identidad-acceso/aplicacion/comandos/`, `src/modulos/identidad-acceso/aplicacion/consultas/` | Pruebas unitarias de auditoría obligatoria de soporte |
| T07 | Implementar adaptadores de seguridad: servicio Argon2id y generador/verificador JWT asimétrico con ciclo rotativo | Infraestructura | `ADR-0006`, `convenciones.md` §7.1 | `src/modulos/identidad-acceso/infraestructura/seguridad/` | Pruebas unitarias de hashing, verificación, expiración y firma de tokens |
| T08 | Implementar entidades TypeORM, mapeadores y migración PostgreSQL (`cuentas_empresa`, `sesiones_empresa`, `usuarios_plataforma`, `intervenciones_soporte`) | Infraestructura | `ACC-ENT-001` a `ACC-ENT-005`, índices de unicidad | `src/modulos/identidad-acceso/infraestructura/persistencia/typeorm/`, `migraciones/identidad-acceso/` | Pruebas de integración de mapeo round-trip y ejecución de migración |
| T09 | Implementar repositorios TypeORM con filtros de Empresa y adaptadores provisionales de cupos y personas | Infraestructura | `ACC-BR-002`, `convenciones.md` §3.2 | `src/modulos/identidad-acceso/infraestructura/persistencia/typeorm/repositorios/`, `src/modulos/identidad-acceso/infraestructura/adaptadores/` | Pruebas de persistencia real de sesiones, revocación y consultas paginadas |
| T10 | Implementar controladores HTTP, DTOs con `class-validator`, guardias de seguridad (`GuardiaAutenticacionJwt`, `GuardiaRoles`), filtro RFC 9457 y módulo NestJS | Presentación | Contrato OpenAPI (`operationId`), RFC 9457 | `src/modulos/identidad-acceso/presentacion/`, `src/modulos/identidad-acceso/identidad-acceso.module.ts` | Pruebas de endpoints HTTP con Supertest, validación de cabeceras ETag / If-Match |
| T11 | Implementar pruebas de aceptación Gherkin y validación de contratos | Aceptación / Calidad | `@ACC-UC-001` a `@ACC-UC-011` | `src/modulos/identidad-acceso/pruebas/aceptacion/` | Verificación de todos los escenarios Gherkin del módulo y Spectral lint |

## 6. Verificación y riesgos

| Control | Cubre | Comando |
|---|---|---|
| Unitarias Dominio | `ACC-BR-001` a `ACC-BR-020` | `yarn test src/modulos/identidad-acceso/pruebas/dominio/` |
| Unitarias Aplicación | `ACC-UC-001` a `ACC-UC-011` | `yarn test src/modulos/identidad-acceso/pruebas/aplicacion/` |
| Seguridad e Infraestructura | Argon2id, JWT, Persistencia TypeORM | `yarn test src/modulos/identidad-acceso/pruebas/infraestructura/` |
| Aceptación | `@ACC-UC-001` a `@ACC-UC-011` | `yarn test src/modulos/identidad-acceso/pruebas/aceptacion/` |
| Contrato HTTP | `openapi.yaml` | `yarn spectral lint doc/modulos/identidad-acceso/contratos/openapi.yaml` |
| Calidad y arquitectura | Convenciones y tipos estrictos | `yarn lint && yarn build` |

- **Migración de datos:** No aplica (creación inicial del módulo). Se genera migración inicial DDL en `migraciones/identidad-acceso/`.
- **Rollback:** Revertir commits asociados y ejecutar rollback de la migración de esquema.

## 7. Cambios de especificación

<!-- Solo si el plan necesita cambiar algo ya Aprobado o Implementado. Requiere aprobación del ingeniero. -->

| ID | Cambio | Motivo |
|---|---|---|
| Ninguno | | |

**Aprobación del plan:** Aprobado por el Ingeniero el 2026-11-10. Listo para ejecución en Fase 3.

---

## 8. Registro de ejecución

| Tarea | Commit | Estado | Notas o desviaciones |
|---|---|---|---|
| T01 | | Pendiente | |
| T02 | | Pendiente | |
| T03 | | Pendiente | |
| T04 | | Pendiente | |
| T05 | | Pendiente | |
| T06 | | Pendiente | |
| T07 | | Pendiente | |
| T08 | | Pendiente | |
| T09 | | Pendiente | |
| T10 | | Pendiente | |
| T11 | | Pendiente | |

## 9. Evidencia

| Control | Resultado | Comando ejecutado | Observado |
|---|---|---|---|
| Spectral Lint | PASS | `yarn spectral lint doc/modulos/identidad-acceso/contratos/openapi.yaml` | 0 errors |

## 10. Cierre

- **Conformidad:** Pendiente de ejecución en Fase 3 y verificación en Fase 4.
- **Desviaciones:** Ninguna.
- **Ítems que pasan a Implementado:** `ACC-REQ-001` a `ACC-REQ-011`, `ACC-UC-001` a `ACC-UC-011`, `ACC-BR-001` a `ACC-BR-020`, `ACC-ENT-001` a `ACC-ENT-005`.
- **Tarea que pasa a Completada:** `ACC-TASK-002`, `ACC-TASK-003`, `ACC-TASK-004`
- **Revisor:** Pendiente de Fase 4.
- **Estado final:** Borrador
