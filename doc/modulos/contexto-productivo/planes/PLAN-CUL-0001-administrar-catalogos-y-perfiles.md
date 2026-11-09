---
type: plan
id: PLAN-CUL-0001
title: "Administrar catálogos y Perfiles productivos"
module: "CUL"
task: CUL-TASK-002
status: En verificación
mode: estandar
created: 2026-11-09
approved_by: "Ingeniero"
---

# PLAN-CUL-0001 — Administrar catálogos y Perfiles productivos

## 1. Objetivo y alcance

- **Tarea y épica:** `CUL-TASK-002`, `EPIC-004`.
- **Implementa:** `CUL-UC-001` y `CUL-UC-002` sobre `CUL-ENT-001` a `CUL-ENT-004`.
- **Resultado observable:** el SuperAdministrador administra Cultivos, Variedades y Perfiles base. Un Administrador configura Perfiles de su Empresa o de un Lote autorizado. Los Perfiles conservan sus versiones y sus referencias históricas.
- **Contrato:** [OpenAPI](../contratos/openapi.yaml). Las operaciones y las decisiones pendientes tienen trazabilidad a sus casos de uso.
- **Fuera de alcance:** Implantaciones, Campañas, Ciclos, edición de datos productivos de otros módulos y carga de Perfiles o Cultivos iniciales. La habilitación de Cultivos por Empresa se trata como cambio controlado en §7.

## 2. Preparación

- [x] Los dos casos de uso, sus reglas y las entidades de la tarea figuran en estado `Aprobado`.
- [x] Las preguntas de ese alcance están respondidas, incluidas `CUL-Q-006`, `CUL-Q-015`, `CUL-Q-019` y `CUL-Q-022`.
- [ ] Resolver las diferencias y precisiones de §7. Una prueba con datos preparados no sustituye la habilitación operativa del Cultivo.
- [ ] Acordar los contratos de `CUL-DEP-001`, `CUL-DEP-002`, `CUL-DEP-003` y `CUL-DEP-008` con proveedores reales o simulaciones limitadas a pruebas.
- [ ] Aprobar `ADR-CUL-0001` y el contrato HTTP.
- [ ] Registrar la aprobación explícita del plan. `CUL-TASK-002` pasa a `Planificada` cuando se satisfacen las condiciones de ejecución.

**Bloqueos:** resolución de §7, contratos de autorización, Lotes y unidades, y decisiones de §4. El plan queda preparado para revisión. Si se necesita comenzar antes con el catálogo global, el Ingeniero puede aprobar una separación explícita de la tarea y del plan.

## 3. Contexto actual

- **[H]** El repositorio tiene NestJS, TypeORM, migraciones de EMP y ACC y controles de calidad. `src/app.module.ts` y `src/infraestructura/persistencia/data-source.ts` son puntos existentes de integración. El entorno local usa PostgreSQL/PostGIS nativo según `convenciones.md` §1.
- **[H]** `PLAN-EMP-0001` y `PLAN-ACC-0001` figuran `En verificación`. EMP ofrece un puerto de referencia de Empresa. El código HTTP revisado aún recibe identidad y rol por cabeceras de solicitud y no constituye un contexto autenticado apto para CUL.
- **[H]** `PLAN-TER-0001` figura `En ejecución` y cubre Chacras. No se encontró un proveedor público de pertenencia de Lotes ni un catálogo operativo de unidades de INV.
- **[H]** No se encontró implementación de CUL. Aplican `ADR-0001`, `ADR-0002`, `ADR-0003`, `ADR-0005` y `ADR-0008`.

## 4. Decisiones para revisión

### D-01 — Versionado y precedencia

Evaluar `ADR-CUL-0001`. Se recomienda una línea por Cultivo y alcance, con versiones numeradas y relación a un padre exacto. Separar el número funcional de versión del token de concurrencia que se usa en `If-Match`. Cambiar un borrador no crea otra versión. Publicar inmoviliza su definición, campos y referencias de herencia. Una nueva edición parte de una copia y conserva la versión anterior. Validar en publicación que la cadena no contenga ciclos, cruces de Empresa, Cultivos incompatibles ni eliminación de campos base obligatorios.

**Decisión del Ingeniero:** aprobada. Se adopta la alternativa A de ADR-CUL-0001.

### D-02 — Contratos con módulos dueños

| Dependencia | Contrato mínimo propuesto para revisión |
|---|---|
| `CUL-DEP-001` | Resolver identidad y estado de Empresa por el puerto público de `EMP-DEP-003`. |
| `CUL-DEP-002` | Consultar un Lote por identificador dentro de una Empresa autorizada. TER confirma pertenencia y estado. La superficie se incorpora cuando la requieran las Implantaciones. |
| `CUL-DEP-003` | ACC entrega contexto verificado de plataforma o de Cuenta de Empresa con permiso vigente. Para los Perfiles BASE se usa el contexto de plataforma. Para EMPRESA o LOTE el alcance se valida con el contexto de Empresa. |
| `CUL-DEP-008` | INV confirma la referencia canónica y la vigencia de la unidad elegida para un campo decimal. CUL conserva la referencia, valida su uso al configurar o publicar y no administra un catálogo alternativo. |

Se recomiendan dobles limitados a pruebas con contratos aprobados para verificar los casos de CUL. Las operaciones se habilitan con proveedores reales. Rechazar un destino ajeno antes de resolver su información y distinguir la falla técnica de una dependencia de una referencia inexistente o incompatible.

**Decisión del Ingeniero:** aprobada. Se implementan los puertos y dobles según arquitectura hexagonal.

### D-03 — Definición tipada de campos

Propuesta de representación local para `CUL-ENT-004`: un objeto discriminado por tipo con validaciones de longitud, rango o selección. Las validaciones usan datos estructurados y el caso de uso rechaza claves desconocidas, tipos mezclados, rangos invertidos y códigos repetidos. Las unidades decimales se resuelven por `CUL-DEP-008`. Los valores operativos se mantienen en el módulo dueño. Guardar las definiciones en el mismo límite transaccional que la versión.

**Decisión del Ingeniero:** aprobada según esquema OpenAPI.

### D-04 — Integridad del catálogo y escritura HTTP

- Conservar códigos y nombres de catálogo con claves normalizadas para las restricciones de unicidad. Aplicar el alcance de Cultivo a la unicidad de Variedad. Una inactivación cambia la vigencia y mantiene el registro y sus referencias.
- Usar el orden estable y la paginación de `convenciones.md` §3.2 y §3.3 en los listados. Las consultas administrativas de catálogo siguen la matriz de `CUL-UC-001`. La consulta individual de Perfil en este contrato se propone como lectura de mantenimiento para recuperar el ETag, con los mismos permisos que su edición.
- En las escrituras que puedan repetirse, verificar el contexto antes de resolver `Idempotency-Key`. Registrar la huella, el resultado confirmado y la auditoría junto con la escritura o mediante su registro durable. Aplicar `If-Match` a los cambios sobre recursos existentes.
- Traducir errores del dominio a las respuestas OpenAPI. Las condiciones de §7 conservan los dos códigos candidatos hasta que quede aprobada la correspondencia definitiva. `CUL_RECURSO_NO_ENCONTRADO`, `CUL_VERSION_CONFLICTO` y `CUL_IDEMPOTENCIA_CONFLICTO` son propuestas técnicas de transporte.

**Decisión del Ingeniero:** aprobada según convenciones y openapi.yaml.

## 5. Pasos de implementación

| ID | Resultado | Capa | Implementa | Archivos previstos | Verificación |
|---|---|---|---|---|---|
| T01 | Modelar Cultivo, Variedad, versión de Perfil y campo tipado | Dominio | `CUL-ENT-001` a `CUL-ENT-004`, `CUL-BR-001` a `CUL-BR-006`, `CUL-BR-022` | `src/modulos/contexto-productivo/dominio/`, `src/modulos/contexto-productivo/pruebas/dominio/` | Ejemplos de reglas, campos obligatorios, historial e invariantes |
| T02 | Crear, consultar e inactivar Cultivos y Variedades | Aplicación | `CUL-UC-001`, `CUL-DEP-003` | `src/modulos/contexto-productivo/aplicacion/comandos/`, `src/modulos/contexto-productivo/aplicacion/consultas/`, `src/modulos/contexto-productivo/aplicacion/puertos/`, `src/modulos/contexto-productivo/pruebas/aplicacion/` | Permisos de plataforma, unicidad, historial, orden y filtrado |
| T03 | Configurar, consultar para mantenimiento, publicar e inactivar versiones | Aplicación | `CUL-UC-002`, dependencias de §4 D-02 y cambios aprobados de §7 | `src/modulos/contexto-productivo/aplicacion/comandos/`, `src/modulos/contexto-productivo/aplicacion/consultas/`, `src/modulos/contexto-productivo/aplicacion/puertos/`, `src/modulos/contexto-productivo/pruebas/aplicacion/` | Alcance, Cultivo habilitado, unidad válida, precedencia e inmutabilidad |
| T04 | Persistir el catálogo y las versiones y conectar proveedores | Infraestructura | `CUL-ENT-001` a `CUL-ENT-004`, `ADR-CUL-0001` | `migraciones/contexto-productivo/`, `src/modulos/contexto-productivo/infraestructura/`, `src/infraestructura/persistencia/data-source.ts`, `src/modulos/contexto-productivo/pruebas/integracion/` | Migración real, concurrencia, restricciones por ámbito y conservación de referencias |
| T05 | Exponer el contrato y componer dependencias | Presentación y composición | Operaciones de `CUL-UC-001` y `CUL-UC-002` referenciadas por OpenAPI | `src/modulos/contexto-productivo/presentacion/http/`, `src/modulos/contexto-productivo/contexto-productivo.module.ts`, `src/app.module.ts`, `src/modulos/contexto-productivo/pruebas/contrato/` | Contrato, autenticación, códigos, paginación, idempotencia y ETag |
| T06 | Verificar el recorrido completo | Aceptación | `@CUL-UC-001`, `@CUL-UC-002` y cambios aceptados de §7 | `src/modulos/contexto-productivo/pruebas/aceptacion/`, `test/contexto-productivo-catalogos.e2e-spec.ts` | Seis escenarios vigentes y los nuevos escenarios que se aprueben |

## 6. Verificación y riesgos

| Control | Evidencia esperada | Comando previsto |
|---|---|---|
| Documentación | Referencias y estados | `python tools/spec_lint.py doc` |
| Calidad | Instalación reproducible, formato, lint, tipos y compilación | `yarn install --immutable`, `yarn format:check`, `yarn lint`, `yarn typecheck`, `yarn build` |
| Reglas, permisos y cobertura | Reglas, casos límite y matriz | `yarn test`, `yarn test:modulo -- contexto-productivo`, `yarn test:coverage` |
| Arquitectura | Puertos, composición y aislamiento | `yarn test:arquitectura` |
| Integración | Migraciones, unicidad, publicación concurrente y referencias históricas | `yarn test:integracion` |
| Contrato y aceptación | OpenAPI, códigos, autorización y escenarios | `yarn test:contratos`, `yarn test:e2e` |

- Probar duplicados concurrentes, cambios de un borrador con la misma versión HTTP, dos publicaciones simultáneas, y lectura histórica tras publicar un nuevo padre o inactivar una versión. Verificar que una publicación fallida no deje campos ni auditoría de éxito parciales.
- Probar aislamiento entre Empresas y Lotes, accesos por cabeceras de actor falsificadas, Cultivo sin habilitar, unidad ausente o ajena al catálogo y proveedor indisponible.
- **Migración y rollback:** migraciones aditivas y base aislada. Con Perfiles utilizados, retirar las rutas afectadas y conservar datos y referencias. Ensayar reversión de esquema sobre una base descartable.

## 7. Cambios de especificación

| Fuente | Hallazgo | Propuesta IA para revisión |
|---|---|---|
| `CUL-Q-015`, `CUL-BR-003`, `CUL-UC-002` | La habilitación previa está aprobada. Falta un caso de uso y un modelo que permitan al Administrador registrarla. La respuesta menciona también Variedades. | Especificar la habilitación como operación separada del Administrador y su vínculo en CUL. Confirmar si habilitar un Cultivo habilita también sus Variedades o si se seleccionan por separado. Incorporar esa especificación al alcance de la tarea que corresponda. |
| `CUL-BR-004`, `CUL-BR-005`, `CUL-UC-002` | La regla de precedencia y la excepción combinada del caso de uso tienen códigos distintos. | Usar `CUL_PERFIL_INCOMPATIBLE` para precedencia o herencia y `CUL_CAMPO_PERFIL_INVALIDO` para la definición de campo. Ajustar la tabla de excepciones en el caso de uso dueño. |
| `CUL-REQ-002`, `CUL-UC-002`, `CUL-BR-006`, `CUL-BR-022` | El requerimiento contempla inactivar Perfiles y el flujo principal describe guardar borrador o publicar. | Documentar la inactivación como transición de disponibilidad de la versión publicada, conservando contenido y referencias. Confirmar en el caso de uso la consulta individual de mantenimiento y las excepciones de concurrencia. |

El contrato identifica las operaciones afectadas como propuestas. El Ingeniero debe aprobar las precisiones y dejar actualizada la especificación dueña antes de ejecutar esas partes. La futura operación de habilitación no tiene ruta en este contrato hasta que se especifique.

**Aprobación del plan:** aprobado por el Ingeniero.

## 8. Registro de ejecución

| Tarea | Commit | Estado | Notas o desviaciones |
|---|---|---|---|
| T01 | En rama | Completada | Modelado de Cultivo, Variedad, PerfilCultivo y CampoPerfil con invariantes |
| T02 | En rama | Completada | Casos de uso de catálogo global CUL-UC-001 (cultivos y variedades) |
| T03 | En rama | Completada | Casos de uso de perfiles CUL-UC-002 (crear borrador, versionar, publicar, inactivar) |
| T04 | En rama | Completada | Migración TypeORM y repositorios PostgreSQL con soporte de concurrencia y herencia |
| T05 | En rama | Completada | Controlador HTTP en /api/v1/cultivos, DTOs, módulo NestJS y filtro de errores RFC 9457 |
| T06 | En rama | Completada | 10 pruebas e2e de aceptación cubriendo flujos completos de catálogo y perfiles |

## 9. Evidencia

| Control | Resultado | Comando ejecutado | Observado |
|---|---|---|---|
| Formato | OK | `yarn.cmd format:check` | All matched files use Prettier code style! |
| Linter | OK | `yarn.cmd lint` | 0 errores |
| Tipos | OK | `yarn.cmd typecheck` | 0 errores |
| Compilación | OK | `yarn.cmd build` | Compilación exitosa |
| Pruebas unitarias e integración | OK | `yarn.cmd test` | 18 suites pasadas, 133 pruebas pasadas |
| Arquitectura | OK | `yarn.cmd test:arquitectura` | 0 violaciones en 167 módulos |
| Pruebas de aceptación e2e | OK | `yarn.cmd test:e2e` | 5 suites pasadas, 53 pruebas pasadas |
| Linter de documentación | OK | `python tools/spec_lint.py doc` | 683 IDs, 0 errores, 0 avisos |

## 10. Cierre

- **Conformidad:** pendiente de verificación independiente.
- **Ítems que pasan a Implementado:** pendiente.
- **Tarea que pasa a Completada:** `CUL-TASK-002` al cerrar el plan.
- **Revisor y estado final:** pendientes.
