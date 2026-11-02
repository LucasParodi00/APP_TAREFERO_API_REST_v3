---
type: adr
id: ADR-0007
title: "Almacenamiento inicial de archivos privados en el servidor"
status: Aceptado
scope: ["GLOBAL"]
date: 2026-10-30
supersedes: null
---

# ADR-0007 — Almacenamiento inicial de archivos privados en el servidor

## Contexto

El volumen inicial es pequeño y no justifica incorporar de inmediato un servicio de objetos. Los archivos deben seguir siendo privados, respaldables y reemplazables por otra implementación.

## Alternativas

### A — Directorio privado del servidor detrás de un puerto

- **Cómo funciona:** los binarios se guardan fuera de la raíz pública y la base conserva metadatos y una clave relativa; un puerto abstrae el almacenamiento.
- **A favor:** operación inicial simple y sin un servicio adicional.
- **En contra:** dificulta escalar a varias instancias y exige incluir el directorio en backups y restauraciones.

### B — Almacenamiento compatible con S3 desde el inicio

- **Cómo funciona:** los binarios viven en un servicio de objetos local o remoto.
- **A favor:** desacopla el ciclo de vida de la instancia y facilita escalado.
- **En contra:** agrega operación y costo innecesarios para el volumen inicial confirmado.

## Decisión

- **Elegida:** A — directorio privado del servidor detrás de un puerto.
- **Por qué:** satisface la escala inicial con menor costo operativo y conserva una vía explícita de migración.
- **Decidió:** Ingeniero — 2026-10-30

## Consecuencias

- **Qué cambia:** el servidor necesita volumen persistente, permisos mínimos, backup coordinado y acceso únicamente autorizado.
- **Riesgos:** pérdida de binarios si el backup cubre solo PostgreSQL; imposibilidad de compartir archivos entre instancias sin almacenamiento común.
- **Revisar si:** se despliega más de una instancia, aumenta el volumen o se necesita distribución geográfica.
