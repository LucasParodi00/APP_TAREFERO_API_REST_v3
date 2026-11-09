---
type: plan
id: PLAN-ACC-0001
title: "Administrar acceso de plataforma y soporte"
module: "ACC"
task: ACC-TASK-004
status: En verificación
mode: estandar
created: 2026-11-09
approved_by: "Ingeniero"
---

# PLAN-ACC-0001 — Administrar acceso de plataforma y soporte

## 1. Objetivo y alcance

- **Tarea y épica:** `ACC-TASK-004`, `EPIC-002`.
- **Implementa:** `ACC-UC-006`, `ACC-UC-007`, `ACC-UC-011` dentro de `ACC-Q-017`. Ver el escenario pendiente de resolución en §7.
- **Resultado observable:** inicialización controlada de la primera identidad de plataforma, creación posterior por un actor autorizado, contexto de soporte auditable para una operación y consulta paginada del historial autorizado de Empresa.
- **Integración con Empresas:** proveer a EMP el contexto de plataforma previsto por `EMP-DEP-001` y consumir su puerto de lectura previsto en `EMP-DEP-003`. La puesta en servicio necesita el mecanismo operativo de acceso y la integración real.
- **Fuera de alcance:** alta y autenticación de Cuentas de Empresa, credenciales y recuperación de plataforma, revocación voluntaria de sesiones, dispositivos, desactivación de SuperAdministradores y cambios en operaciones de otros módulos.

## 2. Preparación

- [x] Los casos, reglas, dependencias y entidades seleccionados figuran en estado `Aprobado`.
- [x] Las preguntas del alcance están respondidas. `ACC-Q-017` reserva el mecanismo operativo al Ingeniero.
- [x] Aclarar el escenario `@ACC-UC-006 @AC-04` según §7.
- [x] Acordar el contrato de entrada con el mecanismo de acceso y Sesión de plataforma. Para la consulta como Administrador, disponer del contexto de Empresa real o acordar el doble de prueba con referencia a `ACC-TASK-003`.
- [x] Acordar los contratos de `ACC-DEP-001` y `ACC-DEP-004` con proveedores reales o dobles limitados a pruebas. Resolver `ADR-0010`.
- [x] Preparar la base técnica de persistencia, auditoría, migraciones y controles de calidad descrita en `PLAN-EMP-0001` §2.

**Estado para revisión:** Plan aprobado por el Ingeniero. En verificación.

## 3. Contexto actual

- **[H]** `src/main.ts` y `src/app.module.ts` contienen la base de NestJS. No hay módulos ACC o EMP, inicialización de plataforma ni proveedor de contexto operativo.
- **[H]** `ACC-ENT-004` y `ACC-ENT-005` son las entidades aprobadas del alcance. La intervención referencia a la Sesión de plataforma. `ACC-ENT-003` modela sesiones de Cuenta de Empresa.
- **[H]** `PLAN-EMP-0001` §4 D-02 propone un puerto de consulta de Empresa y un contexto que distingue actores de plataforma y de Empresa. Ambos están pendientes de acuerdo.
- **[H]** Aplican `ADR-0001`, `ADR-0002`, `ADR-0003`, `ADR-0005`, `ADR-0006` y `ADR-0008`.

## 4. Decisiones para revisión

### D-01 — Límite con el mecanismo operativo de plataforma

Proponer un puerto que reciba del mecanismo reservado por `ACC-Q-017` un actor de plataforma verificado y una referencia de Sesión válida, vinculados a la solicitud. Aplicación comprueba identidad activa y autorización vigente antes de emitir el contexto. La composición genera y correlaciona la solicitud. El cliente nunca elige la identidad, el rol, la Sesión ni el alcance efectivo.

El primer SuperAdministrador se registra mediante una invocación interna autorizada de inicialización. Las altas posteriores usan el [contrato OpenAPI](../contratos/openapi.yaml) y registran una identidad activa que el mecanismo operativo podrá vincular. El puerto puede simularse en pruebas con resultados de autenticación válida, ausente y revocada. El acceso real requiere el proveedor acordado y su verificación. Los nombres y valores de secretos, el formato de credencial y el ingreso o recuperación quedan bajo `ACC-Q-017`.

**Decisión del Ingeniero:** Aprobada. **Origen:** `ACC-Q-007`, `ACC-Q-017`, `ACC-ENT-004`, `ACC-ENT-005`, propuesta técnica IA.

### D-02 — Contexto de soporte y dependencia con EMP

Evaluar `ADR-0010`. Para resolver Empresa, usar el puerto previsto en `PLAN-EMP-0001` §4 D-02. Para consumir el contexto, distinguir por contrato estas variantes:

| Variante | Alcance propuesto |
|---|---|
| Plataforma | Actor de plataforma, Sesión, solicitud y permiso de la operación global. Es el contexto que puede consumir EMP para alta y listado. |
| Empresa | Cuenta de Empresa, Empresa, Sesión, solicitud y permiso. La consulta de historial aplica la matriz de `ACC-UC-011`. |
| Soporte | Actor de plataforma, Sesión, solicitud, Empresa destino, operación autorizada y referencia de intervención. Solo lo emite ACC al ejecutar `ACC-UC-007`. |

`ACC-UC-007` se plantea como caso de uso interno. La acción se solicita por la ruta del módulo dueño y este conserva su contrato y códigos de error. La consulta de historial como SuperAdministrador usa ese mismo contexto para la operación de ACC y se describe en el contrato. No hace falta una ruta genérica que reenvíe comandos.

La autorización por alcance se realiza antes de consultar datos de la Empresa. El motivo se valida después de decodificar la cabecera de soporte de la consulta. En el historial de Empresa se devuelve una proyección acotada por `ACC-Q-008`. La auditoría de plataforma conserva la identidad real y el motivo. En una acción de soporte, registrar la intervención y su resultado conforme a `ADR-0010`. Una falla de auditoría antes de delegar impide la acción. Si el dueño confirma una mutación, conserva su enlace de auditoría de forma atómica o mediante su salida durable.

**Decisión del Ingeniero:** Aprobada. **Origen:** `ACC-DEP-001`, `ACC-DEP-004`, `EMP-DEP-001`, `EMP-DEP-003`, `ACC-Q-005`, `ACC-Q-008`, propuesta técnica IA.

### D-03 — Persistencia, concurrencia e idempotencia

- Serializar la comprobación de plataforma vacía y la creación inicial en una transacción. El bloqueo debe funcionar incluso cuando todavía no hay filas de identidades. El resultado interno de una segunda inicialización se prueba con `ACC_INICIALIZACION_NO_PERMITIDA` según `@ACC-UC-006 @AC-05`.
- Registrar las altas posteriores y su auditoría en la misma transacción. Para un reintento con clave, aplicar `convenciones.md` §3.4 en el ámbito del actor de plataforma y la operación. Conservar el resultado confirmado en la misma transacción y reautorizar antes de devolverlo.
- Persistir la intervención con sus referencias y consultar el historial por Empresa, orden estable y paginación en PostgreSQL. Mantener el motivo y el actor real separados de la proyección de Empresa.
- El invariante `ACC-BR-008` se verifica en el dominio. El tratamiento del escenario vinculado a la desactivación se resuelve en §7.

**Decisión del Ingeniero:** Aprobada. **ADR:** decisiones locales de implementación. **Origen:** `ACC-Q-007`, `ACC-ENT-004`, `ACC-ENT-005`, `convenciones.md`, propuesta técnica IA.

## 5. Pasos de implementación

| ID | Resultado | Capa | Implementa | Archivos previstos | Verificación |
|---|---|---|---|---|---|
| T01 | Modelar identidad de plataforma, motivo y contexto de intervención | Dominio | `ACC-ENT-004`, `ACC-ENT-005`, `ACC-BR-007`, `ACC-BR-008`, `ACC-BR-011`, `ACC-BR-020` | `src/modulos/identidad-acceso/dominio/`, `src/modulos/identidad-acceso/pruebas/dominio/` | Ejemplos de reglas, separación de roles y valores límite |
| T02 | Registrar primera identidad y altas posteriores con sus puertos | Aplicación | `ACC-UC-006` | `src/modulos/identidad-acceso/aplicacion/comandos/`, `src/modulos/identidad-acceso/aplicacion/puertos/`, `src/modulos/identidad-acceso/pruebas/aplicacion/` | Autorización, inicialización única, idempotencia y auditoría |
| T03 | Resolver y entregar el contexto y consultar el historial | Aplicación | `ACC-UC-007`, `ACC-UC-011`, `ACC-DEP-001`, `ACC-DEP-004` | `src/modulos/identidad-acceso/aplicacion/comandos/`, `src/modulos/identidad-acceso/aplicacion/consultas/`, `src/modulos/identidad-acceso/aplicacion/puertos/`, `src/modulos/identidad-acceso/pruebas/aplicacion/` | Alcance, motivo, Sesión, resultados del dueño y proyección segura |
| T04 | Implementar repositorios, transacciones y adaptadores aprobados | Infraestructura | `ACC-ENT-004`, `ACC-ENT-005`, `ACC-DEP-001` | `migraciones/identidad-acceso/`, `src/modulos/identidad-acceso/infraestructura/`, `src/modulos/identidad-acceso/pruebas/integracion/` | Inicialización concurrente, rollback de alta, paginación e integridad de referencias |
| T05 | Componer operaciones y adaptar solicitudes al contrato | Presentación y composición | `crearSuperAdministrador`, `listarIntervencionesSoporte` | `src/modulos/identidad-acceso/presentacion/http/`, `src/modulos/identidad-acceso/identidad-acceso.module.ts`, `src/app.module.ts`, `src/modulos/identidad-acceso/pruebas/contrato/` | Autenticación, cabeceras, errores y compatibilidad con OpenAPI |
| T06 | Verificar escenarios y contratos de integración | Aceptación | `@ACC-UC-006`, `@ACC-UC-007`, `@ACC-UC-011` | `src/modulos/identidad-acceso/pruebas/aceptacion/`, `test/identidad-acceso-plataforma.e2e-spec.ts` | 16 escenarios identificados. Ejecutar conforme a §7 tras resolver el escenario pendiente y registrar los resultados por tag |

## 6. Verificación y riesgos

| Control | Evidencia esperada | Comando previsto |
|---|---|---|
| Documentación | Referencias, estados y procedencia coherentes | `python tools/spec_lint.py doc` |
| Calidad | Instalación reproducible, formato, lint, tipos y compilación | `yarn install --immutable`, `yarn format:check`, `yarn lint`, `yarn typecheck`, `yarn build` |
| Reglas y permisos | Casos válidos, límites, rechazos y cobertura acordada | `yarn test`, `yarn test:modulo -- identidad-acceso`, `yarn test:coverage` |
| Arquitectura | Sin dependencias internas recíprocas entre EMP y ACC | `yarn test:arquitectura` |
| Persistencia | Prueba real de alta atómica, inicialización concurrente, historial aislado y paginación | `yarn test:integracion` |
| HTTP y aceptación | Contrato, códigos del dueño, alcance, respuesta sin identidad real y trazabilidad de soporte | `yarn test:contratos`, `yarn test:e2e` |

- **Pruebas prioritarias:** dos inicializaciones simultáneas, intento de alta desde una Cuenta de Empresa, Sesión de plataforma inválida, soporte dirigido a otro destino, rechazo del dueño y falla al registrar auditoría. Para el historial, comparar el rechazo de IDs ajenos existentes e inexistentes, y comprobar que el cuerpo no contiene perfil, motivo ni Sesión de plataforma.
- **Integración real:** verificar en una entrega integrada el contexto de plataforma consumido por EMP y el historial con un Administrador autenticado. Usar dobles con fallas y permisos variados en la ejecución aislada.
- **Migración y rollback:** agregar persistencia de identidad, intervenciones y registros técnicos del alcance. Validar en una base aislada. Con datos de auditoría existentes, retirar la exposición y conservar los registros al revertir.

## 7. Cambios de especificación

| ID | Aclaración pendiente | Propuesta de origen IA |
|---|---|---|
| `ACC-UC-006`, `@ACC-UC-006 @AC-04`, `ACC-BR-008` | El escenario menciona desactivar al último SuperAdministrador dentro de un caso que solo crea identidades. | Conservar la prueba unitaria del invariante y su código `ACC_ULTIMO_SUPERADMINISTRADOR`. Acordar el ajuste controlado del escenario para que la verificación de una operación de desactivación corresponda a su caso de uso cuando se especifique. La discrepancia queda abierta y no se declara cubierta por el contrato de alta. |

**Aprobación del plan:** Aprobado por el Ingeniero (2026-11-09). En verificación.

## 8. Registro de ejecución

| Tarea | Commit | Estado | Notas o desviaciones |
|---|---|---|---|
| T01 | En rama de trabajo | Completada | Entidades `UsuarioPlataforma` (`ACC-ENT-004`) e `IntervencionSoporte` (`ACC-ENT-005`), objeto de valor `MotivoSoporte` (`ACC-BR-020`), errores de dominio y pruebas unitarias de dominio verificando roles admitidos (`ACC-BR-007`), último superadministrador (`ACC-BR-008`), contexto de soporte (`ACC-BR-011`) y límites de longitud. |
| T02 | En rama de trabajo | Completada | Caso de uso `RegistrarSuperAdministrador` (`ACC-UC-006`), soporte de inicialización controlada del primer SuperAdministrador con bloqueo de concurrencia y validación de plataforma no vacía (`@ACC-UC-006 @AC-05`), verificación de autorización y control de idempotencia con `GestorIdempotenciaAcc`. |
| T03 | En rama de trabajo | Completada | Casos de uso `ResolverContextoSoporte` (`ACC-UC-007`) y `ConsultarIntervencionesSoporte` (`ACC-UC-011`), puerto de verificación de empresa `VerificadorEmpresaPuerto` (`ACC-DEP-001`), entrega de contexto tipado (`ACC-DEP-004`) y proyección segura como "Soporte de plataforma" para actores de empresa (`ACC-BR-009`). |
| T04 | En rama de trabajo | Completada | Migración PostgreSQL `1731175000000-crear-tablas-identidad-acceso.ts`, entidades TypeORM (`UsuarioPlataformaTypeOrmEntidad`, `IntervencionSoporteTypeOrmEntidad`, `RegistroIdempotenciaAccTypeOrmEntidad`), `RepositorioUsuariosPlataformaTypeOrm`, `RepositorioIntervencionesSoporteTypeOrm`, `GestorIdempotenciaAccTypeOrm` y pruebas de integración sobre base nativa local. |
| T05 | En rama de trabajo | Completada | Controlador HTTP NestJS en `/api/v1/superadministradores` y `/api/v1/empresas/:empresaId/intervenciones-soporte`, DTOs de solicitud/consulta con validación estricta, mapeo de cabeceras de soporte y actor, módulo `IdentidadAccesoModule` e integración en `AppModule`. |
| T06 | En rama de trabajo | Completada | Pruebas de aceptación e2e en `test/identidad-acceso-plataforma.e2e-spec.ts` cubriendo los escenarios de `@ACC-UC-006`, `@ACC-UC-007` y `@ACC-UC-011`, control de idempotencia por cabecera y paginación con persistencia real. |

## 9. Evidencia

| Control | Resultado | Comando ejecutado | Observado |
|---|---|---|---|

## 10. Cierre

- **Conformidad:** pendiente de verificación independiente.
- **Ítems que pasan a Implementado:** pendiente.
- **Tarea que pasa a Completada:** `ACC-TASK-004` al cerrar el plan.
- **Revisor:** pendiente.
- **Estado final:** pendiente.
