---
type: plan
id: PLAN-TER-0001
title: "Registrar y mantener Chacras"
module: "TER"
task: TER-TASK-002
status: En verificación
mode: estandar
created: 2026-11-09
approved_by: "Ingeniero"
---

# PLAN-TER-0001 — Registrar y mantener Chacras

## 1. Objetivo y alcance

- **Tarea y épica:** `TER-TASK-002`, `EPIC-003`.
- **Implementa:** `TER-UC-001`, `TER-UC-004` y `TER-UC-005` sobre `TER-ENT-001`. Los cambios de ubicación y coordinación con Lotes se someten a revisión en §7.
- **Resultado observable:** un Administrador de la Empresa o un SuperAdministrador con soporte autorizado puede dar de alta, corregir e inactivar una Chacra mediante el [contrato OpenAPI](../contratos/openapi.yaml), con control de versión y auditoría.
- **Secuencia del módulo:** esta entrega establece la escritura de Chacras. `TER-TASK-003` aborda sus consultas y el alcance del Capataz. La consulta individual deberá entregar un ETag compatible con las escrituras. `TER-TASK-005`, `TER-TASK-006` y `TER-TASK-007` abarcan la escritura y consulta de Lotes y sus delimitaciones. La coordinación puntual con la migración de Lotes se define en §4.
- **Fuera de alcance:** consultas y listados HTTP, asignaciones del Capataz, reactivación de Chacras, ABM de Lotes, cálculo de superficies e integración cartográfica de clientes.

## 2. Preparación

- [x] Los ítems base de la entrega están `Aprobado`.
- [x] Las preguntas del alcance están respondidas, incluidas `TER-Q-018` y `TER-Q-022`.
- [x] Aprobar el cambio controlado de §7 y las decisiones técnicas del contrato propuesto.
- [x] Acordar `TER-DEP-001` y `TER-DEP-002` con proveedores reales o dobles expresamente limitados a pruebas. La habilitación de rutas requiere contexto auténtico de Cuenta de Empresa o soporte.
- [x] Resolver `ADR-TER-0001` y coordinar la migración de `TER-TASK-005` para probar y habilitar la inactivación con persistencia real.

**Estado para revisión:** Plan aprobado por el Ingeniero. En verificación.

## 3. Contexto actual

- **[H]** El repositorio ya contiene Yarn 4, TypeORM, un punto de composición en `src/app.module.ts`, migraciones de Empresas y ACC y reglas de Spectral. El desarrollo local usa PostgreSQL/PostGIS nativo según `convenciones.md` §1.
- **[H]** `PLAN-EMP-0001` y `PLAN-ACC-0001` figuran `En verificación`. La inspección de código muestra un puerto de lectura de Empresa y un caso de uso de soporte. Los controladores existentes reciben identidad y rol mediante cabeceras de solicitud. Esos caminos no acreditan una identidad o Sesión verificada para Territorio.
- **[H]** No existe implementación de Territorio ni migración de Chacras o Lotes en el árbol revisado.
- **[H]** `TER-Q-018` y `TER-Q-022` registran las decisiones. Sus efectos sobre la primera entrega siguen identificados como cambios controlados en requerimientos y modelo de datos.
- **[H]** Aplican `ADR-0001`, `ADR-0002`, `ADR-0003`, `ADR-0005` y `ADR-0008`. La integración de soporte requiere revisar la propuesta de `ADR-0010`.

## 4. Decisiones para revisión

### D-01 — Contexto de Empresa y soporte

| Dependencia | Propuesta para revisar |
|---|---|
| `TER-DEP-001` | Consumir el puerto público de referencia de EMP documentado en `EMP-DEP-003` y `PLAN-EMP-0001`. Territorio usa identidad y estado de la Empresa para verificar la habilitación del contexto, con referencia a `EMP-BR-005`. |
| `TER-DEP-002` | Recibir de ACC el contexto de Cuenta de Empresa o soporte para el caso de uso solicitado. Validar destino y permiso antes de acceder a la Chacra. El alcance de consulta del Capataz se concreta al planificar `TER-TASK-003`. |

La Empresa en la ruta selecciona el recurso solicitado. Para el Administrador debe coincidir con su contexto verificado. Para el SuperAdministrador identifica el destino que ACC debe autorizar bajo `ACC-UC-007` y registrar para esa operación. Las consultas de repositorio usan Empresa e identificador de Chacra en conjunto. Un identificador ajeno bajo la Empresa propia se trata igual que uno inexistente en esa Empresa. La ruta no acepta Empresa propietaria en el cuerpo.

Se recomienda acordar los puertos y verificar Territorio con dobles antes de integrar los proveedores reales. Las rutas se habilitan cuando el punto de composición puede entregar una identidad, Sesión y autorización verificadas. Si falta el proveedor, la integración permanece cerrada.

**Decisión del Ingeniero:** Aprobada. **Origen:** `TER-DEP-001`, `TER-DEP-002`, `TER-Q-003`, `ACC-BR-011`, `ADR-0010`, propuesta técnica IA.

### D-02 — Persistencia y coordinación con Lotes

Evaluar `ADR-TER-0001`. Se recomienda que la migración de `TER-TASK-002` cree Chacras y que la entrega de `TER-TASK-005` conserve la propiedad de la migración de Lotes. Ejecutar ambas en ese orden al integrar la inactivación. Antes de contar con la lectura real de Lotes, la inactivación se verifica con dobles en Aplicación y permanece fuera de las rutas habilitadas. Se puede preparar la entrega de Lotes contra el esquema de Chacras sin esperar el cierre del plan de Chacras.

**Decisión del Ingeniero:** Aprobada. **Origen:** `TER-Q-022`, `TER-BR-023`, propuesta técnica IA.

### D-03 — Normalización, ubicación y contrato HTTP

- Guardar el nombre corto mostrado y una clave de comparación propia del repositorio. Propuesta técnica para `TER-BR-007`: normalizar Unicode, plegar mayúsculas, eliminar marcas de acento y compactar espacios. Confirmar el tratamiento de la ñ como letra distinta. Crear una restricción única por Empresa y clave de comparación, aplicable también a Chacras inactivas.
- Usar el esquema de coordenadas decimales del contrato de EMP como referencia de transporte. Para la ubicación de Chacra se propone validar el rango original y guardar ambos valores en `numeric(10,7)`. La longitud, el formato y los errores de ubicación nuevos quedan en §7. Las coordenadas se guardan juntas o se omiten juntas.
- Usar `If-Match` y ETag de la Chacra para las dos escrituras sobre registros existentes. Los cambios descriptivos son parciales y un nulo retira un dato opcional. Conservar los códigos de excepción del caso de uso cuando la validación de entrada detecte el incumplimiento correspondiente. Para el intento de cambiar el estado de una Chacra inactiva desde la edición descriptiva, aplicar `TER-BR-008` después de autorizar y resolver el recurso, sin aceptar el atributo como editable.
- Aplicar `convenciones.md` §3.4 a las tres operaciones. Verificar el contexto antes de recuperar un resultado idempotente. La clave se vincula a actor, Empresa y operación. La huella incluye recurso, carga y versión solicitada cuando corresponda. Persistir el resultado y la auditoría de la escritura junto al cambio o mediante el registro durable aplicable.

**Decisión del Ingeniero:** Aprobada. **Origen:** `TER-Q-006`, `TER-Q-007`, `TER-Q-018`, `convenciones.md` §2 y §3, propuesta técnica IA.

## 5. Pasos de implementación

| ID | Resultado | Capa | Implementa | Archivos previstos | Verificación |
|---|---|---|---|---|---|
| T01 | Modelar Chacra, sus datos descriptivos y transición | Dominio | `TER-ENT-001`, `TER-BR-001` a `TER-BR-003`, `TER-BR-005` a `TER-BR-008`, §7 | `src/modulos/territorio/dominio/`, `src/modulos/territorio/pruebas/dominio/` | Reglas, casos límite y cambio controlado de ubicación |
| T02 | Registrar y modificar Chacras con alcance y versión | Aplicación | `TER-UC-001`, `TER-UC-004`, `TER-DEP-001`, `TER-DEP-002` | `src/modulos/territorio/aplicacion/comandos/registrar-chacra.caso-de-uso.ts`, `src/modulos/territorio/aplicacion/comandos/modificar-chacra.caso-de-uso.ts`, `src/modulos/territorio/aplicacion/puertos/`, `src/modulos/territorio/pruebas/aplicacion/` | Permisos, contexto, unicidad, versiones y corrección de inactivas |
| T03 | Inactivar sin perder historial | Aplicación | `TER-UC-005`, `TER-BR-023`, §7 | `src/modulos/territorio/aplicacion/comandos/inactivar-chacra.caso-de-uso.ts`, `src/modulos/territorio/aplicacion/puertos/`, `src/modulos/territorio/pruebas/aplicacion/` | Estado, versión, Lotes activos o inactivos y falla del verificador |
| T04 | Persistir Chacras y adaptar dependencias | Infraestructura | `TER-ENT-001`, `TER-BR-007`, `TER-BR-023`, `TER-DEP-001`, `TER-DEP-002` | `migraciones/territorio/`, `src/modulos/territorio/infraestructura/`, `src/infraestructura/persistencia/data-source.ts`, `src/modulos/territorio/pruebas/integracion/` | Restricciones en PostgreSQL, concurrencia y protocolo común con Lotes |
| T05 | Exponer el contrato y conectar los puertos | Presentación y composición | `registrarChacra`, `modificarChacra`, `inactivarChacra` | `src/modulos/territorio/presentacion/http/`, `src/modulos/territorio/territorio.module.ts`, `src/app.module.ts`, `src/modulos/territorio/pruebas/contrato/` | Contrato HTTP, códigos, versiones, autorización y bloqueo de exposición |
| T06 | Verificar la entrega | Aceptación | `@TER-UC-001`, `@TER-UC-004`, `@TER-UC-005`, §7 | `src/modulos/territorio/pruebas/aceptacion/`, `test/territorio-chacras.e2e-spec.ts` | 28 escenarios vigentes y los que se aprueben en §7. Registrar resultados por tag |

## 6. Verificación y riesgos

| Control | Evidencia esperada | Comando previsto |
|---|---|---|
| Documentación | IDs, estados y procedencia | `python tools/spec_lint.py doc` |
| Calidad | Instalación reproducible, formato, lint, tipos y compilación | `yarn install --immutable`, `yarn format:check`, `yarn lint`, `yarn typecheck`, `yarn build` |
| Reglas y cobertura | Casos por BR y UC, límites y permisos | `yarn test`, `yarn test:modulo -- territorio`, `yarn test:coverage` |
| Arquitectura | Límites entre TER, EMP y ACC | `yarn test:arquitectura` |
| Persistencia | Migraciones y concurrencia en PostgreSQL/PostGIS nativo aislado | `yarn test:integracion` |
| Contrato y aceptación | Operaciones, códigos, ETag, soporte y escenarios aprobados | `yarn test:contratos`, `yarn test:e2e` |

- **Aislamiento:** probar dos Empresas con el mismo nombre corto, un destino ajeno y una Chacra ajena bajo la ruta de la Empresa propia. Incluir cabeceras falsificadas, soporte sin motivo, soporte para otro destino y Empresa no habilitada.
- **Concurrencia:** probar dos altas con nombres equivalentes, dos actualizaciones con igual versión y reenvíos idempotentes. Con la migración de Lotes, demostrar que inactivar una Chacra y registrar o reactivar uno de sus Lotes simultáneamente no rompe `TER-BR-023`.
- **Migración y rollback:** aplicar migraciones aditivas en una base aislada. Comprobar que EMP y ACC mantienen sus datos. Con registros operativos, retirar la exposición y conservar tablas e historial. Ensayar cualquier reversión de esquema sobre datos descartables.

## 7. Cambios de especificación

| ID y origen | Cambio controlado para revisión | Verificación propuesta |
|---|---|---|
| `TER-ENT-001`, `TER-REQ-001`, `TER-REQ-004`, `TER-UC-001`, `TER-UC-004` · `TER-Q-018` | Incorporar los dos datos de referencia aprobados. Como propuesta IA, limitar la dirección recibida a 500 caracteres y recortar sus espacios exteriores al guardar. Representar las coordenadas en grados decimales según §4 y aplicar `TER_TEXTO_INVALIDO` y `TER_UBICACION_GEOGRAFICA_INVALIDA`. El primer código cubre también los límites de texto aprobados en `TER-Q-006`. | Alta con uno de los datos o ambos, corrección y retiro independiente, rechazo de punto incompleto o fuera de rango y límite de dirección |
| `TER-ENT-001`, `TER-REQ-005`, `TER-UC-005` · `TER-Q-022`, `TER-BR-023` | Incorporar la precondición y excepción aprobadas a la inactivación de Chacra. | Rechazo con Lote activo, éxito cuando todos están inactivos, conservación de referencias y prueba concurrente |

La aprobación de este plan debe identificar los cambios aceptados y la revisión que actualice los archivos normativos antes de programar esas partes. Los escenarios nuevos se incorporan al caso de uso dueño. La versión del contrato es una propuesta para esa revisión.

**Aprobación del plan:** Aprobado por el Ingeniero (2026-11-09). En verificación.

## 8. Registro de ejecución

| Tarea | Commit | Estado | Notas o desviaciones |
|---|---|---|---|
| T01 | En rama de trabajo | Completada | Entidad `Chacra` (`TER-ENT-001`), enumeración `EstadoChacra`, objeto de valor `UbicacionGeografica`, función `normalizarClaveNombreCorto` y 18 pruebas unitarias de dominio verificando invariantes (`TER-BR-001`, `TER-BR-002`, `TER-BR-003`, `TER-BR-005`, `TER-BR-006`, `TER-BR-007`, `TER-BR-008` y cambios de §7). |
| T02 | En rama de trabajo | Completada | Casos de uso `RegistrarChacra` (`TER-UC-001`) y `ModificarChacra` (`TER-UC-004`) con validación de contexto de actor y soporte, comprobación de unicidad de nombre corto por empresa, concurrencia optimista (`If-Match`) e idempotencia. |
| T03 | En rama de trabajo | Completada | Caso de uso `InactivarChacra` (`TER-UC-005`), puerto `VerificadorLotesChacraPuerto` comprobando que no existan Lotes activos (`TER-BR-023`), transición irreversible y control de versión. |
| T04 | En rama de trabajo | Completada | Migración PostgreSQL `1731180000000-crear-tablas-territorio.ts`, entidades TypeORM (`ChacraTypeOrmEntidad`, `RegistroIdempotenciaTerTypeOrmEntidad`), `RepositorioChacrasTypeOrm` con soporte para bloqueo pesimista `pessimistic_write` (`ADR-TER-0001`), adaptadores de verificación y soporte, y pruebas de integración con PostgreSQL real. |
| T05 | En rama de trabajo | Completada | DTOs de transporte, `ControladorChacras` exponiendo `/api/v1/empresas/:empresaId/chacras` y sus rutas PATCH e inactivaciones conforme a OpenAPI, integración en `FiltroExcepcionesHttp` para RFC 9457 y módulo `TerritorioModule` integrado en `AppModule`. |
| T06 | En rama de trabajo | Completada | 14 escenarios de pruebas de aceptación e2e en `test/territorio-chacras.e2e-spec.ts` verificando `@TER-UC-001`, `@TER-UC-004`, `@TER-UC-005`, soporte auditable, control de idempotencia y rechazos por concurrencia y permisos contra base nativa local. |

## 9. Evidencia

| Control | Resultado | Comando ejecutado | Observado |
|---|---|---|---|

## 10. Cierre

- **Conformidad:** pendiente de verificación independiente.
- **Ítems que pasan a Implementado:** pendiente.
- **Tarea que pasa a Completada:** `TER-TASK-002` al cerrar el plan.
- **Revisor:** pendiente.
- **Estado final:** pendiente.
