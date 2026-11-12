---
type: plan
id: PLAN-TER-0001
title: "Administrar y consultar Chacras"
module: "TER"
task:
  - TER-TASK-002
  - TER-TASK-003
status: En revisión
mode: estandar
created: 2026-11-11
updated: 2026-11-12
approved_by: null
---

# PLAN-TER-0001 — Administrar y consultar Chacras

## 1. Objetivo y alcance

- **Tareas:** `TER-TASK-002` y `TER-TASK-003`.
- **Implementa:** `TER-UC-001`, `TER-UC-002`, `TER-UC-003`, `TER-UC-004`, `TER-UC-005`.
- **Resultado observable:** un Administrador, un Capataz dentro de su alcance autorizado o un SuperAdministrador dentro de un contexto de soporte validado por `ACC`, puede:
  1. Registrar una Chacra en la Empresa autorizada.
  2. Modificar sus datos descriptivos y de ubicación con concurrencia optimista (`If-Match`/`ETag`).
  3. Inactivarla con verificación de no tener Lotes activos y conservación histórica (sin borrado físico).
  4. Consultar la ficha detallada y la versión de una Chacra específica (incluso si está inactiva).
  5. Listar las Chacras autorizadas con paginación en base de datos (`limite`, `desplazamiento`), filtros por estado (`ACTIVA`, `INACTIVA` o ambas por defecto) y orden determinista.
  6. Proveer a otros módulos un contrato interno de solo lectura con identidad, Empresa y estado vigente de una Chacra, requerido por `ACC-DEP-005`.
- **Cambios controlados incluidos:** ubicación opcional de referencia según `TER-Q-018` y aplicación de `TER-BR-023` al inactivar una Chacra según `TER-Q-022`.
- **No incluye:** registrar o mantener Lotes (`TER-TASK-005` a `TER-TASK-007`); geometrías espaciales complejas de Lotes; reactivar Chacras; administrar cuentas o asignaciones de acceso en `ACC`; exponer por HTTP el contrato interno de `ACC-DEP-005` (el alcance llega por contexto técnico o doble).
- **Dependencias técnicas:** reutilización directa de los índices de `src/comun` autorizada por el Ingeniero el 2026-11-12; resolución de alcance según D-01 y D-07; capacidad transversal de idempotencia y bootstrap compartido conforme a D-06, D-09 y D-10.

## 2. Preparación

- [x] Los ítems base del alcance están `Aprobado`: `TER-UC-001` a `TER-UC-005`, `TER-BR-001` a `TER-BR-008`, `TER-BR-023`, `TER-ENT-001`, `TER-Q-018` y `TER-Q-022`.
- [x] No hay preguntas bloqueantes abiertas que afecten el alcance.
- [x] Los cambios controlados de §7 están materializados en sus fuentes dueñas mediante una sesión de Fase 1 posterior a su aprobación: `TER-ENT-001`, `TER-REQ-005` y `TER-UC-001`, `TER-UC-004`, `TER-UC-005`.
- [x] `src/comun` está desarrollado y disponible; su reutilización directa en estado de verificación fue autorizada expresamente por el Ingeniero el 2026-11-12.
- [x] El alcance de Chacras de `TER-DEP-002` se resuelve mediante la proyección cerrada `TODAS` o `SELECCION` con `chacraIds` validada en D-01 y D-07.
- [x] Capacidad de idempotencia y estrategia de bootstrap compartido aprobadas conforme a D-06 y D-09.
- [x] Las decisiones D-01 a D-12 fueron aprobadas por el Ingeniero el 2026-11-12; el OpenAPI refleja la semántica objetivo aprobada en D-10.
- [x] `ACC-DEP-005`, `ACC-BR-024`, `ACC-UC-013` y `ACC-UC-015` están aprobados y justifican el contrato público de lectura provisto por TER.
- [x] El Ingeniero confirmó D-12 sobre la forma del contrato público interno requerido por `ACC-DEP-005` el 2026-11-12.

**Bloqueos del plan:** Ninguno. El plan está en estado `En revisión`, listo para aprobación formal del Ingeniero para dar inicio a la Fase 3 de implementación.

## 3. Contexto actual

- [H] No existe código ni migración de Territorio — `src/modulos/territorio/` y `migraciones/territorio/` no existen. El contrato HTTP de Chacras ya existe en `doc/modulos/territorio/contratos/openapi.yaml`.
- [H] `AppModule` todavía no compone módulos de negocio ni una conexión TypeORM global — `src/app.module.ts`.
- [H] `ACC` y el núcleo común tienen implementación en verificación; sus planes todavía no están cerrados — `PLAN-ACC-0001` y `PLAN-CMN-0001`.
- [H] `src/comun/` ya publica `ContextoSolicitud`, generación de identificadores, reloj, paginación, decoradores HTTP y filtro RFC 9457. Territorio debe consumir sus índices públicos y no crear equivalentes locales — `arquitectura.md` §6.1.
- [H] `ADR-0011` establece que `ContextoSolicitud.permisos` usa IDs de casos de uso; para este plan son `TER-UC-001`, `TER-UC-002`, `TER-UC-003`, `TER-UC-004` y `TER-UC-005`.
- [H] `TER-Q-018` aprobó dirección y punto geográfico de referencia opcionales, pero `TER-ENT-001`, `TER-UC-001` y `TER-UC-004` aún no reflejan formalmente ese cambio controlado en su texto principal.
- [H] `TER-Q-022` aprobó impedir la inactivación de una Chacra con Lotes activos, pero `TER-UC-005` aún no declara `TER-BR-023` ni su excepción en su texto principal.
- [H] `package.json` expone los comandos de `convenciones.md` §9.2 y existe configuración de Dependency Cruiser, pero el comando exacto `yarn test:contratos -- territorio` no resolvió `spectral` en la revisión del 2026-11-12; la invocación directa del binario local validó el OpenAPI sin errores.
- [H] El contrato OpenAPI de Territorio y los componentes comunes actuales no coinciden en códigos y estados HTTP de `If-Match`, idempotencia y reglas de negocio; D-10 debe resolverlo antes de implementación.
- [H] `ACC-DEP-005` exige identidad, Empresa y estado vigente de una Chacra para asignar o reactivar el alcance de un Capataz; `ACC` no puede leer tablas de TER ni aceptar identificadores sin validación.
- [H] EMP ya resuelve una integración equivalente mediante un puerto público de Aplicación, un adaptador de Infraestructura y un token exportado por su módulo — `src/modulos/empresas/aplicacion/puertos/resolvedor-empresa-publico.puerto.ts`, `src/modulos/empresas/infraestructura/adaptadores/resolvedor-empresa-publico.adaptador.ts`, `src/modulos/empresas/empresas.module.ts`.
- [H] El árbol de trabajo contiene modificaciones previas ajenas a este plan; la implementación debe preservarlas y revisar solapamientos antes de editar archivos compartidos.

## 4. Decisiones

### D-01 — Consumo del contexto autorizado y alcance de Territorio

| Opción | A favor | En contra |
|---|---|---|
| A: consumir `ContextoSolicitud` desde el índice público de `src/comun/aplicacion` y validar una proyección discriminada de alcance de Territorio: `TODAS` o `SELECCION` con `chacraIds`; el contexto se origina únicamente en `ACC` | Reutiliza el contrato canónico y distingue expresamente acceso total, selección vacía y contexto inválido | Exige acordar con `ACC` la forma pública del dato contenido en `alcance` |
| B: declarar otro contexto mínimo dentro de Territorio | Permite avanzar sin acordar el contrato público | Duplica una capacidad canónica y viola arquitectura.md §6.1 |
| C: aceptar rol, Empresa o alcance desde cabeceras controladas por el cliente | Facilita pruebas HTTP aisladas | Viola arquitectura.md §13.3 y §13.4 y permite falsificar autorización |

- **Recomendación:** A. `empresaId`, permisos y soporte se toman del contexto canónico; la proyección local solo interpreta el alcance de Chacras y no autentica ni concede permisos. Para un Capataz, alcance ausente, `TODAS` o malformado se rechaza; `SELECCION` con lista vacía produce cero resultados. `TODAS` solo se admite para Administrador o soporte explícitamente validado.
- **Decisión del ingeniero:** Opción A, aprobada el 2026-11-12; reemplaza el contexto provisional considerado el 2026-11-11.
- **ADR:** No: aplica `ADR-0008`, `ADR-0011`, `ADR-0012` y `ADR-0013`; el formato público concreto debe quedar acordado con `ACC` antes de ejecutar.

### D-02 — Normalización y unicidad del nombre corto

| Opción | A favor | En contra |
|---|---|---|
| A: calcular en Dominio una clave normalizada persistida, conservar `ñ` como letra distinta y proteger `(empresa_id, nombre_corto_normalizado)` con restricción única | Cumple `TER-BR-007` en memoria y bajo concurrencia; evita depender de collation o extensiones implícitas | Exige mantener una única función canónica entre creación, modificación y mapeo |
| B: comparar solo en consultas de Aplicación | Implementación inicial menor | Dos solicitudes concurrentes pueden crear duplicados y la base no protege la regla |
| C: delegar toda equivalencia a una collation de PostgreSQL | Centraliza la comparación | El resultado depende de una configuración externa y puede equiparar caracteres no aprobados |

- **Recomendación:** A. Se eliminan espacios exteriores, se colapsan espacios consecutivos, se ignoran mayúsculas y acentos vocálicos; `NIÑO` y `NINO` permanecen diferentes.
- **Decisión del ingeniero:** Opción A y conservación de `ñ`, aceptadas el 2026-11-11.
- **ADR:** No: decisión local y reversible del módulo.

### D-03 — Representación de la ubicación de referencia

| Opción | A favor | En contra |
|---|---|---|
| A: `direccion` nullable de hasta 500 caracteres y `puntoGeograficoReferencia` nullable con latitud/longitud; persistir el punto como PostGIS `geometry(Point,4326)` | Distingue texto y coordenadas, valida rangos y usa el stack espacial aprobado | Requiere conversión explícita entre el objeto HTTP y PostGIS |
| B: guardar las coordenadas como dos columnas decimales | Mapeo sencillo | Pierde el tipo espacial ya adoptado y complica consultas geográficas futuras |
| C: guardar un GeoJSON libre | Flexible | Permite formas distintas de un punto y traslada validación innecesaria al contrato |

- **Recomendación:** A. Ambos datos son independientes, pueden omitirse al registrar y pueden limpiarse con `null` al modificar. `direccion` elimina espacios exteriores, conserva el contenido interior y rechaza como inválida una cadena vacía o compuesta solo por espacios; no se convierte silenciosamente en `null`.
- **Decisión del ingeniero:** Opción A y normalización recomendada, aprobadas el 2026-11-12; reemplaza y completa la aceptación de representación del 2026-11-11.
- **ADR:** No: `ADR-0003` ya fija PostgreSQL/PostGIS y la elección afecta solo a este dato del módulo.

### D-04 — Verificación de Lotes activos al inactivar una Chacra

| Opción | A favor | En contra |
|---|---|---|
| A: `TER-UC-005` consume `ConsultaLotesActivosPorChacra`; mientras no exista persistencia de Lotes se usa un adaptador nulo explícito, acompañado por una prueba de composición que impide registrar simultáneamente ese adaptador y persistencia de Lotes | Mantiene el alcance actual y hace verificable la condición temporal | Exige un mecanismo de composición que falle antes de habilitar Lotes con el adaptador nulo |
| B: no exponer la inactivación hasta disponer de la consulta real de Lotes | Falla de forma cerrada y elimina el adaptador temporal | Retrasa parte de `TER-TASK-002` aunque todavía no puedan existir Lotes |
| C: crear ahora tabla y consulta de Lotes | Elimina la temporalidad | Implementa parcialmente otra tarea y una entidad fuera del alcance aprobado |

- **Recomendación:** A. El caso de uso siempre consulta el puerto; las pruebas con dobles cubren ausencia y existencia de Lotes activos. `TER-TASK-005` debe reemplazar el adaptador en el mismo cambio que habilite persistencia de Lotes, y la prueba de composición debe impedir una omisión.
- **Decisión del ingeniero:** Opción A, aprobada el 2026-11-12.
- **ADR:** No: decisión local y temporal, registrada también como riesgo de reemplazo.

### D-05 — Semántica HTTP de la modificación descriptiva

| Opción | A favor | En contra |
|---|---|---|
| A: `PATCH /chacras/{chacraId}`; omitir conserva el valor y `null` limpia únicamente los campos opcionales | Expresa una modificación parcial y distingue ausencia de limpieza según convenciones.md §2 | Difiere del `PUT` usado actualmente por Empresas |
| B: `PUT /chacras/{chacraId}` con representación completa | Mantiene uniformidad con el contrato existente de Empresas | Obliga a reenviar datos no modificados y hace más riesgosa la limpieza accidental |

- **Recomendación:** A. `nombre` y `nombreCorto`, cuando se envían, no admiten `null`; una solicitud sin ningún campo modificable se rechaza como inválida.
- **Decisión del ingeniero:** Opción A, aprobada el 2026-11-12.
- **ADR:** No: decisión de contrato local del módulo.

### D-06 — Bootstrap compartido y composición ejecutable

| Opción | A favor | En contra |
|---|---|---|
| A: crear una tarea y plan técnicos separados para el bootstrap compartido de TypeORM, migraciones, PostGIS, filtro global y comandos realmente faltantes; Territorio solo registra `TerritorioModule` y consume ese bootstrap | Evita mezclar infraestructura transversal con dos tareas funcionales y permite reutilización posterior | Agrega un prerrequisito antes de ejecutar Territorio |
| B: incluir todo el bootstrap compartido dentro de este plan | Permite una única entrega | Amplía `TER-TASK-002/003`, toca archivos globales y crea capacidades compartidas sin tarea dueña |
| C: no componer el módulo en la aplicación | Evita archivos compartidos | Impide pruebas HTTP extremo a extremo y no entrega una API ejecutable |

- **Recomendación:** A. La extensión PostGIS pertenece al bootstrap compartido y no se elimina desde el `down` de una migración de Territorio. Este plan conserva únicamente el registro de `TerritorioModule` una vez disponible la infraestructura aprobada.
- **Decisión del ingeniero:** Opción A, aprobada el 2026-11-12.
- **ADR:** No: implementa decisiones ya aceptadas en `ADR-0003`, `ADR-0005` y arquitectura.md; no introduce un estándar nuevo.

### D-07 — Resolución de alcance y paginación en base de datos para consultas

| Opción | A favor | En contra |
|---|---|---|
| A: Aplicación valida `empresaId` y la proyección de alcance de D-01; `ConsultaChacrasTypeOrm` filtra Empresa y alcance antes de reutilizar `CriteriosPaginacion`, `ResultadoPaginado` y `PaginadorTypeOrm` desde `src/comun` | Cumple convenciones.md §3.2, evita paginación en memoria y reutiliza la capacidad canónica | Requiere traducir campos públicos de orden a columnas permitidas antes de construir la consulta |
| B: filtrar y paginar en memoria los agregados | Consulta SQL más simple | Viola explícitamente convenciones.md §3.2 y degrada memoria ante volúmenes crecientes |

- **Recomendación:** A. No se usa `null` ambiguo: `TODAS` omite el predicado de IDs y `SELECCION` usa `id = ANY(...)`; una selección vacía devuelve cero filas sin ejecutar una consulta sin alcance.
- **Decisión del ingeniero:** Opción A, aprobada el 2026-11-12.
- **ADR:** No: decisión local alineada con convenciones.md §3.2.

### D-08 — Campos de ordenamiento y desempate determinista

| Opción | A favor | En contra |
|---|---|---|
| A: admitir orden en `nombre`, `nombreCorto` y `creadoEn` con sufijo `:asc` o `:desc`; desempate obligatorio por `id ASC` en base de datos | Garantiza paginación estable y predecible según convenciones.md §3.2 y §3.3 | Requiere validar explícitamente el parámetro `orden` |
| B: aceptar cualquier campo enviado por el cliente | Flexibilidad | Riesgo de inyección o errores de base de datos con columnas inexistentes |

- **Recomendación:** A. Por defecto: `creadoEn:desc, id:asc`.
- **Decisión del ingeniero:** Opción A, aprobada el 2026-11-12.
- **ADR:** No: decisión local del módulo.

### D-09 — Idempotencia de escrituras

| Opción | A favor | En contra |
|---|---|---|
| A: crear una capacidad transversal mediante tarea y plan técnicos; registra operación, actor, Empresa, clave, huella de carga, estado y respuesta dentro de una estrategia transaccional, con retención mínima de 180 días | Cumple convenciones.md §3.4 de forma uniforme y evita repetir almacenamiento en cada módulo | Agrega un prerrequisito transversal |
| B: implementar registros de idempotencia solo dentro de Territorio | Permite avanzar localmente | Duplica una convención global y dificulta reutilizarla en otros módulos |
| C: aceptar la cabecera sin persistir el resultado | Menor implementación | No ofrece idempotencia real y contradice el contrato y las convenciones |

- **Recomendación:** A. El contrato debe distinguir reintento idéntico, misma clave con carga diferente y operación todavía en curso. La confirmación del resultado y la escritura funcional deben ser atómicas o demostrar una estrategia equivalente.
- **Decisión del ingeniero:** Opción A, aprobada el 2026-11-12.
- **ADR:** No se crea otro ADR: `convenciones.md` §3.4 ya fija el estándar; hace falta una tarea técnica y su plan de implementación.

### D-10 — Semántica HTTP común de precondiciones y reglas

| Opción | A favor | En contra |
|---|---|---|
| A: corregir la capacidad común mediante su propia tarea/plan para publicar códigos `CMN_*`, devolver 428 cuando falta `If-Match`, 400 cuando es inválido y 422 para una categoría explícita de regla de negocio; Territorio refleja esos resultados en OpenAPI | Mantiene una traducción transversal única y alinea contrato, nomenclatura y convenciones | Requiere cerrar la corrección común antes de implementar Territorio |
| B: crear decoradores y filtro equivalentes dentro de Territorio | Permite ajustar códigos localmente | Duplica capacidades canónicas y viola arquitectura.md §6.1 |
| C: adoptar sin cambios los códigos genéricos actuales | Menos trabajo | Los códigos no siguen la nomenclatura y la respuesta 400 no distingue forma inválida de regla de negocio |

- **Recomendación:** A. La semántica objetivo aprobada usa `CMN_IF_MATCH_REQUERIDO` con HTTP 428, `CMN_IF_MATCH_INVALIDO` y `CMN_IDEMPOTENCIA_INVALIDA` con HTTP 400, `CMN_IDEMPOTENCIA_CONFLICTO` con HTTP 409 y HTTP 422 para reglas de negocio. El OpenAPI la documenta, pero no se anticipa una segunda implementación local mientras la capacidad común no esté corregida y cerrada.
- **Decisión del ingeniero:** Opción A, aprobada el 2026-11-12.
- **ADR:** No: es una corrección de la implementación del estándar ya aprobado, trazada mediante tarea y plan comunes.

### D-11 — Separación entre agregado y modelos de lectura

| Opción | A favor | En contra |
|---|---|---|
| A: `RepositorioChacras` carga y guarda agregados para comandos; `ConsultaChacras` devuelve modelos de lectura para detalle y listado; Infraestructura implementa `RepositorioChacrasTypeOrm` y `ConsultaChacrasTypeOrm` por separado | Respeta arquitectura.md §16 y evita cargar agregados para consultas paginadas | Agrega dos contratos e implementaciones explícitos |
| B: un único repositorio para escritura, detalle y listado | Menos archivos | Mezcla agregados con proyecciones y hace crecer un contrato de Dominio por necesidades de lectura |

- **Recomendación:** A.
- **Decisión del ingeniero:** Opción A, aprobada el 2026-11-12.
- **ADR:** No: aplica directamente la arquitectura aprobada.

### D-12 — Contrato público interno de Chacra para ACC

| Opción | A favor | En contra |
|---|---|---|
| A: TER publica `ResolvedorChacraPublico` con `resolverPorId(chacraId)` y devuelve únicamente `{ id, empresaId, estado }` o `null`; el adaptador usa `ConsultaChacras` y `TerritorioModule` exporta su token | Reutiliza el patrón vigente de EMP, evita HTTP y no filtra nombres, ubicación ni geometrías; cubre exactamente `ACC-DEP-005` y los UC unitarios de asignación/reactivación | Introduce una dependencia directa entre módulos dentro del monolito modular que debe mantenerse limitada al índice público |
| B: publicar un endpoint HTTP interno para validar la Chacra | Permite separar procesos en el futuro | Agrega red, autenticación y traducción HTTP sin que hoy existan servicios separados |
| C: permitir que ACC consulte tablas o repositorios de TER | Implementación aparente más corta | Rompe propiedad de datos, capas y autonomía del módulo |

- **Recomendación:** A. `null` significa Chacra inexistente; una excepción técnica se conserva distinta para que ACC traduzca indisponibilidad a `ACC_VALIDACION_TERRITORIAL_NO_DISPONIBLE`. ACC valida que `empresaId` coincida y que `estado` sea `ACTIVA`; TER solo informa hechos propios. El contrato resuelve una Chacra porque `ACC-UC-013` y `ACC-UC-015` operan sobre una referencia por solicitud.
- **Decisión del ingeniero:** Opción A, aprobada el 2026-11-12.
- **ADR:** No: aplica el patrón interno vigente de EMP y no cambia la arquitectura ni la especificación funcional.

## 5. Tareas

| ID | Tarea | Capa | Implementa | Archivos previstos | Verificación |
|---|---|---|---|---|---|
| T01 | Implementar objetos de valor, normalización, ubicación, estado y errores de Chacra, reutilizando identificadores y fechas de `src/comun/dominio` | Dominio | `TER-BR-001`, `TER-BR-002`, `TER-BR-005`, `TER-BR-007`, `TER-Q-018` | `src/modulos/territorio/dominio/objetos-valor/`, `enumeraciones/`, `errores/` | Pruebas unitarias con todos los ejemplos de las reglas, incluidos Unicode compuesto/descompuesto, acentos, espacios y distinción de `ñ` |
| T02 | Implementar el agregado `Chacra` y sus transiciones sin borrado físico | Dominio | `TER-ENT-001`, `TER-BR-003`, `TER-BR-005`, `TER-BR-006`, `TER-BR-008` | `src/modulos/territorio/dominio/agregados/chacra.ts` | Pruebas unitarias de alta ACTIVA, modificación activa/inactiva, inactivación y transiciones inválidas |
| T03 | Definir `RepositorioChacras`, `ConsultaChacras`, `ResolvedorChacraPublico`, proyección validada de alcance y `ConsultaLotesActivosPorChacra`; consumir `ContextoSolicitud`, generador, reloj, paginación e idempotencia desde contratos comunes aprobados | Dominio / Aplicación | `TER-DEP-001`, `TER-DEP-002`, `ACC-DEP-005`, `TER-BR-004`, `TER-BR-007`, `TER-BR-023`, D-01, D-07, D-09, D-11, D-12 | `dominio/repositorios/`, `aplicacion/consultas/`, `aplicacion/puertos/` | Compilación estricta; contrato público reducido a `id`, `empresaId` y `estado`; contratos separados de comando y lectura; ningún contrato duplica capacidades de `src/comun` ni importa NestJS, TypeORM o internos de otro módulo |
| T04 | Implementar `RegistrarChacra` con permiso por UC, Empresa contextual, unicidad, auditoría e idempotencia transversal | Aplicación | `TER-UC-001` | `aplicacion/comandos/registrar-chacra.caso-de-uso.ts` | Escenarios `@TER-UC-001`, ubicación opcional, reintento idéntico, carga distinta con la misma clave y unicidad concurrente |
| T05 | Implementar `ModificarChacra` con campos parciales, limpieza explícita, unicidad y versión | Aplicación | `TER-UC-004` | `aplicacion/comandos/modificar-chacra.caso-de-uso.ts` | Escenarios `@TER-UC-004`, ubicación, normalización, conflicto de concurrencia y conservación de campos omitidos |
| T06 | Implementar `InactivarChacra` verificando estado, versión, ausencia de Lotes activos e idempotencia transversal | Aplicación | `TER-UC-005`, `TER-BR-023` | `aplicacion/comandos/inactivar-chacra.caso-de-uso.ts` | Escenarios `@TER-UC-005`, rechazo con `TER_ESTADO_CHACRA_LOTES_INCOMPATIBLE`, reintento idéntico y conflicto de clave |
| T07 | Implementar `ConsultarChacra` sobre `ConsultaChacras`, con permiso, Empresa, alcance de Capataz e historial inactivo | Aplicación | `TER-UC-002`, `TER-BR-004`, `TER-BR-008` | `aplicacion/consultas/consultar-chacra.caso-de-uso.ts` | Escenarios `@TER-UC-002`; `SELECCION` permitida, vacía y ajena; alcance ausente, `TODAS` o malformado para Capataz; ficha inactiva |
| T08 | Implementar `ListarChacras` sobre `ConsultaChacras`, reutilizando paginación común, filtro por estado, orden determinista y alcance | Aplicación | `TER-UC-003`, `TER-BR-004` | `aplicacion/consultas/listar-chacras.caso-de-uso.ts` | Escenarios `@TER-UC-003`, filtros, traducción segura de orden, selección vacía y rechazo con `TER_CONSULTA_INVALIDA` |
| T09 | Crear entidad TypeORM, mapeador y migración de `chacras`, suponiendo PostGIS ya habilitado por el bootstrap compartido | Infraestructura | `TER-ENT-001`, `TER-BR-003`, `TER-BR-007`, `TER-Q-018` | `infraestructura/persistencia/`, `migraciones/territorio/` | Migración real, `synchronize: false`, unicidad normalizada, restricciones, aislamiento por `empresa_id`, punto SRID 4326 y round-trip; el `down` no elimina la extensión PostGIS |
| T10 | Implementar `RepositorioChacrasTypeOrm`, `ConsultaChacrasTypeOrm` con `PaginadorTypeOrm`, `AdaptadorResolvedorChacraPublico` sobre la consulta y el adaptador nulo controlado de Lotes | Infraestructura | `TER-UC-001` a `TER-UC-005`, `ACC-DEP-005`, D-04, D-07, D-11, D-12 | `infraestructura/persistencia/repositorio-chacras.typeorm.ts`, `consulta-chacras.typeorm.ts`, `infraestructura/adaptadores/` | Unicidad concurrente, versión optimista, paginación y total en BD, resolución pública de Chacra existente/inexistente/inactiva/otra Empresa, tenant y alcance previos a `LIMIT/OFFSET`, traducción estable de errores y prueba de composición del adaptador nulo |
| T11 | Implementar DTOs y controladores (`/chacras` GET/POST, `/{id}` GET/PATCH, `/{id}/inactivar` POST), reutilizando DTOs, decoradores y filtro de `src/comun/presentacion` | Presentación | Contrato OpenAPI; D-01, D-05, D-08, D-10 | `presentacion/controladores/`, `presentacion/dtos/` | Contrato HTTP, autorización, `ETag`/`If-Match`, idempotencia, rechazo de campos no admitidos y ausencia de contexto; ningún filtro o decorador transversal duplicado |
| T12 | Componer `TerritorioModule` sobre el bootstrap compartido aprobado, registrar sus proveedores, adaptadores y controladores, y exportar únicamente el token de `ResolvedorChacraPublico` para consumidores internos | Composición | `ACC-DEP-005`, D-04, D-06, D-09, D-12 | `src/modulos/territorio/territorio.module.ts`, registro mínimo en `src/app.module.ts` | Inicio real de la aplicación, migraciones, resolución desde un módulo consumidor sin acceso a persistencia de TER, prueba HTTP extremo a extremo y fallo de composición si conviven persistencia de Lotes y el adaptador nulo |
| T13 | Implementar aceptación, matriz completa de permisos y regresión de ambas tareas | Aceptación | `@TER-UC-001` a `@TER-UC-005`, `TER-BR-001` a `TER-BR-008`, `TER-BR-023`, `TER-Q-018`, `TER-Q-022` | `src/modulos/territorio/pruebas/aceptacion/` | Un test por escenario aprobado; ejemplos de cada BR; permitido y denegado por cada fila/actor, incluido soporte válido e inválido; regresión completa sin fallos |

El orden es obligatorio. Antes de T01 deben estar cerrados los prerrequisitos de §2. T04 a T08 pueden desarrollarse después de estabilizar T01 a T03; T09 y T10 implementan persistencia y consultas separadas. T11 a T13 exponen, componen y verifican el módulo completo sin crear capacidades transversales dentro de TER.

## 6. Verificación y riesgos

| Control | Cubre | Comando |
|---|---|---|
| Formato | Código y configuración modificados | `yarn format:check` |
| Lint y tipos | TypeScript estricto y convenciones | `yarn lint` · `yarn typecheck` |
| Build | Composición NestJS | `yarn build` |
| Unitarias completas | Regresión global obligatoria | `yarn test` |
| Unitarias del módulo | Dominio y Aplicación de `TER-TASK-002` y `TER-TASK-003` | `yarn test:modulo -- territorio` |
| Cobertura | Umbrales globales y 90/85 de Dominio/Aplicación | `yarn test:coverage` |
| Arquitectura | Capas, módulos y ciclos | `yarn test:arquitectura` |
| Integración | TypeORM, PostgreSQL/PostGIS, migración y concurrencia | `yarn test:integracion -- territorio` |
| Contrato | OpenAPI de Territorio | `yarn test:contratos -- territorio` |
| HTTP extremo a extremo | Operaciones y composición de Chacras | `yarn test:e2e -- territorio` |

- **Migración de datos:** no existen datos previos de Territorio. La migración crea la tabla `chacras` sobre un bootstrap que ya garantiza PostGIS; no crea ni elimina extensiones, tablas o columnas de Lotes ni registros técnicos de idempotencia.
- **Rollback:** antes de publicar datos, la migración `down` elimina únicamente objetos propios de Territorio y nunca la extensión PostGIS ni objetos transversales. Después de contener datos, se usa una migración compensatoria o restauración verificada.
- **Riesgo — autorización provisional:** ninguna ruta debe aceptar `empresaId`, rol, permisos, alcance ni soporte desde el cuerpo o cabeceras ad hoc del cliente. Sin contexto validado, la respuesta es 401/403 y no se ejecuta el caso de uso.
- **Riesgo — alcance ambiguo:** un Capataz con alcance ausente, malformado o `TODAS` se rechaza; una selección vacía produce cero resultados. Solo Administrador o soporte validado admiten `TODAS`.
- **Riesgo — adaptador sin Lotes:** `TER-TASK-005` debe reemplazar el adaptador nulo en el mismo cambio que habilite persistencia de Lotes; una prueba de composición impide ejecutar con ambas capacidades registradas simultáneamente.
- **Riesgo — normalización:** Dominio, búsquedas y restricción única deben usar la misma clave canónica; las pruebas incluyen Unicode compuesto/descompuesto y `ñ`.
- **Riesgo — concurrencia:** la unicidad se defiende en base de datos y los cambios usan versión optimista; los conflictos se traducen a `TER_NOMBRE_CORTO_DUPLICADO` o `TER_VERSION_CONFLICTO` sin filtrar SQL.
- **Riesgo — idempotencia parcial:** ninguna ruta anuncia idempotencia real hasta disponer del almacenamiento y coordinación transaccional aprobados en D-09; extraer la cabecera por sí solo no satisface convenciones.md §3.4.
- **Riesgo — semántica HTTP común:** el OpenAPI y `src/comun` deben coincidir en estados y códigos de `If-Match`, idempotencia y reglas de negocio antes de escribir controladores.
- **Riesgo — paginación en memoria:** el repositorio debe forzar `LIMIT` y `OFFSET` en la consulta SQL con filtro previo de tenant y alcance.
- **Riesgo — capacidades comunes:** Territorio consume solo índices públicos de `src/comun`; está prohibido duplicar contexto, reloj, identificadores, paginación, decoradores o filtro RFC 9457.
- **Riesgo — acoplamiento ACC–TER:** ACC solo importa el contrato público y el token exportado por `TerritorioModule`; no importa entidades TypeORM, repositorios, agregados ni consultas internas de TER. El resultado público no incluye nombre, dirección, ubicación ni geometrías.
- **Riesgo — archivos compartidos:** `src/app.module.ts` tiene trabajo concurrente; la Fase 3 debe inspeccionar el diff y detenerse ante solapamientos incompatibles. `package.json`, bootstrap y configuraciones globales pertenecen a sus tareas técnicas, no a este plan.

## 7. Cambios de especificación

| ID | Cambio | Motivo |
|---|---|---|
| `TER-ENT-001` | Agregar `direccion` opcional de hasta 500 caracteres y `puntoGeograficoReferencia` opcional con latitud/longitud; ambos independientes y limpiables. Declarar la normalización de `direccion` aprobada en D-03 | Incorporar `TER-Q-018` y cumplir convenciones.md §2 sin convertir la Chacra en una delimitación territorial |
| `TER-UC-001` | Admitir los dos datos opcionales de ubicación al registrar y devolverlos en el resultado; agregar escenario `@TER-UC-001 @AC-11` para la ubicación opcional válida | Aplicar `TER-Q-018` al alta incluida en `TER-TASK-002` |
| `TER-UC-004` | Permitir modificar o limpiar los datos opcionales de ubicación sin cambiar estado ni identidad; agregar escenarios `@TER-UC-004 @AC-11` y `@AC-12` para actualizar y limpiar ubicación | Aplicar `TER-Q-018` a la modificación incluida en `TER-TASK-002` |
| `TER-REQ-005` | Agregar `TER-BR-023` a las reglas aplicables a la inactivación de Chacra | Evitar que una Chacra INACTIVA conserve Lotes ACTIVOS según `TER-Q-022` |
| `TER-UC-005` | Referenciar `TER-BR-023`, verificar que no existan Lotes ACTIVOS, declarar su excepción y agregar `@TER-UC-005 @AC-09` para el rechazo correspondiente | Incorporar el cambio controlado aprobado en `TER-Q-022`, sin cascada automática |

**Secuencia obligatoria:** el Ingeniero aprueba primero estas propuestas; una sesión separada de Fase 1 las materializa en las fuentes dueñas; luego una nueva sesión de Fase 2 comprueba trazabilidad, contrato y desbloquea el plan. La Fase 3 no puede implementar directamente esta sección mientras las fuentes de mayor autoridad sigan sin actualizar.

**Aprobación de decisiones y cambios controlados:** aprobados por el Ingeniero el 2026-11-12. El plan completo permanece `Bloqueado` hasta que una sesión de Fase 1 materialice esta sección en las fuentes dueñas y se cierren las dependencias técnicas de §2.

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
| T12 | | Pendiente | |
| T13 | | Pendiente | |

## 9. Evidencia

| Control | Resultado | Comando ejecutado | Observado |
|---|---|---|---|
| | NOT RUN | | La Fase 2 no ejecuta implementación ni afirma resultados de calidad |

## 10. Cierre

- **Conformidad:** Pendiente de Fase 3 y verificación independiente en Fase 4.
- **Desviaciones:** Ninguna registrada.
- **Ítems que pasan a Implementado:** pendiente de verificación: `TER-REQ-001` a `TER-REQ-005`, `TER-UC-001` a `TER-UC-005`, reglas y `TER-ENT-001` cubiertas por el alcance.
- **Tareas que pasan a Completada:** `TER-TASK-002` y `TER-TASK-003`.
- **Revisor:** Pendiente; debe ser una sesión distinta de la implementación.
- **Estado final:** Pendiente.
