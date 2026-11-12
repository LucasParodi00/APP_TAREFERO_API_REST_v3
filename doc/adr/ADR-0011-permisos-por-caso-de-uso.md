---
type: adr
id: ADR-0011
title: 'Permisos representados por identificadores de caso de uso'
status: Aceptado
scope: ['GLOBAL']
date: 2026-11-11
supersedes: null
---

# ADR-0011 — Permisos representados por identificadores de caso de uso

## Contexto

`ContextoSolicitud` requiere permisos vigentes y cada módulo ya define casos de uso estables y una matriz de autorización por rol. No existe un catálogo independiente que sea dueño de códigos de permiso. Identidad y acceso necesita una representación única para emitir y validar autorizaciones sin duplicar la taxonomía funcional.

## Alternativas

### A — Identificador de caso de uso como código de permiso

- **Cómo funciona:** cada permiso adopta el ID estable del caso de uso autorizado, por ejemplo `ACC-UC-001`; ACC deriva el conjunto vigente a partir de rol, canal y demás condiciones aprobadas.
- **A favor:** trazabilidad directa, ausencia de un catálogo duplicado y detección sencilla de permisos huérfanos.
- **En contra:** si en el futuro un caso de uso necesita permisos más finos, deberá incorporarse una decisión compatible o dividirse el caso de uso.

### B — Catálogo independiente de códigos de permiso

- **Cómo funciona:** se crean códigos como `acc.cuentas.crear` y se mantiene un mapeo separado entre roles, permisos y casos de uso.
- **A favor:** permite granularidad técnica independiente de los casos de uso.
- **En contra:** duplica conceptos, exige un nuevo dueño documental y aumenta el riesgo de divergencia con la matriz aprobada.

## Propuesta

- **Recomendada:** A — Identificador de caso de uso como código de permiso.
- **Motivo:** el proyecto ya trata los casos de uso como unidades estables de autorización y aceptación; reutilizar su ID conserva una sola fuente de verdad.
- **Decisión del Ingeniero:** Aceptada la recomendación A (11/11/2026).

## Consecuencias si se acepta

- `ContextoSolicitud.permisos` contendrá IDs de casos de uso vigentes.
- Los roles seguirán siendo el catálogo de asignación humana; no se persistirán permisos redundantes por Cuenta salvo que una especificación futura lo requiera.
- Los guardias verificarán el permiso requerido por la operación y el caso de uso repetirá las condiciones de autorización dependientes de datos.
- Los módulos deberán declarar el ID de caso de uso requerido en su frontera de presentación y conservar su matriz como fuente funcional.
