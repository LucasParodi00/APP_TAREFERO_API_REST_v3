---
type: plan
id: PLAN-EMP-0002
title: "Reorganizar la estructura interna del módulo Empresas"
module: "EMP"
task: EMP-TASK-004
status: En verificación
mode: estandar
created: 2026-11-11
approved_by: "Ingeniero"
---

# PLAN-EMP-0002 — Reorganizar la estructura interna del módulo Empresas

<!-- Un plan es el expediente completo de una entrega: antes de aprobarse dice qué y cómo; después registra qué pasó.
Secciones 1–7: las escribe el planificador. 8: el implementador. 9–10: el revisor.
No copia reglas ni escenarios: referencia IDs y tags. -->

## 1. Objetivo y alcance

- **Tarea:** `EMP-TASK-004`
- **Implementa:** `ADR-0009`; conserva `EMP-UC-001` a `EMP-UC-008` y `EMP-BR-001` a `EMP-BR-014`.
- **Resultado observable:** el módulo Empresas conserva sus operaciones y contratos públicos, pero organiza sus archivos sin niveles anticipados, define el repositorio de agregados en Dominio, usa un puerto de consulta en Aplicación y separa sus implementaciones TypeORM de escritura y lectura.
- **No incluye:** cambios de reglas, permisos, casos de uso, rutas o esquemas OpenAPI; cambios de tablas o migraciones; incorporación de otra tecnología de persistencia o transporte; instalación de dependencias; configuración global de TypeORM ni incorporación de `EmpresasModule` en `AppModule`; corrección de diferencias funcionales preexistentes ajenas a la reorganización.

## 2. Preparación

- [x] Todos los ítems del alcance están `Aprobado`.
- [x] Ninguna pregunta bloqueante abierta los afecta (`EMP-Q-001` a `EMP-Q-013` están respondidas).
- [x] Las dependencias `EMP-DEP-001` a `EMP-DEP-005` no cambian; `EMP-DEP-002` conserva el adaptador provisional acordado.
- [x] La decisión transversal necesaria está aceptada en `ADR-0009`.
- [x] La tarea `EMP-TASK-004` existe y está `Lista`.

**Bloqueos:** Ninguno para planificar. Antes de ejecutar verificaciones debe instalarse el árbol de dependencias existente, porque la línea base no dispone de `node_modules`.

## 3. Contexto actual

- [H] `RepositorioEmpresas` está en Aplicación y combina persistencia de agregados con `listar`, `CriteriosListadoEmpresas` y `ResultadoListadoEmpresas` — `src/modulos/empresas/aplicacion/puertos/salida/repositorio-empresas.puerto.ts`.
- [H] `ConsultarEmpresa` y `ListarEmpresas` dependen del repositorio mixto; la primera reconstruye un agregado para producir una lectura y la segunda recibe directamente una proyección — `src/modulos/empresas/aplicacion/consultas/`.
- [H] `RepositorioEmpresasTypeOrm` implementa en una sola clase guardado, carga de agregados, comprobación de alias y listado paginado — `src/modulos/empresas/infraestructura/persistencia/typeorm/repositorios/repositorio-empresas.typeorm.ts`.
- [H] El listado TypeORM reconstruye agregados antes de mapearlos a `EmpresaLectura`, aunque la lectura puede proyectarse directamente — `src/modulos/empresas/infraestructura/persistencia/typeorm/repositorios/repositorio-empresas.typeorm.ts`.
- [H] Aplicación subdivide puertos en `comunes/` y `salida/`; Infraestructura subdivide persistencia por tecnología y tipo; Presentación conserva el nivel `http/` aunque no existe otro transporte — `src/modulos/empresas/`.
- [H] Las pruebas de Aplicación y aceptación usan un doble único que implementa escritura y lectura, por lo que actualmente no demuestran la separación establecida por `ADR-0009` — `src/modulos/empresas/pruebas/aplicacion/`, `src/modulos/empresas/pruebas/aceptacion/`.
- [H] `EmpresasModule` inyecta un único token de repositorio en comandos y consultas, pero no registra allí la implementación concreta de persistencia — `src/modulos/empresas/empresas.module.ts`.
- [H] El contrato OpenAPI ya declara `registrarEmpresa`, `consultarEmpresa`, `listarEmpresas`, `modificarEmpresa`, `suspenderEmpresa`, `reactivarEmpresa`, `cerrarEmpresa` y `modificarConfiguracionGeneral` con sus referencias `x-use-case`; esta tarea no altera el contrato — `doc/modulos/empresas/contratos/openapi.yaml`.
- [H] La migración existente define las tablas e índices del módulo; la reorganización no cambia el esquema físico — `migraciones/empresas/1731235200000-CrearTablasEmpresas.ts`.
- [H] No se encontraron importaciones hacia archivos internos de Empresas desde otros módulos de `src/`.
- [H] La línea base de pruebas no pudo ejecutarse el 2026-11-11: Yarn inició correctamente, pero `jest` no estaba disponible porque no existe un árbol de dependencias instalado.

## 4. Decisiones

### D-01 — Separar colección de agregados y consultas de lectura

| Opción | A favor | En contra |
|---|---|---|
| A: `RepositorioEmpresas` en Dominio para guardar, obtener agregados y comprobar alias; `ConsultaEmpresas` en Aplicación para consultar por identidad o alias y listar proyecciones | Cumple `ADR-0009`, evita modelos de lectura en Dominio y permite optimizar consultas sin reconstruir agregados | Introduce dos contratos, dos dobles y dos tokens de composición |
| B: mover el repositorio mixto completo a Dominio | Requiere menos cambios inmediatos | Filtra criterios y modelos de lectura de Aplicación hacia Dominio y contradice `ADR-0009` |

- **Recomendación:** Opción A. `RepositorioEmpresas` conserva `guardar`, `obtenerPorId` y `existeAlias`; `ConsultaEmpresas` expone la obtención por identidad o alias y el listado paginado.
- **Decisión del ingeniero:** Opción A, derivada de `ADR-0009` aceptado el 2026-11-11.
- **ADR:** `ADR-0009`.

### D-02 — Implementar la proyección TypeORM sin reconstruir el agregado

| Opción | A favor | En contra |
|---|---|---|
| A: `ConsultaEmpresasTypeOrm` convierte entidades persistentes directamente a `EmpresaLectura` mediante un mapeador de Infraestructura | Mantiene la lectura optimizada y evita ejecutar invariantes de reconstitución para consultar | Duplica de forma explícita parte del mapeo de salida |
| B: reutilizar `MapeadorEmpresaTypeOrm.aDominio` y luego `MapeadorEmpresaLectura.aLectura` | Reutiliza mapeadores existentes | Acopla la consulta a la reconstrucción completa del agregado y conserva el problema que motiva la separación |

- **Recomendación:** Opción A, con pruebas que comparen la proyección completa esperada.
- **Decisión del ingeniero:** Opción A, consecuencia directa de la separación de escritura y lectura aprobada en `ADR-0009`.
- **ADR:** No se crea otro; concreta `ADR-0009` dentro de `EMP`.

### D-03 — Simplificar únicamente los niveles accidentales actuales

| Opción | A favor | En contra |
|---|---|---|
| A: eliminar `puertos/comunes`, `puertos/salida`, `persistencia/typeorm/<tipo>` y `presentacion/http`, conservando las carpetas funcionales previstas por Arquitectura §6 | Reduce profundidad sin mezclar las cuatro capas ni crear una organización nueva | Obliga a actualizar múltiples importaciones y pruebas |
| B: conservar niveles de transporte y tecnología por una posible ampliación futura | Reduce movimientos inmediatos | Mantiene carpetas anticipadas sin un segundo transporte o tecnología |

- **Recomendación:** Opción A. Los niveles podrán reaparecer cuando exista la condición concreta indicada por Arquitectura §6.
- **Decisión del ingeniero:** Opción A, aprobada mediante `ADR-0009`.
- **ADR:** `ADR-0009`.

## 5. Tareas

| ID | Tarea | Capa | Implementa | Archivos previstos | Verificación |
|---|---|---|---|---|---|
| T01 | Crear primero las pruebas de contrato del repositorio de agregados y mover su interfaz a Dominio, sin modelos de lectura | Dominio | `ADR-0009`; soporte de escritura para `EMP-UC-001`, `EMP-UC-004` a `EMP-UC-008` | `src/modulos/empresas/dominio/repositorios/repositorio-empresas.ts`; `src/modulos/empresas/pruebas/aplicacion/casos-uso-datos.spec.ts`; `src/modulos/empresas/pruebas/aplicacion/casos-uso-ciclo-vida.spec.ts` | TypeScript impide que el repositorio acepte o devuelva `EmpresaLectura`; pruebas de comandos pasan con un doble que solo implementa el contrato de Dominio |
| T02 | Definir `ConsultaEmpresas` y aplanar los puertos de Aplicación; adaptar los dos casos de uso de consulta y sus dobles | Aplicación | `EMP-UC-002`, `EMP-UC-003` | `src/modulos/empresas/aplicacion/puertos/consulta-empresas.puerto.ts`; `src/modulos/empresas/aplicacion/puertos/contexto-solicitud.ts`; `src/modulos/empresas/aplicacion/puertos/verificador-asignacion-comercial.puerto.ts`; `src/modulos/empresas/aplicacion/consultas/`; `src/modulos/empresas/aplicacion/comandos/`; `src/modulos/empresas/pruebas/aplicacion/` | Pruebas de `EMP-UC-002` y `EMP-UC-003` pasan usando un doble de consulta separado; los comandos solo reciben `RepositorioEmpresas` |
| T03 | Aplanar persistencia TypeORM y separar `RepositorioEmpresasTypeOrm` de `ConsultaEmpresasTypeOrm`, con proyección directa | Infraestructura | Persistencia de `EMP-UC-001` a `EMP-UC-008`; `ADR-0003`, `ADR-0009` | `src/modulos/empresas/infraestructura/persistencia/empresa.typeorm-entity.ts`; `src/modulos/empresas/infraestructura/persistencia/configuracion-general-empresa.typeorm-entity.ts`; `src/modulos/empresas/infraestructura/persistencia/mapeador-empresa.typeorm.ts`; `src/modulos/empresas/infraestructura/persistencia/mapeador-empresa-lectura.typeorm.ts`; `src/modulos/empresas/infraestructura/persistencia/repositorio-empresas.typeorm.ts`; `src/modulos/empresas/infraestructura/persistencia/consulta-empresas.typeorm.ts`; `src/modulos/empresas/pruebas/integracion/` | Pruebas separadas demuestran guardado/carga de agregados, comprobación de alias, consulta por identidad o alias, filtros, orden, paginación y proyección completa; no cambia la migración |
| T04 | Aplanar Presentación y renombrar `solicitudes` a `dtos`, actualizando solo rutas de importación | Presentación | `registrarEmpresa`, `consultarEmpresa`, `listarEmpresas`, `modificarEmpresa`, `suspenderEmpresa`, `reactivarEmpresa`, `cerrarEmpresa`, `modificarConfiguracionGeneral` | `src/modulos/empresas/presentacion/controladores/`; `src/modulos/empresas/presentacion/dtos/`; `src/modulos/empresas/presentacion/decoradores/`; `src/modulos/empresas/presentacion/filtros/`; `src/modulos/empresas/pruebas/presentacion/` | Las pruebas HTTP existentes conservan rutas, cuerpos, permisos, ETag/If-Match y errores; `openapi.yaml` queda sin cambios |
| T05 | Actualizar el punto de composición con tokens separados para comandos y consultas y ajustar el adaptador comercial a los puertos aplanados | Composición / Infraestructura | Los ocho UC; `EMP-DEP-002` | `src/modulos/empresas/empresas.module.ts`; `src/modulos/empresas/infraestructura/adaptadores/asignacion-comercial-provisional.adaptador.ts`; pruebas de composición que correspondan dentro de `src/modulos/empresas/pruebas/integracion/` | Los comandos reciben `REPOSITORIO_EMPRESAS`; las consultas reciben `CONSULTA_EMPRESAS`; no queda ninguna inyección del contrato mixto ni importación desde rutas retiradas |
| T06 | Separar los dobles de escritura y lectura en aceptación, actualizar todas las importaciones y verificar que no queden niveles o dependencias obsoletos | Aceptación / Calidad | `@EMP-UC-001` a `@EMP-UC-008`; `ADR-0009` | `src/modulos/empresas/pruebas/aceptacion/empresas.aceptacion.spec.ts`; todas las pruebas del módulo afectadas por movimientos | Todos los escenarios actuales pasan; búsqueda estática sin referencias a `puertos/salida`, `puertos/comunes`, `persistencia/typeorm` o `presentacion/http`; Dominio no importa Aplicación |

## 6. Verificación y riesgos

| Control | Cubre | Comando |
|---|---|---|
| Aplicación | Separación de contratos y `EMP-UC-001` a `EMP-UC-008` | `yarn test src/modulos/empresas/pruebas/aplicacion --runInBand` |
| Integración | Repositorio, consulta, entidades y mapeadores TypeORM | `yarn test src/modulos/empresas/pruebas/integracion --runInBand` |
| Presentación | Operaciones HTTP y composición de controladores | `yarn test src/modulos/empresas/pruebas/presentacion --runInBand` |
| Aceptación | `@EMP-UC-001` a `@EMP-UC-008` | `yarn test src/modulos/empresas/pruebas/aceptacion --runInBand` |
| Contrato | Los ocho `operationId`; sin cambios contractuales | `yarn spectral lint doc/modulos/empresas/contratos/openapi.yaml` |
| Regresión completa | Todo el repositorio | `yarn test --runInBand` |
| Tipos y compilación | Importaciones, contratos y composición | `yarn build` |
| Calidad estática | Código movido y nuevos adaptadores | `yarn lint` |
| Arquitectura del módulo | Ausencia de rutas profundas retiradas y dirección de dependencias | `rg -n "puertos/(salida|comunes)|persistencia/typeorm|presentacion/http" src/modulos/empresas`; revisión con Dependency Cruiser cuando el repositorio exponga el comando normativo `yarn test:arquitectura` |

- **Riesgo — línea base no ejecutable:** `node_modules` no está instalado; ejecutar `yarn install --frozen-lockfile` antes de T01 y registrar la línea base. No se planifica modificar versiones ni dependencias.
- **Riesgo — autorización de consulta:** al dejar de reconstruir el agregado, `ConsultarEmpresa` debe conservar el rechazo de un Administrador que intenta acceder a otra Empresa (`EMP-BR-007`).
- **Riesgo — deriva de proyecciones:** el mapeador TypeORM de lectura debe cubrir todos los campos de `EmpresaLectura`; la prueba de integración compara la proyección completa, incluida configuración y versión.
- **Riesgo — paginación y orden:** la separación no autoriza paginar en memoria ni cambiar filtros u orden; `ConsultaEmpresasTypeOrm` conserva la ejecución en base de datos.
- **Riesgo — composición preexistente:** `EmpresasModule` no registra hoy el adaptador TypeORM concreto ni forma parte de `AppModule`. Esta tarea separa sus tokens internos, pero la configuración global de conexión queda fuera de alcance y no debe afirmarse como resuelta.
- **Migración de datos:** No aplica. No cambian tablas, columnas, índices, restricciones ni datos.
- **Rollback:** revertir en orden inverso los commits de T06 a T01; los movimientos no requieren rollback de base de datos.

## 7. Cambios de especificación

| ID | Cambio | Motivo |
|---|---|---|
| Ninguno | | |

**Aprobación del plan:** Pendiente del Ingeniero.

---

## 8. Registro de ejecución

| Tarea | Commit | Estado | Notas o desviaciones |
|---|---|---|---|
| T01 | `PLAN-EMP-0002 T01` | Completada | Contrato RepositorioEmpresas movido a Dominio sin modelos de lectura; comandos y pruebas actualizados. |
| T02 | `PLAN-EMP-0002 T02` | Completada | Puertos aplanados en aplicacion/puertos/; definido ConsultaEmpresas; casos de uso de consulta y dobles de prueba actualizados; carpetas comunes y salida eliminadas. |
| T03 | `PLAN-EMP-0002 T03` | Completada | Persistencia TypeORM aplanada en infraestructura/persistencia/; separados RepositorioEmpresasTypeOrm y ConsultaEmpresasTypeOrm con proyeccion directa y pruebas integradas. |
| T04 | `PLAN-EMP-0002 T04` | Completada | Capa Presentacion aplanada eliminando presentacion/http/; renombrada carpeta solicitudes a dtos; controladores, decoradores, filtros y pruebas actualizados. |
| T05 | `PLAN-EMP-0002 T05` | Completada | EmpresasModule actualizado con tokens separados REPOSITORIO_EMPRESAS y CONSULTA_EMPRESAS; verificada composicion en prueba de integracion. |
| T06 | `PLAN-EMP-0002 T06` | Completada | Separados dobles de aceptacion en RepositorioAceptacion y ConsultaAceptacion; comprobada ausencia de rutas intermedias obsoletas y paso de 112 pruebas. |

## 9. Evidencia

| Control | Resultado | Comando ejecutado | Observado |
|---|---|---|---|
| Línea base del módulo | OK | `yarn test` | 109 pruebas pasadas inicialmente tras aprobación |
| Pruebas unitarias e integración | OK | `yarn test` | 11 suites, 112 pruebas pasadas |
| Compilación TypeScript | OK | `yarn build` | `nest build` completado exitosamente sin errores |
| Validación OpenAPI | OK | `yarn spectral lint doc/modulos/empresas/contratos/openapi.yaml` | 0 errores |
| Linter y formato | OK | `yarn eslint "src/modulos/empresas/**/*.ts"` | 0 errores y 0 advertencias |
| Verificación arquitectónica ADR-0009 | OK | Búsqueda de `puertos/salida`, `puertos/comunes`, `persistencia/typeorm`, `presentacion/http` en `src/modulos/empresas` | 0 ocurrencias en código fuente; dominio sin dependencias de aplicación |

## 10. Cierre

- **Conformidad:** Ejecución completa de las 6 tareas del plan `PLAN-EMP-0002` satisfaciendo `ADR-0009`, conservando funcionalidad de `EMP-UC-001` a `EMP-UC-008` y reglas `EMP-BR-001` a `EMP-BR-014`.
- **Desviaciones:** Ninguna registrada.
- **Ítems que pasan a Implementado:** Ninguno; la tarea de refactorización interna no cambia el estado de la especificación funcional.
- **Tarea que pasa a Completada:** `EMP-TASK-004` (sujeta a verificación formal en fase 4).
- **Revisor:** sesión/agente de fase 4 distinto del implementador.
- **Estado final:** En verificación.
