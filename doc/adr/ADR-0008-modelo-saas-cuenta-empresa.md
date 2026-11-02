---
type: adr
id: ADR-0008
title: "SaaS por Empresa con Cuenta de Empresa y sesión persistente"
status: Aceptado
scope: ["EMP", "ACC", "SUS", "GLOBAL"]
date: 2026-10-30
supersedes: ADR-0004
---

# ADR-0008 — SaaS por Empresa con Cuenta de Empresa y sesión persistente

## Contexto

`B-14` y `B-16` de `identidad-acceso.brief.md`, junto con `ACC-Q-011` y `ACC-Q-015`, confirman un SaaS B2B: la Empresa contrata el servicio y sus cupos; ninguna persona compra una suscripción ni se incorpora por autoservicio. El SuperAdministrador crea la Empresa y su Administrador inicial; luego ese Administrador gestiona los accesos internos dentro del Plan contratado.

La fundación anterior usaba “Membresía” para la relación Usuario–Empresa y `ADR-0004` construía la Sesión y el contexto sobre esa relación. Ese término confundía la relación comercial de la Empresa con su Plan y la relación operativa de una persona con una Empresa. El Ingeniero pidió actualizar toda la fundación con el modelo SaaS confirmado.

## Alternativas

### A — Suscripción de Empresa y Cuenta de Empresa separadas

- **Cómo funciona:** `SUS` administra el Plan de suscripción y la Suscripción de Empresa; `ACC` administra la Cuenta de Empresa, sus roles, permisos, estado, sesiones y dispositivos. El JWT referencia la Cuenta de Empresa, la Empresa y una Sesión persistente cuyos estados se verifican en cada petición.
- **A favor:** refleja quién contrata, impide trasladar cupos o permisos entre Empresas, evita la ambigüedad de “Membresía” y conserva revocación y aislamiento verificables.
- **En contra:** exige corregir terminología transversal y deja para la especificación de `ACC` la ubicación exacta de identidad y credenciales.

### B — Membresía Usuario–Empresa como concepto central

- **Cómo funciona:** se mantiene una identidad global y una Membresía por Empresa; el mismo vocabulario puede interpretarse también como relación comercial.
- **A favor:** conserva la documentación anterior sin migración terminológica.
- **En contra:** contradice el modelo SaaS confirmado, induce a interpretar que una persona se suscribe o traslada su membresía y decide prematuramente una identidad global.

## Decisión

- **Elegida:** A — Suscripción de Empresa y Cuenta de Empresa separadas.
- **Por qué:** representa sin ambigüedad que el cliente comercial es la Empresa, mientras el acceso, los roles y el estado pertenecen al contexto de esa Empresa. Se mantiene la Sesión persistente y la autorización actual de `ADR-0004`, reemplazando su contexto basado en Membresía.
- **Decidió:** Ingeniero — 2026-10-30

## Consecuencias

- **Qué cambia:** `Membresía` deja de ser término canónico; `SUS` es dueño de Plan de suscripción y Suscripción de Empresa; `ACC` es dueño de Cuenta de Empresa; Sesión, JWT, contexto, auditoría y límites de acceso referencian la Cuenta de Empresa.
- **Riesgos:** que especificaciones anteriores sigan usando “Membresía”; que un adaptador confíe en un `empresaId` controlado por el cliente; que se implemente `ACC` antes de resolver sus preguntas bloqueantes sobre credenciales e inicio de sesión.
- **Revisar si:** cambia el modelo comercial a suscripciones personales o autoservicio, o se aprueba una identidad transversal que requiera otro límite de seguridad.
