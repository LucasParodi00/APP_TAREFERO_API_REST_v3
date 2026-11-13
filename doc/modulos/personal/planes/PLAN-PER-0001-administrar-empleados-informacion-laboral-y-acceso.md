---
type: plan
id: PLAN-PER-0001
title: "Administrar Empleados, información laboral y acceso"
module: "PER"
task: PER-TASK-002
status: En ejecución
mode: mayor
created: 2026-11-13
approved_by: "Parodi Lucas — 2026-11-13"
---

# PLAN-PER-0001 — Administrar Empleados, información laboral y acceso

## 1. Objetivo y alcance

- **Tarea:** `PER-TASK-002`.
- **Implementa:** `PER-UC-001`, `PER-UC-002`, `PER-UC-003`.
- **Resultado observable:** un Administrador autenticado puede registrar, consultar, listar, modificar, inactivar y reactivar Empleados de su Empresa; mantener sus datos personales y laborales aprobados; habilitar o revocar su acceso mediante ACC; y crear, modificar, consultar y anular restricciones operativas e indisponibilidades con trazabilidad completa. Las operaciones respetan cupos, aislamiento multiempresa, concurrencia optimista, privacidad y conservación histórica.
- **Entidades vigentes incluidas:** `PER-ENT-001`, `PER-ENT-002`, `PER-ENT-003`, `PER-ENT-006`, `PER-ENT-007`, `PER-ENT-008`.
- **No incluye:** `PER-ENT-004` ni `PER-ENT-005`, retiradas; Cuadrillas; asistencia; consulta propia; remuneraciones; contexto público general de `PER-UC-013`; contenido binario de archivos; reglas comerciales de Suscripciones; credenciales, roles, Cuentas de Empresa o Sesiones persistidas fuera de ACC.
- **Contrato HTTP propuesto:** `doc/modulos/personal/contratos/openapi.yaml`.

## 2. Preparación

- [x] `PER-TASK-002` está `Lista` y su alcance consolidado comprende `PER-UC-001` a `PER-UC-003`.
- [x] Los casos de uso, requerimientos, reglas y entidades vigentes del alcance están `Aprobado`.
- [x] No existen preguntas bloqueantes abiertas; `PER-Q-041`, `PER-Q-042` y `PER-Q-043` están respondidas.
- [x] `PER-DEP-001` dispone del contrato público mínimo de EMP.
- [x] `PER-DEP-002`, `PER-DEP-003` y `PER-DEP-004` se concretan mediante puertos y decisiones de §4, sin acceso directo a tablas ajenas.
- [x] Las capacidades existentes de `src/comun` fueron identificadas para reutilización obligatoria.
- [x] Las decisiones D-01 a D-07 y los ADR asociados fueron aprobados por el Ingeniero el 2026-11-13.
- [ ] La capacidad transversal persistente de idempotencia y la coordinación transaccional de D-03 están disponibles antes de Fase 3.

**Bloqueos del plan:** ninguno. **Condiciones para ejecutar:** cierre de los prerrequisitos transversales de idempotencia y transacción antes de las tareas que los consumen.

## 3. Contexto actual

- [H] No existe código ni migración de Personal — `src/modulos/personal/` y `migraciones/personal/` no existen.
- [H] No existía contrato HTTP de Personal; el OpenAPI propuesto se crea con este plan — `doc/modulos/personal/contratos/openapi.yaml`.
- [H] EMP publica `ResolvedorEmpresaPublico` con identidad y estado, suficiente para validar `PER-DEP-001` — `src/modulos/empresas/aplicacion/puertos/resolvedor-empresa-publico.puerto.ts`.
- [H] ACC implementa habilitación de cuentas, búsqueda por `empleadoId`, suspensión y revocación de Sesiones, pero no publica todavía una frontera interna atómica orientada a PER — `src/modulos/identidad-acceso/aplicacion/comandos/`, `src/modulos/identidad-acceso/dominio/repositorios/`.
- [H] ACC usa hoy `VerificadorEmpleadoProvisional`; debe sustituirse por un adaptador al contrato público de PER sin leer sus tablas — `src/modulos/identidad-acceso/infraestructura/adaptadores/verificador-empleado-provisional.ts`.
- [H] SUS y ARC todavía no tienen implementación ni contratos ejecutables en `src/modulos/`; `PER-DEP-002` y `PER-DEP-004` requieren adaptadores controlados.
- [H] `src/comun` publica identificadores UUID v7, fechas, reloj, contexto autenticado, paginación, decoradores HTTP y filtro RFC 9457 mediante índices por capa — `src/comun/`.
- [H] `src/comun` extrae `Idempotency-Key`, pero no persiste resultados ni coordina la escritura funcional en una transacción — `src/comun/presentacion/decoradores/idempotency-key.decorador.ts`.
- [H] `AppModule` no compone todavía los módulos de negocio ni una conexión TypeORM global — `src/app.module.ts`.
- [H] El árbol de trabajo contiene cambios ajenos de Territorio; Fase 3 debe preservarlos y detenerse ante solapamientos incompatibles — `src/modulos/territorio/`, `migraciones/territorio/`.

## 4. Decisiones

### D-01 — Límites de agregados laborales

| Opción | A favor | En contra |
|---|---|---|
| A: `Empleado` raíz con Períodos laborales, Contactos de emergencia y Licencias; Restricción operativa e Indisponibilidad como raíces independientes | Protege el ciclo laboral en una transacción y permite concurrencia independiente para novedades | Exige repositorios y versiones separados |
| B: un único agregado con toda la ficha y todas las novedades | Frontera conceptual única | Carga colecciones históricas crecientes y aumenta conflictos no relacionados |

- **Recomendación:** A.
- **Decisión del ingeniero:** Opción A, aprobada el 2026-11-13.
- **ADR:** `ADR-PER-0001` (`Aceptado`).

### D-02 — Actualización de contactos y licencias

| Opción | A favor | En contra |
|---|---|---|
| A: `PATCH` de Empleado recibe, cuando se informan, las colecciones completas deseadas; omitirlas no las modifica | Operación atómica y contrato compacto; evita endpoints sin caso de uso propio | El cliente debe enviar la colección completa para cambiar un elemento |
| B: CRUD HTTP individual por cada entidad hija | Cambios pequeños por recurso | Multiplica operaciones y expone un ciclo de vida no definido por la especificación |

- **Recomendación:** A. Los elementos con `id` conservan identidad; sin `id` se crean; los omitidos se retiran de la composición actual con auditoría técnica. No se borra la ficha ni sus Períodos laborales.
- **Decisión del ingeniero:** Opción A, aprobada el 2026-11-13.
- **ADR:** No; decisión contractual local y reversible antes de publicar la API.

### D-03 — Coordinación PER–ACC y atomicidad de la inactivación

| Opción | A favor | En contra |
|---|---|---|
| A: coordinación síncrona mediante puertos públicos y una unidad transaccional compartida en la composición, sin importar repositorios ni entidades ajenas | Cumple `PER-BR-008`, mantiene dueños de datos y permite rollback conjunto en el monolito | Requiere una capacidad transversal y una frontera pública nueva en ACC |
| B: suspender y luego compensar si falla PER | Menor infraestructura inicial | Puede dejar efectos parciales si también falla la compensación |
| C: evento asíncrono | Reduce acoplamiento temporal | No satisface el rechazo inmediato y sin efectos parciales aprobado |

- **Recomendación:** A. PER orquesta el flujo funcional; ACC conserva Cuenta y Sesiones; la composición proporciona la transacción sin permitir acceso cruzado a tablas.
- **Decisión del ingeniero:** Opción A, aprobada el 2026-11-13.
- **ADR:** `ADR-0014` (`Aceptado`, transversal).

### D-04 — Cupo de Empleados mientras SUS no está implementado

| Opción | A favor | En contra |
|---|---|---|
| A: puerto `VerificadorCupoEmpleados` con adaptador provisional configurable y explícito; dobles deterministas en pruebas; reemplazo obligatorio por SUS | Permite desarrollar y probar `PER-BR-006` sin acoplar PER | La configuración provisional debe gobernarse para no convertirse en política comercial permanente |
| B: permitir siempre sin cupo | Máxima disponibilidad | Omite `PER-BR-006` |
| C: rechazar siempre hasta implementar SUS | Cumple fail-closed | Impide usar el alta y la reactivación durante el desarrollo incremental |

- **Recomendación:** A. El valor provisional es finito, proviene de configuración de composición y queda señalado como deuda de integración; no se codifica un Plan de suscripción en PER.
- **Decisión del ingeniero:** Opción A, aprobada el 2026-11-13.
- **ADR:** No; decisión provisional local, trazada por `PER-DEP-002`.

### D-05 — Referencias de archivos mientras ARC no está implementado

| Opción | A favor | En contra |
|---|---|---|
| A: puerto `ValidadorArchivoPrivado`; sin `archivoId` la operación continúa y, si se informa, falla de forma cerrada hasta disponer del adaptador real | Evita referencias cruzadas o inexistentes y permite el resto del flujo | Evidencias no estarán disponibles antes de ARC |
| B: aceptar cualquier UUID opaco | Permite cargar referencias inmediatamente | Puede persistir referencias inexistentes o de otra Empresa |

- **Recomendación:** A. Las pruebas usan dobles para referencias válidas, inexistentes y de otra Empresa.
- **Decisión del ingeniero:** Opción A, aprobada el 2026-11-13.
- **ADR:** No; aplica propiedad de datos y aislamiento ya aprobados.

### D-06 — Consultas, orden y concurrencia

| Opción | A favor | En contra |
|---|---|---|
| A: comandos mediante repositorios de agregados; listados mediante puertos de consulta TypeORM; orden permitido `apellido`, `nombre`, `numeroDocumento`, `creadoEn`, con `id` como desempate; `If-Match` para cambios | Reutiliza `src/comun`, pagina en base de datos y reduce conflictos | Requiere contratos separados de escritura y lectura |
| B: cargar agregados y paginar en memoria | Menos contratos | Viola `convenciones.md` §3.2 y escala mal |

- **Recomendación:** A. Orden predeterminado: `apellido:asc`, `nombre:asc`, `id:asc`.
- **Decisión del ingeniero:** Opción A, aprobada el 2026-11-13.
- **ADR:** No; aplica arquitectura y convenciones vigentes.

### D-07 — Idempotencia de escrituras repetibles

| Opción | A favor | En contra |
|---|---|---|
| A: consumir una capacidad transversal persistente que coordine clave, actor, Empresa, operación, huella y resultado con la escritura funcional | Cumple `convenciones.md` §3.4 y evita soluciones distintas por módulo | Es prerrequisito técnico todavía no disponible |
| B: guardar claves dentro de PER | Permite avanzar localmente | Duplica una convención global y viola `arquitectura.md` §6.1 |
| C: aceptar la cabecera sin persistir | Menos trabajo | No ofrece idempotencia real |

- **Recomendación:** A. Crear/cerrar el prerrequisito CMN antes de T05.
- **Decisión del ingeniero:** Opción A, aprobada el 2026-11-13.
- **ADR:** No se crea otro ADR; `convenciones.md` §3.4 y `ADR-0013` ya determinan que la capacidad es transversal.

## 5. Tareas

| ID | Tarea | Capa | Implementa | Archivos previstos | Verificación |
|---|---|---|---|---|---|
| T01 | Implementar enumeraciones, objetos de valor y errores laborales reutilizando identificadores y fechas comunes | Dominio | `PER-BR-001` a `PER-BR-004`, `PER-BR-021`, `PER-BR-022`, `PER-BR-028` | `src/modulos/personal/dominio/enumeraciones/`, `objetos-valor/`, `errores/` | Unitarias con cada ejemplo de BR, límites, normalización de documento y privacidad |
| T02 | Implementar agregado `Empleado` con Períodos laborales, Contactos de emergencia y Licencias | Dominio | `PER-ENT-001`, `PER-ENT-002`, `PER-ENT-003`, `PER-ENT-006`, `PER-BR-002` a `PER-BR-005` | `dominio/agregados/empleado.ts`, `dominio/entidades/` | Alta ACTIVO, modificación, inactivación/reactivación, reingreso, colecciones y transiciones inválidas |
| T03 | Implementar agregados `RestriccionOperativa` e `Indisponibilidad` con anulación auditada | Dominio | `PER-ENT-007`, `PER-ENT-008`, `PER-BR-021`, `PER-BR-022`, `PER-BR-028` | `dominio/agregados/` | Vigencias, privacidad, catálogos, anulación con actor/fecha/motivo y conservación histórica |
| T04 | Definir repositorios, consultas, puertos de EMP/SUS/ACC/ARC, modelos de lectura y contrato público mínimo para que ACC valide Empleados | Dominio / Aplicación | `PER-DEP-001` a `PER-DEP-004`, `ADR-0010`, D-03 a D-06 | `dominio/repositorios/`, `aplicacion/puertos/`, `aplicacion/modelos-lectura/` | Compilación estricta; ningún puerto importa NestJS, TypeORM ni internos de otro módulo |
| T05 | Implementar registro, consulta, listado y modificación de Empleados | Aplicación | `PER-UC-001`, `PER-BR-001` a `PER-BR-006` | `aplicacion/comandos/`, `aplicacion/consultas/` | Permiso `PER-UC-001`, tenant, cupo, duplicidad, paginación, orden, idempotencia y concurrencia |
| T06 | Implementar inactivación y reactivación laboral coordinadas con ACC | Aplicación | `PER-UC-001`, `PER-UC-002`, `PER-BR-005`, `PER-BR-006`, `PER-BR-008`, D-03 | `aplicacion/comandos/inactivar-empleado.caso-de-uso.ts`, `reactivar-empleado.caso-de-uso.ts` | Rollback conjunto ante falla de ACC, revocación de Sesiones y reactivación sin acceso automático |
| T07 | Implementar habilitación y revocación explícita de acceso | Aplicación | `PER-UC-002`, `PER-BR-007`, `PER-BR-008` | `aplicacion/comandos/habilitar-acceso-empleado.caso-de-uso.ts`, `revocar-acceso-empleado.caso-de-uso.ts` | Ficha activa, permisos, misma Empresa, propagación segura de resultados y ausencia de credenciales persistidas en PER |
| T08 | Implementar administración y consulta administrativa de restricciones e indisponibilidades | Aplicación | `PER-UC-003`, `PER-BR-004`, `PER-BR-021`, `PER-BR-022`, `PER-BR-028` | `aplicacion/comandos/`, `aplicacion/consultas/` | Crear, modificar, listar y anular; permiso por UC; archivo válido; historia y privacidad |
| T09 | Crear entidades TypeORM, mapeadores y migración inicial de Personal | Infraestructura | `PER-ENT-001` a `PER-ENT-003`, `PER-ENT-006` a `PER-ENT-008`; índices del modelo | `infraestructura/persistencia/`, `migraciones/personal/` | Migración real y rollback; unicidad por Empresa/documento; versiones; FKs solo internas; aislamiento por `empresa_id`; round-trip |
| T10 | Implementar repositorios y consultas TypeORM con paginación, filtros, bloqueo de cupo y concurrencia | Infraestructura | `PER-UC-001`, `PER-UC-003`, D-06 | `infraestructura/persistencia/` | Integración PostgreSQL: filtros tenant antes de `LIMIT/OFFSET`, unicidad concurrente, total en BD y versión optimista |
| T11 | Implementar adaptadores de EMP, SUS, ARC y ACC y la coordinación transaccional aprobada | Infraestructura / Composición | `PER-DEP-001` a `PER-DEP-004`, D-03 a D-05 | `infraestructura/adaptadores/`, frontera pública de ACC, composición aprobada | Contratos con dobles y módulos reales; ningún acceso directo a tablas ajenas; falla técnica distinta de ausencia; rollback atómico |
| T12 | Implementar DTOs y controladores exactamente según `operationId`, reutilizando contexto, paginación, cabeceras y filtro común | Presentación | OpenAPI; `PER-UC-001` a `PER-UC-003` | `presentacion/controladores/`, `presentacion/dtos/` | Pruebas HTTP de estados, cabeceras, ETag, RFC 9457, campos no admitidos y matriz de permisos |
| T13 | Componer `PersonalModule`, registrar migraciones y reemplazar el verificador provisional de ACC por el contrato público de PER | Composición | `PER-DEP-003`, `ADR-0010`, D-03 | `src/modulos/personal/personal.module.ts`, composición global y ACC | Inicio real, resolución DI, ACC valida Empleado ACTIVO de la misma Empresa y no aparecen ciclos de dependencias |
| T14 | Implementar aceptación y regresión completa del alcance | Aceptación / Calidad | `@PER-UC-001` a `@PER-UC-003`; ejemplos de BR del alcance | `src/modulos/personal/pruebas/` | Un test por escenario aprobado; permitido/denegado por actor; dos Empresas; integraciones y contrato |

El orden es obligatorio. T05 no comienza hasta que idempotencia esté disponible; T06, T07, T11 y T13 no comienzan hasta que `ADR-0014` y la frontera PER–ACC estén aprobados. T12 implementa el contrato, no redefine campos ni reglas mediante decoradores.

## 6. Verificación y riesgos

| Control | Cubre | Comando |
|---|---|---|
| Formato | Archivos modificados | `yarn format:check` |
| Lint | Convenciones TypeScript | `yarn lint` |
| Tipos | TypeScript estricto | `yarn typecheck` |
| Build | Composición NestJS | `yarn build` |
| Unitarias globales | Regresión | `yarn test` |
| Módulo | Dominio, Aplicación y aceptación de PER | `yarn test:modulo -- personal` |
| Cobertura | Umbrales globales y de Dominio/Aplicación | `yarn test:coverage` |
| Arquitectura | Capas, módulos y ciclos | `yarn test:arquitectura` |
| Integración | PostgreSQL, migración, repositorios e integraciones | `yarn test:integracion -- personal` |
| Contrato | OpenAPI de Personal | `yarn test:contratos -- personal` |
| HTTP extremo a extremo | Operaciones y composición | `yarn test:e2e -- personal` |

- **Migración de datos:** no existen tablas ni datos previos de PER. La migración crea únicamente `empleados`, `periodos_laborales`, `contactos_emergencia`, `licencias_empleado`, `restricciones_operativas` e `indisponibilidades`, además de índices y restricciones internas.
- **Rollback:** antes de datos productivos, `down` elimina únicamente objetos propios de PER en orden inverso. Con datos, se usa migración compensatoria o restauración; nunca borrado improvisado.
- **Riesgo — aislamiento:** todos los repositorios y consultas filtran `empresa_id`; referencias de Empleado, Cuenta y Archivo se validan en la misma Empresa; pruebas negativas usan al menos dos Empresas.
- **Riesgo — cupo concurrente:** alta y reactivación deben serializar o demostrar una estrategia atómica; un `contar` seguido de `guardar` no protege `PER-BR-006`.
- **Riesgo — atomicidad ACC:** no se acepta una implementación con compensación no garantizada ni imports de repositorios ACC desde PER.
- **Riesgo — ciclo PER–ACC:** la composición aprobada debe permitir llamadas en ambos sentidos sin ciclos de dependencias funcionales o de archivos.
- **Riesgo — privacidad:** respuestas administrativas no se reutilizan para Capataz; el contexto mínimo de `PER-UC-013` queda fuera de este plan.
- **Riesgo — referencias ARC:** ningún `archivoId` se acepta sin validación tenant; el binario nunca entra en PER.
- **Riesgo — idempotencia parcial:** extraer `Idempotency-Key` sin persistir huella y resultado no satisface la convención.
- **Riesgo — archivos compartidos:** Fase 3 inspecciona el diff antes de editar composición global y preserva los cambios concurrentes de Territorio.

## 7. Cambios de especificación

| ID | Cambio | Motivo |
|---|---|---|
| Ninguno | | La planificación implementa los ítems aprobados sin cambiar reglas, requerimientos, casos de uso ni entidades. |

**Aprobación del plan:** Aprobado por Parodi Lucas el 2026-11-13. D-01 a D-07: opción A. Listo para Fase 3 cuando estén disponibles los prerrequisitos técnicos indicados en §2 y §5.

---

## 8. Registro de ejecución

| Tarea | Commit | Estado | Notas o desviaciones |
|---|---|---|---|
| T01 | Pendiente de commit | Completada | Implementadas enumeraciones, objetos de valor y errores de dominio de Personal con 32 pruebas unitarias pasando. |
| T02 | Pendiente de commit | Completada | Implementado agregado Empleado, PeriodoLaboral, ContactoEmergencia y LicenciaEmpleado con ciclo laboral (inactivar/reactivar) y colecciones; 12 pruebas unitarias. |
| T03 | Pendiente de commit | Completada | Implementados agregados RestriccionOperativa e Indisponibilidad con anulación auditada y vigencias; 13 pruebas unitarias. |
| T04 | Pendiente de commit | Completada | Definidos repositorios de dominio, puertos de EMP/SUS/ACC/ARC, modelos de lectura y contrato público VerificadorEmpleadoPublico; 4 pruebas pasando. |
| T05 | | Pendiente | |
| T06 | | Pendiente | |
| T07 | | Pendiente | |
| T08 | | Pendiente | |
| T09 | | Pendiente | |
| T10 | | Pendiente | |
| T11 | | Pendiente | |
| T12 | | Pendiente | |
| T13 | | Pendiente | |
| T14 | | Pendiente | |

## 9. Evidencia

| Control | Resultado | Comando ejecutado | Observado |
|---|---|---|---|
| Planificación | NOT RUN | | Fase 2 no ejecuta código de producción ni afirma resultados de calidad |

## 10. Cierre

- **Conformidad:** pendiente de Fase 3 y verificación independiente en Fase 4.
- **Desviaciones:** ninguna registrada.
- **Ítems que pasan a Implementado:** pendientes de verificación: `PER-REQ-001` a `PER-REQ-004`, `PER-UC-001` a `PER-UC-003`, reglas y entidades vigentes cubiertas por el alcance.
- **Tarea que pasa a Completada:** `PER-TASK-002`.
- **Revisor:** pendiente; debe ser una sesión distinta de la implementación.
- **Estado final:** Pendiente.
