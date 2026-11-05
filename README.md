# TAREFERO APP — API REST

**Lucas Parodi**  
*Licenciado en Sistemas de Información · Analista Programador · Desarrollador Full Stack*  
Portfolio: [parodilucas.com](https://parodilucas.com)

---

## 1. Descripción del Proyecto

**Tarefero** es una plataforma backend SaaS B2B multiempresa y multicultivo diseñada para centralizar, gestionar y garantizar la trazabilidad integral de establecimientos agropecuarios (con foco operativo en cultivos como yerba mate, cítricos, nuez pecán, entre otros).

El sistema permite responder con precisión operativa y económica: **qué se hizo, dónde, cuándo, quién lo hizo, con qué recursos o insumos, qué producción se obtuvo y cuál fue su costo real**, soportando tanto la gestión administrativa vía web como la captura de datos en el campo mediante clientes móviles Android con funcionamiento sin conexión (offline-first).

---

## 2. Arquitectura y Patrones de Diseño

El proyecto está diseñado bajo los más altos estándares de ingeniería de software, priorizando el desacoplamiento, la mantenibilidad y la rigurosidad en las reglas de negocio:

* **Monolito Modular con Arquitectura Hexagonal:** Los límites entre módulos funcionales están estrictamente definidos para evitar dependencias cruzadas desordenadas. El sistema aísla por completo la lógica pura del negocio de los frameworks, la base de datos y los protocolos de comunicación mediante el patrón de Puertos y Adaptadores.
* **Aislamiento Multiempresa Estricto (Tenant Isolation):** Cada operación autenticada resuelve su contexto de empresa desde la sesión activa (`empresaId`), asegurando aislamiento total de datos a nivel de persistencia y evitando cualquier acceso cruzado no autorizado.
* **Contract-First con OpenAPI 3.1:** Las especificaciones de API preceden al código y constituyen la fuente de verdad de las integraciones.
* **Soporte Offline-First e Idempotencia:** Identificadores UUID v7 generados por los clientes y mecanismos de idempotencia transaccional para garantizar la integridad en sincronizaciones móviles diferidas.

---

## 3. Stack Tecnológico

* **Runtime:** Node.js (versión LTS)
* **Lenguaje:** TypeScript (modo estricto)
* **Framework:** NestJS
* **Base de Datos:** PostgreSQL con extensión espacial PostGIS
* **Persistencia / ORM:** TypeORM (migraciones explícitas como única fuente de esquema)
* **Gestor de Paquetes:** Yarn 4
* **Pruebas y Calidad:** Jest, Supertest, Testcontainers y Dependency Cruiser

---

## 4. Módulos del Sistema

El sistema se estructura en los siguientes módulos funcionales, cada uno con responsabilidad y propiedad de datos claramente delimitadas:

| Prefijo | Módulo | Responsabilidad y Alcance |
|:---:|---|---|
| `EMP` | **Empresas** | Datos maestros, ubicación, configuración general, políticas y ciclo de vida de cada Empresa cliente del SaaS. |
| `ACC` | **Identidad y Acceso** | Usuarios, Cuentas de Empresa, roles, permisos granulares, sesiones persistentes y control de dispositivos autorizados. |
| `TER` | **Territorio** | Delimitación física y catastral: Chacras, Lotes, superficies y versionado de geometrías espaciales con PostGIS. |
| `CUL` | **Contexto Productivo** | Catálogos globales de Cultivos y Variedades, Implantaciones por lote, Campañas anuales, Ciclos productivos y Perfiles agronómicos versionados. |
| `PER` | **Personal** | Fichas laborales de Empleados, conformación de Cuadrillas, control de Asistencia en campo y esquemas de Tarifas. |
| `LAB` | **Labores** | Planificación, asignación y registro de ejecución de labores culturales y agronómicas, con imputación de recursos y tiempos. |
| `INV` | **Inventario** | Catálogo de Artículos e insumos, depósitos/almacenes, lotes/partidas y control estricto de movimientos y existencias físicas. |
| `TCE` | **Terceros** | Directorio comercial y operativo de Proveedores, Clientes, Contratistas y Destinos de entrega. |
| `COM` | **Compras** | Órdenes de compra, recepciones de mercadería en almacén y devoluciones de insumos. |
| `OBS` | **Observaciones** | Monitoreo y relevamiento fenológico, sanitario y de plagas en campo, con notas geolocalizadas y evidencia fotográfica. |
| `COS` | **Cosechas** | Registro de cosechas, pesajes de campo y balanza, partidas productivas obtenidas y remitos de entrega a acopios/secaderos. |
| `ECO` | **Economía** | Gestión de obligaciones comerciales, cuentas por pagar/cobrar, flujos de dinero e imputación de costos directos e indirectos. |
| `ARC` | **Archivos** | Gestión centralizada de binarios privados, comprobantes y adjuntos multimedia con acceso controlado. |
| `SIN` | **Sincronización** | Procesamiento transaccional de comandos offline generados en la app móvil y descarga incremental de datos autorizados. |
| `REP` | **Reportes** | Consultas consolidadas, proyecciones analíticas y cálculo de indicadores clave agronómicos y financieros. |
| `SUS` | **Suscripciones** *(Futuro)* | Planes comerciales del SaaS, cupos de cuentas activas, límites de recursos y vigencias contractuales. |
| `MAQ` | **Maquinaria** *(Futuro)* | Inventario de equipos, tractores, herramientas, lecturas de horómetros/odómetros y planes de mantenimiento. |
