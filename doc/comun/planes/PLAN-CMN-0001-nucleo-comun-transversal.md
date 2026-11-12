---
type: plan
id: PLAN-CMN-0001
title: "Implementar núcleo común transversal hexagonal bajo src/comun"
module: "CMN"
task: CMN-TASK-001
status: En ejecución
mode: estandar
created: 2026-11-11
approved_by: "Ingeniero — 2026-11-12"
---

# PLAN-CMN-0001 — Implementar núcleo común transversal hexagonal bajo src/comun

<!-- Un plan es el expediente completo de una entrega: antes de aprobarse dice qué y cómo; después registra qué pasó.
Secciones 1–7: las escribe el planificador. 8: el implementador. 9–10: el revisor. -->

## 1. Objetivo y alcance

- **Tarea:** `CMN-TASK-001`
- **Implementa:** `ADR-0012`, `arquitectura.md` §6.1, §7, §8, §11–§13.3 y §17; `convenciones.md` §2, §3.2, §3.4, §3.5, §4 y §9.
- **Resultado observable:**
  - Existe `src/comun/` con las capas `dominio`, `aplicacion`, `infraestructura` y `presentacion`, sin dependencias hacia `src/modulos/`.
  - Dominio común provee `ErrorDominioBase`, categorías semánticas de error, `IdentificadorUuid`, `FechaCivil`, `FechaHoraUtc`, `CodigoMoneda` y `Dinero` como tipos puros e inmutables.
  - Aplicación común provee `ErrorAplicacionBase`, el `ContextoSolicitud` canónico, los puertos `GeneradorIdentificadores` y `Reloj`, y los modelos `CriteriosPaginacion` y `ResultadoPaginado<T>`.
  - Infraestructura común provee `GeneradorUuidV7`, `RelojSistema` y `PaginadorTypeOrm`.
  - Presentación común provee DTOs de paginación, los decoradores `ContextoUsuario`, `VersionIfMatch` e `IdempotencyKey`, y `FiltroExcepcionesRfc9457`.
  - Los errores concretos continúan perteneciendo a cada módulo funcional; el núcleo solo define su contrato base y la traducción transversal a RFC 9457.
  - La generación de identificadores nuevos ocurre en Aplicación mediante un puerto y produce UUID v7 antes de persistir; TypeORM solo almacena el valor.
  - El objeto `Dinero` representa y valida monto decimal y código de moneda, sin realizar conversión por cotizaciones ni cálculos financieros de negocio.
  - Dependency Cruiser verifica las fronteras de `src/comun/` y las importaciones permitidas desde módulos funcionales.
  - Todos los componentes nuevos tienen pruebas unitarias; build, tipado, arquitectura y suites existentes no presentan regresiones atribuibles al plan.
- **No incluye:**
  - Migrar `EMP` o `ACC` para consumir el núcleo. Cada adopción requiere una tarea y un plan propios porque modifica código aprobado de esos módulos.
  - Activar globalmente el filtro, los decoradores o los adaptadores desde `src/main.ts` o `src/app.module.ts`; la activación se realiza junto con la primera migración de consumidores para no convertir errores actuales no migrados en respuestas 500.
  - Mover errores concretos, reglas, permisos, agregados, entidades o repositorios funcionales a `src/comun/`.
  - Convertir importes entre monedas, obtener cotizaciones, decidir redondeos financieros o mantener tipos de cambio; esas responsabilidades pertenecen a `ECO` y sus integraciones.
  - Formatear fechas para interfaces humanas. Web y móvil convierten `AAAA-MM-DD` a `DD/MM/AAAA`; la API conserva el formato aprobado.
  - Crear tablas, entidades TypeORM o migraciones de base de datos.
  - Cambiar contratos OpenAPI: esta tarea técnica no expone casos de uso ni operaciones HTTP propias.

## 2. Preparación

- [x] La decisión transversal está aceptada en `ADR-0012`.
- [x] La estructura y las fronteras están aprobadas en `arquitectura.md` §6.1, §7 y §17.
- [x] UUID v7, Dinero, fechas, paginación, concurrencia y RFC 9457 están definidos en `convenciones.md`.
- [x] `CMN-TASK-001` existe y referencia `PLAN-CMN-0001`.
- [x] El Ingeniero confirmó el 2026-11-12 que la generación UUID v7 debe abstraerse en el núcleo y que los errores concretos permanecen en cada módulo sobre bases comunes.
- [x] El Ingeniero solicitó el 2026-11-12 dejar el plan listo para fase 3, aprobando las decisiones recomendadas de este plan.
- [x] No hay casos de uso funcionales, reglas de negocio, preguntas ni contratos OpenAPI que deban aprobarse para esta tarea técnica.

**Bloqueos:** Ninguno.

## 3. Contexto actual

- [H] `src/comun/` no existe.
- [H] `src/modulos/empresas/dominio/errores/errores-empresa.ts` y `src/modulos/identidad-acceso/dominio/errores/errores-identidad-acceso.ts` repiten una base de error de Dominio.
- [H] `src/modulos/empresas/aplicacion/errores/errores-aplicacion.ts` y `src/modulos/identidad-acceso/aplicacion/errores/errores-aplicacion.ts` repiten una base de error de Aplicación.
- [H] Los filtros RFC 9457 de `EMP` y `ACC` conocen errores concretos y producen cuerpos distintos (`codigo`/`errors` frente al contrato `code`/`errores`).
- [H] Los dos módulos declaran versiones incompatibles de `ContextoSolicitud`; ninguna contiene todos los campos de `arquitectura.md` §13.3.
- [H] `ContextoUsuario` de `EMP` permite construir identidad desde headers y usa `SUPER_ADMINISTRADOR` como valor predeterminado; el decorador común debe aceptar únicamente el contexto autenticado construido por el guard.
- [H] `EMP` transforma `limite`/`desplazamiento` a página y devuelve una forma distinta de la paginación aprobada; `ACC` ya usa `datos` y `paginacion` pero duplica contratos y DTOs.
- [H] `src/modulos/identidad-acceso/aplicacion/puertos/reloj.puerto.ts` y `infraestructura/seguridad/reloj-sistema.ts` contienen una abstracción local reutilizable.
- [H] `EMP` y `ACC` generan identificadores mediante `crypto.randomUUID()`, que en el runtime actual Node.js 24 produce UUID v4.
- [H] TypeORM 1.1.2 implementa `@PrimaryGeneratedColumn('uuid')` para PostgreSQL mediante `gen_random_uuid()` o `uuid_generate_v4()`; no selecciona UUID v7.
- [H] `package.json` no contiene una dependencia capaz de generar UUID v7; el proyecto compila como CommonJS bajo `module: nodenext` sin `type: module`.
- [H] `src/main.ts` no registra `ValidationPipe` ni filtro global y `src/app.module.ts` todavía no compone los módulos funcionales.
- [H] `.dependency-cruiser.js` solo protege rutas bajo `src/modulos/` y no contiene reglas para `src/comun/`.

## 4. Decisiones

### D-01 — Organización interna en cuatro capas hexagonales

| Opción | A favor | En contra |
|---|---|---|
| A: `dominio`, `aplicacion`, `infraestructura` y `presentacion` | Mantiene inversión de dependencias y permite controles automáticos | Exige ubicar cada componente según su responsabilidad |
| B: Directorio plano de helpers | Menos carpetas iniciales | Facilita dependencias indebidas y un cajón de sastre |

- **Decisión:** A, aprobada por `ADR-0012`.
- **Consecuencia:** no se crean carpetas genéricas `utils` o `helpers` fuera de una capa.

### D-02 — Errores concretos por módulo sobre contratos base comunes

| Opción | A favor | En contra |
|---|---|---|
| A: `ErrorDominioBase` y `ErrorAplicacionBase` comunes; cada módulo conserva sus errores | Una mejora estructural se propaga sin centralizar conocimiento funcional | Cada módulo debe migrar sus clases en un plan propio |
| B: Mover todos los errores concretos a `src/comun/` | Un único directorio | El núcleo conocería reglas y códigos de todos los módulos |
| C: Lanzar `HttpException` desde Dominio y Aplicación | Traducción directa | Viola `arquitectura.md` §7 y §12 |

- **Decisión:** A, aprobada por el Ingeniero el 2026-11-12.
- **Detalle:** las bases contienen `codigo`, mensaje seguro, categoría semántica y causa opcional. No contienen `HttpStatus`, rutas ni tipos de NestJS.
- **Categorías iniciales:** `VALIDACION`, `NO_AUTENTICADO`, `ACCESO_DENEGADO`, `NO_ENCONTRADO`, `CONFLICTO`, `PRECONDICION_FALLIDA`, `PRECONDICION_REQUERIDA` y `NO_DISPONIBLE`.
- **Traducción:** Presentación convierte la categoría a HTTP y serializa el código interno `codigo` como `code`, junto con `solicitudId` y `errores` cuando corresponda.

### D-03 — Paginación TypeORM mediante composición

| Opción | A favor | En contra |
|---|---|---|
| A: `PaginadorTypeOrm` compone sobre `SelectQueryBuilder` | Reutilizable sin imponer herencia a repositorios y consultas | Depende de la API de TypeORM en Infraestructura |
| B: Repositorio base abstracto | Centraliza CRUD | Acopla agregados y consultas a herencia y filtra paginación hacia contratos incorrectos |

- **Decisión:** A, aprobada al solicitar el plan listo para fase 3.
- **Detalle:** recibe orden estable ya validado, aplica `skip`/`take`, agrega el identificador como desempate y calcula el total en base de datos.

### D-04 — UUID v7 generado por un adaptador de Aplicación antes de persistir

| Opción | A favor | En contra |
|---|---|---|
| A: Puerto `GeneradorIdentificadores` y adaptador `GeneradorUuidV7` | ID disponible antes de persistir, pruebas deterministas y compatibilidad con operaciones offline | Agrega un puerto y una dependencia técnica |
| B: `@PrimaryGeneratedColumn('uuid')` | Menos código | En la versión actual genera v4 y entrega el ID al persistir |
| C: `uuidv7()` como default de PostgreSQL | UUID v7 nativo en PostgreSQL 18 | Acopla la creación a una versión de base y no sirve antes del insert |

- **Decisión:** A, aprobada por el Ingeniero el 2026-11-12.
- **Implementación:** dependencia exacta `uuid@11.1.0`, elegida porque provee `v7()` y conserva compatibilidad CommonJS con la configuración actual. El adaptador encapsula la librería; Dominio y Aplicación no la importan.
- **Persistencia futura:** los módulos usarán `@PrimaryColumn('uuid')` y entregarán a TypeORM el identificador ya generado.
- **Compatibilidad:** el generador solo produce v7. La aceptación temporal de identificadores v4 existentes se decidirá en el plan de migración de cada módulo, no en este núcleo.

### D-05 — Tiempo y fechas sin dependencia de formato visual

| Opción | A favor | En contra |
|---|---|---|
| A: `Reloj` inyectable más tipos puros `FechaCivil` y `FechaHoraUtc` | Pruebas deterministas y representación canónica | Requiere conversión explícita en límites |
| B: Usar `new Date()` en todo el código | Menos abstracciones | Oculta el tiempo, dificulta pruebas y mezcla fecha civil con instante |

- **Decisión:** A, aprobada al solicitar el plan listo para fase 3.
- **Detalle:** `FechaCivil` conserva `AAAA-MM-DD` y valida una fecha real; `FechaHoraUtc` normaliza a ISO 8601 UTC y evita exponer una referencia `Date` mutable. `RelojSistema` es el único adaptador incluido.
- **Fuera de alcance:** calendarios laborales, vencimientos de negocio y presentación `DD/MM/AAAA`.

### D-06 — Dinero como representación exacta, sin conversión cambiaria

| Opción | A favor | En contra |
|---|---|---|
| A: `Dinero` con monto decimal string y `CodigoMoneda` | Evita `number`, conserva exactitud y unifica transporte | No resuelve por sí solo cálculos ni cotizaciones |
| B: Usar `number` | API sencilla | Introduce errores binarios y contradice `convenciones.md` §2 |
| C: Incluir conversión entre monedas | API aparentemente completa | Requiere cotización, fecha, fuente y redondeo pertenecientes a `ECO` |

- **Decisión:** A, aprobada al solicitar el plan listo para fase 3.
- **Detalle:** valida forma decimal con punto, signo y código de tres letras mayúsculas; ofrece igualdad y serialización. No suma, redondea ni convierte importes hasta que un módulo dueño defina precisión y política.

### D-07 — Fundación y adopción en entregas separadas

| Opción | A favor | En contra |
|---|---|---|
| A: Este plan crea el núcleo; `ACC` y `EMP` migran con tareas posteriores | Reduce regresiones y permite verificar cada consumidor contra su especificación | Mantiene duplicación durante la transición |
| B: Crear el núcleo y migrar ambos módulos en el mismo plan | Elimina duplicación de una vez | Mezcla tres alcances y dificulta atribuir regresiones |

- **Decisión:** A, aprobada al solicitar el plan listo para fase 3.
- **Orden posterior recomendado:** primero `ACC`, porque construye el contexto autenticado y ya posee el `Reloj`; después `EMP`.
- **Activación global:** el primer plan de adopción registra correlación, `ValidationPipe` y filtro común en el punto de composición.

## 5. Tareas

| ID | Tarea | Capa | Implementa | Archivos previstos | Verificación |
|---|---|---|---|---|---|
| T01 | Crear errores base, categorías y objetos de valor técnicos | Dominio | D-02, D-04, D-05, D-06 | `src/comun/dominio/errores/categoria-error.ts`; `error-dominio.base.ts`; `objetos-valor/identificador-uuid.ts`; `fecha-civil.ts`; `fecha-hora-utc.ts`; `codigo-moneda.ts`; `dinero.ts`; `index.ts`; pruebas de Dominio | Casos válidos, límites e inválidos; inmutabilidad; ningún import de NestJS, TypeORM o `uuid`; cobertura de Dominio según §6 |
| T02 | Crear contratos de Aplicación | Aplicación | D-02, D-03, D-04, D-05; arquitectura §13.3 | `src/comun/aplicacion/errores/error-aplicacion.base.ts`; `modelos-lectura/criterios-paginacion.ts`; `resultado-paginado.ts`; `puertos/contexto-solicitud.ts`; `generador-identificadores.ts`; `reloj.ts`; `index.ts`; pruebas de Aplicación | Contexto contiene `solicitudId`, actor, Cuenta, Empresa, Sesión, roles, permisos, alcance y Empleado opcional; paginación respeta 25/100/0; dobles de generador y reloj son sustituibles |
| T03 | Incorporar generación UUID v7 y reloj del sistema | Infraestructura | D-04, D-05 | `package.json`; `yarn.lock`; `src/comun/infraestructura/adaptadores/generador-uuid-v7.ts`; `reloj-sistema.ts`; `index.ts`; pruebas de Infraestructura | `uuid@11.1.0` queda fijada sin rango; cada ID es UUID v7; el adaptador implementa el puerto; el reloj devuelve instantes válidos sin depender de NestJS |
| T04 | Implementar paginación TypeORM por composición | Infraestructura | D-03; convenciones §3.2–§3.3 | `src/comun/infraestructura/persistencia/paginador-typeorm.ts`; pruebas de Infraestructura | Dobles de `SelectQueryBuilder` prueban filtros previos, `skip`, `take`, orden estable con desempate, total y respuesta canónica; no existe repositorio base CRUD |
| T05 | Crear componentes comunes de Presentación | Presentación | D-02, D-03, D-07; convenciones §3–§4 | `src/comun/presentacion/dtos/consulta-paginada.dto.ts`; `respuesta-paginada.dto.ts`; `decoradores/contexto-usuario.decorador.ts`; `version-if-match.decorador.ts`; `idempotency-key.decorador.ts`; `filtros/filtro-excepciones-rfc9457.ts`; `index.ts`; pruebas de Presentación | DTO aplica límites; contexto solo sale de `request.contexto`; headers inválidos se rechazan; filtro produce `application/problem+json` con `code`, `solicitudId`, detalle seguro y mapeo de todas las categorías; error desconocido no filtra mensaje interno |
| T06 | Publicar únicamente APIs explícitas por capa | Todas | arquitectura §6.1 y §7 | Archivos `index.ts` de cada capa | Los módulos consumidores no necesitan rutas internas; ningún índice reexporta una capa externa o elemento de otra capa en dirección prohibida |
| T07 | Blindar fronteras con Dependency Cruiser | Calidad / Arquitectura | `ADR-0012`; arquitectura §17 | `.dependency-cruiser.js`; pruebas arquitectónicas mínimas bajo `src/comun/pruebas/arquitectura/` si la herramienta requiere casos positivos/negativos | Falla si `src/comun` importa `src/modulos`, si Dominio importa dependencias externas o si un módulo importa una capa común más externa; pasa con dependencias permitidas |
| T08 | Ejecutar verificación integral y registrar evidencia | Calidad | Todas | Secciones 8 y 9 de este plan | Pasan unitarias del núcleo, cobertura, arquitectura, formato, lint sin correcciones pendientes, typecheck, build y suites completas de `EMP` y `ACC` |

## 6. Verificación y riesgos

### Controles

| Control | Cubre | Comando previsto |
|---|---|---|
| Unitarias comunes | T01–T05 | `yarn test --runInBand --runTestsByPath` sobre los `*.spec.ts` de `src/comun/pruebas/` |
| Cobertura | Umbrales globales y de Dominio/Aplicación | `yarn test:cov --runInBand` con alcance documentado en la evidencia |
| Arquitectura | T06–T07 | `yarn test:arquitectura` |
| Formato | Archivos nuevos y modificados | `yarn format:check` |
| Lint | Calidad estática | `yarn lint` y revisión posterior de `git diff` porque el script aplica `--fix` |
| Tipado | Contratos y genéricos | `yarn typecheck` |
| Compilación | Compatibilidad NestJS/CommonJS y `uuid@11.1.0` | `yarn build` |
| No regresión | Módulos implementados | `yarn test --runInBand src/modulos/empresas src/modulos/identidad-acceso` |

### Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación / evidencia esperada |
|---|---|---|
| `src/comun` se convierte en un cajón de sastre | Acoplamiento transversal | Dependency Cruiser, exports por capa y prohibición explícita de negocio |
| Una categoría semántica no representa un error futuro | Mapeo HTTP incorrecto | Categorías cerradas iniciales; ampliar la base común mediante una tarea técnica, sin mover el error concreto |
| `uuid@11.1.0` no funciona con Node 24, Jest o el build CommonJS | Fallo en ejecución o pruebas | Verificar import real mediante unitarias, `typecheck` y `build`; si falla, bloquear el plan y volver a fase 2 para elegir otra implementación, sin escribir un UUID v7 manual |
| Se asume orden total por UUID v7 | Orden funcional incorrecto | No usar el ID como sustituto de una fecha ni prometer monotonía entre procesos; cada consulta declara su orden |
| `Dinero` incorpora reglas financieras implícitas | Resultados incorrectos | Limitarlo a validación, igualdad y serialización; sin aritmética ni conversión |
| Activar el filtro antes de migrar consumidores | Errores funcionales convertidos en 500 | Este plan no toca el bootstrap; activación junto con la migración de `ACC` |

- **Migración de datos:** No aplica.
- **Rollback:** retirar los imports que pudieran agregarse durante fase 3, revertir los archivos de `src/comun/`, las reglas de Dependency Cruiser y la dependencia `uuid`; no hay datos que restaurar.

## 7. Cambios de especificación

| ID | Cambio | Motivo |
|---|---|---|
| Ninguno | No cambia reglas, requerimientos, casos de uso, permisos ni contratos funcionales | El plan implementa decisiones técnicas ya aprobadas en archivos raíz y `ADR-0012` |

**Aprobación del plan:** Aprobado por el Ingeniero el 2026-11-12 mediante la instrucción de mejorar el plan y dejarlo listo para fase 3.

---

## 8. Registro de ejecución

| Tarea | Commit | Estado | Notas o desviaciones |
|---|---|---|---|
| T01 | ca12ad7 | Completada | Errores base, categorías y objetos de valor técnicos en src/comun/dominio |
| T02 | | Completada | Contratos, puertos y modelos de lectura en src/comun/aplicacion |
| T03 | | Pendiente | |
| T04 | | Pendiente | |
| T05 | | Pendiente | |
| T06 | | Pendiente | |
| T07 | | Pendiente | |
| T08 | | Pendiente | |

## 9. Evidencia

| Control | Resultado | Comando ejecutado | Observado |
|---|---|---|---|
| | | | |

## 10. Cierre

- **Conformidad:** Pendiente
- **Desviaciones:** Pendiente
- **Ítems que pasan a Implementado:** `CMN-TASK-001`
- **Tarea que pasa a Completada:** `CMN-TASK-001`
- **Revisor:** Pendiente
- **Estado final:** Aprobado
