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
