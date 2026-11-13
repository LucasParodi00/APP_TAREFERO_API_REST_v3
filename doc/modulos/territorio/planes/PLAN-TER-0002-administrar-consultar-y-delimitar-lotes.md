---
type: plan
id: PLAN-TER-0002
title: "Administrar, consultar y delimitar Lotes"
module: "TER"
task:
  - TER-TASK-005
  - TER-TASK-006
  - TER-TASK-007
status: Bloqueado
mode: estandar
created: 2026-11-12
updated: 2026-11-13
approved_by: null
---

# PLAN-TER-0002 — Administrar, consultar y delimitar Lotes

## 1. Objetivo y alcance

- **Tareas:** `TER-TASK-005`, `TER-TASK-006` y `TER-TASK-007`.
- **Implementa:** `TER-UC-006`, `TER-UC-007`, `TER-UC-008`, `TER-UC-009`, `TER-UC-010`, `TER-UC-011`, `TER-UC-012`, `TER-UC-013`.
- **Entidades:** `TER-ENT-002` (Lote) y `TER-ENT-003` (Versión geométrica de Lote).
- **Reglas:** `TER-BR-009` a `TER-BR-023`.
- **Resultado observable:** un Administrador, un Capataz dentro de su alcance autorizado de Chacras o un SuperAdministrador mediante soporte auditado por `ACC`, puede:
  1. Registrar Lotes en Chacras activas de la Empresa, con o sin delimitación inicial.
  2. Modificar datos descriptivos del Lote (nombre, notas, tipo de suelo, sistema de riego) con versión optimista (`If-Match`/`ETag`), conservando Chacra y código inmutables.
  3. Delimitar o corregir geometrías mediante polígonos GeoJSON (área continua con o sin huecos interiores), validando en PostGIS que no compartan superficie con otros Lotes activos de la Empresa, permitiendo exclusivamente el contacto de límites, calculando automáticamente la superficie oficial en hectáreas y conservando un historial inmutable de versiones geométricas.
  4. Inactivar y reactivar Lotes verificando ausencia de procesos activos (`CUL`, `LAB`), coherencia con el estado de la Chacra y ausencia de superposiciones espaciales al reactivar.
  5. Consultar la ficha territorial y superficie vigente de un Lote (activo o inactivo).
  6. Listar Lotes de la Empresa o de una Chacra específica, con filtros por estado y condición geométrica, paginación en base de datos (`limite`, `desplazamiento`) y orden determinista.
  7. Consultar el historial cronológico inmutable de versiones geométricas de un Lote.
  8. Reemplazar el adaptador provisional de `ConsultaLotesActivosPorChacra` de `PLAN-TER-0001` por la consulta real contra la base de datos de Lotes para hacer operativa `TER-BR-023`.
- **No incluye:** registro de labores operativas ni maquinaria (`LAB`); seguimiento de implantaciones agrícolas (`CUL`); administración de cuadrillas (`PER`); sesiones o asignación de cuentas en `ACC`.
- **Dependencias técnicas:** implementación previa de Chacras (`PLAN-TER-0001`); `CMN-TASK-002`/`PLAN-CMN-0002` para la conexión TypeORM/`pg` y PostgreSQL con PostGIS; `CMN-TASK-003`/`PLAN-CMN-0003` para idempotencia persistente; `ACC-TASK-006`/`PLAN-ACC-0002` para proyectar el alcance de Chacras en el `ContextoSolicitud` de los flujos reales de Capataz; puertos controlados de procesos activos (`TER-DEP-003`, `TER-DEP-004`).

## 2. Preparación

- [x] Los ítems del alcance están `Aprobado`: `TER-UC-006` a `TER-UC-013`, `TER-BR-009` a `TER-BR-023`, `TER-ENT-002`, `TER-ENT-003`, `B-02` a `B-12` y `TER-Q-011` a `TER-Q-023`.
- [x] No hay preguntas bloqueantes abiertas que afecten el alcance.
- [ ] `PLAN-TER-0001` está cerrado e implementado en base de datos.
- [ ] `CMN-TASK-002` está implementada y PostGIS está verificado y operativo en PostgreSQL.
- [ ] `CMN-TASK-003` está implementada y la idempotencia persistente está disponible.
- [ ] `ACC` proyecta el alcance vigente de Chacras del Capataz en el `ContextoSolicitud` canónico para las pruebas integradas y E2E; TER puede desarrollar previamente sus reglas con dobles.
- [x] Las decisiones D-01 a D-05 fueron corregidas y aprobadas por el Ingeniero el 2026-11-13.

**Bloqueos del plan:** además del estado de `PLAN-TER-0001`, falta ejecutar `PLAN-CMN-0002` y `PLAN-CMN-0003`. La ausencia de `ACC-TASK-006` bloquea las pruebas integradas y E2E de Capataz, pero no las pruebas de Dominio y Aplicación con dobles.

## 3. Contexto actual

- [H] Las Chacras se planificaron en `PLAN-TER-0001` y definieron el agregado y tabla `chacras`.
- [H] `TER-ENT-002` exige que todo Lote pertenezca a una única Chacra inmutable (`chacraId`) y conserve aislamiento por `empresaId`.
- [H] `TER-ENT-003` exige modelar la delimitación como una colección histórica inmutable de versiones con polígonos GeoJSON (SRID 4326), superficie calculada y vigencia.
- [H] `TER-BR-023` aprobó que una Chacra INACTIVA no puede tener Lotes ACTIVOS. `PLAN-TER-0001` introdujo un adaptador provisional que este plan debe reemplazar obligatoriamente.
- [H] `CUL` y `LAB` no están implementados; para validar procesos activos antes de inactivar (`TER-BR-019`) se requiere un puerto de Aplicación con un adaptador nulo controlado o doble de prueba.
- [H] PostGIS es una extensión del servidor PostgreSQL ya adoptada por `ADR-0003`; TER no importa una librería PostGIS. La conexión TypeORM/`pg` y la habilitación de la extensión son composición técnica compartida, mientras las migraciones, columnas `geometry`, índices GiST y consultas espaciales de Lotes pertenecen a TER.
- [H] La cabecera HTTP `Idempotency-Key` ya forma parte del contrato y `src/comun/presentacion` puede leerla, pero no existe todavía el almacenamiento transaccional que evita confirmar dos veces una misma escritura conforme a convenciones.md §3.4.
- [H] `ACC` es dueño de administrar las asignaciones del Capataz y proyectar sus `chacraIds` vigentes en el `ContextoSolicitud`; TER solo consume esa proyección y no importa Dominio, persistencia ni Infraestructura de `ACC`.

## 4. Decisiones

### D-01 — Representación y validación de geometrías GeoJSON

| Opción | A favor | En contra |
|---|---|---|
| A: entrada como GeoJSON `Polygon` estándar en WGS84 (SRID 4326); Dominio valida tipo, coordenadas `[longitud, latitud]`, rangos, cantidad mínima y cierre de anillos; PostGIS valida geometría no vacía, continuidad y validez topológica (`ST_IsValid`) | Estándar universal web/móvil, compatible con Mapbox y almacenamiento nativo PostGIS | Requiere transformar el objeto JSON a PostGIS `ST_GeomFromGeoJSON` |
| B: recibir lista de coordenadas planas `[lat, lon]` | Simplicidad aparente | No admite huecos interiores ni sigue estándares OGC/GeoJSON |

- **Recomendación:** A. Un Lote es un polígono continuo con 0 o más huecos interiores; no se admiten `MultiPolygon` discontinuos según `TER-BR-013`.
- **Decisión del ingeniero:** Opción A corregida, sin imponer una orientación no definida por `TER-BR-013`, aprobada el 2026-11-13.
- **ADR:** No: aplica `ADR-0003` (PostGIS) y los acuerdos de `B-05` y `TER-BR-013`.

### D-02 — Verificación de no superposición y contacto de límites

| Opción | A favor | En contra |
|---|---|---|
| A: consulta espacial PostGIS sobre las geometrías vigentes de Lotes activos de la misma Empresa: rechazar cuando `ST_Intersects(geometria, candidata) AND NOT ST_Touches(geometria, candidata)`; excluir el mismo Lote y serializar las escrituras espaciales concurrentes por Empresa | Detecta solapamiento, igualdad y contención; permite el contacto exclusivo de límites y usa el índice GiST | Requiere transacción y bloqueo asesor transaccional por `empresaId`, además del índice GiST |
| B: comparar bounding boxes en TypeScript | Fácil de programar | Falsos positivos y no detecta solapamientos reales |

- **Recomendación:** A. Registrar con geometría, delimitar y reactivar adquieren el mismo bloqueo asesor transaccional por Empresa antes de validar y escribir; la consulta considera solo versiones vigentes y no depende de una comprobación previa fuera de la transacción.
- **Decisión del ingeniero:** Opción A corregida, aprobada el 2026-11-13.
- **ADR:** No: decisión técnica de implementación de `TER-BR-014`.

### D-03 — Cálculo y almacenamiento de la superficie oficial

| Opción | A favor | En contra |
|---|---|---|
| A: calcular en base de datos mediante `ST_Area(geometria::geography) / 10000.0` y persistir el valor en la columna `superficie_hectareas` (decimal 12,4) de `VersionGeometrica` | Cálculo geodésico exacto que compensa la curvatura terrestre en WGS84; la persistencia evita recalcular en cada consulta de detalle o listado | Cálculo ligado a la inserción de la versión |
| B: calcular en coordenadas planas en el servidor | No requiere base de datos para el cálculo | Inexacto para distancias geográficas reales |

- **Recomendación:** A, conforme a `B-09` y `TER-BR-015`.
- **Decisión del ingeniero:** Opción A, aprobada el 2026-11-13.
- **ADR:** No: implementación canónica de regla aprobada.

### D-04 — Ciclo de inmutabilidad de versiones geométricas

| Opción | A favor | En contra |
|---|---|---|
| A: tabla `versiones_geometricas_lote` donde cada versión es inmutable; en una única transacción se cierra la anterior, se inserta la nueva y se actualiza el Lote; un índice único parcial sobre `lote_id WHERE vigente_hasta IS NULL` garantiza como máximo una vigente | Trazabilidad histórica completa conforme a `TER-BR-016`; la base de datos protege el invariante ante concurrencia | Requiere transacción atómica y tratamiento estable de conflictos de restricción |
| B: sobrescribir la geometría del Lote | Simple | Destruye el historial de versiones requerido por `B-03` y `TER-UC-013` |

- **Recomendación:** A.
- **Decisión del ingeniero:** Opción A corregida, aprobada el 2026-11-13.
- **ADR:** No: modelado directo de `TER-ENT-003`.

### D-05 — Verificación de procesos activos para inactivación

| Opción | A favor | En contra |
|---|---|---|
| A: `TER-UC-011` invoca puertos separados para `CUL` y `LAB`; mientras los módulos no existan, adaptadores nulos explícitos informan ausencia, pero cualquier error técnico falla de forma cerrada y una prueba de composición impide que convivan con adaptadores reales | Permite implementar y probar `TER-BR-019` sin acoplar TER a módulos aún no existentes ni confundir indisponibilidad con ausencia de procesos | Exige sustituir cada adaptador nulo cuando aparezca su proveedor real |
| B: ignorar la regla hasta que existan los otros módulos | Menor código | Incumple `TER-BR-019` aprobada en Fase 1 |

- **Recomendación:** A.
- **Decisión del ingeniero:** Opción A corregida, aprobada el 2026-11-13.
- **ADR:** No: diseño hexagonal estándar.

## 5. Tareas

| ID | Tarea | Capa | Implementa | Archivos previstos | Verificación |
|---|---|---|---|---|---|
| T01 | Implementar objetos de valor (`CodigoLote`, `SuperficieHectareas`, `PoligonoGeoJson`, catálogos `TipoSuelo`, `SistemaRiegoPrincipal`), enumeraciones y errores de Lote | Dominio | `TER-BR-010`, `TER-BR-011`, `TER-BR-012`, `TER-BR-013`, `TER-BR-020`, `TER-BR-021` | `src/modulos/territorio/dominio/objetos-valor/`, `enumeraciones/`, `errores/` | Pruebas unitarias de validación de código, tipos de suelo, riego y polígonos GeoJSON |
| T02 | Implementar agregado `Lote` y entidad `VersionGeometrica` con transiciones de estado, inmutabilidad y versiones | Dominio | `TER-ENT-002`, `TER-ENT-003`, `TER-BR-009`, `TER-BR-016`, `TER-BR-017`, `TER-BR-018` | `src/modulos/territorio/dominio/agregados/lote.ts`, `entidades/version-geometrica.ts` | Pruebas unitarias de creación, adición de versiones, inactivación, reactivación y reglas de identidad inmutable |
| T03 | Definir contratos de repositorio (`RepositorioLotes`, `ConsultaLotes`), servicio espacial, puertos separados de procesos activos de `CUL` y `LAB`, y `ResolvedorLotePublico` de solo lectura con `id`, `empresaId`, `chacraId`, `codigo` y `estado` | Dominio / Aplicación | `TER-DEP-001` a `TER-DEP-007`, `TER-BR-014`, `TER-BR-015`, `TER-BR-018`, `TER-BR-019`, `TER-BR-022` | `dominio/repositorios/`, `aplicacion/puertos/` | Compilación estricta y pruebas con dobles; separación limpia de escritura y lectura; contrato público sin importar internos de TER ni exponer geometrías o persistencia |
| T04 | Implementar caso de uso `RegistrarLote` (con delimitación opcional), permiso por UC, Empresa contextual, auditoría e idempotencia transversal | Aplicación | `TER-UC-006`, `TER-BR-009` a `TER-BR-017`, `TER-BR-023` | `aplicacion/comandos/registrar-lote.caso-de-uso.ts` | Todos los escenarios `@TER-UC-006`, matriz de permisos, aislamiento entre Empresas, reintento idéntico, carga distinta con la misma clave y registro espacial concurrente |
| T05 | Implementar `DelimitarLote` con idempotencia, validación espacial concurrente, cálculo de hectáreas e incremento de versión | Aplicación | `TER-UC-010`, `TER-BR-013` a `TER-BR-016` | `aplicacion/comandos/delimitar-lote.caso-de-uso.ts` | Todos los escenarios `@TER-UC-010`; reintento idéntico; conflicto de clave; igualdad, contención, superposición y contacto; dos delimitaciones simultáneas |
| T06 | Implementar caso de uso `ModificarLote` (datos descriptivos y versión optimista) | Aplicación | `TER-UC-009`, `TER-BR-010`, `TER-BR-011`, `TER-BR-020`, `TER-BR-021` | `aplicacion/comandos/modificar-lote.caso-de-uso.ts` | Pruebas de Aplicación de todos los escenarios `@TER-UC-009` |
| T07 | Implementar `InactivarLote` y `ReactivarLote` con idempotencia, verificación separada de procesos activos y superposición concurrente al reactivar | Aplicación | `TER-UC-011`, `TER-UC-012`, `TER-BR-014`, `TER-BR-017`, `TER-BR-019`, `TER-BR-023` | `aplicacion/comandos/inactivar-lote.caso-de-uso.ts`, `reactivar-lote.caso-de-uso.ts` | Escenarios `@TER-UC-011` y `@TER-UC-012`; reintentos; fallo cerrado ante indisponibilidad de `CUL` o `LAB`; transiciones simultáneas y aislamiento entre Empresas |
| T08 | Implementar `ConsultarLote` y `ConsultarVersionesGeometricas` con permiso, Empresa y alcance de Capataz recibido desde el `ContextoSolicitud` canónico | Aplicación | `TER-UC-007`, `TER-UC-013`, `TER-BR-018`, `TER-BR-022` | `aplicacion/consultas/consultar-lote.caso-de-uso.ts`, `consultar-versiones-geometricas.caso-de-uso.ts` | Escenarios `@TER-UC-007` y `@TER-UC-013`; alcance permitido, vacío, ajeno, ausente y malformado; actor y motivo de cada versión |
| T09 | Implementar `ListarLotes` con permiso, Empresa, alcance previo a la paginación, filtros por Chacra, estado y condición geométrica, y orden determinista | Aplicación | `TER-UC-008`, `TER-BR-018`, `TER-BR-022` | `aplicacion/consultas/listar-lotes.caso-de-uso.ts` | Escenarios `@TER-UC-008`; matriz de permisos; filtros combinados; total calculado solo sobre Empresa y alcance autorizados |
| T10 | Crear entidades TypeORM y migración de tablas `lotes` y `versiones_geometricas_lote` con columnas PostGIS, índices y restricciones | Infraestructura | `TER-ENT-002`, `TER-ENT-003`, `TER-BR-014`, `TER-BR-016` | `infraestructura/persistencia/`, `migraciones/territorio/` | Migración reversible real en PostgreSQL/PostGIS; unicidad `(chacra_id, codigo_normalizado)`; GiST; índice único parcial de versión vigente; el `down` no elimina la extensión PostGIS compartida |
| T11 | Implementar `RepositorioLotesTypeOrm`, `ConsultaLotesTypeOrm` y `ServicioEspacialPostGis` con intersección de interiores, contacto permitido, cálculo geodésico y bloqueo asesor transaccional por Empresa | Infraestructura | `TER-UC-006` a `TER-UC-013`, D-02, D-03, D-04 | `infraestructura/persistencia/`, `infraestructura/servicios/` | PostgreSQL/PostGIS real: igualdad, contención, solapamiento y contacto; dos escrituras simultáneas; `ST_Area(geometria::geography)`; cierre e inserción atómicos de versiones; pruebas negativas multiempresa |
| T12 | Conectar la consulta real de `ConsultaLotesActivosPorChacra` para reemplazar el adaptador provisional de `PLAN-TER-0001` | Infraestructura | `TER-BR-023` | `infraestructura/adaptadores/` | Reemplazo verificado; prueba de regresión de `PLAN-TER-0001` con rechazo real si la Chacra contiene Lotes activos |
| T13 | Implementar DTOs, validadores de geometría GeoJSON y controladores HTTP de Lotes | Presentación | Contrato OpenAPI Lotes | `presentacion/controladores/controlador-lotes.ts`, `dtos/` | Pruebas de contrato y endpoints: `/chacras/{id}/lotes`, `/lotes`, `/lotes/{id}`, `/delimitar`, `/inactivar`, `/reactivar`, `/geometrias` |
| T14 | Componer `TerritorioModule` sobre la conexión TypeORM/`pg` compartida, registrar adaptadores y controladores, sustituir el adaptador nulo de Lotes activos y exportar solo `ResolvedorLotePublico` | Composición | `TerritorioModule`, `TER-DEP-003` a `TER-DEP-007` | `src/modulos/territorio/territorio.module.ts`, registro mínimo en `src/app.module.ts` | Inicio real de la aplicación, migraciones, resolución desde consumidor sin acceso a tablas de TER y fallo de composición si conviven adaptadores nulos y reales; no se agrega una librería PostGIS a Node.js |
| T15 | Pruebas de aceptación integrales y regresión del módulo completo | Aceptación | `@TER-UC-006` a `@TER-UC-013` | `src/modulos/territorio/pruebas/aceptacion/` | Un test por escenario Gherkin; ejemplos de cada BR; matriz completa de actores permitidos y denegados; soporte válido e inválido; alcance real de ACC en integración/E2E; regresión global sin fallos |

## 6. Verificación y riesgos

| Control | Cubre | Comando |
|---|---|---|
| Formato | Código de Lotes | `yarn format:check` |
| Lint y tipos | TypeScript estricto | `yarn lint` · `yarn typecheck` |
| Build | Composición general | `yarn build` |
| Unitarias globales | Regresión completa del repositorio | `yarn test` |
| Unitarias de Lotes | Dominio y Aplicación | `yarn test:modulo -- territorio` |
| Cobertura | Umbrales globales y 90/85 | `yarn test:coverage` |
| Arquitectura | Capas hexagonales | `yarn test:arquitectura` |
| Integración espacial | PostGIS, TypeORM y migraciones | `yarn test:integracion -- territorio` |
| Contrato | OpenAPI de Territorio (Chacras + Lotes) | `yarn test:contratos -- territorio` |
| E2E | Flujos HTTP de Lotes | `yarn test:e2e -- territorio` |

- **Riesgo — Precisión espacial PostGIS:** el cálculo de hectáreas debe hacerse obligatoriamente en `geography` (`ST_Area(geom::geography) / 10000.0`) para evitar distorsiones por proyección cartesiana en WGS84.
- **Riesgo — Falsos positivos en superposición:** se debe excluir explícitamente el contacto perimetral (`ST_Touches`) del rechazo por `TER_LOTES_SUPERPUESTOS`.
- **Riesgo — Falsos negativos espaciales:** `ST_Overlaps` aislado no detecta igualdad ni toda contención; se valida intersección que no sea exclusivamente contacto de límites.
- **Riesgo — Concurrencia espacial:** registrar, delimitar y reactivar toman un bloqueo asesor transaccional por Empresa antes de verificar y persistir, y las pruebas ejecutan operaciones simultáneas reales.
- **Riesgo — Dependencias temporales:** los adaptadores nulos de `CUL` y `LAB` solo existen mientras sus módulos no estén disponibles; los errores técnicos bloquean la inactivación y nunca equivalen a ausencia de procesos.
- **Riesgo — Integración con ACC:** las pruebas unitarias pueden usar dobles de `ContextoSolicitud`, pero la aceptación integrada y E2E de Capataz exige que `ACC` proyecte las asignaciones vigentes sin que TER importe sus internos.
- **Riesgo — Regresión en Chacras:** la integración de Lotes debe validar que la regla `TER-BR-023` (no inactivar Chacra con Lotes activos) pase de usar el adaptador provisional al repositorio real de Lotes sin romper pruebas existentes.

## 7. Cambios de especificación

No se requieren cambios de especificación. Todos los requerimientos, reglas (`TER-BR-009` a `TER-BR-023`), casos de uso (`TER-UC-006` a `TER-UC-013`) y entidades (`TER-ENT-002`, `TER-ENT-003`) fueron aprobados en Fase 1 (`TER-TASK-004`).

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
| T14 | | Pendiente | |
| T15 | | Pendiente | |

## 9. Evidencia

| Control | Resultado | Comando ejecutado | Observado |
|---|---|---|---|
| | NOT RUN | | La Fase 2 no ejecuta implementación ni afirma resultados de calidad |

## 10. Cierre

- **Conformidad:** Pendiente de Fase 3 y verificación independiente en Fase 4.
- **Desviaciones:** Ninguna registrada.
- **Ítems que pasan a Implementado:** `TER-REQ-006` a `TER-REQ-013`, `TER-UC-006` a `TER-UC-013`, `TER-BR-009` a `TER-BR-023`, `TER-ENT-002`, `TER-ENT-003`.
- **Tareas que pasan a Completada:** `TER-TASK-005`, `TER-TASK-006`, `TER-TASK-007`.
- **Revisor:** Pendiente; debe ser una sesión distinta de la implementación.
- **Estado final:** Pendiente.
