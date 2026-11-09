---
type: adr
id: ADR-0003
title: "PostgreSQL y PostGIS mediante TypeORM y pg"
status: Aceptado
scope: ["GLOBAL"]
date: 2026-10-30
supersedes: null
---

# ADR-0003 — PostgreSQL y PostGIS mediante TypeORM y pg

## Contexto

Tarefero necesita persistencia relacional, transacciones, aislamiento multiempresa, restricciones de integridad y geometrías oficiales de chacras y lotes.

## Alternativas

### A — PostgreSQL/PostGIS con TypeORM y pg

- **Cómo funciona:** TypeORM implementa los adaptadores de persistencia sobre el controlador `pg`; PostGIS resuelve las necesidades espaciales.
- **A favor:** stack elegido, transacciones relacionales, restricciones, consultas espaciales y mapeo integrado con NestJS.
- **En contra:** se debe evitar que las entidades TypeORM se conviertan en el modelo de Dominio.

### B — PostgreSQL con SQL directo

- **Cómo funciona:** repositorios implementados con consultas SQL sin ORM.
- **A favor:** control total sobre consultas y mapeos.
- **En contra:** mayor trabajo repetitivo y disciplina adicional para mantener mapeos y migraciones.

### C — Otro ORM

- **Cómo funciona:** reemplazar TypeORM por otro mapeador o generador de cliente.
- **A favor:** posibles mejoras específicas de tipado o migraciones.
- **En contra:** no corresponde al stack elegido y requiere reevaluar integración y experiencia disponible.

## Decisión

- **Elegida:** A — PostgreSQL/PostGIS con TypeORM y `pg`.
- **Por qué:** satisface persistencia transaccional y geoespacial con el stack confirmado por el Ingeniero.
- **Decidió:** Ingeniero — 2026-10-30

## Consecuencias

- **Qué cambia:** las entidades TypeORM, mapeadores y repositorios concretos viven exclusivamente en Infraestructura; las migraciones son la fuente del esquema físico. El entorno local de persistencia se ejecuta directamente en el host nativo (sin Docker por decisión explícita del Ingeniero).
- **Riesgos:** carga diferida accidental, consultas entre módulos, filtrado incompleto por empresa y diferencias entre Dominio y persistencia.
- **Revisar si:** TypeORM impide una restricción o consulta crítica; una excepción local puede usar SQL sin cambiar el contrato del repositorio.

