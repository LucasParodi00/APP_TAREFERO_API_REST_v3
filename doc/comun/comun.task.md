---
type: tasks
module: "CMN"
---

# Núcleo Común Transversal — Tareas

<!-- Inventario de tareas técnicas de infraestructura y componentes compartidos del backend. -->

## CMN-TASK-001 — Implementar núcleo común transversal hexagonal bajo src/comun

- **Épica:** Transversal / Arquitectura
- **Tipo:** Técnica
- **Estado:** En curso
- **Prioridad:** Alta
- **Alcance:** Creación y verificación de `src/comun/` con capas `dominio`, `aplicacion`, `infraestructura` y `presentacion`: contratos base de errores sin trasladar errores concretos, UUID v7 generado por la aplicación, reloj y tipos canónicos de fecha, representación exacta de Dinero sin conversión cambiaria, paginación estándar, `ContextoSolicitud`, componentes RFC 9457, decoradores HTTP y reglas automáticas de dependencia. No incluye la migración de `ACC` ni `EMP`.
- **Depende de:** Ninguna
- **Plan:** `PLAN-CMN-0001`
- **Bloqueo:** Ninguno

## CMN-TASK-002 — Implementar bootstrap compartido de persistencia y transacciones

- **Épica:** Transversal / Arquitectura
- **Tipo:** Técnica
- **Estado:** En curso
- **Prioridad:** Alta
- **Alcance:** Configurar una conexión global TypeORM/`pg` con `synchronize: false`, registro y ejecución de migraciones, habilitación de la extensión PostGIS en PostgreSQL, unidad transaccional reutilizable y entorno de integración con PostgreSQL/PostGIS real. No contiene entidades, reglas ni repositorios de negocio; cada módulo conserva sus migraciones y adaptadores propios.
- **Depende de:** `CMN-TASK-001`; `ADR-0003`; `ADR-0014`.
- **Plan:** `planes/PLAN-CMN-0002-bootstrap-persistencia-postgis.md`
- **Bloqueo:** Ninguno para planificación. Su implementación debe preceder a los planes consumidores que requieren persistencia ejecutable o transacciones compartidas.

## CMN-TASK-003 — Implementar idempotencia persistente transversal

- **Épica:** Transversal / Arquitectura
- **Tipo:** Técnica
- **Estado:** Lista
- **Prioridad:** Alta
- **Alcance:** Proveer contratos de Aplicación y adaptadores de Infraestructura reutilizables para ejecutar escrituras con `Idempotency-Key`, huella estable de solicitud, exclusión concurrente, repetición del resultado confirmado, conflicto por carga diferente y retención mínima de 180 días. Los módulos consumidores conservan sus reglas, errores funcionales y decisiones sobre qué operaciones admiten la clave.
- **Depende de:** `CMN-TASK-001`, `CMN-TASK-002`; convenciones.md §3.4; `ADR-0013`.
- **Plan:** `planes/PLAN-CMN-0003-idempotencia-persistente.md`
- **Bloqueo:** Ninguno para planificación. Su ejecución requiere el bootstrap y la unidad transaccional de `CMN-TASK-002`.
