---
type: adr
id: ADR-0012
title: "Núcleo común transversal hexagonal bajo src/comun"
status: Aceptado
scope: ["GLOBAL"]
date: 2026-11-11
supersedes: null
---

# ADR-0012 — Núcleo común transversal hexagonal bajo src/comun

## Contexto

El backend de Tarefero es un monolito modular con arquitectura hexagonal de cuatro capas (`ADR-0002`, `ADR-0009`). Diversas necesidades técnicas y de transporte se repiten en todos los módulos funcionales:
- Formato uniforme de paginación en base de datos (`convenciones.md` §3.2) y DTOs de consulta.
- Formato uniforme de errores HTTP según RFC 9457 (`convenciones.md` §4) y mapeo de excepciones.
- Manejo canónico del contexto de la solicitud (`ContextoSolicitud`, `arquitectura.md` §13.3).
- Decoradores de presentación HTTP (`If-Match`, extracción de contexto de solicitud).
- Clases base de errores de Dominio y Aplicación para permitir tipado y captura desacoplada.

Duplicar estas utilidades en cada módulo funcional (`EMP`, `ACC`, `TER`, etc.) produce dispersión, inconsistencias y dificultades de mantenimiento. Sin embargo, introducir una carpeta compartida sin reglas de capas correría el riesgo de convertirse en un "cajón de sastre" que viole la inversión de dependencias y contamine el Dominio con dependencias de NestJS o TypeORM.

## Alternativas

### A — Duplicar utilidades técnicas en cada módulo funcional

- **Cómo funciona:** cada módulo implementa sus propios DTOs de paginación, filtros de excepciones, decoradores y tipos de contexto.
- **A favor:** aislamiento absoluto entre módulos a nivel de código fuente.
- **En contra:** alta redundancia, riesgo constante de divergencia de contratos (RFC 9457, query params de paginación) y costo elevado de mantenimiento.

### B — Biblioteca o paquete npm privado externo

- **Cómo funciona:** extraer componentes comunes a un paquete externo publicado en un registro privado e instalarlo como dependencia.
- **A favor:** desacoplamiento físico total del repositorio.
- **En contra:** complejidad operativa desmedida para la etapa actual del monolito modular; ralentiza el ciclo de desarrollo inicial.

### C — Núcleo común transversal interno organizado por capas hexagonales (`src/comun/`)

- **Cómo funciona:** se crea un directorio `src/comun/` que no representa un módulo funcional ni contiene lógica de negocio, sino infraestructura y contratos técnicos compartidos, respetando las cuatro capas:
  - `src/comun/dominio/`: tipos y clases base puros (sin dependencias externas).
  - `src/comun/aplicacion/`: modelos de lectura, contratos y clases base de aplicación (`ContextoSolicitud`, tipos de paginación).
  - `src/comun/infraestructura/`: adaptadores y utilidades técnicas de infraestructura (ej. helpers de paginación TypeORM).
  - `src/comun/presentacion/`: DTOs base de transporte, decoradores HTTP, filtros globales NestJS (RFC 9457).
- **A favor:** evita duplicación sin violar la arquitectura hexagonal; permite verificar con Dependency Cruiser que ninguna capa de un módulo funcional importe capas prohibidas del núcleo común; mantiene nombres en español (`comun`).
- **En contra:** requiere disciplina estricta para no introducir lógica de negocio en `comun`.

## Decisión

- **Elegida:** C — Núcleo común transversal interno organizado por capas hexagonales (`src/comun/`).
- **Por qué:** provee reutilización y consistencia técnica inmediata para los módulos funcionales, manteniendo la pureza del Dominio y la arquitectura hexagonal sin sobrecarga operativa externa.
- **Decidió:** Arquitecto de software / Ingeniero — 2026-11-11.

## Consecuencias

- **Qué cambia en la especificación o el código:**
  - `arquitectura.md` incorpora la especificación del núcleo `src/comun/` y sus reglas de dependencia.
  - `nomenclatura.md` estandariza el nombre `comun` (en español) y las reglas de nomenclatura de sus componentes.
  - `.dependency-cruiser.js` debe verificar que `src/modulos/<m>/<capa>` solo pueda importar de `src/comun/<capa>` o capas más internas (ej. Dominio funcional solo importa Dominio común).
  - `src/comun` tiene prohibido importar artefactos de `src/modulos`.
- **Riesgos:**
  - Introducir lógica de negocio o agregados en `comun`: se mitiga reservando `comun` exclusivamente a capacidades técnicas y transversales del stack.
- **Revisar si:** el monolito se descompone formalmente en microservicios independientes que requieran extraer `comun` a un paquete versionado.
