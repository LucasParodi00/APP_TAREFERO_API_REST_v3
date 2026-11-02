---
type: adr
id: ADR-0002
title: "Monolito modular con arquitectura hexagonal de cuatro capas"
status: Aceptado
scope: ["GLOBAL"]
date: 2026-10-30
supersedes: null
---

# ADR-0002 — Monolito modular con arquitectura hexagonal de cuatro capas

## Contexto

Tarefero abarca varios dominios relacionados y necesita transacciones consistentes, desarrollo incremental y límites que eviten un acoplamiento directo entre HTTP, negocio y persistencia.

## Alternativas

### A — Monolito modular hexagonal

- **Cómo funciona:** una aplicación desplegable contiene módulos funcionales con cuatro capas: Dominio, Aplicación, Infraestructura y Presentación.
- **A favor:** transacciones simples, despliegue inicial sencillo, núcleo independiente y límites verificables.
- **En contra:** exige controles automáticos para impedir dependencias indebidas entre capas y módulos.

### B — Microservicios por módulo

- **Cómo funciona:** cada módulo se despliega y persiste de manera independiente.
- **A favor:** aislamiento operativo y escalado independiente.
- **En contra:** mayor complejidad de despliegue, observabilidad, consistencia distribuida y evolución contractual desde el inicio.

### C — Monolito organizado solo por capas globales

- **Cómo funciona:** una carpeta global por capa contiene elementos de todos los dominios.
- **A favor:** estructura inicial pequeña.
- **En contra:** pierde propiedad modular y facilita dependencias transversales difíciles de controlar.

## Decisión

- **Elegida:** A — monolito modular hexagonal.
- **Por qué:** conserva límites funcionales y permite transacciones locales sin asumir la complejidad de una arquitectura distribuida.
- **Decidió:** Ingeniero — 2026-10-30

## Consecuencias

- **Qué cambia:** cada módulo tiene `dominio`, `aplicacion`, `infraestructura` y `presentacion`; puede contener varios agregados relacionados.
- **Riesgos:** confundir un módulo NestJS, una tabla o una entidad con un módulo funcional; permitir importaciones internas entre módulos.
- **Revisar si:** un módulo necesita despliegue, escalado o ciclo operativo verdaderamente independiente.

