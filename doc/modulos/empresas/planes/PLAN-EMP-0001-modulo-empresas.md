---
type: plan
id: PLAN-EMP-0001
title: "Módulo Empresas completo"
module: "EMP"
task:
  - EMP-TASK-002
  - EMP-TASK-003
status: En ejecución
mode: estandar
created: 2026-11-10
approved_by: "Ingeniero"
---

# PLAN-EMP-0001 — Módulo Empresas completo

<!-- Un plan es el expediente completo de una entrega: antes de aprobarse dice qué y cómo; después registra qué pasó.
Secciones 1–7: las escribe el planificador. 8: el implementador. 9–10: el revisor.
No copia reglas ni escenarios: referencia IDs y tags. -->

## 1. Objetivo y alcance

- **Tarea:** `EMP-TASK-002`, `EMP-TASK-003`
- **Implementa:** `EMP-UC-001`, `EMP-UC-002`, `EMP-UC-003`, `EMP-UC-004`, `EMP-UC-005`, `EMP-UC-006`, `EMP-UC-007`, `EMP-UC-008`
- **Resultado observable:** la plataforma permite al SuperAdministrador registrar Empresas con alias único inmutable y configuración inicial (`AR`, `America/Argentina/Buenos_Aires`, `ARS`), listarlas con paginación y filtros en base de datos, suspenderlas, reactivarlas y cerrarlas; permite al SuperAdministrador y al Administrador (en su propia Empresa) consultar y modificar sus datos y configuración general respetando el ciclo de vida, la concurrencia optimista (`If-Match`) y el aislamiento multiempresa.
- **No incluye:** autenticación, gestión de usuarios, contraseñas o sesiones (módulo `ACC`); cobros, suscripciones comerciales o planes SaaS (módulo `SUS`); delimitación de chacras o lotes (módulo `TER`); configuraciones económicas (`ECO`) o laborales (`LAB`).

## 2. Preparación

<!-- Si alguna casilla no se cumple, el plan queda Bloqueado y se informa al ingeniero. -->

- [x] Todos los ítems del alcance están `Aprobado`.
- [x] Ninguna pregunta bloqueante abierta los afecta (`EMP-Q-001` a `EMP-Q-013` respondidas).
- [x] Las dependencias con otros módulos (`EMP-DEP-001`, `EMP-DEP-002`) están acordadas mediante contratos y puertos desacoplados.
- [x] Las decisiones necesarias están documentadas en §4.

**Bloqueos:** Ninguno.

## 3. Contexto actual

<!-- Hechos con fuente. [H] hecho, [S] supuesto a confirmar. -->

- [H] El proyecto NestJS está inicializado con Yarn y TypeScript en modo estricto — `package.json`, `tsconfig.json`
- [H] No existen entidades ni endpoints previos para el módulo Empresas — `src/`
- [H] El contrato OpenAPI 3.1 fue creado y validado sin errores por Spectral — `doc/modulos/empresas/contratos/openapi.yaml`
- [H] Se cuenta con archivo de semántica adicional de contratos — `doc/modulos/empresas/contratos/README.md`
- [S] La base de datos PostgreSQL estará disponible para la ejecución de pruebas de integración con persistencia real.

## 4. Decisiones

### D-01 — Simulación de dependencia `EMP-DEP-002` (Suscripciones)

| Opción | A favor | En contra |
|---|---|---|
| A: Puerto `VerificadorAsignacionComercial` con implementación provisional desacoplada | Permite implementar y verificar `EMP-UC-001` y `EMP-BR-009` de inmediato sin esperar a `SUS` ni violar la arquitectura. | Requiere conectar la implementación real cuando se implemente `SUS`. |
| B: Bloquear el módulo Empresas hasta que `SUS` esté implementado | No requiere adaptador provisional. | Bloquea el desarrollo del sistema ya que `SUS` es un módulo futuro. |

- **Recomendación:** Opción A, conforme a la respuesta de `EMP-Q-008`.
- **Decisión del ingeniero:** Aprobada (Opción A).
- **ADR:** No: decisión local de planificación.

### D-02 — Contexto de autorización `EMP-DEP-001` (`ACC`)

| Opción | A favor | En contra |
|---|---|---|
| A: Consumir `ContextoSolicitud` en Aplicación y proveer guardia/estrategia desacoplada en Presentación | Permite probar autorización tenant (`EMP-BR-007`) y roles (`EMP-Q-001`) sin acoplarse a tokens JWT ni tablas de `ACC`. | Deberá integrarse con el guardia definitivo de `ACC` cuando este exista. |
| B: Omitir la validación de permisos hasta implementar `ACC` | Menos código inicial en Presentación. | Impide verificar los escenarios de seguridad `@EMP-UC-001 @AC-05`, `@EMP-UC-002 @AC-02`, etc. |

- **Recomendación:** Opción A.
- **Decisión del ingeniero:** Aprobada (Opción A).
- **ADR:** No: decisión local de planificación.

### D-03 — Raíz de agregado en Dominio

| Opción | A favor | En contra |
|---|---|---|
| A: Agregado `Empresa` como raíz, conteniendo `ConfiguracionGeneralEmpresa` | Garantiza consistencia transaccional y reglas de ciclo de vida (`EMP-BR-004`, `EMP-BR-006`, `EMP-BR-014`) en una sola frontera. | Requiere que la persistencia mapee la entidad hija dentro de la misma transacción. |
| B: Dos agregados separados | Permite persistir la configuración de forma aislada. | Riesgo de inconsistencias transaccionales al crear o cerrar la Empresa. |

- **Recomendación:** Opción A.
- **Decisión del ingeniero:** Aprobada (Opción A).
- **ADR:** No: decisión local de planificación.

## 5. Tareas

<!-- Orden hexagonal: dominio → aplicación → infraestructura → API → aceptación. -->

| ID | Tarea | Capa | Implementa | Archivos previstos | Verificación |
|---|---|---|---|---|---|
| T01 | Implementar objetos de valor, enumeraciones y errores de Dominio | Dominio | `EMP-BR-001`, `EMP-BR-002`, `EMP-BR-003`, `EMP-BR-010`, `EMP-BR-011`, `EMP-BR-012` | `src/modulos/empresas/dominio/objetos-valor/`, `src/modulos/empresas/dominio/enumeraciones/`, `src/modulos/empresas/dominio/errores/` | Pruebas unitarias de formato, límites y validación de atributos |
| T02 | Implementar entidad `ConfiguracionGeneralEmpresa` y agregado raíz `Empresa` con reglas de estado y concurrencia | Dominio | `EMP-ENT-001`, `EMP-ENT-002`, `EMP-BR-004`, `EMP-BR-005`, `EMP-BR-006`, `EMP-BR-008`, `EMP-BR-013`, `EMP-BR-014` | `src/modulos/empresas/dominio/agregados/empresa.ts`, `src/modulos/empresas/dominio/entidades/configuracion-general-empresa.ts` | Pruebas unitarias de transiciones de estado, inmutabilidad de alias y modificaciones permitidas |
| T03 | Definir puertos de Aplicación (`RepositorioEmpresas`, `VerificadorAsignacionComercial`) y modelos de lectura | Aplicación | `EMP-DEP-001`, `EMP-DEP-002`, `EMP-DEP-003` | `src/modulos/empresas/aplicacion/puertos/salida/`, `src/modulos/empresas/aplicacion/modelos-lectura/` | Tipado y compilación TypeScript estricta |
| T04 | Implementar casos de uso de gestión de datos (`RegistrarEmpresa`, `ConsultarEmpresa`, `ListarEmpresas`, `ModificarEmpresa`, `ModificarConfiguracionGeneral`) | Aplicación | `EMP-UC-001`, `EMP-UC-002`, `EMP-UC-003`, `EMP-UC-004`, `EMP-UC-008`, `EMP-BR-007` | `src/modulos/empresas/aplicacion/comandos/`, `src/modulos/empresas/aplicacion/consultas/` | Pruebas unitarias de casos de uso con dobles de prueba y verificación de permisos por rol |
| T05 | Implementar casos de uso de ciclo de vida (`SuspenderEmpresa`, `ReactivarEmpresa`, `CerrarEmpresa`) | Aplicación | `EMP-UC-005`, `EMP-UC-006`, `EMP-UC-007` | `src/modulos/empresas/aplicacion/comandos/` | Pruebas unitarias de cambios de estado y control de versión previa |
| T06 | Implementar entidades TypeORM, mapeadores y migración inicial PostgreSQL | Infraestructura | `EMP-ENT-001`, `EMP-ENT-002`, índices y unicidad | `src/modulos/empresas/infraestructura/persistencia/typeorm/entidades/`, `src/modulos/empresas/infraestructura/persistencia/typeorm/mapeadores/`, `migraciones/empresas/` | Pruebas de integración del mapeador round-trip y ejecución de migración |
| T07 | Implementar `RepositorioEmpresasTypeOrm` con paginación en base de datos y adaptador de asignación comercial | Infraestructura | `EMP-UC-003`, `EMP-DEP-002`, `convenciones.md` §3.2 | `src/modulos/empresas/infraestructura/persistencia/typeorm/repositorios/`, `src/modulos/empresas/infraestructura/adaptadores/` | Pruebas de integración de persistencia con paginación, filtros y concurrencia optimista |
| T08 | Implementar controladores NestJS, DTOs con `class-validator`, filtro RFC 9457 y cabeceras ETag / If-Match | Presentación | Contrato OpenAPI (`operationId`), RFC 9457 | `src/modulos/empresas/presentacion/http/controladores/`, `src/modulos/empresas/presentacion/http/solicitudes/`, `src/modulos/empresas/presentacion/http/respuestas/`, `src/modulos/empresas/empresas.module.ts` | Pruebas HTTP de integración con Supertest sobre los 8 endpoints |
| T09 | Implementar pruebas de aceptación Gherkin y validación de contratos | Aceptación / Calidad | `@EMP-UC-001` a `@EMP-UC-008` (32 escenarios) | `src/modulos/empresas/pruebas/aceptacion/` | Verificación completa de los 32 escenarios Gherkin y Spectral lint en CI |

## 6. Verificación y riesgos

| Control | Cubre | Comando |
|---|---|---|
| Unitarias Dominio | `EMP-BR-001` a `EMP-BR-014` | `yarn test src/modulos/empresas/pruebas/dominio/` |
| Unitarias Aplicación | `EMP-UC-001` a `EMP-UC-008` | `yarn test src/modulos/empresas/pruebas/aplicacion/` |
| Integración Persistencia | TypeORM, repositorios, mapeadores | `yarn test src/modulos/empresas/pruebas/integracion/` |
| Aceptación | `@EMP-UC-001` a `@EMP-UC-008` (32 escenarios) | `yarn test src/modulos/empresas/pruebas/aceptacion/` |
| Contrato HTTP | `openapi.yaml` | `yarn spectral lint doc/modulos/empresas/contratos/openapi.yaml` |
| Calidad de código | Convenciones globales y formato | `yarn lint && yarn build` |

- **Migración de datos:** No aplica migración de datos previos (creación inicial del módulo). Se crea migración DDL inicial para las tablas `empresas` y `configuracion_general_empresas`.
- **Rollback:** En caso de falla, revertir el commit de la entrega y ejecutar la operación down de la migración inicial.

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
| T01 | `PLAN-EMP-0001 T01` | Completada | Objetos de valor, enumeraciones y errores implementados con 19 pruebas unitarias pasando. |
| T02 | | Pendiente | |
| T03 | | Pendiente | |
| T04 | | Pendiente | |
| T05 | | Pendiente | |
| T06 | | Pendiente | |
| T07 | | Pendiente | |
| T08 | | Pendiente | |
| T09 | | Pendiente | |

## 9. Evidencia

| Control | Resultado | Comando ejecutado | Observado |
|---|---|---|---|
| Spectral Lint | PASS | `yarn spectral lint doc/modulos/empresas/contratos/openapi.yaml` | 0 errors |

## 10. Cierre

- **Conformidad:** Pendiente de ejecución en Fase 3 y verificación en Fase 4.
- **Desviaciones:** Ninguna.
- **Ítems que pasan a Implementado:** `EMP-REQ-001` a `EMP-REQ-008`, `EMP-UC-001` a `EMP-UC-008`, `EMP-BR-001` a `EMP-BR-014`, `EMP-ENT-001`, `EMP-ENT-002`.
- **Tarea que pasa a Completada:** `EMP-TASK-002`, `EMP-TASK-003`
- **Revisor:** Pendiente de Fase 4.
- **Estado final:** Borrador
