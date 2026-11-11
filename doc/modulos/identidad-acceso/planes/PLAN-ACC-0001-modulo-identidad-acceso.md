---
type: plan
id: PLAN-ACC-0001
title: "Módulo Identidad y acceso completo"
module: "ACC"
task:
    - ACC-TASK-002
    - ACC-TASK-003
    - ACC-TASK-004
status: En ejecución
mode: estandar
created: 2026-11-10
updated: 2026-11-11
approved_by: Parodi Lucas - 11/11/2026
---

# PLAN-ACC-0001 — Módulo Identidad y acceso completo

## 1. Objetivo y alcance

- **Tareas:** `ACC-TASK-002`, `ACC-TASK-003`, `ACC-TASK-004`.
- **Implementa:** `ACC-UC-001` a `ACC-UC-012`, `ACC-BR-001` a `ACC-BR-022` y `ACC-ENT-001` a `ACC-ENT-005`.
- **Resultado observable:** Identidad y acceso queda operativo de extremo a extremo para Cuentas de Empresa, autenticación, autorización, sesiones, roles, canales, credenciales, vinculación opcional con Empleados, identidad de plataforma e intervenciones de soporte, respetando el aislamiento por Empresa.
- **Integraciones incluidas:** resolución de Empresa y estado mediante `EMP`; habilitación o vinculación laboral iniciada por `PER`; verificación provisional y reemplazable del cupo de acceso de `SUS`; provisión de `ContextoSolicitud` autenticado a los módulos consumidores.
- **No incluye:** ciclo de vida de Empresa, ficha laboral de Empleado, facturación o planes comerciales, administración independiente de dispositivos, cierre voluntario de sesiones ni capacidades fuera de los casos de uso aprobados.

La Cuenta de Empresa es la identidad de acceso tenant-scoped. No se crea una entidad Persona ni se usa `personaId`. `empleadoId` es opcional conforme a `ADR-0010`: el Administrador inicial puede no tener ficha laboral y los accesos con rol Capataz o Empleado se originan desde un Empleado activo validado por `PER`.

## 2. Preparación

- [x] La especificación funcional del alcance está aprobada, incluidas `ACC-Q-019`, `ACC-Q-020` y `ACC-Q-021`.
- [x] El modelo de Cuenta de Empresa y vínculo laboral está resuelto por `ADR-0010`.
- [x] El módulo `EMP` tiene implementado su ciclo funcional y define `EMP-DEP-003` para exponer identidad, alias y estado a ACC.
- [x] Las dependencias con `PER` y `SUS` tienen una frontera técnica planificada sin lectura directa de tablas ajenas.
- [x] El plan contempla dominio, aplicación, infraestructura, API, migraciones, composición, pruebas y seguridad.
- [x] El Ingeniero aprobó las decisiones `D-04`, `D-07` y `D-09` de este plan (11/11/2026).
- [x] El contrato OpenAPI definitivo fue alineado con las decisiones aprobadas y validado con Spectral.

**Estado de preparación:** el plan queda `En revisión`. No habilita Fase 3 ni cambia las tareas a `Planificada` hasta que el Ingeniero apruebe las decisiones pendientes y el contrato resultante.

## 3. Contexto actual

### 3.1 Especificación y documentación

- [H] `ACC-TASK-001` está completada y el alcance aprobado contiene doce casos de uso.
- [H] `ADR-0004` y `ADR-0006` fijan sesiones persistentes, JWT de acceso de 15 minutos, renovación de hasta 30 días, firma asimétrica, Argon2id, rotación y detección de reutilización.
- [H] `ADR-0010` elimina `personaId`, conserva `empleadoId` opcional y separa la Cuenta de Empresa de la ficha laboral.
- [H] La matriz de actores y permisos está en `identidad-acceso.use-case.md`; el catálogo fijo de roles está en `ACC-ENT-002`.
- [H] El OpenAPI existente necesita completar `ACC-UC-012`, retirar `empresaId` como autoridad en rutas tenant, separar los flujos de plataforma y declarar los códigos de excepción de cada operación.

### 3.2 Código e integración existentes

- [H] El proyecto ya incluye `argon2`, NestJS, TypeORM, PostgreSQL, `class-validator`, Pino, Jest, Supertest y Spectral.
- [H] `EmpresasModule` expone casos de uso, pero ACC necesita un contrato público estrecho para resolver `{id, alias, estado}` antes de autenticar, sin usar el caso de uso HTTP autorizado de consulta de Empresa.
- [H] `src/app.module.ts` todavía no compone los módulos de negocio ni la persistencia global.
- [H] No existe todavía implementación de ACC, configuración TypeORM de aplicación ni migración inicial de Identidad y acceso.
- [H] El decorador de contexto actual de `EMP` acepta cabeceras controladas por el cliente; debe sustituirse por el `ContextoSolicitud` construido desde una sesión validada por ACC.
- [H] `PER` y `SUS` no tienen todavía adaptadores ejecutables para ACC; el diseño debe fallar de forma cerrada cuando una validación obligatoria no esté disponible.

### 3.3 Restricciones de arquitectura

- ACC no leerá tablas de `EMP`, `PER` ni `SUS`.
- Ningún controlador decidirá permisos o reglas; invocará un único caso de uso.
- `empresaId` de una operación tenant provendrá del contexto autenticado, no de un valor confiable enviado por el cliente.
- SuperAdministrador no pertenecerá a una Empresa ficticia y no se convertirá en una Cuenta de Empresa.
- Las claves, contraseñas y tokens nunca se registrarán ni se persistirán en claro.

## 4. Decisiones

### D-01 — Perfil de contraseñas

| Opción                                                                                  | A favor                                                                                            | En contra                                                                  |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| A: Argon2id con perfil versionado `m=19456 KiB`, `t=2`, `p=1`, sal aleatoria y hash PHC | Cumple `ADR-0006`, parte de un mínimo público vigente y permite elevar el costo por configuración. | Debe medirse en el hardware real y actualizarse con el tiempo.             |
| B: usar los valores por defecto de la biblioteca sin fijarlos                           | Menos configuración inicial.                                                                       | Un cambio de biblioteca o versión altera el perfil sin decisión explícita. |

- **Recomendación:** A. El perfil es un mínimo inicial; Fase 3 debe medirlo y elevar memoria o iteraciones si el entorno lo permite sin incumplir los NFR.
- **Fuente técnica:** [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) y [node-argon2](https://github.com/ranisalt/node-argon2).
- **Estado:** propuesta local del plan, pendiente de aprobación conjunta con el plan.

### D-02 — Firma y contenido de los tokens de acceso

| Opción                                                                                               | A favor                                                                                                               | En contra                                                    |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| A: JWT asimétrico EdDSA mediante `jose`, con `kid`, `iss`, `aud`, `sub`, `jti`, `sid`, `iat` y `exp` | Separa firma y verificación, permite rotación por identificador de clave y evita implementar criptografía JWT manual. | Agrega una dependencia y exige operación segura del llavero. |
| B: JWT simétrico                                                                                     | Configuración menor.                                                                                                  | Contradice la firma asimétrica aceptada en `ADR-0006`.       |

- **Recomendación:** A.
- **Detalle:** el token tenant contendrá identificadores y autorizaciones mínimas; los datos vigentes se revalidarán contra la sesión y la cuenta. El token de plataforma tendrá audiencia distinta y nunca podrá actuar como token tenant.
- **Estado:** propuesta local del plan, pendiente de aprobación conjunta con el plan.

### D-03 — Renovación, revocación y reutilización

| Opción                                                                                                                                         | A favor                                                       | En contra                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------- |
| A: token opaco aleatorio de 256 bits, persistir solo SHA-256, rotación transaccional por familia y revocación de la familia ante reutilización | Detecta robo, evita almacenar el secreto y cumple `ADR-0006`. | Requiere bloqueo o actualización optimista en cada renovación. |
| B: refresh JWT sin estado                                                                                                                      | Menos accesos a base de datos.                                | No permite la revocación ni detección exigidas.                |

- **Recomendación:** A.
- **Estado:** propuesta local del plan, pendiente de aprobación conjunta con el plan.

### D-04 — Permisos en `ContextoSolicitud`

| Opción                                                                                                                   | A favor                                                                  | En contra                                                                       |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| A: usar los IDs estables de caso de uso (`ACC-UC-001`, etc.) como códigos de permiso y derivarlos de la matriz rol/canal | Evita un segundo catálogo equivalente y hace trazable cada autorización. | Acopla el nombre del permiso al caso de uso documentado.                        |
| B: crear códigos independientes como `acc.cuentas.crear`                                                                 | Permite granularidad diferente en el futuro.                             | Duplica la taxonomía actual y requiere dueño, nomenclatura y mapeo adicionales. |

- **Recomendación:** A.
- **Impacto:** transversal; debe aprobarse mediante `ADR-0011` antes de Fase 3.
- **Estado:** aprobada la opción A por el Ingeniero (11/11/2026); formalizada en ADR-0011.

### D-05 — Contrato público con Empresa

| Opción                                                                                            | A favor                                                                                 | En contra                                                    |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| A: `EMP` exporta un puerto de aplicación de lectura estrecha para resolver Empresa por ID o alias | Respeta propiedad de datos y permite validar login y estado sin eludir el módulo dueño. | Requiere una adición pequeña a la composición de `EMP`.      |
| B: ACC consulta las tablas de Empresa                                                             | Menos código inicial.                                                                   | Viola la arquitectura modular y duplica criterios de estado. |

- **Recomendación:** A.
- **Contrato previsto:** entrada `id` o `alias`; salida mínima `empresaId`, `alias`, `estado`; ausencia o indisponibilidad tipadas. No expone CUIT, configuración ni otros datos de Empresa.
- **Estado:** propuesta local del plan, pendiente de aprobación conjunta con el plan.

### D-06 — Integración con Personal sin ciclo de dependencias

| Opción                                                                                                             | A favor                                                                                     | En contra                                                                    |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| A: `PER` valida al Empleado y llama al contrato público de ACC para crear, vincular, suspender o revocar su acceso | Respeta `ADR-0010`, mantiene a PER como dueño laboral y evita que ACC lea datos personales. | La habilitación laboral completa depende de implementar el adaptador en PER. |
| B: ACC consulta directamente Empleados o sus tablas                                                                | Simplifica el primer flujo.                                                                 | Genera acoplamiento, duplica autorización laboral y puede formar un ciclo.   |

- **Recomendación:** A.
- **Contrato previsto:** comandos idempotentes con `empresaId`, `empleadoId`, datos de acceso necesarios y contexto del actor; ACC conserva únicamente la referencia y sus propios datos.
- **Estado:** propuesta local del plan, pendiente de aprobación conjunta con el plan.

### D-07 — Cupo de acceso antes de implementar SUS

| Opción                                                                                                                          | A favor                                                                            | En contra                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| A: puerto `VerificadorCupoAcceso` con adaptador provisional configurado explícitamente por Empresa y comportamiento fail-closed | Permite probar e integrar sin inventar planes comerciales ni ignorar `ACC-BR-006`. | Requiere cargar una configuración temporal y reemplazarla al implementar SUS. |
| B: cupo ilimitado implícito                                                                                                     | Permite crear cuentas sin configuración.                                           | Elude una regla aprobada y puede exceder la suscripción.                      |

- **Recomendación:** A. No habrá límite por defecto; una Empresa sin configuración devuelve `ACC_VALIDACION_COMERCIAL_NO_DISPONIBLE`.
- **Estado:** aprobada la opción A por el Ingeniero (11/11/2026).

### D-08 — Contexto temporal de soporte

| Opción                                                                                                                                         | A favor                                                                                                     | En contra                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| A: identificador opaco persistido y enviado en `X-Contexto-Soporte-Id`, ligado a usuario y sesión de plataforma, Empresa, motivo y vencimiento | Mantiene identidad real, alcance explícito y auditoría; no convierte al SuperAdministrador en otro usuario. | Cada operación asistida debe validarlo contra almacenamiento.               |
| B: `empresaId` y motivo enviados libremente en cada solicitud                                                                                  | Menor estado.                                                                                               | Permite alterar el alcance y no prueba que exista una intervención vigente. |

- **Recomendación:** A, con duración configurable y valor inicial propuesto de 15 minutos.
- **Estado:** propuesta local del plan, pendiente de aprobación conjunta con el plan.

### D-09 — Autenticación de plataforma

| Opción                                                                                                                                                                   | A favor                                                                          | En contra                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| A: identidad `UsuarioPlataforma` persistente con credencial propia, sesión persistente y tokens de audiencia `plataforma`; `.env` solo habilita bootstrap o recuperación | Cumple `ACC-Q-021`, separa plataforma de tenants y hace auditable al actor real. | Requiere completar en la especificación los atributos de credencial y el ingreso de plataforma. |
| B: proveedor de identidad externo mediante puerto                                                                                                                        | Evita custodiar otra contraseña en ACC.                                          | Agrega un sistema no previsto, configuración externa y un contrato todavía inexistente.         |
| C: secreto permanente de `.env` para todas las operaciones                                                                                                               | Implementación menor.                                                            | Contradice el alcance aprobado de `.env` y no representa una identidad auditable.               |

- **Recomendación:** A.
- **Estado:** aprobada la opción A por el Ingeniero (11/11/2026).

### D-10 — Persistencia, unicidad y concurrencia

- PostgreSQL y TypeORM conforme a `ADR-0003`; migraciones SQL versionadas y reversibles.
- Tablas propias de ACC para cuentas, roles de cuenta, sesiones tenant, usuarios y sesiones de plataforma, intervenciones de soporte e idempotencia.
- Unicidad de correo normalizado dentro de una Empresa y unicidad parcial de `(empresa_id, empleado_id)` cuando existe `empleadoId`.
- No se crean claves foráneas a tablas de otros módulos; las referencias externas se validan por contratos públicos.
- `version` optimista en la Cuenta de Empresa; rotación de refresh y consumo de idempotencia mediante transacción y bloqueo de fila.
- Se persisten hashes de contraseña y refresh; jamás contraseñas ni refresh tokens en claro.
- **Estado:** propuesta local del plan, pendiente de aprobación conjunta con el plan.

## 5. Tareas de implementación

El orden es obligatorio: cada tarea debe quedar verificada antes de continuar con la siguiente capa. La Fase 3 podrá dividirlas en commits pequeños sin cambiar el alcance.

| ID  | Tarea                                                                                     | Capa                       | Implementa                                                           | Archivos previstos                                                                                                       | Verificación de salida                                                                                                               |
| --- | ----------------------------------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| T00 | Alinear OpenAPI, contratos internos y catálogo de errores con las decisiones aprobadas    | Contrato                   | `ACC-UC-001` a `ACC-UC-012`                                          | `doc/modulos/identidad-acceso/contratos/openapi.yaml`, `contratos/README.md`                                             | Cada operación tiene `operationId`, `x-use-case`, `x-business-rules` y todos sus códigos de excepción; `yarn spectral lint ...` pasa |
| T01 | Crear estructura hexagonal ACC, tokens de inyección y convenciones de pruebas             | Base técnica               | `ADR-0002`, `ADR-0009`                                               | `src/modulos/identidad-acceso/`, `src/modulos/identidad-acceso/identidad-acceso.module.ts`                               | Prueba de arquitectura y compilación sin imports de infraestructura desde Dominio/Aplicación                                         |
| T02 | Implementar enumeraciones, objetos de valor y errores tipados                             | Dominio                    | `ACC-BR-003`, `ACC-BR-018` a `ACC-BR-022`                            | `dominio/enumeraciones/`, `dominio/objetos-valor/`, `dominio/errores/`                                                   | Unitarias con los ejemplos de cada BR y sin dependencias de Nest/TypeORM                                                             |
| T03 | Implementar agregados y políticas de Cuenta, Sesión e Intervención de soporte             | Dominio                    | `ACC-ENT-001` a `ACC-ENT-005`, `ACC-BR-001` a `ACC-BR-022`           | `dominio/entidades/`, `dominio/servicios/`                                                                               | Unitarias de invariantes, transiciones, roles/canales y revocación                                                                   |
| T04 | Definir puertos de persistencia, seguridad, reloj, idempotencia y módulos externos        | Aplicación                 | `ACC-DEP-001` a `ACC-DEP-004`                                        | `aplicacion/puertos/entrada/`, `aplicacion/puertos/salida/`                                                              | Compilación y pruebas de contrato con dobles; ningún puerto expone entidades internas ajenas                                         |
| T05 | Implementar gestión de Cuentas de Empresa                                                 | Aplicación                 | `ACC-UC-001`, `ACC-UC-008`, `ACC-UC-010`, `ACC-UC-012`               | `aplicacion/comandos/`, `aplicacion/consultas/`                                                                          | Unitarias por flujo, alternativa y excepción; aislamiento tenant y `If-Match`                                                        |
| T06 | Implementar autenticación tenant, autorización y credenciales                             | Aplicación                 | `ACC-UC-002`, `ACC-UC-003`, `ACC-UC-004`, `ACC-UC-005`, `ACC-UC-009` | `aplicacion/comandos/`, `aplicacion/consultas/`                                                                          | Unitarias de login, estado de Empresa/cuenta, renovación, reutilización, cambio y restablecimiento                                   |
| T07 | Implementar identidad de plataforma y soporte                                             | Aplicación                 | `ACC-UC-006`, `ACC-UC-007`, `ACC-UC-011`                             | `aplicacion/comandos/`, `aplicacion/consultas/`                                                                          | Unitarias de bootstrap único, sesión de plataforma, alcance temporal y auditoría                                                     |
| T08 | Implementar hashing Argon2id, JWT asimétrico y refresh opaco                              | Infraestructura            | `ADR-0006`, D-01 a D-03                                              | `infraestructura/seguridad/`                                                                                             | Pruebas de vectores válidos/inválidos, expiración, audiencia, `kid`, rotación, carrera y reutilización                               |
| T09 | Crear entidades TypeORM, mapeadores, repositorios y unidad transaccional                  | Infraestructura            | `ACC-ENT-001` a `ACC-ENT-005`, D-10                                  | `infraestructura/persistencia/typeorm/`                                                                                  | Integración real PostgreSQL: round-trip, unicidades, concurrencia, filtros tenant y revocación                                       |
| T10 | Crear migración inicial y rollback                                                        | Infraestructura            | D-10                                                                 | `migraciones/identidad-acceso/`                                                                                          | Migrar desde cero, inspeccionar restricciones e índices, revertir y volver a aplicar                                                 |
| T11 | Incorporar el resolvedor público mínimo de Empresa y su adaptador ACC                     | Integración                | `ACC-DEP-001`, `EMP-DEP-003`, D-05                                   | `src/modulos/empresas/aplicacion/`, `src/modulos/empresas/empresas.module.ts`, `infraestructura/integraciones/empresa/`  | Contrato por ID/alias, estados `ACTIVA`/`SUSPENDIDA`/`CERRADA`, ausencia e indisponibilidad                                          |
| T12 | Implementar contratos de Personal y verificador provisional de Suscripciones              | Integración                | `ACC-DEP-002`, `ACC-DEP-003`, D-06 y D-07                            | `aplicacion/puertos/entrada/`, `infraestructura/integraciones/personal/`, `infraestructura/integraciones/suscripciones/` | Pruebas de Empleado activo/misma Empresa, idempotencia, suspensión/revocación y fail-closed de cupo                                  |
| T13 | Implementar DTO, controladores y errores RFC 9457                                         | Presentación               | `ACC-UC-001` a `ACC-UC-012`                                          | `presentacion/dto/`, `presentacion/controladores/`, `presentacion/filtros/`                                              | Pruebas HTTP por `operationId`, validación de entrada y código de error exacto                                                       |
| T14 | Implementar guardias y construcción de `ContextoSolicitud`; integrar módulos consumidores | Presentación / Composición | `ADR-0004`, D-04, D-08                                               | `presentacion/guardias/`, `presentacion/decoradores/`, `src/app.module.ts`, `src/main.ts`, frontera HTTP de `EMP`        | El cliente no puede forjar rol, Empresa, permisos ni soporte mediante cabeceras; regresión completa de EMP                           |
| T15 | Configurar persistencia, llaves, secretos y observabilidad segura                         | Composición                | `ADR-0003`, `ADR-0006`, `convenciones.md`                            | configuración de aplicación, `package.json`, `.env.example` si existe                                                    | Inicio falla de forma clara ante secretos ausentes; logs correlacionables sin datos sensibles                                        |
| T16 | Implementar aceptación, integración, contrato y seguridad                                 | Calidad                    | `@ACC-UC-001` a `@ACC-UC-012`                                        | `src/modulos/identidad-acceso/pruebas/`, `test/`                                                                         | Un test por escenario Gherkin, pruebas multiempresa negativas, OpenAPI, migración y flujo e2e                                        |
| T17 | Consolidar evidencia y documentación de ejecución                                         | Cierre de Fase 3           | Plan completo                                                        | §8 y §9 de este archivo                                                                                                  | Evidencia reproducible de cada control, sin marcar elementos Implementados antes de Fase 4                                           |

## 6. Verificación y riesgos

### 6.1 Controles obligatorios

| Control              | Cobertura mínima                                         | Comando previsto                         |
| -------------------- | -------------------------------------------------------- | ---------------------------------------- |
| Formato              | Archivos modificados                                     | `yarn format:check`                      |
| Tipos y build        | Proyecto completo                                        | `yarn typecheck` y `yarn build`          |
| Lint                 | Proyecto completo                                        | `yarn lint`                              |
| Dominio y aplicación | `ACC-BR-001` a `ACC-BR-022`; `ACC-UC-001` a `ACC-UC-012` | `yarn test:modulo identidad-acceso`      |
| Arquitectura         | límites de capas y módulos                               | `yarn test:arquitectura`                 |
| Integración          | PostgreSQL, repositorios, migraciones y concurrencia     | `yarn test:integracion identidad-acceso` |
| Contrato             | OpenAPI y códigos de error                               | `yarn test:contratos identidad-acceso`   |
| Aceptación/e2e       | `@ACC-UC-001` a `@ACC-UC-012`                            | `yarn test:e2e`                          |
| Cobertura            | umbrales globales definidos por el proyecto              | `yarn test:coverage`                     |

Si un script todavía no existe, T01/T15 deberá incorporarlo usando las herramientas ya elegidas por el proyecto; la ejecución no puede registrarse como aprobada hasta que el comando exista y pase.

### 6.2 Matriz de riesgos

| Riesgo                                                | Impacto | Mitigación planificada                                                                                  | Evidencia          |
| ----------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------- | ------------------ |
| Cruce de datos entre Empresas                         | Crítico | Empresa solo desde sesión validada, filtros tenant en repositorios y pruebas negativas con dos Empresas | T05, T09, T14, T16 |
| Cabeceras falsificadas de identidad                   | Crítico | retirar el contexto confiado al cliente y construirlo en guardias desde token + sesión                  | T14                |
| Robo o reutilización de refresh                       | Alto    | hash, rotación atómica, familia, revocación y prueba concurrente                                        | T06, T08, T09      |
| Usuario o Empresa suspendidos conservan acceso        | Alto    | revalidación de sesión/cuenta/Empresa y revocación; tokens cortos                                       | T06, T11, T16      |
| SuperAdministrador opera fuera del soporte autorizado | Crítico | audiencia separada, contexto opaco ligado a sesión/Empresa/motivo/vencimiento y auditoría               | T07, T14, T16      |
| Duplicación o pérdida por reintentos                  | Alto    | idempotencia persistida y transacciones                                                                 | T05, T07, T09      |
| Carrera entre cambios de roles, estado y renovación   | Alto    | versión optimista y bloqueo transaccional de sesión                                                     | T05, T06, T09      |
| Dependencias PER/SUS todavía no implementadas         | Alto    | contratos explícitos, dobles en pruebas y adaptadores fail-closed; sin acceso directo a tablas          | T04, T12           |
| Parámetros Argon2 insuficientes o costosos            | Medio   | perfil versionado y medición en entorno de despliegue                                                   | T08, T16           |
| Claves de firma mal rotadas                           | Alto    | llavero con `kid`, clave activa y claves públicas previas; pruebas de rotación                          | T08, T15           |
| Regresión del módulo Empresa                          | Alto    | conservar casos de uso y reemplazar únicamente la frontera de identidad; ejecutar su suite completa     | T11, T14, T16      |

### 6.3 Migración y rollback

- La migración es inicial y no transforma datos previos de ACC.
- La subida crea únicamente objetos propios de ACC, restricciones e índices.
- El rollback elimina esos objetos en orden inverso solo si no existe información productiva; una vez que haya datos, el rollback operativo será una migración compensatoria y no un borrado.
- La rotación de claves y parámetros de hash es compatible hacia atrás: el verificador acepta versiones vigentes y actualiza el hash después de una autenticación correcta cuando corresponda.

## 7. Cambios de especificación requeridos para aprobar

| ID afectado                                               | Propuesta                                                                                                                                                                                | Motivo                                                                                         | Estado                                                            |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `ACC-ENT-004`, `ACC-UC-006` y nuevo ingreso de plataforma | Incorporar identificador de acceso/credencial protegida y Sesión de Plataforma; definir el ingreso del SuperAdministrador persistente. `.env` queda limitado a bootstrap o recuperación. | La autenticación exigida por `ACC-Q-021` no tiene todavía atributos ni caso de uso ejecutable. | Aprobado por el Ingeniero (11/11/2026); recomendación D-09 A      |
| `ACC-ENT-001.nombreMostrado`                              | Fijar longitud máxima propuesta de 150 caracteres.                                                                                                                                       | Todo texto persistido requiere un máximo y el modelo actual no lo declara.                     | Aprobado por el Ingeniero (11/11/2026)                            |
| `arquitectura.md` §13.3                                   | Adoptar los IDs de caso de uso como códigos de permiso del contexto.                                                                                                                     | Evita un catálogo paralelo y completa la representación técnica de permisos.                   | Aprobado por el Ingeniero (11/11/2026); formalizado en `ADR-0011` |

Estos cambios no se aplican a los archivos dueños durante esta revisión. La aprobación del plan autoriza su corrección en la fase documental correspondiente o mediante la excepción expresa del Ingeniero, antes de ejecutar T01.

### Condiciones de aprobación

1. Elegir D-04, D-07 y D-09.
2. Aprobar o ajustar los tres cambios de especificación de §7.
3. Alinear y validar el OpenAPI según T00.
4. Cambiar este plan a `Aprobado` y las tres tareas a `Planificada` únicamente por decisión del Ingeniero.

---

## 8. Registro de ejecución

| Tarea | Commit | Estado    | Notas o desviaciones |
| ----- | ------ | --------- | -------------------- |
| T00   | 8653f81| Completada| Contrato OpenAPI alineado con UC-001..UC-012, códigos de excepción y validado con Spectral |
| T01   | 5338f93| Completada| Estructura hexagonal, módulo NestJS, comandos de calidad y prueba de arquitectura depcruise |
| T02   | 86d137c| Completada| Enumeraciones, objetos de valor y errores tipados de dominio (ACC-BR-003, ACC-BR-018..022) |
| T03   | 41235e1| Completada| Agregados Cuenta, Sesión, UsuarioPlataforma, IntervencionSoporte y contratos de repositorios |
| T04   | dcf7a93| Completada| Puertos de aplicación (ResolvedorEmpresa, Cupo, Empleado, Hash, Tokens, Reloj, Consultas) |
| T05   | d8722ae| Completada| Casos de uso de gestión de cuentas (ACC-UC-001, ACC-UC-008, ACC-UC-010, ACC-UC-012) |
| T06   | 650abb6| Completada| Autenticación tenant, autorización, renovación con rotación y cambio/restablecimiento de credenciales |
| T07   | 77a621f| Completada| Casos de uso de plataforma y soporte (ACC-UC-006 bootstrap, ACC-UC-007, ACC-UC-011) |
| T08   |        | Pendiente |                      |
| T09   |        | Pendiente |                      |
| T10   |        | Pendiente |                      |
| T11   |        | Pendiente |                      |
| T12   |        | Pendiente |                      |
| T13   |        | Pendiente |                      |
| T14   |        | Pendiente |                      |
| T15   |        | Pendiente |                      |
| T16   |        | Pendiente |                      |
| T17   |        | Pendiente |                      |

## 9. Evidencia

Pendiente de Fase 3. No se registra como evidencia ninguna comprobación no ejecutada contra la implementación resultante.

## 10. Cierre

- **Conformidad:** pendiente de ejecución en Fase 3 y revisión independiente en Fase 4.
- **Desviaciones:** ninguna registrada.
- **Ítems que podrán pasar a Implementado:** `ACC-REQ-001` a `ACC-REQ-012`, `ACC-UC-001` a `ACC-UC-012`, `ACC-BR-001` a `ACC-BR-022` y `ACC-ENT-001` a `ACC-ENT-005`, solo después de la verificación correspondiente.
- **Tareas que podrán pasar a Completada:** `ACC-TASK-002`, `ACC-TASK-003`, `ACC-TASK-004`.
- **Revisor:** pendiente de Fase 4.
- **Estado actual:** `Aprobado` (Parodi Lucas - 11/11/2026).
