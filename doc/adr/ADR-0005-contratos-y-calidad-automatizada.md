---
type: adr
id: ADR-0005
title: "OpenAPI visible con Swagger UI y calidad automatizada"
status: Aceptado
scope: ["GLOBAL"]
date: 2026-10-30
supersedes: null
---

# ADR-0005 — OpenAPI visible con Swagger UI y calidad automatizada

## Contexto

El desarrollo guiado por especificaciones necesita que el contrato HTTP sea revisable antes del código y que las capas, ciclos, pruebas y contratos puedan verificarse con comandos uniformes.

## Alternativas

### A — OpenAPI contract-first y verificaciones especializadas

- **Cómo funciona:** el OpenAPI aprobado es la fuente del contrato, Swagger UI lo visualiza, Spectral lo valida y herramientas específicas comprueban código, pruebas y arquitectura.
- **A favor:** evita que documentación y código compitan como fuentes; cada control tiene un propósito explícito.
- **En contra:** exige mantener scripts y configuración desde la inicialización del proyecto.

### B — Generar el contrato exclusivamente desde decoradores

- **Cómo funciona:** los controladores generan OpenAPI durante la ejecución.
- **A favor:** reduce archivos contractuales escritos manualmente.
- **En contra:** el código pasa a definir el contrato y ya no puede aprobarse primero como especificación independiente.

### C — Revisión manual sin pruebas arquitectónicas

- **Cómo funciona:** convenciones y dependencias se comprueban durante revisión humana.
- **A favor:** no agrega herramientas.
- **En contra:** las violaciones son acumulativas y difíciles de detectar de forma consistente.

## Decisión

- **Elegida:** A — OpenAPI contract-first y verificaciones especializadas.
- **Por qué:** sostiene el flujo guiado por especificaciones y hace verificables las reglas transversales sin agregar servicios operativos.
- **Decidió:** Ingeniero — 2026-10-30

## Consecuencias

- **Qué cambia:** se usa Yarn, OpenAPI 3.1, Swagger UI, Spectral, ESLint, Prettier, Jest, Supertest, Testcontainers y Dependency Cruiser según `convenciones.md`.
- **Riesgos:** configuraciones desactualizadas o duplicación accidental entre OpenAPI y decoradores.
- **Revisar si:** una herramienta deja de mantenerse o no soporta una versión elegida del stack.
