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
updated: 2026-11-12
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
  3. Delimitar o corregir geometrías mediante polígonos GeoJSON (área continua con o sin huecos interiores), validando no superposición con otros Lotes activos de la Empresa en PostGIS (`ST_Overlaps` y `ST_Touches`), calculando automáticamente la superficie oficial en hectáreas y conservando un historial inmutable de versiones geométricas.
  4. Inactivar y reactivar Lotes verificando ausencia de procesos activos (`CUL`, `LAB`), coherencia con el estado de la Chacra y ausencia de superposiciones espaciales al reactivar.
  5. Consultar la ficha territorial y superficie vigente de un Lote (activo o inactivo).
  6. Listar Lotes de la Empresa o de una Chacra específica, con filtros por estado y condición geométrica, paginación en base de datos (`limite`, `desplazamiento`) y orden determinista.
  7. Consultar el historial cronológico inmutable de versiones geométricas de un Lote.
  8. Reemplazar el adaptador provisional de `ConsultaLotesActivosPorChacra` de `PLAN-TER-0001` por la consulta real contra la base de datos de Lotes para hacer operativa `TER-BR-023`.
- **No incluye:** registro de labores operativas ni maquinaria (`LAB`); seguimiento de implantaciones agrícolas (`CUL`); administración de cuadrillas (`PER`); sesiones o asignación de cuentas en `ACC`.
- **Dependencias técnicas:** implementación previa de Chacras (`PLAN-TER-0001`); bootstrap compartido de TypeORM/PostGIS (`D-06` de TER / tarea transversal); capacidad transversal de idempotencia (`D-09` de TER / tarea transversal); contratos simulados de procesos activos (`TER-DEP-003`, `TER-DEP-004`).

## 2. Preparación

- [x] Los ítems del alcance están `Aprobado`: `TER-UC-006` a `TER-UC-013`, `TER-BR-009` a `TER-BR-023`, `TER-ENT-002`, `TER-ENT-003`, `B-02` a `B-12` y `TER-Q-011` a `TER-Q-023`.
- [x] No hay preguntas bloqueantes abiertas que afecten el alcance.
- [ ] `PLAN-TER-0001` está cerrado e implementado en base de datos.
- [ ] La infraestructura compartida PostGIS y la extensión espacial están verificadas y operativas en PostgreSQL.
- [ ] La capacidad transversal de idempotencia está disponible.
- [x] Las decisiones de diseño espacial y contratos están documentadas en §4.

**Bloqueos del plan:** este plan permanece `Bloqueado` hasta que `PLAN-TER-0001` (Chacras) esté implementado y cerrado.

## 3. Contexto actual

- [H] Las Chacras se planificaron en `PLAN-TER-0001` y definieron el agregado y tabla `chacras`.
- [H] `TER-ENT-002` exige que todo Lote pertenezca a una única Chacra inmutable (`chacraId`) y conserve aislamiento por `empresaId`.
- [H] `TER-ENT-003` exige modelar la delimitación como una colección histórica inmutable de versiones con polígonos GeoJSON (SRID 4326), superficie calculada y vigencia.
- [H] `TER-BR-023` aprobó que una Chacra INACTIVA no puede tener Lotes ACTIVOS. `PLAN-TER-0001` introdujo un adaptador provisional que este plan debe reemplazar obligatoriamente.
- [H] `CUL` y `LAB` no están implementados; para validar procesos activos antes de inactivar (`TER-BR-019`) se requiere un puerto de Aplicación con un adaptador nulo controlado o doble de prueba.

## 4. Decisiones

### D-01 — Representación y validación de geometrías GeoJSON

| Opción | A favor | En contra |
|---|---|---|
| A: entrada como GeoJSON `Polygon` estándar en WGS84 (SRID 4326); Dominio valida estructura de anillos cerrados y PostGIS valida validez topológica (`ST_IsValid`), área continua y orientación | Estándar universal web/móvil, compatible con Mapbox y almacenamiento nativo PostGIS | Requiere transformar el objeto JSON a PostGIS `ST_GeomFromGeoJSON` |
| B: recibir lista de coordenadas planas `[lat, lon]` | Simplicidad aparente | No admite huecos interiores ni sigue estándares OGC/GeoJSON |

- **Recomendación:** A. Un Lote es un polígono continuo con 0 o más huecos interiores; no se admiten `MultiPolygon` discontinuos según `TER-BR-013`.
- **Decisión del ingeniero:** Pendiente de aprobación.
- **ADR:** No: aplica `ADR-0003` (PostGIS) y los acuerdos de `B-05` y `TER-BR-013`.

### D-02 — Verificación de no superposición y contacto de límites

| Opción | A favor | En contra |
|---|---|---|
| A: consulta espacial PostGIS sobre Lotes activos de la misma Empresa: rechazar si existe intersección con dimensión 2 (`ST_Overlaps(geom1, geom2) = true` o `ST_Contains`); permitir si solo se tocan bordes (`ST_Touches(geom1, geom2) = true`) | Cumple exactamente `B-04` y `TER-BR-014`; delega la topología espacial al motor R-Tree/GiST | Requiere índice GiST en la columna geométrica |
| B: comparar bounding boxes en TypeScript | Fácil de programar | Falsos positivos y no detecta solapamientos reales |

- **Recomendación:** A, utilizando consulta SQL con `WHERE empresa_id = $1 AND estado = 'ACTIVO' AND lote_id != $2 AND ST_Overlaps(geometria, $3)`.
- **Decisión del ingeniero:** Pendiente de aprobación.
- **ADR:** No: decisión técnica de implementación de `TER-BR-014`.

### D-03 — Cálculo y almacenamiento de la superficie oficial

| Opción | A favor | En contra |
|---|---|---|
| A: calcular en base de datos mediante `ST_Area(geometria::geography) / 10000.0` y persistir el valor en la columna `superficie_hectareas` (decimal 12,4) de `VersionGeometrica` | Cálculo geodésico exacto que compensa la curvatura terrestre en WGS84; la persistencia evita recalcular en cada consulta de detalle o listado | Cálculo ligado a la inserción de la versión |
| B: calcular en coordenadas planas en el servidor | No requiere base de datos para el cálculo | Inexacto para distancias geográficas reales |

- **Recomendación:** A, conforme a `B-09` y `TER-BR-015`.
- **Decisión del ingeniero:** Pendiente de aprobación.
- **ADR:** No: implementación canónica de regla aprobada.

### D-04 — Ciclo de inmutabilidad de versiones geométricas

| Opción | A favor | En contra |
|---|---|---|
| A: tabla `versiones_geometricas_lote` donde cada versión es inmutable; al crear una nueva se marca `vigente_hasta = now()` en la anterior y la nueva se inserta con `vigente_hasta = null`; `lotes` actualiza su referencia y condición | Trazabilidad histórica completa conforme a `TER-BR-016`; consultas rápidas de la versión vigente | Requiere transacción atómica en Infraestructura |
| B: sobrescribir la geometría del Lote | Simple | Destruye el historial de versiones requerido por `B-03` y `TER-UC-013` |

- **Recomendación:** A.
- **Decisión del ingeniero:** Pendiente de aprobación.
- **ADR:** No: modelado directo de `TER-ENT-003`.

### D-05 — Verificación de procesos activos para inactivación

| Opción | A favor | En contra |
|---|---|---|
| A: `TER-UC-011` invoca un puerto `ConsultaProcesosActivosLote`; en esta entrega se provee un adaptador nulo controlado que informa ausencia, con pruebas que verifican rechazo ante respuesta positiva con dobles | Permite implementar y probar la regla `TER-BR-019` sin acoplar a módulos aún no existentes | Deberá conectarse con `CUL` y `LAB` cuando se desarrollen |
| B: ignorar la regla hasta que existan los otros módulos | Menor código | Incumple `TER-BR-019` aprobada en Fase 1 |

- **Recomendación:** A.
- **Decisión del ingeniero:** Pendiente de aprobación.
- **ADR:** No: diseño hexagonal estándar.

## 5. Tareas

| ID | Tarea | Capa | Implementa | Archivos previstos | Verificación |
|---|---|---|---|---|---|
| T01 | Implementar objetos de valor (`CodigoLote`, `SuperficieHectareas`, `PoligonoGeoJson`, catálogos `TipoSuelo`, `SistemaRiegoPrincipal`), enumeraciones y errores de Lote | Dominio | `TER-BR-010`, `TER-BR-011`, `TER-BR-012`, `TER-BR-013`, `TER-BR-020`, `TER-BR-021` | `src/modulos/territorio/dominio/objetos-valor/`, `enumeraciones/`, `errores/` | Pruebas unitarias de validación de código, tipos de suelo, riego y polígonos GeoJSON |
| T02 | Implementar agregado `Lote` y entidad `VersionGeometrica` con transiciones de estado, inmutabilidad y versiones | Dominio | `TER-ENT-002`, `TER-ENT-003`, `TER-BR-009`, `TER-BR-016`, `TER-BR-017`, `TER-BR-018` | `src/modulos/territorio/dominio/agregados/lote.ts`, `entidades/version-geometrica.ts` | Pruebas unitarias de creación, adición de versiones, inactivación, reactivación y reglas de identidad inmutable |
| T03 | Definir contratos de repositorio (`RepositorioLotes`, `ConsultaLotes`), servicio espacial y puertos de procesos activos | Dominio / Aplicación | `TER-DEP-001` a `TER-DEP-004`, `TER-BR-014`, `TER-BR-015`, `TER-BR-019`, `TER-BR-022` | `dominio/repositorios/`, `aplicacion/puertos/` | Compilación estricta y pruebas con dobles; separación limpia de escritura y lectura |
| T04 | Implementar caso de uso `RegistrarLote` (con delimitación opcional) | Aplicación | `TER-UC-006`, `TER-BR-009` a `TER-BR-017`, `TER-BR-023` | `aplicacion/comandos/registrar-lote.caso-de-uso.ts` | Pruebas de Aplicación de todos los escenarios `@TER-UC-006` |
| T05 | Implementar caso de uso `DelimitarLote` con validación espacial, cálculo de hectáreas e incremento de versión | Aplicación | `TER-UC-010`, `TER-BR-013` a `TER-BR-016` | `aplicacion/comandos/delimitar-lote.caso-de-uso.ts` | Pruebas de Aplicación de todos los escenarios `@TER-UC-010` (primera delimitación, corrección, superposición rechazada, contacto permitido) |
| T06 | Implementar caso de uso `ModificarLote` (datos descriptivos y versión optimista) | Aplicación | `TER-UC-009`, `TER-BR-010`, `TER-BR-011`, `TER-BR-020`, `TER-BR-021` | `aplicacion/comandos/modificar-lote.caso-de-uso.ts` | Pruebas de Aplicación de todos los escenarios `@TER-UC-009` |
| T07 | Implementar casos de uso `InactivarLote` y `ReactivarLote` con validación de procesos activos y superposición al reactivar | Aplicación | `TER-UC-011`, `TER-UC-012`, `TER-BR-014`, `TER-BR-017`, `TER-BR-019`, `TER-BR-023` | `aplicacion/comandos/inactivar-lote.caso-de-uso.ts`, `reactivar-lote.caso-de-uso.ts` | Pruebas de Aplicación de escenarios `@TER-UC-011` y `@TER-UC-012` |
| T08 | Implementar casos de uso `ConsultarLote` y `ConsultarVersionesGeometricas` con control de alcance de Capataz | Aplicación | `TER-UC-007`, `TER-UC-013`, `TER-BR-018`, `TER-BR-022` | `aplicacion/consultas/consultar-lote.caso-de-uso.ts`, `consultar-versiones-geometricas.caso-de-uso.ts` | Pruebas de Aplicación de escenarios `@TER-UC-007` y `@TER-UC-013` |
| T09 | Implementar caso de uso `ListarLotes` con paginación en base de datos, filtros por Chacra/estado y alcance | Aplicación | `TER-UC-008`, `TER-BR-018`, `TER-BR-022` | `aplicacion/consultas/listar-lotes.caso-de-uso.ts` | Pruebas de Aplicación de escenarios `@TER-UC-008` |
| T10 | Crear entidades TypeORM y migración de tablas `lotes` y `versiones_geometricas_lote` con columnas PostGIS e índices GiST | Infraestructura | `TER-ENT-002`, `TER-ENT-003`, `TER-BR-014` | `infraestructura/persistencia/`, `migraciones/territorio/` | Migración reversible real en PostgreSQL/PostGIS, restricciones de unicidad `(chacra_id, codigo_normalizado)` e índice GiST |
| T11 | Implementar `RepositorioLotesTypeOrm`, `ConsultaLotesTypeOrm` y `ServicioEspacialPostGis` (`ST_Overlaps`, `ST_Touches`, `ST_Area`) | Infraestructura | `TER-UC-006` a `TER-UC-013`, D-02, D-03 | `infraestructura/persistencia/`, `infraestructura/servicios/` | Pruebas de integración con base de datos real: inserción, cálculo de hectáreas, detección de solapamiento y transiciones de versión |
| T12 | Conectar la consulta real de `ConsultaLotesActivosPorChacra` para reemplazar el adaptador provisional de `PLAN-TER-0001` | Infraestructura | `TER-BR-023` | `infraestructura/adaptadores/` | Reemplazo verificado; prueba de regresión de `PLAN-TER-0001` con rechazo real si la Chacra contiene Lotes activos |
| T13 | Implementar DTOs, validadores de geometría GeoJSON y controladores HTTP de Lotes | Presentación | Contrato OpenAPI Lotes | `presentacion/controladores/controlador-lotes.ts`, `dtos/` | Pruebas de contrato y endpoints: `/chacras/{id}/lotes`, `/lotes`, `/lotes/{id}`, `/delimitar`, `/inactivar`, `/reactivar`, `/geometrias` |
| T14 | Componer en `TerritorioModule` y actualizar exports | Composición | `TerritorioModule` | `src/modulos/territorio/territorio.module.ts` | Compilación estricta y registro de proveedores |
| T15 | Pruebas de aceptación integrales y verificación de regresión del módulo completo | Aceptación | `@TER-UC-006` a `@TER-UC-013` | `src/modulos/territorio/pruebas/aceptacion/` | Cobertura total de todos los escenarios Gherkin aprobados de Lotes y regresión de Chacras |

## 6. Verificación y riesgos

| Control | Cubre | Comando |
|---|---|---|
| Formato | Código de Lotes | `yarn format:check` |
| Lint y tipos | TypeScript estricto | `yarn lint` · `yarn typecheck` |
| Build | Composición general | `yarn build` |
| Unitarias de Lotes | Dominio y Aplicación | `yarn test:modulo -- territorio` |
| Cobertura | Umbrales globales y 90/85 | `yarn test:coverage` |
| Arquitectura | Capas hexagonales | `yarn test:arquitectura` |
| Integración espacial | PostGIS, TypeORM y migraciones | `yarn test:integracion -- territorio` |
| Contrato | OpenAPI de Territorio (Chacras + Lotes) | `yarn test:contratos -- territorio` |
| E2E | Flujos HTTP de Lotes | `yarn test:e2e -- territorio` |

- **Riesgo — Precisión espacial PostGIS:** el cálculo de hectáreas debe hacerse obligatoriamente en `geography` (`ST_Area(geom::geography) / 10000.0`) para evitar distorsiones por proyección cartesiana en WGS84.
- **Riesgo — Falsos positivos en superposición:** se debe excluir explícitamente el contacto perimetral (`ST_Touches`) del rechazo por `TER_LOTES_SUPERPUESTOS`.
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
