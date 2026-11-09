---
type: plan
id: PLAN-PER-0001
title: "Administrar Empleados e información laboral"
module: "PER"
task: PER-TASK-002
status: Bloqueado
mode: estandar
created: 2026-11-09
approved_by: null
---

# PLAN-PER-0001 — Administrar Empleados e información laboral

## 1. Objetivo y alcance

- **Tarea y épica:** `PER-TASK-002`, `EPIC-005`.
- **Implementa:** `PER-UC-001` y `PER-UC-003` sobre `PER-ENT-001` a `PER-ENT-008`, con las precisiones de §7.
- **Resultado observable:** un Administrador de Empresa puede mantener fichas y períodos laborales, corregir datos opcionales y administrar restricciones e indisponibilidades. El [contrato OpenAPI](../contratos/openapi.yaml) separa la edición de datos, los cambios de estado y la consulta.
- **Límites:** la coordinación de inactivación laboral usa `PER-DEP-003`. La habilitación de Cuentas de Empresa pertenece a `PER-TASK-003`. La consulta operativa del Capataz requiere `PER-UC-013`; la validación y el registro de asistencia se concretan en `PER-TASK-005`. Cuadrillas, remuneración y almacenamiento de binarios pertenecen a otras entregas.

## 2. Preparación

- [x] Los casos, reglas y entidades de base figuran en estado `Aprobado`. Las preguntas del alcance tienen respuesta.
- [ ] Resolver las precisiones controladas de §7.
- [ ] Acordar y verificar `PER-DEP-001`, `PER-DEP-002`, `PER-DEP-003` y `PER-DEP-004` con proveedores reales o dobles limitados a pruebas. Resolver `ADR-0011`.
- [ ] Confirmar el contexto autenticado de Cuenta de Empresa para el Administrador. La integración de inactivación requiere la capacidad real de ACC aunque el alta de accesos se planifique por separado.
- [ ] Aprobar el contrato y el plan. Las rutas operativas se habilitan cuando sus proveedores y controles están verificados.

**Estado para revisión:** propuesta completa para discutir. La ejecución queda bloqueada hasta resolver las decisiones y condiciones anteriores.

## 3. Contexto actual

- **[H]** Existe una base NestJS/TypeORM con migraciones y herramientas de calidad. `src/app.module.ts` y `src/infraestructura/persistencia/data-source.ts` son los puntos de integración. PostgreSQL/PostGIS local se ejecuta de forma nativa conforme a convenciones.md §1.
- **[H]** No se encontró código de Personal, Suscripciones ni Archivos en el árbol revisado. EMP ofrece el puerto de referencia de Empresa.
- **[H]** `PLAN-ACC-0001` está en verificación y cubre plataforma y soporte. El controlador HTTP revisado usa cabeceras de actor. La autenticación de Cuentas de Empresa y la revocación laboral requieren sus proveedores acordados.
- **[H]** `ADR-0009` está aceptado para la asignación comercial de alta de EMP. `PER-DEP-002` requiere además el límite vigente de Empleados activos. Aplican `ADR-0002`, `ADR-0003`, `ADR-0005`, `ADR-0007` y `ADR-0008`.

## 4. Decisiones para revisión

### D-01 — Contexto y archivos privados

| Dependencia | Contrato mínimo propuesto |
|---|---|
| `PER-DEP-001` | Resolver la identidad y vigencia de Empresa por el puerto público de EMP. Acordar en composición cómo se obtiene la fecha civil local cuando el alta omite la fecha de ingreso. |
| `PER-DEP-003` | Recibir identidad de Cuenta, Empresa, Sesión y permiso vigentes de ACC. Invocar un puerto público de suspensión y revocación cuando corresponda. Distinguir expresamente ficha sin acceso, revocación realizada y falla. |
| `PER-DEP-004` | Validar referencia a Archivo, pertenencia a la Empresa y autorización para vincularlo. PER guarda identificadores. La descarga se autoriza bajo ARC. |

Obtener `empresaId` del contexto autenticado y aplicarlo a toda lectura y escritura. Un recurso ajeno solicitado solo por ID se trata como ausente dentro del alcance. Una referencia relacionada inválida se rechaza sin revelar su dueño. La consulta administrativa de ficha requiere autorización. La respuesta del listado contiene datos mínimos y las respuestas privadas se sirven sin caché compartida ni contenido sensible en logs.

**Decisión del Ingeniero:** pendiente. **Origen:** `PER-BR-001`, `PER-BR-021`, `PER-DEP-001`, `PER-DEP-003`, `PER-DEP-004`, propuesta técnica IA.

### D-02 — Ciclo laboral, cupo y revocación

Evaluar `ADR-0011`. El cupo de `PER-DEP-002` se valida al crear o reactivar y se protege frente a concurrencia. Una falla o ausencia del proveedor no se interpreta como cupo disponible. El período laboral y el estado se escriben juntos. Al inactivar, ACC participa mediante su puerto cuando la ficha tiene acceso. Una falla devuelve la excepción de `PER-BR-008` y conserva la ficha, el período, la Cuenta y las Sesiones en su estado anterior.

Propuesta de integración aislada: usar un proveedor comercial de prueba con cupos explícitos y un doble de ACC que pueda fallar dentro de la unidad de trabajo. Una entrega operativa necesita el límite comercial vigente y el proveedor real de revocación. Conservar los motivos y fechas de transición en el período o en el registro de auditoría correspondiente. La reactivación abre un período y mantiene la separación de `PER-BR-008`.

**Decisión del Ingeniero:** pendiente. **Origen:** `PER-BR-005`, `PER-BR-006`, `PER-BR-008`, `PER-DEP-002`, `PER-Q-035`, propuesta técnica IA.

### D-03 — Ficha, datos auxiliares y concurrencia

- Normalizar documento según `PER-Q-039` y proteger su unicidad por Empresa, tipo y número normalizado en persistencia. La modificación de datos valida las referencias en la misma Empresa y conserva los registros históricos.
- La propuesta HTTP separa la ficha principal de la edición de contactos, especialidades y licencias. La edición auxiliar informa altas o cambios explícitos por ID. Omitir un elemento conserva el dato previo. La baja o cierre de elementos opcionales requiere la semántica que se acuerde en §7.
- La fecha de ingreso inicial puede indicarse. Cuando se omite, se propone obtener la fecha civil de Empresa por un proveedor acordado. Inactivación y reactivación reciben fecha y motivo para registrar el cambio según `PER-Q-007`.
- Validar rangos de vigencia y permitir evidencias donde el modelo las prevé. El contrato separa Restricción e Indisponibilidad. La anulación conserva la historia y no crea ni corrige registros de asistencia desde esta entrega.
- Las escrituras sensibles usan ETag e `If-Match`. Aplicar la idempotencia de convenciones.md §3.4 y conservar escritura, historial y resultado confirmado juntos cuando corresponda. Las ediciones de datos auxiliares, restricciones o indisponibilidades verifican y actualizan la versión de la ficha que las contiene.

**Decisión del Ingeniero:** pendiente de revisión del contrato. **Origen:** `PER-Q-005`, `PER-Q-007`, `PER-Q-037` a `PER-Q-039`, `PER-BR-004`, `PER-BR-005`, `PER-BR-021`, `PER-BR-022`, propuesta técnica IA.

## 5. Pasos de implementación

| ID | Resultado | Capa | Implementa | Archivos previstos | Verificación |
|---|---|---|---|---|---|
| T01 | Modelar ficha, período y datos personales y laborales | Dominio | `PER-ENT-001` a `PER-ENT-008`, `PER-BR-001` a `PER-BR-006`, `PER-BR-021`, `PER-BR-022` | `src/modulos/personal/dominio/`, `src/modulos/personal/pruebas/dominio/` | Datos mínimos, períodos, reglas de disponibilidad y límites |
| T02 | Registrar, consultar y modificar fichas y datos auxiliares | Aplicación | `PER-UC-001`, `PER-DEP-001`, `PER-DEP-002`, `PER-DEP-004` | `src/modulos/personal/aplicacion/comandos/`, `src/modulos/personal/aplicacion/consultas/`, `src/modulos/personal/aplicacion/puertos/`, `src/modulos/personal/pruebas/aplicacion/` | Permisos, Empresa, unicidad, cupo, información mínima y archivos |
| T03 | Inactivar y reactivar con historia y coordinación de acceso | Aplicación | `PER-UC-001`, rama A1 de `PER-UC-002`, `PER-BR-008` | `src/modulos/personal/aplicacion/comandos/`, `src/modulos/personal/aplicacion/puertos/`, `src/modulos/personal/pruebas/aplicacion/` | Reingreso, revocación, falta de proveedor y rollback |
| T04 | Mantener restricciones e indisponibilidades | Aplicación | `PER-UC-003`, `PER-BR-021`, `PER-BR-022` | `src/modulos/personal/aplicacion/comandos/`, `src/modulos/personal/pruebas/aplicacion/` | Vigencias, anulación, evidencia y rechazo de rol no autorizado |
| T05 | Persistir los registros y conectar dependencias aprobadas | Infraestructura | `PER-ENT-001` a `PER-ENT-008`, `ADR-0011` | `migraciones/personal/`, `src/modulos/personal/infraestructura/`, `src/infraestructura/persistencia/data-source.ts`, `src/modulos/personal/pruebas/integracion/` | Migración real, unicidad, último cupo, versión y unidad de trabajo |
| T06 | Exponer las operaciones y verificar la entrega | Presentación y aceptación | Operaciones OpenAPI, `@PER-UC-001`, `@PER-UC-003`, `@PER-UC-002 @AC-02` como integración | `src/modulos/personal/presentacion/http/`, `src/modulos/personal/personal.module.ts`, `src/app.module.ts`, `src/modulos/personal/pruebas/`, `test/personal-empleados.e2e-spec.ts` | Siete escenarios vigentes de los UC del alcance, con la frontera de consulta del Capataz resuelta según §7 y revocación integrada |

## 6. Verificación y riesgos

| Control | Evidencia esperada | Comando previsto |
|---|---|---|
| Documentación | Referencias, procedencia y estados | `python tools/spec_lint.py doc` |
| Calidad | Formato, lint, tipos y compilación | `yarn format:check`, `yarn lint`, `yarn typecheck`, `yarn build` |
| Reglas y cobertura | Límites, permisos e invariantes | `yarn test`, `yarn test:modulo -- personal`, `yarn test:coverage` |
| Arquitectura | Dependencias por puertos y límites de capa | `yarn test:arquitectura` |
| Integración | PostgreSQL nativo aislado, cupos y revocación atómica | `yarn test:integracion` |
| Contrato y aceptación | OpenAPI, errores, aislamiento, privacidad y escenarios etiquetados | `yarn test:contratos`, `yarn test:e2e` |

- Probar alta simultánea con el último cupo, documentos equivalentes en la misma Empresa y en Empresas distintas, reactivación concurrente, inactivación con y sin Cuenta y rollback ante falla de ACC o de persistencia. Con ACC real, comprobar que la revocación impide reutilizar una Sesión y que emitir o renovar una Sesión no gana una carrera contra una suspensión confirmada.
- Probar acceso con cabeceras falsificadas, autorización cruzada, Archivo no autorizado, historial conservado y minimización del listado. Los registros de auditoría contienen referencias y resultados sin copiar teléfonos, diagnósticos ni evidencias.
- **Migración y rollback:** migraciones aditivas, sin alterar tablas de otros módulos. Ensayar reversión en una base aislada. Si hay fichas y períodos en uso, retirar la exposición y preservar las referencias al revertir.

## 7. Cambios de especificación

| Origen | Precisión pendiente | Propuesta IA para revisión |
|---|---|---|
| `PER-Q-005`, `PER-Q-037`, `PER-ENT-001`, `PER-DEP-004` | La respuesta inicial incluye teléfono alternativo. El modelo no lo representa. La dependencia de ARC menciona CV sin definir su vínculo en la ficha. | Confirmar cuáles pertenecen a esta entrega. Mantenerlos fuera de los campos del contrato hasta decidir su representación y autorización. |
| `PER-UC-001`, `PER-BR-008`, `PER-TASK-003` | Inactivar una ficha con acceso requiere la rama de revocación de otro caso de uso. | Acordar la porción de integración que se ejecutará con este plan. Mantener la creación y habilitación de Cuentas en su tarea propia. |
| `PER-UC-003`, `PER-UC-013`, `PER-TASK-008` | `@PER-UC-003 @AC-02` observa la consulta del Capataz por una capacidad de otra tarea. El flujo principal menciona evidencia, mientras el modelo de Restricción no tiene un Archivo asociado. | Verificar la privacidad del Capataz con el consumidor autorizado o acordar cómo registrar esa evidencia de aceptación hasta disponer de la consulta. Vincular evidencias según los campos aprobados del modelo. Precisar el criterio verificable para el mensaje operativo sin diagnóstico. |
| `PER-REQ-002`, `PER-ENT-003` a `PER-ENT-006`, `PER-Q-037` | Hay datos estructurados y un catálogo de Especialidades, con operaciones de mantenimiento y baja sin detalle. | Confirmar la consulta y el alta administrativa del catálogo dentro de esta entrega. Definir el retiro o cierre de contactos, especialidades y licencias sin afectar los antecedentes. |

El plan y el contrato permanecen como propuesta. Las precisiones aceptadas se incorporan a los archivos dueños antes de implementar las partes que cambien la especificación.

**Aprobación del plan:** pendiente de las condiciones de §2.

## 8. Registro de ejecución

| Tarea | Commit | Estado | Notas o desviaciones |
|---|---|---|---|

## 9. Evidencia

| Control | Resultado | Comando ejecutado | Observado |
|---|---|---|---|

## 10. Cierre

- **Conformidad:** pendiente de verificación independiente.
- **Ítems que pasan a Implementado:** pendiente.
- **Tarea que pasa a Completada:** `PER-TASK-002` al cerrar el plan.
- **Revisor y estado final:** pendientes.
