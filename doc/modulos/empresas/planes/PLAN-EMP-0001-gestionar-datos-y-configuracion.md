---
type: plan
id: PLAN-EMP-0001
title: "Gestionar datos y configuración general de Empresas"
module: "EMP"
task: EMP-TASK-002
status: En verificación
mode: estandar
created: 2026-11-09
approved_by: "Ingeniero"
---

# PLAN-EMP-0001 — Gestionar datos y configuración general de Empresas

## 1. Objetivo y alcance

- **Tarea y épica:** `EMP-TASK-002`, `EPIC-001`.
- **Implementa:** `EMP-UC-001`, `EMP-UC-002`, `EMP-UC-003`, `EMP-UC-004`, `EMP-UC-008`.
- **Resultado observable:** un actor autorizado puede registrar, consultar, listar y actualizar Empresas y su configuración general mediante el [contrato OpenAPI](../contratos/openapi.yaml). El alta conserva Empresa y configuración inicial juntas. Las pruebas demuestran autorización, concurrencia y manejo de fallas de las dependencias.
- **Límite de la entrega:** la verificación aislada puede usar dobles acordados de ACC y del proveedor comercial. Para habilitar el circuito con usuarios reales se necesitan ambos proveedores operativos.
- **Fuera de alcance:** `EMP-TASK-003`, administración de credenciales y cuentas, creación del Administrador inicial, implementación de Suscripciones y alta de Chacras. Los estados de Empresa se usan para validar permisos y se preparan como datos de prueba para los escenarios del alcance.

## 2. Preparación

- [x] Especificación de los cinco casos, reglas y entidades del alcance en estado `Aprobado`.
- [x] Preguntas del alcance respondidas, incluidas `EMP-Q-008` y `EMP-Q-013`.
- [x] Contratos de `EMP-DEP-001`, `EMP-DEP-002` y `EMP-DEP-003` acordados con dobles para pruebas aisladas de EMP.
- [x] `ADR-0009` resuelto y aceptado por el Ingeniero (Alternativa A).
- [x] Base técnica disponible y verificada según `convenciones.md` §1, §6 y §9 (Yarn 4, PostgreSQL + PostGIS nativo local en `TAREFERO_APP`, TypeScript estricto, Spectral y Dependency Cruiser).

**Estado para revisión:** Plan aprobado por el Ingeniero. En ejecución.

## 3. Contexto actual

- **[H]** `src/main.ts`, `src/app.module.ts` y `src/app.controller.ts` contienen el arranque y TypeORM configurado contra la base nativa local `TAREFERO_APP`. No existe un módulo EMP en `src/` ni un adaptador operativo de ACC o de asignaciones.
- **[H]** `package.json` tiene Yarn 4 fijado, TypeORM, PostGIS verificado y los comandos de calidad y arquitectura operativos. `tsconfig.json` opera en modo estricto completo.
- **[H]** `EMP-ENT-001` y `EMP-ENT-002` definen identidades y versiones propias. `EMP-DEP-003` aporta a ACC la identidad, el alias y el estado de Empresa.
- **[H]** Los ADR vigentes que rigen el trabajo son `ADR-0001`, `ADR-0002`, `ADR-0003`, `ADR-0005`, `ADR-0006`, `ADR-0008` y `ADR-0009`.

## 4. Decisiones para revisión

### D-01 — Proveedor comercial

Evaluar las alternativas de `ADR-0009`. El puerto de salida propuesto, `VerificadorAsignacionComercial`, recibe el alias validado y devuelve un resultado inequívoco de confirmación o ausencia. Una falla del proveedor se propaga como error técnico. EMP verifica la asignación antes de escribir y no la consume ni registra dentro de sus entidades. El alta y sus reintentos no generan asignaciones nuevas.

**Decisión del Ingeniero:** Aprobada alternativa A de `ADR-0009` (puerto desacoplado con simulación de dobles en pruebas). **Origen:** `EMP-Q-008`, `EMP-DEP-002`, `ADR-0009`.

### D-02 — Integración con Identidad y Acceso

| Contrato | Propuesta para revisar |
|---|---|
| `EMP-DEP-001` | ACC entrega contexto autenticado y permiso vigente para la operación. El contexto distingue cuenta de Empresa de actor de plataforma e identifica al actor y la solicitud para auditoría. El identificador de Empresa de la URL es el recurso solicitado. Aplicación valida su alcance antes de consultar el recurso. |
| `EMP-DEP-003` | Puerto público de Aplicación para consultar por alias o por identificador. Devuelve solo identificador, alias y estado, o ausencia. Sirve para que ACC resuelva el contexto sin llamar a un caso de uso HTTP de EMP ni depender de sus repositorios. |

**Alternativas:** integrar proveedores reales antes de desarrollar la entrega, o aprobar estos contratos y desarrollar con dobles limitados al entorno de pruebas. Se aprueba la segunda opción para verificar EMP de forma aislada.

**Decisión del Ingeniero:** Aprobada. **Origen:** `EMP-DEP-001`, `EMP-DEP-003`, `ACC-DEP-001`, `ACC-Q-017`, `ADR-0008`.

### D-03 — Contrato HTTP y persistencia

Las propuestas locales de origen IA se revisan junto al [OpenAPI](../contratos/openapi.yaml), que es el dueño de rutas, campos y respuestas.

- La modificación es parcial. Omitir un atributo deja el valor anterior. Un valor nulo explícito retira un dato descriptivo opcional. La traducción de errores conserva los códigos del caso de uso para un alta sin nombre o alias y para un punto incompleto. El formato HTTP inválido se distingue de los incumplimientos de BR.
- Las coordenadas siguen la representación decimal de `convenciones.md` §2. Se propone guardar el punto administrativo con `numeric(10,7)` por coordenada, validar el rango original antes de redondear y comprobar los límites mediante `EMP-BR-002`. La precisión queda sujeta a revisión del contrato.
- La representación de Empresa incluye su configuración. El ETag de esa representación combina ambas versiones. La configuración dispone de su propio ETag, entregado en la consulta de Empresa y en la respuesta de modificación de la configuración. La escritura comprueba la versión dentro de la transacción.
- Para crear, persistir Empresa, configuración y, cuando corresponda, el resultado idempotente en una transacción. Para modificar, bloquear primero la fila de Empresa, comprobar estado y versión y guardar el cambio. Usar el mismo orden al incorporar transiciones en `EMP-TASK-003` para evitar cambios administrativos simultáneos incompatibles.
- La migración aplica unicidad del alias y relación uno a uno de la configuración. El repositorio pagina en PostgreSQL. Los códigos por conflicto de alias y versión conservan su significado incluso cuando el conflicto se detecta en base de datos.
- En el alta, aplicar la idempotencia de `convenciones.md` §3.4 en el ámbito del actor de plataforma y la operación. La misma clave y carga recuperan el resultado confirmado tras volver a autorizar al actor. Dos solicitudes concurrentes con la misma clave se coordinan en persistencia. La misma clave con otra carga produce el conflicto definido por el contrato.

**Decisión del Ingeniero:** Aprobada. **ADR:** decisiones locales en el plan. El almacenamiento y el mecanismo de validación siguen los ADR vigentes.

## 5. Pasos de implementación

| ID | Resultado | Capa | Implementa | Archivos previstos | Verificación |
|---|---|---|---|---|---|
| T01 | Empresa, configuración y objetos de valor con invariantes | Dominio | `EMP-ENT-001`, `EMP-ENT-002`, `EMP-BR-001` a `EMP-BR-004`, `EMP-BR-006`, `EMP-BR-010` a `EMP-BR-014` | `src/modulos/empresas/dominio/`, `src/modulos/empresas/pruebas/dominio/` | Ejemplos de las BR del alcance y pruebas de valores límite |
| T02 | Registrar Empresa con sus puertos, autorización y unidad de trabajo | Aplicación | `EMP-UC-001`, `EMP-DEP-001`, `EMP-DEP-002` | `src/modulos/empresas/aplicacion/comandos/registrar-empresa.caso-de-uso.ts`, `src/modulos/empresas/aplicacion/puertos/`, `src/modulos/empresas/pruebas/aplicacion/` | Permiso, asignación ausente y falla, atomicidad y comportamiento ante reenvío |
| T03 | Consultar, listar y resolver la referencia pública de Empresa | Aplicación | `EMP-UC-002`, `EMP-UC-003`, `EMP-DEP-003` | `src/modulos/empresas/aplicacion/consultas/`, `src/modulos/empresas/aplicacion/puertos/`, `src/modulos/empresas/pruebas/aplicacion/` | Consulta autorizada, denegación sin lectura ajena, filtro y contrato mínimo para ACC |
| T04 | Actualizar datos y configuración con autorización y versión | Aplicación | `EMP-UC-004`, `EMP-UC-008` | `src/modulos/empresas/aplicacion/comandos/modificar-empresa.caso-de-uso.ts`, `src/modulos/empresas/aplicacion/comandos/modificar-configuracion-general-empresa.caso-de-uso.ts`, `src/modulos/empresas/aplicacion/puertos/`, `src/modulos/empresas/pruebas/aplicacion/` | Matriz de actores y estados, precedencia de errores y conflicto de versión |
| T05 | Persistir y consultar por los puertos del módulo | Infraestructura | `EMP-ENT-001`, `EMP-ENT-002`, `EMP-BR-012`, `EMP-DEP-003` | `migraciones/empresas/`, `src/modulos/empresas/infraestructura/persistencia/typeorm/`, `src/modulos/empresas/infraestructura/transacciones/`, `src/modulos/empresas/pruebas/integracion/` | Migración en PostgreSQL/PostGIS, mapeo, rollback, unicidad bajo concurrencia, idempotencia, control de versión y paginación estable |
| T06 | Exponer y componer las cinco operaciones aprobadas | Presentación y composición | `registrarEmpresa`, `consultarEmpresa`, `listarEmpresas`, `modificarEmpresa`, `modificarConfiguracionGeneralEmpresa` | `src/modulos/empresas/presentacion/http/`, `src/modulos/empresas/empresas.module.ts`, `src/app.module.ts`, `src/main.ts`, `src/modulos/empresas/pruebas/contrato/` | Coincidencia con OpenAPI, autorización de entrada, traducción de errores y cabeceras de versión |
| T07 | Verificar circuitos y excepciones | Aceptación | `@EMP-UC-001`, `@EMP-UC-002`, `@EMP-UC-003`, `@EMP-UC-004`, `@EMP-UC-008` | `src/modulos/empresas/pruebas/aceptacion/`, `test/empresas.e2e-spec.ts` | Los 32 escenarios etiquetados, con persistencia real en integración y dobles de dependencias únicamente cuando el contrato esté acordado |

## 6. Verificación y riesgos

| Control | Evidencia esperada | Comando previsto |
|---|---|---|
| Documentación | IDs, referencias y estados coherentes | `python tools/spec_lint.py doc` |
| Calidad | Instalación reproducible, formato, lint, tipos y compilación | `yarn install --immutable`, `yarn format:check`, `yarn lint`, `yarn typecheck`, `yarn build` |
| Reglas, permisos y cobertura | Ejemplos de BR, escenarios de UC y umbrales de `convenciones.md` §9 | `yarn test`, `yarn test:modulo -- empresas`, `yarn test:coverage` |
| Límites de capas y módulos | Dependencias permitidas, composición y ausencia de ciclos | `yarn test:arquitectura` |
| Integración | Migración real, aislamiento, unicidad concurrente y escritura atómica | `yarn test:integracion` |
| Contratos y HTTP | OpenAPI, cabeceras, códigos, permisos y escenarios etiquetados | `yarn test:contratos`, `yarn test:e2e` |

- **Pruebas de integración prioritarias:** dos altas simultáneas con un alias, dos reenvíos simultáneos con una clave de idempotencia, dos cambios concurrentes con la misma versión, falla al guardar la configuración inicial y acceso de un Administrador a IDs fuera de su Empresa. La prueba de alcance compara IDs ajenos existentes e inexistentes y verifica que ambos devuelvan el mismo rechazo sin revelar datos.
- **Riesgo de integración:** un doble que siempre autoriza puede ocultar defectos. Usar dobles con respuestas positivas y negativas y ejecutar nuevamente el recorrido con proveedores reales antes de habilitar las rutas para usuarios.
- **Migración de datos:** estructuras iniciales y aditivas para EMP. Validar en una base vacía y comprobar que no alteran datos de otros módulos.
- **Rollback:** antes de aceptar datos, revertir la migración en el entorno de ensayo. Con datos operativos, retirar la exposición HTTP y conservar las tablas. Cualquier reversión destructiva requiere una migración específica y respaldo verificado.

## 7. Cambios de especificación

| ID | Cambio | Motivo |
|---|---|---|
| Ninguno | El contrato propuesto implementa el alcance aprobado | Las decisiones técnicas y los acuerdos pendientes se registran en §4 |

**Aprobación del plan:** Aprobado por el Ingeniero (2026-11-09). En verificación.

## 8. Registro de ejecución

| Tarea | Commit | Estado | Notas o desviaciones |
|---|---|---|---|
| T01 | En rama de trabajo | Completada | Entidades Empresa y ConfiguracionGeneralEmpresa, objetos de valor (AliasEmpresa, Cuit, UbicacionGeografica), EstadoEmpresa, ErrorDominioEmpresa y 22 pruebas unitarias que verifican invariantes y transiciones |
| T02 | En rama de trabajo | Completada | Puertos de lectura y contexto de actor; casos de uso ConsultarEmpresa (`EMP-UC-002`) y ListarEmpresas (`EMP-UC-003`) con paginación estable, aislamiento por Empresa y matriz de roles |
| T03 | En rama de trabajo | Completada | Caso de uso RegistrarEmpresa (`EMP-UC-001`), puerto y adaptador provisional VerificadorAsignacionComercial (`ADR-0009`), creación atómica de Empresa y configuración general inicial, y ServicioReferenciaEmpresa (`EMP-DEP-003`) |
| T04 | En rama de trabajo | Completada | Casos de uso ModificarEmpresa (`EMP-UC-004`) y ModificarConfiguracionGeneral (`EMP-UC-008`) con control de concurrencia optimista y reglas de inmutabilidad/auditoría. 14 pruebas de aplicación pasando |
| T05 | En rama de trabajo | Completada | Migración PostgreSQL/PostGIS `1731170000000-crear-tablas-empresas.ts`, entidades TypeORM sin referencias circulares, mapeador bidireccional y RepositorioEmpresasTypeOrm probado contra PostgreSQL nativo local |
| T06 | En rama de trabajo | Completada | Controlador HTTP NestJS en `/api/v1/empresas`, DTOs tipados, filtro global RFC 9457 para traducción de errores, módulo `EmpresasModule` e integración en `AppModule` |
| T07 | En rama de trabajo | Completada | Pruebas de aceptación e2e en `test/empresas.e2e-spec.ts` verificando escenarios de `@EMP-UC-001`, `@EMP-UC-002`, `@EMP-UC-003`, `@EMP-UC-004` y `@EMP-UC-008` (15 pruebas de extremo a extremo pasando contra la base de datos real) |

## 9. Evidencia

| Control | Resultado | Comando ejecutado | Observado |
|---|---|---|---|

## 10. Cierre

- **Conformidad:** pendiente de verificación independiente.
- **Ítems que pasan a Implementado:** pendiente.
- **Tarea que pasa a Completada:** `EMP-TASK-002` al cerrar el plan.
- **Revisor:** pendiente.
- **Estado final:** pendiente.
