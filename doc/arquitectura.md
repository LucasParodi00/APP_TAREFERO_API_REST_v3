---
type: architecture
status: Aprobado
owner: "Ingeniero"
---

# Arquitectura

<!-- Qué define este archivo: doc/proceso/reglas-documentacion.md §3.
Las decisiones no obvias se justifican en doc/adr/. Los nombres siguen nomenclatura.md. -->

## 1. Sistema y alcance técnico

Tarefero API REST es el backend de un SaaS B2B multiempresa y multicultivo que centraliza y valida la operación agrícola, personal, inventario, producción y gestión económica, con trazabilidad y soporte para clientes web y Android offline. Los conceptos canónicos que separan la relación comercial de la relación de acceso son `Suscripción de Empresa` y `Cuenta de Empresa`, definidos en `glosario.md`.

Este repositorio contiene la API y sus procesos de apoyo. La aplicación web y la aplicación Android son clientes externos: sus necesidades condicionan contratos y casos de uso, pero su código no vive en este repositorio.

## 2. Stack

| Componente | Elección | Estado | ADR |
|---|---|---|---|
| Lenguaje | TypeScript estricto; versión exacta compatible fijada al inicializar | Aceptado | `ADR-0001`, `ADR-0005` |
| Runtime | Node.js LTS mantenido; versión exacta fijada al inicializar | Aceptado | `ADR-0001`, `ADR-0005` |
| Gestor de paquetes | Yarn 1 o superior (compatible con Yarn 1.22.x y lockfile versionado) | Aceptado | `ADR-0005` |
| Framework API | NestJS; versión exacta compatible fijada al inicializar | Aceptado | `ADR-0001` |
| Estilo | Monolito modular con arquitectura hexagonal | Aceptado | `ADR-0002` |
| Persistencia | PostgreSQL con PostGIS; versiones pendientes de verificar | Aceptado | `ADR-0003` |
| ORM | TypeORM | Aceptado | `ADR-0003` |
| Controlador PostgreSQL | `pg` | Aceptado | `ADR-0003` |
| Contratos HTTP | OpenAPI 3.1 contract-first por módulo, visualizado con Swagger UI y validado con Spectral | Aceptado | `ADR-0005` |
| Autenticación | JWT asimétrico con Sesión persistente, renovación rotativa y autorización actual por Cuenta de Empresa | Aceptado | `ADR-0008`, `ADR-0006` |
| Pruebas | Jest, Supertest y Testcontainers | Aceptado | `ADR-0005` |
| Pruebas de arquitectura | Dependency Cruiser | Aceptado; configuración pendiente de la inicialización | `ADR-0005` |
| Archivos | Directorio privado persistente del servidor detrás de un puerto | Aceptado | `ADR-0007` |
| Despliegue | Docker en infraestructura propia; topología pendiente | Dirección confirmada en la visión | ADR pendiente |

No se fijan versiones por memoria. Antes de crear el proyecto se verifican versiones compatibles y mantenidas de Node.js, NestJS, TypeORM, `pg`, PostgreSQL y PostGIS.

## 3. Estilo y límites

- **Despliegue inicial:** un monolito modular.
- **Interno de cada módulo:** cuatro capas: Dominio, Aplicación, Infraestructura y Presentación.
- **Regla central:** las dependencias de código apuntan hacia Dominio; Dominio no conoce NestJS, TypeORM, HTTP, PostgreSQL ni otros módulos.
- **Módulo funcional:** límite de responsabilidad y propiedad de datos. No equivale a una tabla, entidad, agregado ni módulo NestJS.
- **Agregados:** un módulo puede contener varias raíces de agregado relacionadas.
- **Módulos NestJS internos:** pueden organizar el cableado, pero no crean por sí mismos un nuevo módulo funcional.
- **Punto de composición:** el archivo `*.module.ts` conecta casos de uso, implementaciones y controladores; no contiene negocio.

NestJS se limita a Presentación, adaptadores de Infraestructura y punto de composición. Dominio y Aplicación se implementan en TypeScript puro, sin `@Injectable()`, `@Inject()` ni otros decoradores del framework.

## 4. Módulos funcionales candidatos

<!-- Registro aprobado por el Ingeniero. Los módulos con estado Futuro se contemplan arquitectónicamente, pero no se especifican hasta que el Ingeniero los active. -->

| Prefijo | Módulo | Carpeta | Responsabilidad | Datos propios principales | Estado |
|---|---|---|---|---|---|
| `EMP` | Empresas | `doc/modulos/empresas/` · `src/modulos/empresas/` | Datos, estado, ubicación y configuraciones generales de cada Empresa cliente | Empresa, Ubicación de empresa, Configuración de empresa | Aprobado |
| `ACC` | Identidad y acceso | `doc/modulos/identidad-acceso/` · `src/modulos/identidad-acceso/` | Identidad, autenticación, Cuentas de Empresa, autorización, sesiones y dispositivos | Usuario, Cuenta de Empresa, Rol, Permiso, Sesión, Dispositivo | Aprobado |
| `TER` | Territorio | `doc/modulos/territorio/` · `src/modulos/territorio/` | Chacras, lotes, geometrías y superficies | Chacra, Lote, Versión de geometría | Aprobado |
| `CUL` | Contexto productivo | `doc/modulos/contexto-productivo/` · `src/modulos/contexto-productivo/` | Cultivos, variedades, implantaciones, perfiles, campañas y ciclos | Cultivo, Implantación, Campaña, Ciclo productivo | Aprobado |
| `PER` | Personal | `doc/modulos/personal/` · `src/modulos/personal/` | Empleados, cuadrillas, asistencia y tarifas | Empleado, Cuadrilla, Asistencia, Tarifa | Aprobado |
| `LAB` | Labores | `doc/modulos/labores/` · `src/modulos/labores/` | Planificación y ejecución de trabajos y recursos declarados | Tipo de labor, Orden, Registro de labor | Aprobado |
| `INV` | Inventario | `doc/modulos/inventario/` · `src/modulos/inventario/` | Artículos, unidades, partidas, almacenes y movimientos | Artículo, Almacén, Movimiento, Transferencia | Aprobado |
| `TCE` | Terceros | `doc/modulos/terceros/` · `src/modulos/terceros/` | Identidad de proveedores, compradores y destinos | Tercero, Proveedor, Cliente, Destino | Aprobado |
| `COM` | Compras | `doc/modulos/compras/` · `src/modulos/compras/` | Compras, recepciones y devoluciones | Compra, Recepción, Devolución | Aprobado |
| `OBS` | Observaciones | `doc/modulos/observaciones/` · `src/modulos/observaciones/` | Seguimiento general, fenológico y sanitario | Observación y sus detalles | Aprobado |
| `COS` | Cosechas | `doc/modulos/cosechas/` · `src/modulos/cosechas/` | Cosechas, pesajes, partidas productivas y entregas | Cosecha, Pesaje, Entrega | Aprobado |
| `ECO` | Economía | `doc/modulos/economia/` · `src/modulos/economia/` | Obligaciones, movimientos de dinero, gastos, ingresos y costos | Obligación, Pago/cobro, Gasto, Ingreso | Aprobado |
| `ARC` | Archivos | `doc/modulos/archivos/` · `src/modulos/archivos/` | Binarios privados, metadatos y relaciones de adjuntos | Archivo | Aprobado |
| `SIN` | Sincronización | `doc/modulos/sincronizacion/` · `src/modulos/sincronizacion/` | Idempotencia, comandos móviles y descarga incremental | Operación de sincronización, cursor | Aprobado |
| `REP` | Reportes | `doc/modulos/reportes/` · `src/modulos/reportes/` | Consultas, proyecciones e indicadores | Proyecciones reconstruibles | Aprobado |
| `SUS` | Suscripciones | `doc/modulos/suscripciones/` · `src/modulos/suscripciones/` | Planes comerciales, Suscripciones de Empresa, límites y vigencias | Plan de suscripción, Suscripción de Empresa, Límite comercial | Futuro |
| `MAQ` | Maquinaria | `doc/modulos/maquinaria/` · `src/modulos/maquinaria/` | Equipos, lecturas y mantenimiento | Maquinaria, Lectura, Mantenimiento | Futuro |

La auditoría técnica es transversal y el historial funcional pertenece al módulo que produce el hecho. No se crea un módulo genérico que replique el negocio bajo el nombre de trazabilidad.

## 5. Comunicación entre módulos

- Cada dato tiene un solo módulo dueño, único autorizado a escribirlo.
- Un módulo consume otro mediante casos de uso o puertos públicos de Aplicación.
- Prohibido importar Dominio, repositorios concretos, entidades TypeORM o Infraestructura de otro módulo.
- Prohibido leer o escribir directamente tablas de otro módulo.
- No se crean claves foráneas físicas entre módulos sin una decisión explícita; la identidad externa se conserva y valida mediante el contrato del módulo dueño.
- Las dependencias funcionales no forman ciclos.
- Un proceso que coordina módulos no reimplementa sus reglas: invoca sus contratos públicos.
- La extracción futura a otro despliegue no es un objetivo inmediato, pero los contratos deben evitar acoplamiento accidental.

## 6. Estructura de un módulo

Ejemplo para `EMP`; los nombres concretos se ajustan a `nomenclatura.md`:

```text
src/modulos/empresas/
├── dominio/
│   ├── agregados/
│   │   └── empresa/
│   ├── objetos-valor/
│   ├── enumeraciones/
│   ├── politicas/
│   ├── eventos/
│   └── errores/
├── aplicacion/
│   ├── comandos/
│   ├── consultas/
│   ├── puertos/
│   │   ├── entrada/
│   │   └── salida/
│   ├── modelos-lectura/
│   └── errores/
├── infraestructura/
│   ├── persistencia/
│   │   └── typeorm/
│   │       ├── entidades/
│   │       ├── mapeadores/
│   │       └── repositorios/
│   ├── autenticacion/
│   ├── transacciones/
│   ├── mensajeria/
│   └── configuracion/
├── presentacion/
│   └── http/
│       ├── controladores/
│       ├── solicitudes/
│       ├── respuestas/
│       ├── mapeadores/
│       ├── guardias/
│       └── filtros/
├── pruebas/
│   ├── dominio/
│   ├── aplicacion/
│   ├── integracion/
│   ├── contrato/
│   └── aceptacion/
└── empresas.module.ts

migraciones/empresas/
```

`pruebas` y el punto de composición no son capas adicionales. El primero verifica el módulo y el segundo conecta sus adaptadores.

## 7. Capas y dependencias permitidas

| Capa | Contiene | Puede usar | No puede usar |
|---|---|---|---|
| Dominio | Agregados, entidades, objetos de valor, invariantes, políticas, eventos y errores de negocio | Solo Dominio y librería estándar | Aplicación, Infraestructura, Presentación, NestJS, TypeORM, HTTP, base de datos y otros módulos |
| Aplicación | Casos de uso, comandos, consultas, autorización contextual, transacciones y puertos | Dominio | Implementaciones de Infraestructura, Presentación, NestJS, TypeORM y HTTP |
| Infraestructura | Implementaciones de puertos, TypeORM, PostgreSQL, JWT, archivos, mensajería e integraciones | Aplicación y Dominio | Presentación y reglas de negocio nuevas |
| Presentación | Controllers, DTO, guards, pipes, filtros y traducción HTTP | Puertos/casos de uso de Aplicación y modelos de respuesta | Persistencia concreta, TypeORM y acceso directo al Dominio para ejecutar negocio |

La dirección general es:

```text
HTTP → Presentación → Aplicación → Dominio
                        ↑
Infraestructura ── implementa puertos de Aplicación
```

## 8. Dominio

- TypeScript puro.
- Una entidad protege su estado; no es una representación automática de una fila.
- Los objetos de valor validan conceptos como Correo electrónico, CUIT, Dinero o Identificador.
- Los errores de Dominio tienen código estable, datos seguros y mensaje predeterminado en español; no conocen códigos HTTP.
- Una política contiene una decisión de negocio que no pertenece naturalmente a una sola entidad.
- Una interfaz vive en Dominio únicamente cuando expresa una capacidad propia del modelo. Las necesidades de orquestación o tecnología se definen como puertos de Aplicación.
- Un módulo puede tener varias raíces de agregado; no se crea un módulo por entidad.

## 9. Aplicación: comandos, consultas y puertos

- Un caso de uso es el orquestador de una intención del actor.
- Un comando modifica estado y normalmente carga agregados mediante repositorios.
- Una consulta no modifica estado y puede usar una proyección optimizada sin reconstruir agregados completos.
- La separación comando/consulta no obliga a incorporar `@nestjs/cqrs`; la biblioteca se agrega solo si aporta una necesidad concreta.
- Los puertos de salida se nombran por capacidad: `RepositorioUsuarios`, `GeneradorTokens`, `UnidadTrabajo`, `Reloj` o `VerificadorPlanSuscripcion`.
- El caso de uso conoce el contrato, nunca la implementación TypeORM ni el mapper.
- El caso de uso establece el límite transaccional cuando una operación produce varios efectos atómicos.
- La autorización que depende del recurso o de datos del negocio se realiza en Aplicación o mediante una política de Dominio, no exclusivamente en un guard HTTP.

## 10. Infraestructura: persistencia y mapeo

- Las entidades TypeORM representan el esquema físico y viven únicamente en Infraestructura.
- Los repositorios TypeORM implementan puertos definidos por Aplicación.
- El mapper convierte entidad TypeORM a agregado de Dominio y viceversa dentro del repositorio; el caso de uso no llama al mapper.
- Las migraciones son la única fuente del esquema físico.
- Las consultas de lectura pueden implementar puertos de proyección directamente con SQL o TypeORM, sin exponer entidades persistentes.
- Las restricciones de base de datos son una defensa adicional, no la única ubicación de reglas del negocio.
- No se utiliza carga diferida que produzca consultas invisibles fuera del límite del repositorio.

Flujo de escritura:

```text
Base de datos
  → Entidad TypeORM
  → Mapeador a Dominio
  → Caso de uso y agregado
  → Mapeador a persistencia
  → Entidad TypeORM
  → Base de datos
```

## 11. Presentación y ciclo HTTP

Orden general de una petición NestJS:

```text
Petición
  → Middleware
  → Guards
  → Interceptors de entrada
  → Pipes y validación de DTO
  → Controller
  → Caso de uso
  → Interceptors de salida
  → Respuesta
```

- Middleware: correlación, contexto técnico, logging y medición; sin negocio.
- Guards: autenticación y permiso general de ruta.
- `ValidationPipe` con `class-validator`: forma, tipos, formatos, límites y campos admitidos.
- Controller: traduce la solicitud a un comando/consulta y delega.
- Filtro de errores: traduce errores de Dominio y Aplicación a la respuesta HTTP definida por contrato.
- Interceptors: comportamiento transversal de transporte; no reglas de negocio.
- DTO y entidades TypeORM nunca se entregan como entidades de Dominio.

La validación del DTO no reemplaza las invariantes: Dominio vuelve a proteger todo dato que determine un estado válido.

## 12. Errores por capa

| Origen | Ejemplo | Traducción |
|---|---|---|
| Presentación | UUID o cuerpo con formato inválido | Respuesta HTTP de formato inválido |
| Aplicación | Empresa no encontrada, acceso denegado | Código estable de aplicación y HTTP correspondiente |
| Dominio | Límite de accesos alcanzado, transición inválida | Código estable de negocio; Presentación decide HTTP |
| Infraestructura | Conexión o restricción técnica inesperada | Error técnico controlado, sin filtrar SQL ni detalles internos |

No se usan `HttpException` de NestJS dentro de Dominio o Aplicación.

## 13. Modelo SaaS, autenticación, Sesión y contexto de Empresa

Decisión: `ADR-0008`, que reemplaza `ADR-0004`. La protección de credenciales y tokens sigue `ADR-0006`.

### 13.1 Alta y administración del cliente SaaS

1. El dueño de una Empresa contrata Tarefero para esa Empresa; una persona no contrata ni traslada una suscripción individual.
2. Un SuperAdministrador crea la Empresa cliente, registra la asignación comercial prevista para su Suscripción de Empresa y crea la Cuenta de Empresa del Administrador inicial.
3. Desde entonces, el Administrador gestiona los Empleados y las Cuentas de Empresa internas de su propia Empresa dentro de los límites contratados, sin intervención ordinaria del SuperAdministrador.
4. Un Empleado no necesita una Cuenta de Empresa. Los cupos de acceso no limitan la cantidad de Empleados salvo que el Plan de suscripción defina expresamente otro límite de recurso.
5. `SUS` es dueño del Plan de suscripción, la Suscripción de Empresa, sus vigencias y límites. Mientras `SUS` siga futuro, el contrato provisional de asignación comercial debe especificarse antes de implementar el alta de Empresas.

### 13.2 Inicio o renovación de sesión

1. Presentación valida el formato de credenciales.
2. Aplicación resuelve la Cuenta de Empresa según el contrato de inicio de sesión que apruebe `ACC`; la Empresa nunca se deduce de un dato ambiguo.
3. Se valida la Cuenta de Empresa y, cuando corresponda al modelo de identidad aprobado, el Usuario relacionado.
4. Se comprueba que la Empresa esté habilitada y que su Suscripción de Empresa permita el acceso.
5. Se obtienen roles, permisos y alcance vigentes de la Cuenta de Empresa.
6. Se crea o renueva una Sesión persistente.
7. Se emite un JWT que identifica, como mínimo, Cuenta de Empresa, Empresa y Sesión; no se confían permisos permanentes incluidos en el token.
8. Se registra el resultado de autenticación para auditoría sin guardar credenciales ni tokens en claro.

Los algoritmos, duraciones, renovación y almacenamiento seguro siguen `ADR-0006` y `convenciones.md` §7.

Una operación móvil creada antes de revocar la Sesión, Cuenta de Empresa, Empresa o Dispositivo puede aceptarse al sincronizar si cumple `convenciones.md` §7.2. El módulo `SIN` debe especificar el mecanismo verificable que distingue una operación anterior de otra creada después de la revocación.

### 13.3 Cada petición autenticada

1. El middleware asigna un identificador de solicitud/correlación.
2. El guard valida firma, formato y vencimiento del JWT.
3. Se consulta la persistencia para comprobar que Sesión, Cuenta de Empresa y Empresa continúan activas, además del Usuario si el modelo aprobado lo requiere como identidad separada.
4. Se cargan roles, permisos y alcances actuales.
5. Se construye un `ContextoSolicitud` con `solicitudId`, `cuentaEmpresaId`, `empresaId`, `sesionId`, roles, permisos y alcance; incluye `usuarioId` solo si existe una identidad separada aprobada.
6. El guard comprueba el permiso general de la operación.
7. Los pipes validan el DTO.
8. El Controller ejecuta el caso de uso pasando el contexto, no el objeto HTTP.
9. El caso de uso verifica las condiciones de autorización que dependan del recurso.
10. El resultado y los fallos relevantes quedan vinculados al contexto para auditoría.

La consulta directa a persistencia es la política inicial. Una caché futura solo puede incorporarse con invalidación inmediata ante cambios de Sesión, Cuenta de Empresa, Usuario cuando corresponda, Empresa, Rol, Permiso, Suscripción de Empresa o alcance.

### 13.4 Aislamiento multiempresa

- `empresaId` se obtiene del `ContextoSolicitud`; nunca se acepta desde el cuerpo, query o parámetro como autoridad para una escritura tenant-scoped.
- Los DTO rechazan campos de empresa que el cliente no deba controlar.
- Todo repositorio tenant-scoped recibe el contexto o un identificador de Empresa ya validado por Aplicación y filtra obligatoriamente por él.
- Toda referencia entre datos tenant-scoped comprueba que pertenezca a la misma Empresa.
- Un ID válido no concede permiso.
- SuperAdministrador, catálogos globales y cualquier identidad transversal que `ACC` apruebe son excepciones explícitas; no desactivan el filtro de Empresa para datos de negocio.
- El SuperAdministrador no obtiene acceso implícito a los datos de una Empresa. Cualquier acceso de soporte futuro requiere caso de uso, autorización y auditoría propios.

### 13.5 Crear o habilitar una Cuenta de Empresa

1. El actor autenticado debe tener permiso para administrar accesos.
2. La Empresa destino se toma del `ContextoSolicitud`; solo el flujo explícito de plataforma del SuperAdministrador selecciona otra Empresa y exige motivo auditable.
3. Se consulta la Suscripción de Empresa antes de activar otra Cuenta de Empresa o consumir cualquier otro recurso limitado.
4. Se crea o vincula la identidad según el modelo que apruebe `ACC`; no se presupone una identidad global ni credenciales compartidas entre Empresas.
5. Se crea o habilita la Cuenta de Empresa y se asignan únicamente roles autorizados para esa Empresa.
6. Cuenta de Empresa, roles e historial se guardan dentro del límite transaccional definido; la identidad se incluye cuando corresponda.
7. La auditoría conserva actor, Cuenta de Empresa del actor, Sesión, solicitud y Empresa.

La misma persona puede operar en más de una Empresa solo mediante una Cuenta de Empresa propia de cada una. Sus roles, permisos, estado y límites no se trasladan. La independencia o reutilización de identidad y credenciales permanece pendiente de `ACC-Q-001`.

## 14. Historial y auditoría

- La Sesión se crea al autenticar o renovar; no se crea una Sesión nueva por petición.
- Cada petición tiene un identificador de solicitud único.
- El historial funcional pertenece al módulo dueño: transiciones, anulaciones, compensaciones y correcciones.
- La auditoría técnica registra actor, Cuenta de Empresa, Empresa, Sesión, solicitud, origen, acción y resultado.
- No es obligatorio copiar `sesionId` en cada entidad de negocio: los hechos conservan actor y el registro de auditoría aporta el contexto técnico.
- Auditoría no reemplaza movimientos, historial de estados ni eventos del negocio.
- No se guardan contraseñas, JWT, secretos ni copias indiscriminadas de datos personales en auditoría.

## 15. Eliminación, corrección y concurrencia

- Datos que explican historia se inactivan, anulan o compensan; no se eliminan físicamente como si nunca hubieran existido.
- Para una operación con reglas: repositorio busca agregado → Dominio aplica transición → repositorio guarda.
- Una eliminación técnica simple puede usar `eliminarPorId` y devolver si existía, únicamente cuando el dato no conserva historia ni dependencias.
- Un `buscarPorId` seguido de escritura debe ejecutarse con estrategia de concurrencia y transacción apropiada.
- Maestros editables usan versión optimista; stock, dinero y límites concurrentes requieren bloqueo o estrategia equivalente.

## 16. De la especificación al código

| Especificación | Ubicación | Verificación |
|---|---|---|
| Regla invariante o transición | Dominio: agregado, objeto de valor o política | Prueba unitaria con ejemplos de la regla |
| Permiso general de ruta | Presentación: guard | Prueba permitida y denegada |
| Autorización dependiente del recurso | Aplicación o política de Dominio | Prueba de caso de uso |
| Caso de uso | Aplicación: comando/consulta y orquestador | Prueba con dobles de puertos |
| Repositorio | Puerto en Aplicación; implementación en Infraestructura | Prueba de integración |
| Entidad TypeORM y mapper | Infraestructura | Integración y round-trip de mapeo |
| Operación OpenAPI | Presentación: Controller y DTO | Prueba de contrato |
| Escenario Gherkin | Pruebas de aceptación | Prueba con los mismos tags |
| Dependencia con otro módulo | Puerto público de Aplicación | Contrato entre módulos |

## 17. Reglas arquitectónicas a automatizar

| Regla | Estado |
|---|---|
| Dominio no depende de NestJS, TypeORM, HTTP ni otras capas | Dependency Cruiser; pendiente de configurar al inicializar |
| Aplicación no depende de Infraestructura ni Presentación | Dependency Cruiser; pendiente de configurar al inicializar |
| Infraestructura no depende de Presentación | Dependency Cruiser; pendiente de configurar al inicializar |
| Presentación no usa repositorios TypeORM | Dependency Cruiser; pendiente de configurar al inicializar |
| Un módulo no importa internos de otro | Dependency Cruiser; pendiente de configurar al inicializar |
| No existen ciclos entre módulos | Dependency Cruiser; pendiente de configurar al inicializar |

La herramienta y los comandos están definidos en `convenciones.md` §9. La fase 0 no puede demostrar todavía una violación intencional porque el proyecto NestJS no fue inicializado y esta fase no permite escribir código o configuración del proyecto.

## 18. Reglas revisadas manualmente

- Los controladores no contienen condicionales de negocio.
- Los casos de uso no importan mappers ni entidades TypeORM.
- Los repositorios concretos no devuelven entidades TypeORM fuera de Infraestructura.
- Los DTO no se reutilizan como entidades de Dominio.
- El contexto de Empresa no proviene de datos controlados por el cliente.
- Una consulta optimizada no modifica estado.
- Un caso de uso modifica una sola raíz de agregado por transacción salvo decisión explícita.

## 19. Decisiones todavía pendientes

- Contrato provisional de asignación comercial hasta implementar `SUS` (`EMP-Q-008`).
- Modelo de identidad y credenciales por Empresa, materialización de la Cuenta de Empresa sin acceso, identificación de Empresa al iniciar sesión, canales habilitados y contraseña temporal (`ACC-Q-001`, `ACC-Q-004`, `ACC-Q-010`, `ACC-Q-012`, `ACC-Q-013`).
- Contrato del módulo futuro de Suscripciones, nombres de sus tres Planes de suscripción y límites concretos de cada uno.
- Versiones exactas compatibles del stack, que se verificarán y fijarán durante la inicialización.
- Configuración ejecutable de calidad, arquitectura y CI, que requiere inicializar el proyecto.
- Mecanismo verificable del módulo `SIN` para aceptar operaciones offline creadas antes de una revocación.
- Topología final de producción y mecanismo externo de secretos.
