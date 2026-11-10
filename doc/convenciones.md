---
type: conventions
status: Aprobado
owner: "Ingeniero"
---

# Convenciones técnicas

<!-- Qué define este archivo: doc/proceso/reglas-documentacion.md §3. -->

## 1. Herramientas y gestión de dependencias

- El runtime es una versión LTS mantenida de Node.js, fijada de forma exacta al inicializar el proyecto.
- TypeScript, NestJS, TypeORM, `pg`, PostgreSQL y PostGIS se fijan en versiones exactas y compatibles, verificadas contra sus fuentes oficiales al crear el proyecto.
- Se usa Yarn (v1.22.x o superior) con lockfile (`yarn.lock`) versionado.
- Se utiliza resolución estándar en `node_modules` para priorizar compatibilidad con NestJS y sus herramientas.
- En CI se instala con lockfile inmutable; una actualización de dependencias es un cambio explícito y revisable.
- TypeScript se configura en modo estricto. No se admiten errores de tipos ignorados sin justificación local.

Decisiones relacionadas: `ADR-0001`, `ADR-0003` y `ADR-0005`.

## 2. Tipos de datos

| Tipo | En la API | En persistencia | Regla |
|---|---|---|---|
| Identificador | string | `uuid` | UUID v7 generado por la aplicación; nunca lleva significado de negocio. |
| Texto | string | `varchar` o `text` | Cada atributo declara longitud máxima y normalización. |
| Entero | integer | tipo entero adecuado | Cada atributo declara rango; no se usa para decimales ni dinero. |
| Decimal | string decimal | `numeric(precision, scale)` | La precisión, escala y unidad son explícitas. Nunca se usa coma decimal en la API. |
| Dinero | objeto con `monto` y `moneda` | `numeric` y código de moneda | `monto` es string decimal y `moneda` usa ISO 4217, por ejemplo `ARS`. |
| Fecha civil | `AAAA-MM-DD` | `date` | En API y persistencia se conserva ISO 8601. En interfaces para personas se muestra `DD/MM/AAAA`. |
| FechaHora | ISO 8601 en UTC | `timestamptz` | Se recibe y devuelve con zona u offset; se normaliza a UTC. |
| Hora local | `HH:mm:ss` | `time` cuando corresponda | Solo se usa junto con una fecha y zona horaria conocidas. |
| Zona horaria | nombre IANA | texto | Ejemplo: `America/Argentina/Buenos_Aires`; no se guarda únicamente un offset. |
| Booleano | boolean | `boolean` | No se representa con `0`, `1`, `S` o `N`. |
| Enumeración | string en MAYÚSCULAS | texto o enum según el caso | Los valores se definen en el modelo de datos del módulo. |

`requerido`, `opcional` y `nullable` son conceptos distintos. Un campo requerido debe estar presente; uno opcional puede omitirse; uno nullable puede contener `null`.

### 2.1 Presentación de fechas

- Web, aplicación móvil, reportes y mensajes destinados a personas muestran fechas como `DD/MM/AAAA`.
- La API conserva `AAAA-MM-DD`, porque OpenAPI `format: date`, ISO 8601 y PostgreSQL usan ese orden sin ambigüedad.
- Los DTO no aceptan silenciosamente ambos formatos. La capa de interfaz convierte el formato visual antes de invocar la API.

## 3. API HTTP

### 3.1 Contrato y visualización

- Cada módulo publica un contrato OpenAPI 3.1 en `doc/modulos/<modulo>/contratos/openapi.yaml`.
- El contrato aprobado es la fuente de verdad. El código implementa el contrato y no lo redefine mediante decoradores.
- Swagger UI muestra de forma interactiva el OpenAPI aprobado.
- Swagger UI no reemplaza el archivo OpenAPI ni constituye una segunda fuente de definición.
- Spectral valida sintaxis y reglas comunes del contrato.
- Cada operación declara `operationId`, `x-use-case` y, cuando corresponda, `x-business-rules`.
- El prefijo de versión es `/api/v1`.

Decisión relacionada: `ADR-0005`.

### 3.2 Paginación en base de datos

- Las colecciones se paginan con `limite` y `desplazamiento` en la API, traducidos a `LIMIT` y `OFFSET` de PostgreSQL.
- `limite` predeterminado: 25.
- `limite` máximo: 100.
- `desplazamiento` predeterminado: 0 y nunca puede ser negativo.
- El repositorio aplica primero aislamiento por Empresa, filtros y orden; después ejecuta `LIMIT` y `OFFSET` en la base de datos.
- Está prohibido cargar la colección completa y paginarla en memoria.
- Toda paginación declara un orden estable y agrega el identificador como último desempate.
- La respuesta incluye `datos` y `paginacion` con `limite`, `desplazamiento` y `total`.
- El total se calcula en base de datos y puede omitirse únicamente cuando el contrato de una consulta especializada lo declare.

### 3.3 Filtros y orden

- Cada operación enumera los filtros y campos ordenables admitidos; no se aceptan nombres de columnas libres.
- Los filtros se aplican mediante parámetros de consulta con nombres en español.
- El orden usa `orden=<campo>:asc` o `orden=<campo>:desc`.
- Valores, campos y direcciones se validan antes de construir la consulta.
- Las consultas siempre incluyen el filtro de Empresa cuando los datos tienen alcance multiempresa.

### 3.4 Idempotencia

- Las escrituras que puedan repetirse aceptan `Idempotency-Key`.
- La sincronización móvil usa además un identificador UUID v7 de operación generado por el cliente.
- La misma clave, actor, Empresa y operación devuelve el resultado previamente confirmado; una carga diferente con la misma clave produce conflicto.
- Los registros técnicos de idempotencia se conservan al menos 180 días.
- Una regla funcional puede exigir conservar el identificador de origen durante toda la vida del registro creado.

### 3.5 Concurrencia

- Los maestros editables usan una versión numérica optimista.
- Las operaciones HTTP sensibles exponen la versión mediante ETag y requieren `If-Match` al modificar.
- Un conflicto de versión devuelve HTTP 409.
- Stock, dinero, cupos y límites concurrentes usan bloqueo transaccional, actualización atómica o una estrategia equivalente demostrable.
- Un `buscarPorId` seguido de una escritura no constituye por sí mismo una protección de concurrencia.

## 4. Errores

- Las respuestas de error siguen RFC 9457 y usan `application/problem+json`.
- `code` es estable, sigue `nomenclatura.md` y permite actuar sin analizar el texto.
- `solicitudId` correlaciona la respuesta con logs y auditoría.
- `errores` contiene problemas por campo únicamente cuando corresponde a validación de entrada.
- `detail` es seguro para el cliente y nunca contiene SQL, stack traces, tokens, rutas internas ni secretos.

Ejemplo:

```json
{
  "type": "about:blank",
  "title": "Datos inválidos",
  "status": 400,
  "code": "EMP_DATOS_INVALIDOS",
  "detail": "La solicitud contiene datos inválidos.",
  "instance": "/api/v1/empresas",
  "solicitudId": "019a0000-0000-7000-8000-000000000001",
  "errores": [
    {
      "campo": "nombre",
      "code": "REQUERIDO",
      "mensaje": "El nombre es obligatorio."
    }
  ]
}
```

| Situación | HTTP |
|---|---|
| JSON, parámetro o formato inválido | 400 |
| Autenticación ausente o inválida | 401 |
| Actor autenticado sin autorización | 403 |
| Recurso inexistente dentro del alcance autorizado | 404 |
| Conflicto de versión, unicidad o idempotencia | 409 |
| Regla de negocio incumplida | 422 |
| Límite de solicitudes excedido | 429 |
| Fallo interno no exponible | 500 |

Un recurso de otra Empresa no se revela mediante diferencias evitables entre 403 y 404.

## 5. Eventos y transacciones

- Los eventos de Dominio describen hechos ocurridos y se crean dentro de la transacción del agregado.
- Los eventos que deban cruzar el límite del módulo o del proceso se publican mediante outbox transaccional.
- La entrega es al menos una vez; cada consumidor debe ser idempotente.
- El envoltorio de integración contiene `id`, `tipo`, `version`, `ocurridoEn`, `productor`, `solicitudId`, `empresaId` cuando corresponda y `datos`.
- Un evento no transporta contraseñas, tokens, secretos ni datos personales innecesarios.
- Las versiones de eventos no se modifican retroactivamente.

## 6. Persistencia y archivos

### 6.1 Base de datos

- Las migraciones son la única fuente del esquema físico.
- TypeORM se configura con `synchronize: false` en todos los entornos.
- La evolución destructiva sigue: agregar estructura nueva, migrar datos, cambiar consumidores y retirar lo anterior.
- Los datos históricos se inactivan, anulan o compensan. Cuando aplique borrado lógico (soft delete) en persistencia, se utiliza `@DeleteDateColumn` nativo de TypeORM (`deletedAt` / `deleted_at`). La eliminación física se limita a datos temporales sin referencias ni valor de auditoría.
- Toda tabla multiempresa tiene una forma obligatoria y verificable de restringir por `empresa_id`.
- Las fechas técnicas se guardan en UTC.
- Las restricciones e índices se nombran según `nomenclatura.md`.

Auditoría técnica y ciclo de vida (TypeORM):

Para aprovechar los decoradores y funciones nativas de TypeORM (`@CreateDateColumn`, `@UpdateDateColumn`, `@DeleteDateColumn`, `@VersionColumn`), se conservan las propiedades estándar de la librería:

- `createdAt` (columna `created_at` o `createdAt`)
- `updatedAt` (columna `updated_at` o `updatedAt`)
- `deletedAt` (columna `deleted_at` o `deletedAt`, para entidades con borrado lógico/soft delete)
- `creado_por` / `creadoPor`
- `actualizado_por` / `actualizadoPor`
- `version`

La auditoría transversal vincula además Empresa, Cuenta de Empresa, Sesión y solicitud sin copiar secretos.

### 6.2 Archivos privados en el servidor

- Inicialmente los binarios se almacenan en un directorio privado del servidor, fuera del código y de cualquier raíz pública HTTP.
- La ruta base proviene de configuración; el cliente nunca proporciona una ruta de filesystem.
- La base de datos conserva metadatos y una clave relativa opaca, no una ruta absoluta.
- El nombre físico es generado por el servidor y no reutiliza directamente el nombre enviado por el cliente.
- La escritura usa archivo temporal y reemplazo atómico para evitar binarios parciales.
- Se calcula y conserva un hash de integridad.
- El acceso y la descarga pasan por autorización; no se exponen enlaces permanentes públicos.
- Tamaño máximo inicial: 20 MB por archivo.
- Tipos iniciales: JPEG, PNG, WebP y PDF, verificados por contenido además de extensión.
- Los binarios y sus metadatos se incluyen en la política de backup.
- El acceso al almacenamiento se implementa detrás de un puerto para poder migrar a almacenamiento compatible con S3 sin cambiar los casos de uso.

Decisión relacionada: `ADR-0007`.

## 7. Seguridad, privacidad y observabilidad

### 7.1 Autenticación

- Las contraseñas se derivan con Argon2id y parámetros versionados.
- Los JWT se firman de forma asimétrica; la clave privada no se incluye en el repositorio.
- El token de acceso dura 15 minutos.
- El token de renovación dura como máximo 30 días, se rota en cada uso y detecta reutilización.
- La Sesión persistente permite revocación inmediata según `ADR-0004`.
- Tokens y contraseñas nunca se guardan en claro ni se escriben en logs.

Decisión relacionada: `ADR-0006`.

### 7.2 Operaciones móviles anteriores a una revocación

- Una operación móvil pendiente puede aceptarse después de una revocación solamente si fue creada antes de ella y la Sesión, Cuenta de Empresa, Empresa y Dispositivo estaban activos en ese momento.
- La operación conserva identificador, instante declarado, dispositivo, sesión original y trazabilidad de sincronización.
- La aceptación queda auditada como sincronización posterior a una revocación.
- El instante enviado por el dispositivo no es por sí solo prueba suficiente; el módulo `SIN` debe especificar el mecanismo de validación antes de implementar esta política.
- Las operaciones creadas después de la revocación se rechazan.

### 7.3 Clasificación y secretos

| Clasificación | Ejemplos | Controles mínimos |
|---|---|---|
| Público | documentación pública de la API | Integridad y revisión antes de publicar. |
| Interno | configuración no secreta, métricas operativas | Acceso del equipo autorizado. |
| Personal | identidad, contacto, asistencia, ubicación asociada a personas | Acceso por Empresa y propósito; minimización y auditoría. |
| Sensible | credenciales, tokens, claves, datos financieros detallados | Cifrado en tránsito, acceso mínimo, enmascarado y almacenamiento especializado. |

- En desarrollo local se permiten variables de entorno y archivos `.env` no versionados.
- Producción obtiene secretos de un mecanismo externo al repositorio y a la imagen desplegable.
- Toda comunicación externa usa TLS.

### 7.4 Logs y observabilidad

- Los logs son JSON estructurado mediante Pino y están escritos en español.
- Cada petición incluye `solicitudId`; cuando existe contexto autenticado puede correlacionarse con Empresa, Cuenta de Empresa, Usuario cuando corresponda y Sesión mediante identificadores.
- No se registran cuerpos completos de manera general.
- Se enmascaran contraseñas, tokens, secretos y datos personales innecesarios.
- OpenTelemetry es el estándar para métricas y trazas cuando se habiliten; su exportación puede incorporarse gradualmente.

## 8. Requisitos no funcionales globales

Estas cifras son una referencia inicial de diseño y prueba, no límites comerciales codificados.

### NFR-GLOBAL-001 — Capacidad

- **Requisito inicial:** un servidor soporta 10 Empresas cliente, 200 Empleados y 100 Cuentas de Empresa activas.
- **Verificación proporcionada al riesgo:** prueba de carga antes de la primera salida estable y cuando cambie infraestructura crítica.

### NFR-GLOBAL-002 — Concurrencia

- **Requisito inicial:** soportar 30 sesiones activas simultáneas y 20 solicitudes por segundo sostenidas sin errores atribuibles a capacidad.
- **Verificación proporcionada al riesgo:** escenario de carga representativo, no ejecutado en cada cambio menor.

### NFR-GLOBAL-003 — Rendimiento

- **Requisito inicial:** el percentil 95 de operaciones comunes es menor a 500 ms, excluyendo archivos, reportes pesados e integraciones externas.
- **Verificación proporcionada al riesgo:** medición en un entorno semejante al productivo para entregas relevantes.

### NFR-GLOBAL-004 — Operación offline

- **Requisito inicial:** los flujos móviles declarados offline admiten hasta 7 días sin conexión.
- **Verificación proporcionada al riesgo:** pruebas de aceptación y sincronización del módulo `SIN`.

### NFR-GLOBAL-005 — Disponibilidad

- **Requisito inicial:** objetivo mensual inicial de 99,5 %, excluyendo mantenimiento anunciado.
- **Verificación proporcionada al riesgo:** monitoreo mensual.

### NFR-GLOBAL-006 — Recuperación

- **Requisito inicial:** RPO máximo de 24 horas y RTO objetivo de 4 horas.
- **Verificación proporcionada al riesgo:** restauración de backup ensayada periódicamente.

### NFR-GLOBAL-007 — Retención

- **Requisito inicial:** historial y auditoría funcional se conservan 10 años; logs técnicos, 90 días, salvo obligación distinta.
- **Verificación proporcionada al riesgo:** política de retención y comprobación programada.

### NFR-GLOBAL-008 — Aislamiento

- **Requisito inicial:** ninguna operación de una Empresa puede leer o modificar datos privados de otra.
- **Verificación proporcionada al riesgo:** pruebas negativas de integración por repositorio y caso de uso.

La validación debe ser proporcional al tamaño inicial: las pruebas unitarias, de arquitectura y de contrato son frecuentes; las cargas completas se reservan para cambios o entregas que puedan afectar capacidad.

## 9. Calidad y pruebas

### 9.1 Herramientas

- ESLint: calidad estática.
- Prettier: formato.
- TypeScript: comprobación estricta de tipos.
- Jest: pruebas unitarias, de Aplicación y de integración.
- Supertest: pruebas HTTP.
- Testcontainers: PostgreSQL/PostGIS real en integración cuando el entorno lo permita.
- Dependency Cruiser: límites de capas, dependencias entre módulos y ciclos.
- Spectral: contratos OpenAPI.

Cobertura mínima:

- Global: 80 % en líneas, funciones y sentencias; 75 % en ramas.
- Dominio y Aplicación: 90 % en líneas, funciones y sentencias; 85 % en ramas.
- La cobertura no reemplaza los escenarios de reglas y casos de uso.

Decisión relacionada: `ADR-0005`.

### 9.2 Comandos de calidad

El `package.json` del proyecto debe exponer exactamente estos comandos al inicializar el código:

| Control | Comando | Cuándo |
|---|---|---|
| Instalación reproducible | `yarn install --frozen-lockfile` (o `yarn install`) | CI y preparación de entorno. |
| Formato | `yarn format:check` | Siempre. |
| Lint | `yarn lint` | Siempre. |
| Tipos | `yarn typecheck` | Siempre. |
| Build | `yarn build` | Siempre. |
| Pruebas unitarias | `yarn test` | Siempre. |
| Pruebas de un módulo | `yarn test:modulo -- <modulo>` | Siempre para el módulo modificado. |
| Cobertura | `yarn test:coverage` | Antes de aprobar una entrega. |
| Arquitectura | `yarn test:arquitectura` | Siempre. |
| Integración | `yarn test:integracion` | Cuando cambia persistencia o una integración. |
| Contratos | `yarn test:contratos` | Cuando cambia la API. |
| HTTP extremo a extremo | `yarn test:e2e` | Cuando cambia Presentación o composición. |
| Documentación | `python tools/spec_lint.py doc` | Opcional (herramienta de asistencia si Python está disponible en el entorno). |

Estos comandos todavía no son ejecutables porque el proyecto NestJS no fue inicializado. No se consideran verificados hasta que una tarea de infraestructura cree su configuración y registre evidencia.

## 10. Reglas operativas de calidad

- Una entrega no se aprueba con comandos obligatorios fallando.
- Una prueba intermitente se corrige o se retira justificadamente; no se reintenta hasta que pase sin investigar.
- Cada corrección de defecto incorpora una prueba que falle antes de corregirlo cuando sea técnicamente viable.
- Las pruebas de integración usan una base aislada y migraciones reales.
- No se usan credenciales ni datos personales reales en pruebas.
- La primera inicialización del proyecto debe demostrar que Dependency Cruiser detecta una violación intencional de capas y luego retirar dicha violación.
